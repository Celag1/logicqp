"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  TrendingUp, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Download,
  Settings,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AnalyticsDashboardComponent from '@/components/analytics/analytics-dashboard';
import RealTimeMetrics from '@/components/analytics/real-time-metrics';
import { useAnalytics, useAnalyticsAlerts } from '@/hooks/use-analytics';

const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshing, setRefreshing] = useState(false);

  const {
    dashboard,
    loading,
    error,
    refresh,
    metrics,
    realTimeData,
    isConnected,
    lastUpdate
  } = useAnalytics({
    autoRefresh: true,
    refreshInterval: 30000
  });

  const { alerts, dismissAlert, clearAllAlerts } = useAnalyticsAlerts(metrics);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const handleExportData = () => {
    if (!dashboard) return;
    
    const data = {
      timestamp: new Date().toISOString(),
      metrics: dashboard.metrics,
      realTimeData: dashboard.realTimeData,
      charts: dashboard.charts
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reportes</h1>
          <p className="text-muted-foreground">
            Análisis avanzado y métricas en tiempo real para LogicQP
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
            disabled={!dashboard}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
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

      {/* Estado de conexión y alertas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "h-3 w-3 rounded-full",
                  isConnected ? "bg-green-500" : "bg-red-500"
                )} />
                <span className="font-medium">
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {isConnected ? 'Tiempo Real' : 'Sin Conexión'}
              </Badge>
            </div>
            {lastUpdate && (
              <p className="text-sm text-muted-foreground mt-2">
                Última actualización: {lastUpdate.toLocaleString('es-EC')}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="font-medium">Alertas Activas</span>
              </div>
              <Badge variant={alerts.length > 0 ? 'destructive' : 'secondary'}>
                {alerts.length}
              </Badge>
            </div>
            {alerts.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllAlerts}
                className="mt-2"
              >
                Limpiar todas
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.slice(0, 3).map((alert) => (
            <Alert
              key={alert.id}
              variant={
                alert.type === 'error' ? 'destructive' :
                alert.type === 'warning' ? 'default' :
                alert.type === 'success' ? 'default' : 'default'
              }
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                {alert.type === 'error' && <AlertTriangle className="h-4 w-4" />}
                {alert.type === 'success' && <CheckCircle className="h-4 w-4" />}
                {alert.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
                {alert.type === 'info' && <Clock className="h-4 w-4" />}
                <div>
                  <AlertDescription className="font-medium">
                    {alert.title}
                  </AlertDescription>
                  <AlertDescription className="text-sm">
                    {alert.message}
                  </AlertDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissAlert(alert.id)}
              >
                ×
              </Button>
            </Alert>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error cargando analytics: {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading state */}
      {loading && !dashboard && (
        <div className="text-center py-12">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Cargando Analytics</h3>
          <p className="text-muted-foreground">
            Preparando métricas y datos en tiempo real...
          </p>
        </div>
      )}

      {/* Main content */}
      {dashboard && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="realtime" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Tiempo Real
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Tendencias
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Reportes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AnalyticsDashboardComponent />
          </TabsContent>

          <TabsContent value="realtime">
            <RealTimeMetrics refreshInterval={10000} />
          </TabsContent>

          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Análisis de Tendencias</CardTitle>
                <CardDescription>
                  Análisis profundo de las tendencias y patrones en tus datos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Análisis de Tendencias</h3>
                  <p>Próximamente: Análisis avanzado de tendencias y predicciones</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Reportes Avanzados</CardTitle>
                <CardDescription>
                  Genera y programa reportes personalizados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <PieChart className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Reportes Personalizados</h3>
                  <p>Próximamente: Generación avanzada de reportes y exportación</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Footer con estadísticas */}
      {dashboard && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {dashboard.metrics.length}
                </p>
                <p className="text-sm text-muted-foreground">Métricas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {dashboard.realTimeData.activeUsers}
                </p>
                <p className="text-sm text-muted-foreground">Usuarios Activos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {dashboard.realTimeData.currentOrders}
                </p>
                <p className="text-sm text-muted-foreground">Pedidos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {alerts.length}
                </p>
                <p className="text-sm text-muted-foreground">Alertas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsPage;




