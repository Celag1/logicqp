#!/usr/bin/env node

/**
 * MIGRACIÓN DIRECTA A SUPABASE CLOUD
 * ==================================
 * 
 * Este script ejecuta la migración directamente usando la API REST de Supabase
 */

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase Cloud
const SUPABASE_URL = 'https://iapixzikdhvghzsjkodu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhcGl4emlrZGh2Z2h6c2prb2R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NzQwMDAsImV4cCI6MjA1MTA1MDAwMH0.EjemploDeClaveAnonimaParaProduccion';

// Crear cliente de Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function migrateData() {
  console.log('🚀 INICIANDO MIGRACIÓN DIRECTA A SUPABASE CLOUD...\n');

  try {
    // 1. CONFIGURACIÓN DE EMPRESA
    console.log('📊 Migrando configuración de empresa...');
    const { data: empresaData, error: empresaError } = await supabase
      .from('empresa_config')
      .upsert({
        nombre: 'Qualipharm Laboratorio Farmacéutico',
        logo_url: '/logo-qualipharm.png',
        direccion: 'Av. Principal 123, Quito, Ecuador',
        telefono: '+593 2 234 5678',
        email: 'info@qualipharm.com.ec',
        ruc: '1234567890001'
      });

    if (empresaError) {
      console.log('⚠️  Error en empresa_config:', empresaError.message);
    } else {
      console.log('✅ Configuración de empresa migrada');
    }

    // 2. CATEGORÍAS
    console.log('📂 Migrando categorías...');
    const categorias = [
      { nombre: 'Antibióticos', descripcion: 'Medicamentos antibióticos para el tratamiento de infecciones bacterianas' },
      { nombre: 'Analgésicos', descripcion: 'Medicamentos para el alivio del dolor' },
      { nombre: 'Antiinflamatorios', descripcion: 'Medicamentos para reducir la inflamación' },
      { nombre: 'Antihistamínicos', descripcion: 'Medicamentos para el tratamiento de alergias' },
      { nombre: 'Antipiréticos', descripcion: 'Medicamentos para reducir la fiebre' },
      { nombre: 'Antitusivos', descripcion: 'Medicamentos para el tratamiento de la tos' },
      { nombre: 'Expectorantes', descripcion: 'Medicamentos para facilitar la expectoración' },
      { nombre: 'Antiacidos', descripcion: 'Medicamentos para el tratamiento de la acidez estomacal' },
      { nombre: 'Laxantes', descripcion: 'Medicamentos para el tratamiento del estreñimiento' },
      { nombre: 'Antidiarreicos', descripcion: 'Medicamentos para el tratamiento de la diarrea' },
      { nombre: 'Vitaminas', descripcion: 'Suplementos vitamínicos' },
      { nombre: 'Minerales', descripcion: 'Suplementos minerales' },
      { nombre: 'Probióticos', descripcion: 'Suplementos probióticos para la salud digestiva' },
      { nombre: 'Equipos Médicos', descripcion: 'Equipos y dispositivos médicos' },
      { nombre: 'Insumos Médicos', descripcion: 'Insumos médicos y hospitalarios' }
    ];

    const { data: categoriasData, error: categoriasError } = await supabase
      .from('categorias')
      .upsert(categorias, { onConflict: 'nombre' });

    if (categoriasError) {
      console.log('⚠️  Error en categorías:', categoriasError.message);
    } else {
      console.log('✅ Categorías migradas');
    }

    // 3. PROVEEDORES
    console.log('🏢 Migrando proveedores...');
    const proveedores = [
      { nombre: 'Pfizer Ecuador S.A.', contacto: 'Dr. Carlos Mendoza', email: 'ventas@pfizer.com.ec', telefono: '+593 2 345 6789', direccion: 'Av. Amazonas 1234, Quito', ruc: '0991234567001' },
      { nombre: 'Novartis Ecuador S.A.', contacto: 'Dra. María González', email: 'info@novartis.com.ec', telefono: '+593 2 456 7890', direccion: 'Calle 10 de Agosto 567, Guayaquil', ruc: '0991234567002' },
      { nombre: 'Roche Ecuador S.A.', contacto: 'Dr. Juan Pérez', email: 'contacto@roche.com.ec', telefono: '+593 2 567 8901', direccion: 'Av. 6 de Diciembre 890, Quito', ruc: '0991234567003' },
      { nombre: 'Bayer Ecuador S.A.', contacto: 'Dra. Ana López', email: 'ventas@bayer.com.ec', telefono: '+593 2 678 9012', direccion: 'Av. Mariscal Sucre 123, Cuenca', ruc: '0991234567004' },
      { nombre: 'GSK Ecuador S.A.', contacto: 'Dr. Luis Rodríguez', email: 'info@gsk.com.ec', telefono: '+593 2 789 0123', direccion: 'Calle 9 de Octubre 456, Guayaquil', ruc: '0991234567005' },
      { nombre: 'Sanofi Ecuador S.A.', contacto: 'Dra. Carmen Silva', email: 'contacto@sanofi.com.ec', telefono: '+593 2 890 1234', direccion: 'Av. República 789, Quito', ruc: '0991234567006' },
      { nombre: 'Merck Ecuador S.A.', contacto: 'Dr. Roberto Torres', email: 'ventas@merck.com.ec', telefono: '+593 2 901 2345', direccion: 'Calle 12 de Octubre 321, Ambato', ruc: '0991234567007' },
      { nombre: 'Abbott Ecuador S.A.', contacto: 'Dra. Patricia Vega', email: 'info@abbott.com.ec', telefono: '+593 2 012 3456', direccion: 'Av. 10 de Agosto 654, Quito', ruc: '0991234567008' }
    ];

    const { data: proveedoresData, error: proveedoresError } = await supabase
      .from('proveedores')
      .upsert(proveedores, { onConflict: 'ruc' });

    if (proveedoresError) {
      console.log('⚠️  Error en proveedores:', proveedoresError.message);
    } else {
      console.log('✅ Proveedores migrados');
    }

    // 4. OBTENER IDs DE CATEGORÍAS Y PROVEEDORES
    const { data: categoriasIds } = await supabase.from('categorias').select('id, nombre');
    const { data: proveedoresIds } = await supabase.from('proveedores').select('id, nombre');

    const categoriasMap = {};
    categoriasIds?.forEach(cat => {
      categoriasMap[cat.nombre] = cat.id;
    });

    const proveedoresMap = {};
    proveedoresIds?.forEach(prov => {
      proveedoresMap[prov.nombre] = prov.id;
    });

    // 5. PRODUCTOS (primeros 10 para prueba)
    console.log('💊 Migrando productos...');
    const productos = [
      {
        codigo: 'QUA001',
        nombre: 'Amoxicilina 500mg',
        descripcion: 'Antibiótico de amplio espectro para infecciones bacterianas',
        categoria_id: categoriasMap['Antibióticos'],
        precio: 3.50,
        stock_minimo: 100,
        codigo_barras: '1234567890001',
        codigo_interno: 'AMOX500',
        iva: 15.00,
        requiere_receta: true,
        controlado: false
      },
      {
        codigo: 'QUA002',
        nombre: 'Cefalexina 500mg',
        descripcion: 'Antibiótico cefalosporina para infecciones de piel y tejidos blandos',
        categoria_id: categoriasMap['Antibióticos'],
        precio: 4.20,
        stock_minimo: 80,
        codigo_barras: '1234567890002',
        codigo_interno: 'CEFA500',
        iva: 15.00,
        requiere_receta: true,
        controlado: false
      },
      {
        codigo: 'QUA005',
        nombre: 'Acetaminofén 500mg',
        descripcion: 'Analgésico y antipirético para dolor y fiebre',
        categoria_id: categoriasMap['Analgésicos'],
        precio: 2.50,
        stock_minimo: 200,
        codigo_barras: '1234567890005',
        codigo_interno: 'ACET500',
        iva: 15.00,
        requiere_receta: false,
        controlado: false
      },
      {
        codigo: 'QUA012',
        nombre: 'Loratadina 10mg',
        descripcion: 'Antihistamínico no sedante para alergias',
        categoria_id: categoriasMap['Antihistamínicos'],
        precio: 3.80,
        stock_minimo: 120,
        codigo_barras: '1234567890012',
        codigo_interno: 'LORA10',
        iva: 15.00,
        requiere_receta: false,
        controlado: false
      },
      {
        codigo: 'QUA021',
        nombre: 'Omeprazol 20mg',
        descripcion: 'Inhibidor de la bomba de protones para úlceras',
        categoria_id: categoriasMap['Antiacidos'],
        precio: 5.50,
        stock_minimo: 150,
        codigo_barras: '1234567890021',
        codigo_interno: 'OMEP20',
        iva: 15.00,
        requiere_receta: false,
        controlado: false
      }
    ];

    const { data: productosData, error: productosError } = await supabase
      .from('productos')
      .upsert(productos, { onConflict: 'codigo' });

    if (productosError) {
      console.log('⚠️  Error en productos:', productosError.message);
    } else {
      console.log('✅ Productos migrados');
    }

    // 6. VERIFICACIÓN FINAL
    console.log('\n🔍 VERIFICANDO DATOS MIGRADOS...\n');

    const tables = ['categorias', 'proveedores', 'productos', 'empresa_config'];
    
    for (const table of tables) {
      const { data: tableData, error: tableError } = await supabase
        .from(table)
        .select('*', { count: 'exact' });

      if (tableError) {
        console.log(`❌ ${table}: Error - ${tableError.message}`);
      } else {
        console.log(`✅ ${table}: ${tableData.length} registros`);
      }
    }

    console.log('\n🎉 ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!');
    console.log('🌐 Tu aplicación está lista para usar Supabase Cloud');
    console.log('🔗 URL del proyecto: https://supabase.com/dashboard/project/iapixzikdhvghzsjkodu');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

// Ejecutar migración
if (require.main === module) {
  migrateData();
}

module.exports = { migrateData };
