-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'administrador', 
  'vendedor',
  'inventario',
  'contador',
  'cliente'
);

-- Create rol_type alias for compatibility
CREATE TYPE rol_type AS ENUM (
  'super_admin',
  'administrador', 
  'vendedor',
  'inventario',
  'contador',
  'cliente'
);

CREATE TYPE venta_estado AS ENUM (
  'pendiente',
  'completada',
  'cancelada',
  'entregada',
  'enviada',
  'en_proceso',
  'confirmada'
);

CREATE TYPE inventario_movimiento AS ENUM (
  'entrada',
  'salida',
  'ajuste'
);

CREATE TYPE reporte_tipo AS ENUM (
  'ventas',
  'inventario',
  'productos'
);

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  apellido TEXT,
  rol rol_type NOT NULL DEFAULT 'cliente',
  telefono TEXT,
  direccion TEXT,
  empresa TEXT,
  email_verificado BOOLEAN DEFAULT FALSE,
  telefono_verificado BOOLEAN DEFAULT FALSE,
  foto_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create empresas table
CREATE TABLE public.empresas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre TEXT NOT NULL,
  logo_url TEXT,
  direccion TEXT,
  telefono TEXT,
  email TEXT,
  ruc TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create proveedores table
CREATE TABLE public.proveedores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre TEXT NOT NULL,
  contacto TEXT,
  email TEXT,
  telefono TEXT,
  direccion TEXT,
  ruc TEXT UNIQUE,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Los clientes son usuarios con rol 'cliente' en la tabla profiles

-- Create categorias table
CREATE TABLE public.categorias (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  activa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create productos table
CREATE TABLE public.productos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria_id UUID REFERENCES public.categorias(id),
  precio DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  stock_minimo INTEGER NOT NULL DEFAULT 0,
  unidad_medida TEXT NOT NULL DEFAULT 'unidad',
  proveedor_id UUID REFERENCES public.proveedores(id),
  foto_url TEXT,
  codigo_barras TEXT,
  codigo_interno TEXT,
  iva DECIMAL(5,2) DEFAULT 12.00,
  requiere_receta BOOLEAN DEFAULT FALSE,
  controlado BOOLEAN DEFAULT FALSE,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ventas table
CREATE TABLE public.ventas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  numero_venta TEXT UNIQUE NOT NULL,
  cliente_id UUID REFERENCES public.profiles(id), -- Cliente es un usuario con rol 'cliente'
  cliente_nombre TEXT NOT NULL,
  cliente_telefono TEXT,
  cliente_email TEXT,
  vendedor_id UUID REFERENCES public.profiles(id), -- Vendedor es un usuario con rol 'vendedor'
  vendedor_nombre TEXT NOT NULL,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  impuestos DECIMAL(10,2) NOT NULL DEFAULT 0,
  descuento DECIMAL(10,2) NOT NULL DEFAULT 0,
  metodo_pago TEXT NOT NULL,
  estado venta_estado NOT NULL DEFAULT 'pendiente',
  fecha_venta TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create venta_items table
CREATE TABLE public.venta_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  venta_id UUID REFERENCES public.ventas(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES public.productos(id),
  producto_nombre TEXT NOT NULL,
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lotes table
CREATE TABLE public.lotes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  producto_id UUID REFERENCES public.productos(id),
  numero_lote TEXT NOT NULL,
  codigo_barras TEXT,
  cantidad_inicial INTEGER NOT NULL,
  cantidad_disponible INTEGER NOT NULL,
  precio_compra DECIMAL(10,2) NOT NULL,
  fecha_vencimiento DATE,
  proveedor_id UUID REFERENCES public.proveedores(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(numero_lote, producto_id)
);

-- Create inventario table
CREATE TABLE public.inventario (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  producto_id UUID REFERENCES public.productos(id),
  movimiento_tipo inventario_movimiento NOT NULL,
  cantidad INTEGER NOT NULL,
  motivo TEXT NOT NULL,
  usuario_id UUID REFERENCES public.profiles(id),
  usuario_nombre TEXT NOT NULL,
  fecha_movimiento TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reportes table
CREATE TABLE public.reportes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tipo reporte_tipo NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  parametros JSONB,
  fecha_generacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usuario_id UUID REFERENCES public.profiles(id),
  archivo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create configuracion table
CREATE TABLE public.configuracion (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  clave TEXT UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT NOT NULL DEFAULT 'string',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create empresa_config table (for company settings)
CREATE TABLE public.empresa_config (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre TEXT NOT NULL,
  logo_url TEXT,
  direccion TEXT,
  telefono TEXT,
  email TEXT,
  ruc TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_rol ON public.profiles(rol);
CREATE INDEX idx_productos_codigo ON public.productos(codigo);
CREATE INDEX idx_productos_categoria ON public.productos(categoria_id);
CREATE INDEX idx_ventas_fecha ON public.ventas(fecha_venta);
CREATE INDEX idx_ventas_vendedor ON public.ventas(vendedor_id);
CREATE INDEX idx_venta_items_venta ON public.venta_items(venta_id);
CREATE INDEX idx_inventario_producto ON public.inventario(producto_id);
CREATE INDEX idx_inventario_fecha ON public.inventario(fecha_movimiento);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER empresas_updated_at
  BEFORE UPDATE ON public.empresas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER proveedores_updated_at
  BEFORE UPDATE ON public.proveedores
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


CREATE TRIGGER categorias_updated_at
  BEFORE UPDATE ON public.categorias
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER productos_updated_at
  BEFORE UPDATE ON public.productos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER ventas_updated_at
  BEFORE UPDATE ON public.ventas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER configuracion_updated_at
  BEFORE UPDATE ON public.configuracion
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER empresa_config_updated_at
  BEFORE UPDATE ON public.empresa_config
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venta_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reportes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresa_config ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow all authenticated users to read profiles (for user management)
CREATE POLICY "Authenticated users can read profiles" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow super_admin and administrador to manage profiles
CREATE POLICY "Admins can manage profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol IN ('super_admin', 'administrador')
    )
  );

-- Similar policies for other tables (simplified for now)
CREATE POLICY "Authenticated users can read all data" ON public.empresas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read all data" ON public.proveedores
  FOR SELECT USING (auth.role() = 'authenticated');


CREATE POLICY "Authenticated users can read all data" ON public.categorias
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read all data" ON public.productos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read all data" ON public.ventas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read all data" ON public.venta_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read all data" ON public.inventario
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read all data" ON public.reportes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read all data" ON public.configuracion
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read all data" ON public.empresa_config
  FOR SELECT USING (auth.role() = 'authenticated');
