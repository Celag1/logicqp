import { supabase } from '@/lib/supabase/client'

export interface LocalUser {
  id: string;
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  rol: 'super_admin' | 'administrador' | 'vendedor' | 'inventario' | 'contable' | 'cliente';
  telefono: string;
  direccion: string;
  empresa: string;
  email_verificado: boolean;
  foto_url?: string;
  created_at: string;
  updated_at: string;
}

export interface LocalSession {
  user: LocalUser;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export async function localLogin(email: string, password: string): Promise<{ user: LocalUser | null; error: string | null }> {
  try {
    // Autenticar con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return { user: null, error: authError.message };
    }

    if (!authData.user) {
      return { user: null, error: 'No se pudo obtener datos del usuario' };
    }

    // Obtener perfil del usuario desde la tabla profiles
    let profile = null;
    let profileError = null;

    try {
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      profileError = profileErr;
      profile = profileData;
    } catch (error) {
      profileError = error;
    }

    if (profileError || !profile) {
      // Si hay error o no se encuentra el perfil, crear uno básico
      if (profileError instanceof Error && profileError.message.includes('Timeout')) {
        profile = {
          id: authData.user.id,
          email: authData.user.email || email,
          nombre: authData.user.user_metadata?.nombre || email.split('@')[0],
          apellido: authData.user.user_metadata?.apellido || '',
          rol: 'cliente',
          telefono: authData.user.user_metadata?.telefono || '',
          direccion: authData.user.user_metadata?.direccion || '',
          empresa: authData.user.user_metadata?.empresa || '',
          email_verificado: authData.user.email_confirmed_at ? true : false,
          foto_url: authData.user.user_metadata?.foto_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      } else {
        return { user: null, error: 'No se pudo obtener el perfil del usuario' };
      }
    }

    // Crear objeto de usuario local
    const user: LocalUser = {
      id: profile.id,
      email: profile.email,
      password: '', // No guardar la contraseña
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
    };

    // Guardar sesión en localStorage
    await saveSession(user);

    return { user, error: null };
  } catch (error) {
    return { user: null, error: error instanceof Error ? error.message : 'Error de autenticación' };
  }
}

export async function localLogout(): Promise<void> {
  try {
    // Cerrar sesión en Supabase
    await supabase.auth.signOut();

    // Limpiar localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('local_user');
      localStorage.removeItem('local_session');
    }
  } catch (error) {
    // Error silencioso
  }
}

export function getCurrentUser(): LocalUser | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }

    const userData = localStorage.getItem('local_user');
    if (!userData) {
      return null;
    }

    const user = JSON.parse(userData);
    return user;
  } catch (error) {
    return null;
  }
}

export function hasActiveSession(): boolean {
  const user = getCurrentUser();
  return !!user;
}

export async function saveSession(user: LocalUser): Promise<void> {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    const session: LocalSession = {
      user,
      access_token: '', // No guardar tokens por seguridad
      refresh_token: '',
      expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
    };

    localStorage.setItem('local_user', JSON.stringify(user));
    localStorage.setItem('local_session', JSON.stringify(session));
  } catch (error) {
    // Error silencioso
  }
}
