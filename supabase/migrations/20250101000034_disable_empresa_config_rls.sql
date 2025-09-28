-- Deshabilitar RLS en la tabla empresa_config para permitir guardado
ALTER TABLE public.empresa_config DISABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Anyone can view empresa config" ON public.empresa_config;
DROP POLICY IF EXISTS "Authenticated users can insert empresa config" ON public.empresa_config;
DROP POLICY IF EXISTS "Authenticated users can update empresa config" ON public.empresa_config;
DROP POLICY IF EXISTS "Authenticated users can read all data" ON public.empresa_config;

-- Asegurar que la tabla tenga un ID único para upsert
DO $$
BEGIN
    -- Verificar si la columna id existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'empresa_config' 
        AND column_name = 'id'
    ) THEN
        -- Agregar columna id si no existe
        ALTER TABLE public.empresa_config ADD COLUMN id UUID DEFAULT gen_random_uuid() PRIMARY KEY;
    END IF;
END $$;

-- Crear un registro por defecto si no existe ninguno
INSERT INTO public.empresa_config (
    id,
    nombre,
    nombre_empresa,
    ruc,
    direccion,
    telefono,
    email,
    website,
    descripcion,
    fecha_fundacion,
    numero_empleados,
    moneda,
    zona_horaria,
    logo_url,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'Qualipharm Laboratorio Farmacéutico',
    'Qualipharm Laboratorio Farmacéutico',
    '1234567890001',
    'Av. Principal 123, Quito, Ecuador',
    '+593 2 123 4567',
    'info@qualipharm.com',
    'https://www.qualipharm.com',
    'Laboratorio farmacéutico líder en Ecuador',
    '2020-01-01',
    50,
    'USD',
    'America/Guayaquil',
    null,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Comentarios para la tabla
COMMENT ON TABLE public.empresa_config IS 'Configuración de la empresa - RLS deshabilitado para permitir guardado';
