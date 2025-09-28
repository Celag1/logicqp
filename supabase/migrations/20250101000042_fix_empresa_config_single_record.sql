-- Asegurar que solo haya un registro en empresa_config
-- Primero eliminar todos los registros existentes
DELETE FROM empresa_config;

-- Insertar un solo registro con los datos de la empresa
INSERT INTO empresa_config (
  id,
  nombre,
  nombre_empresa,
  direccion,
  telefono,
  email,
  ruc,
  logo_url,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Qualipharm Laboratorio Farmacéutico',
  'Qualipharm Laboratorio Farmacéutico',
  'Av. Amazonas N12-34 y Colón, Quito, Ecuador',
  '+593 2 234-5678',
  'info@qualipharm.com',
  '1234567890001',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=400&fit=crop&crop=center&q=80&auto=format&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  NOW(),
  NOW()
);

-- Crear un índice único para asegurar que solo haya un registro
CREATE UNIQUE INDEX IF NOT EXISTS idx_empresa_config_single ON empresa_config ((1));

-- Comentario en la tabla
COMMENT ON TABLE empresa_config IS 'Configuración única de la empresa - Solo debe tener un registro';
