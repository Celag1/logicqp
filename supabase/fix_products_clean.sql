-- =====================================================
-- LOGICQP - CORRECCIÓN DE PRODUCTOS Y MARCAS
-- =====================================================
-- Este script corrige los nombres de productos y agrega marcas
-- =====================================================

-- PASO 1: Agregar campo marca si no existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'productos' AND column_name = 'marca') THEN
    ALTER TABLE productos ADD COLUMN marca TEXT DEFAULT 'Qualipharm';
    RAISE NOTICE 'Campo marca agregado a la tabla productos';
  ELSE
    RAISE NOTICE 'El campo marca ya existe';
  END IF;
END $$;

-- PASO 2: Actualizar productos con nombres corregidos y marcas
UPDATE productos SET 
  nombre = 'Paracetamol 500mg',
  marca = 'Qualipharm'
WHERE codigo = 'QPH-001';

UPDATE productos SET 
  nombre = 'Ibuprofeno 400mg',
  marca = 'Qualipharm'
WHERE codigo = 'QPH-002';

UPDATE productos SET 
  nombre = 'Amoxicilina 500mg',
  marca = 'Qualipharm'
WHERE codigo = 'QPH-003';

UPDATE productos SET 
  nombre = 'Loratadina 10mg',
  marca = 'Qualipharm'
WHERE codigo = 'QPH-004';

UPDATE productos SET 
  nombre = 'Vitamina C 1000mg',
  marca = 'Qualipharm'
WHERE codigo = 'QPH-005';

UPDATE productos SET 
  nombre = 'Omeprazol 20mg',
  marca = 'Qualipharm'
WHERE codigo = 'QPH-006';

UPDATE productos SET 
  nombre = 'Salbutamol 100mcg',
  marca = 'Qualipharm'
WHERE codigo = 'QPH-007';

UPDATE productos SET 
  nombre = 'Metformina 500mg',
  marca = 'Qualipharm'
WHERE codigo = 'QPH-008';

UPDATE productos SET 
  nombre = 'Atorvastatina 20mg',
  marca = 'Qualipharm'
WHERE codigo = 'QPH-009';

UPDATE productos SET 
  nombre = 'Losartán 50mg',
  marca = 'Qualipharm'
WHERE codigo = 'QPH-010';

UPDATE productos SET 
  nombre = 'Cetirizina 10mg',
  marca = 'Qualipharm'
WHERE codigo = 'QPH-011';

UPDATE productos SET 
  nombre = 'Diclofenaco 50mg',
  marca = 'Qualipharm'
WHERE codigo = 'QPH-012';

UPDATE productos SET 
  nombre = 'Azitromicina 500mg',
  marca = 'Qualipharm'
WHERE codigo = 'QPH-013';

UPDATE productos SET 
  nombre = 'Calcio + Vitamina D',
  marca = 'Qualipharm'
WHERE codigo = 'QPH-014';

UPDATE productos SET 
  nombre = 'Magnesio 400mg',
  marca = 'Qualipharm'
WHERE codigo = 'QPH-015';

UPDATE productos SET 
  nombre = 'Omega 3 1000mg',
  marca = 'Qualipharm'
WHERE codigo = 'QPH-016';

UPDATE productos SET 
  nombre = 'Probióticos 10B',
  marca = 'Qualipharm'
WHERE codigo = 'QPH-017';

UPDATE productos SET 
  nombre = 'Melatonina 3mg',
  marca = 'Qualipharm'
WHERE codigo = 'QPH-018';

UPDATE productos SET 
  nombre = 'Colágeno Hidrolizado',
  marca = 'Qualipharm'
WHERE codigo = 'QPH-019';

UPDATE productos SET 
  nombre = 'Jalea Real 1000mg',
  marca = 'Qualipharm'
WHERE codigo = 'QPH-020';

UPDATE productos SET 
  nombre = 'Ginkgo Biloba 120mg',
  marca = 'Genérico'
WHERE codigo = 'QPH-021';

UPDATE productos SET 
  nombre = 'Ginseng 500mg',
  marca = 'Genérico'
WHERE codigo = 'QPH-022';

UPDATE productos SET 
  nombre = 'Cúrcuma 500mg',
  marca = 'Genérico'
WHERE codigo = 'QPH-023';

UPDATE productos SET 
  nombre = 'Aceite de Coco 1000mg',
  marca = 'Genérico'
WHERE codigo = 'QPH-024';

UPDATE productos SET 
  nombre = 'Té Verde 500mg',
  marca = 'Genérico'
WHERE codigo = 'QPH-025';

UPDATE productos SET 
  nombre = 'Aloe Vera 500mg',
  marca = 'Genérico'
WHERE codigo = 'QPH-026';

UPDATE productos SET 
  nombre = 'Miel de Manuka',
  marca = 'Genérico'
WHERE codigo = 'QPH-027';

UPDATE productos SET 
  nombre = 'Aceite de Oliva Extra Virgen',
  marca = 'Genérico'
WHERE codigo = 'QPH-028';

UPDATE productos SET 
  nombre = 'Vinagre de Manzana',
  marca = 'Genérico'
WHERE codigo = 'QPH-029';

UPDATE productos SET 
  nombre = 'Sal Rosa del Himalaya',
  marca = 'Genérico'
WHERE codigo = 'QPH-030';

-- PASO 3: Crear proveedor Qualipharm si no existe
INSERT INTO proveedores (id, nombre, ruc, direccion, telefono, email, contacto)
VALUES (21, 'Qualipharm Laboratorio Farmacéutico', '1790012345021', 'Quito, Ecuador', '+593 2 123 4567', 'info@qualipharm.ec', 'Dr. Carlos Méndez')
ON CONFLICT (id) DO NOTHING;

-- PASO 4: Actualizar productos Qualipharm para que usen el proveedor Qualipharm
UPDATE productos 
SET proveedor_id = 21 
WHERE marca = 'Qualipharm';

-- PASO 5: Verificar cambios
DO $$
BEGIN
  RAISE NOTICE '=== VERIFICACIÓN DE CAMBIOS ===';
  RAISE NOTICE 'Productos Qualipharm: %', (SELECT COUNT(*) FROM productos WHERE marca = 'Qualipharm');
  RAISE NOTICE 'Productos Genéricos: %', (SELECT COUNT(*) FROM productos WHERE marca = 'Genérico');
  RAISE NOTICE 'Proveedor Qualipharm ID: %', (SELECT id FROM proveedores WHERE nombre LIKE '%Qualipharm%' LIMIT 1);
END $$;

-- PASO 6: Mostrar algunos productos de ejemplo
SELECT 
  p.codigo,
  p.nombre,
  p.marca,
  p.precio,
  pr.nombre as proveedor
FROM productos p
JOIN proveedores pr ON p.proveedor_id = pr.id
ORDER BY p.marca, p.nombre
LIMIT 10;

-- =====================================================
-- ¡CORRECCIÓN COMPLETADA!
-- =====================================================
-- Los productos ahora tienen nombres correctos y marcas apropiadas
-- =====================================================
