const { createClient } = require('@supabase/supabase-js');

// Usar service role key para operaciones administrativas
const supabaseUrl = 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTEyMTQ1OSwiZXhwIjoyMDc0Njk3NDU5fQ.ds--rwknbADvlAUuRU0ypi0pwxr6Sd9Jr3CrPexxSsU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function insertQualipharmSimple() {
  console.log('🇪🇨 Insertando datos de Qualipharm Ecuador (versión simplificada)...');

  try {
    // 1. Limpiar datos existentes
    console.log('🧹 Limpiando datos existentes...');
    
    // Eliminar productos existentes
    await supabase.from('productos').delete().neq('id', 0);
    console.log('✅ Productos existentes eliminados');
    
    // Eliminar categorías existentes
    await supabase.from('categorias').delete().neq('id', 0);
    console.log('✅ Categorías existentes eliminadas');
    
    // Eliminar proveedores existentes
    await supabase.from('proveedores').delete().neq('id', 0);
    console.log('✅ Proveedores existentes eliminados');

    // 2. Insertar configuración de empresa (sin columna activo)
    console.log('📋 Insertando configuración de empresa...');
    const { error: empresaError } = await supabase
      .from('empresa_config')
      .upsert({
        id: 1,
        nombre_empresa: 'Qualipharm Laboratorio Farmacéutico',
        ruc: '1791234567001',
        direccion: 'Av. Manuel Córdova Galarza OE4-175 y Esperanza, Quito, Ecuador',
        telefono: '+593 2 249-2870',
        email: 'daniela.moyano@qualipharmlab.com',
        sitio_web: 'https://www.qualipharmlab.com/',
        descripcion: 'Satisfacemos sus necesidades de desarrollo, producción, logística, asesoría técnica y normativa de productos para la salud y la belleza, con cercanía y versatilidad, sin ser competencia para nuestros clientes.',
        mision: 'Desarrollar y producir medicamentos innovadores que mejoren la calidad de vida de las personas, manteniendo los más altos estándares de calidad y seguridad.',
        vision: 'Ser el laboratorio farmacéutico más confiable y reconocido del Ecuador, expandiendo nuestra presencia en mercados internacionales.',
        valores: 'Calidad, Innovación, Integridad, Compromiso con la salud',
        logo_url: '/logo-qualipharm.png',
        color_primario: '#0056b3',
        color_secundario: '#28a745',
        moneda: 'USD',
        pais: 'Ecuador',
        idioma: 'es',
        zona_horaria: 'America/Guayaquil',
        formato_fecha: 'DD/MM/YYYY',
        formato_hora: '24h',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (empresaError) {
      console.error('❌ Error insertando configuración de empresa:', empresaError.message);
    } else {
      console.log('✅ Configuración de empresa insertada exitosamente');
    }

    // 3. Insertar configuración del sistema (sin columna activo)
    console.log('⚙️ Insertando configuración del sistema...');
    const { error: sistemaError } = await supabase
      .from('configuracion_sistema')
      .upsert({
        id: 1,
        iva_porcentaje: 15.0,
        descuento_maximo: 20.0,
        stock_minimo: 10,
        dias_vencimiento_alerta: 30,
        moneda_principal: 'USD',
        pais_principal: 'Ecuador',
        idioma_principal: 'es',
        zona_horaria: 'America/Guayaquil',
        formato_fecha: 'DD/MM/YYYY',
        formato_hora: '24h',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (sistemaError) {
      console.error('❌ Error insertando configuración del sistema:', sistemaError.message);
    } else {
      console.log('✅ Configuración del sistema insertada exitosamente');
    }

    // 4. Insertar proveedor Qualipharm
    console.log('🏭 Insertando proveedor Qualipharm...');
    const { error: proveedorError } = await supabase
      .from('proveedores')
      .insert({
        id: 1,
        nombre: 'Qualipharm Laboratorio Farmacéutico',
        ruc: '1791234567001',
        direccion: 'Av. Manuel Córdova Galarza OE4-175 y Esperanza, Quito, Ecuador',
        telefono: '+593 2 249-2870',
        email: 'daniela.moyano@qualipharmlab.com',
        contacto: 'Daniela Moyano - Gerente Comercial',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (proveedorError) {
      console.error('❌ Error insertando proveedor:', proveedorError.message);
    } else {
      console.log('✅ Proveedor Qualipharm insertado exitosamente');
    }

    // 5. Insertar categorías farmacéuticas (sin columna activo)
    console.log('📂 Insertando categorías farmacéuticas...');
    const categorias = [
      { id: 1, nombre: 'Antibióticos', descripcion: 'Medicamentos antibióticos para infecciones' },
      { id: 2, nombre: 'Analgésicos', descripcion: 'Medicamentos para el dolor' },
      { id: 3, nombre: 'Antiinflamatorios', descripcion: 'Medicamentos antiinflamatorios' },
      { id: 4, nombre: 'Vitaminas', descripcion: 'Suplementos vitamínicos' },
      { id: 5, nombre: 'Cardiovasculares', descripcion: 'Medicamentos para el corazón' },
      { id: 6, nombre: 'Dermatológicos', descripcion: 'Medicamentos para la piel' },
      { id: 7, nombre: 'Digestivos', descripcion: 'Medicamentos para el sistema digestivo' },
      { id: 8, nombre: 'Respiratorios', descripcion: 'Medicamentos para el sistema respiratorio' }
    ];

    const { error: categoriasError } = await supabase
      .from('categorias')
      .insert(categorias.map(cat => ({
        ...cat,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })));

    if (categoriasError) {
      console.error('❌ Error insertando categorías:', categoriasError.message);
    } else {
      console.log('✅ Categorías farmacéuticas insertadas exitosamente');
    }

    // 6. Insertar productos farmacéuticos de Qualipharm (sin columna requiere_receta)
    console.log('💊 Insertando productos farmacéuticos...');
    const productos = [
      {
        id: 1,
        nombre: 'Amoxicilina 500mg',
        descripcion: 'Antibiótico de amplio espectro para infecciones bacterianas',
        precio: 12.50,
        categoria_id: 1,
        proveedor_id: 1,
        codigo_barras: '7701234567890',
        stock_minimo: 50,
        activo: true
      },
      {
        id: 2,
        nombre: 'Ibuprofeno 400mg',
        descripcion: 'Antiinflamatorio no esteroideo para dolor e inflamación',
        precio: 8.75,
        categoria_id: 3,
        proveedor_id: 1,
        codigo_barras: '7701234567891',
        stock_minimo: 100,
        activo: true
      },
      {
        id: 3,
        nombre: 'Paracetamol 500mg',
        descripcion: 'Analgésico y antipirético para dolor y fiebre',
        precio: 6.25,
        categoria_id: 2,
        proveedor_id: 1,
        codigo_barras: '7701234567892',
        stock_minimo: 150,
        activo: true
      },
      {
        id: 4,
        nombre: 'Vitamina C 1000mg',
        descripcion: 'Suplemento vitamínico para fortalecer el sistema inmunológico',
        precio: 15.00,
        categoria_id: 4,
        proveedor_id: 1,
        codigo_barras: '7701234567893',
        stock_minimo: 75,
        activo: true
      },
      {
        id: 5,
        nombre: 'Losartán 50mg',
        descripcion: 'Antihipertensivo para el control de la presión arterial',
        precio: 18.50,
        categoria_id: 5,
        proveedor_id: 1,
        codigo_barras: '7701234567894',
        stock_minimo: 60,
        activo: true
      },
      {
        id: 6,
        nombre: 'Hidrocortisona 1%',
        descripcion: 'Cremas dermatológicas para inflamación de la piel',
        precio: 9.75,
        categoria_id: 6,
        proveedor_id: 1,
        codigo_barras: '7701234567895',
        stock_minimo: 40,
        activo: true
      },
      {
        id: 7,
        nombre: 'Omeprazol 20mg',
        descripcion: 'Protector gástrico para úlceras y reflujo',
        precio: 11.25,
        categoria_id: 7,
        proveedor_id: 1,
        codigo_barras: '7701234567896',
        stock_minimo: 80,
        activo: true
      },
      {
        id: 8,
        nombre: 'Salbutamol Inhalador',
        descripcion: 'Broncodilatador para el tratamiento del asma',
        precio: 22.00,
        categoria_id: 8,
        proveedor_id: 1,
        codigo_barras: '7701234567897',
        stock_minimo: 30,
        activo: true
      }
    ];

    const { error: productosError } = await supabase
      .from('productos')
      .insert(productos.map(prod => ({
        ...prod,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })));

    if (productosError) {
      console.error('❌ Error insertando productos:', productosError.message);
    } else {
      console.log('✅ Productos farmacéuticos insertados exitosamente');
    }

    // 7. Insertar lotes de inventario (sin columna lote)
    console.log('📦 Insertando lotes de inventario...');
    const lotes = [
      { id: 1, producto_id: 1, cantidad_disponible: 200, fecha_vencimiento: '2025-12-31' },
      { id: 2, producto_id: 2, cantidad_disponible: 300, fecha_vencimiento: '2026-03-15' },
      { id: 3, producto_id: 3, cantidad_disponible: 500, fecha_vencimiento: '2025-11-30' },
      { id: 4, producto_id: 4, cantidad_disponible: 150, fecha_vencimiento: '2026-01-20' },
      { id: 5, producto_id: 5, cantidad_disponible: 120, fecha_vencimiento: '2025-10-15' },
      { id: 6, producto_id: 6, cantidad_disponible: 80, fecha_vencimiento: '2026-02-28' },
      { id: 7, producto_id: 7, cantidad_disponible: 200, fecha_vencimiento: '2025-09-30' },
      { id: 8, producto_id: 8, cantidad_disponible: 60, fecha_vencimiento: '2026-04-10' }
    ];

    const { error: lotesError } = await supabase
      .from('lotes')
      .insert(lotes.map(lote => ({
        ...lote,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })));

    if (lotesError) {
      console.error('❌ Error insertando lotes:', lotesError.message);
    } else {
      console.log('✅ Lotes de inventario insertados exitosamente');
    }

    // 8. Verificar datos insertados
    console.log('🔍 Verificando datos insertados...');
    const { data: productosFinales, error: productosFinalesError } = await supabase
      .from('productos')
      .select(`
        *,
        categorias(nombre),
        proveedores(nombre),
        lotes(id, cantidad_disponible, fecha_vencimiento)
      `)
      .eq('activo', true)
      .order('nombre');

    if (productosFinalesError) {
      console.error('❌ Error verificando productos finales:', productosFinalesError.message);
    } else {
      console.log(`🎉 ¡Datos de Qualipharm Ecuador insertados exitosamente!`);
      console.log(`📦 Productos disponibles: ${productosFinales.length}`);
      console.log(`📂 Categorías: 8`);
      console.log(`🏭 Proveedores: 1 (Qualipharm)`);
      console.log(`📋 Configuración: Ecuador, USD, IVA 15%`);
      
      console.log('\n📋 Resumen de productos:');
      productosFinales.forEach((producto, index) => {
        console.log(`${index + 1}. ${producto.nombre} - $${producto.precio} - ${producto.categorias?.nombre || 'N/A'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

insertQualipharmSimple();
