'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { 
  loginUser, 
  registerUser, 
  setupMFA, 
  verifyMFA, 
  enableMFA, 
  getUserById, 
  updateUserProfile, 
  changeUserRole, 
  getAllUsers, 
  deleteUser,
  User,
  LoginResult,
  MFAConfig,
  MFAResult
} from '@/lib/auth/advanced-auth';
import { sendWelcomeEmail } from '@/lib/services/email-service';
import { sendWelcomeSMS } from '@/lib/services/sms-service';
import { logAuditEvent, hasPermission } from '@/lib/security/security-service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (userData: RegisterData) => Promise<{ user?: User; error?: string }>;
  logout: () => Promise<void>;
  setupMFA: () => Promise<MFAConfig | null>;
  verifyMFA: (token: string) => Promise<MFAResult>;
  enableMFA: () => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => Promise<{ user?: User; error?: string }>;
  changeUserRole: (userId: string, newRole: string) => Promise<{ success: boolean; error?: string }>;
  getAllUsers: () => Promise<{ users?: User[]; error?: string }>;
  deleteUser: (userId: string) => Promise<{ success: boolean; error?: string }>;
  hasPermission: (resource: string, action: string) => boolean;
  mfaToken: string | null;
  requiresMFA: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  apellido?: string;
  telefono?: string;
  direccion?: string;
  empresa?: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAdvancedAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAdvancedAuth debe ser usado dentro de AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [requiresMFA, setRequiresMFA] = useState(false);

  // Inicializar autenticación
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      console.log('🔐 Inicializando autenticación avanzada...');

      // Verificar si hay sesión activa en localStorage
      const savedUser = localStorage.getItem('logicqp_user');
      const savedToken = localStorage.getItem('logicqp_token');

      if (savedUser && savedToken) {
        try {
          const userData = JSON.parse(savedUser);
          const tokenData = JSON.parse(savedToken);

          // Verificar si el token no ha expirado
          if (tokenData.exp > Date.now() / 1000) {
            setUser(userData);
            console.log('✅ Usuario autenticado desde sesión guardada:', userData.nombre);
          } else {
            // Token expirado, limpiar sesión
            localStorage.removeItem('logicqp_user');
            localStorage.removeItem('logicqp_token');
            console.log('⚠️ Sesión expirada, limpiando datos');
          }
        } catch (error) {
          console.error('❌ Error parseando datos de sesión:', error);
          localStorage.removeItem('logicqp_user');
          localStorage.removeItem('logicqp_token');
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ Error inicializando autenticación:', error);
      setError('Error inicializando autenticación');
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔑 Iniciando login para:', email);

      const result = await loginUser(email, password);

      if (result.error) {
        setError(result.error);
        return result;
      }

      if (result.requiresMFA && result.mfaToken) {
        setRequiresMFA(true);
        setMfaToken(result.mfaToken);
        console.log('🔐 MFA requerido para:', email);
        return result;
      }

      if (result.user) {
        setUser(result.user);
        setRequiresMFA(false);
        setMfaToken(null);

        // Guardar sesión
        const token = {
          userId: result.user.id,
          role: result.user.rol,
          exp: Math.floor(Date.now() / 1000) + 3600 // 1 hora
        };

        localStorage.setItem('logicqp_user', JSON.stringify(result.user));
        localStorage.setItem('logicqp_token', JSON.stringify(token));

        // Registrar evento de auditoría
        await logAuditEvent({
          usuario_id: result.user.id,
          accion: 'LOGIN',
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent
        });

        console.log('✅ Login exitoso:', result.user.nombre);
      }

      setLoading(false);
      return result;
    } catch (error) {
      console.error('❌ Error en login:', error);
      setError('Error interno del servidor');
      setLoading(false);
      return { error: 'Error interno del servidor' };
    }
  };

  const register = async (userData: RegisterData): Promise<{ user?: User; error?: string }> => {
    try {
      setLoading(true);
      setError(null);
      console.log('📝 Registrando nuevo usuario:', userData.email);

      const result = await registerUser(userData);

      if (result.error) {
        setError(result.error);
        return result;
      }

      if (result.user) {
        // Enviar email de bienvenida
        await sendWelcomeEmail(result.user.email, result.user.nombre, userData.password);

        // Enviar SMS de bienvenida si tiene teléfono
        if (result.user.telefono) {
          await sendWelcomeSMS(result.user.telefono, result.user.nombre);
        }

        // Registrar evento de auditoría
        await logAuditEvent({
          usuario_id: result.user.id,
          accion: 'REGISTER',
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent
        });

        console.log('✅ Usuario registrado exitosamente:', result.user.nombre);
      }

      setLoading(false);
      return result;
    } catch (error) {
      console.error('❌ Error en registro:', error);
      setError('Error interno del servidor');
      setLoading(false);
      return { error: 'Error interno del servidor' };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('🚪 Cerrando sesión...');

      if (user) {
        // Registrar evento de auditoría
        await logAuditEvent({
          usuario_id: user.id,
          accion: 'LOGOUT',
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent
        });
      }

      // Limpiar estado
      setUser(null);
      setRequiresMFA(false);
      setMfaToken(null);
      setError(null);

      // Limpiar localStorage
      localStorage.removeItem('logicqp_user');
      localStorage.removeItem('logicqp_token');

      console.log('✅ Sesión cerrada exitosamente');
    } catch (error) {
      console.error('❌ Error en logout:', error);
      // Aún así, limpiar el estado local
      setUser(null);
      setRequiresMFA(false);
      setMfaToken(null);
      localStorage.removeItem('logicqp_user');
      localStorage.removeItem('logicqp_token');
    }
  };

  const setupMFA = async (): Promise<MFAConfig | null> => {
    try {
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }

      console.log('🔐 Configurando MFA para:', user.email);
      const result = await setupMFA();

      if (result) {
        console.log('✅ MFA configurado exitosamente');
      }

      return result;
    } catch (error) {
      console.error('❌ Error configurando MFA:', error);
      return null;
    }
  };

  const verifyMFA = async (token: string): Promise<MFAResult> => {
    try {
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }

      console.log('🔐 Verificando código MFA...');
      const result = await verifyMFA(token);

      if (result.success && result.user) {
        setUser(result.user);
        setRequiresMFA(false);
        setMfaToken(null);

        // Guardar sesión
        const sessionToken = {
          userId: result.user.id,
          role: result.user.rol,
          exp: Math.floor(Date.now() / 1000) + 3600
        };

        localStorage.setItem('logicqp_user', JSON.stringify(result.user));
        localStorage.setItem('logicqp_token', JSON.stringify(sessionToken));

        // Registrar evento de auditoría
        await logAuditEvent({
          usuario_id: result.user.id,
          accion: 'MFA_VERIFIED',
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent
        });

        console.log('✅ MFA verificado exitosamente');
      }

      return result;
    } catch (error) {
      console.error('❌ Error verificando MFA:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  };

  const enableMFA = async (): Promise<boolean> => {
    try {
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }

      console.log('🔐 Habilitando MFA para:', user.email);
      const result = await enableMFA();

      if (result) {
        // Actualizar usuario local
        const updatedUser = { ...user, mfa_enabled: true };
        setUser(updatedUser);
        localStorage.setItem('logicqp_user', JSON.stringify(updatedUser));

        // Registrar evento de auditoría
        await logAuditEvent({
          usuario_id: user.id,
          accion: 'MFA_ENABLED',
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent
        });

        console.log('✅ MFA habilitado exitosamente');
      }

      return result;
    } catch (error) {
      console.error('❌ Error habilitando MFA:', error);
      return false;
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<{ user?: User; error?: string }> => {
    try {
      if (!user) {
        return { error: 'No hay usuario autenticado' };
      }

      console.log('📝 Actualizando perfil de:', user.email);
      const result = await updateUserProfile(user.id, updates);

      if (result.user) {
        setUser(result.user);
        localStorage.setItem('logicqp_user', JSON.stringify(result.user));

        // Registrar evento de auditoría
        await logAuditEvent({
          usuario_id: user.id,
          accion: 'PROFILE_UPDATE',
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent
        });

        console.log('✅ Perfil actualizado exitosamente');
      }

      return result;
    } catch (error) {
      console.error('❌ Error actualizando perfil:', error);
      return { error: 'Error interno del servidor' };
    }
  };

  const changeUserRole = async (userId: string, newRole: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'No hay usuario autenticado' };
      }

      console.log('👤 Cambiando rol de usuario:', userId, 'a', newRole);
      const result = await changeUserRole(userId, newRole);

      if (result.success) {
        // Registrar evento de auditoría
        await logAuditEvent({
          usuario_id: user.id,
          accion: 'ROLE_CHANGE',
          tabla_afectada: 'profiles',
          registro_id: userId,
          datos_nuevos: JSON.stringify({ rol: newRole }),
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent
        });

        console.log('✅ Rol cambiado exitosamente');
      }

      return result;
    } catch (error) {
      console.error('❌ Error cambiando rol:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  };

  const getAllUsers = async (): Promise<{ users?: User[]; error?: string }> => {
    try {
      if (!user) {
        return { error: 'No hay usuario autenticado' };
      }

      console.log('👥 Obteniendo lista de usuarios...');
      const result = await getAllUsers();

      if (result.users) {
        console.log('✅ Usuarios obtenidos exitosamente');
      }

      return result;
    } catch (error) {
      console.error('❌ Error obteniendo usuarios:', error);
      return { error: 'Error interno del servidor' };
    }
  };

  const deleteUser = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'No hay usuario autenticado' };
      }

      console.log('🗑️ Eliminando usuario:', userId);
      const result = await deleteUser(userId);

      if (result.success) {
        // Registrar evento de auditoría
        await logAuditEvent({
          usuario_id: user.id,
          accion: 'USER_DELETE',
          tabla_afectada: 'profiles',
          registro_id: userId,
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent
        });

        console.log('✅ Usuario eliminado exitosamente');
      }

      return result;
    } catch (error) {
      console.error('❌ Error eliminando usuario:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  };

  const checkPermission = (resource: string, action: string): boolean => {
    if (!user) return false;
    return hasPermission(user.rol, resource, action);
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    setupMFA,
    verifyMFA,
    enableMFA,
    updateProfile,
    changeUserRole,
    getAllUsers,
    deleteUser,
    hasPermission: checkPermission,
    mfaToken,
    requiresMFA
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
