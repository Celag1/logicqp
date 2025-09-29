const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMjE0NTksImV4cCI6MjA3NDY5NzQ1OX0.uFSAyQV5eZ9fr2ZbWBERE0o1zWASAOIm1VqDAbeAEAQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeInventoryTable() {
  console.log('🗑️ Eliminando tabla inventario redundante...\n');

  try {
    // 1. Verificar si la tabla tiene datos
    const { data: inventarioData, error: checkError } = await supabase
      .from('inventario')
      .select('*')
      .limit(1);

    if (checkError) {
      console.log('❌ Error verificando tabla inventario:', checkError.message);
      return;
    }

    console.log(`📊 Registros en inventario: ${inventarioData.length}`);

    if (inventarioData.length > 0) {
      console.log('⚠️ La tabla tiene datos. ¿Deseas continuar? (Solo para desarrollo)');
      console.log('ℹ️ En producción, se recomienda hacer backup primero');
    }

    // 2. Eliminar la tabla (esto requiere permisos de administrador)
    console.log('\n🔧 Intentando eliminar tabla inventario...');
    console.log('ℹ️ Nota: Esto requiere permisos de administrador en Supabase');
    console.log('ℹ️ Si falla, elimina manualmente desde el dashboard de Supabase');
    
    // 3. Verificar que lotes funciona correctamente
    console.log('\n✅ Verificando que la tabla lotes funciona:');
    const { data: lotesData, error: lotesError } = await supabase
      .from('lotes')
      .select(`
        id,
        producto_id,
        numero_lote,
        cantidad_disponible,
        precio_compra,
        fecha_vencimiento,
        activo,
        productos(nombre)
      `)
      .limit(3);

    if (lotesError) {
      console.error('❌ Error en lotes:', lotesError);
    } else {
      console.log(`✅ Lotes funcionando correctamente: ${lotesData.length} registros`);
      lotesData.forEach(lote => {
        console.log(`  - ${lote.productos?.nombre}: ${lote.cantidad_disponible} unidades (${lote.numero_lote})`);
      });
    }

    // 4. Mostrar recomendaciones
    console.log('\n💡 RECOMENDACIONES:');
    console.log('1. La tabla "inventario" es redundante con "lotes"');
    console.log('2. La tabla "lotes" ya maneja todo el inventario');
    console.log('3. Para reportes, usar "lotes" en lugar de "inventario"');
    console.log('4. Actualizar reports-service.ts para usar "lotes"');
    
    console.log('\n🔧 ACCIONES REQUERIDAS:');
    console.log('1. Eliminar tabla "inventario" desde Supabase Dashboard');
    console.log('2. Actualizar reports-service.ts línea 183');
    console.log('3. Cambiar .from("inventario") por .from("lotes")');
    console.log('4. Ajustar campos según estructura de lotes');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el script
removeInventoryTable();
