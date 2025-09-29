const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMjE0NTksImV4cCI6MjA3NDY5NzQ1OX0.uFSAyQV5eZ9fr2ZbWBERE0o1zWASAOIm1VqDAbeAEAQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProductsStructure() {
  console.log('🔍 Verificando estructura de tabla productos...\n');

  try {
    // 1. Obtener un producto para ver su estructura
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('*')
      .limit(1);

    if (productosError) {
      console.error('❌ Error obteniendo productos:', productosError);
      return;
    }

    if (productos && productos.length > 0) {
      console.log('📊 Estructura de tabla productos:');
      const producto = productos[0];
      Object.keys(producto).forEach(key => {
        console.log(`  - ${key}: ${typeof producto[key]} = ${producto[key]}`);
      });
    } else {
      console.log('⚠️ No se encontraron productos');
    }

    // 2. Verificar si existe columna de imagen
    const { data: allProductos, error: allError } = await supabase
      .from('productos')
      .select('id, nombre, imagen_url, foto_url, image_url, url_imagen')
      .limit(1);

    if (allError) {
      console.log('❌ Error verificando columnas de imagen:', allError.message);
    } else {
      console.log('\n🖼️ Columnas de imagen disponibles:');
      if (allProductos && allProductos.length > 0) {
        const producto = allProductos[0];
        Object.keys(producto).forEach(key => {
          if (key.includes('imagen') || key.includes('foto') || key.includes('image') || key.includes('url')) {
            console.log(`  ✅ ${key}: ${producto[key] || 'null'}`);
          }
        });
      }
    }

    // 3. Mostrar productos actuales
    console.log('\n📦 Productos actuales:');
    const { data: todosProductos, error: todosError } = await supabase
      .from('productos')
      .select('id, nombre, activo')
      .eq('activo', true);

    if (todosError) {
      console.error('❌ Error obteniendo todos los productos:', todosError);
    } else {
      todosProductos.forEach(p => console.log(`  - ${p.nombre} (ID: ${p.id})`));
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el script
checkProductsStructure();
