-- =====================================================
-- LOGICQP - VERIFICACIÓN COMPLETA DEL SISTEMA
-- =====================================================
-- Este script verifica que todo esté funcionando correctamente
-- =====================================================

-- =====================================================
-- 1. VERIFICAR ESTRUCTURA DE LA BASE DE DATOS
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '=== VERIFICACIÓN DE ESTRUCTURA ===';
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
    RAISE NOTICE '✅ Tabla profiles: EXISTE';
  ELSE
    RAISE NOTICE '❌ Tabla profiles: NO EXISTE';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'categorias') THEN
    RAISE NOTICE '✅ Tabla categorias: EXISTE';
  ELSE
    RAISE NOTICE '❌ Tabla categorias: NO EXISTE';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'productos') THEN
    RAISE NOTICE '✅ Tabla productos: EXISTE';
  ELSE
    RAISE NOTICE '❌ Tabla productos: NO EXISTE';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'proveedores') THEN
    RAISE NOTICE '✅ Tabla proveedores: EXISTE';
  ELSE
    RAISE NOTICE '❌ Tabla proveedores: NO EXISTE';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'lotes') THEN
    RAISE NOTICE '✅ Tabla lotes: EXISTE';
  ELSE
    RAISE NOTICE '❌ Tabla lotes: NO EXISTE';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'permisos') THEN
    RAISE NOTICE '✅ Tabla permisos: EXISTE';
  ELSE
    RAISE NOTICE '❌ Tabla permisos: NO EXISTE';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'empresa_config') THEN
    RAISE NOTICE '✅ Tabla empresa_config: EXISTE';
  ELSE
    RAISE NOTICE '❌ Tabla empresa_config: NO EXISTE';
  END IF;
END $$;

-- =====================================================
-- 2. VERIFICAR CAMPOS Y ESTRUCTURA DE TABLAS
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '=== VERIFICACIÓN DE CAMPOS ===';
  
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'productos' AND column_name = 'marca') THEN
    RAISE NOTICE '✅ Campo marca en productos: EXISTE';
  ELSE
    RAISE NOTICE '❌ Campo marca en productos: NO EXISTE';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'rol') THEN
    RAISE NOTICE '✅ Campo rol en profiles: EXISTE';
  ELSE
    RAISE NOTICE '❌ Campo rol en profiles: NO EXISTE';
  END IF;
END $$;

-- =====================================================
-- 3. VERIFICAR DATOS INSERTADOS
-- =====================================================

DO $$
DECLARE
  cat_count INTEGER;
  prov_count INTEGER;
  prod_count INTEGER;
  lotes_count INTEGER;
  perm_count INTEGER;
BEGIN
  RAISE NOTICE '=== VERIFICACIÓN DE DATOS ===';
  
  SELECT COUNT(*) INTO cat_count FROM categorias;
  IF cat_count = 15 THEN
    RAISE NOTICE '✅ Categorías: % (CORRECTO)', cat_count;
  ELSE
    RAISE NOTICE '❌ Categorías: % (ESPERADO: 15)', cat_count;
  END IF;
  
  SELECT COUNT(*) INTO prov_count FROM proveedores;
  IF prov_count = 21 THEN
    RAISE NOTICE '✅ Proveedores: % (CORRECTO)', prov_count;
  ELSE
    RAISE NOTICE '❌ Proveedores: % (ESPERADO: 21)', prov_count;
  END IF;
  
  SELECT COUNT(*) INTO prod_count FROM productos;
  IF prod_count = 30 THEN
    RAISE NOTICE '✅ Productos: % (CORRECTO)', prod_count;
  ELSE
    RAISE NOTICE '❌ Productos: % (ESPERADO: 30)', prod_count;
  END IF;
  
  SELECT COUNT(*) INTO lotes_count FROM lotes;
  IF lotes_count = 30 THEN
    RAISE NOTICE '✅ Lotes: % (CORRECTO)', lotes_count;
  ELSE
    RAISE NOTICE '❌ Lotes: % (ESPERADO: 30)', lotes_count;
  END IF;
  
  SELECT COUNT(*) INTO perm_count FROM permisos;
  IF perm_count > 0 THEN
    RAISE NOTICE '✅ Permisos: % (EXISTEN)', perm_count;
  ELSE
    RAISE NOTICE '❌ Permisos: 0 (NO EXISTEN)';
  END IF;
END $$;

-- =====================================================
-- 4. VERIFICAR PRODUCTOS CORREGIDOS
-- =====================================================

DO $$
DECLARE
  qualipharm_count INTEGER;
  generico_count INTEGER;
  qualipharm_prov_count INTEGER;
BEGIN
  RAISE NOTICE '=== VERIFICACIÓN DE PRODUCTOS ===';
  
  SELECT COUNT(*) INTO qualipharm_count FROM productos WHERE marca = 'Qualipharm';
  SELECT COUNT(*) INTO generico_count FROM productos WHERE marca = 'Genérico';
  
  IF qualipharm_count = 20 THEN
    RAISE NOTICE '✅ Productos Qualipharm: % (CORRECTO)', qualipharm_count;
  ELSE
    RAISE NOTICE '❌ Productos Qualipharm: % (ESPERADO: 20)', qualipharm_count;
  END IF;
  
  IF generico_count = 10 THEN
    RAISE NOTICE '✅ Productos Genéricos: % (CORRECTO)', generico_count;
  ELSE
    RAISE NOTICE '❌ Productos Genéricos: % (ESPERADO: 10)', generico_count;
  END IF;
  
  SELECT COUNT(*) INTO qualipharm_prov_count 
  FROM productos p 
  JOIN proveedores pr ON p.proveedor_id = pr.id 
  WHERE p.marca = 'Qualipharm' AND pr.nombre LIKE '%Qualipharm%';
  
  IF qualipharm_prov_count = 20 THEN
    RAISE NOTICE '✅ Productos Qualipharm con proveedor correcto: % (CORRECTO)', qualipharm_prov_count;
  ELSE
    RAISE NOTICE '❌ Productos Qualipharm con proveedor correcto: % (ESPERADO: 20)', qualipharm_prov_count;
  END IF;
END $$;

-- =====================================================
-- 5. VERIFICAR NOMBRES DE PRODUCTOS
-- =====================================================

DO $$
DECLARE
  wrong_names_count INTEGER;
BEGIN
  RAISE NOTICE '=== VERIFICACIÓN DE NOMBRES ===';
  
  SELECT COUNT(*) INTO wrong_names_count 
  FROM productos 
  WHERE nombre LIKE '%Quali%';
  
  IF wrong_names_count = 0 THEN
    RAISE NOTICE '✅ Nombres de productos: CORRECTOS (sin "Quali")';
  ELSE
    RAISE NOTICE '❌ Nombres de productos: % contienen "Quali"', wrong_names_count;
  END IF;
  
  IF EXISTS (SELECT 1 FROM productos WHERE nombre = 'Paracetamol 500mg') THEN
    RAISE NOTICE '✅ Paracetamol 500mg: CORRECTO';
  ELSE
    RAISE NOTICE '❌ Paracetamol 500mg: NO ENCONTRADO';
  END IF;
  
  IF EXISTS (SELECT 1 FROM productos WHERE nombre = 'Ibuprofeno 400mg') THEN
    RAISE NOTICE '✅ Ibuprofeno 400mg: CORRECTO';
  ELSE
    RAISE NOTICE '❌ Ibuprofeno 400mg: NO ENCONTRADO';
  END IF;
END $$;

-- =====================================================
-- 6. VERIFICAR PROVEEDOR QUALIPHARM
-- =====================================================

DO $$
DECLARE
  qualipharm_prov_id INTEGER;
BEGIN
  RAISE NOTICE '=== VERIFICACIÓN DE PROVEEDOR QUALIPHARM ===';
  
  SELECT id INTO qualipharm_prov_id 
  FROM proveedores 
  WHERE nombre LIKE '%Qualipharm%';
  
  IF qualipharm_prov_id IS NOT NULL THEN
    RAISE NOTICE '✅ Proveedor Qualipharm: ID % (EXISTE)', qualipharm_prov_id;
  ELSE
    RAISE NOTICE '❌ Proveedor Qualipharm: NO EXISTE';
  END IF;
END $$;

-- =====================================================
-- 7. VERIFICAR FUNCIONES Y VISTAS
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '=== VERIFICACIÓN DE FUNCIONES ===';
  
  IF EXISTS (SELECT FROM information_schema.routines WHERE routine_name = 'fn_my_role') THEN
    RAISE NOTICE '✅ Función fn_my_role: EXISTE';
  ELSE
    RAISE NOTICE '❌ Función fn_my_role: NO EXISTE';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.routines WHERE routine_name = 'fn_checkout') THEN
    RAISE NOTICE '✅ Función fn_checkout: EXISTE';
  ELSE
    RAISE NOTICE '❌ Función fn_checkout: NO EXISTE';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.routines WHERE routine_name = 'fn_set_user_role') THEN
    RAISE NOTICE '✅ Función fn_set_user_role: EXISTE';
  ELSE
    RAISE NOTICE '❌ Función fn_set_user_role: NO EXISTE';
  END IF;
END $$;

-- =====================================================
-- 8. VERIFICAR VISTAS
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '=== VERIFICACIÓN DE VISTAS ===';
  
  IF EXISTS (SELECT FROM information_schema.views WHERE table_name = 'vw_kardex_producto') THEN
    RAISE NOTICE '✅ Vista vw_kardex_producto: EXISTE';
  ELSE
    RAISE NOTICE '❌ Vista vw_kardex_producto: NO EXISTE';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.views WHERE table_name = 'vw_ventas_mensuales') THEN
    RAISE NOTICE '✅ Vista vw_ventas_mensuales: EXISTE';
  ELSE
    RAISE NOTICE '❌ Vista vw_ventas_mensuales: NO EXISTE';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.views WHERE table_name = 'vw_top_productos') THEN
    RAISE NOTICE '✅ Vista vw_top_productos: EXISTE';
  ELSE
    RAISE NOTICE '❌ Vista vw_top_productos: NO EXISTE';
  END IF;
END $$;

-- =====================================================
-- 9. VERIFICAR TRIGGERS
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '=== VERIFICACIÓN DE TRIGGERS ===';
  
  IF EXISTS (SELECT FROM information_schema.triggers WHERE trigger_name = 'tg_profiles_on_signup') THEN
    RAISE NOTICE '✅ Trigger tg_profiles_on_signup: EXISTE';
  ELSE
    RAISE NOTICE '❌ Trigger tg_profiles_on_signup: NO EXISTE';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.triggers WHERE trigger_name = 'tg_auditoria_on_change') THEN
    RAISE NOTICE '✅ Trigger tg_auditoria_on_change: EXISTE';
  ELSE
    RAISE NOTICE '❌ Trigger tg_auditoria_on_change: NO EXISTE';
  END IF;
END $$;

-- =====================================================
-- 10. VERIFICAR RLS (ROW LEVEL SECURITY)
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '=== VERIFICACIÓN DE RLS ===';
  
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'productos' AND rowsecurity = true) THEN
    RAISE NOTICE '✅ RLS en productos: HABILITADO';
  ELSE
    RAISE NOTICE '❌ RLS en productos: NO HABILITADO';
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'profiles' AND rowsecurity = true) THEN
    RAISE NOTICE '✅ RLS en profiles: HABILITADO';
  ELSE
    RAISE NOTICE '❌ RLS en profiles: NO HABILITADO';
  END IF;
END $$;

-- =====================================================
-- 11. VERIFICAR STORAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '=== VERIFICACIÓN DE STORAGE ===';
  
  IF EXISTS (SELECT FROM storage.buckets WHERE id = 'productos') THEN
    RAISE NOTICE '✅ Bucket productos: EXISTE';
  ELSE
    RAISE NOTICE '❌ Bucket productos: NO EXISTE';
  END IF;
END $$;

-- =====================================================
-- 12. VERIFICACIÓN FINAL Y RESUMEN
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '=== RESUMEN FINAL ===';
  RAISE NOTICE 'Si todos los ✅ están verdes, tu sistema LogicQP está PERFECTO';
  RAISE NOTICE 'Si hay ❌, necesitamos corregir esos elementos';
  RAISE NOTICE '=== VERIFICACIÓN COMPLETADA ===';
END $$;

-- =====================================================
-- 13. MOSTRAR DATOS DE EJEMPLO PARA VERIFICACIÓN VISUAL
-- =====================================================

SELECT 
  p.codigo,
  p.nombre,
  p.marca,
  p.precio,
  c.nombre as categoria,
  pr.nombre as proveedor
FROM productos p
JOIN categorias c ON p.categoria_id = c.id
JOIN proveedores pr ON p.proveedor_id = pr.id
ORDER BY p.marca, p.nombre
LIMIT 10;

SELECT 
  rol,
  COUNT(*) as total_permisos
FROM permisos 
GROUP BY rol 
ORDER BY rol;

-- =====================================================
-- ¡VERIFICACIÓN COMPLETA!
-- =====================================================
