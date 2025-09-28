#!/usr/bin/env node

/**
 * ACTUALIZACIÓN INTELIGENTE DE SUPABASE CLOUD
 * ===========================================
 * 
 * Este script actualiza solo los datos necesarios en la base existente
 */

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase Cloud
const SUPABASE_URL = 'https://iapixzikdhvghzsjkodu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhcGl4emlrZGh2Z2h6c2prb2R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODg3MDUsImV4cCI6MjA3MjA2NDcwNX0.myVS1ZgYewbf44jUblez3fB_OVAAmj6ddAkpGSGlJe0';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhcGl4emlrZGh2Z2h6c2prb2R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQ4ODcwNSwiZXhwIjoyMDcyMDY0NzA1fQ.Z2Z17gPI1rpJNqemEhjpGdsJ9kbzRmTaVgrB-lGufmA';

// Crear cliente de Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function updateCloudData() {
  console.log('🚀 ACTUALIZANDO DATOS EN SUPABASE CLOUD...\n');

  try {
    // 1. VERIFICAR DATOS EXISTENTES
    console.log('🔍 Verificando datos existentes...\n');

    const { data: categorias, error: catError } = await supabase
      .from('categorias')
      .select('*');

    const { data: proveedores, error: provError } = await supabase
      .from('proveedores')
      .select('*');

    const { data: productos, error: prodError } = await supabase
      .from('productos')
      .select('*');

    const { data: empresa, error: empError } = await supabase
      .from('empresa_config')
      .select('*');

    const { data: usuarios, error: userError } = await supabase
      .from('profiles')
      .select('*');

    console.log(`📊 Estado actual:`);
    console.log(`   - Categorías: ${categorias?.length || 0}`);
    console.log(`   - Proveedores: ${proveedores?.length || 0}`);
    console.log(`   - Productos: ${productos?.length || 0}`);
    console.log(`   - Empresa: ${empresa?.length || 0}`);
    console.log(`   - Usuarios: ${usuarios?.length || 0}\n`);

    // 2. ACTUALIZAR CONFIGURACIÓN DE EMPRESA
    console.log('🏢 Actualizando configuración de empresa...');
    const { data: empresaUpdate, error: empresaUpdateError } = await supabase
      .from('empresa_config')
      .upsert({
        nombre: 'Qualipharm Laboratorio Farmacéutico',
        logo_url: '/logo-qualipharm.png',
        direccion: 'Av. Principal 123, Quito, Ecuador',
        telefono: '+593 2 234 5678',
        email: 'info@qualipharm.com.ec',
        ruc: '1234567890001'
      });

    if (empresaUpdateError) {
      console.log('⚠️  Error en empresa:', empresaUpdateError.message);
    } else {
      console.log('✅ Configuración de empresa actualizada');
    }

    // 3. AGREGAR CATEGORÍAS FALTANTES
    console.log('\n📂 Actualizando categorías...');
    const categoriasNuevas = [
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

    for (const categoria of categoriasNuevas) {
      const { data: catData, error: catError } = await supabase
        .from('categorias')
        .upsert(categoria, { onConflict: 'nombre' });

      if (catError) {
        console.log(`  ⚠️  Error en ${categoria.nombre}: ${catError.message}`);
      } else {
        console.log(`  ✅ ${categoria.nombre}`);
      }
    }

    // 4. AGREGAR PROVEEDORES FALTANTES
    console.log('\n🏢 Actualizando proveedores...');
    const proveedoresNuevos = [
      { nombre: 'Pfizer Ecuador S.A.', contacto: 'Dr. Carlos Mendoza', email: 'ventas@pfizer.com.ec', telefono: '+593 2 345 6789', direccion: 'Av. Amazonas 1234, Quito', ruc: '0991234567001' },
      { nombre: 'Novartis Ecuador S.A.', contacto: 'Dra. María González', email: 'info@novartis.com.ec', telefono: '+593 2 456 7890', direccion: 'Calle 10 de Agosto 567, Guayaquil', ruc: '0991234567002' },
      { nombre: 'Roche Ecuador S.A.', contacto: 'Dr. Juan Pérez', email: 'contacto@roche.com.ec', telefono: '+593 2 567 8901', direccion: 'Av. 6 de Diciembre 890, Quito', ruc: '0991234567003' },
      { nombre: 'Bayer Ecuador S.A.', contacto: 'Dra. Ana López', email: 'ventas@bayer.com.ec', telefono: '+593 2 678 9012', direccion: 'Av. Mariscal Sucre 123, Cuenca', ruc: '0991234567004' },
      { nombre: 'GSK Ecuador S.A.', contacto: 'Dr. Luis Rodríguez', email: 'info@gsk.com.ec', telefono: '+593 2 789 0123', direccion: 'Calle 9 de Octubre 456, Guayaquil', ruc: '0991234567005' },
      { nombre: 'Sanofi Ecuador S.A.', contacto: 'Dra. Carmen Silva', email: 'contacto@sanofi.com.ec', telefono: '+593 2 890 1234', direccion: 'Av. República 789, Quito', ruc: '0991234567006' },
      { nombre: 'Merck Ecuador S.A.', contacto: 'Dr. Roberto Torres', email: 'ventas@merck.com.ec', telefono: '+593 2 901 2345', direccion: 'Calle 12 de Octubre 321, Ambato', ruc: '0991234567007' },
      { nombre: 'Abbott Ecuador S.A.', contacto: 'Dra. Patricia Vega', email: 'info@abbott.com.ec', telefono: '+593 2 012 3456', direccion: 'Av. 10 de Agosto 654, Quito', ruc: '0991234567008' }
    ];

    for (const proveedor of proveedoresNuevos) {
      const { data: provData, error: provError } = await supabase
        .from('proveedores')
        .upsert(proveedor, { onConflict: 'ruc' });

      if (provError) {
        console.log(`  ⚠️  Error en ${proveedor.nombre}: ${provError.message}`);
      } else {
        console.log(`  ✅ ${proveedor.nombre}`);
      }
    }

    // 5. VERIFICAR Y CREAR USUARIOS DEL SISTEMA
    console.log('\n👥 Verificando usuarios del sistema...');
    
    // Verificar si Celso Aguirre existe
    const { data: celsoExists } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'celag3@gmail.com')
      .single();

    if (!celsoExists) {
      console.log('🔐 Creando usuario super-admin: Celso Aguirre...');
      // Aquí necesitaríamos usar la API de administración para crear el usuario
      console.log('⚠️  Usuario Celso Aguirre no existe - necesita ser creado manualmente');
    } else {
      console.log('✅ Usuario Celso Aguirre ya existe');
    }

    // 6. VERIFICACIÓN FINAL
    console.log('\n🔍 VERIFICACIÓN FINAL...\n');

    const { data: finalCategorias } = await supabase.from('categorias').select('*');
    const { data: finalProveedores } = await supabase.from('proveedores').select('*');
    const { data: finalEmpresa } = await supabase.from('empresa_config').select('*');
    const { data: finalUsuarios } = await supabase.from('profiles').select('*');

    console.log(`📊 Datos finales:`);
    console.log(`   - Categorías: ${finalCategorias?.length || 0}`);
    console.log(`   - Proveedores: ${finalProveedores?.length || 0}`);
    console.log(`   - Empresa: ${finalEmpresa?.length || 0}`);
    console.log(`   - Usuarios: ${finalUsuarios?.length || 0}`);

    console.log('\n🎉 ¡ACTUALIZACIÓN COMPLETADA!');
    console.log('🌐 Tu base de datos en Supabase Cloud está actualizada');
    console.log('🔗 URL del proyecto: https://supabase.com/dashboard/project/iapixzikdhvghzsjkodu');

  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
    process.exit(1);
  }
}

// Ejecutar actualización
if (require.main === module) {
  updateCloudData();
}

module.exports = { updateCloudData };
