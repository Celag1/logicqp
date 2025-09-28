#!/usr/bin/env node

/**
 * SCRIPT DE MIGRACIÓN AUTOMÁTICA A SUPABASE CLOUD
 * ================================================
 * 
 * Este script migra automáticamente:
 * 1. El esquema de la base de datos
 * 2. Los datos de prueba
 * 3. Los usuarios del sistema
 * 4. La configuración de la empresa
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración de Supabase Cloud
const SUPABASE_URL = 'https://iapixzikdhvghzsjkodu.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhcGl4emlrZGh2Z2h6c2prb2R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQ4ODcwNSwiZXhwIjoyMDcyMDY0NzA1fQ.Z2Z17gPI1rpJNqemEhjpGdsJ9kbzRmTaVgrB-lGufmA';

// Crear cliente de Supabase con permisos de administrador
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function migrateToCloud() {
  console.log('🚀 INICIANDO MIGRACIÓN A SUPABASE CLOUD...\n');

  try {
    // 1. Leer el script de migración
    const migrationScript = fs.readFileSync(path.join(__dirname, 'supabase', 'migrate-to-cloud.sql'), 'utf8');
    
    console.log('📄 Script de migración cargado correctamente');
    console.log(`📊 Tamaño del script: ${(migrationScript.length / 1024).toFixed(2)} KB\n`);

    // 2. Ejecutar el script de migración
    console.log('🔄 Ejecutando migración de datos...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationScript
    });

    if (error) {
      console.error('❌ Error durante la migración:', error);
      return;
    }

    console.log('✅ Migración ejecutada correctamente');
    console.log('📊 Resultados:', data);

    // 3. Verificar datos migrados
    console.log('\n🔍 VERIFICANDO DATOS MIGRADOS...\n');

    const tables = ['categorias', 'proveedores', 'productos', 'lotes', 'profiles', 'empresa_config'];
    
    for (const table of tables) {
      const { data: tableData, error: tableError } = await supabase
        .from(table)
        .select('*', { count: 'exact' });

      if (tableError) {
        console.log(`❌ ${table}: Error - ${tableError.message}`);
      } else {
        console.log(`✅ ${table}: ${tableData.length} registros`);
      }
    }

    // 4. Verificar usuarios del sistema
    console.log('\n👥 USUARIOS DEL SISTEMA:');
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('email, nombre, apellido, rol')
      .order('rol', { ascending: false });

    if (!usersError && users) {
      users.forEach(user => {
        console.log(`  - ${user.nombre} ${user.apellido} (${user.email}) - Rol: ${user.rol}`);
      });
    }

    console.log('\n🎉 ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!');
    console.log('🌐 Tu aplicación está lista para usar Supabase Cloud');
    console.log('🔗 URL del proyecto: https://supabase.com/dashboard/project/iapixzikdhvghzsjkodu');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

// Ejecutar migración
if (require.main === module) {
  migrateToCloud();
}

module.exports = { migrateToCloud };
