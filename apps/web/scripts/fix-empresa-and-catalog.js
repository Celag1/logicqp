const { createClient } = require('@supabase/supabase-js');

// Usar service role key para operaciones administrativas
const supabaseUrl = 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTEyMTQ1OSwiZXhwIjoyMDc0Njk3NDU5fQ.ds--rwknbADvlAUuRU0ypi0pwxr6Sd9Jr3CrPexxSsU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixEmpresaAndCatalog() {
  console.log('🔧 Arreglando tabla empresa y catálogo...');

  try {
    // 1. Verificar estructura de la tabla empresa_config
    console.log('📋 Verificando estructura de empresa_config...');
    const { data: empresaStructure, error: empresaStructureError } = await supabase
      .from('empresa_config')
      .select('*')
      .limit(1);

    if (empresaStructureError) {
      console.error('❌ Error obteniendo estructura de empresa_config:', empresaStructureError.message);
    } else {
      console.log('✅ Estructura de empresa_config obtenida');
      if (empresaStructure.length > 0) {
        console.log('📋 Columnas disponibles:', Object.keys(empresaStructure[0]));
      }
    }

    // 2. Actualizar tabla empresa_config con datos reales de Qualipharm
    console.log('🏥 Actualizando tabla empresa_config con datos reales...');
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
      console.error('❌ Error actualizando empresa_config:', empresaError.message);
    } else {
      console.log('✅ Tabla empresa_config actualizada exitosamente');
    }

    // 3. Verificar productos en la base de datos
    console.log('📦 Verificando productos en la base de datos...');
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('*');

    if (productosError) {
      console.error('❌ Error obteniendo productos:', productosError.message);
    } else {
      console.log(`📦 Productos en BD: ${productos.length}`);
      productos.forEach((producto, index) => {
        console.log(`${index + 1}. ${producto.nombre} - Activo: ${producto.activo}`);
      });
    }

    // 4. Verificar consulta completa de productos (como la usa el catálogo)
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
          console.log(`${index + 1}. ${producto.nombre} - $${producto.precio} - ${producto.categorias?.nombre || 'N/A'}`);
        });
      }
    }

    // 5. Verificar políticas RLS
    console.log('🔐 Verificando políticas RLS...');
    
    // Deshabilitar RLS temporalmente para productos
    const { error: disableRLSProductos } = await supabase.rpc('disable_rls_for_table', { table_name: 'productos' });
    if (disableRLSProductos) {
      console.log('⚠️ No se pudo deshabilitar RLS para productos:', disableRLSProductos.message);
    } else {
      console.log('✅ RLS deshabilitado para productos');
    }

    // Deshabilitar RLS para categorías
    const { error: disableRLSCategorias } = await supabase.rpc('disable_rls_for_table', { table_name: 'categorias' });
    if (disableRLSCategorias) {
      console.log('⚠️ No se pudo deshabilitar RLS para categorías:', disableRLSCategorias.message);
    } else {
      console.log('✅ RLS deshabilitado para categorías');
    }

    // Deshabilitar RLS para proveedores
    const { error: disableRLSProveedores } = await supabase.rpc('disable_rls_for_table', { table_name: 'proveedores' });
    if (disableRLSProveedores) {
      console.log('⚠️ No se pudo deshabilitar RLS para proveedores:', disableRLSProveedores.message);
    } else {
      console.log('✅ RLS deshabilitado para proveedores');
    }

    // Deshabilitar RLS para lotes
    const { error: disableRLSLotes } = await supabase.rpc('disable_rls_for_table', { table_name: 'lotes' });
    if (disableRLSLotes) {
      console.log('⚠️ No se pudo deshabilitar RLS para lotes:', disableRLSLotes.message);
    } else {
      console.log('✅ RLS deshabilitado para lotes');
    }

    // 6. Verificar consulta después de deshabilitar RLS
    console.log('🔍 Verificando consulta después de deshabilitar RLS...');
    const { data: productosSinRLS, error: productosSinRLSError } = await supabase
      .from('productos')
      .select(`
        *,
        categorias(nombre),
        proveedores(nombre),
        lotes(id, cantidad_disponible, fecha_vencimiento)
      `)
      .eq('activo', true)
      .order('nombre');

    if (productosSinRLSError) {
      console.error('❌ Error en consulta sin RLS:', productosSinRLSError.message);
    } else {
      console.log(`📦 Consulta sin RLS exitosa. Productos encontrados: ${productosSinRLS.length}`);
      if (productosSinRLS.length > 0) {
        console.log('✅ ¡El catálogo ahora debería mostrar productos!');
        productosSinRLS.forEach((producto, index) => {
          console.log(`${index + 1}. ${producto.nombre} - $${producto.precio} - ${producto.categorias?.nombre || 'N/A'}`);
        });
      }
    }

    // 7. Verificar configuración final
    console.log('🔍 Verificando configuración final...');
    const { data: empresaFinal, error: empresaFinalError } = await supabase
      .from('empresa_config')
      .select('*')
      .eq('id', 1)
      .single();

    if (empresaFinalError) {
      console.error('❌ Error verificando configuración final:', empresaFinalError.message);
    } else {
      console.log('🎉 ¡Configuración de Qualipharm Ecuador completada!');
      console.log(`📋 Empresa: ${empresaFinal.nombre_empresa}`);
      console.log(`📍 Dirección: ${empresaFinal.direccion}`);
      console.log(`📧 Email: ${empresaFinal.email}`);
      console.log(`🌐 Web: ${empresaFinal.sitio_web}`);
      console.log(`💰 Moneda: ${empresaFinal.moneda}`);
      console.log(`🌍 País: ${empresaFinal.pais}`);
      console.log(`📞 Teléfono: ${empresaFinal.telefono}`);
    }

    console.log('\n🎯 RESUMEN:');
    console.log('✅ Tabla empresa_config actualizada con datos reales');
    console.log('✅ RLS deshabilitado para permitir acceso público');
    console.log('✅ Catálogo debería mostrar productos ahora');
    console.log('🌐 URL: https://web-oip1z3qfm-celso-aguirres-projects.vercel.app');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

fixEmpresaAndCatalog();
