import Stripe from 'stripe';

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

class PaymentService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...', {
      apiVersion: '2024-12-18.acacia',
    });
  }

  async createPaymentIntent(paymentData: PaymentData) {
    try {
      // Crear productos en Stripe si no existen
      const lineItems = await Promise.all(
        paymentData.items.map(async (item) => {
          // Buscar o crear producto en Stripe
          const product = await this.findOrCreateProduct(item.product);
          
          return {
            price_data: {
              currency: paymentData.currency || 'usd',
              product_data: {
                name: item.product.nombre,
                description: `Producto farmacéutico - ${item.product.nombre}`,
                metadata: {
                  product_id: item.product.id,
                },
              },
              unit_amount: Math.round(item.product.precio * 100), // Convertir a centavos
            },
            quantity: item.quantity,
          };
        })
      );

      // Crear PaymentIntent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(paymentData.total * 100), // Convertir a centavos
        currency: paymentData.currency || 'usd',
        customer_email: paymentData.customerEmail,
        metadata: {
          invoice_id: `INV-${Date.now()}`,
          items_count: paymentData.items.length.toString(),
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  async confirmPayment(paymentIntentId: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        return {
          success: true,
          paymentIntent,
        };
      } else {
        return {
          success: false,
          error: `El pago no fue exitoso. Estado: ${paymentIntent.status}`,
        };
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  private async findOrCreateProduct(product: { id: string; nombre: string; precio: number }) {
    try {
      // Buscar producto existente por metadata
      const products = await this.stripe.products.list({
        limit: 100,
      });

      const existingProduct = products.data.find(
        (p) => p.metadata?.product_id === product.id
      );

      if (existingProduct) {
        return existingProduct;
      }

      // Crear nuevo producto si no existe
      const newProduct = await this.stripe.products.create({
        name: product.nombre,
        description: `Producto farmacéutico - ${product.nombre}`,
        metadata: {
          product_id: product.id,
        },
      });

      return newProduct;
    } catch (error) {
      console.error('Error finding/creating product:', error);
      throw error;
    }
  }

  // Método para simular otros tipos de pago
  async processPayment(paymentMethod: string, paymentData: PaymentData) {
    switch (paymentMethod) {
      case 'tarjeta':
        return await this.createPaymentIntent(paymentData);
      
      case 'transferencia':
        return {
          success: true,
          message: 'Instrucciones de transferencia enviadas por email',
          transferDetails: {
            bank: 'Banco Pichincha',
            account: '1234567890',
            reference: `INV-${Date.now()}`,
            amount: paymentData.total,
          },
        };
      
      case 'efectivo':
        return {
          success: true,
          message: 'Pago en efectivo confirmado',
          cashDetails: {
            amount: paymentData.total,
            reference: `INV-${Date.now()}`,
          },
        };
      
      case 'digital':
        return {
          success: true,
          message: 'Redirigiendo a PayPal...',
          redirectUrl: `https://paypal.com/checkout?amount=${paymentData.total}`,
        };
      
      case 'email_only':
        return {
          success: true,
          message: 'Factura generada para envío por email',
          emailDetails: {
            customerEmail: paymentData.customerEmail,
            total: paymentData.total,
            items: paymentData.items,
          },
        };
      
      default:
        return {
          success: false,
          error: 'Método de pago no válido',
        };
    }
  }
}

export const paymentService = new PaymentService();
