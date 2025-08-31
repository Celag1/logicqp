-- =====================================================
-- LOGICQP - FUNCIONES RPC, VISTAS Y TRIGGERS
-- =====================================================

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION fn_my_role()
RETURNS rol_type AS $$
BEGIN
  RETURN (SELECT rol FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para establecer rol de usuario (con restricciones)
CREATE OR REPLACE FUNCTION fn_set_user_role(
  user_id UUID,
  new_role rol_type
)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_role rol_type;
BEGIN
  -- Obtener rol del usuario que ejecuta la función
  SELECT rol INTO current_user_role FROM profiles WHERE id = auth.uid();
  
  -- Solo super_admin puede cambiar roles
  IF current_user_role != 'super_admin' THEN
    RAISE EXCEPTION 'Solo super_admin puede cambiar roles de usuario';
  END IF;
  
  -- Super_admin no puede cambiar su propio rol
  IF user_id = auth.uid() THEN
    RAISE EXCEPTION 'No puedes cambiar tu propio rol';
  END IF;
  
  -- Administrador no puede crear super_admin
  IF current_user_role = 'administrador' AND new_role = 'super_admin' THEN
    RAISE EXCEPTION 'Administrador no puede crear super_admin';
  END IF;
  
  -- Actualizar rol
  UPDATE profiles SET rol = new_role WHERE id = user_id;
  
  -- Log del evento
  INSERT INTO auditoria (tabla, accion, registro_id, datos_anteriores, datos_nuevos, usuario_id)
  VALUES ('profiles', 'UPDATE_ROLE', user_id::TEXT, 
          (SELECT to_jsonb(rol) FROM profiles WHERE id = user_id),
          to_jsonb(new_role), auth.uid());
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para checkout con lógica FEFO
CREATE OR REPLACE FUNCTION fn_checkout(
  p_carrito_id INTEGER,
  p_direccion_envio TEXT,
  p_metodo_pago TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_orden_id INTEGER;
  v_cliente_id UUID;
  v_total DECIMAL(10,2) := 0;
  v_item RECORD;
  v_lote_id INTEGER;
  v_cantidad_disponible INTEGER;
  v_cantidad_solicitada INTEGER;
BEGIN
  -- Verificar que el cliente tenga email verificado
  IF NOT is_cliente_verified() THEN
    RAISE EXCEPTION 'Debes verificar tu email antes de realizar el checkout';
  END IF;
  
  -- Obtener cliente del carrito
  SELECT cliente_id INTO v_cliente_id FROM carritos WHERE id = p_carrito_id;
  
  -- Verificar que el carrito pertenece al usuario actual
  IF v_cliente_id != auth.uid() THEN
    RAISE EXCEPTION 'No puedes acceder a este carrito';
  END IF;
  
  -- Crear orden
  INSERT INTO ordenes (numero_orden, cliente_id, estado, subtotal, total)
  VALUES ('ORD-' || EXTRACT(EPOCH FROM NOW())::TEXT, v_cliente_id, 'pendiente', 0, 0)
  RETURNING id INTO v_orden_id;
  
  -- Procesar items del carrito con lógica FEFO
  FOR v_item IN 
    SELECT ci.*, p.precio, p.stock_minimo
    FROM carrito_items ci
    JOIN productos p ON ci.producto_id = p.id
    WHERE ci.carrito_id = p_carrito_id
  LOOP
    -- Buscar lote disponible con FEFO (First Expired, First Out)
    SELECT l.id, l.cantidad_disponible
    INTO v_lote_id, v_cantidad_disponible
    FROM lotes l
    WHERE l.producto_id = v_item.producto_id
      AND l.cantidad_disponible > 0
      AND l.fecha_vencimiento > CURRENT_DATE
    ORDER BY l.fecha_vencimiento ASC
    LIMIT 1;
    
    IF v_lote_id IS NULL THEN
      RAISE EXCEPTION 'Producto % no tiene stock disponible', v_item.producto_id;
    END IF;
    
    v_cantidad_solicitada := LEAST(v_item.cantidad, v_cantidad_disponible);
    
    -- Crear item de orden
    INSERT INTO orden_items (orden_id, producto_id, lote_id, cantidad, precio_unitario, subtotal)
    VALUES (v_orden_id, v_item.producto_id, v_lote_id, v_cantidad_solicitada, v_item.precio_unitario, 
            v_item.precio_unitario * v_cantidad_solicitada);
    
    -- Actualizar stock del lote
    UPDATE lotes 
    SET cantidad_disponible = cantidad_disponible - v_cantidad_solicitada
    WHERE id = v_lote_id;
    
    -- Registrar movimiento de stock
    INSERT INTO movimientos_stock (producto_id, lote_id, tipo, cantidad, cantidad_anterior, 
                                  cantidad_nueva, motivo, referencia_id, referencia_tipo, created_by)
    VALUES (v_item.producto_id, v_lote_id, 'salida', v_cantidad_solicitada, 
            v_cantidad_disponible, v_cantidad_disponible - v_cantidad_solicitada,
            'Venta', v_orden_id, 'orden', auth.uid());
    
    v_total := v_total + (v_item.precio_unitario * v_cantidad_solicitada);
  END LOOP;
  
  -- Actualizar total de la orden
  UPDATE ordenes SET subtotal = v_total, total = v_total WHERE id = v_orden_id;
  
  -- Crear pago
  INSERT INTO pagos (orden_id, monto, metodo, estado)
  VALUES (v_orden_id, v_total, p_metodo_pago, 'pendiente');
  
  -- Crear envío
  INSERT INTO envios (orden_id, direccion_envio, estado)
  VALUES (v_orden_id, p_direccion_envio, 'pendiente');
  
  -- Limpiar carrito
  DELETE FROM carrito_items WHERE carrito_id = p_carrito_id;
  DELETE FROM carritos WHERE id = p_carrito_id;
  
  -- Log del evento
  INSERT INTO auditoria (tabla, accion, registro_id, datos_nuevos, usuario_id)
  VALUES ('ordenes', 'CREATE', v_orden_id::TEXT, 
          jsonb_build_object('total', v_total, 'cliente_id', v_cliente_id), auth.uid());
  
  RETURN v_orden_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para registrar compra
CREATE OR REPLACE FUNCTION fn_registrar_compra(
  p_proveedor_id INTEGER,
  p_fecha_compra DATE,
  p_items JSONB
)
RETURNS INTEGER AS $$
DECLARE
  v_compra_id INTEGER;
  v_item JSONB;
  v_total DECIMAL(10,2) := 0;
BEGIN
  -- Verificar permisos de admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden registrar compras';
  END IF;
  
  -- Crear compra
  INSERT INTO compras (proveedor_id, fecha_compra, total, created_by)
  VALUES (p_proveedor_id, p_fecha_compra, 0, auth.uid())
  RETURNING id INTO v_compra_id;
  
  -- Procesar items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO compra_items (compra_id, producto_id, cantidad, precio_unitario, subtotal)
    VALUES (
      v_compra_id,
      (v_item->>'producto_id')::INTEGER,
      (v_item->>'cantidad')::INTEGER,
      (v_item->>'precio_unitario')::DECIMAL,
      (v_item->>'cantidad')::INTEGER * (v_item->>'precio_unitario')::DECIMAL
    );
    
    v_total := v_total + ((v_item->>'cantidad')::INTEGER * (v_item->>'precio_unitario')::DECIMAL);
  END LOOP;
  
  -- Actualizar total
  UPDATE compras SET total = v_total WHERE id = v_compra_id;
  
  RETURN v_compra_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para alertas de stock bajo
CREATE OR REPLACE FUNCTION fn_low_stock_alerts()
RETURNS TABLE(
  producto_id INTEGER,
  nombre_producto TEXT,
  stock_actual INTEGER,
  stock_minimo INTEGER,
  categoria TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.nombre,
    COALESCE(SUM(l.cantidad_disponible), 0)::INTEGER as stock_actual,
    p.stock_minimo,
    c.nombre as categoria
  FROM productos p
  LEFT JOIN categorias c ON p.categoria_id = c.id
  LEFT JOIN lotes l ON p.id = l.producto_id
  WHERE p.activo = TRUE
  GROUP BY p.id, p.nombre, p.stock_minimo, c.nombre
  HAVING COALESCE(SUM(l.cantidad_disponible), 0) <= p.stock_minimo;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para métricas del dashboard
CREATE OR REPLACE FUNCTION fn_dashboard_metrics(
  p_fecha_inicio DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_fecha_fin DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'ventas_totales', (
      SELECT COALESCE(SUM(total), 0) 
      FROM ordenes 
      WHERE estado != 'cancelada' 
        AND created_at::DATE BETWEEN p_fecha_inicio AND p_fecha_fin
    ),
    'ordenes_totales', (
      SELECT COUNT(*) 
      FROM ordenes 
      WHERE created_at::DATE BETWEEN p_fecha_inicio AND p_fecha_fin
    ),
    'productos_stock_bajo', (
      SELECT COUNT(*) 
      FROM fn_low_stock_alerts()
    ),
    'clientes_nuevos', (
      SELECT COUNT(*) 
      FROM profiles 
      WHERE rol = 'cliente' 
        AND created_at::DATE BETWEEN p_fecha_inicio AND p_fecha_fin
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para logging de eventos
CREATE OR REPLACE FUNCTION fn_log_event(
  p_tabla TEXT,
  p_accion TEXT,
  p_registro_id TEXT,
  p_datos_anteriores JSONB DEFAULT NULL,
  p_datos_nuevos JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO auditoria (tabla, accion, registro_id, datos_anteriores, datos_nuevos, usuario_id)
  VALUES (p_tabla, p_accion, p_registro_id, p_datos_anteriores, p_datos_nuevos, auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear vistas para reportes
CREATE OR REPLACE VIEW vw_kardex_producto AS
SELECT 
  p.id as producto_id,
  p.nombre as producto,
  c.nombre as categoria,
  l.numero_lote,
  l.fecha_vencimiento,
  l.cantidad_disponible,
  l.precio_compra,
  p.precio as precio_venta,
  (p.precio - l.precio_compra) as margen
FROM productos p
JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN lotes l ON p.id = l.producto_id
WHERE p.activo = TRUE AND l.cantidad_disponible > 0;

CREATE OR REPLACE VIEW vw_ventas_mensuales AS
SELECT 
  DATE_TRUNC('month', o.created_at) as mes,
  COUNT(o.id) as total_ordenes,
  SUM(o.total) as total_ventas,
  AVG(o.total) as promedio_orden
FROM ordenes o
WHERE o.estado != 'cancelada'
GROUP BY DATE_TRUNC('month', o.created_at)
ORDER BY mes DESC;

CREATE OR REPLACE VIEW vw_top_productos AS
SELECT 
  p.id,
  p.nombre,
  c.nombre as categoria,
  COUNT(oi.id) as veces_vendido,
  SUM(oi.cantidad) as cantidad_vendida,
  SUM(oi.subtotal) as total_vendido
FROM productos p
JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN orden_items oi ON p.id = oi.producto_id
LEFT JOIN ordenes o ON oi.orden_id = o.id
WHERE o.estado != 'cancelada' OR o.estado IS NULL
GROUP BY p.id, p.nombre, c.nombre
ORDER BY veces_vendido DESC, total_vendido DESC;

CREATE OR REPLACE VIEW vw_stock_critico AS
SELECT 
  p.id,
  p.nombre,
  c.nombre as categoria,
  COALESCE(SUM(l.cantidad_disponible), 0) as stock_actual,
  p.stock_minimo,
  CASE 
    WHEN COALESCE(SUM(l.cantidad_disponible), 0) = 0 THEN 'Sin stock'
    WHEN COALESCE(SUM(l.cantidad_disponible), 0) <= p.stock_minimo THEN 'Stock crítico'
    ELSE 'Stock normal'
  END as estado_stock
FROM productos p
JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN lotes l ON p.id = l.producto_id
WHERE p.activo = TRUE
GROUP BY p.id, p.nombre, c.nombre, p.stock_minimo
HAVING COALESCE(SUM(l.cantidad_disponible), 0) <= p.stock_minimo;

-- Trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION tg_profiles_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, nombre, apellido, rol)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'apellido', ''),
    'cliente'
  );
  
  -- Crear perfil de cliente
  INSERT INTO clientes (id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para auditoría automática
CREATE OR REPLACE FUNCTION tg_auditoria_on_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO auditoria (tabla, accion, registro_id, datos_nuevos, usuario_id)
    VALUES (TG_TABLE_NAME, 'INSERT', NEW.id::TEXT, to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO auditoria (tabla, accion, registro_id, datos_anteriores, datos_nuevos, usuario_id)
    VALUES (TG_TABLE_NAME, 'UPDATE', NEW.id::TEXT, to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO auditoria (tabla, accion, registro_id, datos_anteriores, usuario_id)
    VALUES (TG_TABLE_NAME, 'DELETE', OLD.id::TEXT, to_jsonb(OLD), auth.uid());
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar triggers
CREATE TRIGGER tg_profiles_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION tg_profiles_on_signup();

CREATE TRIGGER tg_auditoria_profiles
  AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH ROW EXECUTE FUNCTION tg_auditoria_on_change();

CREATE TRIGGER tg_auditoria_productos
  AFTER INSERT OR UPDATE OR DELETE ON productos
  FOR EACH ROW EXECUTE FUNCTION tg_auditoria_on_change();

CREATE TRIGGER tg_auditoria_ordenes
  AFTER INSERT OR UPDATE OR DELETE ON ordenes
  FOR EACH ROW EXECUTE FUNCTION tg_auditoria_on_change();

-- Insertar permisos básicos
INSERT INTO permisos (rol, modulo, accion) VALUES
-- Super Admin - Acceso total
('super_admin', '*', '*'),

-- Administrador - Todo excepto empresa_config
('administrador', 'usuarios', 'read'),
('administrador', 'usuarios', 'write'),
('administrador', 'productos', 'read'),
('administrador', 'productos', 'write'),
('administrador', 'inventario', 'read'),
('administrador', 'inventario', 'write'),
('administrador', 'ventas', 'read'),
('administrador', 'ventas', 'write'),
('administrador', 'compras', 'read'),
('administrador', 'compras', 'write'),
('administrador', 'reportes', 'read'),
('administrador', 'reportes', 'write'),

-- Vendedor
('vendedor', 'productos', 'read'),
('vendedor', 'ventas', 'read'),
('vendedor', 'ventas', 'write'),
('vendedor', 'clientes', 'read'),
('vendedor', 'clientes', 'write'),

-- Inventario
('inventario', 'productos', 'read'),
('inventario', 'productos', 'write'),
('inventario', 'inventario', 'read'),
('inventario', 'inventario', 'write'),
('inventario', 'compras', 'read'),
('inventario', 'compras', 'write'),

-- Contable
('contable', 'ventas', 'read'),
('contable', 'compras', 'read'),
('contable', 'reportes', 'read'),
('contable', 'reportes', 'write'),

-- Cliente
('cliente', 'productos', 'read'),
('cliente', 'ordenes', 'read'),
('cliente', 'perfil', 'read'),
('cliente', 'perfil', 'write');
