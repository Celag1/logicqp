import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

export interface SecurityConfig {
  maxLoginAttempts: number;
  sessionTimeout: number;
  passwordMinLength: number;
  requireMFA: boolean;
  auditLogs: boolean;
}

export interface AuditLog {
  id?: number;
  usuario_id?: string;
  accion: string;
  tabla_afectada?: string;
  registro_id?: string;
  datos_anteriores?: string;
  datos_nuevos?: string;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

export interface LoginAttempt {
  id?: number;
  email: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  error_message?: string;
  created_at?: string;
}

// Función para obtener configuración de seguridad
export async function getSecurityConfig(): Promise<SecurityConfig> {
  try {
    const { data, error } = await supabase
      .from('configuracion')
      .select('clave, valor')
      .in('clave', ['max_login_attempts', 'session_timeout', 'password_min_length', 'require_mfa', 'audit_logs']);

    if (error || !data) {
      throw new Error('No se pudo obtener configuración de seguridad');
    }

    const config: any = {};
    data.forEach(item => {
      config[item.clave] = item.valor;
    });

    return {
      maxLoginAttempts: parseInt(config.max_login_attempts) || 5,
      sessionTimeout: parseInt(config.session_timeout) || 3600,
      passwordMinLength: parseInt(config.password_min_length) || 8,
      requireMFA: config.require_mfa === 'true',
      auditLogs: config.audit_logs === 'true'
    };
  } catch (error) {
    console.error('❌ Error obteniendo configuración de seguridad:', error);
    return {
      maxLoginAttempts: 5,
      sessionTimeout: 3600,
      passwordMinLength: 8,
      requireMFA: true,
      auditLogs: true
    };
  }
}

// Función para validar fortaleza de contraseña
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const config = { minLength: 8 };

  if (password.length < config.minLength) {
    errors.push(`La contraseña debe tener al menos ${config.minLength} caracteres`);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra mayúscula');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra minúscula');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('La contraseña debe contener al menos un carácter especial');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Función para registrar intento de login
export async function logLoginAttempt(
  email: string,
  ipAddress: string,
  userAgent: string,
  success: boolean,
  errorMessage?: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('login_attempts')
      .insert([{
        email,
        ip_address: ipAddress,
        user_agent: userAgent,
        success,
        error_message: errorMessage
      }]);

    if (error) {
      console.error('❌ Error registrando intento de login:', error);
    }
  } catch (error) {
    console.error('❌ Error en logLoginAttempt:', error);
  }
}

// Función para verificar si un email está bloqueado por intentos fallidos
export async function isEmailBlocked(email: string): Promise<boolean> {
  try {
    const config = await getSecurityConfig();
    const cutoffTime = new Date(Date.now() - 15 * 60 * 1000); // Últimos 15 minutos

    const { data, error } = await supabase
      .from('login_attempts')
      .select('id')
      .eq('email', email)
      .eq('success', false)
      .gte('created_at', cutoffTime.toISOString());

    if (error) {
      console.error('❌ Error verificando bloqueo de email:', error);
      return false;
    }

    return data && data.length >= config.maxLoginAttempts;
  } catch (error) {
    console.error('❌ Error en isEmailBlocked:', error);
    return false;
  }
}

// Función para registrar log de auditoría
export async function logAuditEvent(auditData: AuditLog): Promise<void> {
  try {
    const config = await getSecurityConfig();
    
    if (!config.auditLogs) {
      return; // No registrar si está deshabilitado
    }

    const { error } = await supabase
      .from('audit_logs')
      .insert([{
        ...auditData,
        created_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('❌ Error registrando log de auditoría:', error);
    }
  } catch (error) {
    console.error('❌ Error en logAuditEvent:', error);
  }
}

// Función para obtener logs de auditoría
export async function getAuditLogs(
  userId?: string,
  limit: number = 100,
  offset: number = 0
): Promise<{ logs?: AuditLog[]; error?: string }> {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (userId) {
      query = query.eq('usuario_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error obteniendo logs de auditoría:', error);
      return { error: error.message };
    }

    return { logs: data as AuditLog[] };
  } catch (error) {
    console.error('❌ Error en getAuditLogs:', error);
    return { error: 'Error interno del servidor' };
  }
}

// Función para verificar permisos de usuario
export function hasPermission(
  userRole: string,
  resource: string,
  action: string
): boolean {
  const permissions: Record<string, Record<string, string[]>> = {
    super_admin: {
      users: ['create', 'read', 'update', 'delete'],
      products: ['create', 'read', 'update', 'delete'],
      sales: ['create', 'read', 'update', 'delete'],
      inventory: ['create', 'read', 'update', 'delete'],
      reports: ['create', 'read', 'update', 'delete'],
      settings: ['create', 'read', 'update', 'delete'],
      empresa: ['create', 'read', 'update', 'delete']
    },
    administrador: {
      users: ['create', 'read', 'update', 'delete'],
      products: ['create', 'read', 'update', 'delete'],
      sales: ['create', 'read', 'update', 'delete'],
      inventory: ['create', 'read', 'update', 'delete'],
      reports: ['create', 'read', 'update', 'delete'],
      settings: ['create', 'read', 'update', 'delete'],
      empresa: ['read'] // Solo lectura para empresa
    },
    vendedor: {
      users: ['read'],
      products: ['read'],
      sales: ['create', 'read', 'update'],
      inventory: ['read'],
      reports: ['read'],
      settings: ['read'],
      empresa: ['read']
    },
    contador: {
      users: ['read'],
      products: ['read'],
      sales: ['read', 'update'],
      inventory: ['read'],
      reports: ['create', 'read', 'update'],
      settings: ['read'],
      empresa: ['read']
    },
    inventario: {
      users: ['read'],
      products: ['create', 'read', 'update'],
      sales: ['read'],
      inventory: ['create', 'read', 'update'],
      reports: ['read'],
      settings: ['read'],
      empresa: ['read']
    },
    cliente: {
      users: ['read'],
      products: ['read'],
      sales: ['read'],
      inventory: ['read'],
      reports: ['read'],
      settings: ['read'],
      empresa: ['read']
    }
  };

  const rolePermissions = permissions[userRole];
  if (!rolePermissions) {
    return false;
  }

  const resourcePermissions = rolePermissions[resource];
  if (!resourcePermissions) {
    return false;
  }

  return resourcePermissions.includes(action);
}

// Función para generar token de sesión seguro
export function generateSecureToken(userId: string, role: string): string {
  const payload = {
    userId,
    role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hora
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'logicqp-secret-key-2024');
}

// Función para verificar token de sesión
export function verifySecureToken(token: string): { userId: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'logicqp-secret-key-2024') as any;
    return {
      userId: decoded.userId,
      role: decoded.role
    };
  } catch (error) {
    console.error('❌ Error verificando token:', error);
    return null;
  }
}

// Función para sanitizar datos de entrada
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remover tags HTML
    .replace(/['"]/g, '') // Remover comillas
    .replace(/[;]/g, '') // Remover punto y coma
    .substring(0, 1000); // Limitar longitud
}

// Función para validar email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Función para validar teléfono ecuatoriano
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^(\+593|593)?[0-9]{9}$/;
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  return phoneRegex.test(cleanPhone);
}

// Función para encriptar datos sensibles
export async function encryptSensitiveData(data: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(data, saltRounds);
}

// Función para verificar datos encriptados
export async function verifyEncryptedData(data: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(data, hash);
}

// Función para generar código de verificación
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Función para limpiar datos de sesión expiradas
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    const { error } = await supabase
      .from('mfa_sessions')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) {
      console.error('❌ Error limpiando sesiones expiradas:', error);
    }
  } catch (error) {
    console.error('❌ Error en cleanupExpiredSessions:', error);
  }
}

// Función para obtener estadísticas de seguridad
export async function getSecurityStats(): Promise<{
  totalLogins: number;
  failedLogins: number;
  blockedEmails: number;
  auditEvents: number;
}> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [loginsResult, failedLoginsResult, auditResult] = await Promise.all([
      supabase
        .from('login_attempts')
        .select('id', { count: 'exact' })
        .eq('success', true)
        .gte('created_at', today.toISOString()),
      
      supabase
        .from('login_attempts')
        .select('id', { count: 'exact' })
        .eq('success', false)
        .gte('created_at', today.toISOString()),
      
      supabase
        .from('audit_logs')
        .select('id', { count: 'exact' })
        .gte('created_at', today.toISOString())
    ]);

    const config = await getSecurityConfig();
    const cutoffTime = new Date(Date.now() - 15 * 60 * 1000);

    const { data: blockedEmails } = await supabase
      .from('login_attempts')
      .select('email')
      .eq('success', false)
      .gte('created_at', cutoffTime.toISOString());

    const uniqueBlockedEmails = new Set(blockedEmails?.map(item => item.email) || []);

    return {
      totalLogins: loginsResult.count || 0,
      failedLogins: failedLoginsResult.count || 0,
      blockedEmails: uniqueBlockedEmails.size,
      auditEvents: auditResult.count || 0
    };
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de seguridad:', error);
    return {
      totalLogins: 0,
      failedLogins: 0,
      blockedEmails: 0,
      auditEvents: 0
    };
  }
}
