-- Fix para el trigger de creación de usuarios
-- Eliminar trigger y función existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.asignar_rol_cliente();

-- Crear función simplificada y robusta
CREATE OR REPLACE FUNCTION public.asignar_rol_cliente()
RETURNS TRIGGER AS $$
BEGIN
    -- Insertar en profiles con datos básicos
    INSERT INTO public.profiles (
        id, 
        email, 
        nombre, 
        rol,
        created_at,
        updated_at
    ) VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario'),
        'cliente',
        NOW(),
        NOW()
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log del error pero no fallar la creación del usuario
        RAISE WARNING 'Error en asignar_rol_cliente: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.asignar_rol_cliente();


