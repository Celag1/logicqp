const { Client } = require('pg');

async function connectToDatabase() {
  const client = new Client({
    host: 'localhost',
    port: 54322,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres'
  });

  try {
    console.log('🔌 Conectando a PostgreSQL...');
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    // Mostrar tablas disponibles
    console.log('\n📋 Tablas disponibles:');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // Mostrar datos de la tabla profiles
    console.log('\n👥 Usuarios en la base de datos:');
    const profilesResult = await client.query('SELECT id, email, nombre, rol FROM profiles LIMIT 5;');
    profilesResult.rows.forEach(row => {
      console.log(`  - ${row.nombre} (${row.email}) - ${row.rol}`);
    });

    // Mostrar datos de la tabla empresa_config
    console.log('\n🏢 Configuración de empresa:');
    const empresaResult = await client.query('SELECT * FROM empresa_config LIMIT 1;');
    if (empresaResult.rows.length > 0) {
      const empresa = empresaResult.rows[0];
      console.log(`  - Nombre: ${empresa.nombre}`);
      console.log(`  - RUC: ${empresa.ruc}`);
      console.log(`  - Dirección: ${empresa.direccion}`);
    }

    // Mostrar productos
    console.log('\n💊 Productos en inventario:');
    const productosResult = await client.query('SELECT nombre, precio, stock FROM productos LIMIT 5;');
    productosResult.rows.forEach(row => {
      console.log(`  - ${row.nombre} - $${row.precio} - Stock: ${row.stock}`);
    });

    console.log('\n✅ Conexión exitosa a la base de datos');
    
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
    console.log('\n💡 Soluciones:');
    console.log('1. Asegúrate de que Docker Desktop esté ejecutándose');
    console.log('2. Ejecuta: docker-compose up -d');
    console.log('3. Espera unos segundos y vuelve a intentar');
  } finally {
    await client.end();
  }
}

connectToDatabase();
