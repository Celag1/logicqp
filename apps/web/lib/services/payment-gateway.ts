"use client";

export interface PaymentMethod {
  id: string;
  type: 'card' | 'transfer' | 'cash' | 'crypto';
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  fees: {
    percentage: number;
    fixed: number;
  };
  processingTime: string;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  transactionId?: string;
  redirectUrl?: string;
  error?: string;
  timestamp: Date;
}

export interface PaymentMethodConfig {
  stripe: {
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
  };
  paypal: {
    clientId: string;
    clientSecret: string;
    sandbox: boolean;
  };
  mercadopago: {
    accessToken: string;
    publicKey: string;
    sandbox: boolean;
  };
}

class PaymentGatewayService {
  private config: PaymentMethodConfig;
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    this.config = {
      stripe: {
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
        secretKey: process.env.STRIPE_SECRET_KEY || '',
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || ''
      },
      paypal: {
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
        clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
        sandbox: process.env.NODE_ENV !== 'production'
      },
      mercadopago: {
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
        publicKey: process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || '',
        sandbox: process.env.NODE_ENV !== 'production'
      }
    };
  }

  /**
   * Obtener métodos de pago disponibles
   */
  getAvailablePaymentMethods(): PaymentMethod[] {
    return [
      {
        id: 'stripe_card',
        type: 'card' as const,
        name: 'Tarjeta de Crédito/Débito',
        description: 'Visa, Mastercard, American Express',
        icon: 'credit-card',
        enabled: !!this.config.stripe.publishableKey,
        fees: { percentage: 2.9, fixed: 0.30 },
        processingTime: 'Inmediato'
      },
      {
        id: 'paypal',
        type: 'transfer' as const,
        name: 'PayPal',
        description: 'Paga con tu cuenta PayPal',
        icon: 'paypal',
        enabled: !!this.config.paypal.clientId,
        fees: { percentage: 3.4, fixed: 0.35 },
        processingTime: 'Inmediato'
      },
      {
        id: 'mercadopago',
        type: 'transfer' as const,
        name: 'MercadoPago',
        description: 'Pago seguro con MercadoPago',
        icon: 'mercadopago',
        enabled: !!this.config.mercadopago.accessToken,
        fees: { percentage: 4.99, fixed: 0 },
        processingTime: 'Inmediato'
      },
      {
        id: 'bank_transfer',
        type: 'transfer' as const,
        name: 'Transferencia Bancaria',
        description: 'Transferencia directa a cuenta bancaria',
        icon: 'bank',
        enabled: true,
        fees: { percentage: 0, fixed: 0 },
        processingTime: '1-3 días hábiles'
      },
      {
        id: 'cash',
        type: 'cash' as const,
        name: 'Efectivo',
        description: 'Pago en efectivo al recibir',
        icon: 'dollar-sign',
        enabled: true,
        fees: { percentage: 0, fixed: 0 },
        processingTime: 'Al recibir'
      }
    ].filter((method: any) => method.enabled);
  }

  /**
   * Procesar pago con Stripe
   */
  async processStripePayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('💳 Procesando pago con Stripe:', paymentRequest);

      const response = await fetch(`${this.baseUrl}/payments/stripe/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentRequest)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error procesando pago con Stripe');
      }

      return {
        success: true,
        paymentId: data.paymentIntentId,
        status: 'pending',
        transactionId: data.clientSecret,
        redirectUrl: data.redirectUrl,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Error en pago Stripe:', error);
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Error procesando pago',
        timestamp: new Date()
      };
    }
  }

  /**
   * Procesar pago con PayPal
   */
  async processPayPalPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('🅿️ Procesando pago con PayPal:', paymentRequest);

      const response = await fetch(`${this.baseUrl}/payments/paypal/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentRequest)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error procesando pago con PayPal');
      }

      return {
        success: true,
        paymentId: data.orderId,
        status: 'pending',
        redirectUrl: data.approvalUrl,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Error en pago PayPal:', error);
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Error procesando pago',
        timestamp: new Date()
      };
    }
  }

  /**
   * Procesar pago con MercadoPago
   */
  async processMercadoPagoPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('🛒 Procesando pago con MercadoPago:', paymentRequest);

      const response = await fetch(`${this.baseUrl}/payments/mercadopago/create-preference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentRequest)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error procesando pago con MercadoPago');
      }

      return {
        success: true,
        paymentId: data.preferenceId,
        status: 'pending',
        redirectUrl: data.initPoint,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Error en pago MercadoPago:', error);
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Error procesando pago',
        timestamp: new Date()
      };
    }
  }

  /**
   * Procesar pago genérico
   */
  async processPayment(
    paymentMethodId: string, 
    paymentRequest: PaymentRequest
  ): Promise<PaymentResponse> {
    try {
      console.log('💳 Procesando pago:', { paymentMethodId, paymentRequest });

      switch (paymentMethodId) {
        case 'stripe_card':
          return await this.processStripePayment(paymentRequest);
        
        case 'paypal':
          return await this.processPayPalPayment(paymentRequest);
        
        case 'mercadopago':
          return await this.processMercadoPagoPayment(paymentRequest);
        
        case 'bank_transfer':
          return await this.processBankTransfer(paymentRequest);
        
        case 'cash':
          return await this.processCashPayment(paymentRequest);
        
        default:
          throw new Error('Método de pago no soportado');
      }

    } catch (error) {
      console.error('❌ Error procesando pago:', error);
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Error procesando pago',
        timestamp: new Date()
      };
    }
  }

  /**
   * Procesar transferencia bancaria
   */
  private async processBankTransfer(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Simular procesamiento de transferencia bancaria
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        paymentId: `BANK_${Date.now()}`,
        status: 'pending',
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Error en transferencia bancaria:', error);
      return {
        success: false,
        status: 'failed',
        error: 'Error procesando transferencia bancaria',
        timestamp: new Date()
      };
    }
  }

  /**
   * Procesar pago en efectivo
   */
  private async processCashPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Simular procesamiento de pago en efectivo
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        success: true,
        paymentId: `CASH_${Date.now()}`,
        status: 'pending',
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Error en pago en efectivo:', error);
      return {
        success: false,
        status: 'failed',
        error: 'Error procesando pago en efectivo',
        timestamp: new Date()
      };
    }
  }

  /**
   * Verificar estado de pago
   */
  async checkPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/status/${paymentId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error verificando estado del pago');
      }

      return {
        success: data.success,
        paymentId: data.paymentId,
        status: data.status,
        transactionId: data.transactionId,
        timestamp: new Date(data.timestamp)
      };

    } catch (error) {
      console.error('❌ Error verificando estado del pago:', error);
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Error verificando estado del pago',
        timestamp: new Date()
      };
    }
  }

  /**
   * Reembolsar pago
   */
  async refundPayment(paymentId: string, amount?: number): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentId, amount })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error procesando reembolso');
      }

      return {
        success: true,
        paymentId: data.paymentId,
        status: 'completed',
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Error procesando reembolso:', error);
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Error procesando reembolso',
        timestamp: new Date()
      };
    }
  }

  /**
   * Calcular comisiones
   */
  calculateFees(amount: number, paymentMethodId: string): number {
    const methods = this.getAvailablePaymentMethods();
    const method = methods.find(m => m.id === paymentMethodId);
    
    if (!method) return 0;

    const percentageFee = (amount * method.fees.percentage) / 100;
    const totalFee = percentageFee + method.fees.fixed;
    
    return Math.round(totalFee * 100) / 100; // Redondear a 2 decimales
  }

  /**
   * Obtener total con comisiones
   */
  getTotalWithFees(amount: number, paymentMethodId: string): number {
    const fees = this.calculateFees(amount, paymentMethodId);
    return amount + fees;
  }
}

export const paymentGatewayService = new PaymentGatewayService();




