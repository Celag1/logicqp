const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTEyMTQ1OSwiZXhwIjoyMDc0Njk3NDU5fQ.ds--rwknbADvlAUuRU0ypi0pwxr6Sd9Jr3CrPexxSsU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function insertTestData() {
  console.log('🚀 Insertando datos de prueba...');

  try {
    // 1. Insertar categorías
    console.log('\n1️⃣ Insertando categorías...');
    const categorias = [
      { nombre: 'Medicamentos', descripcion: 'Medicamentos y fármacos' },
      { nombre: 'Equipos Médicos', descripcion: 'Equipos y dispositivos médicos' },
      { nombre: 'Insumos', descripcion: 'Insumos médicos y hospitalarios' },
      { nombre: 'Laboratorio', descripcion: 'Productos de laboratorio' },
      { nombre: 'Farmacéuticos', descripcion: 'Productos farmacéuticos' }
    ];

    const { data: categoriasData, error: categoriasError } = await supabase
      .from('categorias')
      .insert(categorias)
      .select();

    if (categoriasError) {
      console.log('❌ Error insertando categorías:', categoriasError.message);
    } else {
      console.log(`✅ ${categoriasData.length} categorías insertadas`);
    }

    // 2. Insertar proveedor
    console.log('\n2️⃣ Insertando proveedor...');
    const proveedor = {
      nombre: 'Qualipharm Ecuador',
      contacto: 'Juan Pérez',
      telefono: '+593 2 234 5678',
      email: 'ventas@qualipharm.com',
      direccion: 'Av. 6 de Diciembre N23-45, Quito',
      ruc: '0987654321001'
    };

    const { data: proveedorData, error: proveedorError } = await supabase
      .from('proveedores')
      .insert(proveedor)
      .select();

    if (proveedorError) {
      console.log('❌ Error insertando proveedor:', proveedorError.message);
    } else {
      console.log(`✅ Proveedor insertado: ${proveedorData[0].nombre}`);
    }

    // 3. Obtener IDs de categorías y proveedor
    const { data: categoriasList, error: catError } = await supabase
      .from('categorias')
      .select('id, nombre');

    const { data: proveedoresList, error: provError } = await supabase
      .from('proveedores')
      .select('id, nombre');

    if (catError || provError) {
      console.log('❌ Error obteniendo categorías o proveedores');
      return;
    }

    const categoriaMap = {
      'Medicamentos': categoriasList.find(c => c.nombre === 'Medicamentos')?.id,
      'Equipos Médicos': categoriasList.find(c => c.nombre === 'Equipos Médicos')?.id,
      'Insumos': categoriasList.find(c => c.nombre === 'Insumos')?.id,
      'Laboratorio': categoriasList.find(c => c.nombre === 'Laboratorio')?.id,
      'Farmacéuticos': categoriasList.find(c => c.nombre === 'Farmacéuticos')?.id
    };

    const proveedorId = proveedoresList.find(p => p.nombre === 'Qualipharm Ecuador')?.id;

    // 4. Insertar productos
    console.log('\n3️⃣ Insertando productos...');
    const productos = [
      {
        nombre: 'Paracetamol 500mg',
        descripcion: 'Analgésico y antipirético',
        codigo_barras: '1234567890123',
        categoria_id: categoriaMap['Medicamentos'],
        proveedor_id: proveedorId,
        precio: 2.50,
        precio_compra: 1.75,
        stock_disponible: 100,
        stock_minimo: 20,
        stock_maximo: 500
      },
      {
        nombre: 'Termómetro Digital',
        descripcion: 'Termómetro digital infrarrojo',
        codigo_barras: '2345678901234',
        categoria_id: categoriaMap['Equipos Médicos'],
        proveedor_id: proveedorId,
        precio: 25.00,
        precio_compra: 18.00,
        stock_disponible: 50,
        stock_minimo: 5,
        stock_maximo: 200
      },
      {
        nombre: 'Jeringas 5ml',
        descripcion: 'Jeringas estériles de 5ml',
        codigo_barras: '3456789012345',
        categoria_id: categoriaMap['Insumos'],
        proveedor_id: proveedorId,
        precio: 0.50,
        precio_compra: 0.30,
        stock_disponible: 500,
        stock_minimo: 100,
        stock_maximo: 2000
      },
      {
        nombre: 'Reactivo COVID-19',
        descripcion: 'Kit de prueba rápida COVID-19',
        codigo_barras: '4567890123456',
        categoria_id: categoriaMap['Laboratorio'],
        proveedor_id: proveedorId,
        precio: 15.00,
        precio_compra: 10.50,
        stock_disponible: 200,
        stock_minimo: 50,
        stock_maximo: 1000
      },
      {
        nombre: 'Aspirina 100mg',
        descripcion: 'Antiinflamatorio y analgésico',
        codigo_barras: '5678901234567',
        categoria_id: categoriaMap['Medicamentos'],
        proveedor_id: proveedorId,
        precio: 1.80,
        precio_compra: 1.20,
        stock_disponible: 150,
        stock_minimo: 30,
        stock_maximo: 600
      },
      {
        nombre: 'Mascarillas N95',
        descripcion: 'Mascarillas de protección N95',
        codigo_barras: '6789012345678',
        categoria_id: categoriaMap['Insumos'],
        proveedor_id: proveedorId,
        precio: 3.00,
        precio_compra: 2.00,
        stock_disponible: 300,
        stock_minimo: 50,
        stock_maximo: 1500
      },
      {
        nombre: 'Glucómetro',
        descripcion: 'Medidor de glucosa en sangre',
        codigo_barras: '7890123456789',
        categoria_id: categoriaMap['Equipos Médicos'],
        proveedor_id: proveedorId,
        precio: 45.00,
        precio_compra: 32.00,
        stock_disponible: 25,
        stock_minimo: 5,
        stock_maximo: 100
      },
      {
        nombre: 'Vitamina C 1000mg',
        descripcion: 'Suplemento de vitamina C',
        codigo_barras: '8901234567890',
        categoria_id: categoriaMap['Farmacéuticos'],
        proveedor_id: proveedorId,
        precio: 8.50,
        precio_compra: 6.00,
        stock_disponible: 80,
        stock_minimo: 20,
        stock_maximo: 400
      }
    ];

    const { data: productosData, error: productosError } = await supabase
      .from('productos')
      .insert(productos)
      .select();

    if (productosError) {
      console.log('❌ Error insertando productos:', productosError.message);
    } else {
      console.log(`✅ ${productosData.length} productos insertados`);
    }

    // 5. Insertar lotes
    console.log('\n4️⃣ Insertando lotes...');
    const lotes = productosData.map((producto, index) => ({
      producto_id: producto.id,
      numero_lote: `LOTE-${producto.nombre.substring(0, 3).toUpperCase()}-001`,
      cantidad_disponible: producto.stock_disponible,
      cantidad_inicial: producto.stock_disponible,
      precio_compra: producto.precio_compra,
      fecha_vencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }));

    const { data: lotesData, error: lotesError } = await supabase
      .from('lotes')
      .insert(lotes)
      .select();

    if (lotesError) {
      console.log('❌ Error insertando lotes:', lotesError.message);
    } else {
      console.log(`✅ ${lotesData.length} lotes insertados`);
    }

    console.log('\n🎉 ¡Datos de prueba insertados correctamente!');
    console.log('📊 Resumen:');
    console.log(`- ${categoriasData?.length || 0} categorías`);
    console.log(`- ${proveedorData?.length || 0} proveedor`);
    console.log(`- ${productosData?.length || 0} productos`);
    console.log(`- ${lotesData?.length || 0} lotes`);

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

insertTestData();
