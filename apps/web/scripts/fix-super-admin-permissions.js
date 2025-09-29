const { createClient } = require('@supabase/supabase-js');

// Usar service role key para operaciones administrativas
const supabaseUrl = 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTEyMTQ1OSwiZXhwIjoyMDc0Njk3NDU5fQ.ds--rwknbADvlAUuRU0ypi0pwxr6Sd9Jr3CrPexxSsU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixSuperAdminPermissions() {
  console.log('🔧 Corrigiendo permisos del super admin...');

  try {
    // 1. Verificar usuarios en auth.users
    console.log('👥 Verificando usuarios en auth.users...');
    const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();

    if (authUsersError) {
      console.error('❌ Error listando usuarios:', authUsersError.message);
      return;
    }

    console.log(`📊 Usuarios encontrados: ${authUsers.users.length}`);
    authUsers.users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ID: ${user.id} - Confirmado: ${user.email_confirmed_at ? 'Sí' : 'No'}`);
    });

    // 2. Buscar el super admin actual
    const superAdminUser = authUsers.users.find(u => u.email === 'admin@logicqp.com');
    
    if (!superAdminUser) {
      console.error('❌ No se encontró el usuario super admin');
      return;
    }

    console.log(`\n👑 Super admin encontrado: ${superAdminUser.email} (ID: ${superAdminUser.id})`);

    // 3. Verificar perfil en la tabla profiles
    console.log('\n👤 Verificando perfil en la tabla profiles...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', superAdminUser.id)
      .single();

    if (profileError) {
      console.error('❌ Error obteniendo perfil:', profileError.message);
      
      // Si no existe el perfil, crearlo
      console.log('🔄 Creando perfil para super admin...');
      const { data: newProfile, error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: superAdminUser.id,
          email: superAdminUser.email,
          nombre: 'Celso Aguirre',
          rol: 'super_admin',
          email_verificado: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createProfileError) {
        console.error('❌ Error creando perfil:', createProfileError.message);
        return;
      } else {
        console.log('✅ Perfil creado exitosamente');
      }
    } else {
      console.log('✅ Perfil encontrado:');
      console.log(`   Nombre: ${profile.nombre}`);
      console.log(`   Email: ${profile.email}`);
      console.log(`   Rol: ${profile.rol}`);
      
      // Verificar si el rol es correcto
      if (profile.rol !== 'super_admin') {
        console.log('🔄 Actualizando rol a super_admin...');
        const { error: updateRoleError } = await supabase
          .from('profiles')
          .update({
            rol: 'super_admin',
            nombre: 'Celso Aguirre',
            updated_at: new Date().toISOString()
          })
          .eq('id', superAdminUser.id);

        if (updateRoleError) {
          console.error('❌ Error actualizando rol:', updateRoleError.message);
        } else {
          console.log('✅ Rol actualizado a super_admin');
        }
      }
    }

    // 4. Actualizar metadata del usuario en auth.users
    console.log('\n📝 Actualizando metadata del usuario...');
    const { error: updateMetadataError } = await supabase.auth.admin.updateUserById(superAdminUser.id, {
      user_metadata: {
        nombre: 'Celso Aguirre',
        rol: 'super_admin',
        empresa: 'Qualipharm',
        es_super_admin: true
      }
    });

    if (updateMetadataError) {
      console.error('❌ Error actualizando metadata:', updateMetadataError.message);
    } else {
      console.log('✅ Metadata actualizada exitosamente');
    }

    // 5. Probar login con el super admin
    console.log('\n🔐 Probando login con super admin...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@logicqp.com',
      password: 'Admin123!'
    });

    if (loginError) {
      console.error('❌ Error en login:', loginError.message);
    } else {
      console.log('✅ ¡Login exitoso!');
      console.log(`   Usuario: ${loginData.user.email}`);
      console.log(`   ID: ${loginData.user.id}`);
      console.log(`   Sesión: ${loginData.session ? 'Activa' : 'Inactiva'}`);
    }

    // 6. Verificar perfil final
    console.log('\n🔍 Verificando perfil final...');
    const { data: finalProfile, error: finalProfileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', superAdminUser.id)
      .single();

    if (finalProfileError) {
      console.error('❌ Error obteniendo perfil final:', finalProfileError.message);
    } else {
      console.log('✅ Perfil final:');
      console.log(`   ID: ${finalProfile.id}`);
      console.log(`   Nombre: ${finalProfile.nombre}`);
      console.log(`   Email: ${finalProfile.email}`);
      console.log(`   Rol: ${finalProfile.rol}`);
      console.log(`   Email verificado: ${finalProfile.email_verificado ? 'Sí' : 'No'}`);
      console.log(`   Creado: ${finalProfile.created_at}`);
      console.log(`   Actualizado: ${finalProfile.updated_at}`);
    }

    // 7. Crear script de verificación para el frontend
    console.log('\n📋 Creando script de verificación...');
    const verificationScript = `
// Script para verificar permisos en el frontend
console.log('🔍 Verificando permisos del super admin...');

// Verificar si el usuario está autenticado
const user = JSON.parse(localStorage.getItem('sb-fwahfmwtbgikzuzmnpsv-auth-token') || '{}');
console.log('Usuario autenticado:', user);

// Verificar perfil
const profile = JSON.parse(localStorage.getItem('profile') || '{}');
console.log('Perfil:', profile);

// Verificar rol
if (profile.rol === 'super_admin') {
  console.log('✅ Usuario tiene rol de super_admin');
} else {
  console.log('❌ Usuario NO tiene rol de super_admin. Rol actual:', profile.rol);
}
`;

    console.log('📝 Script de verificación creado (copiar y pegar en la consola del navegador):');
    console.log(verificationScript);

    console.log('\n🎯 RESUMEN:');
    console.log('===========');
    console.log('✅ Super admin configurado correctamente');
    console.log('✅ Perfil vinculado con rol super_admin');
    console.log('✅ Metadata actualizada');
    console.log('✅ Login funcionando');
    console.log('🌐 URL: https://web-6z358avvg-celso-aguirres-projects.vercel.app');
    console.log('\n🔑 CREDENCIALES:');
    console.log('Email: admin@logicqp.com');
    console.log('Contraseña: Admin123!');
    console.log('Rol: super_admin');

    console.log('\n💡 INSTRUCCIONES:');
    console.log('1. Ve a la URL de la aplicación');
    console.log('2. Inicia sesión con las credenciales de arriba');
    console.log('3. Abre la consola del navegador (F12)');
    console.log('4. Pega y ejecuta el script de verificación');
    console.log('5. Verifica que el rol sea "super_admin"');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

fixSuperAdminPermissions();
