// Script de monitoreo de rendimiento
export const performanceMonitor = {
  // Métricas de carga
  measureLoadTime: () => {
    if (typeof window === 'undefined') return;
    
    const navigation = performance.getEntriesByType('navigation')[0];
    return navigation ? (navigation as any).loadEventEnd - (navigation as any).loadEventStart : 0;
  },
  
  // Métricas de memoria
  measureMemory: () => {
    if (typeof window === 'undefined') return null;
    
    const memory = (performance as any).memory;
    return memory ? {
      used: memory.usedJSHeapSize / 1024 / 1024,
      total: memory.totalJSHeapSize / 1024 / 1024,
      limit: memory.jsHeapSizeLimit / 1024 / 1024
    } : null;
  },
  
  // Métricas de red
  measureNetwork: () => {
    if (typeof window === 'undefined') return null;
    
    const resources = performance.getEntriesByType('resource');
    return {
      totalRequests: resources.length,
      totalSize: resources.reduce((total: number, resource: any) => total + ((resource as any).transferSize || 0), 0),
      averageTime: resources.reduce((total: number, resource: any) => total + resource.duration, 0) / resources.length
    };
  }
};
