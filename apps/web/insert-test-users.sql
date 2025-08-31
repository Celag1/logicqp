-- Script para insertar usuarios de prueba en la tabla profiles
-- Ejecutar este script en Supabase SQL Editor

-- Primero, verificar que la tabla profiles existe
-- Si no existe, crearla con la estructura correcta

-- Crear la tabla profiles si no existe
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('super_admin', 'administrador', 'vendedor', 'inventario', 'contable', 'cliente')),
  email_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Insertar usuarios de prueba
-- NOTA: Los IDs deben coincidir con los usuarios creados en auth.users
-- Si no tienes los IDs exactos, puedes usar UUIDs generados

INSERT INTO profiles (id, email, nombre, rol, email_verified, created_at, updated_at) VALUES
-- Super Admin
(gen_random_uuid(), 'celag3@gmail.com', 'Carlos Elag', 'super_admin', true, NOW(), NOW()),

-- Administrador
(gen_random_uuid(), 'admin@qp.ec', 'Administrador QP', 'administrador', true, NOW(), NOW()),

-- Vendedor
(gen_random_uuid(), 'ventas@qp.ec', 'Ventas QP', 'vendedor', true, NOW(), NOW()),

-- Inventario
(gen_random_uuid(), 'invent@qp.ec', 'Inventario QP', 'inventario', true, NOW(), NOW()),

-- Contable
(gen_random_uuid(), 'contab@qp.ec', 'Contable QP', 'contable', true, NOW(), NOW()),

-- Cliente
(gen_random_uuid(), 'elipaz31@gmail.com', 'Eli Paz', 'cliente', true, NOW(), NOW());

-- Verificar que se insertaron correctamente
SELECT 
  id,
  email,
  nombre,
  rol,
  email_verified,
  created_at
FROM profiles
ORDER BY created_at;

-- Crear función para sincronizar usuarios de auth con profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre, rol, email_verified)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'nombre', 'Usuario'),
    COALESCE(new.raw_user_meta_data->>'rol', 'cliente'),
    COALESCE(new.email_confirmed_at IS NOT NULL, false)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger para nuevos usuarios
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
