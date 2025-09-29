const { createClient } = require('@supabase/supabase-js');

// Usar anon key para operaciones básicas
const supabaseUrl = 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMjE0NTksImV4cCI6MjA3NDY5NzQ1OX0.uFSAyQV5eZ9fr2ZbWBER0o1zWASAOIm1VqDAbeAEAQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateQualipharmSimple() {
  console.log('🏥 Actualizando configuración de Qualipharm Laboratorio Farmacéutico...');

  try {
    // 1. Verificar conexión
    console.log('🔌 Verificando conexión a Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('empresa_config')
      .select('*')
      .limit(1);

    if (testError) {
      console.error('❌ Error de conexión:', testError.message);
      return;
    }

    console.log('✅ Conexión exitosa a Supabase');

    // 2. Verificar productos actuales
    console.log('📦 Verificando productos actuales...');
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('*');

    if (productosError) {
      console.error('❌ Error obteniendo productos:', productosError.message);
    } else {
      console.log(`📦 Productos encontrados: ${productos.length}`);
      productos.forEach((producto, index) => {
        console.log(`${index + 1}. ${producto.nombre} - $${producto.precio}`);
      });
    }

    // 3. Verificar categorías
    console.log('📂 Verificando categorías...');
    const { data: categorias, error: categoriasError } = await supabase
      .from('categorias')
      .select('*');

    if (categoriasError) {
      console.error('❌ Error obteniendo categorías:', categoriasError.message);
    } else {
      console.log(`📂 Categorías encontradas: ${categorias.length}`);
      categorias.forEach((categoria, index) => {
        console.log(`${index + 1}. ${categoria.nombre}`);
      });
    }

    // 4. Verificar proveedores
    console.log('🏭 Verificando proveedores...');
    const { data: proveedores, error: proveedoresError } = await supabase
      .from('proveedores')
      .select('*');

    if (proveedoresError) {
      console.error('❌ Error obteniendo proveedores:', proveedoresError.message);
    } else {
      console.log(`🏭 Proveedores encontrados: ${proveedores.length}`);
      proveedores.forEach((proveedor, index) => {
        console.log(`${index + 1}. ${proveedor.nombre}`);
      });
    }

    // 5. Verificar configuración de empresa
    console.log('📋 Verificando configuración de empresa...');
    const { data: empresa, error: empresaError } = await supabase
      .from('empresa_config')
      .select('*')
      .eq('id', 1)
      .single();

    if (empresaError) {
      console.error('❌ Error obteniendo configuración de empresa:', empresaError.message);
    } else {
      console.log('✅ Configuración de empresa encontrada:');
      console.log(`📋 Empresa: ${empresa.nombre_empresa}`);
      console.log(`📧 Email: ${empresa.email}`);
      console.log(`🌐 Web: ${empresa.sitio_web}`);
      console.log(`💰 Moneda: ${empresa.moneda}`);
      console.log(`🌍 País: ${empresa.pais}`);
    }

    console.log('🎉 ¡Verificación de Qualipharm Laboratorio Farmacéutico completada!');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

updateQualipharmSimple();
