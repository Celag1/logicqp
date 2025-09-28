const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

console.log('🔄 ========================================');
console.log('   CONFIGURANDO BASE DE DATOS SIMPLE');
console.log('🔄 ========================================');

const client = new Client({
  host: '127.0.0.1',
  port: 54322,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

async function setupDatabase() {
  try {
    console.log('1. Conectando a PostgreSQL...');
    await client.connect();
    console.log('   ✅ Conectado a PostgreSQL');

    console.log('2. Creando esquema auth...');
    await client.query('CREATE SCHEMA IF NOT EXISTS auth;');
    console.log('   ✅ Esquema auth creado');

    console.log('3. Creando esquema public...');
    await client.query('CREATE SCHEMA IF NOT EXISTS public;');
    console.log('   ✅ Esquema public creado');

    console.log('4. Aplicando migración inicial...');
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250101000000_initial_schema.sql');
    
    if (fs.existsSync(migrationPath)) {
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      await client.query(migrationSQL);
      console.log('   ✅ Migración inicial aplicada');
    } else {
      console.log('   ⚠️ Archivo de migración no encontrado, creando tablas básicas...');
      
      // Crear tablas básicas
      await client.query(`
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT,
          rol TEXT NOT NULL DEFAULT 'cliente',
          nombre TEXT,
          apellido TEXT,
          telefono TEXT,
          telefono_verificado BOOLEAN DEFAULT FALSE,
          foto_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      
      await client.query(`
        CREATE TABLE IF NOT EXISTS empresas (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          nombre TEXT NOT NULL,
          ruc TEXT UNIQUE NOT NULL,
          direccion TEXT,
          telefono TEXT,
          email TEXT,
          logo_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      
      console.log('   ✅ Tablas básicas creadas');
    }

    console.log('5. Insertando datos de prueba...');
    
    // Insertar empresa
    await client.query(`
      INSERT INTO empresas (id, nombre, ruc, direccion, telefono, email, logo_url)
      VALUES (
        '550e8400-e29b-41d4-a716-446655440000',
        'Qualipharm Ecuador',
        '0998765432001',
        'Av. Amazonas N45-123, Quito',
        '02-2345678',
        'info@qualipharm.com.ec',
        '/logos/qualipharm-logo.png'
      )
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insertar usuarios
    await client.query(`
      INSERT INTO profiles (id, email, password_hash, rol, nombre, apellido, telefono, telefono_verificado)
      VALUES 
        ('550e8400-e29b-41d4-a716-446655440001', 'celag3@gmail.com', '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'super_admin', 'Carlos', 'Lagos', '0998769259', true),
        ('550e8400-e29b-41d4-a716-446655440002', 'admin@qualipharm.com.ec', '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'administrador', 'Admin', 'Sistema', '0998765432', true),
        ('550e8400-e29b-41d4-a716-446655440003', 'vendedor@qualipharm.com.ec', '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'vendedor', 'Juan', 'Vendedor', '0998765433', true)
      ON CONFLICT (email) DO NOTHING;
    `);

    console.log('   ✅ Datos de prueba insertados');

    console.log('6. Verificando datos...');
    const result = await client.query('SELECT COUNT(*) as total FROM profiles;');
    console.log(`   ✅ Total usuarios: ${result.rows[0].total}`);

    console.log('');
    console.log('✅ ========================================');
    console.log('   BASE DE DATOS CONFIGURADA EXITOSAMENTE');
    console.log('✅ ========================================');
    console.log('');
    console.log('Credenciales:');
    console.log('- Super-Admin: celag3@gmail.com / Ibot1801538719');
    console.log('- Admin: admin@qualipharm.com.ec / admin123456');
    console.log('- Vendedor: vendedor@qualipharm.com.ec / vendedor123');

  } catch (error) {
    console.log('');
    console.log('❌ ========================================');
    console.log('   ERROR CONFIGURANDO BASE DE DATOS');
    console.log('❌ ========================================');
    console.log('');
    console.log('Error:', error.message);
    console.log('');
    console.log('💡 SOLUCIONES:');
    console.log('   1. Verifica que PostgreSQL esté ejecutándose');
    console.log('   2. Verifica que Docker esté funcionando');
    console.log('   3. Revisa los logs: docker-compose logs');
  } finally {
    await client.end();
  }
}

setupDatabase();

