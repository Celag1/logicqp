"use client";

import { supabase } from '@/lib/supabase';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'sales' | 'inventory' | 'financial' | 'custom';
  parameters: Record<string, any>;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  template: string;
  created_at: string;
  updated_at: string;
}

export interface ScheduledReport {
  id: string;
  name: string;
  description: string;
  template_id: string;
  user_id: string;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
    dayOfWeek?: number; // 0-6 (Sunday-Saturday)
    dayOfMonth?: number; // 1-31
    hour: number; // 0-23
    minute: number; // 0-59
    timezone: string;
    customCron?: string;
  };
  parameters: Record<string, any>;
  recipients: string[];
  enabled: boolean;
  last_run?: string;
  next_run?: string;
  created_at: string;
  updated_at: string;
}

export interface ReportExecution {
  id: string;
  scheduled_report_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  file_url?: string;
  error_message?: string;
  parameters: Record<string, any>;
  file_size?: number;
  execution_time?: number;
}

export interface ReportData {
  title: string;
  period: string;
  generated_at: string;
  data: any[];
  summary: {
    total_records: number;
    total_amount?: number;
    currency?: string;
    filters_applied: string[];
  };
  metadata: {
    template_version: string;
    generated_by: string;
    parameters: Record<string, any>;
  };
}

class ReportSchedulerService {
  private templatesTable = 'report_templates';
  private scheduledReportsTable = 'scheduled_reports';
  private executionsTable = 'report_executions';

  /**
   * Obtener todas las plantillas de reportes
   */
  async getReportTemplates(): Promise<ReportTemplate[]> {
    try {
      const { data, error } = await supabase
        .from(this.templatesTable)
        .select('*')
        .order('name');

      if (error) {
        console.error('Error obteniendo plantillas:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error obteniendo plantillas:', error);
      return [];
    }
  }

  /**
   * Crear nueva plantilla de reporte
   */
  async createReportTemplate(template: Omit<ReportTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<ReportTemplate | null> {
    try {
      const { data, error } = await supabase
        .from(this.templatesTable)
        .insert({
          ...template,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creando plantilla:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creando plantilla:', error);
      return null;
    }
  }

  /**
   * Obtener reportes programados del usuario
   */
  async getScheduledReports(userId: string): Promise<ScheduledReport[]> {
    try {
      const { data, error } = await supabase
        .from(this.scheduledReportsTable)
        .select(`
          *,
          report_templates(name, description, type)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error obteniendo reportes programados:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error obteniendo reportes programados:', error);
      return [];
    }
  }

  /**
   * Crear reporte programado
   */
  async createScheduledReport(report: Omit<ScheduledReport, 'id' | 'created_at' | 'updated_at' | 'last_run' | 'next_run'>): Promise<ScheduledReport | null> {
    try {
      const nextRun = this.calculateNextRun(report.schedule);
      
      const { data, error } = await supabase
        .from(this.scheduledReportsTable)
        .insert({
          ...report,
          next_run: nextRun.toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creando reporte programado:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creando reporte programado:', error);
      return null;
    }
  }

  /**
   * Actualizar reporte programado
   */
  async updateScheduledReport(id: string, updates: Partial<ScheduledReport>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.scheduledReportsTable)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error actualizando reporte programado:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error actualizando reporte programado:', error);
      return false;
    }
  }

  /**
   * Eliminar reporte programado
   */
  async deleteScheduledReport(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.scheduledReportsTable)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error eliminando reporte programado:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error eliminando reporte programado:', error);
      return false;
    }
  }

  /**
   * Ejecutar reporte programado
   */
  async executeScheduledReport(scheduledReportId: string): Promise<ReportExecution | null> {
    try {
      console.log('📊 Ejecutando reporte programado:', scheduledReportId);

      // Crear registro de ejecución
      const execution: Omit<ReportExecution, 'id'> = {
        scheduled_report_id: scheduledReportId,
        status: 'running',
        started_at: new Date().toISOString(),
        parameters: {}
      };

      const { data: executionData, error: executionError } = await supabase
        .from(this.executionsTable)
        .insert(execution)
        .select()
        .single();

      if (executionError) {
        console.error('Error creando ejecución:', executionError);
        return null;
      }

      // Obtener configuración del reporte
      const { data: reportData, error: reportError } = await supabase
        .from(this.scheduledReportsTable)
        .select(`
          *,
          report_templates(*)
        `)
        .eq('id', scheduledReportId)
        .single();

      if (reportError || !reportData) {
        console.error('Error obteniendo reporte:', reportError);
        return null;
      }

      // Generar reporte
      const reportResult = await this.generateReport(reportData);

      // Actualizar ejecución
      const updateData: Partial<ReportExecution> = {
        status: reportResult.success ? 'completed' : 'failed',
        completed_at: new Date().toISOString(),
        file_url: reportResult.fileUrl,
        error_message: reportResult.error,
        file_size: reportResult.fileSize,
        execution_time: reportResult.executionTime
      };

      await supabase
        .from(this.executionsTable)
        .update(updateData)
        .eq('id', executionData.id);

      // Actualizar próxima ejecución
      if (reportResult.success) {
        const nextRun = this.calculateNextRun(reportData.schedule);
        await supabase
          .from(this.scheduledReportsTable)
          .update({
            last_run: new Date().toISOString(),
            next_run: nextRun.toISOString()
          })
          .eq('id', scheduledReportId);
      }

      return {
        ...executionData,
        ...updateData
      };

    } catch (error) {
      console.error('Error ejecutando reporte programado:', error);
      return null;
    }
  }

  /**
   * Obtener historial de ejecuciones
   */
  async getExecutionHistory(scheduledReportId: string, limit: number = 50): Promise<ReportExecution[]> {
    try {
      const { data, error } = await supabase
        .from(this.executionsTable)
        .select('*')
        .eq('scheduled_report_id', scheduledReportId)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error obteniendo historial:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      return [];
    }
  }

  /**
   * Obtener reportes listos para ejecutar
   */
  async getReportsToExecute(): Promise<ScheduledReport[]> {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from(this.scheduledReportsTable)
        .select(`
          *,
          report_templates(*)
        `)
        .eq('enabled', true)
        .lte('next_run', now)
        .order('next_run');

      if (error) {
        console.error('Error obteniendo reportes para ejecutar:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error obteniendo reportes para ejecutar:', error);
      return [];
    }
  }

  /**
   * Generar reporte
   */
  private async generateReport(scheduledReport: any): Promise<{
    success: boolean;
    fileUrl?: string;
    fileSize?: number;
    executionTime?: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      console.log('📈 Generando reporte:', scheduledReport.name);

      // Obtener datos según el tipo de reporte
      const reportData = await this.fetchReportData(scheduledReport);

      // Generar archivo según formato
      const fileResult = await this.generateReportFile(reportData, scheduledReport);

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        fileUrl: fileResult.url,
        fileSize: fileResult.size,
        executionTime
      };

    } catch (error) {
      console.error('Error generando reporte:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Obtener datos del reporte
   */
  private async fetchReportData(scheduledReport: any): Promise<ReportData> {
    const template = scheduledReport.report_templates;
    const parameters = scheduledReport.parameters;

    let data: any[] = [];
    let summary: any = {};

    switch (template.type) {
      case 'sales':
        data = await this.fetchSalesData(parameters);
        summary = this.calculateSalesSummary(data);
        break;
      case 'inventory':
        data = await this.fetchInventoryData(parameters);
        summary = this.calculateInventorySummary(data);
        break;
      case 'financial':
        data = await this.fetchFinancialData(parameters);
        summary = this.calculateFinancialSummary(data);
        break;
      default:
        data = [];
        summary = { total_records: 0 };
    }

    return {
      title: scheduledReport.name,
      period: this.getReportPeriod(parameters),
      generated_at: new Date().toISOString(),
      data,
      summary,
      metadata: {
        template_version: '1.0',
        generated_by: scheduledReport.user_id,
        parameters
      }
    };
  }

  /**
   * Obtener datos de ventas
   */
  private async fetchSalesData(parameters: any): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('ventas')
        .select(`
          *,
          clientes(nombre, email),
          productos(nombre, precio_venta)
        `)
        .gte('fecha_venta', parameters.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .lte('fecha_venta', parameters.endDate || new Date().toISOString())
        .order('fecha_venta', { ascending: false });

      return data || [];
    } catch (error) {
      console.error('Error obteniendo datos de ventas:', error);
      return [];
    }
  }

  /**
   * Obtener datos de inventario
   */
  private async fetchInventoryData(parameters: any): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select(`
          *,
          categorias(nombre),
          proveedores(nombre)
        `)
        .eq('activo', true)
        .order('nombre');

      return data || [];
    } catch (error) {
      console.error('Error obteniendo datos de inventario:', error);
      return [];
    }
  }

  /**
   * Obtener datos financieros
   */
  private async fetchFinancialData(parameters: any): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('ventas')
        .select('*')
        .gte('fecha_venta', parameters.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .lte('fecha_venta', parameters.endDate || new Date().toISOString())
        .order('fecha_venta', { ascending: false });

      return data || [];
    } catch (error) {
      console.error('Error obteniendo datos financieros:', error);
      return [];
    }
  }

  /**
   * Calcular resumen de ventas
   */
  private calculateSalesSummary(data: any[]): any {
    const totalAmount = data.reduce((sum, item) => sum + (item.total || 0), 0);
    const totalRecords = data.length;
    
    return {
      total_records: totalRecords,
      total_amount: totalAmount,
      currency: 'USD',
      filters_applied: ['Fecha', 'Estado']
    };
  }

  /**
   * Calcular resumen de inventario
   */
  private calculateInventorySummary(data: any[]): any {
    const totalRecords = data.length;
    const lowStock = data.filter(item => item.stock_disponible <= item.stock_minimo).length;
    
    return {
      total_records: totalRecords,
      low_stock_items: lowStock,
      filters_applied: ['Categoría', 'Proveedor', 'Estado']
    };
  }

  /**
   * Calcular resumen financiero
   */
  private calculateFinancialSummary(data: any[]): any {
    const totalAmount = data.reduce((sum, item) => sum + (item.total || 0), 0);
    const totalRecords = data.length;
    
    return {
      total_records: totalRecords,
      total_amount: totalAmount,
      currency: 'USD',
      filters_applied: ['Período', 'Tipo']
    };
  }

  /**
   * Generar archivo de reporte
   */
  private async generateReportFile(reportData: ReportData, scheduledReport: any): Promise<{ url: string; size: number }> {
    // Simulación de generación de archivo
    const fileName = `${scheduledReport.name}_${Date.now()}.${scheduledReport.format}`;
    const fileSize = Math.floor(Math.random() * 1000000) + 100000; // 100KB - 1MB
    
    // En producción aquí generarías el archivo real (PDF, Excel, etc.)
    const fileUrl = `/reports/${fileName}`;
    
    return { url: fileUrl, size: fileSize };
  }

  /**
   * Calcular próxima ejecución
   */
  private calculateNextRun(schedule: any): Date {
    const now = new Date();
    const nextRun = new Date(now);
    
    switch (schedule.frequency) {
      case 'daily':
        nextRun.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        nextRun.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        nextRun.setMonth(now.getMonth() + 1);
        break;
      case 'quarterly':
        nextRun.setMonth(now.getMonth() + 3);
        break;
      case 'yearly':
        nextRun.setFullYear(now.getFullYear() + 1);
        break;
    }
    
    nextRun.setHours(schedule.hour, schedule.minute, 0, 0);
    
    return nextRun;
  }

  /**
   * Obtener período del reporte
   */
  private getReportPeriod(parameters: any): string {
    const startDate = parameters.startDate ? new Date(parameters.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = parameters.endDate ? new Date(parameters.endDate) : new Date();
    
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  }
}

export const reportSchedulerService = new ReportSchedulerService();
