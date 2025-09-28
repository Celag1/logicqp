const { Client } = require('pg');

console.log('🔄 ========================================');
console.log('   AGREGANDO USUARIO CELAG3@GMAIL.COM');
console.log('🔄 ========================================');

const client = new Client({
  host: '127.0.0.1',
  port: 54322,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

async function addUser() {
  try {
    console.log('1. Conectando a PostgreSQL...');
    await client.connect();
    console.log('   ✅ Conectado a PostgreSQL');

    console.log('2. Verificando si el usuario ya existe...');
    const checkResult = await client.query(`
      SELECT id, email FROM profiles WHERE email = 'celag3@gmail.com'
    `);

    if (checkResult.rows.length > 0) {
      console.log('   ✅ El usuario celag3@gmail.com ya existe');
      console.log('   📋 Usuario:', checkResult.rows[0]);
    } else {
      console.log('3. Agregando usuario celag3@gmail.com...');
      const result = await client.query(`
        INSERT INTO profiles (
          id, email, nombre, apellido, rol, telefono, direccion, empresa, 
          email_verificado, telefono_verificado, created_at, updated_at
        ) VALUES (
          '550e8400-e29b-41d4-a716-446655440000',
          'celag3@gmail.com',
          'Carlos',
          'Lagos',
          'administrador',
          '0998769259',
          'Av. Bolivariana 1441 y Genovesa, Ambato, Ecuador.',
          'IngSoft S.A.',
          true,
          true,
          NOW(),
          NOW()
        )
        RETURNING id, email, nombre, telefono, telefono_verificado
      `);
      
      console.log('   ✅ Usuario agregado:', result.rows[0]);
    }

    console.log('4. Verificando todos los usuarios...');
    const allUsers = await client.query(`
      SELECT id, email, nombre, telefono, telefono_verificado, email_verificado
      FROM profiles
      ORDER BY created_at
    `);
    
    console.log('   📋 Todos los usuarios en la base de datos:');
    allUsers.rows.forEach(user => {
      console.log(`      - ${user.email}: ${user.nombre} (Tel: ${user.telefono}, TelVer: ${user.telefono_verificado}, EmailVer: ${user.email_verificado})`);
    });

    console.log('');
    console.log('✅ ========================================');
    console.log('   USUARIO AGREGADO EXITOSAMENTE');
    console.log('✅ ========================================');

  } catch (error) {
    console.log('');
    console.log('❌ ========================================');
    console.log('   ERROR AGREGANDO USUARIO');
    console.log('❌ ========================================');
    console.log('');
    console.log('Error:', error.message);
  } finally {
    await client.end();
  }
}

addUser();
