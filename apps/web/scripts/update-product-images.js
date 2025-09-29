const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMjE0NTksImV4cCI6MjA3NDY5NzQ1OX0.uFSAyQV5eZ9fr2ZbWBERE0o1zWASAOIm1VqDAbeAEAQ';

const supabase = createClient(supabaseUrl, supabaseKey);

// URLs de imágenes reales de medicamentos farmacéuticos
const productImages = {
  'Amoxicilina 500mg': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&crop=center&q=80&auto=format&ixlib=rb-4.0.3',
  'Ibuprofeno 400mg': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center&q=80&auto=format&ixlib=rb-4.0.3',
  'Paracetamol 500mg': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop&crop=center&q=80&auto=format&ixlib=rb-4.0.3',
  'Vitamina C 1000mg': 'https://images.unsplash.com/photo-1550572017-edd951aa8713?w=400&h=400&fit=crop&crop=center&q=80&auto=format&ixlib=rb-4.0.3',
  'Losartán 50mg': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&crop=center&q=80&auto=format&ixlib=rb-4.0.3',
  'Hidrocortisona 1%': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center&q=80&auto=format&ixlib=rb-4.0.3',
  'Omeprazol 20mg': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop&crop=center&q=80&auto=format&ixlib=rb-4.0.3',
  'Salbutamol Inhalador': 'https://images.unsplash.com/photo-1550572017-edd951aa8713?w=400&h=400&fit=crop&crop=center&q=80&auto=format&ixlib=rb-4.0.3'
};

async function updateProductImages() {
  console.log('🖼️ Actualizando imágenes de productos...\n');

  try {
    // 1. Obtener todos los productos
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('id, nombre, imagen_url')
      .eq('activo', true);

    if (productosError) {
      console.error('❌ Error obteniendo productos:', productosError);
      return;
    }

    console.log(`📦 Productos encontrados: ${productos.length}`);

    // 2. Actualizar cada producto con su imagen correspondiente
    for (const producto of productos) {
      const imageUrl = productImages[producto.nombre];
      
      if (imageUrl) {
        console.log(`🔄 Actualizando: ${producto.nombre}`);
        console.log(`   Imagen actual: ${producto.imagen_url || 'Sin imagen'}`);
        console.log(`   Nueva imagen: ${imageUrl}`);

        const { error: updateError } = await supabase
          .from('productos')
          .update({ imagen_url: imageUrl })
          .eq('id', producto.id);

        if (updateError) {
          console.error(`❌ Error actualizando ${producto.nombre}:`, updateError);
        } else {
          console.log(`✅ Imagen actualizada para: ${producto.nombre}`);
        }
      } else {
        console.log(`⚠️ No se encontró imagen para: ${producto.nombre}`);
      }
    }

    // 3. Verificar las actualizaciones
    console.log('\n📊 Verificando actualizaciones:');
    const { data: productosActualizados, error: verifyError } = await supabase
      .from('productos')
      .select('id, nombre, imagen_url')
      .eq('activo', true);

    if (verifyError) {
      console.error('❌ Error verificando productos:', verifyError);
    } else {
      productosActualizados.forEach(producto => {
        console.log(`✅ ${producto.nombre}: ${producto.imagen_url ? 'Con imagen' : 'Sin imagen'}`);
      });
    }

    console.log('\n🎉 ¡Imágenes de productos actualizadas exitosamente!');
    console.log('🖼️ Las imágenes se reflejarán en el catálogo y otras páginas');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el script
updateProductImages();
