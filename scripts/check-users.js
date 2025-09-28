const { Client } = require('pg');

console.log('🔍 ========================================');
console.log('   VERIFICANDO USUARIOS EN LA BASE DE DATOS');
console.log('🔍 ========================================');

const client = new Client({
  host: '127.0.0.1',
  port: 54322,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

async function checkUsers() {
  try {
    console.log('1. Conectando a PostgreSQL...');
    await client.connect();
    console.log('   ✅ Conectado a PostgreSQL');

    console.log('2. Verificando usuarios en la base de datos...');
    const result = await client.query('SELECT id, email, nombre, telefono FROM profiles ORDER BY created_at');
    
    console.log('   📋 Usuarios encontrados:');
    if (result.rows.length === 0) {
      console.log('      ⚠️ No hay usuarios en la base de datos');
    } else {
      result.rows.forEach(user => {
        console.log(`      - ${user.email}: ${user.nombre} (Tel: ${user.telefono})`);
      });
    }

    console.log('');
    console.log('✅ ========================================');
    console.log('   VERIFICACIÓN COMPLETADA');
    console.log('✅ ========================================');

  } catch (error) {
    console.log('');
    console.log('❌ ========================================');
    console.log('   ERROR VERIFICANDO USUARIOS');
    console.log('❌ ========================================');
    console.log('');
    console.log('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkUsers();
