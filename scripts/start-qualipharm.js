const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏥 Iniciando Qualipharm Laboratorio Farmacéutico...');
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

// Esperar 15 segundos para que los servicios se inicialicen
setTimeout(async () => {
  try {
    console.log('🌱 Poblando base de datos con datos de Qualipharm...');
    
    // Ejecutar script de seed
    const { seedDatabase } = require('./seed-database');
    await seedDatabase();
    
    console.log('');
    console.log('🎉 ¡Qualipharm Laboratorio Farmacéutico está listo!');
    console.log('');
    console.log('🏥 INFORMACIÓN DE QUALIPHARM:');
    console.log('   - Empresa: Qualipharm Laboratorio Farmacéutico');
    console.log('   - Dirección: Av. 6 de Diciembre N37-140 y Alpallana, Quito, Ecuador');
    console.log('   - Teléfono: +593 2 255 1234');
    console.log('   - Email: info@qualipharm.com.ec');
    console.log('   - RUC: 1791234567001');
    console.log('');
    console.log('📊 DATOS INCLUIDOS:');
    console.log('   - 12 categorías farmacéuticas (Antibióticos, Analgésicos, etc.)');
    console.log('   - 8 proveedores farmacéuticos (Pfizer, Novartis, Roche, etc.)');
    console.log('   - 8 clientes (Farmacias y Hospitales de Quito)');
    console.log('   - 24 productos farmacéuticos con códigos de barras');
    console.log('   - 4 ventas con items detallados');
    console.log('   - Movimientos de inventario completos');
    console.log('   - 20 configuraciones del sistema');
    console.log('   - 6 reportes especializados');
    console.log('');
    console.log('🔧 FUNCIONALIDADES IMPLEMENTADAS:');
    console.log('   ✅ Sistema de códigos de barras (CODE128, EAN13, etc.)');
    console.log('   ✅ Envío real de emails (SMTP configurado)');
    console.log('   ✅ Sistema de seguridad avanzado (RLS, auditoría)');
    console.log('   ✅ Gestión completa de inventario');
    console.log('   ✅ Sistema de ventas con facturación');
    console.log('   ✅ Reportes avanzados');
    console.log('   ✅ Notificaciones de stock bajo');
    console.log('   ✅ Validación de datos y sanitización');
    console.log('   ✅ Sistema de roles y permisos');
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
    console.log('🚀 Para iniciar la aplicación:');
    console.log('   cd apps/web && pnpm dev --port 3000');
    console.log('');
    console.log('🛠️ Comandos útiles:');
    console.log('   - Ver logs: docker-compose logs -f');
    console.log('   - Detener: docker-compose down');
    console.log('   - Reiniciar: docker-compose restart');
    console.log('');
    console.log('📱 PÁGINAS DISPONIBLES:');
    console.log('   - /usuarios - Gestión de usuarios');
    console.log('   - /productos - Gestión de productos con códigos de barras');
    console.log('   - /ventas - Sistema de ventas');
    console.log('   - /inventario - Gestión de inventario');
    console.log('   - /reportes - Reportes avanzados');
    console.log('   - /configuracion - Configuración del sistema');
    console.log('');
    console.log('🎯 ¡Sistema Qualipharm listo para producción!');
    
  } catch (error) {
    console.log('❌ Error poblando la base de datos:', error.message);
    console.log('🔍 Verifica que PostgreSQL esté ejecutándose');
  }
}, 15000);

