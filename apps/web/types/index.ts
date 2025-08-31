export type RolType = 'super_admin' | 'administrador' | 'vendedor' | 'inventario' | 'contable' | 'cliente'

export interface Profile {
  id: string
  email: string
  nombre: string
  rol: RolType
  email_verified: boolean
  created_at: string
  updated_at: string
}

export interface Categoria {
  id: string
  nombre: string
  descripcion?: string
  created_at: string
}

export interface Producto {
  id: string
  nombre: string
  descripcion?: string
  sku: string
  barcode: string
  marca: string
  categoria_id: string
  precio: number
  stock_minimo: number
  imagen_url?: string
  imagen_hash?: string
  origen?: string
  licencia?: string
  created_at: string
  updated_at: string
  categoria?: Categoria
}

export interface Lote {
  id: string
  producto_id: string
  numero_lote: string
  fecha_fabricacion: string
  fecha_vencimiento: string
  cantidad: number
  precio_compra: number
  proveedor_id: string
  created_at: string
  producto?: Producto
  proveedor?: Proveedor
}

export interface Proveedor {
  id: string
  nombre: string
  ruc: string
  direccion?: string
  telefono?: string
  email?: string
  created_at: string
}

export interface Compra {
  id: string
  proveedor_id: string
  fecha: string
  total: number
  estado: 'pendiente' | 'recibida' | 'cancelada'
  created_at: string
  proveedor?: Proveedor
  items?: CompraItem[]
}

export interface CompraItem {
  id: string
  compra_id: string
  producto_id: string
  cantidad: number
  precio_unitario: number
  lote_id?: string
  producto?: Producto
}

export interface MovimientoStock {
  id: string
  tipo: 'entrada' | 'salida' | 'ajuste'
  producto_id: string
  lote_id?: string
  cantidad: number
  motivo: string
  referencia_id?: string
  referencia_tipo?: string
  created_at: string
  producto?: Producto
  lote?: Lote
}

export interface Cliente {
  id: string
  profile_id: string
  direccion: string
  telefono?: string
  created_at: string
  profile?: Profile
}

export interface Orden {
  id: string
  cliente_id: string
  total: number
  estado: 'pendiente' | 'confirmada' | 'enviada' | 'entregada' | 'cancelada'
  metodo_pago: string
  direccion_envio: string
  created_at: string
  cliente?: Cliente
  items?: OrdenItem[]
}

export interface OrdenItem {
  id: string
  orden_id: string
  producto_id: string
  cantidad: number
  precio_unitario: number
  producto?: Producto
}

export interface Carrito {
  id: string
  profile_id: string
  created_at: string
  items?: CarritoItem[]
}

export interface CarritoItem {
  id: string
  carrito_id: string
  producto_id: string
  cantidad: number
  producto?: Producto
}

export interface Pago {
  id: string
  orden_id: string
  monto: number
  metodo: string
  estado: 'pendiente' | 'completado' | 'fallido'
  referencia?: string
  created_at: string
}

export interface Envio {
  id: string
  orden_id: string
  tracking_number?: string
  estado: 'preparando' | 'enviado' | 'entregado'
  fecha_envio?: string
  fecha_entrega?: string
  created_at: string
}

export interface Auditoria {
  id: string
  tabla: string
  accion: string
  registro_id: string
  cambios: any
  actor_profile_id: string
  creado_en: string
  actor?: Profile
}

export interface Permiso {
  id: string
  rol: RolType
  modulo: string
  puede_leer: boolean
  puede_crear: boolean
  puede_editar: boolean
  puede_borrar: boolean
}

export interface EmpresaConfig {
  id: string
  nombre_comercial: string
  ruc: string
  direccion: string
  telefonos: string[]
  logo_url?: string
  politicas: any
  created_at: string
  updated_at: string
}

export interface DashboardMetrics {
  ventas_mensuales: number
  productos_vendidos: number
  stock_critico: number
  rotacion_promedio: number
  top_productos: Array<{
    producto_id: string
    nombre: string
    cantidad_vendida: number
    total_ventas: number
  }>
  ventas_por_categoria: Array<{
    categoria: string
    total: number
  }>
}

export interface Product {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  precio_compra: number;
  categoria_id: string;
  proveedor_id: string;
  stock_minimo: number;
  stock_maximo: number;
  marca: string;
  imagen_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  nombre: string;
  descripcion: string;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  nombre: string;
  ruc: string;
  direccion: string;
  telefono: string;
  email: string;
  contacto: string;
  created_at: string;
  updated_at: string;
}

export interface Lot {
  id: string;
  producto_id: string;
  numero_lote: string;
  fecha_fabricacion: string;
  fecha_vencimiento: string;
  cantidad_inicial: number;
  cantidad_disponible: number;
  precio_compra: number;
  proveedor_id: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  cliente_id: string;
  total: number;
  estado: 'pendiente' | 'confirmada' | 'en_proceso' | 'enviada' | 'entregada' | 'cancelada';
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'paypal';
  direccion_envio: string;
  telefono: string;
  notas?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  orden_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'super_admin' | 'administrador' | 'vendedor' | 'inventario' | 'contable' | 'cliente';
  email_verificado: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardMetric {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}
