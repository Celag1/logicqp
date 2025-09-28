"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, RefreshCw, TrendingUp, TrendingDown, Minus, Users, ShoppingCart, Package, DollarSign, Activity, AlertTriangle, CheckCircle, Clock, BarChart3, PieChart, LineChart } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { analyticsService, AnalyticsDashboard, AnalyticsFilter, AnalyticsMetric } from '@/lib/services/analytics';

interface AnalyticsDashboardProps {
  className?: string;
}

const AnalyticsDashboardComponent: React.FC<AnalyticsDashboardProps> = ({ className }) => {
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<AnalyticsFilter>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 días
      end: new Date()
    },
    granularity: 'day'
  });
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, [filter]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getAnalyticsDashboard(filter);
      setDashboard(data);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadDashboard();
    } finally {
      setRefreshing(false);
    }
  };

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    if (range.from && range.to) {
      setFilter(prev => ({
        ...prev,
        dateRange: {
          start: range.from!,
          end: range.to!
        }
      }));
    }
  };

  const handleGranularityChange = (granularity: 'hour' | 'day' | 'week' | 'month') => {
    setFilter(prev => ({
      ...prev,
      granularity
    }));
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return <CheckCircle className="h-4 w-4" />;
      case 'good': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'USD') {
      return new Intl.NumberFormat('es-EC', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    }
    return `${value.toLocaleString('es-EC')} ${unit}`;
  };

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Dashboard de Analytics</h2>
            <p className="text-muted-foreground">Cargando métricas en tiempo real...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="text-center py-12">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No se pudieron cargar los datos</h3>
          <p className="text-muted-foreground mb-4">Hubo un problema al cargar el dashboard de analytics.</p>
          <Button onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Analytics</h2>
          <p className="text-muted-foreground">
            Métricas en tiempo real • Última actualización: {format(dashboard.realTimeData.lastUpdate, 'PPpp', { locale: es })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Rango de fechas</label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filter.dateRange.start && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filter.dateRange.start ? (
                      filter.dateRange.end ? (
                        <>
                          {format(filter.dateRange.start, "dd/MM/yyyy", { locale: es })} -{" "}
                          {format(filter.dateRange.end, "dd/MM/yyyy", { locale: es })}
                        </>
                      ) : (
                        format(filter.dateRange.start, "dd/MM/yyyy", { locale: es })
                      )
                    ) : (
                      <span>Seleccionar fechas</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={filter.dateRange.start}
                    selected={{
                      from: filter.dateRange.start,
                      to: filter.dateRange.end
                    }}
                    onSelect={handleDateRangeChange}
                    numberOfMonths={2}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="sm:w-48">
              <label className="text-sm font-medium mb-2 block">Granularidad</label>
              <Select
                value={filter.granularity}
                onValueChange={handleGranularityChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hour">Por hora</SelectItem>
                  <SelectItem value="day">Por día</SelectItem>
                  <SelectItem value="week">Por semana</SelectItem>
                  <SelectItem value="month">Por mes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estado del sistema en tiempo real */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Usuarios Activos</p>
                <p className="text-2xl font-bold">{dashboard.realTimeData.activeUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pedidos Actuales</p>
                <p className="text-2xl font-bold">{dashboard.realTimeData.currentOrders}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estado del Sistema</p>
                <div className="flex items-center gap-2 mt-1">
                  {getHealthIcon(dashboard.realTimeData.systemHealth)}
                  <Badge className={getHealthColor(dashboard.realTimeData.systemHealth)}>
                    {dashboard.realTimeData.systemHealth === 'excellent' && 'Excelente'}
                    {dashboard.realTimeData.systemHealth === 'good' && 'Bueno'}
                    {dashboard.realTimeData.systemHealth === 'warning' && 'Advertencia'}
                    {dashboard.realTimeData.systemHealth === 'critical' && 'Crítico'}
                  </Badge>
                </div>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboard.metrics.map((metric) => (
          <Card key={metric.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.name}</p>
                  <p className="text-2xl font-bold">{formatValue(metric.value, metric.unit)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {getTrendIcon(metric.trend)}
                    <span className={cn("text-sm", getTrendColor(metric.trend))}>
                      {metric.changePercentage > 0 ? '+' : ''}{metric.changePercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  {metric.category === 'sales' && <ShoppingCart className="h-8 w-8 text-blue-600" />}
                  {metric.category === 'inventory' && <Package className="h-8 w-8 text-green-600" />}
                  {metric.category === 'users' && <Users className="h-8 w-8 text-purple-600" />}
                  {metric.category === 'revenue' && <DollarSign className="h-8 w-8 text-yellow-600" />}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Ventas
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Inventario
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Ingresos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Ventas</CardTitle>
              <CardDescription>
                Tendencias de ventas en el período seleccionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <LineChart className="h-12 w-12 mx-auto mb-4" />
                  <p>Gráfico de ventas por {filter.granularity}</p>
                  <p className="text-sm">Datos: {dashboard.charts.sales.labels.length} puntos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Inventario</CardTitle>
              <CardDescription>
                Stock disponible por categoría de productos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <PieChart className="h-12 w-12 mx-auto mb-4" />
                  <p>Gráfico de inventario por categoría</p>
                  <p className="text-sm">Categorías: {dashboard.charts.inventory.labels.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Usuarios</CardTitle>
              <CardDescription>
                Nuevos usuarios registrados en el período
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                  <p>Gráfico de usuarios por {filter.granularity}</p>
                  <p className="text-sm">Datos: {dashboard.charts.users.labels.length} puntos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Ingresos</CardTitle>
              <CardDescription>
                Tendencias de ingresos en el período seleccionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <DollarSign className="h-12 w-12 mx-auto mb-4" />
                  <p>Gráfico de ingresos por {filter.granularity}</p>
                  <p className="text-sm">Datos: {dashboard.charts.revenue.labels.length} puntos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboardComponent;




