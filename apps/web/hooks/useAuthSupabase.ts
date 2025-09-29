import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-real';

export interface Profile {
  id: string;
  email: string;
  nombre: string;
  apellido?: string;
  rol: 'super_admin' | 'administrador' | 'vendedor' | 'cliente';
  telefono?: string;
  direccion?: string;
  empresa?: string;
  email_verificado?: boolean;
  telefono_verificado?: boolean;
  foto_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, profile: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
}

export function useAuthSupabase(): AuthContextType {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión inicial
    getCurrentSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const getCurrentSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error obteniendo sesión:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error cargando perfil:', error);
        return;
      }

      setUser(profile);
    } catch (error) {
      console.error('Error cargando perfil:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        await loadUserProfile(data.user.id);
        return { success: true };
      }

      return { success: false, error: 'Error desconocido' };
    } catch (error) {
      return { success: false, error: 'Error de conexión' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, profile: Partial<Profile>) => {
    try {
      setLoading(true);
      
      // Crear usuario en auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (authData.user) {
        // Crear perfil
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: authData.user.id,
            email,
            nombre: profile.nombre || '',
            apellido: profile.apellido || '',
            rol: profile.rol || 'cliente',
            telefono: profile.telefono || '',
            direccion: profile.direccion || '',
            empresa: profile.empresa || '',
            email_verificado: false,
            telefono_verificado: false,
          }]);

        if (profileError) {
          return { success: false, error: profileError.message };
        }

        await loadUserProfile(authData.user.id);
        return { success: true };
      }

      return { success: false, error: 'Error creando usuario' };
    } catch (error) {
      return { success: false, error: 'Error de conexión' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { success: false, error: 'No hay usuario autenticado' };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Recargar perfil
      await loadUserProfile(user.id);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error actualizando perfil' };
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };
}

