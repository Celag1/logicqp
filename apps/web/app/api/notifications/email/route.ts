import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, text } = await request.json();

    console.log('📧 API Email - Enviando email a:', to);
    console.log('📧 API Email - Asunto:', subject);

    // En un entorno de producción, aquí integrarías con un servicio real como:
    // - SendGrid
    // - Resend
    // - AWS SES
    // - Nodemailer con SMTP

    // Simulación de envío de email
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simular éxito del envío
    const success = Math.random() > 0.1; // 90% de éxito simulado

    if (success) {
      console.log('✅ API Email - Email enviado exitosamente');
      
      // En producción, aquí guardarías el log en la base de datos
      console.log('📝 API Email - Log guardado:', {
        to,
        subject,
        timestamp: new Date().toISOString(),
        status: 'sent'
      });

      return NextResponse.json({
        success: true,
        message: 'Email enviado exitosamente',
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
    } else {
      console.log('❌ API Email - Error simulado en el envío');
      
      return NextResponse.json({
        success: false,
        message: 'Error al enviar email (simulado)',
        error: 'SMTP_ERROR'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ API Email - Error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
