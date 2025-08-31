"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SalesChart } from "@/components/ui/sales-chart";
import { ProductsChart } from "@/components/ui/products-chart";
import { InventoryChart } from "@/components/ui/inventory-chart";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Eye,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Brain,
  Target,
  Award,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

// Importar jsPDF dinámicamente para evitar problemas de SSR
let jsPDF: any = null;
let html2canvas: any = null;

if (typeof window !== 'undefined') {
  import('jspdf').then(module => {
    jsPDF = module.default;
  });
  import('html2canvas').then(module => {
    html2canvas = module.default;
  });
}

interface DashboardMetric {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: any;
  color: string;
  description: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
  }[];
}

// Mock data - En producción esto vendría de la API
const mockMetrics: DashboardMetric[] = [
  {
    id: "ventas_mes",
    title: "Ventas del Mes",
    value: "$45,230",
    change: 12.5,
    changeType: "increase",
    icon: DollarSign,
    color: "text-green-600",
    description: "Total de ventas del mes actual"
  },
  {
    id: "productos_vendidos",
    title: "Productos Vendidos",
    value: "1,247",
    change: 8.2,
    changeType: "increase",
    icon: Package,
    color: "text-blue-600",
    description: "Unidades vendidas este mes"
  },
  {
    id: "clientes_nuevos",
    title: "Clientes Nuevos",
    value: "89",
    change: 15.3,
    changeType: "increase",
    icon: Users,
    color: "text-purple-600",
    description: "Nuevos clientes registrados"
  },
  {
    id: "ordenes_pendientes",
    title: "Órdenes Pendientes",
    value: "23",
    change: -5.1,
    changeType: "decrease",
    icon: ShoppingCart,
    color: "text-orange-600",
    description: "Órdenes en proceso"
  },
  {
    id: "stock_critico",
    title: "Stock Crítico",
    value: "7",
    change: 2.1,
    changeType: "increase",
    icon: AlertTriangle,
    color: "text-red-600",
    description: "Productos con stock bajo"
  },
  {
    id: "satisfaccion",
    title: "Satisfacción",
    value: "4.8",
    change: 0.2,
    changeType: "increase",
    icon: Star,
    color: "text-yellow-600",
    description: "Rating promedio de clientes"
  }
];

const mockTopProducts = [
  { nombre: "Paracetamol 500mg", ventas: 156, crecimiento: 12.5, categoria: "Analgésicos" },
  { nombre: "Vitamina C 1000mg", ventas: 134, crecimiento: 8.7, categoria: "Vitaminas" },
  { nombre: "Ibuprofeno 400mg", ventas: 98, crecimiento: 15.2, categoria: "Antiinflamatorios" },
  { nombre: "Omeprazol 20mg", ventas: 87, crecimiento: 6.3, categoria: "Gastrointestinales" },
  { nombre: "Loratadina 10mg", ventas: 76, crecimiento: 9.8, categoria: "Antihistamínicos" }
];

const mockRecentOrders = [
  { id: "ORD-001", cliente: "María González", total: 45.80, estado: "Completada", fecha: "2024-01-15" },
  { id: "ORD-002", cliente: "Carlos Méndez", total: 128.50, estado: "En Proceso", fecha: "2024-01-15" },
  { id: "ORD-003", cliente: "Ana Rodríguez", total: 67.20, estado: "Completada", fecha: "2024-01-14" },
  { id: "ORD-004", cliente: "Luis Pérez", total: 89.90, estado: "Pendiente", fecha: "2024-01-14" },
  { id: "ORD-005", cliente: "Sofia Torres", total: 156.30, estado: "En Proceso", fecha: "2024-01-13" }
];

const mockStockAlerts = [
  { producto: "Amlodipino 5mg", stock_actual: 8, stock_minimo: 10, categoria: "Cardiovasculares" },
  { producto: "Salbutamol 100mcg", stock_actual: 5, stock_minimo: 15, categoria: "Respiratorios" },
  { producto: "Metformina 500mg", stock_actual: 12, stock_minimo: 20, categoria: "Antidiabéticos" },
  { producto: "Loratadina 10mg", stock_actual: 18, stock_minimo: 25, categoria: "Antihistamínicos" }
];

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("mes");
  const [metrics, setMetrics] = useState<DashboardMetric[]>(mockMetrics);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "Completada": return "bg-green-100 text-green-800";
      case "En Proceso": return "bg-blue-100 text-blue-800";
      case "Pendiente": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "Completada": return CheckCircle;
      case "En Proceso": return Clock;
      case "Pendiente": return AlertTriangle;
      default: return Clock;
    }
  };

  // Función para generar reporte en PDF
  const generatePDFReport = async () => {
    try {
      // Esperar a que las librerías se carguen
      if (!jsPDF || !html2canvas) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!jsPDF || !html2canvas) {
          throw new Error('Librerías de PDF no disponibles');
        }
      }

      setExportProgress('Preparando reporte...');
      
      // Esperar un momento para que todos los elementos se rendericen
      await new Promise(resolve => setTimeout(resolve, 500));

      // Crear elemento HTML temporal para el reporte profesional
      const reportContainer = document.createElement('div');
      reportContainer.style.position = 'absolute';
      reportContainer.style.left = '-9999px';
      reportContainer.style.top = '0';
      reportContainer.style.width = '800px';
      reportContainer.style.backgroundColor = 'white';
      reportContainer.style.fontFamily = 'Arial, sans-serif';
      reportContainer.style.color = '#333';
      reportContainer.style.fontSize = '12px';
      reportContainer.style.lineHeight = '1.4';
      
      // Crear encabezado profesional del reporte
      reportContainer.innerHTML = `
        <div style="text-align: center; border-bottom: 4px solid #3b82f6; padding-bottom: 25px; margin-bottom: 35px;">
          <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; border-radius: 15px; margin-bottom: 20px;">
            <h1 style="color: white; font-size: 28px; margin: 0 0 15px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">📊 REPORTE EXECUTIVO LOGICQP</h1>
            <p style="color: #dbeafe; font-size: 16px; margin: 8px 0; font-weight: 500;">Dashboard Inteligente - Análisis de Rendimiento</p>
            <p style="color: #93c5fd; font-size: 14px; margin: 5px 0;"><strong>Período:</strong> ${selectedPeriod.toUpperCase()}</p>
            <p style="color: #93c5fd; font-size: 14px; margin: 5px 0;"><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
        </div>

        <div style="margin: 35px 0;">
          <h2 style="color: #1e40af; border-bottom: 3px solid #dbeafe; padding-bottom: 12px; font-size: 20px; background: linear-gradient(90deg, #eff6ff, transparent); padding: 15px; border-radius: 8px;">
            📈 RESUMEN EJECUTIVO - MÉTRICAS CLAVE
          </h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0;">
            ${metrics.map(metric => `
              <div style="border: 2px solid #e5e7eb; border-radius: 10px; padding: 20px; background: linear-gradient(135deg, #f9fafb, #f3f4f6); box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="font-weight: bold; color: #1f2937; margin-bottom: 12px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">${metric.title}</div>
                <div style="font-size: 24px; font-weight: bold; color: #059669; margin-bottom: 8px; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">${metric.value}</div>
                <div style="font-size: 13px; color: #6b7280; margin-bottom: 8px;">
                  ${metric.changeType === 'increase' ? '↗️ CRECIMIENTO' : '↘️ DECRECIMIENTO'} ${Math.abs(metric.change)}% vs mes anterior
                </div>
                <div style="font-size: 12px; color: #9ca3af; font-style: italic; line-height: 1.5;">${metric.description}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="margin: 35px 0;">
          <h2 style="color: #1e40af; border-bottom: 3px solid #dbeafe; padding-bottom: 12px; font-size: 20px; background: linear-gradient(90deg, #eff6ff, transparent); padding: 15px; border-radius: 8px;">
            🛒 ANÁLISIS DE ÓRDENES Y VENTAS
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <thead>
              <tr>
                <th style="border: 2px solid #3b82f6; padding: 12px; text-align: left; background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; font-weight: bold; font-size: 13px;">ID</th>
                <th style="border: 2px solid #3b82f6; padding: 12px; text-align: left; background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; font-weight: bold; font-size: 13px;">Cliente</th>
                <th style="border: 2px solid #3b82f6; padding: 12px; text-align: left; background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; font-weight: bold; font-size: 13px;">Total</th>
                <th style="border: 2px solid #3b82f6; padding: 12px; text-align: left; background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; font-weight: bold; font-size: 13px;">Estado</th>
                <th style="border: 2px solid #3b82f6; padding: 12px; text-align: left; background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; font-weight: bold; font-size: 13px;">Fecha</th>
              </tr>
            </thead>
            <tbody>
              ${mockRecentOrders.map(order => `
                <tr style="background: ${order.estado === 'Completada' ? '#f0fdf4' : order.estado === 'Pendiente' ? '#fffbeb' : '#eff6ff'};">
                  <td style="border: 1px solid #d1d5db; padding: 10px; font-weight: bold; color: #1f2937;">${order.id}</td>
                  <td style="border: 1px solid #d1d5db; padding: 10px; color: #374151;">${order.cliente}</td>
                  <td style="border: 1px solid #d1d5db; padding: 10px; font-weight: bold; color: #059669; font-size: 13px;">$${order.total.toFixed(2)}</td>
                  <td style="border: 1px solid #d1d5db; padding: 10px; font-weight: bold; color: ${
                    order.estado === 'Completada' ? '#059669' : 
                    order.estado === 'Pendiente' ? '#d97706' : '#2563eb'
                  };">${order.estado}</td>
                  <td style="border: 1px solid #d1d5db; padding: 10px; color: #6b7280;">${order.fecha}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="margin: 35px 0;">
          <h2 style="color: #1e40af; border-bottom: 3px solid #dbeafe; padding-bottom: 12px; font-size: 20px; background: linear-gradient(90deg, #eff6ff, transparent); padding: 15px; border-radius: 8px;">
            ⚠️ ALERTAS CRÍTICAS DE INVENTARIO
          </h2>
          ${mockStockAlerts.map((alert, index) => `
            <div style="background: linear-gradient(135deg, #fef2f2, #fee2e2); border: 2px solid #fecaca; border-radius: 10px; padding: 18px; margin: 15px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="color: #dc2626; font-weight: bold; margin-bottom: 8px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">🚨 ${alert.producto}</div>
              <div style="font-size: 12px; margin: 4px 0; color: #7f1d1d;"><strong>📂 Categoría:</strong> ${alert.categoria}</div>
              <div style="font-size: 12px; margin: 4px 0; color: #7f1d1d;"><strong>📦 Stock Actual:</strong> <span style="font-weight: bold; color: #dc2626;">${alert.stock_actual} unidades</span></div>
              <div style="font-size: 12px; margin: 4px 0; color: #7f1d1d;"><strong>⚠️ Stock Mínimo:</strong> ${alert.stock_minimo} unidades</div>
              <div style="background: #dc2626; color: white; padding: 5px 10px; border-radius: 5px; font-size: 11px; margin-top: 8px; text-align: center; font-weight: bold;">
                ${alert.stock_actual < alert.stock_minimo ? 'URGENTE: REABASTECER' : 'ATENCIÓN REQUERIDA'}
              </div>
            </div>
          `).join('')}
        </div>

        <div style="margin: 35px 0;">
          <h2 style="color: #1e40af; border-bottom: 3px solid #dbeafe; padding-bottom: 12px; font-size: 20px; background: linear-gradient(90deg, #eff6ff, transparent); padding: 15px; border-radius: 8px;">
            🏆 PRODUCTOS TOP - LÍDERES DE VENTAS
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <thead>
              <tr>
                <th style="border: 2px solid #059669; padding: 12px; text-align: left; background: linear-gradient(135deg, #059669, #047857); color: white; font-weight: bold; font-size: 13px;">🏆 Producto</th>
                <th style="border: 2px solid #059669; padding: 12px; text-align: left; background: linear-gradient(135deg, #059669, #047857); color: white; font-weight: bold; font-size: 13px;">📊 Ventas</th>
                <th style="border: 2px solid #059669; padding: 12px; text-align: left; background: linear-gradient(135deg, #059669, #047857); color: white; font-weight: bold; font-size: 13px;">📈 Crecimiento</th>
                <th style="border: 2px solid #059669; padding: 12px; text-align: left; background: linear-gradient(135deg, #059669, #047857); color: white; font-weight: bold; font-size: 13px;">📂 Categoría</th>
              </tr>
            </thead>
            <tbody>
              ${mockTopProducts.map((product, index) => `
                <tr style="background: ${index === 0 ? '#fef3c7' : index === 1 ? '#f3e8ff' : index === 2 ? '#dbeafe' : '#f0fdf4'};">
                  <td style="border: 1px solid #d1d5db; padding: 10px; font-weight: bold; color: #1f2937;">
                    ${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📦'} ${product.nombre}
                  </td>
                  <td style="border: 1px solid #d1d5db; padding: 10px; font-weight: bold; color: #059669; font-size: 13px;">${product.ventas} unidades</td>
                  <td style="border: 1px solid #d1d5db; padding: 10px; color: #047857; font-weight: bold;">+${product.crecimiento}%</td>
                  <td style="border: 1px solid #d1d5db; padding: 10px; color: #6b7280;">${product.categoria}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="margin: 35px 0;">
          <h2 style="color: #1e40af; border-bottom: 3px solid #dbeafe; padding-bottom: 12px; font-size: 20px; background: linear-gradient(90deg, #eff6ff, transparent); padding: 15px; border-radius: 8px;">
            📊 CAPTURA VISUAL COMPLETA DEL DASHBOARD
          </h2>
          <div style="background: linear-gradient(135deg, #f8fafc, #e2e8f0); border: 2px dashed #3b82f6; border-radius: 10px; padding: 25px; text-align: center; margin: 20px 0;">
            <div style="color: #1e40af; font-size: 16px; font-weight: bold; margin-bottom: 10px;">🖼️ Dashboard Completo con Gráficas</div>
            <div style="color: #64748b; font-size: 12px; line-height: 1.6;">
              A continuación se incluye la captura visual completa del dashboard actual, incluyendo todas las gráficas, métricas visuales y elementos interactivos.
            </div>
          </div>
        </div>

        <div style="margin-top: 50px; text-align: center; color: #6b7280; font-size: 11px; border-top: 2px solid #e5e7eb; padding-top: 25px; background: linear-gradient(135deg, #f9fafb, #f3f4f6); border-radius: 10px; padding: 20px;">
          <p style="margin: 5px 0; font-weight: bold; color: #374151;">📋 Este reporte fue generado automáticamente por el sistema LogicQP</p>
          <p style="margin: 5px 0; color: #6b7280;">Sistema de Gestión Farmacéutica Inteligente</p>
          <p style="margin: 5px 0; color: #9ca3af;">© ${new Date().getFullYear()} LogicQP - Todos los derechos reservados</p>
        </div>
      `;

      // Agregar al DOM temporalmente
      document.body.appendChild(reportContainer);

      try {
        setExportProgress('Generando reporte estructurado...');
        
        // Convertir el reporte estructurado a canvas
        const reportCanvas = await html2canvas(reportContainer, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });

        setExportProgress('Capturando dashboard visual...');
        
        // Capturar el dashboard completo
        const dashboardElement = document.querySelector('.min-h-screen');
        if (!dashboardElement) {
          throw new Error('No se pudo encontrar el dashboard');
        }

        const dashboardCanvas = await html2canvas(dashboardElement as HTMLElement, {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: dashboardElement.scrollWidth,
          height: dashboardElement.scrollHeight,
          scrollX: 0,
          scrollY: 0,
          windowWidth: dashboardElement.scrollWidth,
          windowHeight: dashboardElement.scrollHeight
        });

        setExportProgress('Generando PDF final...');

        // Crear PDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 295; // A4 height in mm

        // Primera página: Reporte estructurado
        const reportImgHeight = (reportCanvas.height * imgWidth) / reportCanvas.width;
        pdf.addImage(reportCanvas, 'PNG', 0, 0, imgWidth, reportImgHeight);

        // Páginas adicionales del reporte si es necesario
        let heightLeft = reportImgHeight - pageHeight;
        while (heightLeft >= 0) {
          pdf.addPage();
          pdf.addImage(reportCanvas, 'PNG', 0, -heightLeft, imgWidth, reportImgHeight);
          heightLeft -= pageHeight;
        }

        // Páginas del dashboard visual
        const dashboardImgHeight = (dashboardCanvas.height * imgWidth) / dashboardCanvas.width;
        heightLeft = dashboardImgHeight;

        while (heightLeft >= 0) {
          pdf.addPage();
          const position = heightLeft - dashboardImgHeight;
          pdf.addImage(dashboardCanvas, 'PNG', 0, position, imgWidth, dashboardImgHeight);
          heightLeft -= pageHeight;
        }

        // Generar nombre del archivo
        const fileName = `reporte-ejecutivo-completo-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.pdf`;

        setExportProgress('Finalizando...');
        
        // Descargar PDF
        pdf.save(fileName);

        // Mostrar mensaje de éxito
        showSuccessToast('Reporte ejecutivo completo generado exitosamente');

      } finally {
        // Limpiar elemento temporal
        document.body.removeChild(reportContainer);
      }

      return true;
    } catch (error) {
      console.error('Error generando PDF:', error);
      showErrorToast('Error al generar PDF: ' + error.message);
      return false;
    }
  };

  // Función para generar reporte en Excel
  const generateExcelReport = async () => {
    try {
      // Simular generación de Excel
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Crear datos para Excel (CSV)
      const csvData = [
        ['Métrica', 'Valor', 'Cambio (%)', 'Descripción'],
        ['Ventas del Mes', metrics.find(m => m.id === 'ventas_mes')?.value, metrics.find(m => m.id === 'ventas_mes')?.change, 'Total de ventas del mes actual'],
        ['Productos Vendidos', metrics.find(m => m.id === 'productos_vendidos')?.value, metrics.find(m => m.id === 'productos_vendidos')?.change, 'Unidades vendidas este mes'],
        ['Clientes Nuevos', metrics.find(m => m.id === 'clientes_nuevos')?.value, metrics.find(m => m.id === 'clientes_nuevos')?.change, 'Nuevos clientes registrados'],
        ['Órdenes Pendientes', metrics.find(m => m.id === 'ordenes_pendientes')?.value, metrics.find(m => m.id === 'ordenes_pendientes')?.change, 'Órdenes en proceso'],
        ['Stock Crítico', metrics.find(m => m.id === 'stock_critico')?.value, metrics.find(m => m.id === 'stock_critico')?.change, 'Productos con stock bajo'],
      ];
      
      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-excel-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error generando Excel:', error);
      return false;
    }
  };

  // Función principal de exportación
  const handleExportReport = async () => {
    setIsExporting(true);
    setExportProgress('');
    
    try {
      // Mostrar modal de selección de formato
      const format = await showExportFormatModal();
      
      if (!format) {
        setIsExporting(false);
        setExportProgress('');
        return;
      }
      
      let success = false;
      
      if (format === 'pdf') {
        setExportProgress('Generando PDF...');
        success = await generatePDFReport();
      } else if (format === 'excel') {
        setExportProgress('Generando Excel...');
        success = await generateExcelReport();
      }
      
      if (success) {
        showSuccessToast(`Reporte exportado exitosamente en formato ${format.toUpperCase()}`);
      } else {
        showErrorToast('Error al exportar el reporte');
      }
    } catch (error) {
      console.error('Error en exportación:', error);
      showErrorToast('Error inesperado al exportar');
    } finally {
      setIsExporting(false);
      setExportProgress('');
    }
  };

  // Modal para seleccionar formato de exportación
  const showExportFormatModal = (): Promise<string | null> => {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
      modal.innerHTML = `
        <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4 transform transition-all duration-300 scale-95 opacity-0">
          <div class="text-center mb-6">
            <svg class="h-12 w-12 text-blue-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <h3 class="text-xl font-bold text-gray-900">Exportar Reporte</h3>
            <p class="text-gray-600">Selecciona el formato de exportación</p>
          </div>
          
          <div class="space-y-3 mb-6">
                         <button 
               class="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
               onclick="this.closest('.fixed').remove(); window.resolveExportFormat('pdf');"
             >
               <div class="flex items-center space-x-3">
                 <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                   <svg class="h-6 w-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                     <path d="M4 18h12V6l-4-4H4v16z"/>
                   </svg>
                 </div>
                 <div>
                   <p class="font-semibold text-gray-900">Reporte Ejecutivo</p>
                   <p class="text-sm text-gray-500">Análisis estructurado + Dashboard visual completo</p>
                 </div>
               </div>
             </button>
            
            <button 
              class="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-left group"
              onclick="this.closest('.fixed').remove(); window.resolveExportFormat('excel');"
            >
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <svg class="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 18h12V6l-4-4H4v16z"/>
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-gray-900">Excel (CSV)</p>
                  <p class="text-sm text-gray-500">Datos tabulares para análisis</p>
                </div>
              </div>
            </button>
          </div>
          
          <div class="flex space-x-3">
            <button 
              class="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              onclick="this.closest('.fixed').remove(); window.resolveExportFormat(null);"
            >
              Cancelar
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Configurar función global para resolver el formato
      (window as any).resolveExportFormat = (format: string | null) => {
        resolve(format);
        delete (window as any).resolveExportFormat;
      };
      
      // Animar entrada del modal
      setTimeout(() => {
        const content = modal.querySelector('.bg-white');
        if (content) {
          content.classList.remove('scale-95', 'opacity-0');
        }
      }, 100);
      
      // Cerrar modal al hacer clic fuera
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.remove();
          resolve(null);
        }
      });
    });
  };

  // Funciones para mostrar notificaciones
  const showSuccessToast = (message: string) => {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
    toast.innerHTML = `
      <div class="flex items-center space-x-2">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.remove('translate-x-full'), 100);
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  const showErrorToast = (message: string) => {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
    toast.innerHTML = `
      <div class="flex items-center space-x-2">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.remove('translate-x-full'), 100);
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Inteligente</h1>
              <p className="text-gray-600 mt-1">
                Métricas en tiempo real y análisis avanzado de tu farmacia
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semana">Esta Semana</SelectItem>
                  <SelectItem value="mes">Este Mes</SelectItem>
                  <SelectItem value="trimestre">Este Trimestre</SelectItem>
                  <SelectItem value="año">Este Año</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExportReport}
                disabled={isExporting}
                className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mr-2"></div>
                    {exportProgress || 'Exportando...'}
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Exportar Reporte
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.id} className="hover:shadow-lg transition-shadow border-0 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {metric.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                  <div className="flex items-center space-x-2 mt-2">
                    {metric.changeType === "increase" ? (
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      metric.changeType === "increase" ? "text-green-600" : "text-red-600"
                    }`}>
                      {metric.change}%
                    </span>
                    <span className="text-sm text-gray-500">vs mes anterior</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{metric.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sales Chart */}
          <SalesChart period={selectedPeriod} />

          {/* Top Products */}
          <ProductsChart data={mockTopProducts} maxItems={10} />
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Inventory Chart */}
          <InventoryChart />

          {/* Performance Metrics */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-purple-600" />
                <span>Métricas de Rendimiento</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Target className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Eficiencia de Inventario</p>
                      <p className="text-sm text-gray-600">Rotación y gestión de stock</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">87.3%</p>
                    <p className="text-sm text-green-600">+2.1% vs mes anterior</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Tiempo de Entrega</p>
                      <p className="text-sm text-gray-600">Promedio de cumplimiento</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">2.3 días</p>
                    <p className="text-sm text-green-600">-0.5 días vs mes anterior</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Star className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Satisfacción del Cliente</p>
                      <p className="text-sm text-gray-600">Rating promedio</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-yellow-600">4.8/5.0</p>
                    <p className="text-sm text-green-600">+0.1 vs mes anterior</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Orders */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-green-600" />
                <span>Órdenes Recientes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockRecentOrders.map((order) => {
                  const StatusIcon = getStatusIcon(order.estado);
                  return (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">{order.id.slice(-3)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{order.cliente}</p>
                          <p className="text-sm text-gray-500">{order.fecha}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${order.total}</p>
                        <Badge className={getStatusColor(order.estado)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {order.estado}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Stock Alerts */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span>Alertas de Stock</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockStockAlerts.map((alert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{alert.producto}</p>
                        <p className="text-sm text-gray-500">{alert.categoria}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        Stock: <span className="font-semibold text-red-600">{alert.stock_actual}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        Mínimo: {alert.stock_minimo}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-purple-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-yellow-300" />
              <span>Insights de IA</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Target className="h-12 w-12 text-yellow-300 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Predicción de Demanda</h4>
                <p className="text-blue-100 text-sm">
                  Se espera un aumento del 15% en ventas de vitaminas para el próximo mes
                </p>
              </div>
              <div className="text-center">
                <Zap className="h-12 w-12 text-yellow-300 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Optimización de Inventario</h4>
                <p className="text-blue-100 text-sm">
                  Recomendamos aumentar stock de analgésicos en un 20%
                </p>
              </div>
              <div className="text-center">
                <Activity className="h-12 w-12 text-yellow-300 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Tendencias de Mercado</h4>
                <p className="text-blue-100 text-sm">
                  Los suplementos inmunes muestran crecimiento sostenido del 25%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
