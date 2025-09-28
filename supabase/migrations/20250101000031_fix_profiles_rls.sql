-- Deshabilitar RLS temporalmente en la tabla profiles para corregir el error de recursión infinita
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Eliminar políticas problemáticas que causan recursión infinita
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Crear políticas simples y correctas
CREATE POLICY "Enable read access for all users" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on user_id" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Habilitar RLS nuevamente
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
