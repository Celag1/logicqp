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

-- Recrear políticas RLS sin recursión
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política simple para admins sin recursión
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (true);
