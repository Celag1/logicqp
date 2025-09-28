-- Eliminar columna duplicada nombre_empresa de empresa_config
-- Mantener solo la columna 'nombre' que es NOT NULL

ALTER TABLE empresa_config DROP COLUMN IF EXISTS nombre_empresa;
