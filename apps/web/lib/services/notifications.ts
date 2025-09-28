'use client'

export interface NotificationData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: string;
  estimatedDelivery: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface SMSTemplate {
  message: string;
}

class NotificationService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // Generar plantilla de email de confirmación de compra
  private generateEmailTemplate(data: NotificationData): EmailTemplate {
    const subject = `✅ Confirmación de Compra - Pedido ${data.orderNumber}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación de Compra - LogicQP</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .total { font-size: 18px; font-weight: bold; color: #059669; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 ¡Compra Confirmada!</h1>
            <p>Gracias por confiar en LogicQP</p>
          </div>
          
          <div class="content">
            <h2>Hola ${data.customerName},</h2>
            <p>Tu pedido ha sido procesado exitosamente. Aquí tienes los detalles:</p>
            
            <div class="order-info">
              <h3>📋 Detalles del Pedido</h3>
              <p><strong>Número de Pedido:</strong> ${data.orderNumber}</p>
              <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-EC')}</p>
              <p><strong>Estado:</strong> <span style="color: #059669;">Confirmado</span></p>
            </div>
            
            <div class="order-info">
              <h3>🛍️ Productos</h3>
              ${data.items.map(item => `
                <div class="item">
                  <span>${item.name} x${item.quantity}</span>
                  <span>$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              `).join('')}
              <div class="item" style="border-top: 2px solid #2563eb; font-weight: bold;">
                <span>Total</span>
                <span class="total">$${data.total.toFixed(2)}</span>
              </div>
            </div>
            
            <div class="order-info">
              <h3>🚚 Información de Envío</h3>
              <p><strong>Dirección:</strong> ${data.shippingAddress}</p>
              <p><strong>Entrega estimada:</strong> ${data.estimatedDelivery}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${this.baseUrl}/mis-pedidos" class="button">Ver Mis Pedidos</a>
              <a href="${this.baseUrl}/dashboard" class="button">Ir al Dashboard</a>
            </div>
            
            <div class="footer">
              <p>¿Tienes preguntas? Contáctanos en <a href="mailto:soporte@logicqp.com">soporte@logicqp.com</a></p>
              <p>© 2024 LogicQP - Sistema Farmacéutico Inteligente</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      🎉 ¡Compra Confirmada! - LogicQP
      
      Hola ${data.customerName},
      
      Tu pedido ha sido procesado exitosamente.
      
      📋 Detalles del Pedido:
      - Número: ${data.orderNumber}
      - Fecha: ${new Date().toLocaleDateString('es-EC')}
      - Estado: Confirmado
      
      🛍️ Productos:
      ${data.items.map(item => `- ${item.name} x${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`).join('\n')}
      
      💰 Total: $${data.total.toFixed(2)}
      
      🚚 Envío:
      - Dirección: ${data.shippingAddress}
      - Entrega estimada: ${data.estimatedDelivery}
      
      Ver pedidos: ${this.baseUrl}/mis-pedidos
      
      © 2024 LogicQP
    `;

    return { subject, html, text };
  }

  // Generar plantilla de SMS
  private generateSMSTemplate(data: NotificationData): SMSTemplate {
    const message = `🎉 LogicQP: Tu pedido ${data.orderNumber} ha sido confirmado. Total: $${data.total.toFixed(2)}. Entrega estimada: ${data.estimatedDelivery}. Gracias por confiar en nosotros!`;
    
    return { message };
  }

  // Enviar notificación por email
  async sendEmailNotification(data: NotificationData): Promise<boolean> {
    try {
      console.log('📧 Enviando notificación por email...', data);
      
      const template = this.generateEmailTemplate(data);
      
      // Simular envío de email (en producción usarías un servicio como SendGrid, Resend, etc.)
      const response = await fetch(`${this.baseUrl}/api/notifications/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: data.customerEmail,
          subject: template.subject,
          html: template.html,
          text: template.text,
        }),
      });

      if (response.ok) {
        console.log('✅ Email enviado exitosamente');
        return true;
      } else {
        console.error('❌ Error al enviar email:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ Error al enviar email:', error);
      return false;
    }
  }

  // Enviar notificación por SMS
  async sendSMSNotification(data: NotificationData): Promise<boolean> {
    try {
      console.log('📱 Enviando notificación por SMS...', data);
      
      const template = this.generateSMSTemplate(data);
      
      // Simular envío de SMS (en producción usarías un servicio como Twilio, AWS SNS, etc.)
      const response = await fetch(`${this.baseUrl}/api/notifications/sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: data.customerPhone,
          message: template.message,
        }),
      });

      if (response.ok) {
        console.log('✅ SMS enviado exitosamente');
        return true;
      } else {
        console.error('❌ Error al enviar SMS:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ Error al enviar SMS:', error);
      return false;
    }
  }

  // Enviar todas las notificaciones
  async sendAllNotifications(data: NotificationData): Promise<{
    email: boolean;
    sms: boolean;
  }> {
    console.log('📬 Enviando todas las notificaciones...', data);
    
    const [emailResult, smsResult] = await Promise.allSettled([
      this.sendEmailNotification(data),
      this.sendSMSNotification(data),
    ]);

    const email = emailResult.status === 'fulfilled' ? emailResult.value : false;
    const sms = smsResult.status === 'fulfilled' ? smsResult.value : false;

    console.log('📊 Resultados de notificaciones:', { email, sms });
    
    return { email, sms };
  }
}

export const notificationService = new NotificationService();
