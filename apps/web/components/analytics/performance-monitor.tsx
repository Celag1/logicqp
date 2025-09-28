'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  networkRequests: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Solo en desarrollo
    if (process.env.NODE_ENV !== 'development') return;

    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const loadTime = navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0;
      const renderTime = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
      
      // Memoria (si está disponible)
      const memory = (performance as any).memory;
      const memoryUsage = memory ? memory.usedJSHeapSize / 1024 / 1024 : 0;
      
      // Contar requests de red
      const networkRequests = performance.getEntriesByType('resource').length;

      setMetrics({
        loadTime,
        renderTime,
        memoryUsage,
        networkRequests,
      });
    };

    // Medir después de que la página se cargue completamente
    const timer = setTimeout(measurePerformance, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Mostrar/ocultar con Ctrl+Shift+P
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isVisible || !metrics || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold">Performance Monitor</span>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Load Time:</span>
          <span className={metrics.loadTime > 1000 ? 'text-red-400' : 'text-green-400'}>
            {metrics.loadTime.toFixed(0)}ms
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Render Time:</span>
          <span className={metrics.renderTime > 1000 ? 'text-red-400' : 'text-green-400'}>
            {metrics.renderTime.toFixed(0)}ms
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Memory:</span>
          <span className={metrics.memoryUsage > 50 ? 'text-red-400' : 'text-green-400'}>
            {metrics.memoryUsage.toFixed(1)}MB
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Network:</span>
          <span className={metrics.networkRequests > 50 ? 'text-red-400' : 'text-green-400'}>
            {metrics.networkRequests} requests
          </span>
        </div>
      </div>
      
      <div className="mt-2 pt-2 border-t border-gray-600 text-gray-400">
        Press Ctrl+Shift+P to toggle
      </div>
    </div>
  );
}