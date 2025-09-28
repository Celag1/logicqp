import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/payment-service';
import { emailService } from '@/lib/email-service';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      paymentMethod, 
      items, 
      customerEmail, 
      customerName,
      customerPhone,
      shippingAddress,
      shippingCity,
      shippingNotes,
      userId,
      total 
    } = body;

    // Procesar el pago
    const paymentResult = await paymentService.processPayment(paymentMethod, {
      items,
      customerEmail,
      total,
    });

    if (!paymentResult.success) {
      return NextResponse.json(
        { success: false, error: 'error' in paymentResult ? paymentResult.error : 'Error desconocido en el procesamiento del pago' },
        { status: 400 }
      );
    }

    // Si es pago con tarjeta, devolver el clientSecret para Stripe
    if (paymentMethod === 'tarjeta' && 'clientSecret' in paymentResult) {
      return NextResponse.json({
        success: true,
        clientSecret: paymentResult.clientSecret,
        paymentIntentId: paymentResult.paymentIntentId,
      });
    }

    // Generar número de venta único
    const numeroVenta = `VEN-${Date.now()}`;
    
    // Para otros métodos de pago, generar factura y enviar email
    const invoiceData = {
      id: numeroVenta,
      date: new Date().toLocaleDateString('es-ES'),
      time: new Date().toLocaleTimeString('es-ES'),
      paymentMethod,
      customerEmail,
      customerName,
      customerPhone,
      shippingAddress,
      shippingCity,
      shippingNotes,
      items,
      subtotal: total,
      tax: total * 0.15,
      total: total * 1.12,
    };
    
    // Buscar el perfil del cliente si existe
    let clienteProfile = null;
    if (userId) {
      // Si tenemos userId, buscar por ID
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, nombre, apellido, telefono, email')
        .eq('id', userId)
        .single();
      clienteProfile = profileData;
    } else if (customerEmail) {
      // Si no tenemos userId, buscar por email
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, nombre, apellido, telefono, email')
        .eq('email', customerEmail)
        .single();
      clienteProfile = profileData;
    }

    // Guardar la venta en la base de datos
    const { data: ventaData, error: ventaError } = await supabase
      .from('ventas')
      .insert({
        numero_venta: numeroVenta,
        cliente_nombre: customerName || (clienteProfile ? `${clienteProfile.nombre || ''} ${clienteProfile.apellido || ''}`.trim() : 'Cliente Online'),
        cliente_telefono: customerPhone || clienteProfile?.telefono || 'No especificado',
        cliente_email: customerEmail,
        vendedor_id: null, // Venta online, sin vendedor específico
        vendedor_nombre: 'Sistema Online',
        total: total * 1.15,
        subtotal: total,
        impuestos: total * 0.15,
        descuento: 0,
        metodo_pago: paymentMethod,
        estado: 'completada'
      })
      .select()
      .single();

    if (ventaError) {
      console.error('Error guardando venta en BD:', ventaError);
      // No fallar la compra por error de BD, solo logear
    } else {
      // Guardar los items de la venta        
      const ventaItems = items.map((item: any) => ({
        venta_id: ventaData.id,
        producto_id: item.product.id,
        producto_nombre: item.product.nombre,
        cantidad: item.quantity,
        precio_unitario: item.product.precio,
        subtotal: item.quantity * item.product.precio
      }));

      const { error: itemsError } = await supabase
        .from('venta_items')
        .insert(ventaItems);

      if (itemsError) {
        console.error('Error guardando items de venta:', itemsError);
      } else {
        console.log('✅ Venta guardada exitosamente en BD:', numeroVenta);
      }
    }


    // Enviar factura por email
    const emailSent = await emailService.sendInvoice(invoiceData);

    return NextResponse.json({
      success: true,
      invoiceData,
      emailSent,
      message: 'message' in paymentResult ? paymentResult.message : 'Pago procesado exitosamente',
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId, items, customerEmail, total } = body;

    // Confirmar pago con Stripe
    const confirmationResult = await paymentService.confirmPayment(paymentIntentId);

    if (!confirmationResult.success) {
      return NextResponse.json(
        { success: false, error: confirmationResult.error },
        { status: 400 }
      );
    }

    // Generar factura
    const invoiceData = {
      id: `INV-${Date.now()}`,
      date: new Date().toLocaleDateString('es-ES'),
      time: new Date().toLocaleTimeString('es-ES'),
      paymentMethod: 'tarjeta',
      customerEmail,
      items,
      subtotal: total,
      tax: total * 0.15,
      total: total * 1.12,
    };

    // Enviar factura por email
    const emailSent = await emailService.sendInvoice(invoiceData);

    return NextResponse.json({
      success: true,
      invoiceData,
      emailSent,
      message: 'Pago con tarjeta confirmado exitosamente',
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
