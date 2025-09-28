const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'http://localhost:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMissingData() {
  console.log('🔍 Verificando datos faltantes en las tablas...\n');

  const tables = [
    'empresa_config',
    'profiles', 
    'categorias',
    'proveedores',
    'productos',
    'inventario',
    'ventas',
    'venta_items'
  ];

  for (const table of tables) {
    try {
      console.log(`📊 Verificando tabla: ${table}`);
      
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' });

      if (error) {
        console.error(`❌ Error en tabla ${table}:`, error.message);
        continue;
      }

      const recordCount = count || data?.length || 0;
      console.log(`   📈 Registros encontrados: ${recordCount}`);

      if (recordCount === 0) {
        console.log(`   ⚠️  TABLA VACÍA: ${table}`);
      } else if (recordCount < 5) {
        console.log(`   ⚠️  POCOS DATOS: ${table} (${recordCount} registros)`);
      } else {
        console.log(`   ✅ OK: ${table} (${recordCount} registros)`);
      }

      // Mostrar algunos datos de ejemplo si existen
      if (data && data.length > 0) {
        console.log(`   📋 Primeros registros:`);
        data.slice(0, 2).forEach((record, index) => {
          console.log(`      ${index + 1}. ${JSON.stringify(record, null, 2).substring(0, 100)}...`);
        });
      }

      console.log('');

    } catch (error) {
      console.error(`❌ Error verificando tabla ${table}:`, error.message);
    }
  }

  // Verificar tablas específicas que deberían tener datos
  console.log('🎯 Verificaciones específicas:\n');

  // 1. Verificar empresa_config
  const { data: empresaData } = await supabase.from('empresa_config').select('*');
  if (!empresaData || empresaData.length === 0) {
    console.log('❌ FALTA: Datos de configuración de empresa');
  } else {
    console.log('✅ OK: Configuración de empresa presente');
  }

  // 2. Verificar categorías
  const { data: categoriasData } = await supabase.from('categorias').select('*');
  if (!categoriasData || categoriasData.length === 0) {
    console.log('❌ FALTA: Categorías de productos');
  } else {
    console.log(`✅ OK: ${categoriasData.length} categorías presentes`);
  }

  // 3. Verificar proveedores
  const { data: proveedoresData } = await supabase.from('proveedores').select('*');
  if (!proveedoresData || proveedoresData.length === 0) {
    console.log('❌ FALTA: Proveedores');
  } else {
    console.log(`✅ OK: ${proveedoresData.length} proveedores presentes`);
  }

  // 4. Verificar productos
  const { data: productosData } = await supabase.from('productos').select('*');
  if (!productosData || productosData.length === 0) {
    console.log('❌ FALTA: Productos');
  } else {
    console.log(`✅ OK: ${productosData.length} productos presentes`);
  }

  // 5. Verificar inventario
  const { data: inventarioData } = await supabase.from('inventario').select('*');
  if (!inventarioData || inventarioData.length === 0) {
    console.log('❌ FALTA: Inventario');
  } else {
    console.log(`✅ OK: ${inventarioData.length} registros de inventario presentes`);
  }

  console.log('\n🏁 Verificación completada');
}

checkMissingData().catch(console.error);
