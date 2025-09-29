const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTEyMTQ1OSwiZXhwIjoyMDc0Njk3NDU5fQ.ds--rwknbADvlAUuRU0ypi0pwxr6Sd9Jr3CrPexxSsU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUsers() {
  console.log('🚀 Creando usuarios de prueba...');

  try {
    // 1. Verificar que el super admin existe
    console.log('\n1️⃣ Verificando super admin...');
    const { data: superAdmin, error: superAdminError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'celag3@gmail.com')
      .single();

    if (superAdminError) {
      console.log('❌ Error verificando super admin:', superAdminError.message);
    } else if (superAdmin) {
      console.log('✅ Super admin ya existe:', superAdmin.email);
    } else {
      console.log('⚠️ Super admin no encontrado');
    }

    // 2. Crear usuarios de prueba usando la API de Supabase Auth
    const testUsers = [
      {
        email: 'admin@logicqp.com',
        password: 'Admin123456',
        user_metadata: {
          nombre: 'María',
          apellido: 'González',
          rol: 'admin',
          telefono: '+593 99 234 5678',
          direccion: 'Av. 6 de Diciembre N23-45, Quito'
        }
      },
      {
        email: 'vendedor1@logicqp.com',
        password: 'Vendedor123',
        user_metadata: {
          nombre: 'Carlos',
          apellido: 'López',
          rol: 'vendedor',
          telefono: '+593 99 345 6789',
          direccion: 'Av. 10 de Agosto N34-56, Quito'
        }
      },
      {
        email: 'vendedor2@logicqp.com',
        password: 'Vendedor123',
        user_metadata: {
          nombre: 'Ana',
          apellido: 'Martínez',
          rol: 'vendedor',
          telefono: '+593 99 456 7890',
          direccion: 'Av. Patria N45-67, Quito'
        }
      },
      {
        email: 'cliente1@email.com',
        password: 'Cliente123',
        user_metadata: {
          nombre: 'Roberto',
          apellido: 'Silva',
          rol: 'cliente',
          telefono: '+593 99 567 8901',
          direccion: 'Av. Colón N56-78, Quito'
        }
      },
      {
        email: 'cliente2@email.com',
        password: 'Cliente123',
        user_metadata: {
          nombre: 'Patricia',
          apellido: 'Vega',
          rol: 'cliente',
          telefono: '+593 99 678 9012',
          direccion: 'Av. Amazonas N67-89, Quito'
        }
      },
      {
        email: 'cliente3@email.com',
        password: 'Cliente123',
        user_metadata: {
          nombre: 'Luis',
          apellido: 'Ramírez',
          rol: 'cliente',
          telefono: '+593 99 789 0123',
          direccion: 'Av. 6 de Diciembre N78-90, Quito'
        }
      },
      {
        email: 'cliente4@email.com',
        password: 'Cliente123',
        user_metadata: {
          nombre: 'Carmen',
          apellido: 'Herrera',
          rol: 'cliente',
          telefono: '+593 99 890 1234',
          direccion: 'Av. 10 de Agosto N89-01, Quito'
        }
      }
    ];

    console.log('\n2️⃣ Creando usuarios en auth.users...');
    for (const userData of testUsers) {
      try {
        // Crear usuario en auth.users
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
          user_metadata: userData.user_metadata
        });

        if (authError) {
          if (authError.message.includes('already registered')) {
            console.log(`⚠️ Usuario ${userData.email} ya existe en auth.users`);
          } else {
            console.log(`❌ Error creando usuario ${userData.email}:`, authError.message);
          }
        } else {
          console.log(`✅ Usuario ${userData.email} creado en auth.users con ID: ${authUser.user.id}`);
        }
      } catch (error) {
        console.log(`❌ Error inesperado creando usuario ${userData.email}:`, error.message);
      }
    }

    // 3. Crear perfiles en la tabla profiles
    console.log('\n3️⃣ Creando perfiles en la tabla profiles...');
    for (const userData of testUsers) {
      try {
        // Obtener el ID del usuario de auth.users
        const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          console.log('❌ Error obteniendo usuarios:', authError.message);
          continue;
        }

        const user = authUser.users.find(u => u.email === userData.email);
        if (!user) {
          console.log(`⚠️ Usuario ${userData.email} no encontrado en auth.users`);
          continue;
        }

        // Crear perfil en profiles
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: userData.email,
            nombre: userData.user_metadata.nombre,
            apellido: userData.user_metadata.apellido,
            rol: userData.user_metadata.rol,
            telefono: userData.user_metadata.telefono,
            direccion: userData.user_metadata.direccion,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (profileError) {
          if (profileError.message.includes('duplicate key')) {
            console.log(`⚠️ Perfil ${userData.email} ya existe en profiles`);
          } else {
            console.log(`❌ Error creando perfil ${userData.email}:`, profileError.message);
          }
        } else {
          console.log(`✅ Perfil ${userData.email} creado con rol: ${userData.user_metadata.rol}`);
        }
      } catch (error) {
        console.log(`❌ Error inesperado creando perfil ${userData.email}:`, error.message);
      }
    }

    console.log('\n🎉 ¡Proceso completado!');
    console.log('📋 Usuarios creados:');
    console.log('- Super Admin: celag3@gmail.com (ya existía)');
    console.log('- Admin: admin@logicqp.com');
    console.log('- Vendedores: vendedor1@logicqp.com, vendedor2@logicqp.com');
    console.log('- Clientes: cliente1@email.com, cliente2@email.com, cliente3@email.com, cliente4@email.com');

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

createTestUsers();
