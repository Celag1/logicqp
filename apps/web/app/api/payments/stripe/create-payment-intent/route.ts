import { NextRequest, NextResponse } from 'next/server';

// Simulación de Stripe (en producción usarías el SDK real)
const stripe = {
  paymentIntents: {
    create: async (params: any) => {
      // Simular creación de payment intent
      return {
        id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
        status: 'requires_payment_method'
      };
    }
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency, orderId, customerEmail, customerName, description } = body;

    // Validar datos requeridos
    if (!amount || !currency || !orderId) {
      return NextResponse.json(
        { error: 'Datos requeridos faltantes' },
        { status: 400 }
      );
    }

    // Crear payment intent con Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convertir a centavos
      currency: currency.toLowerCase(),
      metadata: {
        orderId,
        customerEmail,
        customerName,
        description
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('✅ Payment Intent creado:', paymentIntent.id);

    return NextResponse.json({
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/stripe?payment_intent=${paymentIntent.id}`
    });

  } catch (error) {
    console.error('❌ Error creando Payment Intent:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}




