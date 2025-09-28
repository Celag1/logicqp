const { Client } = require('pg');

console.log('🔄 ========================================');
console.log('   CONFIGURANDO PERMISOS DE POSTGREST');
console.log('🔄 ========================================');

const client = new Client({
  host: '127.0.0.1',
  port: 54322,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

async function setupPermissions() {
  try {
    console.log('1. Conectando a PostgreSQL...');
    await client.connect();
    console.log('   ✅ Conectado a PostgreSQL');

    console.log('2. Creando rol anon...');
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
          CREATE ROLE anon NOLOGIN;
        END IF;
      END
      $$;
    `);
    console.log('   ✅ Rol anon creado/verificado');

    console.log('3. Otorgando permisos al rol anon...');
    await client.query(`
      GRANT USAGE ON SCHEMA public TO anon;
      GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
      GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO anon;
      GRANT SELECT, INSERT, UPDATE, DELETE ON empresas TO anon;
    `);
    console.log('   ✅ Permisos otorgados');

    console.log('4. Configurando políticas RLS...');
    await client.query(`
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
    `);
    console.log('   ✅ RLS habilitado');

    console.log('5. Creando políticas para anon...');
    await client.query(`
      DROP POLICY IF EXISTS "anon can read profiles" ON profiles;
      DROP POLICY IF EXISTS "anon can modify profiles" ON profiles;
      DROP POLICY IF EXISTS "anon can read empresas" ON empresas;
      DROP POLICY IF EXISTS "anon can modify empresas" ON empresas;
      
      CREATE POLICY "anon can read profiles" ON profiles FOR SELECT TO anon USING (true);
      CREATE POLICY "anon can modify profiles" ON profiles FOR ALL TO anon USING (true);
      CREATE POLICY "anon can read empresas" ON empresas FOR SELECT TO anon USING (true);
      CREATE POLICY "anon can modify empresas" ON empresas FOR ALL TO anon USING (true);
    `);
    console.log('   ✅ Políticas creadas');

    console.log('6. Verificando configuración...');
    const result = await client.query(`
      SELECT table_name, row_security 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('profiles', 'empresas')
    `);
    
    console.log('   📋 Estado de las tablas:');
    result.rows.forEach(row => {
      console.log(`      - ${row.table_name}: RLS ${row.row_security ? 'habilitado' : 'deshabilitado'}`);
    });

    console.log('');
    console.log('✅ ========================================');
    console.log('   PERMISOS CONFIGURADOS EXITOSAMENTE');
    console.log('✅ ========================================');

  } catch (error) {
    console.log('');
    console.log('❌ ========================================');
    console.log('   ERROR CONFIGURANDO PERMISOS');
    console.log('❌ ========================================');
    console.log('');
    console.log('Error:', error.message);
  } finally {
    await client.end();
  }
}

setupPermissions();
