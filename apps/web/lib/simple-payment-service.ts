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
  total: number;
  currency?: string;
}

interface PaymentResult {
  success: boolean;
  paymentId?: string;
  message: string;
  error?: string;
}

class SimplePaymentService {
  async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      console.log('💳 Procesando pago simplificado...', {
        items: paymentData.items.length,
        total: paymentData.total,
        customer: paymentData.customerEmail
      });

      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generar ID de pago simulado
      const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Simular éxito del pago (90% de éxito)
      const isSuccess = Math.random() > 0.1;

      if (isSuccess) {
        console.log('✅ Pago procesado exitosamente:', paymentId);
        return {
          success: true,
          paymentId,
          message: 'Pago procesado exitosamente'
        };
      } else {
        console.log('❌ Pago falló (simulado)');
        return {
          success: false,
          message: 'Pago rechazado por el banco. Intenta con otra tarjeta.',
          error: 'CARD_DECLINED'
        };
      }
    } catch (error) {
      console.error('❌ Error procesando pago:', error);
      return {
        success: false,
        message: 'Error interno del servidor. Intenta nuevamente.',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  async createPaymentIntent(paymentData: PaymentData) {
    // Para compatibilidad con el código existente
    return this.processPayment(paymentData);
  }

  async confirmPayment(paymentId: string) {
    // Simular confirmación de pago
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      paymentId,
      message: 'Pago confirmado exitosamente'
    };
  }
}

export const paymentService = new SimplePaymentService();
export default paymentService;
