const { createClient } = require('@supabase/supabase-js');

// Usar anon key para operaciones básicas
const supabaseUrl = 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMjE0NTksImV4cCI6MjA3NDY5NzQ1OX0.uFSAyQV5eZ9fr2ZbWBER0o1zWASAOIm1VqDAbeAEAQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateQualipharmEcuador() {
  console.log('🇪🇨 Actualizando configuración de Qualipharm Ecuador...');

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

    // 2. Actualizar configuración de empresa con datos reales de Ecuador
    console.log('📋 Actualizando configuración de empresa...');
    const { error: configError } = await supabase
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
        activo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (configError) {
      console.error('❌ Error actualizando configuración de empresa:', configError.message);
    } else {
      console.log('✅ Configuración de empresa actualizada exitosamente');
    }

    // 3. Actualizar configuración del sistema para Ecuador
    console.log('⚙️ Actualizando configuración del sistema...');
    const { error: systemError } = await supabase
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
        activo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (systemError) {
      console.error('❌ Error actualizando configuración del sistema:', systemError.message);
    } else {
      console.log('✅ Configuración del sistema actualizada exitosamente');
    }

    // 4. Verificar y actualizar proveedor Qualipharm Ecuador
    console.log('🏭 Verificando proveedor Qualipharm Ecuador...');
    const { data: proveedor, error: proveedorError } = await supabase
      .from('proveedores')
      .select('*')
      .eq('id', 1)
      .single();

    if (proveedorError && proveedorError.code !== 'PGRST116') {
      console.error('❌ Error obteniendo proveedor:', proveedorError.message);
    } else if (!proveedor) {
      // Crear proveedor Qualipharm Ecuador si no existe
      const { error: createProveedorError } = await supabase
        .from('proveedores')
        .insert({
          id: 1,
          nombre: 'Qualipharm Laboratorio Farmacéutico',
          ruc: '1791234567001',
          direccion: 'Av. Manuel Córdova Galarza OE4-175 y Esperanza, Quito, Ecuador',
          telefono: '+593 2 249-2870',
          email: 'daniela.moyano@qualipharmlab.com',
          contacto: 'Daniela Moyano - Gerente Comercial',
          activo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (createProveedorError) {
        console.error('❌ Error creando proveedor:', createProveedorError.message);
      } else {
        console.log('✅ Proveedor Qualipharm Ecuador creado exitosamente');
      }
    } else {
      // Actualizar proveedor existente
      const { error: updateProveedorError } = await supabase
        .from('proveedores')
        .update({
          nombre: 'Qualipharm Laboratorio Farmacéutico',
          ruc: '1791234567001',
          direccion: 'Av. Manuel Córdova Galarza OE4-175 y Esperanza, Quito, Ecuador',
          telefono: '+593 2 249-2870',
          email: 'daniela.moyano@qualipharmlab.com',
          contacto: 'Daniela Moyano - Gerente Comercial',
          updated_at: new Date().toISOString()
        })
        .eq('id', 1);

      if (updateProveedorError) {
        console.error('❌ Error actualizando proveedor:', updateProveedorError.message);
      } else {
        console.log('✅ Proveedor Qualipharm Ecuador actualizado exitosamente');
      }
    }

    // 5. Verificar productos
    console.log('📦 Verificando productos...');
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('*');

    if (productosError) {
      console.error('❌ Error obteniendo productos:', productosError.message);
    } else {
      console.log(`📦 Productos encontrados: ${productos.length}`);
      
      // Actualizar todos los productos para que pertenezcan a Qualipharm Ecuador
      for (const producto of productos) {
        const { error: updateError } = await supabase
          .from('productos')
          .update({
            proveedor_id: 1, // Qualipharm Ecuador
            updated_at: new Date().toISOString()
          })
          .eq('id', producto.id);

        if (updateError) {
          console.error(`❌ Error actualizando producto ${producto.nombre}:`, updateError.message);
        } else {
          console.log(`✅ Producto ${producto.nombre} actualizado para Qualipharm Ecuador`);
        }
      }
    }

    // 6. Verificar configuración final
    console.log('🔍 Verificando configuración final...');
    const { data: empresaFinal, error: empresaFinalError } = await supabase
      .from('empresa_config')
      .select('*')
      .eq('id', 1)
      .single();

    if (empresaFinalError) {
      console.error('❌ Error verificando configuración final:', empresaFinalError.message);
    } else {
      console.log('🎉 ¡Configuración de Qualipharm Ecuador completada exitosamente!');
      console.log(`📋 Empresa: ${empresaFinal.nombre_empresa}`);
      console.log(`📍 Dirección: ${empresaFinal.direccion}`);
      console.log(`📧 Email: ${empresaFinal.email}`);
      console.log(`🌐 Web: ${empresaFinal.sitio_web}`);
      console.log(`💰 Moneda: ${empresaFinal.moneda}`);
      console.log(`🌍 País: ${empresaFinal.pais}`);
      console.log(`📞 Teléfono: ${empresaFinal.telefono}`);
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

updateQualipharmEcuador();
