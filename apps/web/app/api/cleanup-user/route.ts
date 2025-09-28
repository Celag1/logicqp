import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    // Crear cliente de Supabase con service role key para operaciones admin
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    )

    // Buscar usuario por email
    const { data: users, error: searchError } = await supabase.auth.admin.listUsers()
    
    if (searchError) {
      console.error('Error buscando usuarios:', searchError)
      return NextResponse.json({ error: 'Error buscando usuarios' }, { status: 500 })
    }

    const user = users.users.find(u => u.email === email)
    
    if (user) {
      // Eliminar usuario de auth.users
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
      
      if (deleteError) {
        console.error('Error eliminando usuario:', deleteError)
        return NextResponse.json({ error: 'Error eliminando usuario' }, { status: 500 })
      }

      // Eliminar perfil de la tabla profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('email', email)

      if (profileError) {
        console.error('Error eliminando perfil:', profileError)
        // No retornamos error aquí porque el usuario ya fue eliminado de auth
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Usuario eliminado completamente' 
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Usuario no encontrado' 
    })

  } catch (error) {
    console.error('Error en cleanup-user:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
