import { NextRequest, NextResponse } from 'next/server';

// Simulación de MercadoPago (en producción usarías el SDK real)
const mercadopago = {
  preferences: {
    create: async (params: any) => {
      // Simular creación de preferencia MercadoPago
      return {
        id: `MP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        init_point: `https://www.mercadopago.com.ec/checkout/v1/redirect?pref_id=${Date.now()}`,
        sandbox_init_point: `https://sandbox.mercadopago.com.ec/checkout/v1/redirect?pref_id=${Date.now()}`,
        status: 'pending'
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

    // Crear preferencia con MercadoPago
    const preference = await mercadopago.preferences.create({
      items: [
        {
          id: orderId,
          title: description,
          description: `Orden ${orderId}`,
          quantity: 1,
          unit_price: amount,
          currency_id: currency.toUpperCase()
        }
      ],
      payer: {
        email: customerEmail,
        name: customerName
      },
      external_reference: orderId,
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/mercadopago/webhook`,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/mercadopago/success?order=${orderId}`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/mercadopago/failure?order=${orderId}`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/mercadopago/pending?order=${orderId}`
      },
      auto_return: 'approved',
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12
      }
    });

    console.log('✅ Preferencia MercadoPago creada:', preference.id);

    const initPoint = process.env.NODE_ENV === 'production' 
      ? preference.init_point 
      : preference.sandbox_init_point;

    return NextResponse.json({
      preferenceId: preference.id,
      status: preference.status,
      initPoint: initPoint,
      redirectUrl: initPoint
    });

  } catch (error) {
    console.error('❌ Error creando preferencia MercadoPago:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}




