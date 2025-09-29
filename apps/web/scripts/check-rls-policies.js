const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTEyMTQ1OSwiZXhwIjoyMDc0Njk3NDU5fQ.ds--rwknbADvlAUuRU0ypi0pwxr6Sd9Jr3CrPexxSsU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRLSPolicies() {
  console.log('🔍 Verificando políticas RLS y datos...');

  try {
    // 1. Verificar datos con service key (bypass RLS)
    console.log('\n1️⃣ Verificando datos con service key (bypass RLS)...');
    
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('*')
      .limit(5);

    if (productosError) {
      console.log('❌ Error obteniendo productos:', productosError.message);
    } else {
      console.log(`✅ Productos encontrados: ${productos.length}`);
      if (productos.length > 0) {
        console.log('📦 Primer producto:', productos[0].nombre);
      }
    }

    // 2. Verificar categorías
    const { data: categorias, error: categoriasError } = await supabase
      .from('categorias')
      .select('*')
      .limit(5);

    if (categoriasError) {
      console.log('❌ Error obteniendo categorías:', categoriasError.message);
    } else {
      console.log(`✅ Categorías encontradas: ${categorias.length}`);
    }

    // 3. Verificar políticas RLS
    console.log('\n2️⃣ Verificando políticas RLS...');
    
    // Consultar políticas de la tabla productos
    const { data: policies, error: policiesError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          schemaname,
          tablename,
          policyname,
          permissive,
          roles,
          cmd,
          qual,
          with_check
        FROM pg_policies 
        WHERE tablename = 'productos'
        ORDER BY policyname;
      `
    });

    if (policiesError) {
      console.log('❌ Error obteniendo políticas:', policiesError.message);
    } else {
      console.log(`✅ Políticas encontradas para productos: ${policies.length}`);
      policies.forEach(policy => {
        console.log(`- ${policy.policyname}: ${policy.cmd} para roles ${policy.roles}`);
      });
    }

    // 4. Verificar si RLS está habilitado
    console.log('\n3️⃣ Verificando estado RLS...');
    
    const { data: rlsStatus, error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          schemaname,
          tablename,
          rowsecurity
        FROM pg_tables 
        WHERE tablename = 'productos'
        ORDER BY tablename;
      `
    });

    if (rlsError) {
      console.log('❌ Error verificando RLS:', rlsError.message);
    } else {
      console.log(`✅ Estado RLS para productos: ${rlsStatus[0]?.rowsecurity ? 'HABILITADO' : 'DESHABILITADO'}`);
    }

    // 5. Probar consulta como usuario anónimo (simulando la app)
    console.log('\n4️⃣ Probando consulta como usuario anónimo...');
    
    const supabaseAnon = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMjE0NTksImV4cCI6MjA3NDY5NzQ1OX0.uFSAyQV5eZ9fr2ZbWBER0o1zWASAOIm1VqDAbeAEAQ');
    
    const { data: productosAnon, error: productosAnonError } = await supabaseAnon
      .from('productos')
      .select('*')
      .eq('activo', true)
      .limit(5);

    if (productosAnonError) {
      console.log('❌ Error con usuario anónimo:', productosAnonError.message);
    } else {
      console.log(`✅ Productos con usuario anónimo: ${productosAnon.length}`);
    }

    // 6. Verificar usuarios en profiles
    console.log('\n5️⃣ Verificando usuarios en profiles...');
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, rol')
      .limit(10);

    if (profilesError) {
      console.log('❌ Error obteniendo profiles:', profilesError.message);
    } else {
      console.log(`✅ Usuarios en profiles: ${profiles.length}`);
      profiles.forEach(profile => {
        console.log(`- ${profile.email} (${profile.rol})`);
      });
    }

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

checkRLSPolicies();
