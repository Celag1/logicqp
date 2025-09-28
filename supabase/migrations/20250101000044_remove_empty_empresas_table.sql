-- Eliminar tabla empresas vacía que puede causar conflictos con empresa_config
-- Solo mantener empresa_config que es la tabla principal

DROP TABLE IF EXISTS empresas CASCADE;
