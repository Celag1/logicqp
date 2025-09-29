const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTEyMTQ1OSwiZXhwIjoyMDc0Njk3NDU5fQ.ds--rwknbADvlAUuRU0ypi0pwxr6Sd9Jr3CrPexxSsU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupSuperAdminComplete() {
  console.log('🚀 Configurando SUPER_ADMIN completo...');

  try {
    // 1. Verificar si el usuario ya existe en auth.users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Error obteniendo usuarios:', usersError);
      return;
    }

    let user = users.users.find(u => u.email === 'celag3@gmail.com');
    
    if (!user) {
      console.log('👤 Usuario no existe en auth.users, creando...');
      
      // Crear usuario en auth.users
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'celag3@gmail.com',
        password: 'Ibot1801538719',
        email_confirm: true,
        user_metadata: {
          nombre: 'Celso',
          apellido: 'Aguirre',
          rol: 'super_admin'
        }
      });

      if (authError) {
        console.error('❌ Error creando usuario en auth:', authError);
        console.log('💡 Necesitas crear el usuario manualmente en Supabase Dashboard');
        console.log('📧 Email: celag3@gmail.com');
        console.log('🔑 Password: Ibot1801538719');
        console.log('👑 Rol: super_admin');
        return;
      }

      user = authData.user;
      console.log('✅ Usuario creado en auth.users:', user.id);
    } else {
      console.log('✅ Usuario ya existe en auth.users:', user.id);
    }

    // 2. Verificar/crear perfil con rol SUPER_ADMIN
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'celag3@gmail.com')
      .single();

    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      console.error('❌ Error verificando perfil:', profileCheckError);
      return;
    }

    if (existingProfile) {
      // Actualizar perfil existente
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
          id: user.id,
          rol: 'super_admin',
          email_verificado: true,
          telefono_verificado: true,
          updated_at: new Date().toISOString()
        })
        .eq('email', 'celag3@gmail.com')
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error actualizando perfil:', updateError);
        return;
      }

      console.log('✅ Perfil actualizado con rol SUPER_ADMIN:', updatedProfile);
    } else {
      // Crear nuevo perfil
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: 'celag3@gmail.com',
          nombre: 'Celso',
          apellido: 'Aguirre',
          rol: 'super_admin',
          telefono: '+593 99 123 4567',
          direccion: 'Quito, Ecuador',
          empresa: 'LogicQP',
          email_verificado: true,
          telefono_verificado: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creando perfil:', createError);
        return;
      }

      console.log('✅ Perfil creado con rol SUPER_ADMIN:', newProfile);
    }

    // 3. Verificar que el login funciona
    console.log('🔍 Verificando login...');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'celag3@gmail.com',
      password: 'Ibot1801538719'
    });

    if (loginError) {
      console.error('❌ Error en login:', loginError);
      return;
    }

    console.log('✅ Login exitoso!');
    console.log('👤 Usuario:', loginData.user.email);
    console.log('🆔 ID:', loginData.user.id);

    // 4. Verificar perfil y rol
    const { data: finalProfile, error: finalProfileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', loginData.user.id)
      .single();

    if (finalProfileError) {
      console.error('❌ Error obteniendo perfil final:', finalProfileError);
      return;
    }

    console.log('🎉 CONFIGURACIÓN COMPLETA!');
    console.log('📧 Email: celag3@gmail.com');
    console.log('🔑 Password: Ibot1801538719');
    console.log('👑 Rol:', finalProfile.rol);
    console.log('✅ Usuario SUPER_ADMIN listo para usar!');

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

setupSuperAdminComplete();
