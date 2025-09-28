import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/auth/register - Registrar usuario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, nombre, apellido, telefono, empresa } = body;

    if (!email || !password || !nombre || !apellido) {
      return NextResponse.json(
        { error: 'Email, contraseña, nombre y apellido son requeridos' },
        { status: 400 }
      );
    }

    // Validar contraseña
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }

    // Registrar usuario
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          apellido,
          telefono,
          empresa
        }
      }
    });

    if (authError) {
      console.error('Registration error:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Error al crear usuario' },
        { status: 500 }
      );
    }

    // Crear perfil en la tabla profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        nombre,
        apellido,
        telefono,
        empresa,
        rol: 'cliente',
        estado: 'activo',
        email_verificado: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // No retornar error aquí ya que el usuario ya fue creado en auth
    }

    return NextResponse.json({
      message: 'Usuario registrado exitosamente. Verifica tu email para activar tu cuenta.',
      user: authData.user,
      profile: profile || null
    });

  } catch (error) {
    console.error('Error in register API:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
