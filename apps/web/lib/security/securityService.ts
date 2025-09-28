import { supabase } from '@/lib/supabase/client'

export interface SecurityRule {
  resource: string
  action: string
  roles: string[]
  conditions?: Record<string, any>
}

export interface AuditLog {
  id: string
  user_id: string
  user_email: string
  action: string
  resource: string
  resource_id?: string
  details: Record<string, any>
  ip_address: string
  user_agent: string
  created_at: string
}

class SecurityService {
  private securityRules: SecurityRule[] = [
    // Reglas para usuarios
    {
      resource: 'users',
      action: 'read',
      roles: ['super_admin', 'administrador', 'vendedor']
    },
    {
      resource: 'users',
      action: 'create',
      roles: ['super_admin', 'administrador']
    },
    {
      resource: 'users',
      action: 'update',
      roles: ['super_admin', 'administrador']
    },
    {
      resource: 'users',
      action: 'delete',
      roles: ['super_admin']
    },
    // Reglas para productos
    {
      resource: 'productos',
      action: 'read',
      roles: ['super_admin', 'administrador', 'vendedor', 'inventario']
    },
    {
      resource: 'productos',
      action: 'create',
      roles: ['super_admin', 'administrador', 'inventario']
    },
    {
      resource: 'productos',
      action: 'update',
      roles: ['super_admin', 'administrador', 'inventario']
    },
    {
      resource: 'productos',
      action: 'delete',
      roles: ['super_admin', 'administrador']
    },
    // Reglas para ventas
    {
      resource: 'ventas',
      action: 'read',
      roles: ['super_admin', 'administrador', 'vendedor', 'contador']
    },
    {
      resource: 'ventas',
      action: 'create',
      roles: ['super_admin', 'administrador', 'vendedor']
    },
    {
      resource: 'ventas',
      action: 'update',
      roles: ['super_admin', 'administrador', 'vendedor']
    },
    {
      resource: 'ventas',
      action: 'delete',
      roles: ['super_admin', 'administrador']
    },
    // Reglas para inventario
    {
      resource: 'inventario',
      action: 'read',
      roles: ['super_admin', 'administrador', 'inventario', 'vendedor']
    },
    {
      resource: 'inventario',
      action: 'create',
      roles: ['super_admin', 'administrador', 'inventario']
    },
    {
      resource: 'inventario',
      action: 'update',
      roles: ['super_admin', 'administrador', 'inventario']
    },
    // Reglas para reportes
    {
      resource: 'reportes',
      action: 'read',
      roles: ['super_admin', 'administrador', 'contador']
    },
    {
      resource: 'reportes',
      action: 'create',
      roles: ['super_admin', 'administrador', 'contador']
    },
    {
      resource: 'reportes',
      action: 'delete',
      roles: ['super_admin', 'administrador']
    },
    // Reglas para configuración
    {
      resource: 'configuracion',
      action: 'read',
      roles: ['super_admin', 'administrador']
    },
    {
      resource: 'configuracion',
      action: 'update',
      roles: ['super_admin', 'administrador']
    }
  ]

  // Verificar si un usuario tiene permiso para realizar una acción
  async hasPermission(
    userRole: string,
    resource: string,
    action: string,
    conditions?: Record<string, any>
  ): Promise<boolean> {
    const rule = this.securityRules.find(
      r => r.resource === resource && r.action === action
    )

    if (!rule) {
      console.log(`❌ No se encontró regla para ${resource}:${action}`)
      return false
    }

    const hasRole = rule.roles.includes(userRole)
    
    if (!hasRole) {
      console.log(`❌ Usuario con rol ${userRole} no tiene permiso para ${resource}:${action}`)
      return false
    }

    // Verificar condiciones adicionales si existen
    if (rule.conditions && conditions) {
      for (const [key, value] of Object.entries(rule.conditions)) {
        if (conditions[key] !== value) {
          console.log(`❌ Condición no cumplida: ${key} = ${conditions[key]}, esperado: ${value}`)
          return false
        }
      }
    }

    console.log(`✅ Usuario con rol ${userRole} tiene permiso para ${resource}:${action}`)
    return true
  }

  // Registrar actividad en el log de auditoría
  async logActivity(
    userId: string,
    userEmail: string,
    action: string,
    resource: string,
    resourceId: string | undefined,
    details: Record<string, any>,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    try {
      const auditLog: Omit<AuditLog, 'id' | 'created_at'> = {
        user_id: userId,
        user_email: userEmail,
        action,
        resource,
        resource_id: resourceId,
        details,
        ip_address: ipAddress,
        user_agent: userAgent
      }

      // Aquí podrías guardar en una tabla de auditoría
      console.log('📝 Log de auditoría:', auditLog)
    } catch (error) {
      console.error('❌ Error registrando actividad:', error)
    }
  }

  // Validar entrada de datos
  validateInput(data: any, rules: Record<string, any>): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    for (const [field, rule] of Object.entries(rules)) {
      const value = data[field]

      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} es requerido`)
        continue
      }

      if (value !== undefined && value !== null && value !== '') {
        if (rule.type === 'email' && !this.isValidEmail(value)) {
          errors.push(`${field} debe ser un email válido`)
        }

        if (rule.type === 'phone' && !this.isValidPhone(value)) {
          errors.push(`${field} debe ser un teléfono válido`)
        }

        if (rule.minLength && value.length < rule.minLength) {
          errors.push(`${field} debe tener al menos ${rule.minLength} caracteres`)
        }

        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push(`${field} debe tener máximo ${rule.maxLength} caracteres`)
        }

        if (rule.pattern && !rule.pattern.test(value)) {
          errors.push(`${field} no cumple con el formato requerido`)
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // Validar email
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validar teléfono
  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/
    return phoneRegex.test(phone)
  }

  // Sanitizar entrada de datos
  sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      return input
        .replace(/[<>]/g, '') // Remover < y >
        .replace(/javascript:/gi, '') // Remover javascript:
        .replace(/on\w+=/gi, '') // Remover event handlers
        .trim()
    }

    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item))
    }

    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {}
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeInput(value)
      }
      return sanitized
    }

    return input
  }

  // Generar token de sesión seguro
  generateSessionToken(): string {
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substring(2)
    return Buffer.from(`${timestamp}-${random}`).toString('base64')
  }

  // Verificar token de sesión
  verifySessionToken(token: string): boolean {
    try {
      const decoded = Buffer.from(token, 'base64').toString('ascii')
      const [timestamp] = decoded.split('-')
      const tokenTime = parseInt(timestamp)
      const now = Date.now()
      
      // Token válido por 24 horas
      return (now - tokenTime) < 24 * 60 * 60 * 1000
    } catch (error) {
      return false
    }
  }

  // Encriptar datos sensibles
  encryptSensitiveData(data: string): string {
    // En un entorno real, usar una librería de encriptación como crypto-js
    return Buffer.from(data).toString('base64')
  }

  // Desencriptar datos sensibles
  decryptSensitiveData(encryptedData: string): string {
    try {
      return Buffer.from(encryptedData, 'base64').toString('ascii')
    } catch (error) {
      return encryptedData
    }
  }

  // Verificar fortaleza de contraseña
  validatePasswordStrength(password: string): { valid: boolean; score: number; feedback: string[] } {
    const feedback: string[] = []
    let score = 0

    if (password.length >= 8) {
      score += 1
    } else {
      feedback.push('La contraseña debe tener al menos 8 caracteres')
    }

    if (/[a-z]/.test(password)) {
      score += 1
    } else {
      feedback.push('La contraseña debe contener al menos una letra minúscula')
    }

    if (/[A-Z]/.test(password)) {
      score += 1
    } else {
      feedback.push('La contraseña debe contener al menos una letra mayúscula')
    }

    if (/[0-9]/.test(password)) {
      score += 1
    } else {
      feedback.push('La contraseña debe contener al menos un número')
    }

    if (/[^a-zA-Z0-9]/.test(password)) {
      score += 1
    } else {
      feedback.push('La contraseña debe contener al menos un carácter especial')
    }

    return {
      valid: score >= 4,
      score,
      feedback
    }
  }

  // Obtener reglas de seguridad
  getSecurityRules(): SecurityRule[] {
    return this.securityRules
  }

  // Agregar regla de seguridad personalizada
  addSecurityRule(rule: SecurityRule): void {
    this.securityRules.push(rule)
  }

  // Remover regla de seguridad
  removeSecurityRule(resource: string, action: string): void {
    this.securityRules = this.securityRules.filter(
      rule => !(rule.resource === resource && rule.action === action)
    )
  }
}

// Instancia singleton
export const securityService = new SecurityService()
