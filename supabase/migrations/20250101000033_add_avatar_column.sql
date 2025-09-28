-- Agregar columna avatar a la tabla profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar TEXT;

-- Comentario para la columna
COMMENT ON COLUMN public.profiles.avatar IS 'URL o base64 de la foto de perfil del usuario';
