#!/usr/bin/env node

/**
 * CORRECCIÓN DE DATOS EN SUPABASE CLOUD CON SERVICE KEY
 * ====================================================
 */

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase Cloud
const SUPABASE_URL = 'https://iapixzikdhvghzsjkodu.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhcGl4emlrZGh2Z2h6c2prb2R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQ4ODcwNSwiZXhwIjoyMDcyMDY0NzA1fQ.Z2Z17gPI1rpJNqemEhjpGdsJ9kbzRmTaVgrB-lGufmA';

// Crear cliente con service key (bypass RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixCloudData() {
  console.log('🔧 CORRIGIENDO DATOS EN SUPABASE CLOUD...\n');

  try {
    // 1. CONFIGURAR EMPRESA
    console.log('🏢 Configurando empresa...');
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
      console.log('❌ Error en empresa:', empresaError.message);
    } else {
      console.log('✅ Empresa configurada');
    }

    // 2. CREAR USUARIOS DEL SISTEMA
    console.log('\n👥 Creando usuarios del sistema...');
    
    // Crear Celso Aguirre como super-admin
    console.log('🔐 Creando Celso Aguirre (super-admin)...');
    
    // Primero crear en auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'celag3@gmail.com',
      password: 'Ibot1801538719',
      email_confirm: true,
      user_metadata: {
        nombre: 'Celso',
        apellido: 'Aguirre'
      }
    });

    if (authError) {
      console.log('⚠️  Error creando usuario auth:', authError.message);
    } else {
      console.log('✅ Usuario auth creado:', authUser.user?.id);
      
      // Crear perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.user.id,
          email: 'celag3@gmail.com',
          nombre: 'Celso',
          apellido: 'Aguirre',
          rol: 'super_admin',
          telefono: '0998769259',
          direccion: 'Av. Bolivariana 1441 y Genovesa, Ambato, Ecuador',
          empresa: 'IngSoft S.A.',
          email_verificado: true,
          telefono_verificado: true
        });

      if (profileError) {
        console.log('❌ Error creando perfil:', profileError.message);
      } else {
        console.log('✅ Perfil de super-admin creado');
      }
    }

    // Crear Worman Andrade como administrador
    console.log('🔐 Creando Worman Andrade (administrador)...');
    
    const { data: authUser2, error: authError2 } = await supabase.auth.admin.createUser({
      email: 'Wormandrade@gmail.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        nombre: 'Worman',
        apellido: 'Andrade'
      }
    });

    if (authError2) {
      console.log('⚠️  Error creando usuario auth:', authError2.message);
    } else {
      console.log('✅ Usuario auth creado:', authUser2.user?.id);
      
      // Crear perfil
      const { data: profileData2, error: profileError2 } = await supabase
        .from('profiles')
        .insert({
          id: authUser2.user.id,
          email: 'Wormandrade@gmail.com',
          nombre: 'Worman',
          apellido: 'Andrade',
          rol: 'administrador',
          telefono: '0987710721',
          direccion: 'Quito, Ecuador',
          empresa: 'Qualipharm Laboratorio Farmacéutico',
          email_verificado: true,
          telefono_verificado: true
        });

      if (profileError2) {
        console.log('❌ Error creando perfil:', profileError2.message);
      } else {
        console.log('✅ Perfil de administrador creado');
      }
    }

    // 3. VERIFICACIÓN FINAL
    console.log('\n🔍 VERIFICACIÓN FINAL...\n');

    const { data: finalEmpresa } = await supabase.from('empresa_config').select('*');
    const { data: finalUsuarios } = await supabase.from('profiles').select('*');

    console.log(`📊 Datos finales:`);
    console.log(`   - Empresa: ${finalEmpresa?.length || 0}`);
    console.log(`   - Usuarios: ${finalUsuarios?.length || 0}`);

    if (finalUsuarios && finalUsuarios.length > 0) {
      console.log('\n👥 Usuarios del sistema:');
      finalUsuarios.forEach(user => {
        console.log(`   - ${user.nombre} ${user.apellido} (${user.email}) - Rol: ${user.rol}`);
      });
    }

    console.log('\n🎉 ¡CORRECCIÓN COMPLETADA!');
    console.log('🌐 Tu base de datos en Supabase Cloud está lista');
    console.log('🔗 URL del proyecto: https://supabase.com/dashboard/project/iapixzikdhvghzsjkodu');

  } catch (error) {
    console.error('❌ Error durante la corrección:', error);
    process.exit(1);
  }
}

// Ejecutar corrección
if (require.main === module) {
  fixCloudData();
}

module.exports = { fixCloudData };
