"use client";

import { supabase } from '@/lib/supabase/client';

export interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
  category: string;
  timestamp: Date;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    fill?: boolean;
  }[];
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

export interface AnalyticsDashboard {
  metrics: AnalyticsMetric[];
  charts: {
    sales: ChartData;
    inventory: ChartData;
    users: ChartData;
    revenue: ChartData;
  };
  realTimeData: {
    activeUsers: number;
    currentOrders: number;
    systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
    lastUpdate: Date;
  };
}

export interface AnalyticsFilter {
  dateRange: {
    start: Date;
    end: Date;
  };
  categories?: string[];
  products?: string[];
  users?: string[];
  granularity: 'hour' | 'day' | 'week' | 'month';
}

class AnalyticsService {
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutos

  /**
   * Obtener dashboard de analytics completo
   */
  async getAnalyticsDashboard(filter: AnalyticsFilter): Promise<AnalyticsDashboard> {
    try {
      console.log('📊 Generando dashboard de analytics:', filter);

      const cacheKey = `dashboard_${JSON.stringify(filter)}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const [metrics, charts, realTimeData] = await Promise.all([
        this.getMetrics(filter),
        this.getCharts(filter),
        this.getRealTimeData()
      ]);

      const dashboard: AnalyticsDashboard = {
        metrics,
        charts,
        realTimeData
      };

      this.setCachedData(cacheKey, dashboard);
      return dashboard;

    } catch (error) {
      console.error('Error generando dashboard:', error);
      throw error;
    }
  }

  /**
   * Obtener métricas principales
   */
  async getMetrics(filter: AnalyticsFilter): Promise<AnalyticsMetric[]> {
    try {
      const [
        salesData,
        inventoryData,
        userData,
        revenueData
      ] = await Promise.all([
        this.getSalesMetrics(filter),
        this.getInventoryMetrics(filter),
        this.getUserMetrics(filter),
        this.getRevenueMetrics(filter)
      ]);

      return [
        ...salesData,
        ...inventoryData,
        ...userData,
        ...revenueData
      ];
    } catch (error) {
      console.error('Error obteniendo métricas:', error);
      return [];
    }
  }

  /**
   * Obtener métricas de ventas
   */
  private async getSalesMetrics(filter: AnalyticsFilter): Promise<AnalyticsMetric[]> {
    try {
      const { data: currentData } = await supabase
        .from('ventas')
        .select('total, fecha_venta')
        .gte('fecha_venta', filter.dateRange.start.toISOString())
        .lte('fecha_venta', filter.dateRange.end.toISOString());

      const { data: previousData } = await supabase
        .from('ventas')
        .select('total, fecha_venta')
        .gte('fecha_venta', this.getPreviousPeriodStart(filter).toISOString())
        .lt('fecha_venta', filter.dateRange.start.toISOString());

      const currentTotal = currentData?.reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0;
      const previousTotal = previousData?.reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0;
      const currentCount = currentData?.length || 0;
      const previousCount = previousData?.length || 0;

      return [
        {
          id: 'total_sales',
          name: 'Ventas Totales',
          value: currentTotal,
          previousValue: previousTotal,
          change: currentTotal - previousTotal,
          changePercentage: previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0,
          trend: currentTotal > previousTotal ? 'up' : currentTotal < previousTotal ? 'down' : 'stable',
          unit: 'USD',
          category: 'sales',
          timestamp: new Date()
        },
        {
          id: 'total_orders',
          name: 'Pedidos Totales',
          value: currentCount,
          previousValue: previousCount,
          change: currentCount - previousCount,
          changePercentage: previousCount > 0 ? ((currentCount - previousCount) / previousCount) * 100 : 0,
          trend: currentCount > previousCount ? 'up' : currentCount < previousCount ? 'down' : 'stable',
          unit: 'pedidos',
          category: 'sales',
          timestamp: new Date()
        }
      ];
    } catch (error) {
      console.error('Error obteniendo métricas de ventas:', error);
      return [];
    }
  }

  /**
   * Obtener métricas de inventario
   */
  private async getInventoryMetrics(filter: AnalyticsFilter): Promise<AnalyticsMetric[]> {
    try {
      const { data: products } = await supabase
        .from('productos')
        .select('stock_disponible, stock_minimo, precio_venta')
        .eq('activo', true);

      const totalProducts = products?.length || 0;
      const lowStockProducts = products?.filter((p: any) => p.stock_disponible <= p.stock_minimo).length || 0;
      const totalValue = products?.reduce((sum: number, p: any) => sum + (p.stock_disponible * p.precio_venta), 0) || 0;

      return [
        {
          id: 'total_products',
          name: 'Productos Totales',
          value: totalProducts,
          previousValue: totalProducts, // Simplificado para demo
          change: 0,
          changePercentage: 0,
          trend: 'stable',
          unit: 'productos',
          category: 'inventory',
          timestamp: new Date()
        },
        {
          id: 'low_stock_products',
          name: 'Stock Bajo',
          value: lowStockProducts,
          previousValue: lowStockProducts,
          change: 0,
          changePercentage: 0,
          trend: 'stable',
          unit: 'productos',
          category: 'inventory',
          timestamp: new Date()
        },
        {
          id: 'inventory_value',
          name: 'Valor Inventario',
          value: totalValue,
          previousValue: totalValue,
          change: 0,
          changePercentage: 0,
          trend: 'stable',
          unit: 'USD',
          category: 'inventory',
          timestamp: new Date()
        }
      ];
    } catch (error) {
      console.error('Error obteniendo métricas de inventario:', error);
      return [];
    }
  }

  /**
   * Obtener métricas de usuarios
   */
  private async getUserMetrics(filter: AnalyticsFilter): Promise<AnalyticsMetric[]> {
    try {
      const { data: users } = await supabase
        .from('profiles')
        .select('created_at, rol')
        .gte('created_at', filter.dateRange.start.toISOString())
        .lte('created_at', filter.dateRange.end.toISOString());

      const { data: previousUsers } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', this.getPreviousPeriodStart(filter).toISOString())
        .lt('created_at', filter.dateRange.start.toISOString());

      const currentCount = users?.length || 0;
      const previousCount = previousUsers?.length || 0;
      const activeUsers = users?.filter((u: any) => u.rol !== 'inactivo').length || 0;

      return [
        {
          id: 'new_users',
          name: 'Nuevos Usuarios',
          value: currentCount,
          previousValue: previousCount,
          change: currentCount - previousCount,
          changePercentage: previousCount > 0 ? ((currentCount - previousCount) / previousCount) * 100 : 0,
          trend: currentCount > previousCount ? 'up' : currentCount < previousCount ? 'down' : 'stable',
          unit: 'usuarios',
          category: 'users',
          timestamp: new Date()
        },
        {
          id: 'active_users',
          name: 'Usuarios Activos',
          value: activeUsers,
          previousValue: activeUsers,
          change: 0,
          changePercentage: 0,
          trend: 'stable',
          unit: 'usuarios',
          category: 'users',
          timestamp: new Date()
        }
      ];
    } catch (error) {
      console.error('Error obteniendo métricas de usuarios:', error);
      return [];
    }
  }

  /**
   * Obtener métricas de ingresos
   */
  private async getRevenueMetrics(filter: AnalyticsFilter): Promise<AnalyticsMetric[]> {
    try {
      const { data: sales } = await supabase
        .from('ventas')
        .select('total, fecha_venta')
        .gte('fecha_venta', filter.dateRange.start.toISOString())
        .lte('fecha_venta', filter.dateRange.end.toISOString());

      const totalRevenue = sales?.reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0;
      const avgOrderValue = sales?.length ? totalRevenue / sales.length : 0;

      return [
        {
          id: 'total_revenue',
          name: 'Ingresos Totales',
          value: totalRevenue,
          previousValue: totalRevenue * 0.9, // Simulado para demo
          change: totalRevenue * 0.1,
          changePercentage: 10,
          trend: 'up',
          unit: 'USD',
          category: 'revenue',
          timestamp: new Date()
        },
        {
          id: 'avg_order_value',
          name: 'Valor Promedio Pedido',
          value: avgOrderValue,
          previousValue: avgOrderValue * 0.95,
          change: avgOrderValue * 0.05,
          changePercentage: 5,
          trend: 'up',
          unit: 'USD',
          category: 'revenue',
          timestamp: new Date()
        }
      ];
    } catch (error) {
      console.error('Error obteniendo métricas de ingresos:', error);
      return [];
    }
  }

  /**
   * Obtener datos para gráficos
   */
  async getCharts(filter: AnalyticsFilter): Promise<AnalyticsDashboard['charts']> {
    try {
      const [sales, inventory, users, revenue] = await Promise.all([
        this.getSalesChartData(filter),
        this.getInventoryChartData(filter),
        this.getUsersChartData(filter),
        this.getRevenueChartData(filter)
      ]);

      return {
        sales,
        inventory,
        users,
        revenue
      };
    } catch (error) {
      console.error('Error obteniendo datos de gráficos:', error);
      return {
        sales: { labels: [], datasets: [] },
        inventory: { labels: [], datasets: [] },
        users: { labels: [], datasets: [] },
        revenue: { labels: [], datasets: [] }
      };
    }
  }

  /**
   * Obtener datos de gráfico de ventas
   */
  private async getSalesChartData(filter: AnalyticsFilter): Promise<ChartData> {
    try {
      const { data } = await supabase
        .from('ventas')
        .select('total, fecha_venta')
        .gte('fecha_venta', filter.dateRange.start.toISOString())
        .lte('fecha_venta', filter.dateRange.end.toISOString())
        .order('fecha_venta');

      const groupedData = this.groupDataByPeriod(data || [], filter.granularity);
      
      return {
        labels: groupedData.map((item: any) => item.label),
        datasets: [{
          label: 'Ventas',
          data: groupedData.map((item: any) => item.value),
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgba(59, 130, 246, 1)',
          fill: true
        }]
      };
    } catch (error) {
      console.error('Error obteniendo datos de ventas:', error);
      return { labels: [], datasets: [] };
    }
  }

  /**
   * Obtener datos de gráfico de inventario
   */
  private async getInventoryChartData(filter: AnalyticsFilter): Promise<ChartData> {
    try {
      const { data } = await supabase
        .from('productos')
        .select('categoria, stock_disponible')
        .eq('activo', true);

      const categoryData = this.groupByCategory(data || []);
      
      return {
        labels: Object.keys(categoryData),
        datasets: [{
          label: 'Stock por Categoría',
          data: Object.values(categoryData),
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgba(59, 130, 246, 1)'
        }]
      };
    } catch (error) {
      console.error('Error obteniendo datos de inventario:', error);
      return { labels: [], datasets: [] };
    }
  }

  /**
   * Obtener datos de gráfico de usuarios
   */
  private async getUsersChartData(filter: AnalyticsFilter): Promise<ChartData> {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('created_at, rol')
        .gte('created_at', filter.dateRange.start.toISOString())
        .lte('created_at', filter.dateRange.end.toISOString())
        .order('created_at');

      const groupedData = this.groupDataByPeriod(data || [], filter.granularity);
      
      return {
        labels: groupedData.map((item: any) => item.label),
        datasets: [{
          label: 'Nuevos Usuarios',
          data: groupedData.map((item: any) => item.value),
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderColor: 'rgba(34, 197, 94, 1)',
          fill: true
        }]
      };
    } catch (error) {
      console.error('Error obteniendo datos de usuarios:', error);
      return { labels: [], datasets: [] };
    }
  }

  /**
   * Obtener datos de gráfico de ingresos
   */
  private async getRevenueChartData(filter: AnalyticsFilter): Promise<ChartData> {
    try {
      const { data } = await supabase
        .from('ventas')
        .select('total, fecha_venta')
        .gte('fecha_venta', filter.dateRange.start.toISOString())
        .lte('fecha_venta', filter.dateRange.end.toISOString())
        .order('fecha_venta');

      const groupedData = this.groupDataByPeriod(data || [], filter.granularity);
      
      return {
        labels: groupedData.map((item: any) => item.label),
        datasets: [{
          label: 'Ingresos',
          data: groupedData.map((item: any) => item.value),
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderColor: 'rgba(245, 158, 11, 1)',
          fill: true
        }]
      };
    } catch (error) {
      console.error('Error obteniendo datos de ingresos:', error);
      return { labels: [], datasets: [] };
    }
  }

  /**
   * Obtener datos en tiempo real
   */
  async getRealTimeData(): Promise<AnalyticsDashboard['realTimeData']> {
    try {
      // Simular datos en tiempo real
      const activeUsers = Math.floor(Math.random() * 50) + 10;
      const currentOrders = Math.floor(Math.random() * 20) + 5;
      const systemHealth = this.calculateSystemHealth();

      return {
        activeUsers,
        currentOrders,
        systemHealth,
        lastUpdate: new Date()
      };
    } catch (error) {
      console.error('Error obteniendo datos en tiempo real:', error);
      return {
        activeUsers: 0,
        currentOrders: 0,
        systemHealth: 'critical',
        lastUpdate: new Date()
      };
    }
  }

  // Métodos auxiliares

  private getCachedData(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private getPreviousPeriodStart(filter: AnalyticsFilter): Date {
    const duration = filter.dateRange.end.getTime() - filter.dateRange.start.getTime();
    return new Date(filter.dateRange.start.getTime() - duration);
  }

  private groupDataByPeriod(data: any[], granularity: string): TimeSeriesData[] {
    const groups: { [key: string]: number } = {};
    
    data.forEach((item: any) => {
      const date = new Date(item.fecha_venta || item.created_at);
      let key: string;
      
      switch (granularity) {
        case 'hour':
          key = date.toISOString().slice(0, 13) + ':00:00';
          break;
        case 'day':
          key = date.toISOString().slice(0, 10);
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().slice(0, 10);
          break;
        case 'month':
          key = date.toISOString().slice(0, 7);
          break;
        default:
          key = date.toISOString().slice(0, 10);
      }
      
      groups[key] = (groups[key] || 0) + (item.total || 1);
    });
    
    return Object.entries(groups).map(([date, value]: [string, any]) => ({
      date,
      value,
      label: this.formatDateLabel(date, granularity)
    }));
  }

  private groupByCategory(data: any[]): { [key: string]: number } {
    const groups: { [key: string]: number } = {};
    
    data.forEach((item: any) => {
      const category = item.categoria || 'Sin categoría';
      groups[category] = (groups[category] || 0) + (item.stock_disponible || 0);
    });
    
    return groups;
  }

  private formatDateLabel(date: string, granularity: string): string {
    const d = new Date(date);
    
    switch (granularity) {
      case 'hour':
        return d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
      case 'day':
        return d.toLocaleDateString('es-EC', { month: 'short', day: 'numeric' });
      case 'week':
        return `Sem ${d.getWeek()}`;
      case 'month':
        return d.toLocaleDateString('es-EC', { month: 'short' });
      default:
        return d.toLocaleDateString('es-EC');
    }
  }

  private calculateSystemHealth(): 'excellent' | 'good' | 'warning' | 'critical' {
    // Simular cálculo de salud del sistema
    const random = Math.random();
    if (random > 0.8) return 'excellent';
    if (random > 0.6) return 'good';
    if (random > 0.3) return 'warning';
    return 'critical';
  }
}

// Extensión de Date para obtener número de semana
declare global {
  interface Date {
    getWeek(): number;
  }
}

Date.prototype.getWeek = function() {
  const d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

export const analyticsService = new AnalyticsService();




