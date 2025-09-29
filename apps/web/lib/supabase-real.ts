import { createClient } from '@supabase/supabase-js'
import { config } from '@/lib/config'

const supabaseUrl = config.supabase.url
const supabaseKey = config.supabase.anonKey

export const supabase = createClient(supabaseUrl, supabaseKey)

// Función para obtener el perfil del usuario actual
export async function getCurrentProfile() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

// Función para obtener productos
export async function getProductos() {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('activo', true)
    .order('created_at', { ascending: false })

  return { data, error }
}

// Función para obtener categorías
export async function getCategorias() {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('activa', true)
    .order('nombre')

  return { data, error }
}

// Función para obtener inventario
export async function getInventario() {
  const { data, error } = await supabase
    .from('inventario')
    .select(`
      *,
      productos:producto_id (
        nombre,
        descripcion,
        precio,
        categoria,
        marca
      ),
      proveedores:proveedor_id (
        nombre,
        contacto
      )
    `)
    .order('created_at', { ascending: false })

  return { data, error }
}

// Función para obtener órdenes
export async function getOrdenes() {
  const { data, error } = await supabase
    .from('ordenes')
    .select(`
      *,
      profiles:cliente_id (
        nombre,
        apellido,
        email
      )
    `)
    .order('created_at', { ascending: false })

  return { data, error }
}

// Función para obtener ventas
export async function getVentas() {
  const { data, error } = await supabase
    .from('ventas')
    .select(`
      *,
      ordenes:orden_id (
        numero_orden,
        profiles:cliente_id (
          nombre,
          apellido
        )
      )
    `)
    .order('fecha_venta', { ascending: false })

  return { data, error }
}

// Función para obtener reportes
export async function getReportes() {
  const { data, error } = await supabase
    .from('reportes')
    .select('*')
    .eq('activo', true)
    .order('created_at', { ascending: false })

  return { data, error }
}

// Función para obtener configuración del sistema
export async function getConfiguracionSistema() {
  const { data, error } = await supabase
    .from('configuracion_sistema')
    .select('*')

  return { data, error }
}

// Función para obtener usuarios (perfiles)
export async function getUsuarios() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return { data, error }
}

// Función para crear un producto
export async function crearProducto(producto: any) {
  const { data, error } = await supabase
    .from('productos')
    .insert([producto])
    .select()

  return { data, error }
}

// Función para actualizar un producto
export async function actualizarProducto(id: number, producto: any) {
  const { data, error } = await supabase
    .from('productos')
    .update(producto)
    .eq('id', id)
    .select()

  return { data, error }
}

// Función para crear una orden
export async function crearOrden(orden: any) {
  const { data, error } = await supabase
    .from('ordenes')
    .insert([orden])
    .select()

  return { data, error }
}

// Función para crear items de orden
export async function crearOrdenItems(items: any[]) {
  const { data, error } = await supabase
    .from('orden_items')
    .insert(items)
    .select()

  return { data, error }
}

// Función para crear una venta
export async function crearVenta(venta: any) {
  const { data, error } = await supabase
    .from('ventas')
    .insert([venta])
    .select()

  return { data, error }
}

// Función para actualizar inventario
export async function actualizarInventario(id: number, inventario: any) {
  const { data, error } = await supabase
    .from('inventario')
    .update(inventario)
    .eq('id', id)
    .select()

  return { data, error }
}

// Función para obtener estadísticas
export async function getEstadisticas() {
  const [
    productosResult,
    ordenesResult,
    ventasResult,
    inventarioResult
  ] = await Promise.all([
    supabase.from('productos').select('id').eq('activo', true),
    supabase.from('ordenes').select('id, total'),
    supabase.from('ventas').select('total'),
    supabase.from('inventario').select('stock_actual, precio_compra')
  ])

  const totalProductos = productosResult.data?.length || 0
  const totalOrdenes = ordenesResult.data?.length || 0
  const totalVentas = ventasResult.data?.reduce((sum: number, venta: any) => sum + (venta.total || 0), 0) || 0
  const valorInventario = inventarioResult.data?.reduce((sum: number, item: any) => sum + (item.stock_actual * (item.precio_compra || 0)), 0) || 0

  return {
    totalProductos,
    totalOrdenes,
    totalVentas,
    valorInventario
  }
}
