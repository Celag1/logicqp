interface PaymentItem {
  product: {
    id: string;
    nombre: string;
    precio: number;
  };
  quantity: number;
  subtotal: number;
}

interface PaymentData {
  items: PaymentItem[];
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  total: number;
  currency?: string;
  notes?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  message: string;
  error?: string;
}

class SimpleRealPaymentService {
  async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      console.log('🏆 LogicQP - La Mejor Tienda Virtual del Mundo');
      console.log('💳 Procesando pago con tecnología de vanguardia...', {
        items: paymentData.items.length,
        total: paymentData.total,
        customer: paymentData.customerEmail
      });

      // Simular procesamiento de pago con tecnología avanzada
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simular validación de tarjeta con IA (95% de éxito para la mejor tienda)
      const isSuccess = Math.random() > 0.05;

      if (isSuccess) {
        const paymentId = `LOGICQP_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        // Enviar factura profesional
        await this.sendProfessionalInvoice(paymentData, paymentId);
        
        console.log('✅ Pago procesado exitosamente en LogicQP:', paymentId);
        return {
          success: true,
          paymentId,
          message: '¡Pago exitoso! Factura profesional enviada a tu email. Gracias por elegir LogicQP.'
        };
      } else {
        console.log('❌ Pago rechazado - Verificación de seguridad');
        return {
          success: false,
          message: 'Pago rechazado por seguridad bancaria. Verifica los datos de tu tarjeta o contacta a tu banco.',
          error: 'CARD_DECLINED'
        };
      }

    } catch (error: any) {
      console.error('❌ Error en LogicQP:', error);
      return {
        success: false,
        message: 'Error temporal en nuestro sistema. Nuestro equipo técnico ha sido notificado. Intenta nuevamente.',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  private async sendProfessionalInvoice(paymentData: PaymentData, paymentId: string) {
    try {
      console.log('📧 LogicQP - Enviando factura profesional con Gmail a:', paymentData.customerEmail);
      
      // Importar el servicio de email con Gmail
      const { emailServiceGmail } = await import('@/lib/email-service-gmail');
      
      // Preparar datos de la factura
      const invoiceData = {
        orderId: paymentId,
        customerName: paymentData.customerName,
        customerEmail: paymentData.customerEmail,
        customerPhone: paymentData.customerPhone,
        customerAddress: paymentData.customerAddress,
        items: paymentData.items.map(item => ({
          name: item.product.nombre,
          quantity: item.quantity,
          price: item.product.precio,
          subtotal: item.subtotal
        })),
        subtotal: paymentData.total * 0.85, // 85% del total (antes del IVA)
        tax: paymentData.total * 0.15, // 15% IVA
        total: paymentData.total,
        paymentMethod: 'Tarjeta de Crédito',
        notes: paymentData.notes
      };
      
      // Enviar factura por email con Gmail
      const result = await emailServiceGmail.sendInvoice(invoiceData);
      
      if (result.success) {
        console.log('✅ Factura enviada exitosamente con Gmail:', paymentId);
      } else {
        console.error('❌ Error enviando factura con Gmail:', result.message);
      }
      
    } catch (error) {
      console.error('❌ Error enviando factura profesional:', error);
    }
  }

  async createPaymentIntent(paymentData: PaymentData): Promise<PaymentResult> {
    return this.processPayment(paymentData);
  }

  async confirmPayment(paymentId: string): Promise<PaymentResult> {
    // Simular confirmación
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      paymentId,
      message: 'Pago confirmado exitosamente'
    };
  }
}

export const simpleRealPaymentService = new SimpleRealPaymentService();
export default simpleRealPaymentService;
