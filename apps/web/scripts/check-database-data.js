const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMjE0NTksImV4cCI6MjA3NDY5NzQ1OX0.uFSAyQV5eZ9fr2ZbWBERE0o1zWASAOIm1VqDAbeAEAQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseData() {
  console.log('🔍 Verificando datos en todas las tablas...\n');

  try {
    // 1. Verificar productos
    console.log('📦 PRODUCTOS:');
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('id, nombre, activo, precio')
      .eq('activo', true);

    if (productosError) {
      console.error('❌ Error:', productosError);
    } else {
      console.log(`✅ Productos activos: ${productos.length}`);
      productos.forEach(p => console.log(`  - ${p.nombre} (ID: ${p.id}, Precio: $${p.precio})`));
    }

    // 2. Verificar lotes
    console.log('\n📋 LOTES:');
    const { data: lotes, error: lotesError } = await supabase
      .from('lotes')
      .select('id, producto_id, numero_lote, cantidad_disponible, precio_compra, activo');

    if (lotesError) {
      console.error('❌ Error:', lotesError);
    } else {
      console.log(`✅ Lotes totales: ${lotes.length}`);
      lotes.forEach(l => console.log(`  - Lote ${l.numero_lote} (Producto ID: ${l.producto_id}, Stock: ${l.cantidad_disponible})`));
    }

    // 3. Verificar categorías
    console.log('\n🏷️ CATEGORÍAS:');
    const { data: categorias, error: categoriasError } = await supabase
      .from('categorias')
      .select('id, nombre, activo');

    if (categoriasError) {
      console.error('❌ Error:', categoriasError);
    } else {
      console.log(`✅ Categorías: ${categorias.length}`);
      categorias.forEach(c => console.log(`  - ${c.nombre} (ID: ${c.id}, Activo: ${c.activo})`));
    }

    // 4. Verificar proveedores
    console.log('\n🏢 PROVEEDORES:');
    const { data: proveedores, error: proveedoresError } = await supabase
      .from('proveedores')
      .select('id, nombre, activo');

    if (proveedoresError) {
      console.error('❌ Error:', proveedoresError);
    } else {
      console.log(`✅ Proveedores: ${proveedores.length}`);
      proveedores.forEach(p => console.log(`  - ${p.nombre} (ID: ${p.id}, Activo: ${p.activo})`));
    }

    // 5. Verificar profiles
    console.log('\n👥 PROFILES:');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, nombre, rol, activo');

    if (profilesError) {
      console.error('❌ Error:', profilesError);
    } else {
      console.log(`✅ Usuarios: ${profiles.length}`);
      profiles.forEach(p => console.log(`  - ${p.nombre} (${p.email}) - Rol: ${p.rol}`));
    }

    // 6. Análisis de stock
    console.log('\n📊 ANÁLISIS DE STOCK:');
    if (productos && lotes) {
      const productosConStock = productos.filter(p => 
        lotes.some(l => l.producto_id === p.id && l.cantidad_disponible > 0)
      );
      
      console.log(`✅ Productos con stock: ${productosConStock.length}/${productos.length}`);
      
      const productosSinStock = productos.filter(p => 
        !lotes.some(l => l.producto_id === p.id && l.cantidad_disponible > 0)
      );
      
      if (productosSinStock.length > 0) {
        console.log('⚠️ Productos sin stock:');
        productosSinStock.forEach(p => console.log(`  - ${p.nombre} (ID: ${p.id})`));
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el script
checkDatabaseData();
