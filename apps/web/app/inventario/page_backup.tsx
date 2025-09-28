"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Shield,
  Heart,
  Pill,
  Sparkles,
  Calendar,
  DollarSign,
  Users,
  ShoppingCart
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

interface InventoryItem {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  marca: string;
  stock_actual: number;
  stock_minimo: number;
  stock_maximo: number;
  precio_compra: number;
  precio_venta: number;
  proveedor: string;
  fecha_vencimiento?: string;
  ubicacion: string;
  estado: 'activo' | 'inactivo' | 'agotado';
  ultima_actualizacion: string;
}

// Mock data - En producción esto vendría de Supabase
const mockInventory: InventoryItem[] = [
  {
    id: "1",
    codigo: "QPH-001",
    nombre: "Paracetamol 500mg",
    categoria: "Analgésicos",
    marca: "Qualipharm",
    stock_actual: 150,
    stock_minimo: 50,
    stock_maximo: 500,
    precio_compra: 1.80,
    precio_venta: 2.50,
    proveedor: "Distribuidora Central",
    fecha_vencimiento: "2025-12-31",
    ubicacion: "Estante A-1",
    estado: "activo",
    ultima_actualizacion: "2024-01-15"
  },
  {
    id: "2",
    codigo: "QPH-002",
    nombre: "Ibuprofeno 400mg",
    categoria: "Antiinflamatorios",
    marca: "Qualipharm",
    stock_actual: 89,
    stock_minimo: 75,
    stock_maximo: 300,
    precio_compra: 2.10,
    precio_venta: 3.20,
    proveedor: "Distribuidora Central",
    fecha_vencimiento: "2025-10-15",
    ubicacion: "Estante A-2",
    estado: "activo",
    ultima_actualizacion: "2024-01-15"
  },
  {
    id: "3",
    codigo: "QPH-003",
    nombre: "Vitamina C 1000mg",
    categoria: "Vitaminas",
    marca: "Qualipharm",
    stock_actual: 200,
    stock_minimo: 100,
    stock_maximo: 600,
    precio_compra: 5.20,
    precio_venta: 8.90,
    proveedor: "Suplementos Plus",
    fecha_vencimiento: "2026-03-20",
    ubicacion: "Estante B-1",
    estado: "activo",
    ultima_actualizacion: "2024-01-15"
  },
  {
    id: "4",
    codigo: "QPH-004",
    nombre: "Omeprazol 20mg",
    categoria: "Gastrointestinales",
    marca: "Qualipharm",
    stock_actual: 67,
    stock_minimo: 80,
    stock_maximo: 250,
    precio_compra: 8.50,
    precio_venta: 12.50,
    proveedor: "Medicamentos Pro",
    fecha_vencimiento: "2025-08-10",
    ubicacion: "Estante C-1",
    estado: "activo",
    ultima_actualizacion: "2024-01-15"
  },
  {
    id: "5",
    codigo: "QPH-005",
    nombre: "Loratadina 10mg",
    categoria: "Antihistamínicos",
    marca: "Qualipharm",
    stock_actual: 120,
    stock_minimo: 60,
    stock_maximo: 400,
    precio_compra: 4.20,
    precio_venta: 6.80,
    proveedor: "Distribuidora Central",
    fecha_vencimiento: "2025-11-30",
    ubicacion: "Estante D-1",
    estado: "activo",
    ultima_actualizacion: "2024-01-15"
  }
];

const categories = [
  "Todas",
  "Analgésicos",
  "Antiinflamatorios", 
  "Antibióticos",
  "Antihistamínicos",
  "Vitaminas",
  "Dermatológicos",
  "Oftalmológicos",
  "Cardiovasculares",
  "Gastrointestinales",
  "Respiratorios",
  "Antidiabéticos",
  "Endocrinológicos",
  "Hormonales"
];

const suppliers = [
  "Todos",
  "Distribuidora Central",
  "Suplementos Plus",
  "Medicamentos Pro",
  "Farmacéutica Nacional"
];

export default function InventarioPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>(inventory);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedSupplier, setSelectedSupplier] = useState("Todos");
  const [stockFilter, setStockFilter] = useState("todos");
  const [sortBy, setSortBy] = useState("nombre");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "table">("table");
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');

  // Filtrado inteligente
  useEffect(() => {
    let filtered = inventory;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        return (
          item.nombre.toLowerCase().includes(searchLower) ||
          item.codigo.toLowerCase().includes(searchLower) ||
          item.categoria.toLowerCase().includes(searchLower) ||
          item.marca.toLowerCase().includes(searchLower) ||
          item.proveedor.toLowerCase().includes(searchLower)
        );
      });
    }

    // Filtro por categoría
    if (selectedCategory !== "Todas") {
      filtered = filtered.filter(item => item.categoria === selectedCategory);
    }

    // Filtro por proveedor
    if (selectedSupplier !== "Todos") {
      filtered = filtered.filter(item => item.proveedor === selectedSupplier);
    }

    // Filtro por stock
    switch (stockFilter) {
      case "bajo":
        filtered = filtered.filter(item => item.stock_actual <= item.stock_minimo);
        break;
      case "agotado":
        filtered = filtered.filter(item => item.stock_actual === 0);
        break;
      case "exceso":
        filtered = filtered.filter(item => item.stock_actual > item.stock_maximo);
        break;
      case "normal":
        filtered = filtered.filter(item => 
          item.stock_actual > item.stock_minimo && 
          item.stock_actual <= item.stock_maximo
        );
        break;
    }

    // Ordenamiento
    switch (sortBy) {
      case "nombre":
        filtered = [...filtered].sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case "stock":
        filtered = [...filtered].sort((a, b) => a.stock_actual - b.stock_actual);
        break;
      case "precio":
        filtered = [...filtered].sort((a, b) => a.precio_venta - b.precio_venta);
        break;
      case "categoria":
        filtered = [...filtered].sort((a, b) => a.categoria.localeCompare(b.categoria));
        break;
      case "fecha":
        filtered = [...filtered].sort((a, b) => 
          new Date(a.ultima_actualizacion).getTime() - new Date(b.ultima_actualizacion).getTime()
        );
        break;
    }

    setFilteredInventory(filtered);
  }, [inventory, searchTerm, selectedCategory, selectedSupplier, stockFilter, sortBy]);

  const getStockStatus = (item: InventoryItem) => {
    if (item.stock_actual === 0) {
      return { status: "Agotado", color: "destructive", icon: AlertTriangle };
    }
    if (item.stock_actual <= item.stock_minimo) {
      return { status: "Stock Bajo", color: "destructive", icon: AlertTriangle };
    }
    if (item.stock_actual > item.stock_maximo) {
      return { status: "Exceso", color: "warning", icon: TrendingUp };
    }
    return { status: "Normal", color: "default", icon: CheckCircle };
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Analgésicos": return Pill;
      case "Vitaminas": return Sparkles;
      case "Cardiovasculares": return Heart;
      case "Respiratorios": return TrendingUp;
      case "Gastrointestinales": return Shield;
      case "Antihistamínicos": return Zap;
      case "Endocrinológicos": return Activity;
      default: return Package;
    }
  };

  const getInventoryStats = () => {
    const total = inventory.length;
    const activos = inventory.filter(item => item.estado === 'activo').length;
    const stockBajo = inventory.filter(item => item.stock_actual <= item.stock_minimo).length;
    const agotados = inventory.filter(item => item.stock_actual === 0).length;
    const valorTotal = inventory.reduce((total, item) => total + (item.precio_compra * item.stock_actual), 0);

    return { 
      totalProducts: total, 
      activeProducts: activos, 
      lowStock: stockBajo, 
      agotados, 
      totalValue: valorTotal 
    };
  };

  const stats = getInventoryStats();

  // Funciones de exportación
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
      
      // Título del reporte
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Reporte de Inventario - LogicQP', 20, 30);
      
      // Fecha de generación
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, 20, 40);
      
      // Estadísticas generales
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumen General', 20, 60);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total de productos: ${stats.totalProducts}`, 20, 75);
      doc.text(`Valor total del inventario: $${stats.totalValue.toLocaleString()}`, 20, 85);
      doc.text(`Productos con stock bajo: ${stats.lowStock}`, 20, 95);
      doc.text(`Productos activos: ${stats.activeProducts}`, 20, 105);
      
      // Tabla de productos
      let yPosition = 125;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Detalle de Productos', 20, yPosition);
      
      yPosition += 15;
      
      // Encabezados de la tabla
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Código', 20, yPosition);
      doc.text('Producto', 50, yPosition);
      doc.text('Categoría', 100, yPosition);
      doc.text('Stock', 140, yPosition);
      doc.text('Precio Venta', 160, yPosition);
      doc.text('Estado', 190, yPosition);
      
      yPosition += 10;
      
      // Línea separadora
      doc.line(20, yPosition, 200, yPosition);
      yPosition += 5;
      
      // Datos de productos
      doc.setFont('helvetica', 'normal');
      filteredInventory.forEach((item, index) => {
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.text(item.codigo, 20, yPosition);
        doc.text(item.nombre.length > 20 ? item.nombre.substring(0, 20) + '...' : item.nombre, 50, yPosition);
        doc.text(item.categoria, 100, yPosition);
        doc.text(item.stock_actual.toString(), 140, yPosition);
        doc.text(`$${item.precio_venta}`, 160, yPosition);
        doc.text(item.estado, 190, yPosition);
        
        yPosition += 8;
      });
      
      // Guardar el PDF
      const fileName = `inventario_logicqp_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      setExportProgress('Reporte generado exitosamente');
      return true;
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      showErrorToast('Error al generar PDF: ' + (error instanceof Error ? error.message : String(error)));
      return false;
    }
  };

  const generateExcelReport = async () => {
    try {
      setExportProgress('Generando Excel...');
      
      // Crear datos para Excel (CSV)
      const csvData = [
        ['Código', 'Producto', 'Categoría', 'Marca', 'Stock Actual', 'Stock Mínimo', 'Stock Máximo', 'Precio Compra', 'Precio Venta', 'Proveedor', 'Ubicación', 'Estado', 'Última Actualización'],
        ...filteredInventory.map(item => [
          item.codigo,
          item.nombre,
          item.categoria,
          item.marca,
          item.stock_actual.toString(),
          item.stock_minimo.toString(),
          item.stock_maximo.toString(),
          item.precio_compra.toString(),
          item.precio_venta.toString(),
          item.proveedor,
          item.ubicacion,
          item.estado,
          item.ultima_actualizacion
        ])
      ];
      
      // Convertir a CSV
      const csvContent = csvData.map(row => row.join(',')).join('\n');
      
      // Crear y descargar archivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `inventario_logicqp_${new Date().toISOString().split('T')[0]}.csv`);
      link.className = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setExportProgress('Archivo Excel generado exitosamente');
      return true;
      
    } catch (error) {
      console.error('Error generando Excel:', error);
      showErrorToast('Error al generar Excel: ' + (error instanceof Error ? error.message : String(error)));
      return false;
    }
  };

  const handleExportReport = async () => {
    try {
      setIsExporting(true);
      setExportProgress('');
      
      const format = await showExportFormatModal();
      if (!format) {
        setIsExporting(false);
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
        showSuccessToast(`Reporte de inventario exportado exitosamente en formato ${format.toUpperCase()}`);
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
      // Limpiar función anterior si existe
      if ((window as any).resolveExportFormat) {
        delete (window as any).resolveExportFormat;
      }

      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
      modal.innerHTML = `
        <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4 transform transition-all duration-300 scale-95 opacity-0">
          <div class="text-center mb-6">
            <svg class="h-12 w-12 text-blue-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <h3 class="text-xl font-bold text-gray-900">Exportar Inventario</h3>
            <p class="text-gray-600">Selecciona el formato de exportación</p>
          </div>
          
          <div class="space-y-3 mb-6">
            <button 
              class="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
              onclick="window.resolveExportFormat('pdf');"
            >
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                  <svg class="h-6 w-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 18h12V6l-4-4H4v16z"/>
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-gray-900">Reporte PDF</p>
                  <p class="text-sm text-gray-600">Documento completo con estadísticas y tabla de productos</p>
                </div>
              </div>
            </button>
            
            <button 
              class="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-left group"
              onclick="window.resolveExportFormat('excel');"
            >
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <svg class="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-gray-900">Hoja de Cálculo</p>
                  <p class="text-sm text-gray-600">Archivo CSV con todos los datos del inventario</p>
                </div>
              </div>
            </button>
          </div>
          
          <div class="flex space-x-3">
            <button 
              class="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              onclick="window.resolveExportFormat(null);"
            >
              Cancelar
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Animación de entrada
      setTimeout(() => {
        const modalContent = modal.querySelector('div > div');
        if (modalContent) {
          modalContent.style.transform = 'scale(1)';
          modalContent.style.opacity = '1';
        }
      }, 10);
      
      // Función global para resolver la promesa
      (window as any).resolveExportFormat = (format: string | null) => {
        if (document.body.contains(modal)) {
          document.body.removeChild(modal);
        }
        resolve(format);
        delete (window as any).resolveExportFormat;
      };
    });
  };

  // Funciones para mostrar notificaciones
  const showSuccessToast = (message: string) => {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
    toast.innerHTML = `
      <div class="flex items-center space-x-2">
        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
      toast.style.transform = 'translateX(full)';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  };

  const showErrorToast = (message: string) => {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
    toast.innerHTML = `
      <div class="flex items-center space-x-2">
        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
      toast.style.transform = 'translateX(full)';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="max-w-7xl mx-auto px-4 py-8 relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Gestión de Inventario
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Control total de stock, proveedores y análisis de inventario
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
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
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Producto
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Productos</p>
                  <p className="text-3xl font-bold">{stats.totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Activos</p>
                  <p className="text-3xl font-bold">{stats.activeProducts}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Stock Bajo</p>
                  <p className="text-3xl font-bold">{stats.lowStock}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Agotados</p>
                  <p className="text-3xl font-bold">{stats.agotados}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Valor Total</p>
                  <p className="text-3xl font-bold">${stats.totalValue.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="bg-white border rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
              <SelectTrigger>
                <SelectValue placeholder="Proveedor" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier} value={supplier}>
                    {supplier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado Stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="bajo">Stock Bajo</SelectItem>
                <SelectItem value="agotado">Agotados</SelectItem>
                <SelectItem value="exceso">Exceso</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nombre">Nombre A-Z</SelectItem>
                <SelectItem value="stock">Stock</SelectItem>
                <SelectItem value="precio">Precio</SelectItem>
                <SelectItem value="categoria">Categoría</SelectItem>
                <SelectItem value="fecha">Fecha</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabla de Inventario */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-600" />
              <span>Inventario ({filteredInventory.length} productos)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Producto</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Stock</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Precios</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Proveedor</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Estado</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => {
                    const stockStatus = getStockStatus(item);
                    const CategoryIcon = getCategoryIcon(item.categoria);
                    
                    return (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                              <CategoryIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{item.nombre}</p>
                              <p className="text-sm text-gray-500">{item.codigo} • {item.marca}</p>
                              <p className="text-xs text-gray-400">{item.categoria}</p>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold text-gray-900">{item.stock_actual}</span>
                              <Badge variant={stockStatus.color as any} className="text-xs">
                                <stockStatus.icon className="h-3 w-3 mr-1" />
                                {stockStatus.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-500">
                              Min: {item.stock_minimo} | Max: {item.stock_maximo}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  item.stock_actual <= item.stock_minimo 
                                    ? 'bg-red-500' 
                                    : item.stock_actual > item.stock_maximo 
                                    ? 'bg-yellow-500' 
                                    : 'bg-green-500'
                                }`}
                                className="transition-all duration-300"
                                style={{ 
                                  width: `${Math.min(100, (item.stock_actual / item.stock_maximo) * 100)}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="text-sm">
                              <span className="text-gray-500">Compra: </span>
                              <span className="font-semibold text-red-600">${item.precio_compra}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500">Venta: </span>
                              <span className="font-semibold text-green-600">${item.precio_venta}</span>
                            </div>
                            <div className="text-xs text-gray-400">
                              Margen: {((item.precio_venta - item.precio_compra) / item.precio_compra * 100).toFixed(1)}%
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-4">
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">{item.proveedor}</p>
                            <p className="text-gray-500">{item.ubicacion}</p>
                            {item.fecha_vencimiento && (
                              <p className="text-xs text-gray-400">
                                Vence: {new Date(item.fecha_vencimiento).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </td>
                        
                        <td className="py-4 px-4">
                          <Badge 
                            variant={item.estado === 'activo' ? 'default' : 'secondary'}
                            className="capitalize"
                          >
                            {item.estado}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            Actualizado: {new Date(item.ultima_actualizacion).toLocaleDateString()}
                          </p>
                        </td>
                        
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
















