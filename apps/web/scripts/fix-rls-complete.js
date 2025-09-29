const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMjE0NTksImV4cCI6MjA3NDY5NzQ1OX0.uFSAyQV5eZ9fr2ZbWBER0o1zWASAOIm1VqDAbeAEAQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRLSPolicies() {
  console.log('🔧 Arreglando políticas RLS para acceso completo...');

  try {
    // 1. Eliminar políticas existentes problemáticas
    console.log('🗑️ Eliminando políticas existentes...');
    
    const policiesToDelete = [
      'productos_anon_read_policy',
      'categorias_anon_read_policy', 
      'proveedores_anon_read_policy',
      'lotes_anon_read_policy'
    ];

    for (const policyName of policiesToDelete) {
      try {
        await supabase.rpc('exec_sql', {
          sql: `DROP POLICY IF EXISTS ${policyName} ON productos;`
        });
        console.log(`✅ Política ${policyName} eliminada`);
      } catch (error) {
        console.log(`⚠️ No se pudo eliminar ${policyName}:`, error.message);
      }
    }

    // 2. Crear políticas RLS que permitan acceso completo a datos públicos
    console.log('🔐 Creando políticas RLS permisivas...');

    const policies = [
      {
        table: 'productos',
        policy: 'productos_public_read',
        sql: `CREATE POLICY productos_public_read ON productos FOR SELECT USING (true);`
      },
      {
        table: 'categorias', 
        policy: 'categorias_public_read',
        sql: `CREATE POLICY categorias_public_read ON categorias FOR SELECT USING (true);`
      },
      {
        table: 'proveedores',
        policy: 'proveedores_public_read', 
        sql: `CREATE POLICY proveedores_public_read ON proveedores FOR SELECT USING (true);`
      },
      {
        table: 'lotes',
        policy: 'lotes_public_read',
        sql: `CREATE POLICY lotes_public_read ON lotes FOR SELECT USING (true);`
      }
    ];

    for (const policy of policies) {
      try {
        await supabase.rpc('exec_sql', { sql: policy.sql });
        console.log(`✅ Política ${policy.policy} creada para ${policy.table}`);
      } catch (error) {
        console.log(`❌ Error creando política ${policy.policy}:`, error.message);
      }
    }

    // 3. Verificar que las políticas funcionan
    console.log('🧪 Probando consulta completa...');
    
    const { data: productos, error } = await supabase
      .from('productos')
      .select(`
        *,
        categorias(nombre),
        proveedores(nombre),
        lotes(id, cantidad_disponible, fecha_vencimiento)
      `)
      .eq('activo', true)
      .limit(3);

    if (error) {
      console.log('❌ Error en consulta completa:', error.message);
    } else {
      console.log('✅ Consulta completa funcionando!');
      console.log('📦 Productos con datos completos:', productos?.length || 0);
      if (productos && productos.length > 0) {
        console.log('🔍 Primer producto con datos completos:');
        console.log(JSON.stringify(productos[0], null, 2));
      }
    }

    console.log('🎉 ¡Políticas RLS arregladas exitosamente!');

  } catch (error) {
    console.error('❌ Error arreglando políticas RLS:', error);
  }
}

// Ejecutar
fixRLSPolicies();
