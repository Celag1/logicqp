const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMjE0NTksImV4cCI6MjA3NDY5NzQ1OX0.uFSAyQV5eZ9fr2ZbWBERE0o1zWASAOIm1VqDAbeAEAQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRelatedTables() {
  console.log('🔍 Verificando tablas relacionadas...');

  try {
    // 1. Verificar productos con consulta simple
    console.log('\n1️⃣ Consulta simple de productos...');
    const { data: productosSimple, error: productosSimpleError } = await supabase
      .from('productos')
      .select('*')
      .limit(5);

    if (productosSimpleError) {
      console.error('❌ Error consulta simple productos:', productosSimpleError);
    } else {
      console.log(`✅ Productos (consulta simple): ${productosSimple.length}`);
      console.log('📋 Productos:', productosSimple);
    }

    // 2. Verificar productos con relaciones (como en la app)
    console.log('\n2️⃣ Consulta con relaciones (como en la app)...');
    const { data: productosRel, error: productosRelError } = await supabase
      .from('productos')
      .select(`
        *,
        categorias(nombre),
        proveedores(nombre),
        lotes(
          id,
          cantidad_disponible,
          fecha_vencimiento
        )
      `)
      .limit(5);

    if (productosRelError) {
      console.error('❌ Error consulta con relaciones:', productosRelError);
    } else {
      console.log(`✅ Productos (con relaciones): ${productosRel.length}`);
      console.log('📋 Productos con relaciones:', productosRel);
    }

    // 3. Verificar si existen las tablas relacionadas
    console.log('\n3️⃣ Verificando tablas relacionadas...');
    
    const relatedTables = ['categorias', 'proveedores', 'lotes'];
    
    for (const table of relatedTables) {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        console.log(`❌ Tabla ${table}: NO EXISTE - ${error.message}`);
      } else {
        console.log(`✅ Tabla ${table}: EXISTE`);
      }
    }

    // 4. Verificar datos en proveedores
    console.log('\n4️⃣ Verificando proveedores...');
    const { data: proveedores, error: proveedoresError } = await supabase
      .from('proveedores')
      .select('*')
      .limit(5);

    if (proveedoresError) {
      console.log('❌ Error obteniendo proveedores:', proveedoresError.message);
    } else {
      console.log(`🏢 Proveedores encontrados: ${proveedores.length}`);
      if (proveedores.length > 0) {
        console.log('📋 Proveedores:', proveedores);
      } else {
        console.log('⚠️ No hay proveedores - esto puede causar el problema');
      }
    }

    // 5. Verificar datos en lotes
    console.log('\n5️⃣ Verificando lotes...');
    const { data: lotes, error: lotesError } = await supabase
      .from('lotes')
      .select('*')
      .limit(5);

    if (lotesError) {
      console.log('❌ Error obteniendo lotes:', lotesError.message);
    } else {
      console.log(`📦 Lotes encontrados: ${lotes.length}`);
      if (lotes.length > 0) {
        console.log('📋 Lotes:', lotes);
      } else {
        console.log('⚠️ No hay lotes - esto puede causar el problema');
      }
    }

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

checkRelatedTables();
