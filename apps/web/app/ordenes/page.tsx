"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Package, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Calendar,
  User,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
  Plus,
  RefreshCw
} from "lucide-react";

// Dynamic imports para PDF
let jsPDF: any = null;
let html2canvas: any = null;
if (typeof window !== 'undefined') {
  import('jspdf').then(module => { jsPDF = module.default; });
  import('html2canvas').then(module => { html2canvas = module.default; });
}

interface Order {
  id: string;
  numero_orden: string;
  cliente_id: string;
  cliente_nombre: string;
  cliente_email: string;
  subtotal: number;
  descuento: number;
  total: number;
  estado: 'pendiente' | 'confirmada' | 'en_proceso' | 'enviada' | 'entregada' | 'cancelada';
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'paypal';
  direccion_entrega: string;
  notas?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  producto_id: string;
  producto_nombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

// Importar Supabase para obtener datos reales
import { supabase } from '@/lib/supabase';

export default function OrdenesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [paymentFilter, setPaymentFilter] = useState("todos");
  const [dateFilter, setDateFilter] = useState("todos");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');

  // Función para cargar órdenes reales desde Supabase
  const loadOrders = async () => {
    try {
      setLoading(true);
      
      // Cargar ventas como órdenes desde la base de datos
      const { data: ventas, error: ventasError } = await supabase
        .from('ventas')
        .select(`
          *,
          venta_items(
            id,
            producto_id,
            cantidad,
            precio_unitario,
            subtotal,
            productos(nombre)
          )
        `)
        .order('fecha_venta', { ascending: false });

      if (ventasError) {
        console.error('Error cargando ventas:', ventasError);
        return;
      }

      // Transformar ventas a formato de órdenes
      const realOrders: Order[] = ventas?.map((venta: any) => ({
        id: venta.id,
        numero_orden: venta.numero_venta,
        cliente_id: venta.cliente_id || '',
        cliente_nombre: venta.cliente_nombre || 'Cliente no especificado',
        cliente_email: venta.cliente_email || '',
        subtotal: parseFloat(venta.subtotal) || 0,
        descuento: parseFloat(venta.descuento) || 0,
        total: parseFloat(venta.total) || 0,
        estado: venta.estado || 'pendiente',
        metodo_pago: venta.metodo_pago || 'efectivo',
        direccion_entrega: 'Dirección no especificada', // No hay campo en ventas
        notas: '',
        created_at: venta.fecha_venta || venta.created_at,
        updated_at: venta.updated_at,
        items: venta.venta_items?.map((item: any) => ({
          id: item.id,
          producto_id: item.producto_id,
          producto_nombre: item.productos?.nombre || 'Producto no encontrado',
          cantidad: item.cantidad || 0,
          precio: parseFloat(item.precio_unitario) || 0,
          subtotal: parseFloat(item.subtotal) || 0
        })) || []
      })) || [];

      setOrders(realOrders);
      setFilteredOrders(realOrders);

    } catch (error) {
      console.error('Error cargando órdenes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadOrders();
  }, []);

  // Filtros
  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter((order: any) => 
        order.numero_orden.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.cliente_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "todos") {
      filtered = filtered.filter((order: any) => order.estado === statusFilter);
    }

    if (paymentFilter !== "todos") {
      filtered = filtered.filter((order: any) => order.metodo_pago === paymentFilter);
    }

    if (dateFilter !== "todos") {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case "hoy":
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter((order: any) => new Date(order.created_at) >= filterDate);
          break;
        case "semana":
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter((order: any) => new Date(order.created_at) >= filterDate);
          break;
        case "mes":
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter((order: any) => new Date(order.created_at) >= filterDate);
          break;
      }
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, paymentFilter, dateFilter]);

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "pendiente": return "bg-yellow-100 text-yellow-800";
      case "confirmada": return "bg-blue-100 text-blue-800";
      case "en_proceso": return "bg-purple-100 text-purple-800";
      case "enviada": return "bg-indigo-100 text-indigo-800";
      case "entregada": return "bg-green-100 text-green-800";
      case "cancelada": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (estado: string) => {
    switch (estado) {
      case "pendiente": return "Pendiente";
      case "confirmada": return "Confirmada";
      case "en_proceso": return "En Proceso";
      case "enviada": return "Enviada";
      case "entregada": return "Entregada";
      case "cancelada": return "Cancelada";
      default: return estado;
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "pendiente": return Clock;
      case "confirmada": return CheckCircle;
      case "en_proceso": return RefreshCw;
      case "enviada": return Truck;
      case "entregada": return CheckCircle;
      case "cancelada": return X;
      default: return Package;
    }
  };

  const getPaymentLabel = (metodo: string) => {
    switch (metodo) {
      case "efectivo": return "Efectivo";
      case "tarjeta": return "Tarjeta";
      case "transferencia": return "Transferencia";
      case "paypal": return "PayPal";
      default: return metodo;
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setLoading(true);
    // Simular actualización de estado
    setTimeout(() => {
      setOrders(orders.map((order: any) => 
        order.id === orderId 
          ? { ...order, estado: newStatus as any, updated_at: new Date().toISOString() }
          : order
      ));
      setLoading(false);
    }, 1000);
  };

  // Función para generar reporte PDF profesional
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
      const totalRevenue = filteredOrders.reduce((sum: number, order: any) => sum + order.total, 0);
      const avgOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;
      const completedOrders = filteredOrders.filter((order: any) => order.estado === 'entregada').length;
      const pendingOrders = filteredOrders.filter((order: any) => order.estado === 'pendiente').length;
      const inProcessOrders = filteredOrders.filter((order: any) => order.estado === 'en_proceso').length;
      const cancelledOrders = filteredOrders.filter((order: any) => order.estado === 'cancelada').length;
      
      // Análisis por método de pago
      const paymentMethods = filteredOrders.reduce((acc: any, order: any) => {
        acc[order.metodo_pago] = (acc[order.metodo_pago] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Top clientes por valor
      const topClients = filteredOrders.reduce((acc: any, order: any) => {
        if (!acc[order.cliente_nombre]) {
          acc[order.cliente_nombre] = { orders: 0, total: 0 };
        }
        acc[order.cliente_nombre].orders += 1;
        acc[order.cliente_nombre].total += order.total;
        return acc;
      }, {} as Record<string, { orders: number; total: number }>);
      
      const topClientsArray = Object.entries(topClients)
        .map(([name, data]: [string, any]) => ({ name, ...data }))
        .sort((a: any, b: any) => b.total - a.total)
        .slice(0, 5);
      
      // Crear encabezado profesional del reporte
      reportContainer.innerHTML = `
        <div style="text-align: center; border-bottom: 4px solid #3b82f6; padding-bottom: 25px; margin-bottom: 35px;">
          <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; border-radius: 15px; margin-bottom: 20px;">
            <h1 style="color: white; font-size: 28px; margin: 0 0 15px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">📦 REPORTE DE ÓRDENES LOGICQP</h1>
            <p style="color: #dbeafe; font-size: 16px; margin: 8px 0; font-weight: 500;">Gestión Inteligente de Pedidos - Análisis Completo</p>
            <p style="color: #93c5fd; font-size: 14px; margin: 5px 0;"><strong>Filtros Aplicados:</strong> ${statusFilter} | ${paymentFilter} | ${dateFilter}</p>
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
              <div style="font-weight: bold; color: #1f2937; margin-bottom: 12px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">📦 Total Órdenes</div>
              <div style="font-size: 24px; font-weight: bold; color: #059669; margin-bottom: 8px; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">${filteredOrders.length}</div>
              <div style="font-size: 13px; color: #6b7280; margin-bottom: 8px;">
                ${completedOrders} completadas (${Math.round((completedOrders / filteredOrders.length) * 100)}%)
              </div>
              <div style="font-size: 12px; color: #9ca3af; font-style: italic; line-height: 1.5;">Órdenes procesadas en el período</div>
            </div>

            <div style="border: 2px solid #e5e7eb; border-radius: 10px; padding: 20px; background: linear-gradient(135deg, #f9fafb, #f3f4f6); box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="font-weight: bold; color: #1f2937; margin-bottom: 12px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">💰 Ingresos Totales</div>
              <div style="font-size: 24px; font-weight: bold; color: #059669; margin-bottom: 8px; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">$${totalRevenue.toLocaleString()}</div>
              <div style="font-size: 13px; color: #6b7280; margin-bottom: 8px;">
                Valor promedio: $${avgOrderValue.toFixed(2)}
              </div>
              <div style="font-size: 12px; color: #9ca3af; font-style: italic; line-height: 1.5;">Ingresos generados por órdenes</div>
            </div>

            <div style="border: 2px solid #e5e7eb; border-radius: 10px; padding: 20px; background: linear-gradient(135deg, #f9fafb, #f3f4f6); box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="font-weight: bold; color: #1f2937; margin-bottom: 12px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">⏳ Pendientes</div>
              <div style="font-size: 24px; font-weight: bold; color: #f59e0b; margin-bottom: 8px; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">${pendingOrders}</div>
              <div style="font-size: 13px; color: #6b7280; margin-bottom: 8px;">
                ${inProcessOrders} en proceso
              </div>
              <div style="font-size: 12px; color: #9ca3af; font-style: italic; line-height: 1.5;">Órdenes que requieren atención</div>
            </div>

            <div style="border: 2px solid #e5e7eb; border-radius: 10px; padding: 20px; background: linear-gradient(135deg, #f9fafb, #f3f4f6); box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="font-weight: bold; color: #1f2937; margin-bottom: 12px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">❌ Canceladas</div>
              <div style="font-size: 24px; font-weight: bold; color: #dc2626; margin-bottom: 8px; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">${cancelledOrders}</div>
              <div style="font-size: 13px; color: #6b7280; margin-bottom: 8px;">
                ${Math.round((cancelledOrders / filteredOrders.length) * 100)}% del total
              </div>
              <div style="font-size: 12px; color: #9ca3af; font-style: italic; line-height: 1.5;">Tasa de cancelación</div>
            </div>
          </div>
        </div>

        <div style="margin: 35px 0;">
          <h2 style="color: #1e40af; border-bottom: 3px solid #dbeafe; padding-bottom: 12px; font-size: 20px; background: linear-gradient(90deg, #eff6ff, transparent); padding: 15px; border-radius: 8px;">
            💳 ANÁLISIS DE MÉTODOS DE PAGO
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <thead>
              <tr>
                <th style="border: 2px solid #8b5cf6; padding: 12px; text-align: left; background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; font-weight: bold; font-size: 13px;">💳 Método de Pago</th>
                <th style="border: 2px solid #8b5cf6; padding: 12px; text-align: center; background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; font-weight: bold; font-size: 13px;">📊 Cantidad</th>
                <th style="border: 2px solid #8b5cf6; padding: 12px; text-align: center; background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; font-weight: bold; font-size: 13px;">📈 Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(paymentMethods).map(([method, count]: [string, any], index: number) => `
                <tr style="background: ${index % 2 === 0 ? '#f8fafc' : '#f1f5f9'};">
                  <td style="border: 1px solid #d1d5db; padding: 10px; font-weight: bold; color: #1f2937;">${getPaymentLabel(method as any)}</td>
                  <td style="border: 1px solid #d1d5db; padding: 10px; font-weight: bold; color: #8b5cf6; text-align: center;">${count} órdenes</td>
                  <td style="border: 1px solid #d1d5db; padding: 10px; color: #7c3aed; font-weight: bold; text-align: center;">${Math.round((count / filteredOrders.length) * 100)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="margin: 35px 0;">
          <h2 style="color: #1e40af; border-bottom: 3px solid #dbeafe; padding-bottom: 12px; font-size: 20px; background: linear-gradient(90deg, #eff6ff, transparent); padding: 15px; border-radius: 8px;">
            🏆 TOP CLIENTES POR VALOR
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <thead>
              <tr>
                <th style="border: 2px solid #059669; padding: 12px; text-align: left; background: linear-gradient(135deg, #059669, #047857); color: white; font-weight: bold; font-size: 13px;">🏆 Cliente</th>
                <th style="border: 2px solid #059669; padding: 12px; text-align: center; background: linear-gradient(135deg, #059669, #047857); color: white; font-weight: bold; font-size: 13px;">📦 Órdenes</th>
                <th style="border: 2px solid #059669; padding: 12px; text-align: right; background: linear-gradient(135deg, #059669, #047857); color: white; font-weight: bold; font-size: 13px;">💰 Valor Total</th>
                <th style="border: 2px solid #059669; padding: 12px; text-align: right; background: linear-gradient(135deg, #059669, #047857); color: white; font-weight: bold; font-size: 13px;">📊 Promedio</th>
              </tr>
            </thead>
            <tbody>
              ${topClientsArray.map((client: any, index: number) => `
                <tr style="background: ${index === 0 ? '#fef3c7' : index === 1 ? '#f3e8ff' : index === 2 ? '#dbeafe' : '#f0fdf4'};">
                  <td style="border: 1px solid #d1d5db; padding: 10px; font-weight: bold; color: #1f2937;">
                    ${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤'} ${client.name}
                  </td>
                  <td style="border: 1px solid #d1d5db; padding: 10px; font-weight: bold; color: #059669; text-align: center;">${client.orders}</td>
                  <td style="border: 1px solid #d1d5db; padding: 10px; font-weight: bold; color: #059669; text-align: right;">$${client.total.toLocaleString()}</td>
                  <td style="border: 1px solid #d1d5db; padding: 10px; color: #047857; font-weight: bold; text-align: right;">$${(client.total / client.orders).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="margin: 35px 0;">
          <h2 style="color: #1e40af; border-bottom: 3px solid #dbeafe; padding-bottom: 12px; font-size: 20px; background: linear-gradient(90deg, #eff6ff, transparent); padding: 15px; border-radius: 8px;">
            📋 DETALLE COMPLETO DE ÓRDENES
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <thead>
              <tr>
                <th style="border: 2px solid #3b82f6; padding: 12px; text-align: left; background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; font-weight: bold; font-size: 13px;">NÚMERO</th>
                <th style="border: 2px solid #3b82f6; padding: 12px; text-align: left; background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; font-weight: bold; font-size: 13px;">CLIENTE</th>
                <th style="border: 2px solid #3b82f6; padding: 12px; text-align: right; background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; font-weight: bold; font-size: 13px;">TOTAL</th>
                <th style="border: 2px solid #3b82f6; padding: 12px; text-align: center; background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; font-weight: bold; font-size: 13px;">ESTADO</th>
                <th style="border: 2px solid #3b82f6; padding: 12px; text-align: center; background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; font-weight: bold; font-size: 13px;">PAGO</th>
                <th style="border: 2px solid #3b82f6; padding: 12px; text-align: center; background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; font-weight: bold; font-size: 13px;">FECHA</th>
              </tr>
            </thead>
            <tbody>
              ${filteredOrders.map((order: any, index: number) => `
                <tr style="background: ${order.estado === 'entregada' ? '#f0fdf4' : order.estado === 'pendiente' ? '#fffbeb' : order.estado === 'en_proceso' ? '#eff6ff' : '#fef2f2'};">
                  <td style="border: 1px solid #d1d5db; padding: 10px; font-weight: bold; color: #1f2937;">${order.numero_orden}</td>
                  <td style="border: 1px solid #d1d5db; padding: 10px; color: #374151;">${order.cliente_nombre}</td>
                  <td style="border: 1px solid #d1d5db; padding: 10px; font-weight: bold; color: #059669; text-align: right;">$${order.total.toFixed(2)}</td>
                  <td style="border: 1px solid #d1d5db; padding: 10px; text-align: center;">
                    <span style="padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; background: ${order.estado === 'entregada' ? '#d1fae5' : order.estado === 'pendiente' ? '#fef3c7' : order.estado === 'en_proceso' ? '#dbeafe' : '#fee2e2'}; color: ${order.estado === 'entregada' ? '#065f46' : order.estado === 'pendiente' ? '#92400e' : order.estado === 'en_proceso' ? '#1e40af' : '#dc2626'};">
                      ${getStatusLabel(order.estado).toUpperCase()}
                    </span>
                  </td>
                  <td style="border: 1px solid #d1d5db; padding: 10px; text-align: center; color: #6b7280;">${getPaymentLabel(order.metodo_pago)}</td>
                  <td style="border: 1px solid #d1d5db; padding: 10px; text-align: center; color: #6b7280;">${new Date(order.created_at).toLocaleDateString()}</td>
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
            <div style="color: #1e40af; font-size: 16px; font-weight: bold; margin-bottom: 10px;">🖼️ Dashboard de Órdenes Completo</div>
            <div style="color: #64748b; font-size: 12px; line-height: 1.6;">
              A continuación se incluye la captura visual completa del dashboard de órdenes actual, incluyendo todas las métricas, gráficas y elementos interactivos.
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
        
        // Capturar el dashboard de órdenes completo
        const ordersElement = document.querySelector('.min-h-screen');
        if (!ordersElement) {
          throw new Error('No se pudo encontrar el dashboard de órdenes');
        }

        const ordersCanvas = await html2canvas(ordersElement, {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: ordersElement.scrollWidth,
          height: ordersElement.scrollHeight,
          scrollX: 0,
          scrollY: 0,
          windowWidth: ordersElement.scrollWidth,
          windowHeight: ordersElement.scrollHeight
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
        const dashboardImgHeight = (ordersCanvas.height * imgWidth) / ordersCanvas.width;
        let heightLeft = dashboardImgHeight;
        let position = 0;
        
        pdf.addImage(ordersCanvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, dashboardImgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
          position = heightLeft - dashboardImgHeight;
          pdf.addPage();
          pdf.addImage(ordersCanvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, dashboardImgHeight);
          heightLeft -= pageHeight;
        }

        // Limpiar elemento temporal
        document.body.removeChild(reportContainer);

        // Mostrar mensaje de éxito
        showSuccessToast('Reporte ejecutivo completo generado exitosamente');

        // Guardar el PDF
        const fileName = `ordenes_logicqp_${new Date().toISOString().split('T')[0]}.pdf`;
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

  // Función para generar reporte Excel
  const generateExcelReport = async () => {
    try {
      const csvContent = [
        ['Número Orden', 'Cliente', 'Email', 'Total', 'Estado', 'Método Pago', 'Fecha'],
        ...filteredOrders.map((order: any) => [
          order.numero_orden,
          order.cliente_nombre,
          order.cliente_email,
          order.total.toFixed(2),
          getStatusLabel(order.estado),
          getPaymentLabel(order.metodo_pago),
          new Date(order.created_at).toLocaleDateString()
        ])
      ].map((row: any) => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ordenes_logicqp_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error generando Excel:', error);
      showErrorToast('Error al generar Excel: ' + (error instanceof Error ? error.message : String(error)));
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
      if ((window as any).resolveExportFormat) {
        delete (window as any).resolveExportFormat;
      }
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
      modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl p-6 w-96 max-w-[90vw] mx-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Exportar Reporte de Órdenes</h3>
            <button onclick="window.resolveExportFormat(null)" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <p class="text-gray-600 mb-6">Selecciona el formato para exportar el reporte de órdenes:</p>
          <div class="space-y-3">
            <button onclick="window.resolveExportFormat('pdf')" class="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors">
              <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div class="text-left">
                <div class="font-medium text-gray-900">PDF Profesional</div>
                <div class="text-sm text-gray-500">Reporte ejecutivo con diseño moderno</div>
              </div>
            </button>
            <button onclick="window.resolveExportFormat('excel')" class="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors">
              <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div class="text-left">
                <div class="font-medium text-gray-900">Excel/CSV</div>
                <div class="text-sm text-gray-500">Datos tabulares para análisis</div>
              </div>
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      setTimeout(() => {
        modal.style.opacity = '1';
        const dialog = modal.querySelector('div');
        if (dialog) {
          dialog.style.transform = 'scale(1)';
        }
      }, 10);
      (window as any).resolveExportFormat = (format: string | null) => {
        if (document.body.contains(modal)) {
          document.body.removeChild(modal);
        }
        resolve(format);
        delete (window as any).resolveExportFormat;
      };
    });
  };

  // Funciones de notificaciones toast
  const showSuccessToast = (message: string) => {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
    toast.innerHTML = `
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
      </svg>
      ${message}
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  };

  const showErrorToast = (message: string) => {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
    toast.innerHTML = `
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
      </svg>
      ${message}
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  };

  const stats = {
    total: orders.length,
    pendientes: orders.filter((o: any) => o.estado === 'pendiente').length,
    enProceso: orders.filter((o: any) => o.estado === 'en_proceso').length,
    entregadas: orders.filter((o: any) => o.estado === 'entregada').length,
    totalVentas: orders.reduce((sum: number, order: any) => sum + order.total, 0)
  };

  // Mostrar indicador de carga
  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando órdenes desde la base de datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-600" />
            Gestión de Órdenes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Administra y rastrea todas las órdenes del sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
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
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Orden
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Órdenes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendientes}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En Proceso</p>
                <p className="text-2xl font-bold text-purple-600">{stats.enProceso}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Entregadas</p>
                <p className="text-2xl font-bold text-green-600">{stats.entregadas}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Ventas</p>
                <p className="text-2xl font-bold text-green-600">${stats.totalVentas.toFixed(2)}</p>
              </div>
              <CreditCard className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por número de orden, cliente o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="confirmada">Confirmada</SelectItem>
                <SelectItem value="en_proceso">En Proceso</SelectItem>
                <SelectItem value="enviada">Enviada</SelectItem>
                <SelectItem value="entregada">Entregada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los métodos</SelectItem>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="tarjeta">Tarjeta</SelectItem>
                <SelectItem value="transferencia">Transferencia</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por fecha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las fechas</SelectItem>
                <SelectItem value="hoy">Hoy</SelectItem>
                <SelectItem value="semana">Esta semana</SelectItem>
                <SelectItem value="mes">Este mes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Lista de Órdenes ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Orden</th>
                  <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Cliente</th>
                  <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Total</th>
                  <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Estado</th>
                  <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Pago</th>
                  <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Fecha</th>
                  <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order: any) => {
                  const StatusIcon = getStatusIcon(order.estado);
                  return (
                    <tr key={order.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {order.numero_orden}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {order.cliente_nombre}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {order.cliente_email}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          ${order.total.toFixed(2)}
                        </div>
                        {order.descuento > 0 && (
                          <div className="text-sm text-green-600">
                            -${order.descuento.toFixed(2)} descuento
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusColor(order.estado)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {getStatusLabel(order.estado)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <CreditCard className="h-3 w-3" />
                          {getPaymentLabel(order.metodo_pago)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(order.created_at).toLocaleDateString('es-ES')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleTimeString('es-ES', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: false 
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {order.estado === 'pendiente' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(order.id, 'confirmada')}
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                          {order.estado === 'confirmada' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(order.id, 'en_proceso')}
                            >
                              <RefreshCw className="h-4 w-4 text-blue-600" />
                            </Button>
                          )}
                          {order.estado === 'en_proceso' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(order.id, 'enviada')}
                            >
                              <Truck className="h-4 w-4 text-purple-600" />
                            </Button>
                          )}
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {selectedOrder.numero_orden}
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Orden del {new Date(selectedOrder.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Cliente</h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedOrder.cliente_nombre}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.cliente_email}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Estado</h4>
                  <Badge className={getStatusColor(selectedOrder.estado)}>
                    {getStatusLabel(selectedOrder.estado)}
                  </Badge>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Productos</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium">{item.producto_nombre}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Cantidad: {item.cantidad} × ${item.precio.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold">${item.subtotal.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span>${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  {selectedOrder.descuento > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento:</span>
                      <span>-${selectedOrder.descuento.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Información de Entrega</h4>
                <p className="text-gray-600 dark:text-gray-400">{selectedOrder.direccion_entrega}</p>
                {selectedOrder.notas && (
                  <p className="text-sm text-gray-500 mt-1">
                    <strong>Notas:</strong> {selectedOrder.notas}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
