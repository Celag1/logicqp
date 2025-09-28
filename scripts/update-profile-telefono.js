const { Client } = require('pg');

console.log('🔄 ========================================');
console.log('   ACTUALIZANDO PERFIL DEL USUARIO');
console.log('🔄 ========================================');

const client = new Client({
  host: '127.0.0.1',
  port: 54322,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

async function updateProfile() {
  try {
    console.log('1. Conectando a PostgreSQL...');
    await client.connect();
    console.log('   ✅ Conectado a PostgreSQL');

    console.log('2. Actualizando perfil del usuario...');
    const result = await client.query(`
      UPDATE profiles 
      SET telefono_verificado = true,
          updated_at = NOW()
      WHERE email = 'celag3@gmail.com'
      RETURNING id, email, nombre, telefono, telefono_verificado
    `);
    
    if (result.rows.length > 0) {
      console.log('   ✅ Perfil actualizado:', result.rows[0]);
    } else {
      console.log('   ⚠️ No se encontró el usuario celag3@gmail.com');
    }

    console.log('3. Verificando todos los perfiles...');
    const allProfiles = await client.query(`
      SELECT id, email, nombre, telefono, telefono_verificado, email_verificado
      FROM profiles
      ORDER BY created_at
    `);
    
    console.log('   📋 Perfiles en la base de datos:');
    allProfiles.rows.forEach(profile => {
      console.log(`      - ${profile.email}: ${profile.nombre} (Tel: ${profile.telefono}, TelVer: ${profile.telefono_verificado}, EmailVer: ${profile.email_verificado})`);
    });

    console.log('');
    console.log('✅ ========================================');
    console.log('   PERFIL ACTUALIZADO EXITOSAMENTE');
    console.log('✅ ========================================');

  } catch (error) {
    console.log('');
    console.log('❌ ========================================');
    console.log('   ERROR ACTUALIZANDO PERFIL');
    console.log('❌ ========================================');
    console.log('');
    console.log('Error:', error.message);
  } finally {
    await client.end();
  }
}

updateProfile();
