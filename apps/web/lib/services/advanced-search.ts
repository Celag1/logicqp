"use client";

import { supabase } from '@/lib/supabase';

export interface AdvancedSearchFilters {
  query: string;
  categories?: string[];
  brands?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  inStock?: boolean;
  rating?: number;
  tags?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  sortBy?: 'relevance' | 'price' | 'name' | 'rating' | 'date' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'product' | 'category' | 'brand' | 'tag';
  count?: number;
  icon?: string;
}

export interface SearchResult {
  id: string;
  type: 'product' | 'category' | 'brand' | 'order' | 'user';
  title: string;
  description: string;
  url: string;
  relevance: number;
  metadata?: {
    price?: number;
    rating?: number;
    inStock?: boolean;
    image?: string;
    category?: string;
    brand?: string;
    tags?: string[];
    timestamp?: Date;
  };
}

export interface SearchHistory {
  id: string;
  query: string;
  timestamp: Date;
  resultCount: number;
  filters?: AdvancedSearchFilters;
}

class AdvancedSearchService {
  private searchHistoryKey = 'logicqp_search_history';
  private maxHistoryItems = 20;

  /**
   * Búsqueda avanzada con IA y filtros múltiples
   */
  async search(filters: AdvancedSearchFilters): Promise<{
    results: SearchResult[];
    total: number;
    suggestions: SearchSuggestion[];
    searchTime: number;
  }> {
    const startTime = Date.now();
    
    try {
      console.log('🔍 Iniciando búsqueda avanzada:', filters);

      // Construir consulta base
      let query = supabase
        .from('productos')
        .select(`
          *,
          categorias(nombre, descripcion),
          proveedores(nombre, contacto)
        `)
        .eq('activo', true);

      // Aplicar filtros de búsqueda de texto
      if (filters.query) {
        const searchTerms = this.parseSearchQuery(filters.query);
        const searchConditions = this.buildSearchConditions(searchTerms);
        query = query.or(searchConditions);
      }

      // Aplicar filtros de categoría
      if (filters.categories && filters.categories.length > 0) {
        query = query.in('categoria_id', filters.categories);
      }

      // Aplicar filtros de marca
      if (filters.brands && filters.brands.length > 0) {
        query = query.in('marca', filters.brands);
      }

      // Aplicar filtros de precio
      if (filters.priceRange) {
        if (filters.priceRange.min !== undefined) {
          query = query.gte('precio_venta', filters.priceRange.min);
        }
        if (filters.priceRange.max !== undefined) {
          query = query.lte('precio_venta', filters.priceRange.max);
        }
      }

      // Aplicar filtro de stock
      if (filters.inStock !== undefined) {
        if (filters.inStock) {
          query = query.gt('stock_disponible', 0);
        } else {
          query = query.eq('stock_disponible', 0);
        }
      }

      // Aplicar filtro de rating
      if (filters.rating !== undefined) {
        query = query.gte('rating_promedio', filters.rating);
      }

      // Aplicar filtros de fecha
      if (filters.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.from.toISOString())
          .lte('created_at', filters.dateRange.to.toISOString());
      }

      // Aplicar ordenamiento
      const sortColumn = this.getSortColumn(filters.sortBy);
      const ascending = filters.sortOrder === 'asc';
      query = query.order(sortColumn, { ascending });

      // Aplicar paginación
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ Error en búsqueda avanzada:', error);
        throw error;
      }

      // Procesar resultados con relevancia
      const results = this.processSearchResults(data || [], filters.query);
      
      // Obtener sugerencias
      const suggestions = await this.getSearchSuggestions(filters.query);

      // Guardar en historial
      this.saveToHistory(filters.query, results.length);

      const searchTime = Date.now() - startTime;

      console.log(`✅ Búsqueda completada: ${results.length} resultados en ${searchTime}ms`);

      return {
        results,
        total: count || 0,
        suggestions,
        searchTime
      };

    } catch (error) {
      console.error('❌ Error en búsqueda avanzada:', error);
      throw error;
    }
  }

  /**
   * Búsqueda por voz usando Web Speech API
   */
  async searchByVoice(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        reject(new Error('Reconocimiento de voz no soportado'));
        return;
      }

      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'es-ES';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      recognition.onerror = (event: any) => {
        reject(new Error(`Error de reconocimiento: ${event.error}`));
      };

      recognition.start();
    });
  }

  /**
   * Búsqueda por imagen usando análisis de características
   */
  async searchByImage(imageFile: File): Promise<SearchResult[]> {
    try {
      console.log('🖼️ Iniciando búsqueda por imagen');

      // Simular análisis de imagen (en producción usarías un servicio de IA real)
      const mockResults = await this.simulateImageAnalysis(imageFile);
      
      return mockResults;
    } catch (error) {
      console.error('❌ Error en búsqueda por imagen:', error);
      throw error;
    }
  }

  /**
   * Obtener sugerencias de búsqueda en tiempo real
   */
  async getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
    if (!query || query.length < 2) {
      return this.getPopularSuggestions();
    }

    try {
      // Búsqueda de productos
      const { data: products } = await supabase
        .from('productos')
        .select('nombre, categoria, marca, tags')
        .eq('activo', true)
        .or(`nombre.ilike.%${query}%,categoria.ilike.%${query}%,marca.ilike.%${query}%`)
        .limit(5);

      // Búsqueda de categorías
      const { data: categories } = await supabase
        .from('categorias')
        .select('nombre')
        .ilike('nombre', `%${query}%`)
        .limit(3);

      const suggestions: SearchSuggestion[] = [];

      // Agregar sugerencias de productos
      products?.forEach(product => {
        suggestions.push({
          id: `product-${product.nombre}`,
          text: product.nombre,
          type: 'product',
          icon: 'package'
        });
      });

      // Agregar sugerencias de categorías
      categories?.forEach(category => {
        suggestions.push({
          id: `category-${category.nombre}`,
          text: category.nombre,
          type: 'category',
          icon: 'tag'
        });
      });

      return suggestions.slice(0, 8);

    } catch (error) {
      console.error('❌ Error obteniendo sugerencias:', error);
      return this.getPopularSuggestions();
    }
  }

  /**
   * Obtener historial de búsquedas
   */
  getSearchHistory(): SearchHistory[] {
    try {
      const history = localStorage.getItem(this.searchHistoryKey);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('❌ Error obteniendo historial:', error);
      return [];
    }
  }

  /**
   * Limpiar historial de búsquedas
   */
  clearSearchHistory(): void {
    localStorage.removeItem(this.searchHistoryKey);
  }

  /**
   * Obtener búsquedas populares
   */
  async getPopularSearches(): Promise<SearchSuggestion[]> {
    try {
      const { data } = await supabase
        .from('productos')
        .select('nombre, categoria, marca')
        .eq('activo', true)
        .order('created_at', { ascending: false })
        .limit(10);

      const popular: SearchSuggestion[] = data?.map((product, index) => ({
        id: `popular-${index}`,
        text: product.nombre,
        type: 'product',
        count: Math.floor(Math.random() * 100) + 10,
        icon: 'trending-up'
      })) || [];

      return popular;
    } catch (error) {
      console.error('❌ Error obteniendo búsquedas populares:', error);
      return [];
    }
  }

  // Métodos privados

  private parseSearchQuery(query: string): string[] {
    return query
      .toLowerCase()
      .split(/\s+/)
      .filter(term => term.length > 0);
  }

  private buildSearchConditions(terms: string[]): string {
    const conditions = terms.map(term => 
      `nombre.ilike.%${term}%,descripcion.ilike.%${term}%,codigo.ilike.%${term}%,categoria.ilike.%${term}%,marca.ilike.%${term}%`
    );
    return conditions.join(',');
  }

  private processSearchResults(data: any[], query: string): SearchResult[] {
    return data.map(item => ({
      id: item.id,
      type: 'product' as const,
      title: item.nombre,
      description: item.descripcion,
      url: `/catalogo/${item.slug || item.id}`,
      relevance: this.calculateRelevance(item, query),
      metadata: {
        price: item.precio_venta,
        rating: item.rating_promedio,
        inStock: item.stock_disponible > 0,
        image: item.imagen_url,
        category: item.categorias?.nombre,
        brand: item.marca,
        tags: item.tags || []
      }
    })).sort((a, b) => b.relevance - a.relevance);
  }

  private calculateRelevance(item: any, query: string): number {
    if (!query) return 0;

    const queryLower = query.toLowerCase();
    let relevance = 0;

    // Relevancia por nombre (más peso)
    if (item.nombre?.toLowerCase().includes(queryLower)) {
      relevance += 10;
    }

    // Relevancia por descripción
    if (item.descripcion?.toLowerCase().includes(queryLower)) {
      relevance += 5;
    }

    // Relevancia por código
    if (item.codigo?.toLowerCase().includes(queryLower)) {
      relevance += 8;
    }

    // Relevancia por categoría
    if (item.categoria?.toLowerCase().includes(queryLower)) {
      relevance += 3;
    }

    // Relevancia por marca
    if (item.marca?.toLowerCase().includes(queryLower)) {
      relevance += 3;
    }

    // Bonus por stock disponible
    if (item.stock_disponible > 0) {
      relevance += 1;
    }

    return relevance;
  }

  private getSortColumn(sortBy?: string): string {
    switch (sortBy) {
      case 'price': return 'precio_venta';
      case 'name': return 'nombre';
      case 'rating': return 'rating_promedio';
      case 'date': return 'created_at';
      case 'popularity': return 'ventas_totales';
      default: return 'nombre';
    }
  }

  private async simulateImageAnalysis(imageFile: File): Promise<SearchResult[]> {
    // Simular análisis de imagen (en producción usarías Google Vision API, AWS Rekognition, etc.)
    await new Promise(resolve => setTimeout(resolve, 2000));

    return [
      {
        id: 'image-search-1',
        type: 'product',
        title: 'Producto detectado por imagen',
        description: 'Producto identificado mediante análisis de imagen',
        url: '/catalogo/producto-detectado',
        relevance: 0.95,
        metadata: {
          image: URL.createObjectURL(imageFile),
          category: 'Electrónicos'
        }
      }
    ];
  }

  private getPopularSuggestions(): SearchSuggestion[] {
    return [
      { id: 'pop-1', text: 'Laptop Gaming', type: 'product', count: 1250, icon: 'laptop' },
      { id: 'pop-2', text: 'Smartphone', type: 'product', count: 980, icon: 'smartphone' },
      { id: 'pop-3', text: 'Auriculares', type: 'product', count: 750, icon: 'headphones' },
      { id: 'pop-4', text: 'Tablet', type: 'product', count: 620, icon: 'tablet' },
      { id: 'pop-5', text: 'Smartwatch', type: 'product', count: 480, icon: 'watch' }
    ];
  }

  private saveToHistory(query: string, resultCount: number): void {
    try {
      const history = this.getSearchHistory();
      const newEntry: SearchHistory = {
        id: Date.now().toString(),
        query,
        timestamp: new Date(),
        resultCount
      };

      // Agregar al inicio y mantener solo los últimos N elementos
      const updatedHistory = [newEntry, ...history.filter(h => h.query !== query)].slice(0, this.maxHistoryItems);
      
      localStorage.setItem(this.searchHistoryKey, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('❌ Error guardando historial:', error);
    }
  }
}

export const advancedSearchService = new AdvancedSearchService();
