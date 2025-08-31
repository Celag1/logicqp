-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION fn_my_role()
RETURNS rol_type AS $$
BEGIN
  RETURN (
    SELECT rol FROM profiles WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para cambiar el rol de un usuario
CREATE OR REPLACE FUNCTION fn_set_user_role(target_profile UUID, nuevo_rol rol_type)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_role rol_type;
BEGIN
  -- Obtener el rol del usuario que ejecuta la función
  SELECT rol INTO current_user_role FROM profiles WHERE id = auth.uid();
  
  -- Solo super_admin puede asignar/quitar super_admin
  IF nuevo_rol = 'super_admin' AND current_user_role != 'super_admin' THEN
    RAISE EXCEPTION 'Solo super_admin puede asignar/quitar el rol super_admin';
  END IF;
  
  -- Solo super_admin y administrador pueden cambiar roles
  IF current_user_role NOT IN ('super_admin', 'administrador') THEN
    RAISE EXCEPTION 'No tienes permisos para cambiar roles';
  END IF;
  
  -- Administrador no puede asignar/quitar super_admin
  IF current_user_role = 'administrador' AND nuevo_rol = 'super_admin' THEN
    RAISE EXCEPTION 'Administrador no puede asignar/quitar super_admin';
  END IF;
  
  -- Actualizar el rol
  UPDATE profiles SET rol = nuevo_rol WHERE id = target_profile;
  
  -- Registrar en auditoría
  INSERT INTO auditoria (tabla, accion, registro_id, cambios, actor_profile_id)
  VALUES ('profiles', 'rol_cambiado', target_profile, 
          jsonb_build_object('nuevo_rol', nuevo_rol), auth.uid());
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para checkout (FEFO)
CREATE OR REPLACE FUNCTION fn_checkout(profile_id UUID, items JSON, direccion JSON, metodo_pago TEXT)
RETURNS UUID AS $$
DECLARE
  orden_id UUID;
  cliente_id UUID;
  item JSON;
  producto_id UUID;
  cantidad INTEGER;
  precio_unitario DECIMAL(10,2);
  lote_id UUID;
  stock_disponible INTEGER;
BEGIN
  -- Verificar que el usuario esté verificado si es cliente
  IF EXISTS (SELECT 1 FROM profiles WHERE id = profile_id AND rol = 'cliente' AND email_verified = false) THEN
    RAISE EXCEPTION 'Cliente debe verificar email antes de comprar';
  END IF;
  
  -- Obtener o crear cliente
  SELECT id INTO cliente_id FROM clientes WHERE profile_id = profile_id;
  IF cliente_id IS NULL THEN
    INSERT INTO clientes (profile_id, direccion) 
    VALUES (profile_id, direccion->>'direccion')
    RETURNING id INTO cliente_id;
  END IF;
  
  -- Crear orden
  INSERT INTO ordenes (cliente_id, total, metodo_pago, direccion_envio)
  VALUES (cliente_id, 0, metodo_pago, direccion->>'direccion')
  RETURNING id INTO orden_id;
  
  -- Procesar items con FEFO
  FOR item IN SELECT * FROM json_array_elements(items)
  LOOP
    producto_id := (item->>'producto_id')::UUID;
    cantidad := (item->>'cantidad')::INTEGER;
    precio_unitario := (item->>'precio')::DECIMAL(10,2);
    
    -- Buscar lote con FEFO (First Expired, First Out)
    SELECT l.id INTO lote_id
    FROM lotes l
    WHERE l.producto_id = producto_id 
      AND l.cantidad > 0
      AND l.fecha_vencimiento >= CURRENT_DATE
    ORDER BY l.fecha_vencimiento ASC
    LIMIT 1;
    
    IF lote_id IS NULL THEN
      RAISE EXCEPTION 'Producto % sin stock disponible', producto_id;
    END IF;
    
    -- Verificar stock disponible
    SELECT l.cantidad INTO stock_disponible
    FROM lotes l
    WHERE l.id = lote_id;
    
    IF stock_disponible < cantidad THEN
      RAISE EXCEPTION 'Stock insuficiente para producto %', producto_id;
    END IF;
    
    -- Crear item de orden
    INSERT INTO orden_items (orden_id, producto_id, cantidad, precio_unitario)
    VALUES (orden_id, producto_id, cantidad, precio_unitario);
    
    -- Actualizar stock del lote
    UPDATE lotes SET cantidad = cantidad - cantidad WHERE id = lote_id;
    
    -- Registrar movimiento de stock
    INSERT INTO movimientos_stock (tipo, producto_id, lote_id, cantidad, motivo, referencia_id, referencia_tipo)
    VALUES ('salida', producto_id, lote_id, cantidad, 'Venta', orden_id, 'orden');
  END LOOP;
  
  -- Calcular total y actualizar orden
  UPDATE ordenes SET total = (
    SELECT COALESCE(SUM(cantidad * precio_unitario), 0)
    FROM orden_items WHERE orden_id = orden_id
  ) WHERE id = orden_id;
  
  -- Limpiar carrito
  DELETE FROM carrito_items WHERE carrito_id IN (
    SELECT id FROM carritos WHERE profile_id = profile_id
  );
  
  RETURN orden_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para registrar compra
CREATE OR REPLACE FUNCTION fn_registrar_compra(proveedor_id UUID, items JSON)
RETURNS UUID AS $$
DECLARE
  compra_id UUID;
  item JSON;
  producto_id UUID;
  cantidad INTEGER;
  precio_unitario DECIMAL(10,2);
  lote_id UUID;
  total DECIMAL(10,2) := 0;
BEGIN
  -- Crear compra
  INSERT INTO compras (proveedor_id, fecha, total)
  VALUES (proveedor_id, CURRENT_DATE, 0)
  RETURNING id INTO compra_id;
  
  -- Procesar items
  FOR item IN SELECT * FROM json_array_elements(items)
  LOOP
    producto_id := (item->>'producto_id')::UUID;
    cantidad := (item->>'cantidad')::INTEGER;
    precio_unitario := (item->>'precio_unitario')::DECIMAL(10,2);
    
    -- Crear lote
    INSERT INTO lotes (producto_id, numero_lote, fecha_fabricacion, fecha_vencimiento, cantidad, precio_compra, proveedor_id)
    VALUES (producto_id, 
            'LOT-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-' || LPAD(EXTRACT(DOY FROM CURRENT_DATE)::TEXT, 3, '0') || '-' || LPAD(EXTRACT(EPOCH FROM NOW())::TEXT, 10, '0'),
            (item->>'fecha_fabricacion')::DATE,
            (item->>'fecha_vencimiento')::DATE,
            cantidad,
            precio_unitario,
            proveedor_id)
    RETURNING id INTO lote_id;
    
    -- Crear item de compra
    INSERT INTO compra_items (compra_id, producto_id, cantidad, precio_unitario, lote_id)
    VALUES (compra_id, producto_id, cantidad, precio_unitario, lote_id);
    
    -- Registrar movimiento de stock
    INSERT INTO movimientos_stock (tipo, producto_id, lote_id, cantidad, motivo, referencia_id, referencia_tipo)
    VALUES ('entrada', producto_id, lote_id, cantidad, 'Compra', compra_id, 'compra');
    
    total := total + (cantidad * precio_unitario);
  END LOOP;
  
  -- Actualizar total de compra
  UPDATE compras SET total = total WHERE id = compra_id;
  
  RETURN compra_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para alertas de stock bajo
CREATE OR REPLACE FUNCTION fn_low_stock_alerts()
RETURNS TABLE (
  producto_id UUID,
  nombre TEXT,
  stock_actual INTEGER,
  stock_minimo INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.nombre, 
         COALESCE(SUM(l.cantidad), 0) as stock_actual,
         p.stock_minimo
  FROM productos p
  LEFT JOIN lotes l ON p.id = l.producto_id AND l.fecha_vencimiento >= CURRENT_DATE
  GROUP BY p.id, p.nombre, p.stock_minimo
  HAVING COALESCE(SUM(l.cantidad), 0) <= p.stock_minimo;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para métricas del dashboard
CREATE OR REPLACE FUNCTION fn_dashboard_metrics(desde DATE, hasta DATE)
RETURNS JSON AS $$
DECLARE
  resultado JSON;
BEGIN
  SELECT json_build_object(
    'ventas_mensuales', (
      SELECT COALESCE(SUM(total), 0) 
      FROM ordenes 
      WHERE created_at::DATE BETWEEN desde AND hasta
    ),
    'productos_vendidos', (
      SELECT COALESCE(SUM(oi.cantidad), 0)
      FROM ordenes o
      JOIN orden_items oi ON o.id = oi.orden_id
      WHERE o.created_at::DATE BETWEEN desde AND hasta
    ),
    'stock_critico', (
      SELECT COUNT(*) FROM fn_low_stock_alerts()
    ),
    'top_productos', (
      SELECT json_agg(json_build_object(
        'producto_id', p.id,
        'nombre', p.nombre,
        'cantidad_vendida', SUM(oi.cantidad),
        'total_ventas', SUM(oi.cantidad * oi.precio_unitario)
      ))
      FROM productos p
      JOIN orden_items oi ON p.id = oi.producto_id
      JOIN ordenes o ON oi.orden_id = o.id
      WHERE o.created_at::DATE BETWEEN desde AND hasta
      GROUP BY p.id, p.nombre
      ORDER BY SUM(oi.cantidad) DESC
      LIMIT 5
    )
  ) INTO resultado;
  
  RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para logging de eventos
CREATE OR REPLACE FUNCTION fn_log_event(accion TEXT, tabla TEXT, registro_id UUID, cambios JSONB DEFAULT '{}'::JSONB)
RETURNS VOID AS $$
BEGIN
  INSERT INTO auditoria (tabla, accion, registro_id, cambios, actor_profile_id)
  VALUES (tabla, accion, registro_id, cambios, auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil al registrarse
CREATE OR REPLACE FUNCTION tg_profiles_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, nombre, rol, email_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario'),
    'cliente',
    NEW.email_confirmed_at IS NOT NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER profiles_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION tg_profiles_on_signup();

-- Trigger para auditoría automática
CREATE OR REPLACE FUNCTION tg_auditoria_on_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM fn_log_event('INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM fn_log_event('UPDATE', TG_TABLE_NAME, NEW.id, 
                        jsonb_build_object('anterior', to_jsonb(OLD), 'nuevo', to_jsonb(NEW)));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM fn_log_event('DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger de auditoría a tablas críticas
CREATE TRIGGER auditoria_productos
  AFTER INSERT OR UPDATE OR DELETE ON productos
  FOR EACH ROW
  EXECUTE FUNCTION tg_auditoria_on_change();

CREATE TRIGGER auditoria_lotes
  AFTER INSERT OR UPDATE OR DELETE ON lotes
  FOR EACH ROW
  EXECUTE FUNCTION tg_auditoria_on_change();

CREATE TRIGGER auditoria_ordenes
  AFTER INSERT OR UPDATE OR DELETE ON ordenes
  FOR EACH ROW
  EXECUTE FUNCTION tg_auditoria_on_change();

CREATE TRIGGER auditoria_empresa_config
  AFTER INSERT OR UPDATE OR DELETE ON empresa_config
  FOR EACH ROW
  EXECUTE FUNCTION tg_auditoria_on_change();
