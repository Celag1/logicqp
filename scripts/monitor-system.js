#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('📊 ========================================');
console.log('   SISTEMA DE MONITOREO LOGICQP');
console.log('   Qualipharm Laboratorio Farmacéutico');
console.log('📊 ========================================');
console.log('');

async function monitorSystem() {
  try {
    const timestamp = new Date().toISOString();
    const logFile = path.join(__dirname, '..', 'logs', `monitor-${new Date().toISOString().split('T')[0]}.log`);
    
    // Crear directorio de logs si no existe
    const logsDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    console.log('1. Verificando estado del sistema...');

    // Verificar conexión a la base de datos
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (testError) {
      console.log('   ❌ Error de conexión a la base de datos');
      logError(logFile, 'DATABASE_CONNECTION_ERROR', testError.message);
      return;
    }

    console.log('   ✅ Conexión a la base de datos: OK');

    // Verificar servicios Docker
    console.log('');
    console.log('2. Verificando servicios Docker...');
    
    try {
      const { execSync } = require('child_process');
      const dockerPs = execSync('docker ps --format "table {{.Names}}\t{{.Status}}"', { encoding: 'utf8' });
      console.log('   ✅ Servicios Docker:');
      console.log(dockerPs);
    } catch (error) {
      console.log('   ⚠️ No se pudo verificar Docker');
    }

    // Estadísticas de la base de datos
    console.log('');
    console.log('3. Estadísticas de la base de datos...');

    const stats = {
      usuarios: 0,
      productos: 0,
      ventas: 0,
      inventario: 0,
      clientes: 0,
      proveedores: 0,
      categorias: 0,
      configuracion: 0,
      reportes: 0,
      notificaciones: 0,
      audit_logs: 0,
      login_attempts: 0
    };

    const tables = [
      'profiles',
      'productos',
      'ventas',
      'inventario',
      'clientes',
      'proveedores',
      'categorias',
      'configuracion',
      'reportes',
      'notificaciones',
      'audit_logs',
      'login_attempts'
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('id', { count: 'exact' });

        if (error) {
          console.log(`   ❌ ${table}: Error - ${error.message}`);
          stats[table] = -1;
        } else {
          const count = data?.length || 0;
          stats[table] = count;
          console.log(`   ✅ ${table}: ${count} registros`);
        }
      } catch (error) {
        console.log(`   ❌ ${table}: Error - ${error.message}`);
        stats[table] = -1;
      }
    }

    // Verificar usuarios activos
    console.log('');
    console.log('4. Verificando usuarios activos...');
    
    try {
      const { data: usuariosActivos } = await supabase
        .from('profiles')
        .select('email, nombre, apellido, rol, last_login')
        .not('last_login', 'is', null)
        .order('last_login', { ascending: false })
        .limit(5);

      if (usuariosActivos && usuariosActivos.length > 0) {
        console.log('   👥 Últimos usuarios activos:');
        usuariosActivos.forEach(usuario => {
          const lastLogin = usuario.last_login ? 
            new Date(usuario.last_login).toLocaleString('es-EC') : 'Nunca';
          console.log(`      - ${usuario.nombre} ${usuario.apellido} (${usuario.email}) - ${lastLogin}`);
        });
      } else {
        console.log('   ⚠️ No hay usuarios activos recientes');
      }
    } catch (error) {
      console.log('   ❌ Error verificando usuarios activos');
    }

    // Verificar ventas recientes
    console.log('');
    console.log('5. Verificando ventas recientes...');
    
    try {
      const { data: ventasRecientes } = await supabase
        .from('ventas')
        .select('id, total, fecha, estado')
        .order('fecha', { ascending: false })
        .limit(5);

      if (ventasRecientes && ventasRecientes.length > 0) {
        console.log('   💰 Últimas ventas:');
        ventasRecientes.forEach(venta => {
          const fecha = new Date(venta.fecha).toLocaleString('es-EC');
          console.log(`      - Venta #${venta.id}: $${venta.total} (${venta.estado}) - ${fecha}`);
        });
      } else {
        console.log('   ⚠️ No hay ventas recientes');
      }
    } catch (error) {
      console.log('   ❌ Error verificando ventas recientes');
    }

    // Verificar productos con stock bajo
    console.log('');
    console.log('6. Verificando productos con stock bajo...');
    
    try {
      const { data: stockBajo } = await supabase
        .from('productos')
        .select('nombre, stock, stock_minimo')
        .lte('stock', 'stock_minimo')
        .limit(5);

      if (stockBajo && stockBajo.length > 0) {
        console.log('   ⚠️ Productos con stock bajo:');
        stockBajo.forEach(producto => {
          console.log(`      - ${producto.nombre}: ${producto.stock}/${producto.stock_minimo}`);
        });
      } else {
        console.log('   ✅ No hay productos con stock bajo');
      }
    } catch (error) {
      console.log('   ❌ Error verificando stock bajo');
    }

    // Verificar logs de auditoría
    console.log('');
    console.log('7. Verificando logs de auditoría...');
    
    try {
      const { data: auditLogs } = await supabase
        .from('audit_logs')
        .select('accion, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (auditLogs && auditLogs.length > 0) {
        console.log('   📋 Últimas acciones:');
        auditLogs.forEach(log => {
          const fecha = new Date(log.created_at).toLocaleString('es-EC');
          console.log(`      - ${log.accion} - ${fecha}`);
        });
      } else {
        console.log('   ⚠️ No hay logs de auditoría recientes');
      }
    } catch (error) {
      console.log('   ❌ Error verificando logs de auditoría');
    }

    // Generar reporte de estado
    console.log('');
    console.log('8. Generando reporte de estado...');
    
    const reporte = {
      timestamp: timestamp,
      status: 'OK',
      database_connection: 'OK',
      docker_services: 'OK',
      stats: stats,
      alerts: []
    };

    // Verificar alertas
    if (stats.productos === 0) {
      reporte.alerts.push('No hay productos en la base de datos');
    }
    if (stats.usuarios === 0) {
      reporte.alerts.push('No hay usuarios en la base de datos');
    }
    if (stats.ventas === 0) {
      reporte.alerts.push('No hay ventas en la base de datos');
    }

    // Guardar reporte
    const reportFile = path.join(logsDir, `status-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(reporte, null, 2));

    console.log('   ✅ Reporte guardado en:', reportFile);

    // Resumen final
    console.log('');
    console.log('🎉 ========================================');
    console.log('   MONITOREO COMPLETADO');
    console.log('🎉 ========================================');
    console.log('');
    console.log('📊 RESUMEN:');
    console.log(`   🗄️ Base de datos: ${reporte.database_connection}`);
    console.log(`   🐳 Docker: ${reporte.docker_services}`);
    console.log(`   👥 Usuarios: ${stats.usuarios}`);
    console.log(`   💊 Productos: ${stats.productos}`);
    console.log(`   💰 Ventas: ${stats.ventas}`);
    console.log(`   📦 Inventario: ${stats.inventario}`);
    console.log(`   🏥 Clientes: ${stats.clientes}`);
    console.log(`   🏭 Proveedores: ${stats.proveedores}`);
    console.log(`   📂 Categorías: ${stats.categorias}`);
    console.log(`   ⚙️ Configuraciones: ${stats.configuracion}`);
    console.log(`   📋 Reportes: ${stats.reportes}`);
    console.log(`   🔔 Notificaciones: ${stats.notificaciones}`);
    console.log(`   📊 Logs de auditoría: ${stats.audit_logs}`);
    console.log(`   🔐 Intentos de login: ${stats.login_attempts}`);
    
    if (reporte.alerts.length > 0) {
      console.log('');
      console.log('⚠️ ALERTAS:');
      reporte.alerts.forEach(alert => {
        console.log(`   - ${alert}`);
      });
    }

    console.log('');
    console.log('💡 COMANDOS ÚTILES:');
    console.log('   - Ver logs: node scripts/view-logs.js');
    console.log('   - Backup: node scripts/backup-database.js');
    console.log('   - Restaurar: node scripts/restore-database.js "backup.json"');
    console.log('   - Limpiar logs: node scripts/cleanup-logs.js');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ ========================================');
    console.error('   ERROR EN MONITOREO');
    console.error('❌ ========================================');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    process.exit(1);
  }
}

function logError(logFile, type, message) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type: type,
    message: message
  };
  
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  monitorSystem();
}

module.exports = { monitorSystem };



