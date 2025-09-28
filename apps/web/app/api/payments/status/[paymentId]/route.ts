import { NextRequest, NextResponse } from 'next/server';

// Simulación de verificación de estado de pago
const paymentStatuses: Record<string, any> = {};

export async function GET(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    const { paymentId } = params;

    if (!paymentId) {
      return NextResponse.json(
        { error: 'ID de pago requerido' },
        { status: 400 }
      );
    }

    // Simular verificación de estado
    // En producción esto consultaría la pasarela de pago correspondiente
    let status = paymentStatuses[paymentId];

    if (!status) {
      // Simular estado inicial
      status = {
        success: false,
        status: 'pending',
        timestamp: new Date().toISOString()
      };
      paymentStatuses[paymentId] = status;
    }

    // Simular progreso del pago
    if (status.status === 'pending') {
      const timeElapsed = Date.now() - new Date(status.timestamp).getTime();
      
      if (timeElapsed > 10000) { // 10 segundos
        status.status = 'completed';
        status.success = true;
        status.transactionId = `TXN_${Date.now()}`;
      }
    }

    console.log('🔍 Estado del pago:', { paymentId, status });

    return NextResponse.json({
      success: status.success,
      paymentId,
      status: status.status,
      transactionId: status.transactionId,
      timestamp: status.timestamp
    });

  } catch (error) {
    console.error('❌ Error verificando estado del pago:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}




