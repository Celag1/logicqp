import { useState, useEffect } from 'react';
import { localLogin, localLogout, getCurrentUser, saveSession, hasActiveSession, LocalUser } from '@/lib/auth/local-auth';

export interface Profile {
  id: string;
  email: string;
  nombre: string;
  apellido?: string;
  rol: 'administrador' | 'vendedor' | 'cliente';
  telefono: string;
  direccion: string;
  empresa: string;
  email_verificado: boolean;
  created_at: string;
}

// Función para convertir LocalUser a Profile
const convertLocalUserToProfile = (user: LocalUser): Profile => ({
  id: user.id,
  email: user.email,
  nombre: user.nombre,
  apellido: user.apellido,
  rol: user.rol as 'administrador' | 'vendedor' | 'cliente',
  telefono: user.telefono,
  direccion: user.direccion,
  empresa: user.empresa,
  email_verificado: user.email_verificado,
  created_at: user.created_at
});

export function useAuthLocal() {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Inicializar autenticación
  useEffect(() => {
    console.log('🔐 useAuthLocal: Inicializando...');
    
    const initAuth = async () => {
      try {
        setLoading(true);
        
        // Verificar si hay sesión activa
        if (hasActiveSession()) {
          const currentUser = getCurrentUser();
          if (currentUser) {
            console.log('✅ Usuario encontrado en sesión:', currentUser.nombre);
            setUser(currentUser);
            setProfile(convertLocalUserToProfile(currentUser));
          }
        }
        
      } catch (error) {
        console.error('❌ Error inicializando auth local:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Función de login
  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔑 Login: Intentando autenticación...');
      console.log('🔑 Intentando login con:', email);
      
      setLoading(true);
      
      const { user: loggedUser, error } = await localLogin(email, password);
      
      if (error) {
        console.error('❌ Login: Error de autenticación:', error);
        throw new Error(error);
      }
      
      if (loggedUser) {
        console.log('✅ Login exitoso:', loggedUser.nombre);
        
        // Guardar sesión
        saveSession(loggedUser);
        
        // Actualizar estado
        setUser(loggedUser);
        setProfile(convertLocalUserToProfile(loggedUser));
        
        return { user: loggedUser, error: null };
      }
      
      throw new Error('Error desconocido en el login');
      
    } catch (error) {
      console.error('❌ Login: Error de autenticación:', error);
      return { user: null, error: error instanceof Error ? error.message : 'Error desconocido' };
    } finally {
      setLoading(false);
    }
  };

  // Función de logout
  const signOut = async () => {
    try {
      console.log('🚪 Logout: Cerrando sesión...');
      
      // Limpiar sesión local
      localLogout();
      
      // Limpiar estado
      setUser(null);
      setProfile(null);
      
      console.log('✅ Logout exitoso');
      return { error: null };
      
    } catch (error) {
      console.error('❌ Error en logout:', error);
      return { error: error instanceof Error ? error.message : 'Error desconocido en logout' };
    }
  };

  // Función para actualizar perfil
  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user || !profile) return { error: 'No hay usuario autenticado' };
      
      const updatedUser = { ...user, ...updates };
      const updatedProfile = { ...profile, ...updates } as Profile;
      
      // Actualizar en localStorage
      saveSession(updatedUser);
      
      // Actualizar estado
      setUser(updatedUser);
      setProfile(updatedProfile);
      
      return { user: updatedUser, error: null };
      
    } catch (error) {
      console.error('❌ Error actualizando perfil:', error);
      return { user: null, error: 'Error actualizando perfil' };
    }
  };

  return {
    user,
    profile,
    loading,
    signIn,
    signOut,
    updateProfile
  };
}
