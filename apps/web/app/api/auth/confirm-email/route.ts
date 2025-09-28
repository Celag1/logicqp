import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { emailConfirmationService } from '@/lib/email-confirmation-service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, userName } = await request.json();

    if (!email || !userName) {
      return NextResponse.json(
        { success: false, error: 'Email y nombre de usuario son requeridos' },
        { status: 400 }
      );
    }

    // Generar URL de confirmación
    const confirmationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm?email=${encodeURIComponent(email)}&token=confirm`;

    // Enviar email de confirmación
    const emailSent = await emailConfirmationService.sendConfirmationEmail({
      email,
      confirmationUrl,
      userName
    });

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: 'Email de confirmación enviado exitosamente',
        confirmationUrl
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Error enviando email de confirmación' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error en confirm-email API:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { email, action } = await request.json();

    if (!email || action !== 'confirm') {
      return NextResponse.json(
        { success: false, error: 'Email y acción son requeridos' },
        { status: 400 }
      );
    }

    // Actualizar el perfil para marcar email como verificado
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        email_verificado: true,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select();

    if (error) {
      console.error('Error actualizando perfil:', error);
      return NextResponse.json(
        { success: false, error: 'Error confirmando email' },
        { status: 500 }
      );
    }

    if (data && data.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Email confirmado exitosamente',
        profile: data[0]
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Error en confirm-email PUT API:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}