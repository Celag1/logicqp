const { createClient } = require('@supabase/supabase-js');

async function createAdminUser() {
  console.log('🔐 Creando usuario administrador...');
  
  const supabaseUrl = 'http://localhost:54321';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Crear usuario en auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'admin@qualipharm.com.ec',
      password: 'admin123456',
      options: {
        data: {
          nombre: 'Administrador',
          apellido: 'Sistema',
          rol: 'administrador'
        }
      }
    });

    if (authError) {
      console.error('❌ Error creando usuario auth:', authError.message);
      return;
    }

    console.log('✅ Usuario administrador creado exitosamente');
    console.log('📧 Email: admin@qualipharm.com.ec');
    console.log('🔑 Contraseña: admin123456');
    console.log('🌐 Accede a: http://localhost:3000');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createAdminUser();
