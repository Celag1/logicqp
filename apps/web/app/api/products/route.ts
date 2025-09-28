import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/products - Obtener productos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const brand = searchParams.get('brand') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';

    let query = supabase
      .from('productos')
      .select(`
        *,
        categorias(nombre),
        proveedores(nombre)
      `)
      .eq('activo', true);

    // Aplicar filtros
    if (search) {
      query = query.or(`nombre.ilike.%${search}%,codigo.ilike.%${search}%,descripcion.ilike.%${search}%`);
    }

    if (category) {
      query = query.eq('categoria_id', category);
    }

    if (brand) {
      query = query.eq('marca', brand);
    }

    if (minPrice) {
      query = query.gte('precio_venta', parseFloat(minPrice));
    }

    if (maxPrice) {
      query = query.lte('precio_venta', parseFloat(maxPrice));
    }

    // Paginación
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .range(from, to)
      .order('nombre');

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
    }

    return NextResponse.json({
      products: data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in products API:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST /api/products - Crear producto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      codigo,
      nombre,
      descripcion,
      marca,
      categoria_id,
      proveedor_id,
      precio_compra,
      precio_venta,
      stock_minimo,
      stock_maximo,
      imagen_url,
      activo = true
    } = body;

    // Validaciones básicas
    if (!codigo || !nombre || !precio_venta) {
      return NextResponse.json(
        { error: 'Código, nombre y precio de venta son requeridos' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('productos')
      .insert({
        codigo,
        nombre,
        descripcion,
        marca,
        categoria_id,
        proveedor_id,
        precio_compra,
        precio_venta,
        stock_minimo,
        stock_maximo,
        imagen_url,
        activo,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 });
    }

    return NextResponse.json({ product: data }, { status: 201 });

  } catch (error) {
    console.error('Error in products POST API:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
