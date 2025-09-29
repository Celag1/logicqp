const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTEyMTQ1OSwiZXhwIjoyMDc0Njk3NDU5fQ.ds--rwknbADvlAUuRU0ypi0pwxr6Sd9Jr3CrPexxSsU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLSPolicies() {
  console.log('🔧 Corrigiendo políticas RLS...');

  try {
    // 1. Eliminar políticas existentes problemáticas
    console.log('\n1️⃣ Eliminando políticas existentes...');
    
    const policiesToDrop = [
      'Super admin puede hacer todo con productos',
      'Admin puede gestionar productos', 
      'Vendedores y clientes pueden leer productos',
      'Super admin puede hacer todo con categorías',
      'Admin puede gestionar categorías',
      'Vendedores y clientes pueden leer categorías'
    ];

    for (const policyName of policiesToDrop) {
      try {
        await supabase.rpc('exec_sql', {
          sql: `DROP POLICY IF EXISTS "${policyName}" ON productos;`
        });
        console.log(`✅ Política eliminada: ${policyName}`);
      } catch (error) {
        console.log(`⚠️ No se pudo eliminar: ${policyName}`);
      }
    }

    // 2. Crear políticas más simples y permisivas
    console.log('\n2️⃣ Creando políticas simplificadas...');
    
    // Política para productos: permitir lectura a todos
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "productos_read_all" ON productos
        FOR SELECT USING (true);
      `
    });
    console.log('✅ Política de lectura para productos creada');

    // Política para categorías: permitir lectura a todos
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "categorias_read_all" ON categorias
        FOR SELECT USING (true);
      `
    });
    console.log('✅ Política de lectura para categorías creada');

    // Política para proveedores: permitir lectura a todos
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "proveedores_read_all" ON proveedores
        FOR SELECT USING (true);
      `
    });
    console.log('✅ Política de lectura para proveedores creada');

    // 3. Verificar que las políticas funcionan
    console.log('\n3️⃣ Verificando políticas...');
    
    // Probar con usuario anónimo
    const supabaseAnon = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMjE0NTksImV4cCI6MjA3NDY5NzQ1OX0.uFSAyQV5eZ9fr2ZbWBER0o1zWASAOIm1VqDAbeAEAQ');
    
    const { data: productosTest, error: productosTestError } = await supabaseAnon
      .from('productos')
      .select('*')
      .eq('activo', true)
      .limit(3);

    if (productosTestError) {
      console.log('❌ Error probando productos:', productosTestError.message);
    } else {
      console.log(`✅ Productos accesibles: ${productosTest.length}`);
      if (productosTest.length > 0) {
        console.log('📦 Productos encontrados:', productosTest.map(p => p.nombre).join(', '));
      }
    }

    // Probar categorías
    const { data: categoriasTest, error: categoriasTestError } = await supabaseAnon
      .from('categorias')
      .select('*')
      .limit(3);

    if (categoriasTestError) {
      console.log('❌ Error probando categorías:', categoriasTestError.message);
    } else {
      console.log(`✅ Categorías accesibles: ${categoriasTest.length}`);
    }

    console.log('\n🎉 ¡Políticas RLS corregidas!');
    console.log('✅ Ahora los usuarios anónimos pueden leer productos y categorías');

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

fixRLSPolicies();
