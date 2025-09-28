const { Client } = require('pg');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const client = new Client({
  host: 'localhost',
  port: 54322,
  user: 'postgres',
  password: 'postgres',
  database: 'postgres'
});

async function connectToDatabase() {
  try {
    console.log('🔌 Conectando a PostgreSQL...');
    await client.connect();
    console.log('✅ Conectado a la base de datos LogicQP');
    console.log('\n📋 Comandos disponibles:');
    console.log('  - SHOW TABLES: Mostrar todas las tablas');
    console.log('  - SHOW USERS: Mostrar usuarios');
    console.log('  - SHOW PRODUCTS: Mostrar productos');
    console.log('  - SHOW SALES: Mostrar ventas');
    console.log('  - SHOW INVENTORY: Mostrar inventario');
    console.log('  - SQL <query>: Ejecutar consulta SQL personalizada');
    console.log('  - EXIT: Salir');
    console.log('\n💡 Ejemplo: SQL SELECT * FROM profiles WHERE rol = \'administrador\';');
    console.log('');
    
    await promptUser();
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
    console.log('\n💡 Soluciones:');
    console.log('1. Asegúrate de que Docker Desktop esté ejecutándose');
    console.log('2. Ejecuta: docker-compose up -d');
    console.log('3. Espera unos segundos y vuelve a intentar');
    process.exit(1);
  }
}

async function promptUser() {
  rl.question('🔍 Ingresa un comando: ', async (input) => {
    const command = input.trim().toUpperCase();
    
    if (command === 'EXIT') {
      console.log('👋 Cerrando conexión...');
      await client.end();
      rl.close();
      return;
    }
    
    try {
      await executeCommand(command, input);
    } catch (error) {
      console.error('❌ Error ejecutando comando:', error.message);
    }
    
    console.log('');
    await promptUser();
  });
}

async function executeCommand(command, originalInput) {
  switch (command) {
    case 'SHOW TABLES':
      await showTables();
      break;
    case 'SHOW USERS':
      await showUsers();
      break;
    case 'SHOW PRODUCTS':
      await showProducts();
      break;
    case 'SHOW SALES':
      await showSales();
      break;
    case 'SHOW INVENTORY':
      await showInventory();
      break;
    default:
      if (command.startsWith('SQL ')) {
        const query = originalInput.substring(4).trim();
        await executeSQL(query);
      } else {
        console.log('❌ Comando no reconocido. Usa HELP para ver comandos disponibles.');
      }
  }
}

async function showTables() {
  const result = await client.query(`
    SELECT table_name, 
           (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
    FROM information_schema.tables t
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);
  
  console.log('\n📋 Tablas en la base de datos:');
  result.rows.forEach(row => {
    console.log(`  - ${row.table_name} (${row.column_count} columnas)`);
  });
}

async function showUsers() {
  const result = await client.query(`
    SELECT id, email, nombre, apellido, rol, email_verificado, created_at 
    FROM profiles 
    ORDER BY created_at DESC;
  `);
  
  console.log('\n👥 Usuarios registrados:');
  result.rows.forEach(row => {
    const status = row.email_verificado ? '✅' : '❌';
    console.log(`  ${status} ${row.nombre} ${row.apellido} (${row.email}) - ${row.rol}`);
  });
}

async function showProducts() {
  const result = await client.query(`
    SELECT p.nombre, p.precio, p.stock, c.nombre as categoria, p.codigo_barras
    FROM productos p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    ORDER BY p.nombre;
  `);
  
  console.log('\n💊 Productos en inventario:');
  result.rows.forEach(row => {
    console.log(`  - ${row.nombre} | $${row.precio} | Stock: ${row.stock} | ${row.categoria} | Código: ${row.codigo_barras}`);
  });
}

async function showSales() {
  const result = await client.query(`
    SELECT v.id, v.fecha, v.total, c.nombre as cliente, v.estado
    FROM ventas v
    LEFT JOIN clientes c ON v.cliente_id = c.id
    ORDER BY v.fecha DESC
    LIMIT 10;
  `);
  
  console.log('\n💰 Últimas ventas:');
  result.rows.forEach(row => {
    console.log(`  - Venta #${row.id} | ${row.fecha} | $${row.total} | ${row.cliente} | ${row.estado}`);
  });
}

async function showInventory() {
  const result = await client.query(`
    SELECT p.nombre, i.cantidad, i.tipo_movimiento, i.fecha_movimiento
    FROM inventario i
    LEFT JOIN productos p ON i.producto_id = p.id
    ORDER BY i.fecha_movimiento DESC
    LIMIT 10;
  `);
  
  console.log('\n📦 Últimos movimientos de inventario:');
  result.rows.forEach(row => {
    const icon = row.tipo_movimiento === 'entrada' ? '📥' : '📤';
    console.log(`  ${icon} ${row.nombre} | ${row.cantidad} | ${row.tipo_movimiento} | ${row.fecha_movimiento}`);
  });
}

async function executeSQL(query) {
  if (!query) {
    console.log('❌ No se proporcionó consulta SQL');
    return;
  }
  
  try {
    const result = await client.query(query);
    
    if (result.rows.length === 0) {
      console.log('✅ Consulta ejecutada sin resultados');
      return;
    }
    
    console.log('\n📊 Resultados:');
    console.table(result.rows);
  } catch (error) {
    console.error('❌ Error en consulta SQL:', error.message);
  }
}

connectToDatabase();
