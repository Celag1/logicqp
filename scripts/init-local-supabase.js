const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Inicializando Supabase Local para LogicQP...');

// Crear directorio supabase si no existe
const supabaseDir = path.join(__dirname, '..', 'supabase');
if (!fs.existsSync(supabaseDir)) {
  fs.mkdirSync(supabaseDir, { recursive: true });
  console.log('📁 Directorio supabase creado');
}

// Crear directorio de migraciones si no existe
const migrationsDir = path.join(supabaseDir, 'migrations');
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
  console.log('📁 Directorio de migraciones creado');
}

console.log('✅ Estructura de directorios creada');
console.log('📊 Archivos de configuración listos:');
console.log('   - supabase/config.toml');
console.log('   - supabase/migrations/20250101000000_initial_schema.sql');
console.log('   - supabase/seed.sql');
console.log('   - docker-compose.yml');
console.log('   - kong.yml');
console.log('');
console.log('🎯 Para iniciar Supabase local:');
console.log('   1. Instalar Docker Desktop');
console.log('   2. Ejecutar: docker-compose up -d');
console.log('   3. Esperar que los servicios estén listos');
console.log('   4. Ejecutar: node scripts/seed-database.js');
console.log('');
console.log('🌐 URLs de acceso:');
console.log('   - API: http://localhost:54321');
console.log('   - Kong: http://localhost:8000');
console.log('   - PostgreSQL: localhost:54322');
console.log('');
console.log('🔑 Credenciales:');
console.log('   - Usuario: postgres');
console.log('   - Contraseña: postgres');
console.log('   - Base de datos: postgres');
