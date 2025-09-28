import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/orders - Obtener órdenes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const userId = searchParams.get('userId') || '';
    const status = searchParams.get('status') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';

    let query = supabase
      .from('ordenes')
      .select(`
        *,
        clientes(nombre, apellido, email),
        orden_items(
          *,
          productos(nombre, precio_venta)
        )
      `)
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (userId) {
      query = query.eq('cliente_id', userId);
    }

    if (status) {
      query = query.eq('estado', status);
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    // Paginación
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({ error: 'Error al obtener órdenes' }, { status: 500 });
    }

    return NextResponse.json({
      orders: data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in orders API:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST /api/orders - Crear orden
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      cliente_id,
      items,
      metodo_pago,
      direccion_entrega,
      notas,
      descuento = 0
    } = body;

    // Validaciones básicas
    if (!cliente_id || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Cliente ID y items son requeridos' },
        { status: 400 }
      );
    }

    // Calcular totales
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.precio * item.cantidad;
    }
    const total = subtotal - descuento;

    // Crear orden
    const { data: orderData, error: orderError } = await supabase
      .from('ordenes')
      .insert({
        cliente_id,
        subtotal,
        descuento,
        total,
        metodo_pago,
        direccion_entrega,
        notas,
        estado: 'pendiente',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json({ error: 'Error al crear orden' }, { status: 500 });
    }

    // Crear items de la orden
    const orderItems = items.map(item => ({
      orden_id: orderData.id,
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio: item.precio,
      subtotal: item.precio * item.cantidad
    }));

    const { error: itemsError } = await supabase
      .from('orden_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Rollback: eliminar la orden creada
      await supabase.from('ordenes').delete().eq('id', orderData.id);
      return NextResponse.json({ error: 'Error al crear items de la orden' }, { status: 500 });
    }

    // Actualizar stock de productos
    for (const item of items) {
      const { error: stockError } = await supabase.rpc('decrementar_stock', {
        producto_id: item.producto_id,
        cantidad: item.cantidad
      });

      if (stockError) {
        console.error('Error updating stock:', stockError);
        // No hacer rollback aquí, solo loggear el error
      }
    }

    return NextResponse.json({ order: orderData }, { status: 201 });

  } catch (error) {
    console.error('Error in orders POST API:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
