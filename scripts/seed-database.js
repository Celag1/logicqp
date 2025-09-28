const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function seedDatabase() {
  console.log('🌱 Iniciando seed de la base de datos local...');
  
  const client = new Client({
    host: '127.0.0.1',
    port: 54322,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres',
  });

  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL local');

    // Leer y ejecutar el archivo de seed de Qualipharm
    const seedFile = path.join(__dirname, '..', 'supabase', 'seed-qualipharm.sql');
    const seedSQL = fs.readFileSync(seedFile, 'utf8');
    
    console.log('📊 Ejecutando seed SQL...');
    await client.query(seedSQL);
    
    console.log('✅ Seed completado exitosamente');
    console.log('📊 Datos de Qualipharm insertados:');
    console.log('   - 1 configuración de empresa (Qualipharm Laboratorio Farmacéutico)');
    console.log('   - 12 categorías farmacéuticas');
    console.log('   - 8 proveedores farmacéuticos');
    console.log('   - 8 clientes (farmacias y hospitales)');
    console.log('   - 24 productos farmacéuticos con códigos de barras');
    console.log('   - 4 ventas con items detallados');
    console.log('   - Movimientos de inventario completos');
    console.log('   - 20 configuraciones del sistema');
    console.log('   - 6 reportes especializados');
    
  } catch (error) {
    console.error('❌ Error ejecutando seed:', error);
  } finally {
    await client.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
