-- Crear trigger para crear perfil automáticamente cuando un nuevo usuario se registra
-- Migración: 20250101000045_create_profile_trigger.sql

-- Crear función para manejar nuevo usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre, created_at, updated_at, rol, email_verificado, telefono_verificado)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'nombre', now(), now(), 'cliente', FALSE, FALSE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Comentarios
COMMENT ON FUNCTION public.handle_new_user() IS 'Crea automáticamente un perfil cuando se registra un nuevo usuario';
