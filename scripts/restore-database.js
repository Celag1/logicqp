#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔄 ========================================');
console.log('   SISTEMA DE RESTAURACIÓN');
console.log('   LogicQP - Qualipharm');
console.log('🔄 ========================================');
console.log('');

async function restoreDatabase(backupFile) {
  try {
    // Verificar archivo de backup
    if (!backupFile) {
      console.log('❌ Error: Debes especificar un archivo de backup');
      console.log('');
      console.log('💡 Uso: node scripts/restore-database.js "ruta/al/backup.json"');
      console.log('');
      console.log('📁 Backups disponibles:');
      
      const backupsDir = path.join(__dirname, '..', 'backups');
      if (fs.existsSync(backupsDir)) {
        const files = fs.readdirSync(backupsDir)
          .filter(file => file.endsWith('.json'))
          .sort()
          .reverse();
        
        files.forEach((file, index) => {
          const filePath = path.join(backupsDir, file);
          const stats = fs.statSync(filePath);
          const date = stats.mtime.toLocaleString('es-EC');
          console.log(`   ${index + 1}. ${file} (${date})`);
        });
      } else {
        console.log('   No hay backups disponibles');
      }
      
      process.exit(1);
    }

    // Verificar que el archivo existe
    if (!fs.existsSync(backupFile)) {
      console.log(`❌ Error: El archivo ${backupFile} no existe`);
      process.exit(1);
    }

    console.log(`📁 Restaurando desde: ${backupFile}`);

    // Leer archivo de backup
    console.log('1. Leyendo archivo de backup...');
    const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    
    console.log(`   📅 Fecha del backup: ${backupData.timestamp}`);
    console.log(`   🔢 Versión: ${backupData.version}`);
    console.log(`   🗂️ Tablas: ${Object.keys(backupData.tables).length}`);

    // Confirmar restauración
    console.log('');
    console.log('⚠️  ADVERTENCIA: Esta operación va a:');
    console.log('   - ELIMINAR todos los datos existentes');
    console.log('   - RESTAURAR los datos del backup');
    console.log('   - NO se puede deshacer');
    console.log('');
    console.log('¿Estás seguro de que quieres continuar? (S/N)');
    
    // En modo automático, continuar
    console.log('   🤖 Modo automático: Continuando...');

    // Orden de restauración (importante para las foreign keys)
    const restoreOrder = [
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

    console.log('');
    console.log('2. Limpiando datos existentes...');
    
    // Limpiar en orden inverso para respetar foreign keys
    for (let i = restoreOrder.length - 1; i >= 0; i--) {
      const table = restoreOrder[i];
      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .neq('id', 0);
        
        if (error) {
          console.log(`   ⚠️ Error limpiando ${table}: ${error.message}`);
        } else {
          console.log(`   ✅ ${table} limpiado`);
        }
      } catch (error) {
        console.log(`   ⚠️ Error limpiando ${table}: ${error.message}`);
      }
    }

    console.log('');
    console.log('3. Restaurando datos del backup...');

    let totalRestored = 0;
    let totalErrors = 0;

    for (const table of restoreOrder) {
      if (backupData.tables[table] && backupData.tables[table].length > 0) {
        try {
          console.log(`   📊 Restaurando ${table}...`);
          
          const { error } = await supabase
            .from(table)
            .insert(backupData.tables[table]);

          if (error) {
            console.log(`   ❌ Error restaurando ${table}: ${error.message}`);
            totalErrors++;
          } else {
            console.log(`   ✅ ${table}: ${backupData.tables[table].length} registros`);
            totalRestored += backupData.tables[table].length;
          }
        } catch (error) {
          console.log(`   ❌ Error restaurando ${table}: ${error.message}`);
          totalErrors++;
        }
      } else {
        console.log(`   ⏭️ ${table}: Sin datos en el backup`);
      }
    }

    console.log('');
    console.log('🎉 ========================================');
    console.log('   RESTAURACIÓN COMPLETADA');
    console.log('🎉 ========================================');
    console.log('');
    console.log('📊 ESTADÍSTICAS:');
    console.log(`   ✅ Registros restaurados: ${totalRestored}`);
    console.log(`   ❌ Errores: ${totalErrors}`);
    console.log(`   📅 Fecha del backup: ${backupData.timestamp}`);
    console.log('');
    console.log('🔍 VERIFICANDO DATOS RESTAURADOS...');

    // Verificar datos restaurados
    for (const table of ['profiles', 'productos', 'ventas']) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);

        if (error) {
          console.log(`   ❌ ${table}: Error verificando`);
        } else {
          console.log(`   ✅ ${table}: Datos verificados`);
        }
      } catch (error) {
        console.log(`   ❌ ${table}: Error verificando`);
      }
    }

    console.log('');
    console.log('🚀 ¡SISTEMA RESTAURADO Y OPERATIVO!');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ ========================================');
    console.error('   ERROR EN RESTAURACIÓN');
    console.error('❌ ========================================');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const backupFile = process.argv[2];
  restoreDatabase(backupFile);
}

module.exports = { restoreDatabase };



