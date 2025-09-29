const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMjE0NTksImV4cCI6MjA3NDY5NzQ1OX0.uFSAyQV5eZ9fr2ZbWBERE0o1zWASAOIm1VqDAbeAEAQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createProductLots() {
  console.log('🏭 Creando lotes para todos los productos...\n');

  try {
    // 1. Obtener todos los productos activos
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('id, nombre, precio')
      .eq('activo', true);

    if (productosError) {
      console.error('❌ Error obteniendo productos:', productosError);
      return;
    }

    console.log(`📦 Productos encontrados: ${productos.length}`);

    // 2. Crear lotes para cada producto
    for (const producto of productos) {
      console.log(`\n🔄 Procesando: ${producto.nombre}`);
      
      // Crear múltiples lotes para cada producto
      const lotes = [
        {
          producto_id: producto.id,
          numero_lote: `LOTE-${producto.id}-001`,
          cantidad_inicial: 100,
          cantidad_disponible: 100,
          precio_compra: producto.precio * 0.6, // 60% del precio de venta
          fecha_vencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 año
          activo: true
        },
        {
          producto_id: producto.id,
          numero_lote: `LOTE-${producto.id}-002`,
          cantidad_inicial: 50,
          cantidad_disponible: 50,
          precio_compra: producto.precio * 0.65, // 65% del precio de venta
          fecha_vencimiento: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString(), // 2 años
          activo: true
        }
      ];

      for (const lote of lotes) {
        const { error: insertError } = await supabase
          .from('lotes')
          .insert(lote);

        if (insertError) {
          console.error(`❌ Error creando lote ${lote.numero_lote}:`, insertError);
        } else {
          console.log(`✅ Lote creado: ${lote.numero_lote} (Stock: ${lote.cantidad_disponible})`);
        }
      }
    }

    // 3. Verificar el resultado
    console.log('\n📊 Verificando stock total:');
    
    const { data: lotesCreados, error: lotesError } = await supabase
      .from('lotes')
      .select('producto_id, numero_lote, cantidad_disponible');

    if (lotesError) {
      console.error('❌ Error verificando lotes:', lotesError);
    } else {
      console.log(`✅ Total de lotes creados: ${lotesCreados.length}`);
      
      // Agrupar por producto
      const stockPorProducto = {};
      lotesCreados.forEach(lote => {
        if (!stockPorProducto[lote.producto_id]) {
          stockPorProducto[lote.producto_id] = 0;
        }
        stockPorProducto[lote.producto_id] += lote.cantidad_disponible;
      });

      console.log('\n📦 Stock por producto:');
      for (const [productoId, stock] of Object.entries(stockPorProducto)) {
        const producto = productos.find(p => p.id == productoId);
        console.log(`  - ${producto?.nombre}: ${stock} unidades`);
      }
    }

    console.log('\n🎉 ¡Lotes creados exitosamente!');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el script
createProductLots();
