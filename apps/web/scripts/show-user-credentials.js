const { createClient } = require('@supabase/supabase-js');

// Usar service role key para operaciones administrativas
const supabaseUrl = 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTEyMTQ1OSwiZXhwIjoyMDc0Njk3NDU5fQ.ds--rwknbADvlAUuRU0ypi0pwxr6Sd9Jr3CrPexxSsU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function showUserCredentials() {
  console.log('👥 Mostrando credenciales de usuarios del sistema...');

  try {
    // 1. Verificar usuarios en auth.users
    console.log('🔐 Verificando usuarios en auth.users...');
    const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();

    if (authUsersError) {
      console.error('❌ Error obteniendo usuarios de auth:', authUsersError.message);
    } else {
      console.log(`✅ Usuarios en auth.users: ${authUsers.users.length}`);
      authUsers.users.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email} - ID: ${user.id} - Creado: ${user.created_at}`);
      });
    }

    // 2. Verificar perfiles en la tabla profiles
    console.log('\n👤 Verificando perfiles en la tabla profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at');

    if (profilesError) {
      console.error('❌ Error obteniendo perfiles:', profilesError.message);
    } else {
      console.log(`✅ Perfiles encontrados: ${profiles.length}`);
      profiles.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.nombre} (${profile.email}) - Rol: ${profile.rol} - Activo: ${profile.activo || 'N/A'}`);
      });
    }

    // 3. Mostrar credenciales de prueba
    console.log('\n🎯 CREDENCIALES DE USUARIOS DE PRUEBA:');
    console.log('=====================================');
    
    console.log('\n🏥 SUPER ADMIN:');
    console.log('Email: celag3@gmail.com');
    console.log('Contraseña: Ibot1801538719');
    console.log('Rol: super_admin');
    console.log('Acceso: Control total del sistema');

    console.log('\n👨‍💼 ADMINISTRADOR:');
    console.log('Email: admin@qualipharm.com');
    console.log('Contraseña: Admin123!');
    console.log('Rol: admin');
    console.log('Acceso: Gestión de productos, usuarios, reportes');

    console.log('\n👨‍💻 VENDEDOR:');
    console.log('Email: vendedor@qualipharm.com');
    console.log('Contraseña: Vendedor123!');
    console.log('Rol: vendedor');
    console.log('Acceso: Ventas, inventario, clientes');

    console.log('\n👤 CLIENTE:');
    console.log('Email: cliente@qualipharm.com');
    console.log('Contraseña: Cliente123!');
    console.log('Rol: cliente');
    console.log('Acceso: Compras, catálogo, pedidos');

    console.log('\n🌐 URL DE ACCESO:');
    console.log('https://web-6z358avvg-celso-aguirres-projects.vercel.app');

    console.log('\n📋 INSTRUCCIONES:');
    console.log('1. Ve a la URL de la aplicación');
    console.log('2. Haz clic en "Iniciar Sesión"');
    console.log('3. Usa cualquiera de las credenciales de arriba');
    console.log('4. El super admin (celag3@gmail.com) tiene acceso completo');

    // 4. Verificar si el super admin existe
    console.log('\n🔍 Verificando super admin...');
    const { data: superAdmin, error: superAdminError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'celag3@gmail.com')
      .single();

    if (superAdminError) {
      console.log('⚠️ Super admin no encontrado en profiles:', superAdminError.message);
      console.log('💡 Necesitas crear el usuario en Supabase Dashboard:');
      console.log('   1. Ve a Authentication > Users');
      console.log('   2. Crea usuario con email: celag3@gmail.com');
      console.log('   3. Establece contraseña: Ibot1801538719');
      console.log('   4. Confirma el email');
    } else {
      console.log('✅ Super admin encontrado en profiles');
      console.log(`   Nombre: ${superAdmin.nombre}`);
      console.log(`   Email: ${superAdmin.email}`);
      console.log(`   Rol: ${superAdmin.rol}`);
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

showUserCredentials();
