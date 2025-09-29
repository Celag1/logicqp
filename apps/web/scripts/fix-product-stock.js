const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NzQ4NzQsImV4cCI6MjA1MTA1MDg3NH0.ZPEH3OY7M7B7BHQU53OF55BUPSHLZPDN';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixProductStock() {
  console.log('🔍 Verificando datos de productos y lotes...');

  try {
    // 1. Verificar productos
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('*')
      .eq('activo', true);

    if (productosError) {
      console.error('❌ Error obteniendo productos:', productosError);
      return;
    }

    console.log(`📦 Productos encontrados: ${productos.length}`);

    // 2. Verificar lotes
    const { data: lotes, error: lotesError } = await supabase
      .from('lotes')
      .select('*');

    if (lotesError) {
      console.error('❌ Error obteniendo lotes:', lotesError);
      return;
    }

    console.log(`📋 Lotes encontrados: ${lotes.length}`);

    // 3. Mostrar productos sin lotes
    const productosSinLotes = productos.filter(p => !lotes.some(l => l.producto_id === p.id));
    console.log(`⚠️ Productos sin lotes: ${productosSinLotes.length}`);

    if (productosSinLotes.length > 0) {
      console.log('📝 Creando lotes para productos sin stock...');
      
      for (const producto of productosSinLotes) {
        const { error: insertError } = await supabase
          .from('lotes')
          .insert({
            producto_id: producto.id,
            numero_lote: `LOTE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            cantidad_inicial: 100,
            cantidad_disponible: 100,
            precio_compra: producto.precio * 0.7, // 70% del precio de venta
            fecha_vencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 año
            activo: true
          });

        if (insertError) {
          console.error(`❌ Error creando lote para producto ${producto.nombre}:`, insertError);
        } else {
          console.log(`✅ Lote creado para producto: ${producto.nombre}`);
        }
      }
    }

    // 4. Verificar stock total por producto
    console.log('\n📊 Verificando stock total por producto:');
    
    for (const producto of productos) {
      const lotesProducto = lotes.filter(l => l.producto_id === producto.id);
      const stockTotal = lotesProducto.reduce((total, lote) => total + (lote.cantidad_disponible || 0), 0);
      
      console.log(`- ${producto.nombre}: ${stockTotal} unidades (${lotesProducto.length} lotes)`);
    }

    console.log('\n✅ Verificación completada');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el script
fixProductStock();
