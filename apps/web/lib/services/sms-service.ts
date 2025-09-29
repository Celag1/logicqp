import { supabase } from '@/lib/supabase/client';

export interface SMSConfig {
  apiKey: string;
  phoneNumber: string;
  accountSid: string;
  authToken: string;
}

export interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Función para obtener configuración de SMS desde la base de datos
async function getSMSConfig(): Promise<SMSConfig> {
  try {
    const { data, error } = await supabase
      .from('configuracion')
      .select('clave, valor')
      .in('clave', ['sms_api_key', 'sms_phone', 'twilio_account_sid', 'twilio_auth_token']);

    if (error || !data) {
      throw new Error('No se pudo obtener configuración de SMS');
    }

    const config: any = {};
    data.forEach((item: any) => {
      config[item.clave] = item.valor;
    });

    return {
      apiKey: config.sms_api_key || 'demo_api_key',
      phoneNumber: config.sms_phone || '+593987654321',
      accountSid: config.twilio_account_sid || 'demo_account_sid',
      authToken: config.twilio_auth_token || 'demo_auth_token'
    };
  } catch (error) {
    console.error('❌ Error obteniendo configuración de SMS:', error);
    // Configuración por defecto para desarrollo
    return {
      apiKey: 'demo_api_key',
      phoneNumber: '+593987654321',
      accountSid: 'demo_account_sid',
      authToken: 'demo_auth_token'
    };
  }
}

// Función para enviar SMS usando Twilio (simulado para desarrollo)
export async function sendSMS(phoneNumber: string, message: string): Promise<SMSResult> {
  try {
    console.log('📱 Enviando SMS a:', phoneNumber);
    console.log('📝 Mensaje:', message);

    const config = await getSMSConfig();

    // En desarrollo, simular envío de SMS
    if (config.apiKey === 'demo_api_key') {
      console.log('📱 [SIMULADO] SMS enviado exitosamente');
      console.log('📱 [SIMULADO] Número:', phoneNumber);
      console.log('📱 [SIMULADO] Mensaje:', message);
      
      // Simular delay de envío
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        messageId: `demo_${Date.now()}`,
        error: undefined
      };
    }

    // En producción, usar Twilio real
    const twilio = require('twilio')(config.accountSid, config.authToken);

    const result = await twilio.messages.create({
      body: message,
      from: config.phoneNumber,
      to: phoneNumber
    });

    console.log('✅ SMS enviado exitosamente:', result.sid);
    return {
      success: true,
      messageId: result.sid,
      error: undefined
    };
  } catch (error) {
    console.error('❌ Error enviando SMS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

// Función para enviar SMS de bienvenida
export async function sendWelcomeSMS(phoneNumber: string, userName: string): Promise<SMSResult> {
  try {
    const message = `🏥 Qualipharm LogicQP\n\nHola ${userName}, bienvenido al sistema LogicQP de Qualipharm Laboratorio Farmacéutico. Tu cuenta ha sido creada exitosamente.\n\nAccede en: http://localhost:3000\n\n¡Gracias por confiar en nosotros!`;
    
    return await sendSMS(phoneNumber, message);
  } catch (error) {
    console.error('❌ Error enviando SMS de bienvenida:', error);
    return {
      success: false,
      error: 'Error enviando SMS de bienvenida'
    };
  }
}

// Función para enviar SMS de notificación de venta
export async function sendSaleNotificationSMS(
  phoneNumber: string,
  clientName: string,
  saleData: {
    id: string;
    total: number;
    fecha: string;
  }
): Promise<SMSResult> {
  try {
    const message = `🏥 Qualipharm LogicQP\n\nEstimado/a ${clientName}, su compra #${saleData.id} por $${saleData.total.toFixed(2)} ha sido procesada exitosamente.\n\nFecha: ${new Date(saleData.fecha).toLocaleDateString('es-EC')}\n\n¡Gracias por su compra!`;
    
    return await sendSMS(phoneNumber, message);
  } catch (error) {
    console.error('❌ Error enviando SMS de notificación de venta:', error);
    return {
      success: false,
      error: 'Error enviando SMS de notificación de venta'
    };
  }
}

// Función para enviar SMS de alerta de stock bajo
export async function sendLowStockAlertSMS(
  adminPhone: string,
  productName: string,
  currentStock: number,
  minStock: number
): Promise<SMSResult> {
  try {
    const message = `⚠️ ALERTA STOCK BAJO - Qualipharm\n\nProducto: ${productName}\nStock actual: ${currentStock}\nStock mínimo: ${minStock}\n\nREQUIERE REABASTECIMIENTO INMEDIATO\n\nSistema LogicQP`;
    
    return await sendSMS(adminPhone, message);
  } catch (error) {
    console.error('❌ Error enviando SMS de alerta de stock bajo:', error);
    return {
      success: false,
      error: 'Error enviando SMS de alerta de stock bajo'
    };
  }
}

// Función para enviar SMS de cambio de rol
export async function sendRoleChangeSMS(
  phoneNumber: string,
  userName: string,
  newRole: string
): Promise<SMSResult> {
  try {
    const message = `👤 CAMBIO DE ROL - LogicQP\n\nHola ${userName}, tu rol en el sistema ha sido actualizado a: ${newRole}\n\nPor favor, inicia sesión nuevamente para que los cambios surtan efecto.\n\nSistema LogicQP - Qualipharm`;
    
    return await sendSMS(phoneNumber, message);
  } catch (error) {
    console.error('❌ Error enviando SMS de cambio de rol:', error);
    return {
      success: false,
      error: 'Error enviando SMS de cambio de rol'
    };
  }
}

// Función para enviar SMS de código MFA
export async function sendMFACodeSMS(phoneNumber: string, code: string): Promise<SMSResult> {
  try {
    const message = `🔐 CÓDIGO MFA - LogicQP\n\nTu código de verificación es: ${code}\n\nEste código expira en 5 minutos.\n\nNo compartas este código con nadie.\n\nSistema LogicQP - Qualipharm`;
    
    return await sendSMS(phoneNumber, message);
  } catch (error) {
    console.error('❌ Error enviando SMS de código MFA:', error);
    return {
      success: false,
      error: 'Error enviando SMS de código MFA'
    };
  }
}

// Función para enviar SMS de recordatorio de pago
export async function sendPaymentReminderSMS(
  phoneNumber: string,
  clientName: string,
  amount: number,
  dueDate: string
): Promise<SMSResult> {
  try {
    const message = `💰 RECORDATORIO DE PAGO - Qualipharm\n\nEstimado/a ${clientName}, tiene una factura pendiente por $${amount.toFixed(2)} con vencimiento el ${new Date(dueDate).toLocaleDateString('es-EC')}.\n\nPor favor, proceda con el pago para evitar intereses.\n\n¡Gracias por su colaboración!`;
    
    return await sendSMS(phoneNumber, message);
  } catch (error) {
    console.error('❌ Error enviando SMS de recordatorio de pago:', error);
    return {
      success: false,
      error: 'Error enviando SMS de recordatorio de pago'
    };
  }
}

// Función para enviar SMS de confirmación de entrega
export async function sendDeliveryConfirmationSMS(
  phoneNumber: string,
  clientName: string,
  orderId: string,
  deliveryDate: string
): Promise<SMSResult> {
  try {
    const message = `🚚 CONFIRMACIÓN DE ENTREGA - Qualipharm\n\nEstimado/a ${clientName}, su pedido #${orderId} ha sido entregado exitosamente el ${new Date(deliveryDate).toLocaleDateString('es-EC')}.\n\n¡Gracias por confiar en Qualipharm!\n\nSistema LogicQP`;
    
    return await sendSMS(phoneNumber, message);
  } catch (error) {
    console.error('❌ Error enviando SMS de confirmación de entrega:', error);
    return {
      success: false,
      error: 'Error enviando SMS de confirmación de entrega'
    };
  }
}

// Función para validar número de teléfono ecuatoriano
export function validateEcuadorianPhone(phoneNumber: string): boolean {
  // Remover espacios y caracteres especiales
  const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  // Validar formato ecuatoriano: +593XXXXXXXXX o 09XXXXXXXX
  const ecuadorianPhoneRegex = /^(\+593|593)?[0-9]{9}$/;
  
  return ecuadorianPhoneRegex.test(cleanPhone);
}

// Función para formatear número de teléfono ecuatoriano
export function formatEcuadorianPhone(phoneNumber: string): string {
  const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  if (cleanPhone.startsWith('+593')) {
    return cleanPhone;
  } else if (cleanPhone.startsWith('593')) {
    return `+${cleanPhone}`;
  } else if (cleanPhone.startsWith('09')) {
    return `+593${cleanPhone.substring(1)}`;
  } else if (cleanPhone.length === 9) {
    return `+593${cleanPhone}`;
  }
  
  return phoneNumber; // Retornar original si no se puede formatear
}
