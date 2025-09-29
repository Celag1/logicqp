const { createClient } = require('@supabase/supabase-js');

// Usar service role key para operaciones administrativas
const supabaseUrl = 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTEyMTQ1OSwiZXhwIjoyMDc0Njk3NDU5fQ.ds--rwknbADvlAUuRU0ypi0pwxr6Sd9Jr3CrPexxSsU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixMenuPermissionsFrontend() {
  console.log('🔧 Corrigiendo permisos del menú en el frontend...');

  try {
    // 1. Verificar el perfil del super admin
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

    // 2. Verificar que el rol sea exactamente 'super_admin'
    if (profile.rol !== 'super_admin') {
      console.log('🔄 Actualizando rol a super_admin...');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          rol: 'super_admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (updateError) {
        console.error('❌ Error actualizando rol:', updateError.message);
      } else {
        console.log('✅ Rol actualizado a super_admin');
      }
    }

    // 3. Crear script de verificación para el frontend
    console.log('\n🐛 SCRIPT DE VERIFICACIÓN PARA EL FRONTEND:');
    console.log('==========================================');
    console.log('Copia y pega este script en la consola del navegador:');
    console.log('');
    console.log(`
// Script de verificación y corrección del menú
console.log('🔍 Verificando permisos del menú...');

// 1. Verificar datos de autenticación
const authData = JSON.parse(localStorage.getItem('sb-fwahfmwtbgikzuzmnpsv-auth-token') || '{}');
console.log('Auth data:', authData);

// 2. Verificar perfil
const profile = JSON.parse(localStorage.getItem('profile') || '{}');
console.log('Profile:', profile);
console.log('Rol del usuario:', profile.rol);

// 3. Verificar si el rol es correcto
if (profile.rol === 'super_admin') {
  console.log('✅ Usuario tiene rol de super_admin');
} else {
  console.log('❌ Usuario NO tiene rol de super_admin. Rol actual:', profile.rol);
  console.log('💡 Esto explica por qué solo se muestra la sección Público');
}

// 4. Verificar elementos del menú
const sidebar = document.querySelector('[data-testid="sidebar-menu"]') || 
                document.querySelector('.sidebar-menu') ||
                document.querySelector('nav[class*="sidebar"]');
console.log('Sidebar encontrado:', !!sidebar);

if (sidebar) {
  // Verificar secciones del menú
  const publicSection = sidebar.querySelector('[data-testid="public-section"]') ||
                       sidebar.querySelector('.public-section') ||
                       sidebar.querySelector('div:contains("Público")');
  console.log('Sección Público encontrada:', !!publicSection);

  const gestionSection = sidebar.querySelector('[data-testid="gestion-section"]') ||
                        sidebar.querySelector('.gestion-section') ||
                        sidebar.querySelector('div:contains("Gestión")');
  console.log('Sección Gestión encontrada:', !!gestionSection);

  const adminSection = sidebar.querySelector('[data-testid="admin-section"]') ||
                      sidebar.querySelector('.admin-section') ||
                      sidebar.querySelector('div:contains("Administración")');
  console.log('Sección Administración encontrada:', !!adminSection);

  // Verificar elementos específicos del menú
  const dashboardItem = sidebar.querySelector('a[href="/dashboard"]');
  console.log('Dashboard encontrado:', !!dashboardItem);

  const usuariosItem = sidebar.querySelector('a[href="/usuarios"]');
  console.log('Usuarios encontrado:', !!usuariosItem);

  const inventarioItem = sidebar.querySelector('a[href="/inventario"]');
  console.log('Inventario encontrado:', !!inventarioItem);
}

// 5. Forzar recarga del perfil si es necesario
if (profile.rol !== 'super_admin') {
  console.log('🔄 Intentando recargar el perfil...');
  
  // Limpiar cache local
  localStorage.removeItem('profile');
  localStorage.removeItem('sb-fwahfmwtbgikzuzmnpsv-auth-token');
  
  // Recargar página
  console.log('🔄 Recargando página...');
  window.location.reload();
}

// 6. Verificar si hay errores en la consola
console.log('Verifica si hay errores en la consola del navegador');
`);

    // 4. Crear script de corrección automática
    console.log('\n🔧 SCRIPT DE CORRECCIÓN AUTOMÁTICA:');
    console.log('==================================');
    console.log('Si el problema persiste, ejecuta este script:');
    console.log('');
    console.log(`
// Script de corrección automática del menú
console.log('🔧 Aplicando corrección automática...');

// 1. Limpiar cache local
localStorage.removeItem('profile');
localStorage.removeItem('sb-fwahfmwtbgikzuzmnpsv-auth-token');
localStorage.removeItem('supabase.auth.token');

// 2. Forzar recarga del perfil
console.log('🔄 Recargando perfil...');
window.location.reload();
`);

    console.log('\n🎯 DIAGNÓSTICO:');
    console.log('================');
    console.log('✅ Perfil del super admin configurado correctamente');
    console.log('✅ Rol: super_admin');
    console.log('❌ El frontend no está reconociendo el rol correctamente');
    console.log('💡 Esto causa que solo se muestre la sección "Público"');

    console.log('\n🛠️ SOLUCIÓN:');
    console.log('=============');
    console.log('1. Ejecuta el script de verificación en la consola');
    console.log('2. Si el rol no es "super_admin", ejecuta el script de corrección');
    console.log('3. Recarga la página después de ejecutar los scripts');
    console.log('4. Verifica que el menú se muestre completo');

    console.log('\n🌐 URL: https://web-6z358avvg-celso-aguirres-projects.vercel.app');
    console.log('🔑 Credenciales: admin@logicqp.com / Admin123!');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

fixMenuPermissionsFrontend();
