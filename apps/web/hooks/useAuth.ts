'use client'

import { useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { Profile, RolType } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (initialized) return;
    
    let isMounted = true;
    console.log('🔐 useAuth: Inicializando...')
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }: any) => {
      if (!isMounted) return;
      
      if (error) {
        console.error('❌ Error obteniendo sesión:', error)
      } else {
        console.log('📋 Sesión inicial:', session ? '✅ Activa' : '❌ No hay sesión')
      }
      
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        console.log('👤 Usuario encontrado:', session.user.email)
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
      setInitialized(true)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (!isMounted) return;
      
      console.log('🔄 Auth state change:', event, session?.user?.email)
      
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      isMounted = false;
      subscription.unsubscribe()
    }
  }, [initialized])

  const fetchProfile = async (userId: string) => {
    try {
      console.log('📥 Obteniendo perfil para usuario:', userId)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('❌ Error obteniendo perfil:', error)
        setProfile(null)
        return
      }
      
      if (data) {
        console.log('✅ Perfil obtenido:', data)
        setProfile(data)
      } else {
        console.log('⚠️ No se encontró perfil para el usuario:', userId)
        setProfile(null)
      }
    } catch (error) {
      console.error('❌ Error en fetchProfile:', error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Intentando login con:', email)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('❌ Error de login:', error)
        return { error }
      }

      if (data.user) {
        console.log('✅ Login exitoso para:', data.user.email)
      }

      return { error: null }
    } catch (error) {
      console.error('❌ Error inesperado en login:', error)
      return { 
        error: { 
          message: 'Error inesperado en el servidor' 
        } 
      }
    }
  }

  const signUp = async (email: string, password: string, nombre: string, apellido?: string, telefono?: string, empresa?: string, direccion?: string) => {
    try {
      console.log('👤 Registro: Creando usuario en Supabase Auth...')
      
      // Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre,
          },
        },
      })

      if (authError) {
        console.error('❌ Error creando usuario en Auth:', authError)
        return { error: authError }
      }

      if (authData.user) {
        console.log('✅ Usuario creado en Auth:', authData.user.id)
        
        // Crear perfil en la tabla profiles
        console.log('📝 Creando perfil en base de datos...')
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: email,
            nombre: nombre,
            apellido: apellido || null,
            rol: 'cliente',
            telefono: telefono || null,
            empresa: empresa || null,
            direccion: direccion || null,
            email_verificado: false,
            telefono_verificado: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (profileError) {
          console.error('❌ Error creando perfil:', profileError)
          // Si falla la creación del perfil, eliminar el usuario de Auth
          await supabase.auth.admin.deleteUser(authData.user.id)
          return { error: profileError }
        }

        console.log('✅ Perfil creado exitosamente:', profileData)
        
        // Enviar email de confirmación
        console.log('📧 Enviando email de confirmación...')
        const emailResult = await sendConfirmationEmail(email, nombre)
        
        if (emailResult.success) {
          console.log('✅ Email de confirmación enviado exitosamente')
        } else {
          console.warn('⚠️ Error enviando email de confirmación:', emailResult.error)
        }
        
        return { error: null, data: { user: authData.user, profile: profileData } }
      }

      return { error: { message: 'No se pudo crear el usuario' } }
    } catch (error) {
      console.error('❌ Error inesperado en signUp:', error)
      return { error: { message: 'Error inesperado durante el registro' } }
    }
  }

  const signOut = async () => {
    console.log('🚪 Cerrando sesión...')
    
    try {
      // Limpiar estados inmediatamente para mejor UX
      setUser(null)
      setSession(null)
      setProfile(null)
      setLoading(false)
      
      // Limpiar localStorage
      localStorage.removeItem('user')
      localStorage.removeItem('profile')
      localStorage.removeItem('session')
      localStorage.removeItem('supabase.auth.token')
      
      // Intentar cerrar sesión en Supabase de forma segura
      try {
        const { error } = await supabase.auth.signOut()
        
        if (error) {
          console.warn('⚠️ Advertencia al cerrar sesión en Supabase:', error.message)
          // No es crítico si falla el signOut de Supabase
        } else {
          console.log('✅ Sesión cerrada exitosamente en Supabase')
        }
      } catch (supabaseError) {
        console.warn('⚠️ Error de Supabase al cerrar sesión (no crítico):', supabaseError)
        // Continuar con la limpieza local
      }
      
      console.log('✅ Estados locales limpiados, redirigiendo...')
      
      // Redirigir a login después de un breve delay
      setTimeout(() => {
        window.location.href = '/login'
      }, 100)
      
      return { error: null }
    } catch (error) {
      console.error('❌ Error inesperado cerrando sesión:', error)
      // Limpiar estados y redirigir de todas formas
      setUser(null)
      setSession(null)
      setProfile(null)
      setLoading(false)
      localStorage.clear()
      
      // Redirigir inmediatamente
      setTimeout(() => {
        window.location.href = '/login'
      }, 100)
      
      return { error: null }
    }
  }

  const updateProfile = async (profileData: Partial<Profile>) => {
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    try {
      console.log('💾 Actualizando perfil en Supabase...')
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('❌ Error actualizando perfil:', error)
        throw error
      }

      console.log('✅ Perfil actualizado exitosamente:', data)
      setProfile(data)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Error en updateProfile:', error)
      return { data: null, error }
    }
  }

  const hasRole = (requiredRole: RolType) => {
    if (!profile) return false
    
    const roleHierarchy: Record<RolType, number> = {
      'cliente': 1,
      'contable': 2,
      'inventario': 3,
      'vendedor': 4,
      'administrador': 5,
      'super_admin': 6,
    }

    return roleHierarchy[profile.rol] >= roleHierarchy[requiredRole]
  }

  const sendConfirmationEmail = async (email: string, userName: string) => {
    try {
      const response = await fetch('/api/auth/confirm-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, userName }),
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Email de confirmación enviado exitosamente')
        return { success: true, message: result.message }
      } else {
        console.error('❌ Error enviando email de confirmación:', result.error)
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('❌ Error en sendConfirmationEmail:', error)
      return { success: false, error: 'Error enviando email de confirmación' }
    }
  }

  return {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    hasRole,
    sendConfirmationEmail
  }
}
