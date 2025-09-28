import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase local real
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

// Crear cliente de Supabase con configuraciones optimizadas
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'logicqp-web'
    }
  },
  db: {
    schema: 'public'
  }
});

// Cliente admin para operaciones que requieren permisos elevados
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'logicqp-web-admin'
    }
  }
});

// Funciones optimizadas para consultas comunes
export const optimizedQueries = {
  // Obtener productos con información mínima necesaria
  getProductsMinimal: () => supabase
    .from('productos')
    .select(`
      id,
      codigo,
      nombre,
      precio,
      stock,
      stock_minimo,
      categorias(nombre)
    `)
    .order('nombre'),

  // Obtener productos con lotes para inventario
  getProductsWithLots: () => supabase
    .from('productos')
    .select(`
      id,
      codigo,
      nombre,
      precio,
      stock_minimo,
      categorias(nombre),
      lotes(
        id,
        numero_lote,
        cantidad_disponible,
        precio_compra,
        fecha_vencimiento
      )
    `)
    .order('nombre'),

  // Obtener ventas recientes
  getRecentSales: (limit = 10) => supabase
    .from('ventas')
    .select(`
      id,
      numero_venta,
      cliente_nombre,
      total,
      estado,
      fecha_venta
    `)
    .order('fecha_venta', { ascending: false })
    .limit(limit),

  // Obtener categorías
  getCategories: () => supabase
    .from('categorias')
    .select('id, nombre, descripcion')
    .order('nombre'),

  // Obtener métricas del dashboard
  getDashboardMetrics: async () => {
    const [productsResult, salesResult, categoriesResult] = await Promise.all([
      supabase
        .from('productos')
        .select('id, stock, stock_minimo, lotes(cantidad_disponible, precio_compra)'),
      supabase
        .from('ventas')
        .select('id, total, fecha_venta')
        .gte('fecha_venta', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      supabase
        .from('categorias')
        .select('id')
    ]);

    return {
      products: productsResult,
      sales: salesResult,
      categories: categoriesResult
    };
  }
};

// Función para limpiar cache de consultas
export const clearQueryCache = () => {
  // Esta función se puede usar para limpiar cualquier cache de consultas
  if (typeof window !== 'undefined') {
    // Limpiar localStorage si es necesario
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('supabase-query-')) {
        localStorage.removeItem(key);
      }
    });
  }
};

// Función para verificar la conexión
export const checkConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('categorias')
      .select('count')
      .limit(1);
    
    return { connected: !error, error };
  } catch (error) {
    return { connected: false, error };
  }
};
