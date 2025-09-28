-- Deshabilitar RLS temporalmente para la tabla productos
ALTER TABLE public.productos DISABLE ROW LEVEL SECURITY;

-- Deshabilitar RLS para otras tablas relacionadas
ALTER TABLE public.categorias DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.proveedores DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lotes DISABLE ROW LEVEL SECURITY;
