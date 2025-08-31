-- =====================================================
-- LOGICQP - ESQUEMA COMPLETO DE BASE DE DATOS
-- =====================================================

-- Crear enum para roles
CREATE TYPE rol_type AS ENUM (
  'super_admin', 'administrador', 'vendedor', 
  'inventario', 'contable', 'cliente'
);

-- Tabla de perfiles de usuario
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  apellido TEXT,
  rol rol_type NOT NULL DEFAULT 'cliente',
  telefono TEXT,
  direccion TEXT,
  empresa TEXT,
  email_verificado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de categorías de productos
CREATE TABLE categorias (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  activa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de proveedores
CREATE TABLE proveedores (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  ruc TEXT UNIQUE,
  direccion TEXT,
  telefono TEXT,
  email TEXT,
  contacto TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de productos
CREATE TABLE productos (
  id SERIAL PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  precio_compra DECIMAL(10,2),
  categoria_id INTEGER REFERENCES categorias(id),
  proveedor_id INTEGER REFERENCES proveedores(id),
  stock_minimo INTEGER DEFAULT 0,
  stock_maximo INTEGER,
  activo BOOLEAN DEFAULT TRUE,
  imagen_url TEXT,
  imagen_hash TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de lotes
CREATE TABLE lotes (
  id SERIAL PRIMARY KEY,
  producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
  numero_lote TEXT NOT NULL,
  fecha_fabricacion DATE,
  fecha_vencimiento DATE NOT NULL,
  cantidad_inicial INTEGER NOT NULL,
  cantidad_disponible INTEGER NOT NULL,
  precio_compra DECIMAL(10,2),
  proveedor_id INTEGER REFERENCES proveedores(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de compras
CREATE TABLE compras (
  id SERIAL PRIMARY KEY,
  numero_factura TEXT UNIQUE,
  proveedor_id INTEGER REFERENCES proveedores(id),
  fecha_compra DATE NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  estado TEXT DEFAULT 'pendiente',
  notas TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de items de compra
CREATE TABLE compra_items (
  id SERIAL PRIMARY KEY,
  compra_id INTEGER REFERENCES compras(id) ON DELETE CASCADE,
  producto_id INTEGER REFERENCES productos(id),
  lote_id INTEGER REFERENCES lotes(id),
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);

-- Tabla de movimientos de stock
CREATE TABLE movimientos_stock (
  id SERIAL PRIMARY KEY,
  producto_id INTEGER REFERENCES productos(id),
  lote_id INTEGER REFERENCES lotes(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'salida', 'ajuste')),
  cantidad INTEGER NOT NULL,
  cantidad_anterior INTEGER NOT NULL,
  cantidad_nueva INTEGER NOT NULL,
  motivo TEXT,
  referencia_id INTEGER,
  referencia_tipo TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de clientes
CREATE TABLE clientes (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  ruc TEXT UNIQUE,
  direccion_facturacion TEXT,
  direccion_envio TEXT,
  telefono_adicional TEXT,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de carritos
CREATE TABLE carritos (
  id SERIAL PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de items del carrito
CREATE TABLE carrito_items (
  id SERIAL PRIMARY KEY,
  carrito_id INTEGER REFERENCES carritos(id) ON DELETE CASCADE,
  producto_id INTEGER REFERENCES productos(id),
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de órdenes
CREATE TABLE ordenes (
  id SERIAL PRIMARY KEY,
  numero_orden TEXT UNIQUE NOT NULL,
  cliente_id UUID REFERENCES clientes(id),
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'enviada', 'entregada', 'cancelada')),
  subtotal DECIMAL(10,2) NOT NULL,
  impuestos DECIMAL(10,2) DEFAULT 0,
  descuento DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de items de orden
CREATE TABLE orden_items (
  id SERIAL PRIMARY KEY,
  orden_id INTEGER REFERENCES ordenes(id) ON DELETE CASCADE,
  producto_id INTEGER REFERENCES productos(id),
  lote_id INTEGER REFERENCES lotes(id),
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);

-- Tabla de pagos
CREATE TABLE pagos (
  id SERIAL PRIMARY KEY,
  orden_id INTEGER REFERENCES ordenes(id) ON DELETE CASCADE,
  monto DECIMAL(10,2) NOT NULL,
  metodo TEXT NOT NULL,
  referencia TEXT,
  estado TEXT DEFAULT 'pendiente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de envíos
CREATE TABLE envios (
  id SERIAL PRIMARY KEY,
  orden_id INTEGER REFERENCES ordenes(id) ON DELETE CASCADE,
  direccion_envio TEXT NOT NULL,
  metodo_envio TEXT,
  tracking_number TEXT,
  estado TEXT DEFAULT 'pendiente',
  fecha_envio TIMESTAMP WITH TIME ZONE,
  fecha_entrega TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de auditoría
CREATE TABLE auditoria (
  id SERIAL PRIMARY KEY,
  tabla TEXT NOT NULL,
  accion TEXT NOT NULL,
  registro_id TEXT,
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  usuario_id UUID REFERENCES profiles(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de permisos
CREATE TABLE permisos (
  id SERIAL PRIMARY KEY,
  rol rol_type NOT NULL,
  modulo TEXT NOT NULL,
  accion TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(rol, modulo, accion)
);

-- Tabla de configuración de empresa
CREATE TABLE empresa_config (
  id SERIAL PRIMARY KEY,
  nombre_empresa TEXT NOT NULL DEFAULT 'Qualipharm Laboratorio Farmacéutico',
  ruc TEXT,
  direccion TEXT,
  telefono TEXT,
  email TEXT,
  logo_url TEXT,
  moneda TEXT DEFAULT 'USD',
  zona_horaria TEXT DEFAULT 'America/Guayaquil',
  configuracion JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_proveedor ON productos(proveedor_id);
CREATE INDEX idx_lotes_producto ON lotes(producto_id);
CREATE INDEX idx_lotes_vencimiento ON lotes(fecha_vencimiento);
CREATE INDEX idx_movimientos_producto ON movimientos_stock(producto_id);
CREATE INDEX idx_ordenes_cliente ON ordenes(cliente_id);
CREATE INDEX idx_ordenes_estado ON ordenes(estado);
CREATE INDEX idx_auditoria_tabla ON auditoria(tabla);
CREATE INDEX idx_auditoria_usuario ON auditoria(usuario_id);
CREATE INDEX idx_permisos_rol ON permisos(rol);

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lotes ENABLE ROW LEVEL SECURITY;
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

-- Función para verificar si es super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND rol = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si es admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND rol IN ('super_admin', 'administrador')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si cliente tiene email verificado
CREATE OR REPLACE FUNCTION is_cliente_verified()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND rol = 'cliente' AND email_verificado = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas RLS para profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Super admins can manage all profiles" ON profiles
  FOR ALL USING (is_super_admin());

-- Políticas RLS para empresa_config (solo super_admin)
CREATE POLICY "Only super admin can access empresa_config" ON empresa_config
  FOR ALL USING (is_super_admin());

-- Políticas RLS para categorias
CREATE POLICY "Anyone can view active categories" ON categorias
  FOR SELECT USING (activa = TRUE);

CREATE POLICY "Admins can manage categories" ON categorias
  FOR ALL USING (is_admin());

-- Políticas RLS para productos
CREATE POLICY "Anyone can view active products" ON productos
  FOR SELECT USING (activo = TRUE);

CREATE POLICY "Admins can manage products" ON productos
  FOR ALL USING (is_admin());

-- Políticas RLS para lotes
CREATE POLICY "Anyone can view lotes" ON lotes
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage lotes" ON lotes
  FOR ALL USING (is_admin());

-- Políticas RLS para proveedores
CREATE POLICY "Anyone can view active suppliers" ON proveedores
  FOR SELECT USING (activo = TRUE);

CREATE POLICY "Admins can manage suppliers" ON proveedores
  FOR ALL USING (is_admin());

-- Políticas RLS para compras
CREATE POLICY "Admins can view all purchases" ON compras
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage purchases" ON compras
  FOR ALL USING (is_admin());

-- Políticas RLS para clientes
CREATE POLICY "Users can view own client profile" ON clientes
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all clients" ON clientes
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage clients" ON clientes
  FOR ALL USING (is_admin());

-- Políticas RLS para carritos
CREATE POLICY "Users can manage own cart" ON carritos
  FOR ALL USING (cliente_id = auth.uid());

CREATE POLICY "Admins can view all carts" ON carritos
  FOR SELECT USING (is_admin());

-- Políticas RLS para ordenes
CREATE POLICY "Users can view own orders" ON ordenes
  FOR SELECT USING (cliente_id = auth.uid());

CREATE POLICY "Admins can view all orders" ON ordenes
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage orders" ON ordenes
  FOR ALL USING (is_admin());

-- Políticas RLS para auditoria
CREATE POLICY "Admins can view audit logs" ON auditoria
  FOR SELECT USING (is_admin());

-- Políticas RLS para permisos
CREATE POLICY "Admins can view permissions" ON permisos
  FOR SELECT USING (is_admin());

CREATE POLICY "Super admin can manage permissions" ON permisos
  FOR ALL USING (is_super_admin());

-- Insertar configuración inicial de empresa
INSERT INTO empresa_config (nombre_empresa, ruc, direccion, telefono, email, moneda, zona_horaria)
VALUES (
  'Qualipharm Laboratorio Farmacéutico',
  '1791234567001',
  'Quito, Ecuador',
  '+593 2 234 5678',
  'info@qualipharm.com.ec',
  'USD',
  'America/Guayaquil'
);

-- Crear bucket de storage para productos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('productos', 'productos', true);

-- Política de storage para productos
CREATE POLICY "Anyone can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'productos');

CREATE POLICY "Authenticated users can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'productos' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can manage product images" ON storage.objects
  FOR ALL USING (bucket_id = 'productos' AND is_admin());
