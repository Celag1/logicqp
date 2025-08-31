#!/usr/bin/env node

/**
 * Script de verificación de build para LogicQP
 * Ejecutar antes del despliegue en Vercel
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando build de LogicQP...\n');

// Verificar archivos críticos
const criticalFiles = [
  '.next',
  '.next/static',
  '.next/server',
  'public',
  'public/manifest.json',
  'public/sw.js'
];

let allFilesExist = true;

criticalFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - EXISTE`);
  } else {
    console.log(`❌ ${file} - NO EXISTE`);
    allFilesExist = false;
  }
});

// Verificar tamaño del build
if (fs.existsSync('.next')) {
  const stats = fs.statSync('.next');
  const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
  console.log(`\n📊 Tamaño del build: ${sizeInMB} MB`);
  
  if (parseFloat(sizeInMB) > 100) {
    console.log('⚠️  El build es muy grande. Considerar optimizaciones.');
  }
}

// Verificar archivos de configuración
const configFiles = [
  'vercel.json',
  '.vercelignore',
  'next.config.js',
  'tailwind.config.js'
];

console.log('\n🔧 Verificando archivos de configuración:');
configFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - EXISTE`);
  } else {
    console.log(`❌ ${file} - NO EXISTE`);
  }
});

// Verificar package.json
if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`\n📦 Versión de Next.js: ${packageJson.dependencies?.next || 'NO ENCONTRADA'}`);
  console.log(`📦 Versión de React: ${packageJson.dependencies?.react || 'NO ENCONTRADA'}`);
}

// Resultado final
console.log('\n' + '='.repeat(50));
if (allFilesExist) {
  console.log('🎉 BUILD VERIFICADO EXITOSAMENTE');
  console.log('✅ Listo para despliegue en Vercel');
  process.exit(0);
} else {
  console.log('❌ BUILD INCOMPLETO');
  console.log('⚠️  Revisar archivos faltantes antes del despliegue');
  process.exit(1);
}
