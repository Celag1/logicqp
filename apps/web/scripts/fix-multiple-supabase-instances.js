const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMjE0NTksImV4cCI6MjA3NDY5NzQ1OX0.uFSAyQV5eZ9fr2ZbWBERE0o1zWASAOIm1VqDAbeAEAQ';

console.log('🔧 Verificando configuración de Supabase...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey ? '✅ Configurada' : '❌ NO configurada');

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
});

async function testConnection() {
  try {
    console.log('\n🔍 Probando conexión a Supabase...');
    
    // Probar conexión básica
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Error de conexión:', error);
      return false;
    }
    
    console.log('✅ Conexión exitosa a Supabase');
    
    // Verificar usuarios existentes
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, rol, nombre')
      .limit(10);
    
    if (profilesError) {
      console.error('❌ Error obteniendo perfiles:', profilesError);
      return false;
    }
    
    console.log('\n👥 Usuarios encontrados:');
    profiles.forEach(profile => {
      console.log(`  - ${profile.email} (${profile.rol}) - ${profile.nombre}`);
    });
    
    // Verificar super admin
    const superAdmin = profiles.find(p => p.rol === 'super_admin');
    if (superAdmin) {
      console.log(`\n✅ Super admin encontrado: ${superAdmin.email}`);
    } else {
      console.log('\n⚠️  No se encontró super admin');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando verificación de Supabase...\n');
  
  const success = await testConnection();
  
  if (success) {
    console.log('\n✅ Verificación completada exitosamente');
  } else {
    console.log('\n❌ Verificación falló');
  }
}

main().catch(console.error);
