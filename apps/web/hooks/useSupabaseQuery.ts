import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface UseSupabaseQueryOptions {
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
  cacheTime?: number;
}

interface UseSupabaseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Cache simple para evitar consultas repetitivas
const queryCache = new Map<string, { data: any; timestamp: number; staleTime: number }>();

export function useSupabaseQuery<T>(
  queryKey: string,
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options: UseSupabaseQueryOptions = {}
): UseSupabaseQueryResult<T> {
  const {
    enabled = true,
    refetchInterval,
    staleTime = 5 * 60 * 1000, // 5 minutos por defecto
    cacheTime = 10 * 60 * 1000, // 10 minutos por defecto
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const executeQuery = useCallback(async () => {
    if (!enabled || !isMountedRef.current) return;

    // Verificar cache primero
    const cached = queryCache.get(queryKey);
    if (cached && Date.now() - cached.timestamp < cached.staleTime) {
      if (isMountedRef.current) {
        setData(cached.data);
        setLoading(false);
        setError(null);
      }
      return;
    }

    try {
      if (isMountedRef.current) {
        setLoading(true);
        setError(null);
      }

      const result = await queryFn();

      if (result.error) {
        throw new Error(result.error.message || 'Error en la consulta');
      }

      // Guardar en cache
      queryCache.set(queryKey, {
        data: result.data,
        timestamp: Date.now(),
        staleTime,
      });

      if (isMountedRef.current) {
        setData(result.data);
        setLoading(false);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error('Error desconocido'));
        setLoading(false);
      }
    }
  }, [queryKey, queryFn, enabled, staleTime]);

  const refetch = useCallback(async () => {
    // Limpiar cache para forzar nueva consulta
    queryCache.delete(queryKey);
    await executeQuery();
  }, [queryKey, executeQuery]);

  useEffect(() => {
    isMountedRef.current = true;
    executeQuery();

    // Configurar refetch automático si se especifica
    if (refetchInterval && refetchInterval > 0) {
      intervalRef.current = setInterval(executeQuery, refetchInterval);
    }

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [executeQuery, refetchInterval]);

  // Limpiar cache cuando el componente se desmonta
  useEffect(() => {
    return () => {
      const timeoutId = setTimeout(() => {
        queryCache.delete(queryKey);
      }, cacheTime);
      
      return () => clearTimeout(timeoutId);
    };
  }, [queryKey, cacheTime]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}

// Hook especializado para consultas de productos
export function useProductsQuery(options: UseSupabaseQueryOptions = {}) {
  return useSupabaseQuery(
    'products',
    async () => {
      const { data, error } = await supabase
        .from('productos')
        .select(`
          id,
          codigo,
          nombre,
          descripcion,
          precio,
          stock,
          stock_minimo,
          categoria_id,
          categorias(nombre),
          lotes(
            id,
            numero_lote,
            cantidad_disponible,
            precio_compra,
            fecha_vencimiento
          )
        `)
        .order('nombre');
      
      return { data, error };
    },
    { staleTime: 2 * 60 * 1000, ...options } // 2 minutos para productos
  );
}

// Hook especializado para consultas de ventas
export function useSalesQuery(options: UseSupabaseQueryOptions = {}) {
  return useSupabaseQuery(
    'sales',
    async () => {
      const { data, error } = await supabase
        .from('ventas')
        .select(`
          *,
          venta_items(
            id,
            producto_id,
            cantidad,
            precio_unitario,
            subtotal,
            productos(nombre)
          )
        `)
        .order('fecha_venta', { ascending: false });
      
      return { data, error };
    },
    { staleTime: 1 * 60 * 1000, ...options } // 1 minuto para ventas
  );
}

// Hook especializado para consultas de categorías
export function useCategoriesQuery(options: UseSupabaseQueryOptions = {}) {
  return useSupabaseQuery(
    'categories',
    async () => {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('nombre');
      
      return { data, error };
    },
    { staleTime: 10 * 60 * 1000, ...options } // 10 minutos para categorías
  );
}
