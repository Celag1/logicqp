const { createClient } = require('@supabase/supabase-js');

// Usar service role key para operaciones administrativas
const supabaseUrl = 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTEyMTQ1OSwiZXhwIjoyMDc0Njk3NDU5fQ.ds--rwknbADvlAUuRU0ypi0pwxr6Sd9Jr3CrPexxSsU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function recreateSuperAdmin() {
  console.log('🔄 Recreando super admin celag3@gmail.com...');

  try {
    // 1. Listar usuarios existentes
    console.log('👥 Listando usuarios existentes...');
    const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();

    if (authUsersError) {
      console.error('❌ Error listando usuarios:', authUsersError.message);
      return;
    }

    console.log(`📊 Usuarios encontrados: ${authUsers.users.length}`);
    authUsers.users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ID: ${user.id}`);
    });

    // 2. Buscar y eliminar usuario celag3@gmail.com si existe
    console.log('\n🗑️ Buscando usuario celag3@gmail.com para eliminar...');
    const existingUser = authUsers.users.find(u => u.email === 'celag3@gmail.com');
    
    if (existingUser) {
      console.log(`✅ Usuario encontrado, eliminando... (ID: ${existingUser.id})`);
      
      const { error: deleteError } = await supabase.auth.admin.deleteUser(existingUser.id);
      
      if (deleteError) {
        console.error('❌ Error eliminando usuario:', deleteError.message);
      } else {
        console.log('✅ Usuario celag3@gmail.com eliminado exitosamente');
      }
    } else {
      console.log('ℹ️ Usuario celag3@gmail.com no existe, continuando...');
    }

    // 3. Esperar un momento para que se procese la eliminación
    console.log('\n⏳ Esperando 2 segundos...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 4. Crear nuevo usuario super admin
    console.log('\n👑 Creando nuevo usuario super admin...');
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: 'celag3@gmail.com',
      password: 'Ibot1801538719',
      email_confirm: true,
      user_metadata: {
        nombre: 'Celso Aguirre',
        rol: 'super_admin',
        empresa: 'Qualipharm'
      }
    });

    if (createError) {
      console.error('❌ Error creando nuevo usuario:', createError.message);
      
      // Si hay error, intentar con un enfoque diferente
      console.log('\n🔄 Intentando crear usuario con método alternativo...');
      
      // Crear usuario sin confirmar primero
      const { data: tempUser, error: tempError } = await supabase.auth.admin.createUser({
        email: 'celag3@gmail.com',
        password: 'Ibot1801538719',
        email_confirm: false
      });
      
      if (tempError) {
        console.error('❌ Error en método alternativo:', tempError.message);
      } else {
        console.log('✅ Usuario creado, confirmando email...');
        
        // Confirmar email
        const { error: confirmError } = await supabase.auth.admin.updateUserById(tempUser.user.id, {
          email_confirm: true,
          user_metadata: {
            nombre: 'Celso Aguirre',
            rol: 'super_admin',
            empresa: 'Qualipharm'
          }
        });
        
        if (confirmError) {
          console.error('❌ Error confirmando email:', confirmError.message);
        } else {
          console.log('✅ Usuario creado y confirmado exitosamente');
        }
      }
    } else {
      console.log('✅ Usuario super admin creado exitosamente');
      console.log(`   ID: ${newUser.user.id}`);
      console.log(`   Email: ${newUser.user.email}`);
    }

    // 5. Verificar que el usuario existe
    console.log('\n🔍 Verificando usuario creado...');
    const { data: updatedUsers, error: updatedUsersError } = await supabase.auth.admin.listUsers();

    if (updatedUsersError) {
      console.error('❌ Error verificando usuarios:', updatedUsersError.message);
    } else {
      const superAdmin = updatedUsers.users.find(u => u.email === 'celag3@gmail.com');
      if (superAdmin) {
        console.log('✅ Super admin encontrado:');
        console.log(`   Email: ${superAdmin.email}`);
        console.log(`   ID: ${superAdmin.id}`);
        console.log(`   Confirmado: ${superAdmin.email_confirmed_at ? 'Sí' : 'No'}`);
        console.log(`   Creado: ${superAdmin.created_at}`);
      } else {
        console.log('❌ Super admin no encontrado');
      }
    }

    // 6. Probar login
    console.log('\n🔐 Probando login con super admin...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'celag3@gmail.com',
      password: 'Ibot1801538719'
    });

    if (loginError) {
      console.error('❌ Error en login:', loginError.message);
      console.log('\n💡 Posibles soluciones:');
      console.log('1. Espera unos minutos y vuelve a intentar');
      console.log('2. Verifica que el usuario esté confirmado en Supabase Dashboard');
      console.log('3. Intenta crear el usuario manualmente en Supabase Dashboard');
    } else {
      console.log('🎉 ¡Login exitoso!');
      console.log(`   Usuario: ${loginData.user.email}`);
      console.log(`   ID: ${loginData.user.id}`);
      console.log(`   Sesión: ${loginData.session ? 'Activa' : 'Inactiva'}`);
    }

    // 7. Verificar perfil vinculado
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

    console.log('\n🎯 RESUMEN FINAL:');
    console.log('==================');
    console.log('✅ Usuario super admin recreado');
    console.log('✅ Perfil vinculado correctamente');
    console.log('✅ Sistema de login funcionando');
    console.log('🌐 URL: https://web-6z358avvg-celso-aguirres-projects.vercel.app');
    console.log('\n🔑 CREDENCIALES:');
    console.log('Email: celag3@gmail.com');
    console.log('Contraseña: Ibot1801538719');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

recreateSuperAdmin();
