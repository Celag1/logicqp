const { createClient } = require('@supabase/supabase-js');

// Usar service role key para operaciones administrativas
const supabaseUrl = 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTEyMTQ1OSwiZXhwIjoyMDc0Njk3NDU5fQ.placeholder';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateQualipharmConfig() {
  console.log('🏥 Actualizando configuración de Qualipharm Laboratorio Farmacéutico...');

  try {
    // 1. Actualizar configuración de la empresa
    console.log('📋 Actualizando configuración de empresa...');
    const { error: configError } = await supabase
      .from('empresa_config')
      .upsert({
        id: 1,
        nombre_empresa: 'Qualipharm Laboratorio Farmacéutico',
        ruc: '12345678901',
        direccion: 'Av. Principal 123, Lima, Perú',
        telefono: '+51 1 234-5678',
        email: 'info@qualipharm.com',
        sitio_web: 'https://qualipharm.com',
        descripcion: 'Laboratorio farmacéutico líder en investigación, desarrollo y producción de medicamentos de alta calidad para el mercado peruano e internacional.',
        mision: 'Desarrollar y producir medicamentos innovadores que mejoren la calidad de vida de las personas, manteniendo los más altos estándares de calidad y seguridad.',
        vision: 'Ser el laboratorio farmacéutico más confiable y reconocido del Perú, expandiendo nuestra presencia en mercados internacionales.',
        valores: 'Calidad, Innovación, Integridad, Compromiso con la salud',
        logo_url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&h=200&fit=crop&crop=center&q=80&auto=format&ixlib=rb-4.0.3',
        color_primario: '#0056b3',
        color_secundario: '#28a745',
        moneda: 'PEN',
        pais: 'Perú',
        idioma: 'es',
        zona_horaria: 'America/Lima',
        formato_fecha: 'DD/MM/YYYY',
        formato_hora: '24h',
        activo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (configError) {
      console.error('❌ Error actualizando configuración de empresa:', configError.message);
    } else {
      console.log('✅ Configuración de empresa actualizada exitosamente');
    }

    // 2. Actualizar configuración del sistema
    console.log('⚙️ Actualizando configuración del sistema...');
    const { error: systemError } = await supabase
      .from('configuracion_sistema')
      .upsert({
        id: 1,
        iva_porcentaje: 15.0,
        descuento_maximo: 20.0,
        stock_minimo: 10,
        dias_vencimiento_alerta: 30,
        moneda_principal: 'PEN',
        pais_principal: 'Perú',
        idioma_principal: 'es',
        zona_horaria: 'America/Lima',
        formato_fecha: 'DD/MM/YYYY',
        formato_hora: '24h',
        activo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (systemError) {
      console.error('❌ Error actualizando configuración del sistema:', systemError.message);
    } else {
      console.log('✅ Configuración del sistema actualizada exitosamente');
    }

    // 3. Verificar y actualizar proveedor Qualipharm
    console.log('🏭 Verificando proveedor Qualipharm...');
    const { data: proveedor, error: proveedorError } = await supabase
      .from('proveedores')
      .select('*')
      .eq('id', 1)
      .single();

    if (proveedorError && proveedorError.code !== 'PGRST116') {
      console.error('❌ Error obteniendo proveedor:', proveedorError.message);
    } else if (!proveedor) {
      // Crear proveedor Qualipharm si no existe
      const { error: createProveedorError } = await supabase
        .from('proveedores')
        .insert({
          id: 1,
          nombre: 'Qualipharm Laboratorio Farmacéutico',
          ruc: '12345678901',
          direccion: 'Av. Principal 123, Lima, Perú',
          telefono: '+51 1 234-5678',
          email: 'info@qualipharm.com',
          contacto: 'Dr. Carlos Aguirre',
          activo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (createProveedorError) {
        console.error('❌ Error creando proveedor:', createProveedorError.message);
      } else {
        console.log('✅ Proveedor Qualipharm creado exitosamente');
      }
    } else {
      console.log('✅ Proveedor Qualipharm ya existe');
    }

    // 4. Verificar productos
    console.log('📦 Verificando productos...');
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('*');

    if (productosError) {
      console.error('❌ Error obteniendo productos:', productosError.message);
    } else {
      console.log(`📦 Productos encontrados: ${productos.length}`);
      
      // Actualizar todos los productos para que pertenezcan a Qualipharm
      for (const producto of productos) {
        const { error: updateError } = await supabase
          .from('productos')
          .update({
            proveedor_id: 1, // Qualipharm
            updated_at: new Date().toISOString()
          })
          .eq('id', producto.id);

        if (updateError) {
          console.error(`❌ Error actualizando producto ${producto.nombre}:`, updateError.message);
        } else {
          console.log(`✅ Producto ${producto.nombre} actualizado para Qualipharm`);
        }
      }
    }

    // 5. Verificar configuración final
    console.log('🔍 Verificando configuración final...');
    const { data: empresaFinal, error: empresaFinalError } = await supabase
      .from('empresa_config')
      .select('*')
      .eq('id', 1)
      .single();

    if (empresaFinalError) {
      console.error('❌ Error verificando configuración final:', empresaFinalError.message);
    } else {
      console.log('🎉 ¡Configuración de Qualipharm Laboratorio Farmacéutico completada exitosamente!');
      console.log(`📋 Empresa: ${empresaFinal.nombre_empresa}`);
      console.log(`📧 Email: ${empresaFinal.email}`);
      console.log(`🌐 Web: ${empresaFinal.sitio_web}`);
      console.log(`💰 Moneda: ${empresaFinal.moneda}`);
      console.log(`🌍 País: ${empresaFinal.pais}`);
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

updateQualipharmConfig();
