import { NextRequest, NextResponse } from 'next/server';

// Simulación de PayPal (en producción usarías el SDK real)
const paypal = {
  orders: {
    create: async (params: any) => {
      // Simular creación de orden PayPal
      return {
        id: `PAYPAL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'CREATED',
        links: [
          {
            href: `https://www.sandbox.paypal.com/checkoutnow?token=${Date.now()}`,
            rel: 'approve',
            method: 'GET'
          }
        ]
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

    // Crear orden con PayPal
    const order = await paypal.orders.create({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: orderId,
          amount: {
            currency_code: currency.toUpperCase(),
            value: amount.toString()
          },
          description: description,
          custom_id: orderId,
          soft_descriptor: 'LogicQP Store'
        }
      ],
      payer: {
        email_address: customerEmail,
        name: {
          given_name: customerName.split(' ')[0],
          surname: customerName.split(' ').slice(1).join(' ')
        }
      },
      application_context: {
        brand_name: 'LogicQP',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/paypal/success?order=${orderId}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/paypal/cancel?order=${orderId}`
      }
    });

    console.log('✅ Orden PayPal creada:', order.id);

    // Encontrar el link de aprobación
    const approvalLink = order.links?.find((link: any) => link.rel === 'approve');

    return NextResponse.json({
      orderId: order.id,
      status: order.status,
      approvalUrl: approvalLink?.href,
      redirectUrl: approvalLink?.href
    });

  } catch (error) {
    console.error('❌ Error creando orden PayPal:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}




