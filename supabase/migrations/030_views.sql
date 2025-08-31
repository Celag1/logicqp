-- Vista del kardex de productos
CREATE OR REPLACE VIEW vw_kardex_producto AS
SELECT 
  p.id as producto_id,
  p.nombre as producto_nombre,
  p.sku,
  p.barcode,
  c.nombre as categoria_nombre,
  COALESCE(SUM(CASE WHEN l.fecha_vencimiento >= CURRENT_DATE THEN l.cantidad ELSE 0 END), 0) as stock_actual,
  p.stock_minimo,
  CASE 
    WHEN COALESCE(SUM(CASE WHEN l.fecha_vencimiento >= CURRENT_DATE THEN l.cantidad ELSE 0 END), 0) <= p.stock_minimo THEN 'CRÍTICO'
    WHEN COALESCE(SUM(CASE WHEN l.fecha_vencimiento >= CURRENT_DATE THEN l.cantidad ELSE 0 END), 0) <= p.stock_minimo * 2 THEN 'BAJO'
    ELSE 'NORMAL'
  END as estado_stock,
  MIN(l.fecha_vencimiento) as proximo_vencimiento,
  COUNT(DISTINCT l.id) as total_lotes,
  AVG(l.precio_compra) as precio_compra_promedio,
  p.precio as precio_venta
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN lotes l ON p.id = l.producto_id
GROUP BY p.id, p.nombre, p.sku, p.barcode, c.nombre, p.stock_minimo, p.precio;

-- Vista de ventas mensuales
CREATE OR REPLACE VIEW vw_ventas_mensuales AS
SELECT 
  DATE_TRUNC('month', o.created_at) as mes,
  EXTRACT(YEAR FROM o.created_at) as año,
  EXTRACT(MONTH FROM o.created_at) as mes_numero,
  COUNT(DISTINCT o.id) as total_ordenes,
  COUNT(DISTINCT o.cliente_id) as clientes_unicos,
  SUM(o.total) as ventas_totales,
  AVG(o.total) as promedio_orden,
  SUM(oi.cantidad) as productos_vendidos
FROM ordenes o
JOIN orden_items oi ON o.id = oi.orden_id
WHERE o.estado NOT IN ('cancelada')
GROUP BY DATE_TRUNC('month', o.created_at), EXTRACT(YEAR FROM o.created_at), EXTRACT(MONTH FROM o.created_at)
ORDER BY mes DESC;

-- Vista de top productos
CREATE OR REPLACE VIEW vw_top_productos AS
SELECT 
  p.id as producto_id,
  p.nombre as producto_nombre,
  p.sku,
  c.nombre as categoria_nombre,
  SUM(oi.cantidad) as cantidad_vendida,
  SUM(oi.cantidad * oi.precio_unitario) as total_ventas,
  COUNT(DISTINCT o.id) as ordenes_con_producto,
  AVG(oi.precio_unitario) as precio_promedio
FROM productos p
JOIN orden_items oi ON p.id = oi.producto_id
JOIN ordenes o ON oi.orden_id = o.id
JOIN categorias c ON p.categoria_id = c.id
WHERE o.estado NOT IN ('cancelada')
  AND o.created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY p.id, p.nombre, p.sku, c.nombre
ORDER BY cantidad_vendida DESC;

-- Vista de stock crítico
CREATE OR REPLACE VIEW vw_stock_critico AS
SELECT 
  p.id as producto_id,
  p.nombre as producto_nombre,
  p.sku,
  c.nombre as categoria_nombre,
  COALESCE(SUM(CASE WHEN l.fecha_vencimiento >= CURRENT_DATE THEN l.cantidad ELSE 0 END), 0) as stock_actual,
  p.stock_minimo,
  p.stock_minimo - COALESCE(SUM(CASE WHEN l.fecha_vencimiento >= CURRENT_DATE THEN l.cantidad ELSE 0 END), 0) as faltante,
  MIN(l.fecha_vencimiento) as proximo_vencimiento,
  COUNT(DISTINCT l.id) as total_lotes
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN lotes l ON p.id = l.producto_id
GROUP BY p.id, p.nombre, p.sku, c.nombre, p.stock_minimo
HAVING COALESCE(SUM(CASE WHEN l.fecha_vencimiento >= CURRENT_DATE THEN l.cantidad ELSE 0 END), 0) <= p.stock_minimo
ORDER BY faltante DESC;

-- Vista de rotación de inventario
CREATE OR REPLACE VIEW vw_rotacion AS
SELECT 
  p.id as producto_id,
  p.nombre as producto_nombre,
  p.sku,
  c.nombre as categoria_nombre,
  COALESCE(SUM(CASE WHEN l.fecha_vencimiento >= CURRENT_DATE THEN l.cantidad ELSE 0 END), 0) as stock_actual,
  COALESCE(SUM(CASE WHEN l.fecha_vencimiento >= CURRENT_DATE THEN l.cantidad * l.precio_compra ELSE 0 END), 0) as valor_stock,
  COALESCE(SUM(CASE WHEN o.created_at >= CURRENT_DATE - INTERVAL '12 months' THEN oi.cantidad ELSE 0 END), 0) as ventas_12_meses,
  CASE 
    WHEN COALESCE(SUM(CASE WHEN l.fecha_vencimiento >= CURRENT_DATE THEN l.cantidad ELSE 0 END), 0) > 0 
    THEN COALESCE(SUM(CASE WHEN o.created_at >= CURRENT_DATE - INTERVAL '12 months' THEN oi.cantidad ELSE 0 END), 0)::DECIMAL / 
         COALESCE(SUM(CASE WHEN l.fecha_vencimiento >= CURRENT_DATE THEN l.cantidad ELSE 0 END), 0)::DECIMAL
    ELSE 0 
  END as ratio_rotacion,
  CASE 
    WHEN COALESCE(SUM(CASE WHEN l.fecha_vencimiento >= CURRENT_DATE THEN l.cantidad ELSE 0 END), 0) > 0 
    THEN 12 / NULLIF(COALESCE(SUM(CASE WHEN o.created_at >= CURRENT_DATE - INTERVAL '12 months' THEN oi.cantidad ELSE 0 END), 0)::DECIMAL / 
         COALESCE(SUM(CASE WHEN l.fecha_vencimiento >= CURRENT_DATE THEN l.cantidad ELSE 0 END), 0)::DECIMAL, 0)
    ELSE NULL 
  END as meses_rotacion
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN lotes l ON p.id = l.producto_id
LEFT JOIN orden_items oi ON p.id = oi.producto_id
LEFT JOIN ordenes o ON oi.orden_id = o.id AND o.estado NOT IN ('cancelada')
GROUP BY p.id, p.nombre, p.sku, c.nombre
ORDER BY ratio_rotacion DESC;

-- Vista de compras vs ventas
CREATE OR REPLACE VIEW vw_compras_vs_ventas AS
SELECT 
  DATE_TRUNC('month', COALESCE(c.fecha, o.created_at::DATE)) as mes,
  EXTRACT(YEAR FROM COALESCE(c.fecha, o.created_at::DATE)) as año,
  EXTRACT(MONTH FROM COALESCE(c.fecha, o.created_at::DATE)) as mes_numero,
  COALESCE(SUM(c.total), 0) as compras_totales,
  COALESCE(SUM(o.total), 0) as ventas_totales,
  COALESCE(SUM(o.total), 0) - COALESCE(SUM(c.total), 0) as diferencia,
  CASE 
    WHEN COALESCE(SUM(c.total), 0) > 0 
    THEN (COALESCE(SUM(o.total), 0) / COALESCE(SUM(c.total), 0)) * 100
    ELSE 0 
  END as margen_porcentaje
FROM (
  SELECT fecha, total FROM compras WHERE estado = 'recibida'
  UNION ALL
  SELECT created_at::DATE, total FROM ordenes WHERE estado NOT IN ('cancelada')
) as combined_data
LEFT JOIN compras c ON combined_data.fecha = c.fecha AND c.estado = 'recibida'
LEFT JOIN ordenes o ON combined_data.fecha = o.created_at::DATE AND o.estado NOT IN ('cancelada')
GROUP BY DATE_TRUNC('month', COALESCE(c.fecha, o.created_at::DATE)), 
         EXTRACT(YEAR FROM COALESCE(c.fecha, o.created_at::DATE)), 
         EXTRACT(MONTH FROM COALESCE(c.fecha, o.created_at::DATE))
ORDER BY mes DESC;

-- Vista de productos por vencer
CREATE OR REPLACE VIEW vw_productos_por_vencer AS
SELECT 
  p.id as producto_id,
  p.nombre as producto_nombre,
  p.sku,
  c.nombre as categoria_nombre,
  l.numero_lote,
  l.fecha_vencimiento,
  l.cantidad as stock_lote,
  l.precio_compra,
  p.precio as precio_venta,
  l.fecha_vencimiento - CURRENT_DATE as dias_para_vencer,
  CASE 
    WHEN l.fecha_vencimiento - CURRENT_DATE <= 30 THEN 'CRÍTICO'
    WHEN l.fecha_vencimiento - CURRENT_DATE <= 90 THEN 'ADVERTENCIA'
    ELSE 'NORMAL'
  END as estado_vencimiento
FROM productos p
JOIN lotes l ON p.id = l.producto_id
JOIN categorias c ON p.categoria_id = c.id
WHERE l.fecha_vencimiento >= CURRENT_DATE
  AND l.cantidad > 0
ORDER BY l.fecha_vencimiento ASC;

-- Crear índices para las vistas más utilizadas
CREATE INDEX IF NOT EXISTS idx_kardex_producto_id ON productos(id);
CREATE INDEX IF NOT EXISTS idx_ventas_mensuales_fecha ON ordenes(created_at);
CREATE INDEX IF NOT EXISTS idx_top_productos_ventas ON orden_items(producto_id);
CREATE INDEX IF NOT EXISTS idx_stock_critico_stock ON productos(stock_minimo);
CREATE INDEX IF NOT EXISTS idx_rotacion_stock ON lotes(producto_id, fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_compras_vs_ventas_fecha ON compras(fecha);
CREATE INDEX IF NOT EXISTS idx_productos_por_vencer_fecha ON lotes(fecha_vencimiento);
