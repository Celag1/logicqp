const { Client } = require('pg');

console.log('🔄 ========================================');
console.log('   AGREGANDO COLUMNA TELEFONO_VERIFICADO');
console.log('🔄 ========================================');

const client = new Client({
  host: '127.0.0.1',
  port: 54322,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

async function addColumn() {
  try {
    console.log('1. Conectando a PostgreSQL...');
    await client.connect();
    console.log('   ✅ Conectado a PostgreSQL');

    console.log('2. Verificando si la columna existe...');
    const checkResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'profiles' 
      AND column_name = 'telefono_verificado'
    `);

    if (checkResult.rows.length > 0) {
      console.log('   ✅ La columna telefono_verificado ya existe');
    } else {
      console.log('3. Agregando columna telefono_verificado...');
      await client.query(`
        ALTER TABLE profiles 
        ADD COLUMN telefono_verificado BOOLEAN DEFAULT FALSE
      `);
      console.log('   ✅ Columna telefono_verificado agregada');
    }

    console.log('4. Verificando estructura de la tabla...');
    const structureResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'profiles'
      ORDER BY ordinal_position
    `);

    console.log('   📋 Estructura de la tabla profiles:');
    structureResult.rows.forEach(row => {
      console.log(`      - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    console.log('');
    console.log('✅ ========================================');
    console.log('   COLUMNA AGREGADA EXITOSAMENTE');
    console.log('✅ ========================================');

  } catch (error) {
    console.log('');
    console.log('❌ ========================================');
    console.log('   ERROR AGREGANDO COLUMNA');
    console.log('❌ ========================================');
    console.log('');
    console.log('Error:', error.message);
  } finally {
    await client.end();
  }
}

addColumn();
