"use client";

import { supabase } from '@/lib/supabase';

export interface TwoFactorConfig {
  enabled: boolean;
  method: 'totp' | 'sms' | 'email';
  secret?: string;
  backupCodes?: string[];
  phoneNumber?: string;
  email?: string;
}

export interface TwoFactorChallenge {
  id: string;
  userId: string;
  method: 'totp' | 'sms' | 'email';
  code: string;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
  used: boolean;
}

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
  manualEntryKey: string;
}

class TwoFactorAuthService {
  private table = 'two_factor_auth';
  private challengesTable = 'two_factor_challenges';

  /**
   * Verificar si 2FA está habilitado para un usuario
   */
  async isTwoFactorEnabled(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select('enabled')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // No encontrado
        console.error('Error verificando 2FA:', error);
        return false;
      }

      return data?.enabled || false;
    } catch (error) {
      console.error('Error verificando 2FA:', error);
      return false;
    }
  }

  /**
   * Obtener configuración 2FA del usuario
   */
  async getTwoFactorConfig(userId: string): Promise<TwoFactorConfig | null> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error obteniendo configuración 2FA:', error);
        return null;
      }

      return {
        enabled: data.enabled,
        method: data.method,
        secret: data.secret,
        backupCodes: data.backup_codes,
        phoneNumber: data.phone_number,
        email: data.email
      };
    } catch (error) {
      console.error('Error obteniendo configuración 2FA:', error);
      return null;
    }
  }

  /**
   * Inicializar configuración 2FA
   */
  async initializeTwoFactor(userId: string, method: 'totp' | 'sms' | 'email'): Promise<TwoFactorSetup> {
    try {
      console.log('🔐 Inicializando 2FA para usuario:', userId);

      // Generar secret para TOTP
      const secret = this.generateSecret();
      const qrCode = this.generateQRCode(userId, secret);
      const backupCodes = this.generateBackupCodes();
      const manualEntryKey = secret;

      // Guardar configuración en base de datos
      const { error } = await supabase
        .from(this.table)
        .upsert({
          user_id: userId,
          method: method,
          secret: secret,
          backup_codes: backupCodes,
          enabled: false, // No habilitar hasta verificar
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw new Error('Error guardando configuración 2FA');
      }

      console.log('✅ Configuración 2FA inicializada');

      return {
        secret,
        qrCode,
        backupCodes,
        manualEntryKey
      };

    } catch (error) {
      console.error('Error inicializando 2FA:', error);
      throw error;
    }
  }

  /**
   * Verificar código 2FA durante configuración
   */
  async verifyTwoFactorSetup(userId: string, code: string): Promise<boolean> {
    try {
      const config = await this.getTwoFactorConfig(userId);
      if (!config || !config.secret) {
        throw new Error('Configuración 2FA no encontrada');
      }

      const isValid = this.verifyTOTPCode(config.secret, code);
      
      if (isValid) {
        // Habilitar 2FA
        await this.enableTwoFactor(userId);
      }

      return isValid;
    } catch (error) {
      console.error('Error verificando código 2FA:', error);
      return false;
    }
  }

  /**
   * Habilitar 2FA para usuario
   */
  async enableTwoFactor(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.table)
        .update({
          enabled: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        throw new Error('Error habilitando 2FA');
      }

      console.log('✅ 2FA habilitado para usuario:', userId);
      return true;
    } catch (error) {
      console.error('Error habilitando 2FA:', error);
      return false;
    }
  }

  /**
   * Deshabilitar 2FA para usuario
   */
  async disableTwoFactor(userId: string, password: string): Promise<boolean> {
    try {
      // Verificar contraseña antes de deshabilitar
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: '', // Se necesitaría el email del usuario
        password: password
      });

      if (authError) {
        throw new Error('Contraseña incorrecta');
      }

      const { error } = await supabase
        .from(this.table)
        .update({
          enabled: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        throw new Error('Error deshabilitando 2FA');
      }

      console.log('✅ 2FA deshabilitado para usuario:', userId);
      return true;
    } catch (error) {
      console.error('Error deshabilitando 2FA:', error);
      return false;
    }
  }

  /**
   * Crear desafío 2FA
   */
  async createTwoFactorChallenge(userId: string, method: 'totp' | 'sms' | 'email'): Promise<TwoFactorChallenge> {
    try {
      const config = await this.getTwoFactorConfig(userId);
      if (!config || !config.enabled) {
        throw new Error('2FA no habilitado');
      }

      const code = this.generateCode(method);
      const challengeId = `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

      const challenge: TwoFactorChallenge = {
        id: challengeId,
        userId,
        method,
        code,
        expiresAt,
        attempts: 0,
        maxAttempts: 3,
        used: false
      };

      // Guardar desafío en base de datos
      const { error } = await supabase
        .from(this.challengesTable)
        .insert({
          id: challengeId,
          user_id: userId,
          method: method,
          code: code,
          expires_at: expiresAt.toISOString(),
          attempts: 0,
          max_attempts: 3,
          used: false,
          created_at: new Date().toISOString()
        });

      if (error) {
        throw new Error('Error creando desafío 2FA');
      }

      // Enviar código según el método
      await this.sendTwoFactorCode(userId, code, method, config);

      console.log('✅ Desafío 2FA creado:', challengeId);
      return challenge;

    } catch (error) {
      console.error('Error creando desafío 2FA:', error);
      throw error;
    }
  }

  /**
   * Verificar código 2FA
   */
  async verifyTwoFactorCode(userId: string, code: string, challengeId?: string): Promise<boolean> {
    try {
      const config = await this.getTwoFactorConfig(userId);
      if (!config || !config.enabled) {
        return false;
      }

      // Verificar código TOTP
      if (config.method === 'totp' && config.secret) {
        return this.verifyTOTPCode(config.secret, code);
      }

      // Verificar código de desafío
      if (challengeId) {
        return await this.verifyChallengeCode(challengeId, code);
      }

      // Verificar código de respaldo
      if (config.backupCodes && config.backupCodes.includes(code)) {
        await this.invalidateBackupCode(userId, code);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error verificando código 2FA:', error);
      return false;
    }
  }

  /**
   * Generar códigos de respaldo
   */
  generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(this.generateRandomCode(8));
    }
    return codes;
  }

  /**
   * Invalidar código de respaldo usado
   */
  async invalidateBackupCode(userId: string, code: string): Promise<void> {
    try {
      const config = await this.getTwoFactorConfig(userId);
      if (!config || !config.backupCodes) return;

      const updatedCodes = config.backupCodes.filter(c => c !== code);
      
      await supabase
        .from(this.table)
        .update({
          backup_codes: updatedCodes,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

    } catch (error) {
      console.error('Error invalidando código de respaldo:', error);
    }
  }

  // Métodos privados

  private generateSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  }

  private generateQRCode(userId: string, secret: string): string {
    const issuer = 'LogicQP';
    const accountName = userId;
    const otpAuthUrl = `otpauth://totp/${issuer}:${accountName}?secret=${secret}&issuer=${issuer}`;
    
    // En producción usarías una librería como qrcode
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpAuthUrl)}`;
  }

  private generateCode(method: string): string {
    if (method === 'totp') {
      return this.generateTOTPCode();
    }
    return this.generateRandomCode(6);
  }

  private generateTOTPCode(): string {
    // Simulación de código TOTP (en producción usarías una librería como speakeasy)
    const time = Math.floor(Date.now() / 1000 / 30);
    const code = (time % 1000000).toString().padStart(6, '0');
    return code;
  }

  private generateRandomCode(length: number): string {
    const chars = '0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private verifyTOTPCode(secret: string, code: string): boolean {
    // Simulación de verificación TOTP (en producción usarías speakeasy)
    const expectedCode = this.generateTOTPCode();
    return code === expectedCode;
  }

  private async verifyChallengeCode(challengeId: string, code: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from(this.challengesTable)
        .select('*')
        .eq('id', challengeId)
        .eq('used', false)
        .single();

      if (error || !data) {
        return false;
      }

      // Verificar si el desafío ha expirado
      if (new Date(data.expires_at) < new Date()) {
        return false;
      }

      // Verificar intentos máximos
      if (data.attempts >= data.max_attempts) {
        return false;
      }

      // Verificar código
      const isValid = data.code === code;

      if (isValid) {
        // Marcar como usado
        await supabase
          .from(this.challengesTable)
          .update({ used: true })
          .eq('id', challengeId);
      } else {
        // Incrementar intentos
        await supabase
          .from(this.challengesTable)
          .update({ attempts: data.attempts + 1 })
          .eq('id', challengeId);
      }

      return isValid;
    } catch (error) {
      console.error('Error verificando código de desafío:', error);
      return false;
    }
  }

  private async sendTwoFactorCode(userId: string, code: string, method: string, config: TwoFactorConfig): Promise<void> {
    // Simulación de envío de código
    console.log(`📱 Enviando código 2FA (${method}):`, code);
    
    // En producción aquí enviarías el código por SMS o email
    if (method === 'sms' && config.phoneNumber) {
      // Enviar SMS
      console.log(`SMS enviado a ${config.phoneNumber}: ${code}`);
    } else if (method === 'email' && config.email) {
      // Enviar email
      console.log(`Email enviado a ${config.email}: ${code}`);
    }
  }
}

export const twoFactorAuthService = new TwoFactorAuthService();
