-- Agregar columnas para ventas online a la tabla compras existente
ALTER TABLE compras ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'proveedor' CHECK (tipo IN ('proveedor', 'cliente'));
ALTER TABLE compras ADD COLUMN IF NOT EXISTS cliente_email TEXT;
ALTER TABLE compras ADD COLUMN IF NOT EXISTS cliente_nombre TEXT;
ALTER TABLE compras ADD COLUMN IF NOT EXISTS cliente_telefono TEXT;
ALTER TABLE compras ADD COLUMN IF NOT EXISTS direccion_envio TEXT;
ALTER TABLE compras ADD COLUMN IF NOT EXISTS ciudad_envio TEXT;
ALTER TABLE compras ADD COLUMN IF NOT EXISTS notas_envio TEXT;
ALTER TABLE compras ADD COLUMN IF NOT EXISTS metodo_pago TEXT;
ALTER TABLE compras ADD COLUMN IF NOT EXISTS impuesto DECIMAL(10,2) DEFAULT 0;

-- Crear índices para mejorar el rendimiento de las ventas online
CREATE INDEX IF NOT EXISTS idx_compras_tipo ON compras(tipo);
CREATE INDEX IF NOT EXISTS idx_compras_cliente_email ON compras(cliente_email);
CREATE INDEX IF NOT EXISTS idx_compras_fecha_compra ON compras(fecha_compra);

-- Comentarios en las nuevas columnas
COMMENT ON COLUMN compras.tipo IS 'Tipo de compra: proveedor o cliente';
COMMENT ON COLUMN compras.cliente_email IS 'Email del cliente (solo para ventas online)';
COMMENT ON COLUMN compras.cliente_nombre IS 'Nombre del cliente (solo para ventas online)';
COMMENT ON COLUMN compras.cliente_telefono IS 'Teléfono del cliente (solo para ventas online)';
COMMENT ON COLUMN compras.direccion_envio IS 'Dirección de envío (solo para ventas online)';
COMMENT ON COLUMN compras.ciudad_envio IS 'Ciudad de envío (solo para ventas online)';
COMMENT ON COLUMN compras.notas_envio IS 'Notas adicionales para el envío (solo para ventas online)';
COMMENT ON COLUMN compras.metodo_pago IS 'Método de pago utilizado (solo para ventas online)';
COMMENT ON COLUMN compras.impuesto IS 'Impuesto aplicado (IVA)';
