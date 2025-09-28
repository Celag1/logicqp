-- Deshabilitar RLS para tabla inventario
-- Migración: 20250101000037_disable_inventario_rls.sql

-- Deshabilitar RLS para inventario
ALTER TABLE inventario DISABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Users can view inventario" ON inventario;
DROP POLICY IF EXISTS "Users can insert inventario" ON inventario;
DROP POLICY IF EXISTS "Users can update inventario" ON inventario;
DROP POLICY IF EXISTS "Users can delete inventario" ON inventario;
