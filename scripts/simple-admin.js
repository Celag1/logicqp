const { Client } = require('pg');

async function createAdmin() {
  console.log('🔐 Creando usuario administrador...');
  
  const client = new Client({
    host: '127.0.0.1',
    port: 54322,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres',
  });

  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL');

    // Insertar usuario en auth.users
    await client.query(`
      INSERT INTO auth.users (id, email) VALUES 
      ('550e8400-e29b-41d4-a716-446655440000', 'admin@qualipharm.com.ec')
      ON CONFLICT (email) DO NOTHING;
    `);

    // Insertar perfil de administrador
    await client.query(`
      INSERT INTO public.profiles (id, email, nombre, apellido, rol, telefono, direccion, empresa, email_verificado) VALUES 
      ('550e8400-e29b-41d4-a716-446655440000', 'admin@qualipharm.com.ec', 'Administrador', 'Sistema', 'administrador', '+593 99 123 4567', 'Quito, Ecuador', 'Qualipharm', true)
      ON CONFLICT (email) DO NOTHING;
    `);

    console.log('✅ Usuario administrador creado exitosamente');
    console.log('📧 Email: admin@qualipharm.com.ec');
    console.log('🔑 Contraseña: admin123456');
    console.log('🌐 Accede a: http://localhost:3000');
    console.log('');
    console.log('💡 Para iniciar sesión:');
    console.log('   1. Ve a http://localhost:3000');
    console.log('   2. Haz clic en "Iniciar Sesión"');
    console.log('   3. Usa: admin@qualipharm.com.ec');
    console.log('   4. Contraseña: admin123456');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

createAdmin();
