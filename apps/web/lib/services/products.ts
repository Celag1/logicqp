import { supabase } from '@/lib/supabase/client'

export interface Product {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  precio: number
  precio_compra: number
  marca: string
  categoria: string
  stock_disponible: number
  stock_minimo: number
  stock_maximo: number
  imagen_url?: string
  rating?: number
  reviews?: number
  activo: boolean
  created_at: string
  updated_at: string
}

export interface ProductFilters {
  search?: string
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  sortBy?: 'name' | 'price' | 'rating' | 'stock' | 'created_at'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface ProductStats {
  total: number
  inStock: number
  lowStock: number
  outOfStock: number
  categories: { name: string; count: number }[]
  brands: { name: string; count: number }[]
}

class ProductService {
  private table = 'productos'

  async getProducts(filters: ProductFilters = {}): Promise<Product[]> {
    try {
      console.log('📦 Obteniendo productos con filtros:', filters)
      
      let query = supabase
        .from(this.table)
        .select('*')
        .eq('activo', true)

      // Aplicar filtros
      if (filters.search) {
        query = query.or(`nombre.ilike.%${filters.search}%,descripcion.ilike.%${filters.search}%,codigo.ilike.%${filters.search}%`)
      }

      if (filters.category && filters.category !== 'Todas') {
        query = query.eq('categoria', filters.category)
      }

      if (filters.brand && filters.brand !== 'Todas') {
        query = query.eq('marca', filters.brand)
      }

      if (filters.minPrice !== undefined) {
        query = query.gte('precio', filters.minPrice)
      }

      if (filters.maxPrice !== undefined) {
        query = query.lte('precio', filters.maxPrice)
      }

      if (filters.inStock) {
        query = query.gt('stock_disponible', 0)
      }

      // Aplicar ordenamiento
      if (filters.sortBy) {
        const sortColumn = filters.sortBy === 'name' ? 'nombre' : filters.sortBy
        query = query.order(sortColumn, { ascending: filters.sortOrder === 'asc' })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      // Aplicar paginación
      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ Error obteniendo productos:', error)
        throw error
      }

      console.log(`✅ Productos obtenidos: ${data?.length || 0}`)
      return data || []
    } catch (error) {
      console.error('❌ Error en getProducts:', error)
      throw error
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      console.log('🔍 Obteniendo producto por ID:', id)
      
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq('id', id)
        .eq('activo', true)
        .single()

      if (error) {
        console.error('❌ Error obteniendo producto:', error)
        throw error
      }

      console.log('✅ Producto obtenido:', data?.nombre)
      return data
    } catch (error) {
      console.error('❌ Error en getProductById:', error)
      throw error
    }
  }

  async getProductByCode(codigo: string): Promise<Product | null> {
    try {
      console.log('🔍 Obteniendo producto por código:', codigo)
      
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq('codigo', codigo)
        .eq('activo', true)
        .single()

      if (error) {
        console.error('❌ Error obteniendo producto por código:', error)
        throw error
      }

      console.log('✅ Producto obtenido por código:', data?.nombre)
      return data
    } catch (error) {
      console.error('❌ Error en getProductByCode:', error)
      throw error
    }
  }

  async getProductStats(): Promise<ProductStats> {
    try {
      console.log('📊 Obteniendo estadísticas de productos')
      
      const { data, error } = await supabase
        .from(this.table)
        .select('categoria, marca, stock_disponible, activo')

      if (error) {
        console.error('❌ Error obteniendo estadísticas:', error)
        throw error
      }

      const activeProducts = data?.filter((p: Product) => p.activo) || []
      
      const stats: ProductStats = {
        total: activeProducts.length,
        inStock: activeProducts.filter((p: Product) => p.stock_disponible > 0).length,
        lowStock: activeProducts.filter((p: Product) => p.stock_disponible > 0 && p.stock_disponible < 10).length,
        outOfStock: activeProducts.filter((p: Product) => p.stock_disponible === 0).length,
        categories: this.groupBy(activeProducts, 'categoria'),
        brands: this.groupBy(activeProducts, 'marca')
      }

      console.log('✅ Estadísticas obtenidas:', stats)
      return stats
    } catch (error) {
      console.error('❌ Error en getProductStats:', error)
      throw error
    }
  }

  async getCategories(): Promise<string[]> {
    try {
      console.log('🏷️ Obteniendo categorías')
      
      const { data, error } = await supabase
        .from(this.table)
        .select('categoria')
        .eq('activo', true)

      if (error) {
        console.error('❌ Error obteniendo categorías:', error)
        throw error
      }

      const categories = [...new Set(data?.map((p: Product) => p.categoria) || [])]
      console.log('✅ Categorías obtenidas:', categories)
      return categories
    } catch (error) {
      console.error('❌ Error en getCategories:', error)
      throw error
    }
  }

  async getBrands(): Promise<string[]> {
    try {
      console.log('🏭 Obteniendo marcas')
      
      const { data, error } = await supabase
        .from(this.table)
        .select('marca')
        .eq('activo', true)

      if (error) {
        console.error('❌ Error obteniendo marcas:', error)
        throw error
      }

      const brands = [...new Set(data?.map((p: Product) => p.marca) || [])]
      console.log('✅ Marcas obtenidas:', brands)
      return brands
    } catch (error) {
      console.error('❌ Error en getBrands:', error)
      throw error
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    try {
      console.log('🔍 Buscando productos:', query)
      
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq('activo', true)
        .or(`nombre.ilike.%${query}%,descripcion.ilike.%${query}%,codigo.ilike.%${query}%`)
        .order('nombre')

      if (error) {
        console.error('❌ Error buscando productos:', error)
        throw error
      }

      console.log(`✅ Productos encontrados: ${data?.length || 0}`)
      return data || []
    } catch (error) {
      console.error('❌ Error en searchProducts:', error)
      throw error
    }
  }

  private groupBy<T>(array: T[], key: keyof T): { name: string; count: number }[] {
    const groups = array.reduce((acc, item) => {
      const value = String(item[key])
      acc[value] = (acc[value] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(groups)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }
}

export const productService = new ProductService()
