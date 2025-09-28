"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Download,
  RefreshCw,
  Calendar,
  Users,
  DollarSign,
  Package,
  Activity,
  Zap
} from "lucide-react";
import { reportSchedulerService, ScheduledReport, ReportExecution } from "@/lib/services/report-scheduler";

interface ReportsDashboardProps {
  userId: string;
}

interface DashboardStats {
  totalReports: number;
  activeReports: number;
  executionsToday: number;
  totalExecutions: number;
  successRate: number;
  avgExecutionTime: number;
  nextExecution: string | null;
}

export default function ReportsDashboard({ userId }: ReportsDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalReports: 0,
    activeReports: 0,
    executionsToday: 0,
    totalExecutions: 0,
    successRate: 0,
    avgExecutionTime: 0,
    nextExecution: null
  });
  const [recentExecutions, setRecentExecutions] = useState<ReportExecution[]>([]);
  const [upcomingReports, setUpcomingReports] = useState<ScheduledReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadDashboardData();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const [scheduledReports, reportsToExecute] = await Promise.all([
        reportSchedulerService.getScheduledReports(userId),
        reportSchedulerService.getReportsToExecute()
      ]);

      // Calcular estadísticas
      const activeReports = scheduledReports.filter(r => r.enabled).length;
      const executionsToday = await getExecutionsToday();
      const totalExecutions = await getTotalExecutions();
      const successRate = await getSuccessRate();
      const avgExecutionTime = await getAverageExecutionTime();
      const nextExecution = getNextExecution(scheduledReports);

      setStats({
        totalReports: scheduledReports.length,
        activeReports,
        executionsToday,
        totalExecutions,
        successRate,
        avgExecutionTime,
        nextExecution
      });

      // Cargar ejecuciones recientes
      const recent = await getRecentExecutions();
      setRecentExecutions(recent);

      // Cargar reportes próximos
      setUpcomingReports(reportsToExecute.slice(0, 5));

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getExecutionsToday = async (): Promise<number> => {
    // Simulación - en producción consultarías la base de datos
    return Math.floor(Math.random() * 20) + 5;
  };

  const getTotalExecutions = async (): Promise<number> => {
    // Simulación - en producción consultarías la base de datos
    return Math.floor(Math.random() * 1000) + 500;
  };

  const getSuccessRate = async (): Promise<number> => {
    // Simulación - en producción consultarías la base de datos
    return Math.floor(Math.random() * 20) + 80; // 80-100%
  };

  const getAverageExecutionTime = async (): Promise<number> => {
    // Simulación - en producción consultarías la base de datos
    return Math.floor(Math.random() * 5000) + 2000; // 2-7 segundos
  };

  const getRecentExecutions = async (): Promise<ReportExecution[]> => {
    // Simulación - en producción consultarías la base de datos
    const statuses = ['completed', 'failed', 'running'] as const;
    const executions: ReportExecution[] = [];
    
    for (let i = 0; i < 10; i++) {
      executions.push({
        id: `exec_${i}`,
        scheduled_report_id: `report_${i}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        started_at: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: Math.random() > 0.3 ? new Date().toISOString() : undefined,
        file_url: Math.random() > 0.3 ? `/reports/report_${i}.pdf` : undefined,
        error_message: Math.random() > 0.8 ? 'Error de conexión' : undefined,
        parameters: {},
        file_size: Math.floor(Math.random() * 1000000) + 100000,
        execution_time: Math.floor(Math.random() * 5000) + 1000
      });
    }
    
    return executions.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
  };

  const getNextExecution = (reports: ScheduledReport[]): string | null => {
    const nextRuns = reports
      .filter(r => r.enabled && r.next_run)
      .map(r => new Date(r.next_run!))
      .sort((a, b) => a.getTime() - b.getTime());
    
    return nextRuns.length > 0 ? nextRuns[0].toISOString() : null;
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'failed': return AlertTriangle;
      case 'running': return Activity;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'running': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin mr-2" />
        <span>Cargando dashboard de reportes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Reportes</h2>
          <p className="text-gray-600">
            Monitoreo en tiempo real de la generación de reportes
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            Última actualización: {lastUpdate.toLocaleTimeString()}
          </span>
          <Button variant="outline" size="sm" onClick={loadDashboardData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reportes</p>
                <p className="text-2xl font-bold">{stats.totalReports}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Activos</p>
                <p className="text-2xl font-bold">{stats.activeReports}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Ejecuciones Hoy</p>
                <p className="text-2xl font-bold">{stats.executionsToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa de Éxito</p>
                <p className="text-2xl font-bold">{stats.successRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Tiempo Promedio</span>
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-2xl font-bold">{formatTime(stats.avgExecutionTime)}</p>
              <Progress value={Math.min((stats.avgExecutionTime / 10000) * 100, 100)} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Total Ejecuciones</span>
                <BarChart3 className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-2xl font-bold">{stats.totalExecutions.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Desde el inicio</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Próxima Ejecución</span>
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-lg font-bold">
                {stats.nextExecution 
                  ? new Date(stats.nextExecution).toLocaleString('es-EC', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'No programada'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ejecuciones recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Ejecuciones Recientes</span>
            </CardTitle>
            <CardDescription>
              Últimas 10 ejecuciones de reportes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentExecutions.slice(0, 5).map((execution) => {
                const StatusIcon = getStatusIcon(execution.status);
                return (
                  <div key={execution.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <StatusIcon className={`h-4 w-4 ${getStatusColor(execution.status)}`} />
                      <div>
                        <div className="text-sm font-medium">
                          {new Date(execution.started_at).toLocaleString('es-EC', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {execution.execution_time ? formatTime(execution.execution_time) : 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={execution.status === 'completed' ? 'default' : 'secondary'}>
                        {execution.status}
                      </Badge>
                      {execution.file_url && (
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Reportes próximos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Próximos Reportes</span>
            </CardTitle>
            <CardDescription>
              Reportes programados para ejecutar próximamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{report.name}</div>
                    <div className="text-sm text-gray-500">
                      {report.next_run 
                        ? new Date(report.next_run).toLocaleString('es-EC', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'No programado'
                      }
                    </div>
                  </div>
                  <Badge variant="outline">
                    {report.schedule.frequency}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas y notificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Alertas del Sistema</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.successRate < 90 && (
              <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Tasa de éxito de reportes por debajo del 90%. Revisar configuración.
                </span>
              </div>
            )}
            
            {stats.avgExecutionTime > 10000 && (
              <div className="flex items-center space-x-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-800">
                  Tiempo promedio de ejecución elevado. Considerar optimizaciones.
                </span>
              </div>
            )}

            {stats.activeReports === 0 && (
              <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  No hay reportes activos. Configura tu primer reporte programado.
                </span>
              </div>
            )}

            {stats.successRate >= 90 && stats.avgExecutionTime <= 10000 && stats.activeReports > 0 && (
              <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">
                  Sistema de reportes funcionando correctamente.
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
