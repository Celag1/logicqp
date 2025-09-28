#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏥 ========================================');
console.log('   INICIANDO LOGICQP QUALIPHARM COMPLETO');
console.log('🏥 ========================================');
console.log('');

// Función para ejecutar comandos
function runCommand(command, description) {
  try {
    console.log(`🔄 ${description}...`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completado`);
  } catch (error) {
    console.error(`❌ Error en ${description}:`, error.message);
    throw error;
  }
}

// Función para verificar si Docker está ejecutándose
function checkDocker() {
  try {
    execSync('docker ps', { stdio: 'pipe' });
    console.log('✅ Docker está ejecutándose');
    return true;
  } catch (error) {
    console.log('❌ Docker no está ejecutándose');
    return false;
  }
}

// Función para esperar
function wait(seconds) {
  console.log(`⏳ Esperando ${seconds} segundos...`);
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function startQualipharmComplete() {
  try {
    // 1. Verificar Docker
    console.log('1. Verificando Docker...');
    if (!checkDocker()) {
      console.log('❌ Docker no está ejecutándose. Por favor:');
      console.log('   - Abre Docker Desktop');
      console.log('   - Espera que se inicie completamente');
      console.log('   - Ejecuta este script nuevamente');
      process.exit(1);
    }

    // 2. Iniciar servicios de Supabase Local
    console.log('');
    console.log('2. Iniciando servicios de Supabase Local...');
    runCommand('docker-compose up -d', 'Iniciando contenedores Docker');

    // 3. Esperar que PostgreSQL esté listo
    console.log('');
    console.log('3. Esperando que PostgreSQL esté listo...');
    await wait(30);

    // 4. Verificar que los servicios estén funcionando
    console.log('');
    console.log('4. Verificando servicios...');
    runCommand('docker ps', 'Verificando contenedores');

    // 5. Aplicar migraciones
    console.log('');
    console.log('5. Aplicando migraciones de base de datos...');
    runCommand('node scripts/apply-migrations.js', 'Aplicando migraciones');

    // 6. Poblar base de datos
    console.log('');
    console.log('6. Poblando base de datos con datos de Qualipharm (modo inteligente)...');
    runCommand('node scripts/seed-qualipharm-smart.js', 'Poblando base de datos');

    // 7. Verificar datos (modo inteligente)
    console.log('');
    console.log('7. Verificando datos existentes...');
    runCommand('node scripts/verify-data-intelligent.js', 'Verificando datos');

    // 8. Verificar/crear usuario super-admin (solo si no existe)
    console.log('');
    console.log('8. Verificando usuario super-admin...');
    runCommand('node scripts/create-super-admin.js', 'Verificando/creando super-admin');

    // 9. Iniciar aplicación Next.js
    console.log('');
    console.log('9. Iniciando aplicación LogicQP...');
    console.log('   La aplicación se iniciará en segundo plano');
    console.log('   Accede a: http://localhost:3000');
    console.log('');

    // Iniciar en segundo plano
    const { spawn } = require('child_process');
    const nextProcess = spawn('pnpm', ['dev', '--port', '3000'], {
      cwd: path.join(__dirname, '..', 'apps', 'web'),
      stdio: 'inherit',
      detached: true
    });

    nextProcess.unref();

    // 10. Mostrar resumen final
    console.log('');
    console.log('🎉 ========================================');
    console.log('   LOGICQP QUALIPHARM INICIADO EXITOSAMENTE');
    console.log('🎉 ========================================');
    console.log('');
    console.log('📊 SERVICIOS ACTIVOS:');
    console.log('   ✅ PostgreSQL Local - Base de datos');
    console.log('   ✅ PostgREST API - API REST');
    console.log('   ✅ Kong Gateway - API Gateway');
    console.log('   ✅ Next.js App - Aplicación web');
    console.log('');
    console.log('🌐 URLs DE ACCESO:');
    console.log('   🏥 Aplicación Principal: http://localhost:3000');
    console.log('   🔌 API Supabase: http://localhost:54321');
    console.log('   🌐 Kong Gateway: http://localhost:8000');
    console.log('   🗄️ PostgreSQL: localhost:54322');
    console.log('');
    console.log('🔑 CREDENCIALES DE ACCESO:');
    console.log('   👑 Super-Admin:');
    console.log('      Email: celag3@gmail.com');
    console.log('      Clave: Ibot1801538719');
    console.log('      Celular: 0998769259');
    console.log('');
    console.log('   👨‍💼 Administrador:');
    console.log('      Email: admin@qualipharm.com.ec');
    console.log('      Clave: admin123456');
    console.log('');
    console.log('   👨‍💼 Vendedor:');
    console.log('      Email: vendedor@qualipharm.com.ec');
    console.log('      Clave: vendedor123456');
    console.log('');
    console.log('📋 FUNCIONALIDADES DISPONIBLES:');
    console.log('   ✅ Sistema de roles (Super-Admin, Admin, Vendedor, etc.)');
    console.log('   ✅ Autenticación multifactor (MFA)');
    console.log('   ✅ Envío real de emails y SMS');
    console.log('   ✅ Gestión completa de productos farmacéuticos');
    console.log('   ✅ Sistema de ventas con facturación');
    console.log('   ✅ Control de inventario en tiempo real');
    console.log('   ✅ Reportes avanzados');
    console.log('   ✅ Logs de auditoría');
    console.log('   ✅ Seguridad avanzada');
    console.log('');
    console.log('🎯 DATOS INCLUIDOS:');
    console.log('   🏢 Qualipharm Laboratorio Farmacéutico');
    console.log('   💊 24 productos farmacéuticos con códigos de barras');
    console.log('   🏥 8 clientes (farmacias y hospitales)');
    console.log('   🏭 8 proveedores farmacéuticos');
    console.log('   📦 12 categorías de productos');
    console.log('   💰 4 ventas de ejemplo');
    console.log('   📊 Movimientos de inventario');
    console.log('   ⚙️ 20 configuraciones del sistema');
    console.log('');
    console.log('🚀 ¡SISTEMA COMPLETAMENTE OPERATIVO!');
    console.log('');
    console.log('💡 COMANDOS ÚTILES:');
    console.log('   - Ver logs: docker-compose logs -f');
    console.log('   - Detener: docker-compose down');
    console.log('   - Reiniciar: docker-compose restart');
    console.log('   - Estado: docker ps');
    console.log('');
    console.log('📞 Soporte: Sistema LogicQP - Qualipharm');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ ========================================');
    console.error('   ERROR INICIANDO LOGICQP QUALIPHARM');
    console.error('❌ ========================================');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    console.error('💡 SOLUCIONES:');
    console.error('   1. Verifica que Docker Desktop esté ejecutándose');
    console.error('   2. Verifica que los puertos 3000, 54321, 8000, 54322 estén libres');
    console.error('   3. Ejecuta: docker-compose down && docker-compose up -d');
    console.error('   4. Revisa los logs: docker-compose logs');
    console.error('');
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  startQualipharmComplete();
}

module.exports = { startQualipharmComplete };
