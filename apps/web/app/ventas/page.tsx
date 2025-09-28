"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Target,
  Calendar,
  User,
  CreditCard,
  CheckCircle,
  Clock,
  Truck,
  AlertCircle,
  Loader2,
  RefreshCw
} from "lucide-react";

// Importar Supabase para obtener datos reales
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface Sale {
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  items: number;
  status: 'completed' | 'pending' | 'processing' | 'shipped' | 'cancelled';
  paymentMethod: string;
  date: string;
  salesperson: string;
  notes?: string;
}

interface SalesMetric {
  id: string;
  title: string;
  value: string;
  change: number;
  changeType: "increase" | "decrease";
  icon: any;
  color: string;
}

export default function VentasPage() {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [metrics, setMetrics] = useState<SalesMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [dateFilter, setDateFilter] = useState("todos");

  // Función para cargar ventas reales desde Supabase
  const loadSalesData = async () => {
    try {
      setLoading(true);

      // Cargar ventas desde la base de datos
      // Primero intentar con la tabla ventas, si no existe usar la vista
      let { data: ventas, error: ventasError } = await supabase
        .from('ventas')
        .select(`
          *,
          venta_items(
            id,
            cantidad,
            precio_unitario,
            productos(nombre)
          )
        `)
        .order('fecha_venta', { ascending: false });

      // Si la tabla ventas no existe, usar la vista
      if (ventasError && ventasError.code === 'PGRST205') {
        console.log('Tabla ventas no encontrada, usando vista vw_ventas_resumen');
        const { data: vistaData, error: vistaError } = await supabase
          .from('vw_ventas_resumen')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (vistaError) {
          console.error('Error cargando vista de ventas:', vistaError);
          setSales([]);
          setFilteredSales([]);
          setMetrics([]);
          return;
        }
        
        // Transformar datos de la vista al formato esperado
        ventas = vistaData?.map((vista: any) => ({
          id: vista.id,
          numero_venta: vista.numero_venta,
          cliente_id: vista.cliente_id,
          cliente_nombre: vista.cliente_nombre,
          cliente_telefono: vista.cliente_telefono,
          cliente_email: vista.cliente_email,
          vendedor_id: vista.vendedor_id,
          vendedor_nombre: vista.vendedor_nombre,
          total: vista.total,
          subtotal: vista.subtotal,
          impuestos: vista.impuestos,
          descuento: vista.descuento,
          metodo_pago: vista.metodo_pago,
          estado: vista.estado,
          fecha_venta: vista.created_at,
          created_at: vista.created_at,
          updated_at: vista.updated_at,
          venta_items: [] // La vista no incluye items
        })) || [];
        
        ventasError = null;
      }

      if (ventasError) {
        console.error('Error cargando ventas:', ventasError);
        setSales([]);
        setFilteredSales([]);
        setMetrics([]);
        return;
      }

      // Transformar datos de Supabase al formato esperado
      const realSales: Sale[] = ventas?.map((venta: any) => ({
        id: venta.id.toString(),
        customerName: venta.cliente_nombre || 'Cliente',
        customerEmail: venta.cliente_email || 'cliente@email.com',
        total: venta.total || 0,
        items: venta.venta_items?.length || 0,
        status: venta.estado === 'completada' ? 'completed' : 
                venta.estado === 'pendiente' ? 'pending' : 
                venta.estado === 'enviada' ? 'shipped' : 'processing',
        paymentMethod: venta.metodo_pago || 'Efectivo',
        date: venta.fecha_venta?.split('T')[0] || new Date().toISOString().split('T')[0],
        salesperson: venta.vendedor_nombre || 'Vendedor',
        notes: venta.observaciones
      })) || [];

      setSales(realSales);
      setFilteredSales(realSales);

      // Calcular métricas reales
      const totalSales = realSales.reduce((sum, sale) => sum + sale.total, 0);
      const totalOrders = realSales.length;
      const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
      const completedOrders = realSales.filter(sale => sale.status === 'completed').length;
      const conversionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

      const realMetrics: SalesMetric[] = [
        {
          id: "total_sales",
          title: "Ventas Totales",
          value: `$${totalSales.toLocaleString()}`,
          change: 0,
          changeType: "increase",
          icon: DollarSign,
          color: "text-green-600"
        },
        {
          id: "total_orders",
          title: "Órdenes",
          value: totalOrders.toString(),
          change: 0,
          changeType: "increase",
          icon: ShoppingCart,
          color: "text-blue-600"
        },
        {
          id: "avg_order_value",
          title: "Valor Promedio",
          value: `$${avgOrderValue.toFixed(2)}`,
          change: 0,
          changeType: "increase",
          icon: TrendingUp,
          color: "text-purple-600"
        },
        {
          id: "conversion_rate",
          title: "Tasa de Conversión",
          value: `${conversionRate.toFixed(1)}%`,
          change: 0,
          changeType: "increase",
          icon: Target,
          color: "text-orange-600"
        }
      ];

      setMetrics(realMetrics);

    } catch (error) {
      console.error('Error cargando datos de ventas:', error);
    } finally {
      setLoading(false);
    }
  };


  // Filtros
  useEffect(() => {
    let filtered = sales;

    if (searchTerm) {
      filtered = filtered.filter(sale =>
        sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "todos") {
      filtered = filtered.filter(sale => sale.status === statusFilter);
    }

    setFilteredSales(filtered);
  }, [sales, searchTerm, statusFilter]);

  useEffect(() => {
    loadSalesData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'processing': return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case 'shipped': return <Truck className="h-4 w-4 text-purple-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      pending: 'secondary',
      processing: 'outline',
      shipped: 'outline',
      cancelled: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status === 'completed' ? 'Completada' :
         status === 'pending' ? 'Pendiente' :
         status === 'processing' ? 'Procesando' :
         status === 'shipped' ? 'Enviada' : 'Cancelada'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando datos de ventas desde la base de datos...</p>
        </div>
      </div>
    );
  }

  // Mostrar mensaje cuando no hay ventas reales
  if (!loading && sales.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No hay ventas registradas</h2>
          <p className="text-gray-600 mb-6">
            No se encontraron ventas en la base de datos. Las ventas aparecerán aquí cuando se registren en el sistema.
          </p>
          <Button 
            onClick={() => loadSalesData()} 
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
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
                Gestión de Ventas
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Ventas reales de Qualipharm - Datos en tiempo real
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Venta
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric) => (
            <Card key={metric.id} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${metric.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                    <metric.icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtros */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por cliente, email o ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="completed">Completadas</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="processing">Procesando</SelectItem>
                  <SelectItem value="shipped">Enviadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Ventas */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              Ventas Recientes ({filteredSales.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredSales.length > 0 ? (
                filteredSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(sale.status)}
                      <div>
                        <p className="font-medium text-gray-900">{sale.customerName}</p>
                        <p className="text-sm text-gray-600">{sale.customerEmail}</p>
                        <p className="text-xs text-gray-500">ID: {sale.id} • {sale.items} items</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${sale.total.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{sale.paymentMethod}</p>
                        <p className="text-xs text-gray-500">{sale.date}</p>
                      </div>
                      {getStatusBadge(sale.status)}
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg">No hay ventas registradas</p>
                  <p className="text-sm">Las ventas aparecerán aquí cuando se registren en el sistema</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
