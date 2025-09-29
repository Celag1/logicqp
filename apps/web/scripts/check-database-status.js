const { createClient } = require('@supabase/supabase-js');

// Usar anon key para operaciones básicas
const supabaseUrl = 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMjE0NTksImV4cCI6MjA3NDY5NzQ1OX0.uFSAyQV5eZ9fr2ZbWBER0o1zWASAOIm1VqDAbeAEAQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabaseStatus() {
  console.log('🔍 Verificando estado de la base de datos...');

  try {
    // 1. Verificar productos
    console.log('📦 Verificando productos...');
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('*');

    if (productosError) {
      console.error('❌ Error obteniendo productos:', productosError.message);
    } else {
      console.log(`📦 Productos encontrados: ${productos.length}`);
      if (productos.length > 0) {
        productos.forEach((producto, index) => {
          console.log(`${index + 1}. ${producto.nombre} - $${producto.precio} - Activo: ${producto.activo}`);
        });
      }
    }

    // 2. Verificar categorías
    console.log('📂 Verificando categorías...');
    const { data: categorias, error: categoriasError } = await supabase
      .from('categorias')
      .select('*');

    if (categoriasError) {
      console.error('❌ Error obteniendo categorías:', categoriasError.message);
    } else {
      console.log(`📂 Categorías encontradas: ${categorias.length}`);
      if (categorias.length > 0) {
        categorias.forEach((categoria, index) => {
          console.log(`${index + 1}. ${categoria.nombre}`);
        });
      }
    }

    // 3. Verificar proveedores
    console.log('🏭 Verificando proveedores...');
    const { data: proveedores, error: proveedoresError } = await supabase
      .from('proveedores')
      .select('*');

    if (proveedoresError) {
      console.error('❌ Error obteniendo proveedores:', proveedoresError.message);
    } else {
      console.log(`🏭 Proveedores encontrados: ${proveedores.length}`);
      if (proveedores.length > 0) {
        proveedores.forEach((proveedor, index) => {
          console.log(`${index + 1}. ${proveedor.nombre} - ${proveedor.email}`);
        });
      }
    }

    // 4. Verificar configuración de empresa
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
      console.log(`📍 Dirección: ${empresa.direccion}`);
      console.log(`📧 Email: ${empresa.email}`);
      console.log(`🌐 Web: ${empresa.sitio_web}`);
      console.log(`💰 Moneda: ${empresa.moneda}`);
      console.log(`🌍 País: ${empresa.pais}`);
    }

    // 5. Verificar configuración del sistema
    console.log('⚙️ Verificando configuración del sistema...');
    const { data: sistema, error: sistemaError } = await supabase
      .from('configuracion_sistema')
      .select('*')
      .eq('id', 1)
      .single();

    if (sistemaError) {
      console.error('❌ Error obteniendo configuración del sistema:', sistemaError.message);
    } else {
      console.log('✅ Configuración del sistema encontrada:');
      console.log(`💰 Moneda: ${sistema.moneda_principal}`);
      console.log(`🌍 País: ${sistema.pais_principal}`);
      console.log(`📊 IVA: ${sistema.iva_porcentaje}%`);
    }

    // 6. Verificar consulta completa de productos
    console.log('🔍 Verificando consulta completa de productos...');
    const { data: productosCompletos, error: productosCompletosError } = await supabase
      .from('productos')
      .select(`
        *,
        categorias(nombre),
        proveedores(nombre),
        lotes(id, cantidad_disponible, fecha_vencimiento)
      `)
      .eq('activo', true)
      .order('nombre');

    if (productosCompletosError) {
      console.error('❌ Error en consulta completa:', productosCompletosError.message);
    } else {
      console.log(`📦 Consulta completa exitosa. Productos encontrados: ${productosCompletos.length}`);
      if (productosCompletos.length > 0) {
        productosCompletos.forEach((producto, index) => {
          console.log(`${index + 1}. ${producto.nombre} - Categoría: ${producto.categorias?.nombre || 'N/A'} - Proveedor: ${producto.proveedores?.nombre || 'N/A'}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

checkDatabaseStatus();
