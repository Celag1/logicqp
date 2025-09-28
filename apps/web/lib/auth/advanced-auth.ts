import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import * as jwt from 'jsonwebtoken';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido?: string;
  telefono?: string;
  direccion?: string;
  empresa?: string;
  rol: 'super_admin' | 'administrador' | 'vendedor' | 'contador' | 'inventario' | 'cliente';
  email_verificado: boolean;
  telefono_verificado: boolean;
  mfa_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface MFAConfig {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface LoginResult {
  user?: User;
  error?: string;
  requiresMFA?: boolean;
  mfaToken?: string;
}

export interface MFAResult {
  success: boolean;
  error?: string;
  user?: User;
}

// Función para hashear contraseñas
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

// Función para verificar contraseñas
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Función para generar token JWT
export function generateToken(userId: string, role: string): string {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'logicqp-secret-key',
    { expiresIn: '24h' }
  );
}

// Función para verificar token JWT
export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'logicqp-secret-key') as { userId: string; role: string };
  } catch {
    return null;
  }
}

// Función para crear usuario super-admin
export async function createSuperAdmin(): Promise<void> {
  try {
    console.log('🔐 Creando usuario super-admin...');
    
    const superAdminData = {
      email: 'celag3@gmail.com',
      password_hash: await hashPassword('Ibot1801538719'),
      nombre: 'Carlos',
      apellido: 'Elag',
      telefono: '0998769259',
      direccion: 'Quito, Ecuador',
      empresa: 'Qualipharm Laboratorio Farmacéutico',
      rol: 'super_admin',
      email_verificado: true,
      telefono_verificado: true,
      mfa_enabled: false
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(superAdminData, { onConflict: 'email' });

    if (error) {
      console.error('❌ Error creando super-admin:', error);
      throw error;
    }

    console.log('✅ Usuario super-admin creado exitosamente');
  } catch (error) {
    console.error('❌ Error en createSuperAdmin:', error);
    throw error;
  }
}

// Función para registrar nuevo usuario
export async function registerUser(userData: {
  email: string;
  password: string;
  nombre: string;
  apellido?: string;
  telefono?: string;
  direccion?: string;
  empresa?: string;
}): Promise<{ user?: User; error?: string }> {
  try {
    console.log('📝 Registrando nuevo usuario:', userData.email);

    // Verificar si el email ya existe
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userData.email)
      .single();

    if (existingUser) {
      return { error: 'El email ya está registrado' };
    }

    // Crear usuario con rol de cliente por defecto
    const newUser = {
      email: userData.email,
      password_hash: await hashPassword(userData.password),
      nombre: userData.nombre,
      apellido: userData.apellido || '',
      telefono: userData.telefono || '',
      direccion: userData.direccion || '',
      empresa: userData.empresa || '',
      rol: 'cliente',
      email_verificado: false,
      telefono_verificado: false,
      mfa_enabled: false
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert([newUser])
      .select()
      .single();

    if (error) {
      console.error('❌ Error registrando usuario:', error);
      return { error: error.message };
    }

    console.log('✅ Usuario registrado exitosamente');
    return { user: data as User };
  } catch (error) {
    console.error('❌ Error en registerUser:', error);
    return { error: 'Error interno del servidor' };
  }
}

// Función para login
export async function loginUser(email: string, password: string): Promise<LoginResult> {
  try {
    console.log('🔑 Iniciando login para:', email);

    // Buscar usuario
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return { error: 'Credenciales incorrectas' };
    }

    // Verificar contraseña
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return { error: 'Credenciales incorrectas' };
    }

    // Si tiene MFA habilitado, requerir verificación
    if (user.mfa_enabled) {
      const mfaToken = generateToken(user.id, user.rol);
      return { requiresMFA: true, mfaToken };
    }

    console.log('✅ Login exitoso');
    return { user: user as User };
  } catch (error) {
    console.error('❌ Error en loginUser:', error);
    return { error: 'Error interno del servidor' };
  }
}

// Función para configurar MFA
export async function setupMFA(userId: string): Promise<MFAConfig | null> {
  try {
    console.log('🔐 Configurando MFA para usuario:', userId);

    // Generar secreto MFA
    const secret = speakeasy.generateSecret({
      name: 'LogicQP',
      issuer: 'Qualipharm',
      length: 32
    });

    // Generar códigos de respaldo
    const backupCodes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );

    // Generar QR Code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    // Guardar secreto en la base de datos
    const { error } = await supabase
      .from('profiles')
      .update({ mfa_secret: secret.base32 })
      .eq('id', userId);

    if (error) {
      console.error('❌ Error guardando secreto MFA:', error);
      return null;
    }

    console.log('✅ MFA configurado exitosamente');
    return {
      secret: secret.base32,
      qrCodeUrl,
      backupCodes
    };
  } catch (error) {
    console.error('❌ Error en setupMFA:', error);
    return null;
  }
}

// Función para verificar código MFA
export async function verifyMFA(userId: string, token: string): Promise<MFAResult> {
  try {
    console.log('🔐 Verificando código MFA para usuario:', userId);

    // Obtener secreto del usuario
    const { data: user, error } = await supabase
      .from('profiles')
      .select('mfa_secret')
      .eq('id', userId)
      .single();

    if (error || !user?.mfa_secret) {
      return { success: false, error: 'MFA no configurado' };
    }

    // Verificar token
    const verified = speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      return { success: false, error: 'Código MFA inválido' };
    }

    // Obtener datos completos del usuario
    const { data: fullUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    console.log('✅ MFA verificado exitosamente');
    return { success: true, user: fullUser as User };
  } catch (error) {
    console.error('❌ Error en verifyMFA:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

// Función para habilitar MFA
export async function enableMFA(userId: string): Promise<boolean> {
  try {
    console.log('🔐 Habilitando MFA para usuario:', userId);

    const { error } = await supabase
      .from('profiles')
      .update({ mfa_enabled: true })
      .eq('id', userId);

    if (error) {
      console.error('❌ Error habilitando MFA:', error);
      return false;
    }

    console.log('✅ MFA habilitado exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error en enableMFA:', error);
    return false;
  }
}

// Función para obtener usuario por ID
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as User;
  } catch (error) {
    console.error('❌ Error en getUserById:', error);
    return null;
  }
}

// Función para actualizar perfil de usuario
export async function updateUserProfile(userId: string, updates: Partial<User>): Promise<{ user?: User; error?: string }> {
  try {
    console.log('📝 Actualizando perfil de usuario:', userId);

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error actualizando perfil:', error);
      return { error: error.message };
    }

    console.log('✅ Perfil actualizado exitosamente');
    return { user: data as User };
  } catch (error) {
    console.error('❌ Error en updateUserProfile:', error);
    return { error: 'Error interno del servidor' };
  }
}

// Función para cambiar rol de usuario (solo super-admin y admin)
export async function changeUserRole(userId: string, newRole: string, adminUserId: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('👤 Cambiando rol de usuario:', userId, 'a', newRole);

    // Verificar que el admin tenga permisos
    const admin = await getUserById(adminUserId);
    if (!admin || !['super_admin', 'administrador'].includes(admin.rol)) {
      return { success: false, error: 'No tienes permisos para cambiar roles' };
    }

    // Verificar que no se esté cambiando el rol del super-admin
    if (userId === adminUserId && admin.rol === 'super_admin') {
      return { success: false, error: 'No puedes cambiar tu propio rol de super-admin' };
    }

    const { error } = await supabase
      .from('profiles')
      .update({ 
        rol: newRole,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('❌ Error cambiando rol:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Rol cambiado exitosamente');
    return { success: true };
  } catch (error) {
    console.error('❌ Error en changeUserRole:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

// Función para obtener todos los usuarios (solo admin y super-admin)
export async function getAllUsers(adminUserId: string): Promise<{ users?: User[]; error?: string }> {
  try {
    console.log('👥 Obteniendo lista de usuarios');

    // Verificar permisos
    const admin = await getUserById(adminUserId);
    if (!admin || !['super_admin', 'administrador'].includes(admin.rol)) {
      return { error: 'No tienes permisos para ver usuarios' };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error obteniendo usuarios:', error);
      return { error: error.message };
    }

    console.log('✅ Usuarios obtenidos exitosamente');
    return { users: data as User[] };
  } catch (error) {
    console.error('❌ Error en getAllUsers:', error);
    return { error: 'Error interno del servidor' };
  }
}

// Función para eliminar usuario (solo super-admin)
export async function deleteUser(userId: string, adminUserId: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🗑️ Eliminando usuario:', userId);

    // Verificar que el admin sea super-admin
    const admin = await getUserById(adminUserId);
    if (!admin || admin.rol !== 'super_admin') {
      return { success: false, error: 'Solo el super-admin puede eliminar usuarios' };
    }

    // No permitir eliminar al super-admin
    if (userId === adminUserId) {
      return { success: false, error: 'No puedes eliminar tu propia cuenta' };
    }

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('❌ Error eliminando usuario:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Usuario eliminado exitosamente');
    return { success: true };
  } catch (error) {
    console.error('❌ Error en deleteUser:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}