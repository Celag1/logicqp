const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTEyMTQ1OSwiZXhwIjoyMDc0Njk3NDU5fQ.ds--rwknbADvlAUuRU0ypi0pwxr6Sd9Jr3CrPexxSsU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSuperAdmin() {
  console.log('🚀 Creando usuario super-admin...');

  try {
    // 1. Crear usuario en auth.users usando la API de administración
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'celag3@gmail.com',
      password: 'Ibot1801538719',
      email_confirm: true,
      user_metadata: {
        nombre: 'Celso',
        apellido: 'Aguirre'
      }
    });

    if (authError) {
      console.error('❌ Error creando usuario en auth:', authError);
      return;
    }

    console.log('✅ Usuario creado en auth.users:', authData.user.id);

    // 2. Crear perfil en la tabla profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: 'celag3@gmail.com',
        nombre: 'Celso',
        apellido: 'Aguirre',
        rol: 'super_admin',
        telefono: '+593 99 123 4567',
        direccion: 'Quito, Ecuador',
        empresa: 'LogicQP',
        email_verificado: true,
        telefono_verificado: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Error creando perfil:', profileError);
      // Eliminar usuario de auth si falla la creación del perfil
      await supabase.auth.admin.deleteUser(authData.user.id);
      return;
    }

    console.log('✅ Perfil creado exitosamente:', profileData);
    console.log('🎉 Usuario super-admin creado correctamente!');
    console.log('📧 Email: celag3@gmail.com');
    console.log('🔑 Contraseña: Ibot1801538719');

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

createSuperAdmin();
