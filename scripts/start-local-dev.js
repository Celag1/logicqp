const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando entorno de desarrollo local de LogicQP...');
console.log('');

// Verificar si Docker está instalado
try {
  execSync('docker --version', { stdio: 'ignore' });
  console.log('✅ Docker detectado');
} catch (error) {
  console.log('❌ Docker no está instalado o no está en el PATH');
  console.log('📥 Por favor instala Docker Desktop desde: https://www.docker.com/products/docker-desktop/');
  process.exit(1);
}

// Verificar si Docker está ejecutándose
try {
  execSync('docker ps', { stdio: 'ignore' });
  console.log('✅ Docker está ejecutándose');
} catch (error) {
  console.log('❌ Docker no está ejecutándose');
  console.log('🔄 Por favor inicia Docker Desktop');
  process.exit(1);
}

console.log('');
console.log('🐳 Iniciando servicios de Supabase local...');

try {
  // Iniciar Docker Compose
  execSync('docker-compose up -d', { stdio: 'inherit' });
  console.log('✅ Servicios de Supabase iniciados');
} catch (error) {
  console.log('❌ Error iniciando servicios de Supabase');
  console.log('🔍 Verifica los logs con: docker-compose logs');
  process.exit(1);
}

console.log('');
console.log('⏳ Esperando que los servicios estén listos...');

// Esperar 10 segundos para que los servicios se inicialicen
setTimeout(async () => {
  try {
    console.log('🌱 Poblando base de datos con datos de ejemplo...');
    
    // Ejecutar script de seed
    const { seedDatabase } = require('./seed-database');
    await seedDatabase();
    
    console.log('');
    console.log('🎉 ¡Entorno de desarrollo local listo!');
    console.log('');
    console.log('🌐 URLs de acceso:');
    console.log('   - Aplicación: http://localhost:3000');
    console.log('   - API Supabase: http://localhost:54321');
    console.log('   - Kong Gateway: http://localhost:8000');
    console.log('   - PostgreSQL: localhost:54322');
    console.log('');
    console.log('🔑 Credenciales:');
    console.log('   - Usuario: postgres');
    console.log('   - Contraseña: postgres');
    console.log('   - Base de datos: postgres');
    console.log('');
    console.log('📊 Datos incluidos:');
    console.log('   - 1 configuración de empresa (LogicQP)');
    console.log('   - 4 categorías de productos');
    console.log('   - 3 proveedores');
    console.log('   - 4 clientes');
    console.log('   - 9 productos con stock');
    console.log('   - 3 ventas con items');
    console.log('   - Movimientos de inventario');
    console.log('   - 12 configuraciones del sistema');
    console.log('   - 4 reportes de ejemplo');
    console.log('');
    console.log('🚀 Para iniciar la aplicación:');
    console.log('   cd apps/web && pnpm dev --port 3000');
    console.log('');
    console.log('🛠️ Comandos útiles:');
    console.log('   - Ver logs: docker-compose logs -f');
    console.log('   - Detener: docker-compose down');
    console.log('   - Reiniciar: docker-compose restart');
    
  } catch (error) {
    console.log('❌ Error poblando la base de datos:', error.message);
    console.log('🔍 Verifica que PostgreSQL esté ejecutándose');
  }
}, 10000);

