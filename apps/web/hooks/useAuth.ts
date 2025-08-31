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

  useEffect(() => {
    console.log('🔐 useAuth: Inicializando...')
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
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
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
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

    return () => subscription.unsubscribe()
  }, [])

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
        throw error
      }
      
      console.log('✅ Perfil obtenido:', data)
      setProfile(data)
    } catch (error) {
      console.error('❌ Error en fetchProfile:', error)
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

  const signUp = async (email: string, password: string, nombre: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
        },
      },
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
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

  return {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    hasRole
  }
}
