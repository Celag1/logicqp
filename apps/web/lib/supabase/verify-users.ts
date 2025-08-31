import { supabase } from './client'

export async function verifyUsersInDatabase() {
  try {
    // Verificar usuarios en la tabla profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('Error al obtener perfiles:', profilesError)
      return { success: false, error: profilesError }
    }

    console.log('Usuarios encontrados en la base de datos:')
    profiles?.forEach((profile: any) => {
      console.log(`- ${profile.email} (${profile.rol}) - Verificado: ${profile.email_verified}`)
    })

    // Verificar usuarios en auth.users de Supabase
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error('Error al obtener usuarios de auth:', authError)
      return { success: false, error: authError }
    }

    console.log('\nUsuarios en auth.users:')
    users?.forEach(user => {
      console.log(`- ${user.email} - Confirmado: ${user.email_confirmed_at ? 'Sí' : 'No'}`)
    })

    return { 
      success: true, 
      profiles: profiles || [], 
      authUsers: users || [] 
    }
  } catch (error) {
    console.error('Error general:', error)
    return { success: false, error }
  }
}

// Función para probar login con un usuario específico
export async function testUserLogin(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error(`Error de login para ${email}:`, error)
      return { success: false, error }
    }

    console.log(`Login exitoso para ${email}:`, data.user?.id)
    
    // Cerrar sesión después de la prueba
    await supabase.auth.signOut()
    
    return { success: true, user: data.user }
  } catch (error) {
    console.error(`Error inesperado para ${email}:`, error)
    return { success: false, error }
  }
}
