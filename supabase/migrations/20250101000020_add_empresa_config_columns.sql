-- =====================================================
-- Agregar columnas faltantes a la tabla empresa_config existente
-- =====================================================

-- Agregar columnas faltantes una por una
ALTER TABLE empresa_config 
ADD COLUMN IF NOT EXISTS website TEXT;

ALTER TABLE empresa_config 
ADD COLUMN IF NOT EXISTS descripcion TEXT;

ALTER TABLE empresa_config 
ADD COLUMN IF NOT EXISTS fecha_fundacion DATE;

ALTER TABLE empresa_config 
ADD COLUMN IF NOT EXISTS numero_empleados INTEGER;

ALTER TABLE empresa_config 
ADD COLUMN IF NOT EXISTS moneda TEXT DEFAULT 'USD';

ALTER TABLE empresa_config 
ADD COLUMN IF NOT EXISTS zona_horaria TEXT DEFAULT 'America/Guayaquil';

ALTER TABLE empresa_config 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

ALTER TABLE empresa_config 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE empresa_config 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Comentarios para las columnas
COMMENT ON COLUMN empresa_config.website IS 'Sitio web de la empresa';
COMMENT ON COLUMN empresa_config.descripcion IS 'Descripción de la empresa';
COMMENT ON COLUMN empresa_config.fecha_fundacion IS 'Fecha de fundación';
COMMENT ON COLUMN empresa_config.numero_empleados IS 'Número de empleados';
COMMENT ON COLUMN empresa_config.moneda IS 'Moneda principal';
COMMENT ON COLUMN empresa_config.zona_horaria IS 'Zona horaria';
COMMENT ON COLUMN empresa_config.logo_url IS 'URL o Base64 del logo';

-- Habilitar RLS si no está habilitado
ALTER TABLE empresa_config ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad si no existen
DO $$
BEGIN
    -- Política para ver
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'empresa_config' 
        AND policyname = 'Anyone can view empresa config'
    ) THEN
        CREATE POLICY "Anyone can view empresa config" ON empresa_config
          FOR SELECT USING (true);
    END IF;

    -- Política para insertar
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'empresa_config' 
        AND policyname = 'Authenticated users can insert empresa config'
    ) THEN
        CREATE POLICY "Authenticated users can insert empresa config" ON empresa_config
          FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;

    -- Política para actualizar
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'empresa_config' 
        AND policyname = 'Authenticated users can update empresa config'
    ) THEN
        CREATE POLICY "Authenticated users can update empresa config" ON empresa_config
          FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Grant permissions
GRANT ALL ON empresa_config TO authenticated;
GRANT ALL ON empresa_config TO anon;
