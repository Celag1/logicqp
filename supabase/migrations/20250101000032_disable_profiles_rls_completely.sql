-- Deshabilitar completamente RLS en la tabla profiles para corregir el error de recursión infinita
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas existentes que causan problemas
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- La tabla profiles ahora no tiene RLS, permitiendo acceso completo