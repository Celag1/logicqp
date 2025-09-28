#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔄 ========================================');
console.log('   SISTEMA DE RESPALDOS AUTOMÁTICOS');
console.log('   LogicQP - Qualipharm');
console.log('🔄 ========================================');
console.log('');

class AutoBackupService {
  constructor() {
    this.backupDir = path.join(__dirname, '..', 'backups');
    this.maxBackups = 30; // Mantener 30 backups
    this.isRunning = false;
  }

  // Inicializar el servicio
  async initialize() {
    try {
      // Crear directorio de backups si no existe
      if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir, { recursive: true });
        console.log('📁 Directorio de backups creado');
      }

      // Verificar conexión a la base de datos
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) {
        throw new Error(`Error conectando a la base de datos: ${error.message}`);
      }

      console.log('✅ Conexión a la base de datos establecida');
      console.log('✅ Servicio de respaldos automáticos inicializado');
      console.log('');

      // Programar respaldos
      this.scheduleBackups();

    } catch (error) {
      console.error('❌ Error inicializando servicio de respaldos:', error.message);
      process.exit(1);
    }
  }

  // Programar respaldos automáticos
  scheduleBackups() {
    console.log('⏰ Programando respaldos automáticos...');

    // Respaldo diario a las 2:00 AM
    cron.schedule('0 2 * * *', () => {
      console.log('🕐 Ejecutando respaldo diario...');
      this.performBackup('daily');
    });

    // Respaldo semanal los domingos a las 3:00 AM
    cron.schedule('0 3 * * 0', () => {
      console.log('🕐 Ejecutando respaldo semanal...');
      this.performBackup('weekly');
    });

    // Respaldo mensual el día 1 a las 4:00 AM
    cron.schedule('0 4 1 * *', () => {
      console.log('🕐 Ejecutando respaldo mensual...');
      this.performBackup('monthly');
    });

    console.log('✅ Respaldos programados:');
    console.log('   - Diario: 2:00 AM');
    console.log('   - Semanal: Domingos 3:00 AM');
    console.log('   - Mensual: Día 1 a las 4:00 AM');
    console.log('');
  }

  // Realizar respaldo
  async performBackup(type = 'manual') {
    if (this.isRunning) {
      console.log('⚠️ Respaldo ya en progreso, saltando...');
      return;
    }

    this.isRunning = true;

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(this.backupDir, `qualipharm-${type}-${timestamp}.json`);

      console.log(`🔄 Iniciando respaldo ${type}...`);
      console.log(`   📁 Archivo: ${path.basename(backupFile)}`);

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
        type: type,
        version: '1.0.0',
        tables: {}
      };

      let totalRecords = 0;

      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .order('id');

          if (error) {
            console.log(`   ⚠️ Error exportando ${table}: ${error.message}`);
            backupData.tables[table] = [];
          } else {
            backupData.tables[table] = data || [];
            const count = data?.length || 0;
            totalRecords += count;
            console.log(`   ✅ ${table}: ${count} registros`);
          }
        } catch (error) {
          console.log(`   ❌ Error exportando ${table}: ${error.message}`);
          backupData.tables[table] = [];
        }
      }

      // Guardar backup
      fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));

      // Comprimir backup
      const compressedFile = backupFile.replace('.json', '.gz');
      try {
        const { execSync } = require('child_process');
        execSync(`gzip -c "${backupFile}" > "${compressedFile}"`);
        console.log(`   ✅ Backup comprimido: ${path.basename(compressedFile)}`);
        
        // Eliminar archivo sin comprimir
        fs.unlinkSync(backupFile);
      } catch (error) {
        console.log('   ⚠️ No se pudo comprimir el backup');
      }

      // Estadísticas del backup
      const stats = fs.statSync(compressedFile);
      const fileSizeKB = (stats.size / 1024).toFixed(2);

      console.log('');
      console.log('🎉 ========================================');
      console.log(`   RESPALDO ${type.toUpperCase()} COMPLETADO`);
      console.log('🎉 ========================================');
      console.log('');
      console.log('📊 ESTADÍSTICAS:');
      console.log(`   📁 Archivo: ${path.basename(compressedFile)}`);
      console.log(`   📏 Tamaño: ${fileSizeKB} KB`);
      console.log(`   📅 Fecha: ${new Date().toLocaleString('es-EC')}`);
      console.log(`   🗂️ Tablas: ${tables.length}`);
      console.log(`   📊 Registros: ${totalRecords}`);
      console.log('');

      // Limpiar backups antiguos
      await this.cleanupOldBackups();

      // Crear notificación de respaldo exitoso
      await this.createBackupNotification(type, totalRecords, fileSizeKB);

    } catch (error) {
      console.error('❌ Error en respaldo:', error.message);
      await this.createBackupErrorNotification(type, error.message);
    } finally {
      this.isRunning = false;
    }
  }

  // Limpiar backups antiguos
  async cleanupOldBackups() {
    try {
      console.log('🧹 Limpiando backups antiguos...');

      const files = fs.readdirSync(this.backupDir)
        .filter(file => file.endsWith('.gz'))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file),
          stats: fs.statSync(path.join(this.backupDir, file))
        }))
        .sort((a, b) => b.stats.mtime - a.stats.mtime);

      if (files.length > this.maxBackups) {
        const filesToDelete = files.slice(this.maxBackups);
        
        for (const file of filesToDelete) {
          fs.unlinkSync(file.path);
          console.log(`   🗑️ Eliminado: ${file.name}`);
        }

        console.log(`   ✅ ${filesToDelete.length} backups antiguos eliminados`);
      } else {
        console.log(`   ✅ Solo ${files.length} backups, no se eliminan`);
      }

    } catch (error) {
      console.log('   ⚠️ Error limpiando backups antiguos:', error.message);
    }
  }

  // Crear notificación de respaldo exitoso
  async createBackupNotification(type, totalRecords, fileSize) {
    try {
      const { error } = await supabase
        .from('notificaciones')
        .insert([{
          usuario_id: '00000000-0000-0000-0000-000000000000', // Sistema
          titulo: `✅ Respaldo ${type} completado`,
          mensaje: `Respaldo ${type} completado exitosamente. ${totalRecords} registros respaldados (${fileSize} KB)`,
          tipo: 'success'
        }]);

      if (error) {
        console.log('   ⚠️ Error creando notificación:', error.message);
      }
    } catch (error) {
      console.log('   ⚠️ Error creando notificación:', error.message);
    }
  }

  // Crear notificación de error en respaldo
  async createBackupErrorNotification(type, errorMessage) {
    try {
      const { error } = await supabase
        .from('notificaciones')
        .insert([{
          usuario_id: '00000000-0000-0000-0000-000000000000', // Sistema
          titulo: `❌ Error en respaldo ${type}`,
          mensaje: `Error en respaldo ${type}: ${errorMessage}`,
          tipo: 'error'
        }]);

      if (error) {
        console.log('   ⚠️ Error creando notificación de error:', error.message);
      }
    } catch (error) {
      console.log('   ⚠️ Error creando notificación de error:', error.message);
    }
  }

  // Listar backups disponibles
  listBackups() {
    try {
      const files = fs.readdirSync(this.backupDir)
        .filter(file => file.endsWith('.gz'))
        .map(file => {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            size: (stats.size / 1024).toFixed(2) + ' KB',
            date: stats.mtime.toLocaleString('es-EC')
          };
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      console.log('📁 Backups disponibles:');
      files.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.name}`);
        console.log(`      📏 Tamaño: ${file.size}`);
        console.log(`      📅 Fecha: ${file.date}`);
      });

      return files;
    } catch (error) {
      console.log('❌ Error listando backups:', error.message);
      return [];
    }
  }

  // Restaurar desde backup
  async restoreFromBackup(backupFile) {
    try {
      console.log(`🔄 Restaurando desde: ${backupFile}`);

      // Verificar que el archivo existe
      if (!fs.existsSync(backupFile)) {
        throw new Error(`El archivo ${backupFile} no existe`);
      }

      // Leer archivo de backup
      const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
      
      console.log(`   📅 Fecha del backup: ${backupData.timestamp}`);
      console.log(`   🔢 Versión: ${backupData.version}`);
      console.log(`   🗂️ Tablas: ${Object.keys(backupData.tables).length}`);

      // Orden de restauración
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

      // Limpiar datos existentes
      console.log('🧹 Limpiando datos existentes...');
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

      // Restaurar datos
      console.log('🔄 Restaurando datos...');
      let totalRestored = 0;

      for (const table of restoreOrder) {
        if (backupData.tables[table] && backupData.tables[table].length > 0) {
          try {
            const { error } = await supabase
              .from(table)
              .insert(backupData.tables[table]);

            if (error) {
              console.log(`   ❌ Error restaurando ${table}: ${error.message}`);
            } else {
              const count = backupData.tables[table].length;
              console.log(`   ✅ ${table}: ${count} registros`);
              totalRestored += count;
            }
          } catch (error) {
            console.log(`   ❌ Error restaurando ${table}: ${error.message}`);
          }
        }
      }

      console.log('');
      console.log('🎉 ========================================');
      console.log('   RESTAURACIÓN COMPLETADA');
      console.log('🎉 ========================================');
      console.log(`   ✅ Registros restaurados: ${totalRestored}`);
      console.log('');

    } catch (error) {
      console.error('❌ Error en restauración:', error.message);
      throw error;
    }
  }
}

// Crear instancia del servicio
const autoBackupService = new AutoBackupService();

// Manejar argumentos de línea de comandos
const command = process.argv[2];
const backupFile = process.argv[3];

switch (command) {
  case 'start':
    console.log('🚀 Iniciando servicio de respaldos automáticos...');
    autoBackupService.initialize();
    break;

  case 'backup':
    console.log('🔄 Ejecutando respaldo manual...');
    autoBackupService.performBackup('manual');
    break;

  case 'list':
    autoBackupService.listBackups();
    break;

  case 'restore':
    if (!backupFile) {
      console.log('❌ Debes especificar un archivo de backup');
      console.log('💡 Uso: node scripts/auto-backup.js restore "backup.gz"');
      process.exit(1);
    }
    autoBackupService.restoreFromBackup(backupFile);
    break;

  default:
    console.log('🔄 ========================================');
    console.log('   SISTEMA DE RESPALDOS AUTOMÁTICOS');
    console.log('🔄 ========================================');
    console.log('');
    console.log('💡 Comandos disponibles:');
    console.log('   start    - Iniciar servicio de respaldos automáticos');
    console.log('   backup   - Ejecutar respaldo manual');
    console.log('   list     - Listar backups disponibles');
    console.log('   restore  - Restaurar desde backup');
    console.log('');
    console.log('📝 Ejemplos:');
    console.log('   node scripts/auto-backup.js start');
    console.log('   node scripts/auto-backup.js backup');
    console.log('   node scripts/auto-backup.js list');
    console.log('   node scripts/auto-backup.js restore "backup.gz"');
    console.log('');
    break;
}

module.exports = { AutoBackupService };



