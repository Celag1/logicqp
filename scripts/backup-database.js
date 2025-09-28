#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('💾 ========================================');
console.log('   SISTEMA DE BACKUP Y RESTAURACIÓN');
console.log('   LogicQP - Qualipharm');
console.log('💾 ========================================');
console.log('');

async function backupDatabase() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '..', 'backups');
    const backupFile = path.join(backupDir, `qualipharm-backup-${timestamp}.json`);

    // Crear directorio de backups si no existe
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
      console.log('📁 Directorio de backups creado');
    }

    console.log('1. Iniciando backup de la base de datos...');
    console.log(`   📁 Archivo: ${backupFile}`);

    // Obtener datos de todas las tablas
    const tables = [
      'profiles',
      'empresa_config',
      'categorias',
      'proveedores',
      'clientes',
      'productos',
      'ventas',
      'venta_items',
      'inventario',
      'configuracion',
      'reportes',
      'notificaciones',
      'audit_logs',
      'login_attempts',
      'mfa_sessions'
    ];

    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      tables: {}
    };

    console.log('2. Exportando datos de las tablas...');

    for (const table of tables) {
      try {
        console.log(`   📊 Exportando ${table}...`);
        
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .order('id');

        if (error) {
          console.log(`   ⚠️ Error exportando ${table}: ${error.message}`);
          backupData.tables[table] = [];
        } else {
          backupData.tables[table] = data || [];
          console.log(`   ✅ ${table}: ${data?.length || 0} registros`);
        }
      } catch (error) {
        console.log(`   ❌ Error exportando ${table}: ${error.message}`);
        backupData.tables[table] = [];
      }
    }

    // Guardar backup
    console.log('3. Guardando archivo de backup...');
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));

    // Crear backup comprimido
    const compressedFile = backupFile.replace('.json', '.gz');
    try {
      execSync(`gzip -c "${backupFile}" > "${compressedFile}"`);
      console.log(`   ✅ Backup comprimido: ${compressedFile}`);
    } catch (error) {
      console.log('   ⚠️ No se pudo comprimir el backup');
    }

    // Estadísticas del backup
    const stats = fs.statSync(backupFile);
    const fileSizeKB = (stats.size / 1024).toFixed(2);

    console.log('');
    console.log('🎉 ========================================');
    console.log('   BACKUP COMPLETADO EXITOSAMENTE');
    console.log('🎉 ========================================');
    console.log('');
    console.log('📊 ESTADÍSTICAS:');
    console.log(`   📁 Archivo: ${path.basename(backupFile)}`);
    console.log(`   📏 Tamaño: ${fileSizeKB} KB`);
    console.log(`   📅 Fecha: ${new Date().toLocaleString('es-EC')}`);
    console.log(`   🗂️ Tablas: ${tables.length}`);
    console.log('');
    console.log('📋 REGISTROS EXPORTADOS:');
    
    Object.keys(backupData.tables).forEach(table => {
      const count = backupData.tables[table].length;
      console.log(`   ${table}: ${count} registros`);
    });

    console.log('');
    console.log('💡 COMANDOS ÚTILES:');
    console.log(`   - Restaurar: node scripts/restore-database.js "${backupFile}"`);
    console.log(`   - Listar backups: node scripts/list-backups.js`);
    console.log(`   - Limpiar backups antiguos: node scripts/cleanup-backups.js`);
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ ========================================');
    console.error('   ERROR EN BACKUP');
    console.error('❌ ========================================');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  backupDatabase();
}

module.exports = { backupDatabase };



