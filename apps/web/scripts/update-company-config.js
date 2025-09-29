const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMjE0NTksImV4cCI6MjA3NDY5NzQ1OX0.uFSAyQV5eZ9fr2ZbWBER0o1zWASAOIm1VqDAbeAEAQ';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Supabase URL o Anon Key no están configuradas.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateCompanyConfig() {
  console.log('🏥 Actualizando configuración de Qualipharm Laboratorio Farmacéutico...');

  try {
    // Actualizar configuración de la empresa
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
      return;
    }

    console.log('✅ Configuración de empresa actualizada exitosamente');

    // Actualizar configuración del sistema
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
      return;
    }

    console.log('✅ Configuración del sistema actualizada exitosamente');

    // Verificar que los productos estén asociados a Qualipharm
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('*');

    if (productosError) {
      console.error('❌ Error obteniendo productos:', productosError.message);
      return;
    }

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

    console.log('🎉 ¡Configuración de Qualipharm Laboratorio Farmacéutico completada exitosamente!');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

updateCompanyConfig();
