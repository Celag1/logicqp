const { Client } = require('pg');

console.log('🔄 ========================================');
console.log('   AGREGANDO COLUMNA UPDATED_AT');
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

    console.log('2. Verificando si la columna updated_at existe...');
    const checkResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'profiles' 
      AND column_name = 'updated_at'
    `);

    if (checkResult.rows.length > 0) {
      console.log('   ✅ La columna updated_at ya existe');
    } else {
      console.log('3. Agregando columna updated_at...');
      await client.query(`
        ALTER TABLE profiles 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      `);
      console.log('   ✅ Columna updated_at agregada');
    }

    console.log('4. Actualizando perfil del usuario...');
    const result = await client.query(`
      UPDATE profiles 
      SET telefono_verificado = true,
          updated_at = NOW()
      WHERE email = 'celag3@gmail.com'
      RETURNING id, email, nombre, telefono, telefono_verificado, updated_at
    `);
    
    if (result.rows.length > 0) {
      console.log('   ✅ Perfil actualizado:', result.rows[0]);
    } else {
      console.log('   ⚠️ No se encontró el usuario celag3@gmail.com');
    }

    console.log('5. Verificando estructura final de la tabla...');
    const structureResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'profiles'
      ORDER BY ordinal_position
    `);

    console.log('   📋 Estructura final de la tabla profiles:');
    structureResult.rows.forEach(row => {
      console.log(`      - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    console.log('');
    console.log('✅ ========================================');
    console.log('   COLUMNAS AGREGADAS Y PERFIL ACTUALIZADO');
    console.log('✅ ========================================');

  } catch (error) {
    console.log('');
    console.log('❌ ========================================');
    console.log('   ERROR AGREGANDO COLUMNAS');
    console.log('❌ ========================================');
    console.log('');
    console.log('Error:', error.message);
  } finally {
    await client.end();
  }
}

addColumn();
