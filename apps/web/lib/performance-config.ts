// Configuración de rendimiento para la aplicación LOGICQP

export const PERFORMANCE_CONFIG = {
  // Configuración de consultas
  QUERIES: {
    // Tiempo de cache para diferentes tipos de datos
    CACHE_TIME: {
      PRODUCTS: 2 * 60 * 1000, // 2 minutos
      SALES: 1 * 60 * 1000, // 1 minuto
      CATEGORIES: 10 * 60 * 1000, // 10 minutos
      USERS: 5 * 60 * 1000, // 5 minutos
      DASHBOARD: 30 * 1000, // 30 segundos
    },
    
    // Límites de consultas
    LIMITS: {
      PRODUCTS: 100,
      SALES: 50,
      USERS: 50,
      ORDERS: 25,
    },
    
    // Timeouts
    TIMEOUTS: {
      DEFAULT: 10000, // 10 segundos
      DASHBOARD: 5000, // 5 segundos
      AUTH: 15000, // 15 segundos
    }
  },
  
  // Configuración de UI
  UI: {
    // Debounce para búsquedas
    SEARCH_DEBOUNCE: 300, // 300ms
    
    // Lazy loading
    LAZY_LOAD_THRESHOLD: 100, // 100px
    
    // Animaciones
    ANIMATION_DURATION: 200, // 200ms
    
    // Paginación
    ITEMS_PER_PAGE: 20,
  },
  
  // Configuración de memoria
  MEMORY: {
    // Límite de memoria para cache
    CACHE_LIMIT: 50 * 1024 * 1024, // 50MB
    
    // Limpiar cache cuando se alcance este porcentaje
    CLEANUP_THRESHOLD: 0.8, // 80%
  },
  
  // Configuración de red
  NETWORK: {
    // Reintentos
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // 1 segundo
    
    // Timeout de red
    TIMEOUT: 10000, // 10 segundos
  }
};

// Función para verificar si el dispositivo es lento
export const isSlowDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Verificar memoria disponible
  const memory = (navigator as any).deviceMemory;
  if (memory && memory < 4) return true;
  
  // Verificar conexión lenta
  const connection = (navigator as any).connection;
  if (connection && connection.effectiveType === 'slow-2g') return true;
  
  // Verificar CPU cores
  const cores = navigator.hardwareConcurrency;
  if (cores && cores < 4) return true;
  
  return false;
};

// Función para obtener configuración optimizada según el dispositivo
export const getOptimizedConfig = () => {
  const isSlow = isSlowDevice();
  
  if (isSlow) {
    return {
      ...PERFORMANCE_CONFIG,
      QUERIES: {
        ...PERFORMANCE_CONFIG.QUERIES,
        LIMITS: {
          PRODUCTS: 50,
          SALES: 25,
          USERS: 25,
          ORDERS: 15,
        },
        CACHE_TIME: {
          PRODUCTS: 5 * 60 * 1000, // 5 minutos
          SALES: 2 * 60 * 1000, // 2 minutos
          CATEGORIES: 15 * 60 * 1000, // 15 minutos
          USERS: 10 * 60 * 1000, // 10 minutos
          DASHBOARD: 60 * 1000, // 1 minuto
        }
      },
      UI: {
        ...PERFORMANCE_CONFIG.UI,
        ITEMS_PER_PAGE: 10,
        SEARCH_DEBOUNCE: 500, // 500ms para dispositivos lentos
      }
    };
  }
  
  return PERFORMANCE_CONFIG;
};

// Función para limpiar memoria
export const cleanupMemory = () => {
  if (typeof window === 'undefined') return;
  
  // Limpiar cache de imágenes
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        if (name.includes('image-cache')) {
          caches.delete(name);
        }
      });
    });
  }
  
  // Forzar garbage collection si está disponible
  if ('gc' in window) {
    (window as any).gc();
  }
};

// Función para monitorear rendimiento
export const monitorPerformance = () => {
  if (typeof window === 'undefined') return;
  
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'measure') {
        console.log(`Performance: ${entry.name} - ${entry.duration.toFixed(2)}ms`);
      }
    }
  });
  
  observer.observe({ entryTypes: ['measure'] });
  
  return () => observer.disconnect();
};
