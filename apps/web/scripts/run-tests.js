#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Ejecutando tests de LogicQP...\n');

try {
  // Ejecutar tests con Vitest
  execSync('npx vitest run --reporter=verbose', {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });
  
  console.log('\n✅ Todos los tests pasaron exitosamente!');
  
} catch (error) {
  console.error('\n❌ Algunos tests fallaron:');
  console.error(error.message);
  process.exit(1);
}
