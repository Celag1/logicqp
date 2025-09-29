const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTEyMTQ1OSwiZXhwIjoyMDc0Njk3NDU5fQ.ds--rwknbADvlAUuRU0ypi0pwxr6Sd9Jr3CrPexxSsU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateProfileId() {
  console.log('🔄 Actualizando ID del perfil...');

  try {
    // Primero, obtener el ID real del usuario de auth.users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Error obteniendo usuarios:', usersError);
      return;
    }

    const user = users.users.find(u => u.email === 'celag3@gmail.com');
    
    if (!user) {
      console.error('❌ Usuario no encontrado en auth.users');
      console.log('💡 Asegúrate de haber creado el usuario en Supabase Dashboard');
      return;
    }

    console.log('✅ Usuario encontrado en auth.users:', user.id);

    // Actualizar el perfil con el ID correcto
    const { data, error } = await supabase
      .from('profiles')
      .update({ id: user.id })
      .eq('email', 'celag3@gmail.com')
      .select();

    if (error) {
      console.error('❌ Error actualizando perfil:', error);
      return;
    }

    console.log('✅ Perfil actualizado correctamente:', data);

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

updateProfileId();

