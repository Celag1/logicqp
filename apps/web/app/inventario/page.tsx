"use client";

import { useState, useEffect, useCallback, useMemo, Suspense, lazy } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Lazy loading del scanner de códigos de barras
const BarcodeInventoryScanner = lazy(() => import("@/components/inventory/barcode-inventory-scanner"));
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
  ShoppingCart,
  Scan,
  QrCode,
  Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

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
// Importar Supabase para obtener datos reales
import { supabase } from '@/lib/supabase/client';

export default function InventarioPage() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['Todas']);
  const [suppliers, setSuppliers] = useState<string[]>(['Todos']);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedSupplier, setSelectedSupplier] = useState("Todos");
  const [stockFilter, setStockFilter] = useState("todos");
  const [sortBy, setSortBy] = useState("nombre");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "table">("table");
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);

  // Función para cargar inventario desde Supabase
  const loadInventory = async () => {
    try {
      setLoading(true);
      const { data: productos, error: productosError } = await supabase
        .from('productos')
        .select(`
          *,
          categorias(nombre),
          lotes(
            id,
            numero_lote,
            cantidad_disponible,
            precio_compra,
            fecha_vencimiento,
            proveedores(nombre)
          )
        `);

      if (productosError) {
        console.error('Error cargando productos:', productosError);
        return;
      }

      // Transformar datos de Supabase al formato esperado
      const inventoryData: InventoryItem[] = productos?.map((producto: any) => ({
        id: producto.id.toString(),
        codigo: producto.codigo,
        nombre: producto.nombre,
        categoria: producto.categorias?.nombre || 'Sin categoría',
        marca: 'Qualipharm',
        stock_actual: producto.lotes?.[0]?.cantidad_disponible || 0,
        stock_minimo: producto.stock_minimo,
        stock_maximo: producto.stock_maximo || 1000,
        precio_compra: producto.lotes?.[0]?.precio_compra || producto.precio_compra || 0,
        precio_venta: producto.precio_venta || 0,
        proveedor: producto.lotes?.[0]?.proveedores?.nombre || 'Sin proveedor',
        fecha_vencimiento: producto.lotes?.[0]?.fecha_vencimiento || '2025-12-31',
        ubicacion: `Estante ${producto.codigo}`,
        estado: producto.estado || 'activo',
        ultima_actualizacion: new Date().toISOString().split('T')[0]
      })) || [];

      setInventory(inventoryData);
      setFilteredInventory(inventoryData);

      // Cargar categorías únicas
      const uniqueCategories = ['Todas', ...Array.from(new Set(inventoryData.map((item: any) => item.categoria)))];
      setCategories(uniqueCategories);

      // Cargar proveedores únicos
      const uniqueSuppliers = ['Todos', ...Array.from(new Set(inventoryData.map((item: any) => item.proveedor)))];
      setSuppliers(uniqueSuppliers);

    } catch (error) {
      console.error('Error cargando inventario:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadInventory();
  }, []);

  // Filtrado inteligente
  useEffect(() => {
    let filtered = inventory;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter((item: any) => {
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
      filtered = filtered.filter((item: any) => item.categoria === selectedCategory);
    }

    // Filtro por proveedor
    if (selectedSupplier !== "Todos") {
      filtered = filtered.filter((item: any) => item.proveedor === selectedSupplier);
    }

    // Filtro por stock
    switch (stockFilter) {
      case "bajo":
        filtered = filtered.filter((item: any) => item.stock_actual <= item.stock_minimo);
        break;
      case "agotado":
        filtered = filtered.filter((item: any) => item.stock_actual === 0);
        break;
      case "exceso":
        filtered = filtered.filter((item: any) => item.stock_actual > item.stock_maximo);
        break;
      case "normal":
        filtered = filtered.filter((item: any) => 
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

  const exportToPDF = async () => {
    setIsExporting(true);
    setExportProgress('Generando PDF...');
    
    try {
      // Simular generación de PDF
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Crear contenido del PDF
      const pdfContent = `
        REPORTE DE INVENTARIO
        ====================
        
        Fecha: ${new Date().toLocaleDateString()}
        Total de productos: ${inventory.length}
        
        PRODUCTOS:
        ${inventory.map((item: any) => `
        - ${item.nombre}
          Código: ${item.codigo}
          Stock: ${item.stock_actual}
          Precio: $${item.precio_venta}
          Categoría: ${item.categoria}
        `).join('')}
      `;
      
      // Crear y descargar archivo
      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventario_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setExportProgress('PDF generado exitosamente');
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      setExportProgress('Error al generar PDF');
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportProgress(''), 3000);
    }
  };

  const getInventoryStats = () => {
    const total = inventory.length;
    const activos = inventory.filter((item: any) => item.estado === 'activo').length;
    const stockBajo = inventory.filter((item: any) => item.stock_actual <= item.stock_minimo).length;
    const agotados = inventory.filter((item: any) => item.stock_actual === 0).length;
    const valorTotal = inventory.reduce((total: number, item: any) => total + (item.precio_compra * item.stock_actual), 0);

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
      
      // Calcular estadísticas adicionales
      const categories = Array.from(new Set(filteredInventory.map((item: any) => item.categoria)));
      const suppliers = Array.from(new Set(filteredInventory.map((item: any) => item.proveedor)));
      const avgPrice = filteredInventory.reduce((sum: number, item: any) => sum + item.precio_venta, 0) / filteredInventory.length;
      const totalStockValue = filteredInventory.reduce((sum: number, item: any) => sum + (item.precio_compra * item.stock_actual), 0);
      const lowStockItems = filteredInventory.filter((item: any) => item.stock_actual <= item.stock_minimo);
      const outOfStockItems = filteredInventory.filter((item: any) => item.stock_actual === 0);
      const topCategories = categories.map((cat: string) => {
        const items = filteredInventory.filter((item: any) => item.categoria === cat);
        const totalValue = items.reduce((sum: number, item: any) => sum + (item.precio_venta * item.stock_actual), 0);
        return { categoria: cat, items: items.length, valor: totalValue };
      }).sort((a, b) => b.valor - a.valor);
      
      // Crear encabezado profesional del reporte
      reportContainer.innerHTML = `
        <div style="text-align: center; border-bottom: 4px solid #3b82f6; padding-bottom: 25px; margin-bottom: 35px;">
          <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; border-radius: 15px; margin-bottom: 20px;">
            <h1 style="color: white; font-size: 28px; margin: 0 0 15px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">📦 REPORTE DE INVENTARIO LOGICQP</h1>
            <p style="color: #dbeafe; font-size: 16px; margin: 8px 0; font-weight: 500;">Gestión Inteligente de Stock - Análisis Completo</p>
            <p style="color: #93c5fd; font-size: 14px; margin: 5px 0;"><strong>Filtros Aplicados:</strong> ${selectedCategory} | ${selectedSupplier} | ${stockFilter}</p>
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
            📊 RESUMEN EJECUTIVO - MÉTRICAS CLAVE
          </h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0;">
            <div style="border: 2px solid #e5e7eb; border-radius: 10px; padding: 20px; background: linear-gradient(135deg, #f9fafb, #f3f4f6); box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="font-weight: bold; color: #1f2937; margin-bottom: 12px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">📦 Total Productos</div>
              <div style="font-size: 24px; font-weight: bold; color: #059669; margin-bottom: 8px; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">${stats.totalProducts}</div>
              <div style="font-size: 13px; color: #6b7280; margin-bottom: 8px;">
                ${stats.activeProducts} activos (${Math.round((stats.activeProducts / stats.totalProducts) * 100)}%)
              </div>
              <div style="font-size: 12px; color: #9ca3af; font-style: italic; line-height: 1.5;">Productos en inventario actual</div>
            </div>

            <div style="border: 2px solid #e5e7eb; border-radius: 10px; padding: 20px; background: linear-gradient(135deg, #f9fafb, #f3f4f6); box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="font-weight: bold; color: #1f2937; margin-bottom: 12px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">💰 Valor Total</div>
              <div style="font-size: 24px; font-weight: bold; color: #059669; margin-bottom: 8px; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">$${stats.totalValue.toLocaleString()}</div>
              <div style="font-size: 13px; color: #6b7280; margin-bottom: 8px;">
                Precio promedio: $${avgPrice.toFixed(2)}
              </div>
              <div style="font-size: 12px; color: #9ca3af; font-style: italic; line-height: 1.5;">Valor total del inventario actual</div>
            </div>

            <div style="border: 2px solid #e5e7eb; border-radius: 10px; padding: 20px; background: linear-gradient(135deg, #f9fafb, #f3f4f6); box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="font-weight: bold; color: #1f2937; margin-bottom: 12px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">⚠️ Stock Bajo</div>
              <div style="font-size: 24px; font-weight: bold; color: #f59e0b; margin-bottom: 8px; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">${stats.lowStock}</div>
              <div style="font-size: 13px; color: #6b7280; margin-bottom: 8px;">
                ${stats.agotados} agotados
              </div>
              <div style="font-size: 12px; color: #9ca3af; font-style: italic; line-height: 1.5;">Productos que requieren reposición</div>
            </div>

            <div style="border: 2px solid #e5e7eb; border-radius: 10px; padding: 20px; background: linear-gradient(135deg, #f9fafb, #f3f4f6); box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="font-weight: bold; color: #1f2937; margin-bottom: 12px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">🏷️ Categorías</div>
              <div style="font-size: 24px; font-weight: bold; color: #8b5cf6; margin-bottom: 8px; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">${categories.length}</div>
              <div style="font-size: 13px; color: #6b7280; margin-bottom: 8px;">
                ${suppliers.length} proveedores
              </div>
              <div style="font-size: 12px; color: #9ca3af; font-style: italic; line-height: 1.5;">Diversificación de productos</div>
            </div>
          </div>
        </div>

        <div style="margin: 35px 0;">
          <h2 style="color: #1e40af; border-bottom: 3px solid #dbeafe; padding-bottom: 12px; font-size: 20px; background: linear-gradient(90deg, #eff6ff, transparent); padding: 15px; border-radius: 8px;">
            🚨 ALERTAS CRÍTICAS DE INVENTARIO
          </h2>
          ${lowStockItems.length > 0 ? lowStockItems.map((item: any, index: number) => `
            <div style="background: linear-gradient(135deg, #fef2f2, #fee2e2); border: 2px solid #fecaca; border-radius: 10px; padding: 18px; margin: 15px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="color: #dc2626; font-weight: bold; margin-bottom: 8px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">🚨 ${item.nombre}</div>
              <div style="font-size: 12px; margin: 4px 0; color: #7f1d1d;"><strong>📂 Categoría:</strong> ${item.categoria}</div>
              <div style="font-size: 12px; margin: 4px 0; color: #7f1d1d;"><strong>📦 Stock Actual:</strong> <span style="font-weight: bold; color: #dc2626;">${item.stock_actual} unidades</span></div>
              <div style="font-size: 12px; margin: 4px 0; color: #7f1d1d;"><strong>⚠️ Stock Mínimo:</strong> ${item.stock_minimo} unidades</div>
              <div style="background: #dc2626; color: white; padding: 5px 10px; border-radius: 5px; font-size: 11px; margin-top: 8px; text-align: center; font-weight: bold;">
                ${item.stock_actual === 0 ? 'URGENTE: PRODUCTO AGOTADO' : 'ATENCIÓN: STOCK BAJO'}
              </div>
            </div>
          `).join('') : `
            <div style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 2px solid #bbf7d0; border-radius: 10px; padding: 25px; text-align: center; margin: 20px 0;">
              <div style="color: #166534; font-size: 18px; font-weight: bold; margin-bottom: 10px;">✅ ¡Excelente Gestión de Stock!</div>
              <div style="color: #15803d; font-size: 14px;">No hay productos con stock bajo. Todos los productos mantienen niveles adecuados.</div>
            </div>
          `}
        </div>

        <div style="margin: 35px 0;">
          <h2 style="color: #1e40af; border-bottom: 3px solid #dbeafe; padding-bottom: 12px; font-size: 20px; background: linear-gradient(90deg, #eff6ff, transparent); padding: 15px; border-radius: 8px;">
            🏆 CATEGORÍAS TOP - ANÁLISIS DE VALOR
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <thead>
              <tr>
                <th style="border: 2px solid #059669; padding: 12px; text-align: left; background: linear-gradient(135deg, #059669, #047857); color: white; font-weight: bold; font-size: 13px;">🏆 Categoría</th>
                <th style="border: 2px solid #059669; padding: 12px; text-align: left; background: linear-gradient(135deg, #059669, #047857); color: white; font-weight: bold; font-size: 13px;">📦 Productos</th>
                <th style="border: 2px solid #059669; padding: 12px; text-align: left; background: linear-gradient(135deg, #059669, #047857); color: white; font-weight: bold; font-size: 13px;">💰 Valor Total</th>
                <th style="border: 2px solid #059669; padding: 12px; text-align: left; background: linear-gradient(135deg, #059669, #047857); color: white; font-weight: bold; font-size: 13px;">📊 % del Total</th>
              </tr>
            </thead>
            <tbody>
              ${topCategories.map((cat: any, index: number) => `
                <tr style="background: ${index === 0 ? '#fef3c7' : index === 1 ? '#f3e8ff' : index === 2 ? '#dbeafe' : '#f0fdf4'};">
                  <td style="border: 1px solid #d1d5db; padding: 10px; font-weight: bold; color: #1f2937;">
                    ${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📦'} ${cat.categoria}
                  </td>
                  <td style="border: 1px solid #d1d5db; padding: 10px; font-weight: bold; color: #059669; font-size: 13px;">${cat.items} productos</td>
                  <td style="border: 1px solid #d1d5db; padding: 10px; font-weight: bold; color: #059669; font-size: 13px;">$${cat.valor.toLocaleString()}</td>
                  <td style="border: 1px solid #d1d5db; padding: 10px; color: #047857; font-weight: bold;">${Math.round((cat.valor / stats.totalValue) * 100)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="margin: 35px 0;">
          <h2 style="color: #1e40af; border-bottom: 3px solid #dbeafe; padding-bottom: 12px; font-size: 20px; background: linear-gradient(90deg, #eff6ff, transparent); padding: 15px; border-radius: 8px;">
            📋 DETALLE COMPLETO DE PRODUCTOS
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <thead>
              <tr>
                <th style="border: 2px solid #3b82f6; padding: 12px; text-align: left; background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; font-weight: bold; font-size: 13px;">CÓDIGO</th>
                <th style="border: 2px solid #3b82f6; padding: 12px; text-align: left; background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; font-weight: bold; font-size: 13px;">PRODUCTO</th>
                <th style="border: 2px solid #3b82f6; padding: 12px; text-align: left; background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; font-weight: bold; font-size: 13px;">CATEGORÍA</th>
                <th style="border: 2px solid #3b82f6; padding: 12px; text-align: center; background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; font-weight: bold; font-size: 13px;">STOCK</th>
                <th style="border: 2px solid #3b82f6; padding: 12px; text-align: right; background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; font-weight: bold; font-size: 13px;">PRECIO VENTA</th>
                <th style="border: 2px solid #3b82f6; padding: 12px; text-align: center; background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; font-weight: bold; font-size: 13px;">ESTADO</th>
              </tr>
            </thead>
            <tbody>
              ${filteredInventory.map((item: any, index: number) => `
                <tr style="background: ${item.estado === 'activo' ? '#f0fdf4' : item.estado === 'inactivo' ? '#fffbeb' : '#eff6ff'};">
                  <td style="border: 1px solid #d1d5db; padding: 10px; font-weight: bold; color: #1f2937;">${item.codigo}</td>
                  <td style="border: 1px solid #d1d5db; padding: 10px; color: #374151;">${item.nombre.length > 25 ? item.nombre.substring(0, 25) + '...' : item.nombre}</td>
                  <td style="border: 1px solid #d1d5db; padding: 10px; color: #6b7280;">${item.categoria}</td>
                  <td style="border: 1px solid #d1d5db; padding: 10px; font-weight: bold; color: ${item.stock_actual <= item.stock_minimo ? '#dc2626' : item.stock_actual > item.stock_maximo ? '#d97706' : '#059669'}; text-align: center;">${item.stock_actual}</td>
                  <td style="border: 1px solid #d1d5db; padding: 10px; font-weight: bold; color: #059669; font-size: 13px; text-align: right;">$${item.precio_venta.toFixed(2)}</td>
                  <td style="border: 1px solid #d1d5db; padding: 10px; text-align: center;">
                    <span style="padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; background: ${item.estado === 'activo' ? '#d1fae5' : item.estado === 'inactivo' ? '#fef3c7' : '#fee2e2'}; color: ${item.estado === 'activo' ? '#065f46' : item.estado === 'inactivo' ? '#92400e' : '#dc2626'};">
                      ${item.estado.toUpperCase()}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="margin: 35px 0;">
          <h2 style="color: #1e40af; border-bottom: 3px solid #dbeafe; padding-bottom: 12px; font-size: 20px; background: linear-gradient(90deg, #eff6ff, transparent); padding: 15px; border-radius: 8px;">
            📊 CAPTURA VISUAL COMPLETA DEL INVENTARIO
          </h2>
          <div style="background: linear-gradient(135deg, #f8fafc, #e2e8f0); border: 2px dashed #3b82f6; border-radius: 10px; padding: 25px; text-align: center; margin: 20px 0;">
            <div style="color: #1e40af; font-size: 16px; font-weight: bold; margin-bottom: 10px;">🖼️ Dashboard de Inventario Completo</div>
            <div style="color: #64748b; font-size: 12px; line-height: 1.6;">
              A continuación se incluye la captura visual completa del dashboard de inventario actual, incluyendo todas las métricas, gráficas y elementos interactivos.
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
        
        // Capturar el dashboard de inventario completo
        const inventoryElement = document.querySelector('.min-h-screen');
        if (!inventoryElement) {
          throw new Error('No se pudo encontrar el dashboard de inventario');
        }

        const inventoryCanvas = await html2canvas(inventoryElement, {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: inventoryElement.scrollWidth,
          height: inventoryElement.scrollHeight,
          scrollX: 0,
          scrollY: 0,
          windowWidth: inventoryElement.scrollWidth,
          windowHeight: inventoryElement.scrollHeight
        });

        setExportProgress('Generando PDF final...');

        // Crear PDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 295; // A4 height in mm
        
        // Agregar reporte estructurado
        const reportImgHeight = (reportCanvas.height * imgWidth) / reportCanvas.width;
        pdf.addImage(reportCanvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, reportImgHeight);
        
        // Agregar nueva página para el dashboard visual
        pdf.addPage();
        
        // Agregar dashboard visual
        const dashboardImgHeight = (inventoryCanvas.height * imgWidth) / inventoryCanvas.width;
        let heightLeft = dashboardImgHeight;
        let position = 0;
        
        pdf.addImage(inventoryCanvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, dashboardImgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
          position = heightLeft - dashboardImgHeight;
          pdf.addPage();
          pdf.addImage(inventoryCanvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, dashboardImgHeight);
          heightLeft -= pageHeight;
        }

        // Limpiar elemento temporal
        document.body.removeChild(reportContainer);

        // Mostrar mensaje de éxito
        showSuccessToast('Reporte ejecutivo completo generado exitosamente');

        // Guardar el PDF
        const fileName = `inventario_logicqp_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);
        
        setExportProgress('Reporte generado exitosamente');
        return true;
        
      } catch (error) {
        console.error('Error generando PDF:', error);
        showErrorToast('Error al generar PDF: ' + (error instanceof Error ? error.message : String(error)));
        return false;
      }
      
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
        ...filteredInventory.map((item: any) => [
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
      const csvContent = csvData.map((row: any) => row.join(',')).join('\n');
      
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
        const modalContent = modal.querySelector('div > div') as HTMLElement;
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

  // Mostrar indicador de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando inventario desde la base de datos...</p>
        </div>
      </div>
    );
  }

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
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1">
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
                {categories.map((category: string) => (
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
                {suppliers.map((supplier: string) => (
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
            
            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => setIsBarcodeScannerOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Scan className="h-4 w-4 mr-2" />
                Escáner de Códigos
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  // TODO: Implementar importación masiva
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>
              <Button
                variant="outline"
                onClick={exportToPDF}
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Exportar
              </Button>
            </div>
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
                  {filteredInventory.map((item: any) => {
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
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  item.stock_actual <= item.stock_minimo 
                                    ? 'bg-red-500' 
                                    : item.stock_actual > item.stock_maximo 
                                    ? 'bg-yellow-500' 
                                    : 'bg-green-500'
                                }`}
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

      {/* Escáner de Códigos de Barras */}
      <BarcodeInventoryScanner
        isOpen={isBarcodeScannerOpen}
        onClose={() => setIsBarcodeScannerOpen(false)}
        userId={user?.id || ''}
        onProductScanned={(result) => {
          console.log('Producto escaneado:', result);
          // TODO: Actualizar inventario en tiempo real
        }}
      />
    </div>
  );
}
















