#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Optimizando rendimiento de LOGICQP...\n');

// Función para limpiar archivos de caché
function cleanCache() {
  const cacheDirs = [
    '.next',
    'node_modules/.cache',
    '.turbo',
    'dist',
    'build'
  ];

  console.log('🧹 Limpiando archivos de caché...');
  
  cacheDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`   ✅ Eliminado: ${dir}`);
    }
  });
}

// Función para optimizar package.json
function optimizePackageJson() {
  const packagePath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    console.log('   ⚠️  No se encontró package.json');
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Agregar scripts de optimización si no existen
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  packageJson.scripts = {
    ...packageJson.scripts,
    'optimize': 'node scripts/optimize-performance.js',
    'analyze': 'ANALYZE=true next build',
    'build:fast': 'next build --no-lint',
    'dev:fast': 'next dev --turbo'
  };

  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log('   ✅ package.json optimizado');
}

// Función para crear archivo de configuración de rendimiento
function createPerformanceConfig() {
  const configContent = `// Configuración de rendimiento generada automáticamente
export const PERFORMANCE_OPTIMIZATIONS = {
  // Habilitar compresión
  compression: true,
  
  // Optimizar imágenes
  imageOptimization: true,
  
  // Lazy loading
  lazyLoading: true,
  
  // Cache de consultas
  queryCache: true,
  
  // Minificación
  minification: true,
  
  // Tree shaking
  treeShaking: true
};
`;

  const configPath = path.join(process.cwd(), 'lib', 'performance-optimizations.ts');
  const libDir = path.dirname(configPath);
  
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }
  
  fs.writeFileSync(configPath, configContent);
  console.log('   ✅ Configuración de rendimiento creada');
}

// Función para verificar dependencias
function checkDependencies() {
  const packagePath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const performancePackages = [
    'next',
    'react',
    'react-dom',
    '@supabase/supabase-js',
    'lucide-react'
  ];

  const missingPackages = performancePackages.filter(pkg => !dependencies[pkg]);
  
  if (missingPackages.length > 0) {
    console.log('   ⚠️  Paquetes recomendados faltantes:');
    missingPackages.forEach(pkg => {
      console.log(`      - ${pkg}`);
    });
  } else {
    console.log('   ✅ Todas las dependencias de rendimiento están presentes');
  }
}

// Función para crear archivo de monitoreo
function createMonitoringScript() {
  const monitoringContent = `// Script de monitoreo de rendimiento
export const performanceMonitor = {
  // Métricas de carga
  measureLoadTime: () => {
    if (typeof window === 'undefined') return;
    
    const navigation = performance.getEntriesByType('navigation')[0];
    return navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0;
  },
  
  // Métricas de memoria
  measureMemory: () => {
    if (typeof window === 'undefined') return null;
    
    const memory = (performance as any).memory;
    return memory ? {
      used: memory.usedJSHeapSize / 1024 / 1024,
      total: memory.totalJSHeapSize / 1024 / 1024,
      limit: memory.jsHeapSizeLimit / 1024 / 1024
    } : null;
  },
  
  // Métricas de red
  measureNetwork: () => {
    if (typeof window === 'undefined') return null;
    
    const resources = performance.getEntriesByType('resource');
    return {
      totalRequests: resources.length,
      totalSize: resources.reduce((total, resource) => total + (resource.transferSize || 0), 0),
      averageTime: resources.reduce((total, resource) => total + resource.duration, 0) / resources.length
    };
  }
};
`;

  const monitoringPath = path.join(process.cwd(), 'lib', 'performance-monitor.ts');
  fs.writeFileSync(monitoringPath, monitoringContent);
  console.log('   ✅ Script de monitoreo creado');
}

// Ejecutar optimizaciones
async function runOptimizations() {
  try {
    cleanCache();
    optimizePackageJson();
    createPerformanceConfig();
    createMonitoringScript();
    checkDependencies();
    
    console.log('\n🎉 Optimización completada exitosamente!');
    console.log('\n📋 Próximos pasos:');
    console.log('   1. Ejecuta: npm install');
    console.log('   2. Ejecuta: npm run dev:fast');
    console.log('   3. Presiona Ctrl+Shift+P para ver el monitor de rendimiento');
    console.log('   4. Verifica que la aplicación cargue más rápido');
    
  } catch (error) {
    console.error('❌ Error durante la optimización:', error.message);
    process.exit(1);
  }
}

runOptimizations();
