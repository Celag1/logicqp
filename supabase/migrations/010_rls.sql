-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE compra_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE carritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrito_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orden_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE envios ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE permisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresa_config ENABLE ROW LEVEL SECURITY;

-- Funciones helper para verificar roles
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND rol = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND rol IN ('administrador', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_cliente_verified()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND rol = 'cliente' AND email_verified = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Super admin can view all profiles" ON profiles
  FOR SELECT USING (is_super_admin());

-- Políticas para empresa_config (SOLO super_admin)
CREATE POLICY "Only super admin can access empresa_config" ON empresa_config
  FOR ALL USING (is_super_admin());

-- Políticas para categorias (lectura para todos autenticados)
CREATE POLICY "Authenticated users can view categorias" ON categorias
  FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para productos (lectura para todos autenticados, escritura para inventario+)
CREATE POLICY "Authenticated users can view productos" ON productos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Inventory users can manage productos" ON productos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND rol IN ('inventario', 'administrador', 'super_admin')
    )
  );

-- Políticas para lotes
CREATE POLICY "Authenticated users can view lotes" ON lotes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Inventory users can manage lotes" ON lotes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND rol IN ('inventario', 'administrador', 'super_admin')
    )
  );

-- Políticas para proveedores
CREATE POLICY "Authenticated users can view proveedores" ON proveedores
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Inventory users can manage proveedores" ON proveedores
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND rol IN ('inventario', 'administrador', 'super_admin')
    )
  );

-- Políticas para compras
CREATE POLICY "Authenticated users can view compras" ON compras
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Inventory users can manage compras" ON compras
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND rol IN ('inventario', 'administrador', 'super_admin')
    )
  );

-- Políticas para movimientos_stock
CREATE POLICY "Authenticated users can view movimientos" ON movimientos_stock
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Inventory users can manage movimientos" ON movimientos_stock
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND rol IN ('inventario', 'administrador', 'super_admin')
    )
  );

-- Políticas para clientes
CREATE POLICY "Users can view own cliente record" ON clientes
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Super admin can view all clientes" ON clientes
  FOR SELECT USING (is_super_admin());

-- Políticas para carritos
CREATE POLICY "Users can manage own carrito" ON carritos
  FOR ALL USING (profile_id = auth.uid());

-- Políticas para carrito_items
CREATE POLICY "Users can manage own carrito items" ON carrito_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM carritos 
      WHERE id = carrito_id AND profile_id = auth.uid()
    )
  );

-- Políticas para órdenes
CREATE POLICY "Clientes can view own orders" ON ordenes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clientes 
      WHERE id = cliente_id AND profile_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view all orders" ON ordenes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND rol IN ('vendedor', 'inventario', 'contable', 'administrador', 'super_admin')
    )
  );

CREATE POLICY "Staff can manage orders" ON ordenes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND rol IN ('vendedor', 'inventario', 'contable', 'administrador', 'super_admin')
    )
  );

-- Políticas para auditoria
CREATE POLICY "Staff can view auditoria" ON auditoria
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND rol IN ('inventario', 'administrador', 'super_admin')
    )
  );

-- Políticas para permisos
CREATE POLICY "Super admin can manage permisos" ON permisos
  FOR ALL USING (is_super_admin());

-- Políticas para pagos y envíos
CREATE POLICY "Staff can manage pagos and envios" ON pagos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND rol IN ('vendedor', 'contable', 'administrador', 'super_admin')
    )
  );

CREATE POLICY "Staff can manage pagos and envios" ON envios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND rol IN ('vendedor', 'contable', 'administrador', 'super_admin')
    )
  );
