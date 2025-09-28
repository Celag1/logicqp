"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { advancedSearchService, AdvancedSearchFilters, SearchResult, SearchSuggestion } from '@/lib/services/advanced-search';

interface UseAdvancedSearchOptions {
  debounceMs?: number;
  autoSearch?: boolean;
  initialFilters?: Partial<AdvancedSearchFilters>;
}

interface UseAdvancedSearchReturn {
  // Estado de búsqueda
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  suggestions: SearchSuggestion[];
  isSearching: boolean;
  searchTime: number;
  totalResults: number;
  
  // Filtros
  filters: AdvancedSearchFilters;
  setFilters: (filters: AdvancedSearchFilters) => void;
  updateFilter: <K extends keyof AdvancedSearchFilters>(
    key: K, 
    value: AdvancedSearchFilters[K]
  ) => void;
  
  // Acciones
  search: (customQuery?: string) => Promise<void>;
  clearSearch: () => void;
  getSuggestions: (query: string) => Promise<void>;
  
  // Búsqueda por voz
  isListening: boolean;
  startVoiceSearch: () => Promise<void>;
  stopVoiceSearch: () => void;
  
  // Búsqueda por imagen
  searchByImage: (file: File) => Promise<void>;
  
  // Historial
  history: any[];
  clearHistory: () => void;
  
  // Estado de error
  error: string | null;
  clearError: () => void;
}

export function useAdvancedSearch(options: UseAdvancedSearchOptions = {}): UseAdvancedSearchReturn {
  const {
    debounceMs = 300,
    autoSearch = true,
    initialFilters = {}
  } = options;

  // Estado principal
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [filters, setFilters] = useState<AdvancedSearchFilters>({
    query: '',
    sortBy: 'relevance',
    sortOrder: 'desc',
    limit: 20,
    ...initialFilters
  });
  
  // Búsqueda por voz
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  // Historial
  const [history, setHistory] = useState<any[]>([]);
  
  // Refs para debouncing
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const searchAbortControllerRef = useRef<AbortController>();

  // Cargar historial al inicializar
  useEffect(() => {
    const loadHistory = () => {
      try {
        const savedHistory = advancedSearchService.getSearchHistory();
        setHistory(savedHistory);
      } catch (error) {
        console.error('Error cargando historial:', error);
      }
    };
    
    loadHistory();
  }, []);

  // Búsqueda automática con debouncing
  useEffect(() => {
    if (!autoSearch || !query.trim()) {
      setResults([]);
      setSuggestions([]);
      return;
    }

    // Cancelar búsqueda anterior
    if (searchAbortControllerRef.current) {
      searchAbortControllerRef.current.abort();
    }

    // Limpiar timeout anterior
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Configurar nuevo timeout
    debounceTimeoutRef.current = setTimeout(() => {
      performSearch();
    }, debounceMs);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query, filters, autoSearch]);

  // Obtener sugerencias cuando cambia la query
  useEffect(() => {
    if (query.length >= 2) {
      getSuggestions(query);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  // Función principal de búsqueda
  const performSearch = useCallback(async (customQuery?: string) => {
    const searchQuery = customQuery || query;
    
    if (!searchQuery.trim()) {
      setResults([]);
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      // Crear nuevo AbortController
      searchAbortControllerRef.current = new AbortController();

      const searchFilters = {
        ...filters,
        query: searchQuery
      };

      const { results: searchResults, total, suggestions: searchSuggestions, searchTime: time } = 
        await advancedSearchService.search(searchFilters);

      // Verificar si la búsqueda fue cancelada
      if (searchAbortControllerRef.current?.signal.aborted) {
        return;
      }

      setResults(searchResults);
      setSuggestions(searchSuggestions);
      setTotalResults(total);
      setSearchTime(time);

    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error en búsqueda:', error);
        setError(error.message || 'Error en la búsqueda');
      }
    } finally {
      setIsSearching(false);
    }
  }, [query, filters]);

  // Búsqueda manual
  const search = useCallback(async (customQuery?: string) => {
    if (customQuery) {
      setQuery(customQuery);
    }
    await performSearch(customQuery);
  }, [performSearch]);

  // Limpiar búsqueda
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setSuggestions([]);
    setError(null);
    setTotalResults(0);
    setSearchTime(0);
  }, []);

  // Obtener sugerencias
  const getSuggestions = useCallback(async (searchQuery: string) => {
    try {
      const searchSuggestions = await advancedSearchService.getSearchSuggestions(searchQuery);
      setSuggestions(searchSuggestions);
    } catch (error) {
      console.error('Error obteniendo sugerencias:', error);
    }
  }, []);

  // Búsqueda por voz
  const startVoiceSearch = useCallback(async () => {
    if (isListening) {
      stopVoiceSearch();
      return;
    }

    try {
      setIsListening(true);
      const transcript = await advancedSearchService.searchByVoice();
      setQuery(transcript);
    } catch (error: any) {
      console.error('Error en búsqueda por voz:', error);
      setError(error.message || 'Error en búsqueda por voz');
    } finally {
      setIsListening(false);
    }
  }, [isListening]);

  const stopVoiceSearch = useCallback(() => {
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  // Búsqueda por imagen
  const searchByImage = useCallback(async (file: File) => {
    setIsSearching(true);
    setError(null);

    try {
      const results = await advancedSearchService.searchByImage(file);
      setResults(results);
      setTotalResults(results.length);
      setSearchTime(0);
    } catch (error: any) {
      console.error('Error en búsqueda por imagen:', error);
      setError(error.message || 'Error en búsqueda por imagen');
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Actualizar filtro específico
  const updateFilter = useCallback(<K extends keyof AdvancedSearchFilters>(
    key: K,
    value: AdvancedSearchFilters[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Limpiar historial
  const clearHistory = useCallback(() => {
    advancedSearchService.clearSearchHistory();
    setHistory([]);
  }, []);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (searchAbortControllerRef.current) {
        searchAbortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // Estado de búsqueda
    query,
    setQuery,
    results,
    suggestions,
    isSearching,
    searchTime,
    totalResults,
    
    // Filtros
    filters,
    setFilters,
    updateFilter,
    
    // Acciones
    search,
    clearSearch,
    getSuggestions,
    
    // Búsqueda por voz
    isListening,
    startVoiceSearch,
    stopVoiceSearch,
    
    // Búsqueda por imagen
    searchByImage,
    
    // Historial
    history,
    clearHistory,
    
    // Estado de error
    error,
    clearError
  };
}




