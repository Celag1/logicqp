"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Users, ShoppingCart, Package, DollarSign, TrendingUp, TrendingDown, Minus, RefreshCw, Wifi, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { analyticsService, AnalyticsDashboard } from '@/lib/services/analytics';

interface RealTimeMetricsProps {
  className?: string;
  refreshInterval?: number; // en milisegundos
}

interface MetricUpdate {
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
  isNew?: boolean;
}

const RealTimeMetrics: React.FC<RealTimeMetricsProps> = ({ 
  className, 
  refreshInterval = 30000 // 30 segundos por defecto
}) => {
  const [metrics, setMetrics] = useState<MetricUpdate[]>([]);
  const [realTimeData, setRealTimeData] = useState<AnalyticsDashboard['realTimeData'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadRealTimeData();
    
    // Configurar actualización automática
    const interval = setInterval(loadRealTimeData, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const loadRealTimeData = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getRealTimeData();
      setRealTimeData(data);
      setConnected(true);
      setLastUpdate(new Date());
      
      // Simular actualizaciones de métricas
      updateMetrics();
    } catch (error) {
      console.error('Error cargando datos en tiempo real:', error);
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const updateMetrics = () => {
    // Simular actualizaciones de métricas en tiempo real
    const newMetrics: MetricUpdate[] = [
      {
        id: 'active_users',
        name: 'Usuarios Activos',
        value: Math.floor(Math.random() * 50) + 10,
        previousValue: 0,
        change: 0,
        changePercentage: 0,
        trend: 'stable',
        unit: 'usuarios',
        category: 'users',
        timestamp: new Date(),
        isNew: true
      },
      {
        id: 'current_orders',
        name: 'Pedidos en Proceso',
        value: Math.floor(Math.random() * 20) + 5,
        previousValue: 0,
        change: 0,
        changePercentage: 0,
        trend: 'stable',
        unit: 'pedidos',
        category: 'sales',
        timestamp: new Date(),
        isNew: true
      },
      {
        id: 'revenue_today',
        name: 'Ingresos Hoy',
        value: Math.floor(Math.random() * 5000) + 1000,
        previousValue: 0,
        change: 0,
        changePercentage: 0,
        trend: 'up',
        unit: 'USD',
        category: 'revenue',
        timestamp: new Date(),
        isNew: true
      },
      {
        id: 'low_stock_alerts',
        name: 'Alertas de Stock',
        value: Math.floor(Math.random() * 10),
        previousValue: 0,
        change: 0,
        changePercentage: 0,
        trend: 'stable',
        unit: 'productos',
        category: 'inventory',
        timestamp: new Date(),
        isNew: true
      }
    ];

    setMetrics(prev => {
      // Marcar métricas anteriores como no nuevas
      const updatedPrev = prev.map(m => ({ ...m, isNew: false }));
      
      // Agregar nuevas métricas
      return [...updatedPrev, ...newMetrics].slice(-20); // Mantener solo las últimas 20
    });
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'users': return <Users className="h-5 w-5 text-blue-600" />;
      case 'sales': return <ShoppingCart className="h-5 w-5 text-green-600" />;
      case 'revenue': return <DollarSign className="h-5 w-5 text-yellow-600" />;
      case 'inventory': return <Package className="h-5 w-5 text-purple-600" />;
      default: return <Activity className="h-5 w-5 text-gray-600" />;
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-EC', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header con estado de conexión */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {connected ? (
                  <Wifi className="h-5 w-5 text-green-600" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">
                  {connected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
              <Badge variant={connected ? 'default' : 'destructive'}>
                {connected ? 'Tiempo Real' : 'Sin Conexión'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Última actualización: {formatTime(lastUpdate)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={loadRealTimeData}
                disabled={loading}
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estado del sistema */}
      {realTimeData && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Usuarios Activos</p>
                  <p className="text-2xl font-bold">{realTimeData.activeUsers}</p>
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
                  <p className="text-2xl font-bold">{realTimeData.currentOrders}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estado del Sistema</p>
                  <div className="flex items-center gap-2 mt-1">
                    {realTimeData.systemHealth === 'excellent' && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {realTimeData.systemHealth === 'good' && <CheckCircle className="h-4 w-4 text-blue-600" />}
                    {realTimeData.systemHealth === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                    {realTimeData.systemHealth === 'critical' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                    <Badge 
                      variant={
                        realTimeData.systemHealth === 'excellent' ? 'default' :
                        realTimeData.systemHealth === 'good' ? 'secondary' :
                        realTimeData.systemHealth === 'warning' ? 'outline' : 'destructive'
                      }
                    >
                      {realTimeData.systemHealth === 'excellent' && 'Excelente'}
                      {realTimeData.systemHealth === 'good' && 'Bueno'}
                      {realTimeData.systemHealth === 'warning' && 'Advertencia'}
                      {realTimeData.systemHealth === 'critical' && 'Crítico'}
                    </Badge>
                  </div>
                </div>
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Métricas en tiempo real */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Métricas en Tiempo Real
          </CardTitle>
          <CardDescription>
            Actualizaciones automáticas cada {refreshInterval / 1000} segundos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4" />
              <p>Esperando datos en tiempo real...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {metrics.slice(-10).reverse().map((metric, index) => (
                <div
                  key={`${metric.id}-${metric.timestamp.getTime()}`}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-all duration-300",
                    metric.isNew ? "bg-green-50 border-green-200 animate-pulse" : "bg-background",
                    index === 0 && "ring-2 ring-blue-200"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(metric.category)}
                    <div>
                      <p className="font-medium">{metric.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(metric.timestamp)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {formatValue(metric.value, metric.unit)}
                      </p>
                      {metric.changePercentage !== 0 && (
                        <div className="flex items-center gap-1">
                          {getTrendIcon(metric.trend)}
                          <span className={cn("text-sm", getTrendColor(metric.trend))}>
                            {metric.changePercentage > 0 ? '+' : ''}{metric.changePercentage.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {metric.isNew && (
                      <Badge variant="default" className="animate-bounce">
                        Nuevo
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuración de actualización */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Actualización</CardTitle>
          <CardDescription>
            Personaliza la frecuencia de actualización de las métricas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Intervalo de actualización:</span>
              <Badge variant="outline">
                {refreshInterval / 1000} segundos
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Estado: {connected ? 'Activo' : 'Inactivo'}
              </span>
              <div className={cn(
                "h-2 w-2 rounded-full",
                connected ? "bg-green-500" : "bg-red-500"
              )} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeMetrics;




