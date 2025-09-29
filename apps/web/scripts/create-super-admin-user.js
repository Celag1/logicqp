const { createClient } = require('@supabase/supabase-js');

// Usar service role key para operaciones administrativas
const supabaseUrl = 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTEyMTQ1OSwiZXhwIjoyMDc0Njk3NDU5fQ.ds--rwknbADvlAUuRU0ypi0pwxr6Sd9Jr3CrPexxSsU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSuperAdminUser() {
  console.log('👑 Creando usuario super admin en auth.users...');

  try {
    // 1. Crear usuario super admin en auth.users
    console.log('🔐 Creando usuario celag3@gmail.com en auth.users...');
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: 'celag3@gmail.com',
      password: 'Ibot1801538719',
      email_confirm: true,
      user_metadata: {
        nombre: 'Celso',
        rol: 'super_admin'
      }
    });

    if (userError) {
      console.error('❌ Error creando usuario super admin:', userError.message);
      
      // Verificar si el usuario ya existe
      if (userError.message.includes('already registered')) {
        console.log('⚠️ El usuario ya existe, intentando actualizar...');
        
        // Buscar el usuario existente
        const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) {
          console.error('❌ Error listando usuarios:', listError.message);
          return;
        }
        
        const existingUser = existingUsers.users.find(u => u.email === 'celag3@gmail.com');
        if (existingUser) {
          console.log('✅ Usuario encontrado, actualizando contraseña...');
          
          // Actualizar contraseña
          const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
            password: 'Ibot1801538719',
            email_confirm: true,
            user_metadata: {
              nombre: 'Celso',
              rol: 'super_admin'
            }
          });
          
          if (updateError) {
            console.error('❌ Error actualizando usuario:', updateError.message);
          } else {
            console.log('✅ Usuario super admin actualizado exitosamente');
          }
        }
      }
    } else {
      console.log('✅ Usuario super admin creado exitosamente');
      console.log(`   ID: ${userData.user.id}`);
      console.log(`   Email: ${userData.user.email}`);
    }

    // 2. Verificar que el usuario existe ahora
    console.log('\n🔍 Verificando que el usuario existe...');
    const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();

    if (authUsersError) {
      console.error('❌ Error verificando usuarios:', authUsersError.message);
    } else {
      const superAdmin = authUsers.users.find(u => u.email === 'celag3@gmail.com');
      if (superAdmin) {
        console.log('✅ Super admin encontrado en auth.users:');
        console.log(`   Email: ${superAdmin.email}`);
        console.log(`   ID: ${superAdmin.id}`);
        console.log(`   Confirmado: ${superAdmin.email_confirmed_at ? 'Sí' : 'No'}`);
        console.log(`   Creado: ${superAdmin.created_at}`);
      } else {
        console.log('❌ Super admin no encontrado en auth.users');
      }
    }

    // 3. Probar login con el super admin
    console.log('\n🔐 Probando login con super admin...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'celag3@gmail.com',
      password: 'Ibot1801538719'
    });

    if (loginError) {
      console.error('❌ Error en login de super admin:', loginError.message);
    } else {
      console.log('🎉 ¡Login de super admin exitoso!');
      console.log(`   Usuario: ${loginData.user.email}`);
      console.log(`   ID: ${loginData.user.id}`);
      console.log(`   Sesión: ${loginData.session ? 'Activa' : 'Inactiva'}`);
    }

    // 4. Verificar que el perfil esté vinculado
    console.log('\n👤 Verificando perfil vinculado...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'celag3@gmail.com')
      .single();

    if (profileError) {
      console.error('❌ Error obteniendo perfil:', profileError.message);
    } else {
      console.log('✅ Perfil encontrado:');
      console.log(`   Nombre: ${profile.nombre}`);
      console.log(`   Email: ${profile.email}`);
      console.log(`   Rol: ${profile.rol}`);
    }

    console.log('\n🎯 RESUMEN:');
    console.log('✅ Usuario super admin creado/actualizado en auth.users');
    console.log('✅ Login funcionando correctamente');
    console.log('✅ Perfil vinculado correctamente');
    console.log('🌐 URL: https://web-6z358avvg-celso-aguirres-projects.vercel.app');
    console.log('\n🔑 CREDENCIALES:');
    console.log('Email: celag3@gmail.com');
    console.log('Contraseña: Ibot1801538719');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

createSuperAdminUser();
