-- =====================================================
-- Corregir esquema de la tabla empresa_config
-- =====================================================

-- Verificar si la tabla existe y tiene las columnas correctas
DO $$
BEGIN
    -- Si la tabla no existe, crearla
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'empresa_config') THEN
        CREATE TABLE empresa_config (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            nombre_empresa TEXT,
            ruc TEXT,
            direccion TEXT,
            telefono TEXT,
            email TEXT,
            website TEXT,
            descripcion TEXT,
            fecha_fundacion DATE,
            numero_empleados INTEGER,
            moneda TEXT DEFAULT 'USD',
            zona_horaria TEXT DEFAULT 'America/Guayaquil',
            logo_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Tabla empresa_config creada';
    ELSE
        -- Si la tabla existe, agregar las columnas que faltan
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresa_config' AND column_name = 'nombre_empresa') THEN
            ALTER TABLE empresa_config ADD COLUMN nombre_empresa TEXT;
            RAISE NOTICE 'Columna nombre_empresa agregada';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresa_config' AND column_name = 'ruc') THEN
            ALTER TABLE empresa_config ADD COLUMN ruc TEXT;
            RAISE NOTICE 'Columna ruc agregada';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresa_config' AND column_name = 'direccion') THEN
            ALTER TABLE empresa_config ADD COLUMN direccion TEXT;
            RAISE NOTICE 'Columna direccion agregada';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresa_config' AND column_name = 'telefono') THEN
            ALTER TABLE empresa_config ADD COLUMN telefono TEXT;
            RAISE NOTICE 'Columna telefono agregada';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresa_config' AND column_name = 'email') THEN
            ALTER TABLE empresa_config ADD COLUMN email TEXT;
            RAISE NOTICE 'Columna email agregada';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresa_config' AND column_name = 'website') THEN
            ALTER TABLE empresa_config ADD COLUMN website TEXT;
            RAISE NOTICE 'Columna website agregada';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresa_config' AND column_name = 'descripcion') THEN
            ALTER TABLE empresa_config ADD COLUMN descripcion TEXT;
            RAISE NOTICE 'Columna descripcion agregada';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresa_config' AND column_name = 'fecha_fundacion') THEN
            ALTER TABLE empresa_config ADD COLUMN fecha_fundacion DATE;
            RAISE NOTICE 'Columna fecha_fundacion agregada';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresa_config' AND column_name = 'numero_empleados') THEN
            ALTER TABLE empresa_config ADD COLUMN numero_empleados INTEGER;
            RAISE NOTICE 'Columna numero_empleados agregada';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresa_config' AND column_name = 'moneda') THEN
            ALTER TABLE empresa_config ADD COLUMN moneda TEXT DEFAULT 'USD';
            RAISE NOTICE 'Columna moneda agregada';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresa_config' AND column_name = 'zona_horaria') THEN
            ALTER TABLE empresa_config ADD COLUMN zona_horaria TEXT DEFAULT 'America/Guayaquil';
            RAISE NOTICE 'Columna zona_horaria agregada';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresa_config' AND column_name = 'logo_url') THEN
            ALTER TABLE empresa_config ADD COLUMN logo_url TEXT;
            RAISE NOTICE 'Columna logo_url agregada';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresa_config' AND column_name = 'created_at') THEN
            ALTER TABLE empresa_config ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            RAISE NOTICE 'Columna created_at agregada';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresa_config' AND column_name = 'updated_at') THEN
            ALTER TABLE empresa_config ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            RAISE NOTICE 'Columna updated_at agregada';
        END IF;
        
        RAISE NOTICE 'Tabla empresa_config verificada y actualizada';
    END IF;
END $$;

-- Habilitar RLS
ALTER TABLE empresa_config ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad
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

-- Comentarios para la tabla
COMMENT ON TABLE empresa_config IS 'Configuración de la empresa';
COMMENT ON COLUMN empresa_config.nombre_empresa IS 'Nombre de la empresa';
COMMENT ON COLUMN empresa_config.ruc IS 'RUC de la empresa';
COMMENT ON COLUMN empresa_config.direccion IS 'Dirección de la empresa';
COMMENT ON COLUMN empresa_config.telefono IS 'Teléfono de contacto';
COMMENT ON COLUMN empresa_config.email IS 'Email de contacto';
COMMENT ON COLUMN empresa_config.website IS 'Sitio web de la empresa';
COMMENT ON COLUMN empresa_config.descripcion IS 'Descripción de la empresa';
COMMENT ON COLUMN empresa_config.fecha_fundacion IS 'Fecha de fundación';
COMMENT ON COLUMN empresa_config.numero_empleados IS 'Número de empleados';
COMMENT ON COLUMN empresa_config.moneda IS 'Moneda principal';
COMMENT ON COLUMN empresa_config.zona_horaria IS 'Zona horaria';
COMMENT ON COLUMN empresa_config.logo_url IS 'URL o Base64 del logo';
