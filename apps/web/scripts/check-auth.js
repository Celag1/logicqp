const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMjE0NTksImV4cCI6MjA3NDY5NzQ1OX0.uFSAyQV5eZ9fr2ZbWBERE0o1zWASAOIm1VqDAbeAEAQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAuth() {
  console.log('🔍 Verificando configuración de autenticación...');

  try {
    // Intentar hacer login con las credenciales
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'celag3@gmail.com',
      password: 'Ibot1801538719'
    });

    if (error) {
      console.error('❌ Error de autenticación:', error.message);
      console.log('🔧 Código de error:', error.status);
      
      if (error.message.includes('Invalid login credentials')) {
        console.log('💡 El usuario no existe o la contraseña es incorrecta');
        console.log('📝 Necesitas crear el usuario manualmente en Supabase Dashboard');
      }
    } else {
      console.log('✅ Login exitoso!');
      console.log('👤 Usuario:', data.user.email);
      console.log('🆔 ID:', data.user.id);
    }

    // Verificar si existe el perfil
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'celag3@gmail.com');

    if (profileError) {
      console.error('❌ Error obteniendo perfiles:', profileError);
    } else {
      console.log('📋 Perfiles encontrados:', profiles.length);
      if (profiles.length > 0) {
        console.log('👤 Perfil:', profiles[0]);
      }
    }

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

checkAuth();
