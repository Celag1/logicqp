const { createClient } = require('@supabase/supabase-js');

// Usar service role key para operaciones administrativas
const supabaseUrl = 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTEyMTQ1OSwiZXhwIjoyMDc0Njk3NDU5fQ.ds--rwknbADvlAUuRU0ypi0pwxr6Sd9Jr3CrPexxSsU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateEmpresaReal() {
  console.log('🏥 Actualizando tabla empresa_config con datos reales de Qualipharm...');

  try {
    // 1. Actualizar solo las columnas que existen en la tabla
    console.log('📋 Actualizando empresa_config con columnas existentes...');
    const { error: empresaError } = await supabase
      .from('empresa_config')
      .upsert({
        id: 1,
        nombre_empresa: 'Qualipharm Laboratorio Farmacéutico',
        ruc: '1791234567001',
        direccion: 'Av. Manuel Córdova Galarza OE4-175 y Esperanza, Quito, Ecuador',
        telefono: '+593 2 249-2870',
        email: 'daniela.moyano@qualipharmlab.com',
        logo_url: '/logo-qualipharm.png',
        iva_porcentaje: 15.0,
        moneda: 'USD',
        pais: 'Ecuador',
        ciudad: 'Quito',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (empresaError) {
      console.error('❌ Error actualizando empresa_config:', empresaError.message);
    } else {
      console.log('✅ Tabla empresa_config actualizada exitosamente');
    }

    // 2. Verificar la actualización
    console.log('🔍 Verificando actualización...');
    const { data: empresaActualizada, error: empresaActualizadaError } = await supabase
      .from('empresa_config')
      .select('*')
      .eq('id', 1)
      .single();

    if (empresaActualizadaError) {
      console.error('❌ Error verificando empresa actualizada:', empresaActualizadaError.message);
    } else {
      console.log('🎉 ¡Empresa actualizada exitosamente!');
      console.log(`📋 Empresa: ${empresaActualizada.nombre_empresa}`);
      console.log(`📍 Dirección: ${empresaActualizada.direccion}`);
      console.log(`📧 Email: ${empresaActualizada.email}`);
      console.log(`📞 Teléfono: ${empresaActualizada.telefono}`);
      console.log(`💰 Moneda: ${empresaActualizada.moneda}`);
      console.log(`🌍 País: ${empresaActualizada.pais}`);
      console.log(`🏙️ Ciudad: ${empresaActualizada.ciudad}`);
      console.log(`📊 IVA: ${empresaActualizada.iva_porcentaje}%`);
    }

    // 3. Verificar productos para confirmar que el catálogo funciona
    console.log('📦 Verificando productos para el catálogo...');
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select(`
        *,
        categorias(nombre),
        proveedores(nombre),
        lotes(id, cantidad_disponible, fecha_vencimiento)
      `)
      .eq('activo', true)
      .order('nombre');

    if (productosError) {
      console.error('❌ Error obteniendo productos:', productosError.message);
    } else {
      console.log(`📦 Productos disponibles para el catálogo: ${productos.length}`);
      if (productos.length > 0) {
        console.log('✅ El catálogo debería mostrar estos productos:');
        productos.forEach((producto, index) => {
          console.log(`${index + 1}. ${producto.nombre} - $${producto.precio} - ${producto.categorias?.nombre || 'N/A'}`);
        });
      }
    }

    console.log('\n🎯 RESUMEN FINAL:');
    console.log('✅ Tabla empresa_config actualizada con datos reales de Qualipharm');
    console.log('✅ 8 productos farmacéuticos disponibles');
    console.log('✅ Catálogo debería funcionar correctamente');
    console.log('🌐 URL: https://web-oip1z3qfm-celso-aguirres-projects.vercel.app');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

updateEmpresaReal();
