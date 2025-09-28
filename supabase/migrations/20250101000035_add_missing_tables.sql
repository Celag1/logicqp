-- Agregar todas las tablas faltantes para la tienda virtual
-- Migración: 20250101000035_add_missing_tables.sql

-- 1. Tabla carritos
CREATE TABLE IF NOT EXISTS carritos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla carrito_items
CREATE TABLE IF NOT EXISTS carrito_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  carrito_id UUID REFERENCES carritos(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id),
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla ordenes
CREATE TABLE IF NOT EXISTS ordenes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_orden TEXT UNIQUE NOT NULL,
  cliente_id UUID REFERENCES auth.users(id),
  estado TEXT NOT NULL DEFAULT 'pendiente',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  descuento DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  metodo_pago TEXT,
  direccion_entrega TEXT,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla orden_items
CREATE TABLE IF NOT EXISTS orden_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  orden_id UUID REFERENCES ordenes(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id),
  lote_id UUID REFERENCES lotes(id),
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabla pagos
CREATE TABLE IF NOT EXISTS pagos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  orden_id UUID REFERENCES ordenes(id),
  monto DECIMAL(10,2) NOT NULL,
  metodo TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  referencia TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabla envios
CREATE TABLE IF NOT EXISTS envios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  orden_id UUID REFERENCES ordenes(id),
  direccion_envio TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  fecha_envio TIMESTAMP WITH TIME ZONE,
  fecha_entrega TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabla ventas
CREATE TABLE IF NOT EXISTS ventas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_venta TEXT UNIQUE NOT NULL,
  cliente_id UUID REFERENCES auth.users(id),
  vendedor_id UUID REFERENCES auth.users(id),
  fecha_venta TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  descuento DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'completada',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Tabla venta_items
CREATE TABLE IF NOT EXISTS venta_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venta_id UUID REFERENCES ventas(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id),
  lote_id UUID REFERENCES lotes(id),
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Tabla compras
CREATE TABLE IF NOT EXISTS compras (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_compra TEXT UNIQUE NOT NULL,
  proveedor_id UUID REFERENCES proveedores(id),
  fecha_compra TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  descuento DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Tabla compra_items
CREATE TABLE IF NOT EXISTS compra_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  compra_id UUID REFERENCES compras(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id),
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Tabla clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefono TEXT,
  direccion TEXT,
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Tabla usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  rol TEXT NOT NULL,
  telefono TEXT,
  direccion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Tabla inventario
CREATE TABLE IF NOT EXISTS inventario (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  producto_id UUID REFERENCES productos(id),
  lote_id UUID REFERENCES lotes(id),
  cantidad_disponible INTEGER NOT NULL DEFAULT 0,
  cantidad_reservada INTEGER NOT NULL DEFAULT 0,
  ubicacion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Tabla stock
CREATE TABLE IF NOT EXISTS stock (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  producto_id UUID REFERENCES productos(id),
  cantidad_total INTEGER NOT NULL DEFAULT 0,
  cantidad_disponible INTEGER NOT NULL DEFAULT 0,
  cantidad_reservada INTEGER NOT NULL DEFAULT 0,
  stock_minimo INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. Tabla reportes
CREATE TABLE IF NOT EXISTS reportes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  parametros JSONB,
  fecha_generacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usuario_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. Tabla configuraciones
CREATE TABLE IF NOT EXISTS configuraciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clave TEXT UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT NOT NULL DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar configuraciones por defecto
INSERT INTO configuraciones (clave, valor, descripcion, tipo) VALUES
('empresa_nombre', 'Qualipharm Laboratorio Farmacéutico', 'Nombre de la empresa', 'text'),
('empresa_email', 'info@qualipharm.com', 'Email de la empresa', 'email'),
('empresa_telefono', '+593 2 123 4567', 'Teléfono de la empresa', 'text'),
('iva_porcentaje', '12', 'Porcentaje de IVA', 'number'),
('moneda', 'USD', 'Moneda principal', 'text'),
('zona_horaria', 'America/Guayaquil', 'Zona horaria', 'text')
ON CONFLICT (clave) DO NOTHING;

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_carrito_items_carrito_id ON carrito_items(carrito_id);
CREATE INDEX IF NOT EXISTS idx_carrito_items_producto_id ON carrito_items(producto_id);
CREATE INDEX IF NOT EXISTS idx_orden_items_orden_id ON orden_items(orden_id);
CREATE INDEX IF NOT EXISTS idx_orden_items_producto_id ON orden_items(producto_id);
CREATE INDEX IF NOT EXISTS idx_venta_items_venta_id ON venta_items(venta_id);
CREATE INDEX IF NOT EXISTS idx_venta_items_producto_id ON venta_items(producto_id);
CREATE INDEX IF NOT EXISTS idx_compra_items_compra_id ON compra_items(compra_id);
CREATE INDEX IF NOT EXISTS idx_compra_items_producto_id ON compra_items(producto_id);
CREATE INDEX IF NOT EXISTS idx_inventario_producto_id ON inventario(producto_id);
CREATE INDEX IF NOT EXISTS idx_stock_producto_id ON stock(producto_id);

-- Comentarios de confirmación
COMMENT ON TABLE carritos IS 'Carritos de compra de los clientes';
COMMENT ON TABLE carrito_items IS 'Items dentro de cada carrito';
COMMENT ON TABLE ordenes IS 'Órdenes de compra procesadas';
COMMENT ON TABLE orden_items IS 'Items de cada orden';
COMMENT ON TABLE pagos IS 'Registro de pagos realizados';
COMMENT ON TABLE envios IS 'Gestión de envíos de órdenes';
COMMENT ON TABLE ventas IS 'Registro de ventas realizadas';
COMMENT ON TABLE venta_items IS 'Items de cada venta';
COMMENT ON TABLE compras IS 'Registro de compras a proveedores';
COMMENT ON TABLE compra_items IS 'Items de cada compra';
COMMENT ON TABLE clientes IS 'Base de datos de clientes';
COMMENT ON TABLE usuarios IS 'Usuarios del sistema';
COMMENT ON TABLE inventario IS 'Control de inventario por lote';
COMMENT ON TABLE stock IS 'Control de stock por producto';
COMMENT ON TABLE reportes IS 'Reportes generados del sistema';
COMMENT ON TABLE configuraciones IS 'Configuraciones del sistema';
