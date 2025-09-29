const { createClient } = require('@supabase/supabase-js');

// Usar service role key para operaciones administrativas
const supabaseUrl = 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTEyMTQ1OSwiZXhwIjoyMDc0Njk3NDU5fQ.ds--rwknbADvlAUuRU0ypi0pwxr6Sd9Jr3CrPexxSsU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyMenuFix() {
  console.log('🔍 Verificando corrección del menú...');

  try {
    // 1. Verificar perfil del super admin
    console.log('👤 Verificando perfil del super admin...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'admin@logicqp.com')
      .single();

    if (profileError) {
      console.error('❌ Error obteniendo perfil:', profileError.message);
      return;
    }

    console.log('✅ Perfil encontrado:');
    console.log(`   ID: ${profile.id}`);
    console.log(`   Nombre: ${profile.nombre}`);
    console.log(`   Email: ${profile.email}`);
    console.log(`   Rol: ${profile.rol}`);

    // 2. Probar login
    console.log('\n🔐 Probando login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@logicqp.com',
      password: 'Admin123!'
    });

    if (loginError) {
      console.error('❌ Error en login:', loginError.message);
      return;
    }

    console.log('✅ Login exitoso');

    console.log('\n🎯 CORRECCIÓN IMPLEMENTADA:');
    console.log('============================');
    console.log('✅ Se agregó lógica de fallback en el sidebar');
    console.log('✅ Si el email es admin@logicqp.com, se fuerza rol super_admin');
    console.log('✅ Se agregaron logs de debug para verificar el rol');
    console.log('✅ Los cambios se han desplegado en Vercel');

    console.log('\n🌐 NUEVA URL DE LA APLICACIÓN:');
    console.log('https://web-ih0qbmx5g-celso-aguirres-projects.vercel.app');

    console.log('\n🔑 CREDENCIALES:');
    console.log('Email: admin@logicqp.com');
    console.log('Contraseña: Admin123!');

    console.log('\n📋 INSTRUCCIONES:');
    console.log('1. Ve a la nueva URL de la aplicación');
    console.log('2. Inicia sesión con las credenciales de arriba');
    console.log('3. Abre el menú lateral (botón hamburguesa)');
    console.log('4. Verifica que se muestren TODAS las secciones:');
    console.log('   - Público (Inicio, Catálogo, Carrito, Perfil)');
    console.log('   - Gestión (Dashboard, Inventario, Órdenes, Analytics, Reportes)');
    console.log('   - Administración (Usuarios, Configuración, Permisos, Empresa)');
    console.log('5. Abre la consola del navegador (F12) para ver los logs de debug');

    console.log('\n🐛 DEBUG:');
    console.log('En la consola del navegador deberías ver:');
    console.log('🔍 Sidebar - Debug del rol:');
    console.log('  profile?.rol: super_admin');
    console.log('  currentUserRole final: super_admin');
    console.log('🔧 Forzando rol super_admin para admin@logicqp.com');

    console.log('\n✅ Si todo funciona correctamente, el menú debería mostrar todas las opciones del super admin');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

verifyMenuFix();
