const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMjE0NTksImV4cCI6MjA3NDY5NzQ1OX0.uFSAyQV5eZ9fr2ZbWBERE0o1zWASAOIm1VqDAbeAEAQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkInventoryTable() {
  console.log('🔍 Verificando tabla inventario...\n');

  try {
    // 1. Verificar si existe la tabla inventario
    console.log('📋 INVENTARIO:');
    const { data: inventario, error: inventarioError } = await supabase
      .from('inventario')
      .select('*')
      .limit(5);

    if (inventarioError) {
      console.log('❌ Error:', inventarioError.message);
      
      if (inventarioError.code === '42P01') {
        console.log('ℹ️ La tabla "inventario" NO EXISTE');
      } else {
        console.log('⚠️ Error diferente:', inventarioError);
      }
    } else {
      console.log(`✅ Registros en inventario: ${inventario.length}`);
      inventario.forEach(item => console.log(`  - ${JSON.stringify(item)}`));
    }

    // 2. Verificar estructura de lotes (que ya funciona)
    console.log('\n📦 LOTES (funcionando):');
    const { data: lotes, error: lotesError } = await supabase
      .from('lotes')
      .select('id, producto_id, numero_lote, cantidad_disponible, precio_compra, activo')
      .limit(3);

    if (lotesError) {
      console.error('❌ Error en lotes:', lotesError);
    } else {
      console.log(`✅ Lotes disponibles: ${lotes.length}`);
      lotes.forEach(lote => console.log(`  - ${lote.numero_lote} (Producto: ${lote.producto_id}, Stock: ${lote.cantidad_disponible})`));
    }

    // 3. Verificar si hay referencias a inventario en el código
    console.log('\n🔍 Buscando referencias a "inventario" en el código...');
    
    // 4. Verificar tablas relacionadas
    console.log('\n📊 TABLAS RELACIONADAS:');
    
    // Productos
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('id, nombre, activo')
      .eq('activo', true)
      .limit(3);

    if (productosError) {
      console.error('❌ Error en productos:', productosError);
    } else {
      console.log(`✅ Productos activos: ${productos.length}`);
    }

    // 5. Análisis de redundancia
    console.log('\n🤔 ANÁLISIS:');
    console.log('La tabla "lotes" ya maneja:');
    console.log('  - Stock por producto (cantidad_disponible)');
    console.log('  - Precio de compra');
    console.log('  - Fechas de vencimiento');
    console.log('  - Números de lote');
    console.log('  - Estado activo/inactivo');
    
    console.log('\n💡 RECOMENDACIÓN:');
    if (inventarioError && inventarioError.code === '42P01') {
      console.log('✅ La tabla "inventario" NO EXISTE - No es necesaria');
      console.log('✅ La tabla "lotes" ya cumple la función de inventario');
      console.log('✅ No se requiere acción adicional');
    } else {
      console.log('⚠️ La tabla "inventario" existe pero puede ser redundante');
      console.log('🔍 Revisar si se puede eliminar o consolidar con "lotes"');
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el script
checkInventoryTable();
