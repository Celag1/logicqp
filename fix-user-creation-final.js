const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'http://localhost:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

async function fixUserCreation() {
  console.log('🔧 Solucionando error de creación de usuarios...\n');
  
  const sql = `
    -- Eliminar trigger y función existentes
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    DROP FUNCTION IF EXISTS public.asignar_rol_cliente();
    
    -- Crear función simplificada
    CREATE OR REPLACE FUNCTION public.asignar_rol_cliente()
    RETURNS TRIGGER AS $$
    BEGIN
        INSERT INTO public.profiles (id, email, nombre, rol, created_at, updated_at)
        VALUES (NEW.id, NEW.email, 'Usuario', 'cliente', NOW(), NOW());
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    
    -- Crear trigger
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.asignar_rol_cliente();
  `;
  
  // Aplicar fix
  const { error: fixError } = await supabase
    .rpc('exec_sql', { sql });
  
  if (fixError) {
    console.log('❌ Error aplicando fix:', fixError.message);
    return;
  }
  
  console.log('✅ Fix aplicado exitosamente');
  
  // Probar creación de usuario
  console.log('\n🧪 Probando creación de usuario...');
  
  const { data, error: signupError } = await supabase.auth.signUp({
    email: 'test@example.com',
    password: 'test123456'
  });
  
  if (signupError) {
    console.log('❌ Error creando usuario:', signupError.message);
  } else {
    console.log('✅ Usuario creado exitosamente:', data.user?.email);
    
    // Verificar perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user?.id)
      .single();
    
    if (profileError) {
      console.log('❌ Error obteniendo perfil:', profileError.message);
    } else {
      console.log('✅ Perfil creado correctamente:', profile);
    }
  }
}

fixUserCreation().catch(console.error);


