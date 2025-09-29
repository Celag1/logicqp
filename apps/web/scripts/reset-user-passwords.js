const { createClient } = require('@supabase/supabase-js');

// Usar service role key para operaciones administrativas
const supabaseUrl = 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTEyMTQ1OSwiZXhwIjoyMDc0Njk3NDU5fQ.ds--rwknbADvlAUuRU0ypi0pwxr6Sd9Jr3CrPexxSsU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetUserPasswords() {
  console.log('🔐 Reseteando contraseñas de usuarios...');

  try {
    // 1. Listar usuarios existentes
    console.log('👥 Obteniendo usuarios existentes...');
    const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();

    if (authUsersError) {
      console.error('❌ Error listando usuarios:', authUsersError.message);
      return;
    }

    console.log(`📊 Usuarios encontrados: ${authUsers.users.length}`);

    // 2. Resetear contraseñas para usuarios confirmados
    const usersToReset = [
      { email: 'admin@logicqp.com', password: 'Admin123!', role: 'admin' },
      { email: 'vendedor1@logicqp.com', password: 'Vendedor123!', role: 'vendedor' },
      { email: 'vendedor2@logicqp.com', password: 'Vendedor123!', role: 'vendedor' },
      { email: 'cliente1@email.com', password: 'Cliente123!', role: 'cliente' },
      { email: 'cliente2@email.com', password: 'Cliente123!', role: 'cliente' },
      { email: 'cliente3@email.com', password: 'Cliente123!', role: 'cliente' },
      { email: 'cliente4@email.com', password: 'Cliente123!', role: 'cliente' }
    ];

    for (const userConfig of usersToReset) {
      const user = authUsers.users.find(u => u.email === userConfig.email);
      
      if (user) {
        console.log(`\n🔄 Reseteando contraseña para ${userConfig.email}...`);
        
        // Actualizar contraseña y metadata
        const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
          password: userConfig.password,
          email_confirm: true,
          user_metadata: {
            nombre: userConfig.email.split('@')[0],
            rol: userConfig.role,
            empresa: 'Qualipharm'
          }
        });

        if (updateError) {
          console.error(`❌ Error actualizando ${userConfig.email}:`, updateError.message);
        } else {
          console.log(`✅ Contraseña actualizada para ${userConfig.email}`);
        }

        // Actualizar perfil en la tabla profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            rol: userConfig.role,
            updated_at: new Date().toISOString()
          })
          .eq('email', userConfig.email);

        if (profileError) {
          console.log(`⚠️ Error actualizando perfil para ${userConfig.email}:`, profileError.message);
        } else {
          console.log(`✅ Perfil actualizado para ${userConfig.email}`);
        }
      } else {
        console.log(`⚠️ Usuario ${userConfig.email} no encontrado en auth.users`);
      }
    }

    // 3. Probar login con cada usuario
    console.log('\n🔐 Probando login con usuarios actualizados...');
    
    for (const userConfig of usersToReset) {
      console.log(`\n🔑 Probando ${userConfig.email}...`);
      
      try {
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: userConfig.email,
          password: userConfig.password
        });

        if (loginError) {
          console.log(`❌ Error: ${loginError.message}`);
        } else {
          console.log(`✅ ¡Login exitoso!`);
          console.log(`   Usuario: ${loginData.user.email}`);
          console.log(`   ID: ${loginData.user.id}`);
          console.log(`   Rol: ${userConfig.role}`);
        }
      } catch (error) {
        console.log(`❌ Error general: ${error.message}`);
      }
    }

    // 4. Crear usuario super admin específico
    console.log('\n👑 Creando usuario super admin específico...');
    
    // Intentar crear celag3@gmail.com
    const { data: superAdminData, error: superAdminError } = await supabase.auth.admin.createUser({
      email: 'celag3@gmail.com',
      password: 'Ibot1801538719',
      email_confirm: true,
      user_metadata: {
        nombre: 'Celso Aguirre',
        rol: 'super_admin',
        empresa: 'Qualipharm'
      }
    });

    if (superAdminError) {
      console.log(`⚠️ Error creando super admin: ${superAdminError.message}`);
      
      // Si no se puede crear, usar el primer admin como super admin
      const adminUser = authUsers.users.find(u => u.email === 'admin@logicqp.com');
      if (adminUser) {
        console.log('🔄 Actualizando admin@logicqp.com a super_admin...');
        
        const { error: updateAdminError } = await supabase.auth.admin.updateUserById(adminUser.id, {
          user_metadata: {
            nombre: 'Celso Aguirre',
            rol: 'super_admin',
            empresa: 'Qualipharm'
          }
        });

        if (updateAdminError) {
          console.error('❌ Error actualizando admin:', updateAdminError.message);
        } else {
          console.log('✅ Admin actualizado a super_admin');
        }

        // Actualizar perfil
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({
            nombre: 'Celso Aguirre',
            rol: 'super_admin',
            updated_at: new Date().toISOString()
          })
          .eq('email', 'admin@logicqp.com');

        if (profileUpdateError) {
          console.log('⚠️ Error actualizando perfil de admin:', profileUpdateError.message);
        } else {
          console.log('✅ Perfil de admin actualizado a super_admin');
        }
      }
    } else {
      console.log('✅ Super admin celag3@gmail.com creado exitosamente');
    }

    console.log('\n🎯 CREDENCIALES FINALES:');
    console.log('=========================');
    console.log('👑 SUPER ADMIN:');
    console.log('   Email: admin@logicqp.com');
    console.log('   Contraseña: Admin123!');
    console.log('   Rol: super_admin');
    
    console.log('\n👨‍💼 ADMIN:');
    console.log('   Email: admin@logicqp.com');
    console.log('   Contraseña: Admin123!');
    console.log('   Rol: super_admin (mismo usuario)');
    
    console.log('\n👨‍💻 VENDEDOR:');
    console.log('   Email: vendedor1@logicqp.com');
    console.log('   Contraseña: Vendedor123!');
    console.log('   Rol: vendedor');
    
    console.log('\n👤 CLIENTE:');
    console.log('   Email: cliente1@email.com');
    console.log('   Contraseña: Cliente123!');
    console.log('   Rol: cliente');

    console.log('\n🌐 URL: https://web-6z358avvg-celso-aguirres-projects.vercel.app');
    console.log('\n📋 INSTRUCCIONES:');
    console.log('1. Ve a la URL de la aplicación');
    console.log('2. Haz clic en "Iniciar Sesión"');
    console.log('3. Usa cualquiera de las credenciales de arriba');
    console.log('4. El super admin es admin@logicqp.com con contraseña Admin123!');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

resetUserPasswords();
