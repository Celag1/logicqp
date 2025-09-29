const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTEyMTQ1OSwiZXhwIjoyMDc0Njk3NDU5fQ.ds--rwknbADvlAUuRU0ypi0pwxr6Sd9Jr3CrPexxSsU';

if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('your-project')) {
  console.log('⚠️  Configura las variables de entorno de Supabase primero');
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co');
  console.log('SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupSupabase() {
  console.log('🚀 Configurando Supabase Cloud...\n');

  try {
    // 1. Crear usuario super-admin
    console.log('👤 Creando usuario super-admin...');
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'celag3@gmail.com',
      password: 'Ibot1801538719',
      email_confirm: true,
      user_metadata: {
        nombre: 'Celso',
        apellido: 'Aguirre'
      }
    });

    if (authError) {
      console.log('⚠️  Usuario ya existe o error:', authError.message);
    } else {
      console.log('✅ Usuario super-admin creado');
    }

    // 2. Crear perfil en la tabla profiles
    console.log('📝 Creando perfil de usuario...');
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authUser?.user?.id || 'celag3-user-id',
        email: 'celag3@gmail.com',
        nombre: 'Celso',
        apellido: 'Aguirre',
        rol: 'super_admin',
        telefono: '+593 99 123 4567',
        direccion: 'Quito, Ecuador',
        empresa: 'LogicQP',
        email_verificado: true,
        telefono_verificado: true,
        foto_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.log('⚠️  Error creando perfil:', profileError.message);
    } else {
      console.log('✅ Perfil creado exitosamente');
    }

    // 3. Configurar empresa
    console.log('🏢 Configurando empresa...');
    const { error: empresaError } = await supabase
      .from('empresa_config')
      .upsert({
        nombre: 'LogicQP - Sistema de Gestión',
        logo_url: '/logo-logicqp.png',
        direccion: 'Quito, Ecuador',
        telefono: '+593 2 234 5678',
        email: 'info@logicqp.com',
        ruc: '1234567890001'
      });

    if (empresaError) {
      console.log('⚠️  Error configurando empresa:', empresaError.message);
    } else {
      console.log('✅ Empresa configurada');
    }

    console.log('\n🎉 ¡Configuración completada!');
    console.log('📧 Email: celag3@gmail.com');
    console.log('🔑 Contraseña: Ibot1801538719');
    console.log('🌐 Accede a tu aplicación desplegada');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setupSupabase();
