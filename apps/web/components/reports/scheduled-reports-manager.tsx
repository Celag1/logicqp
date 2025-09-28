"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  FileText, 
  Settings, 
  Play, 
  Pause, 
  Trash2, 
  Edit, 
  Download,
  Plus,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Mail,
  BarChart3,
  TrendingUp
} from "lucide-react";
import { 
  reportSchedulerService, 
  ScheduledReport, 
  ReportTemplate, 
  ReportExecution 
} from "@/lib/services/report-scheduler";

interface ScheduledReportsManagerProps {
  userId: string;
}

export default function ScheduledReportsManager({ userId }: ScheduledReportsManagerProps) {
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ScheduledReport | null>(null);
  const [executionHistory, setExecutionHistory] = useState<ReportExecution[]>([]);

  // Formulario de creación
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    template_id: '',
    frequency: 'daily' as const,
    dayOfWeek: 1,
    dayOfMonth: 1,
    hour: 9,
    minute: 0,
    timezone: 'America/Guayaquil',
    recipients: '',
    parameters: {}
  });

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [reports, templatesData] = await Promise.all([
        reportSchedulerService.getScheduledReports(userId),
        reportSchedulerService.getReportTemplates()
      ]);
      
      setScheduledReports(reports);
      setTemplates(templatesData);
    } catch (error) {
      setError('Error cargando datos');
      console.error('Error cargando datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReport = async () => {
    if (!formData.name || !formData.template_id) {
      setError('Completa todos los campos requeridos');
      return;
    }

    try {
      const recipients = formData.recipients.split(',').map(email => email.trim()).filter(Boolean);
      
      const newReport = await reportSchedulerService.createScheduledReport({
        name: formData.name,
        description: formData.description,
        template_id: formData.template_id,
        user_id: userId,
        schedule: {
          frequency: formData.frequency,
          dayOfWeek: formData.frequency === 'weekly' ? formData.dayOfWeek : undefined,
          dayOfMonth: formData.frequency === 'monthly' ? formData.dayOfMonth : undefined,
          hour: formData.hour,
          minute: formData.minute,
          timezone: formData.timezone
        },
        parameters: formData.parameters,
        recipients,
        enabled: true
      });

      if (newReport) {
        setSuccess('Reporte programado creado exitosamente');
        setShowCreateForm(false);
        resetForm();
        loadData();
      } else {
        setError('Error creando reporte programado');
      }
    } catch (error) {
      setError('Error creando reporte programado');
      console.error('Error creando reporte:', error);
    }
  };

  const handleToggleReport = async (reportId: string, enabled: boolean) => {
    try {
      const success = await reportSchedulerService.updateScheduledReport(reportId, { enabled });
      if (success) {
        setSuccess(`Reporte ${enabled ? 'habilitado' : 'deshabilitado'} exitosamente`);
        loadData();
      } else {
        setError('Error actualizando reporte');
      }
    } catch (error) {
      setError('Error actualizando reporte');
      console.error('Error actualizando reporte:', error);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este reporte programado?')) {
      return;
    }

    try {
      const success = await reportSchedulerService.deleteScheduledReport(reportId);
      if (success) {
        setSuccess('Reporte programado eliminado exitosamente');
        loadData();
      } else {
        setError('Error eliminando reporte');
      }
    } catch (error) {
      setError('Error eliminando reporte');
      console.error('Error eliminando reporte:', error);
    }
  };

  const handleExecuteNow = async (reportId: string) => {
    try {
      const execution = await reportSchedulerService.executeScheduledReport(reportId);
      if (execution) {
        setSuccess('Reporte ejecutado exitosamente');
        loadData();
      } else {
        setError('Error ejecutando reporte');
      }
    } catch (error) {
      setError('Error ejecutando reporte');
      console.error('Error ejecutando reporte:', error);
    }
  };

  const loadExecutionHistory = async (reportId: string) => {
    try {
      const history = await reportSchedulerService.getExecutionHistory(reportId);
      setExecutionHistory(history);
    } catch (error) {
      console.error('Error cargando historial:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      template_id: '',
      frequency: 'daily',
      dayOfWeek: 1,
      dayOfMonth: 1,
      hour: 9,
      minute: 0,
      timezone: 'America/Guayaquil',
      recipients: '',
      parameters: {}
    });
  };

  const formatNextRun = (nextRun: string) => {
    return new Date(nextRun).toLocaleString('es-EC');
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels = {
      daily: 'Diario',
      weekly: 'Semanal',
      monthly: 'Mensual',
      quarterly: 'Trimestral',
      yearly: 'Anual'
    };
    return labels[frequency as keyof typeof labels] || frequency;
  };

  const getStatusColor = (enabled: boolean, lastRun?: string) => {
    if (!enabled) return 'bg-gray-100 text-gray-800';
    if (!lastRun) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusLabel = (enabled: boolean, lastRun?: string) => {
    if (!enabled) return 'Deshabilitado';
    if (!lastRun) return 'Pendiente';
    return 'Activo';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Cargando reportes programados...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reportes Programados</h2>
          <p className="text-gray-600">Gestiona la generación automática de reportes</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Reporte
        </Button>
      </div>

      {/* Mensajes */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Lista de reportes */}
      <div className="grid gap-4">
        {scheduledReports.map((report) => (
          <Card key={report.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-lg">{report.name}</h3>
                    <Badge className={getStatusColor(report.enabled, report.last_run)}>
                      {getStatusLabel(report.enabled, report.last_run)}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{report.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>Frecuencia: {getFrequencyLabel(report.schedule.frequency)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>Hora: {report.schedule.hour.toString().padStart(2, '0')}:{report.schedule.minute.toString().padStart(2, '0')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span>Próxima: {report.next_run ? formatNextRun(report.next_run) : 'No programada'}</span>
                    </div>
                  </div>

                  {report.recipients.length > 0 && (
                    <div className="flex items-center space-x-2 mt-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>Destinatarios: {report.recipients.join(', ')}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={report.enabled}
                    onCheckedChange={(checked) => handleToggleReport(report.id, checked)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExecuteNow(report.id)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedReport(report);
                      loadExecutionHistory(report.id);
                    }}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteReport(report.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {scheduledReports.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reportes programados</h3>
            <p className="text-gray-600 mb-4">Crea tu primer reporte programado para automatizar la generación de informes</p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Reporte
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal de creación */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Crear Reporte Programado</CardTitle>
              <CardDescription>
                Configura un reporte que se genere automáticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre del Reporte *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Reporte de Ventas Diario"
                  />
                </div>
                <div>
                  <Label htmlFor="template">Plantilla *</Label>
                  <Select value={formData.template_id} onValueChange={(value) => setFormData({...formData, template_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar plantilla" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descripción del reporte"
                  />
                </div>
                <div>
                  <Label htmlFor="frequency">Frecuencia *</Label>
                  <Select value={formData.frequency} onValueChange={(value: any) => setFormData({...formData, frequency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diario</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                      <SelectItem value="quarterly">Trimestral</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="hour">Hora de Ejecución</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      min="0"
                      max="23"
                      value={formData.hour}
                      onChange={(e) => setFormData({...formData, hour: parseInt(e.target.value)})}
                    />
                    <span className="flex items-center">:</span>
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={formData.minute}
                      onChange={(e) => setFormData({...formData, minute: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="recipients">Destinatarios (emails separados por coma)</Label>
                  <Input
                    id="recipients"
                    value={formData.recipients}
                    onChange={(e) => setFormData({...formData, recipients: e.target.value})}
                    placeholder="admin@empresa.com, gerente@empresa.com"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateReport}>
                  Crear Reporte
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de historial */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl">
            <CardHeader>
              <CardTitle>Historial de Ejecuciones - {selectedReport.name}</CardTitle>
              <CardDescription>
                Últimas ejecuciones del reporte programado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {executionHistory.map((execution) => (
                  <div key={execution.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        execution.status === 'completed' ? 'bg-green-500' :
                        execution.status === 'failed' ? 'bg-red-500' :
                        execution.status === 'running' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`} />
                      <div>
                        <div className="font-medium">
                          {new Date(execution.started_at).toLocaleString('es-EC')}
                        </div>
                        <div className="text-sm text-gray-600">
                          Estado: {execution.status} | 
                          Tiempo: {execution.execution_time ? `${execution.execution_time}ms` : 'N/A'} |
                          Tamaño: {execution.file_size ? `${Math.round(execution.file_size / 1024)}KB` : 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {execution.file_url && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Descargar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={() => setSelectedReport(null)}>
                  Cerrar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
