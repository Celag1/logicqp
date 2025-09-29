"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { analyticsService, AnalyticsDashboard, AnalyticsFilter, AnalyticsMetric } from '@/lib/services/analytics';

interface UseAnalyticsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // en milisegundos
  initialFilter?: Partial<AnalyticsFilter>;
}

interface UseAnalyticsReturn {
  dashboard: AnalyticsDashboard | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateFilter: (filter: Partial<AnalyticsFilter>) => void;
  metrics: AnalyticsMetric[];
  realTimeData: AnalyticsDashboard['realTimeData'] | null;
  isConnected: boolean;
  lastUpdate: Date | null;
}

export const useAnalytics = (options: UseAnalyticsOptions = {}): UseAnalyticsReturn => {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 segundos
    initialFilter = {}
  } = options;

  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  const [filter, setFilter] = useState<AnalyticsFilter>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 días
      end: new Date()
    },
    granularity: 'day',
    ...initialFilter
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const loadDashboard = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      setLoading(true);
      setError(null);
      
      const data = await analyticsService.getAnalyticsDashboard(filter);
      
      if (mountedRef.current) {
        setDashboard(data);
        setIsConnected(true);
        setLastUpdate(new Date());
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setIsConnected(false);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [filter]);

  const refresh = useCallback(async () => {
    await loadDashboard();
  }, [loadDashboard]);

  const updateFilter = useCallback((newFilter: Partial<AnalyticsFilter>) => {
    setFilter(prev => ({
      ...prev,
      ...newFilter
    }));
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Configurar actualización automática
  useEffect(() => {
    if (!autoRefresh) return;

    intervalRef.current = setInterval(() => {
      if (mountedRef.current) {
        loadDashboard();
      }
    }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, loadDashboard]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    dashboard,
    loading,
    error,
    refresh,
    updateFilter,
    metrics: dashboard?.metrics || [],
    realTimeData: dashboard?.realTimeData || null,
    isConnected,
    lastUpdate
  };
};

// Hook específico para métricas en tiempo real
export const useRealTimeMetrics = (refreshInterval: number = 10000) => {
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const loadMetrics = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      setLoading(true);
      setError(null);
      
      const data = await analyticsService.getRealTimeData();
      
      if (mountedRef.current) {
        // Simular métricas en tiempo real
        const newMetrics: AnalyticsMetric[] = [
          {
            id: 'active_users',
            name: 'Usuarios Activos',
            value: data.activeUsers,
            previousValue: 0,
            change: 0,
            changePercentage: 0,
            trend: 'stable',
            unit: 'usuarios',
            category: 'users',
            timestamp: new Date()
          },
          {
            id: 'current_orders',
            name: 'Pedidos Actuales',
            value: data.currentOrders,
            previousValue: 0,
            change: 0,
            changePercentage: 0,
            trend: 'stable',
            unit: 'pedidos',
            category: 'sales',
            timestamp: new Date()
          }
        ];

        setMetrics(prev => {
          // Agregar nuevas métricas y mantener solo las últimas 50
          return [...prev, ...newMetrics].slice(-50);
        });
        
        setIsConnected(true);
        setLastUpdate(new Date());
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setIsConnected(false);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadMetrics();
  }, [loadMetrics]);

  // Cargar métricas iniciales
  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  // Configurar actualización automática
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (mountedRef.current) {
        loadMetrics();
      }
    }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshInterval, loadMetrics]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    metrics,
    loading,
    error,
    refresh,
    isConnected,
    lastUpdate
  };
};

// Hook para análisis de tendencias
export const useTrendAnalysis = (metrics: AnalyticsMetric[]) => {
  const [trends, setTrends] = useState<{
    overall: 'up' | 'down' | 'stable';
    categories: { [key: string]: 'up' | 'down' | 'stable' };
    insights: string[];
  }>({
    overall: 'stable',
    categories: {},
    insights: []
  });

  useEffect(() => {
    if (metrics.length === 0) return;

    // Calcular tendencias por categoría
    const categories: { [key: string]: number[] } = {};
    metrics.forEach((metric: any) => {
      if (!categories[metric.category]) {
        categories[metric.category] = [];
      }
      categories[metric.category].push(metric.changePercentage);
    });

    const categoryTrends: { [key: string]: 'up' | 'down' | 'stable' } = {};
    Object.entries(categories).forEach(([category, changes]: [string, any]) => {
      const avgChange = changes.reduce((sum: number, change: number) => sum + change, 0) / changes.length;
      if (avgChange > 5) categoryTrends[category] = 'up';
      else if (avgChange < -5) categoryTrends[category] = 'down';
      else categoryTrends[category] = 'stable';
    });

    // Calcular tendencia general
    const allChanges = metrics.map((m: any) => m.changePercentage);
    const overallChange = allChanges.reduce((sum: number, change: number) => sum + change, 0) / allChanges.length;
    const overallTrend = overallChange > 2 ? 'up' : overallChange < -2 ? 'down' : 'stable';

    // Generar insights
    const insights: string[] = [];
    
    if (overallTrend === 'up') {
      insights.push('📈 Las métricas muestran una tendencia positiva general');
    } else if (overallTrend === 'down') {
      insights.push('📉 Las métricas muestran una tendencia negativa general');
    } else {
      insights.push('📊 Las métricas se mantienen estables');
    }

    Object.entries(categoryTrends).forEach(([category, trend]: [string, any]) => {
      if (trend === 'up') {
        insights.push(`🚀 ${category} muestra crecimiento significativo`);
      } else if (trend === 'down') {
        insights.push(`⚠️ ${category} requiere atención`);
      }
    });

    setTrends({
      overall: overallTrend,
      categories: categoryTrends,
      insights
    });
  }, [metrics]);

  return trends;
};

// Hook para alertas automáticas
export const useAnalyticsAlerts = (metrics: AnalyticsMetric[]) => {
  const [alerts, setAlerts] = useState<{
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    title: string;
    message: string;
    timestamp: Date;
    dismissed: boolean;
  }[]>([]);

  useEffect(() => {
    const newAlerts: typeof alerts = [];

    metrics.forEach((metric: any) => {
      // Alertas por cambios significativos
      if (Math.abs(metric.changePercentage) > 20) {
        newAlerts.push({
          id: `${metric.id}-change-${Date.now()}`,
          type: metric.changePercentage > 0 ? 'success' : 'warning',
          title: `Cambio significativo en ${metric.name}`,
          message: `${metric.name} ha cambiado un ${Math.abs(metric.changePercentage).toFixed(1)}%`,
          timestamp: new Date(),
          dismissed: false
        });
      }

      // Alertas por valores críticos
      if (metric.category === 'inventory' && metric.name.includes('Stock Bajo') && metric.value > 5) {
        newAlerts.push({
          id: `${metric.id}-low-stock-${Date.now()}`,
          type: 'error',
          title: 'Stock bajo crítico',
          message: `${metric.value} productos con stock bajo`,
          timestamp: new Date(),
          dismissed: false
        });
      }

      if (metric.category === 'users' && metric.name.includes('Usuarios Activos') && metric.value === 0) {
        newAlerts.push({
          id: `${metric.id}-no-users-${Date.now()}`,
          type: 'warning',
          title: 'Sin usuarios activos',
          message: 'No hay usuarios activos en el sistema',
          timestamp: new Date(),
          dismissed: false
        });
      }
    });

    if (newAlerts.length > 0) {
      setAlerts(prev => [...prev, ...newAlerts].slice(-20)); // Mantener solo las últimas 20 alertas
    }
  }, [metrics]);

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map((alert: any) => 
      alert.id === alertId ? { ...alert, dismissed: true } : alert
    ));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  return {
    alerts: alerts.filter((alert: any) => !alert.dismissed),
    dismissAlert,
    clearAllAlerts
  };
};




