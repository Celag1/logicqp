const { createClient } = require('@supabase/supabase-js');

// Usar service role key para operaciones administrativas
const supabaseUrl = 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTEyMTQ1OSwiZXhwIjoyMDc0Njk3NDU5fQ.ds--rwknbADvlAUuRU0ypi0pwxr6Sd9Jr3CrPexxSsU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateExistingUserToSuperAdmin() {
  console.log('🔄 Actualizando usuario existente a super admin...');

  try {
    // 1. Listar usuarios existentes
    console.log('👥 Listando usuarios existentes...');
    const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();

    if (authUsersError) {
      console.error('❌ Error listando usuarios:', authUsersError.message);
      return;
    }

    console.log(`📊 Usuarios disponibles: ${authUsers.users.length}`);
    authUsers.users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ID: ${user.id} - Confirmado: ${user.email_confirmed_at ? 'Sí' : 'No'}`);
    });

    // 2. Usar el primer usuario confirmado como super admin
    const confirmedUser = authUsers.users.find(u => u.email_confirmed_at);
    
    if (!confirmedUser) {
      console.error('❌ No hay usuarios confirmados disponibles');
      return;
    }

    console.log(`\n👑 Usando usuario ${confirmedUser.email} como super admin...`);

    // 3. Actualizar metadata del usuario
    console.log('📝 Actualizando metadata del usuario...');
    const { error: updateError } = await supabase.auth.admin.updateUserById(confirmedUser.id, {
      user_metadata: {
        nombre: 'Celso Aguirre',
        rol: 'super_admin',
        empresa: 'Qualipharm',
        es_super_admin: true
      }
    });

    if (updateError) {
      console.error('❌ Error actualizando metadata:', updateError.message);
    } else {
      console.log('✅ Metadata actualizada exitosamente');
    }

    // 4. Actualizar perfil en la tabla profiles
    console.log('👤 Actualizando perfil en la tabla profiles...');
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        nombre: 'Celso Aguirre',
        rol: 'super_admin',
        updated_at: new Date().toISOString()
      })
      .eq('email', confirmedUser.email);

    if (profileUpdateError) {
      console.error('❌ Error actualizando perfil:', profileUpdateError.message);
    } else {
      console.log('✅ Perfil actualizado exitosamente');
    }

    // 5. Probar login con el usuario actualizado
    console.log(`\n🔐 Probando login con ${confirmedUser.email}...`);
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: confirmedUser.email,
      password: 'Admin123!' // Usar la contraseña por defecto
    });

    if (loginError) {
      console.error('❌ Error en login:', loginError.message);
      console.log('\n💡 Intenta con estas contraseñas comunes:');
      console.log('- Admin123!');
      console.log('- Vendedor123!');
      console.log('- Cliente123!');
    } else {
      console.log('🎉 ¡Login exitoso!');
      console.log(`   Usuario: ${loginData.user.email}`);
      console.log(`   ID: ${loginData.user.id}`);
      console.log(`   Sesión: ${loginData.session ? 'Activa' : 'Inactiva'}`);
    }

    // 6. Verificar perfil actualizado
    console.log('\n👤 Verificando perfil actualizado...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', confirmedUser.email)
      .single();

    if (profileError) {
      console.error('❌ Error obteniendo perfil:', profileError.message);
    } else {
      console.log('✅ Perfil actualizado:');
      console.log(`   Nombre: ${profile.nombre}`);
      console.log(`   Email: ${profile.email}`);
      console.log(`   Rol: ${profile.rol}`);
    }

    console.log('\n🎯 CREDENCIALES DE SUPER ADMIN:');
    console.log('================================');
    console.log(`📧 Email: ${confirmedUser.email}`);
    console.log('🔑 Contraseña: Admin123! (o Vendedor123! o Cliente123!)');
    console.log('👑 Rol: super_admin');
    console.log('🌐 URL: https://web-6z358avvg-celso-aguirres-projects.vercel.app');

    console.log('\n📋 INSTRUCCIONES:');
    console.log('1. Ve a la URL de la aplicación');
    console.log('2. Haz clic en "Iniciar Sesión"');
    console.log('3. Usa el email y contraseña de arriba');
    console.log('4. Si no funciona, prueba las otras contraseñas mencionadas');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

updateExistingUserToSuperAdmin();
