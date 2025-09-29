'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { localDB } from '@/lib/local-database'
import { localLogin, localLogout, getCurrentUser, saveSession, hasActiveSession, LocalUser } from '@/lib/auth/local-auth'

export interface Profile {
  id: string;
  email: string;
  nombre: string;
  apellido?: string;
  rol: 'super_admin' | 'administrador' | 'vendedor' | 'inventario' | 'contable' | 'cliente';
  telefono: string;
  direccion: string;
  empresa: string;
  email_verificado: boolean;
  created_at: string;
  updated_at: string;
}

export function useAuth() {
  const [user, setUser] = useState<LocalUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Inicializar autenticación
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true)
        
        // Verificar si hay datos en localStorage
        const savedUser = getCurrentUser()
        if (savedUser) {
          setUser(savedUser)
          setProfile(savedUser)
          setLoading(false)
          return
        }
        
        // Verificar sesión activa en Supabase local
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          setLoading(false)
          return
        }
        
        if (session?.user) {
          // Obtener perfil del usuario desde la base de datos local
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (profileError) {
            setLoading(false)
            return
          }
          
          if (profile) {
            const userData: LocalUser = {
              id: profile.id,
              email: profile.email,
              password: '',
              nombre: profile.nombre,
              apellido: profile.apellido || '',
              rol: profile.rol as LocalUser['rol'],
              telefono: profile.telefono || '',
              direccion: profile.direccion || '',
              empresa: profile.empresa || '',
              email_verificado: profile.email_verificado || false,
              foto_url: profile.foto_url || undefined,
              created_at: profile.created_at,
              updated_at: profile.updated_at
            }
            
            setUser(userData)
            setProfile(userData)
            
            // Guardar en localStorage para persistencia
            saveSession(userData)
          }
        }
        
      } catch (error) {
        // Error silencioso
      } finally {
        setLoading(false)
      }
    }

    initAuth()
    
    // Escuchar cambios en la sesión de Supabase local
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Obtener perfil del usuario desde la base de datos local
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profileError) {
          return
        }
        
        if (profile) {
          const userData: LocalUser = {
            id: profile.id,
            email: profile.email,
            password: '',
            nombre: profile.nombre,
            apellido: profile.apellido || '',
            rol: profile.rol as LocalUser['rol'],
            telefono: profile.telefono || '',
            direccion: profile.direccion || '',
            empresa: profile.empresa || '',
            email_verificado: profile.email_verificado || false,
            foto_url: profile.foto_url || undefined,
            created_at: profile.created_at,
            updated_at: profile.updated_at
          }
          
          setUser(userData)
          setProfile(userData)
          saveSession(userData)
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
        localLogout()
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Actualizar usuario cuando se refresca el token
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profileError) {
          return
        }
        
        if (profile) {
          const userData: LocalUser = {
            id: profile.id,
            email: profile.email,
            password: '',
            nombre: profile.nombre,
            apellido: profile.apellido || '',
            rol: profile.rol as LocalUser['rol'],
            telefono: profile.telefono || '',
            direccion: profile.direccion || '',
            empresa: profile.empresa || '',
            email_verificado: profile.email_verificado || false,
            foto_url: profile.foto_url || undefined,
            created_at: profile.created_at,
            updated_at: profile.updated_at
          }
          
          setUser(userData)
          setProfile(userData)
          saveSession(userData)
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      // Intentar autenticación con Supabase local
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        throw error
      }
      
      if (data.user) {
        // Obtener perfil del usuario desde la base de datos local
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        if (profileError) {
          throw profileError
        }
        
        if (profile) {
          const userData: LocalUser = {
            id: profile.id,
            email: profile.email,
            password: '',
            nombre: profile.nombre,
            apellido: profile.apellido || '',
            rol: profile.rol as LocalUser['rol'],
            telefono: profile.telefono || '',
            direccion: profile.direccion || '',
            empresa: profile.empresa || '',
            email_verificado: profile.email_verificado || false,
            foto_url: profile.foto_url || undefined,
            created_at: profile.created_at,
            updated_at: profile.updated_at
          }
          
          setUser(userData)
          setProfile(userData)
          saveSession(userData)
          return { success: true }
        }
      }
      
      return { success: false, error: 'No se pudo obtener el perfil del usuario' }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error de autenticación' }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      
      // Cerrar sesión en Supabase local
      await supabase.auth.signOut()
      
      // Limpiar estado local
      setUser(null)
      setProfile(null)
      localLogout()
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error al cerrar sesión' }
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) {
        throw new Error('No hay usuario autenticado')
      }
      
      // Actualizar perfil en Supabase local
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
      
      if (error) {
        throw error
      }
      
      // Actualizar estado local
      const updatedProfile = { ...profile, ...updates } as Profile
      const updatedUser = { ...user, ...updates } as LocalUser
      
      setProfile(updatedProfile)
      setUser(updatedUser)
      saveSession(updatedUser)
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error al actualizar perfil' }
    }
  }

  return {
    user,
    profile,
    loading,
    signIn,
    signOut,
    updateProfile
  }
}


