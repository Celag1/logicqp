-- Migración final para corregir usuario super-admin
-- Deshabilitar RLS temporalmente
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Actualizar usuario super-admin
UPDATE profiles 
SET 
  rol = 'super_admin',
  telefono = '0998769259',
  direccion = 'Av. Bolivariana 1441 y Genovesa, Ambato, Ecuador',
  empresa = 'IngSoft S.A.',
  email_verificado = true,
  telefono_verificado = true
WHERE email = 'celag3@gmail.com';

-- Rehabilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Verificar la actualización
SELECT id, email, nombre, apellido, rol, telefono, direccion, empresa, email_verificado, telefono_verificado 
FROM profiles 
WHERE email = 'celag3@gmail.com';
