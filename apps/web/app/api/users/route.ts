import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/users - Obtener usuarios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';

    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (search) {
      query = query.or(`nombre.ilike.%${search}%,apellido.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (role) {
      query = query.eq('rol', role);
    }

    if (status) {
      query = query.eq('estado', status);
    }

    // Paginación
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
    }

    return NextResponse.json({
      users: data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in users API:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST /api/users - Crear usuario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      nombre,
      apellido,
      telefono,
      direccion,
      empresa,
      rol = 'cliente'
    } = body;

    // Validaciones básicas
    if (!email || !password || !nombre || !apellido) {
      return NextResponse.json(
        { error: 'Email, contraseña, nombre y apellido son requeridos' },
        { status: 400 }
      );
    }

    // Crear usuario en auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        nombre,
        apellido
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 });
    }

    // Crear perfil en profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        nombre,
        apellido,
        telefono,
        direccion,
        empresa,
        rol,
        estado: 'activo',
        email_verificado: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error creating profile:', profileError);
      return NextResponse.json({ error: 'Error al crear perfil' }, { status: 500 });
    }

    return NextResponse.json({ user: profileData }, { status: 201 });

  } catch (error) {
    console.error('Error in users POST API:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
