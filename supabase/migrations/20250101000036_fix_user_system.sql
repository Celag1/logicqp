-- Corregir sistema de usuarios y eliminar tablas innecesarias
-- Migración: 20250101000036_fix_user_system.sql

-- 1. ELIMINAR TABLAS INNECESARIAS
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS stock CASCADE;

-- 2. CORREGIR TABLA PROFILES PARA INCLUIR TODOS LOS ROLES
-- Agregar campos necesarios a profiles si no existen
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS telefono_verificado BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS ultimo_acceso TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. ACTUALIZAR ROLES EN PROFILES
UPDATE profiles SET 
  rol = 'super_admin',
  activo = TRUE,
  email_verificado = TRUE,
  telefono_verificado = TRUE,
  ultimo_acceso = NOW(),
  fecha_registro = NOW()
WHERE email = 'celag3@gmail.com';

-- 4. CORREGIR TABLA EMPRESA_CONFIG - UN SOLO REGISTRO
DELETE FROM empresa_config WHERE id IS NOT NULL;

INSERT INTO empresa_config (
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
  'Laboratorio farmacéutico líder en Ecuador especializado en medicamentos de alta calidad',
  '2020-01-01',
  50,
  'USD',
  'America/Guayaquil',
  null,
  NOW(),
  NOW()
);

-- 5. POBLAR TABLA CONFIGURACIONES CON DATOS REALES
DELETE FROM configuraciones WHERE id IS NOT NULL;

INSERT INTO configuraciones (clave, valor, descripcion, tipo) VALUES
('empresa_nombre', 'Qualipharm Laboratorio Farmacéutico', 'Nombre de la empresa', 'text'),
('empresa_email', 'info@qualipharm.com', 'Email de la empresa', 'email'),
('empresa_telefono', '+593 2 123 4567', 'Teléfono de la empresa', 'text'),
('empresa_direccion', 'Av. Principal 123, Quito, Ecuador', 'Dirección de la empresa', 'text'),
('empresa_ruc', '1234567890001', 'RUC de la empresa', 'text'),
('iva_porcentaje', '12', 'Porcentaje de IVA', 'number'),
('moneda', 'USD', 'Moneda principal', 'text'),
('zona_horaria', 'America/Guayaquil', 'Zona horaria', 'text'),
('stock_minimo_global', '10', 'Stock mínimo global', 'number'),
('dias_vencimiento_alerta', '30', 'Días para alerta de vencimiento', 'number'),
('email_notificaciones', 'admin@qualipharm.com', 'Email para notificaciones', 'email'),
('sistema_activo', 'true', 'Estado del sistema', 'boolean');

-- 6. CREAR FUNCIÓN PARA ASIGNAR ROL DE CLIENTE AUTOMÁTICAMENTE
CREATE OR REPLACE FUNCTION asignar_rol_cliente()
RETURNS TRIGGER AS $$
BEGIN
  -- Insertar en profiles con rol de cliente por defecto
  INSERT INTO profiles (
    id,
    email,
    nombre,
    apellido,
    rol,
    activo,
    email_verificado,
    telefono_verificado,
    fecha_registro,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'apellido', 'Nuevo'),
    'cliente',
    TRUE,
    NEW.email_confirmed_at IS NOT NULL,
    NEW.phone_confirmed_at IS NOT NULL,
    NOW(),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. CREAR TRIGGER PARA ASIGNAR ROL AUTOMÁTICAMENTE
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION asignar_rol_cliente();

-- 8. CREAR FUNCIÓN PARA VERIFICAR PERMISOS DE ROL
CREATE OR REPLACE FUNCTION tiene_permiso(permiso TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Obtener rol del usuario actual
  SELECT rol INTO user_role 
  FROM profiles 
  WHERE id = auth.uid();
  
  -- Verificar permisos según rol
  CASE permiso
    WHEN 'ver_usuarios' THEN
      RETURN user_role IN ('super_admin', 'admin');
    WHEN 'crear_usuarios' THEN
      RETURN user_role IN ('super_admin', 'admin');
    WHEN 'editar_usuarios' THEN
      RETURN user_role IN ('super_admin', 'admin');
    WHEN 'cambiar_roles' THEN
      RETURN user_role IN ('super_admin', 'admin');
    WHEN 'ver_productos' THEN
      RETURN user_role IN ('super_admin', 'admin', 'vendedor', 'inventario', 'contador', 'cliente');
    WHEN 'editar_productos' THEN
      RETURN user_role IN ('super_admin', 'admin', 'inventario');
    WHEN 'ver_ventas' THEN
      RETURN user_role IN ('super_admin', 'admin', 'vendedor', 'contador', 'cliente');
    WHEN 'crear_ventas' THEN
      RETURN user_role IN ('super_admin', 'admin', 'vendedor');
    WHEN 'ver_inventario' THEN
      RETURN user_role IN ('super_admin', 'admin', 'inventario', 'vendedor', 'contador');
    WHEN 'editar_inventario' THEN
      RETURN user_role IN ('super_admin', 'admin', 'inventario');
    WHEN 'ver_reportes' THEN
      RETURN user_role IN ('super_admin', 'admin', 'contador', 'vendedor');
    WHEN 'crear_reportes' THEN
      RETURN user_role IN ('super_admin', 'admin', 'contador');
    WHEN 'ver_configuracion' THEN
      RETURN user_role IN ('super_admin', 'admin');
    WHEN 'editar_configuracion' THEN
      RETURN user_role = 'super_admin';
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. POBLAR TABLA INVENTARIO CON DATOS REALES (se poblará después)
-- La tabla inventario se poblará manualmente después de verificar su estructura

-- 10. CREAR ÍNDICES PARA MEJORAR RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_profiles_rol ON profiles(rol);
CREATE INDEX IF NOT EXISTS idx_profiles_activo ON profiles(activo);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_inventario_producto ON inventario(producto_id);

-- 11. COMENTARIOS DE CONFIRMACIÓN
COMMENT ON FUNCTION asignar_rol_cliente() IS 'Asigna automáticamente rol de cliente a nuevos usuarios';
COMMENT ON FUNCTION tiene_permiso(TEXT) IS 'Verifica permisos de usuario según su rol';
COMMENT ON TABLE profiles IS 'Perfiles de usuarios con roles y permisos';
COMMENT ON TABLE inventario IS 'Control de inventario por producto y lote';
COMMENT ON TABLE empresa_config IS 'Configuración única de la empresa';
COMMENT ON TABLE configuraciones IS 'Configuraciones del sistema';
