"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import UniversalExportButton from "@/components/universal-export-button";
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Package,
  Users,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Target,
  Star
} from "lucide-react";

interface Sale {
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  items: number;
  status: 'completed' | 'pending' | 'cancelled' | 'refunded';
  paymentMethod: string;
  date: string;
  salesperson: string;
  notes?: string;
}

interface SalesMetric {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: any;
  color: string;
}

const mockSales: Sale[] = [
  {
    id: "1",
    customerName: "María González",
    customerEmail: "maria.gonzalez@email.com",
    total: 245.50,
    items: 3,
    status: 'completed',
    paymentMethod: 'Tarjeta de Crédito',
    date: '2024-01-20',
    salesperson: 'Carlos Ruiz',
    notes: 'Cliente VIP - Descuento aplicado'
  },
  {
    id: "2",
    customerName: "Juan Pérez",
    customerEmail: "juan.perez@email.com",
    total: 89.99,
    items: 1,
    status: 'pending',
    paymentMethod: 'Efectivo',
    date: '2024-01-20',
    salesperson: 'Ana López'
  },
  {
    id: "3",
    customerName: "Laura Martínez",
    customerEmail: "laura.martinez@email.com",
    total: 156.75,
    items: 2,
    status: 'completed',
    paymentMethod: 'Transferencia',
    date: '2024-01-19',
    salesperson: 'Carlos Ruiz'
  },
  {
    id: "4",
    customerName: "Roberto Silva",
    customerEmail: "roberto.silva@email.com",
    total: 78.30,
    items: 1,
    status: 'cancelled',
    paymentMethod: 'Tarjeta de Débito',
    date: '2024-01-19',
    salesperson: 'Ana López',
    notes: 'Cliente canceló por cambio de opinión'
  },
  {
    id: "5",
    customerName: "Carmen Díaz",
    customerEmail: "carmen.diaz@email.com",
    total: 320.00,
    items: 4,
    status: 'completed',
    paymentMethod: 'Tarjeta de Crédito',
    date: '2024-01-18',
    salesperson: 'Miguel Torres'
  },
  {
    id: "6",
    customerName: "Pedro Ramírez",
    customerEmail: "pedro.ramirez@email.com",
    total: 45.60,
    items: 1,
    status: 'refunded',
    paymentMethod: 'Efectivo',
    date: '2024-01-18',
    salesperson: 'Ana López',
    notes: 'Producto defectuoso - Reembolso completo'
  }
];

const mockMetrics: SalesMetric[] = [
  {
    id: "total_sales",
    title: "Ventas Totales",
    value: "$12,450.50",
    change: 15.2,
    changeType: "increase",
    icon: DollarSign,
    color: "text-green-600"
  },
  {
    id: "total_orders",
    title: "Órdenes",
    value: 156,
    change: 8.7,
    changeType: "increase",
    icon: ShoppingBag,
    color: "text-blue-600"
  },
  {
    id: "avg_order_value",
    title: "Valor Promedio",
    value: "$79.81",
    change: -2.1,
    changeType: "decrease",
    icon: BarChart3,
    color: "text-purple-600"
  },
  {
    id: "conversion_rate",
    title: "Tasa de Conversión",
    value: "68.5%",
    change: 12.3,
    changeType: "increase",
    icon: Target,
    color: "text-orange-600"
  }
];

export default function VentasPage() {
  const [sales, setSales] = useState<Sale[]>(mockSales);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'total' | 'customer'>('date');

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.salesperson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || sale.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'total':
        return b.total - a.total;
      case 'customer':
        return a.customerName.localeCompare(b.customerName);
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      case 'refunded': return 'Reembolsada';
      default: return 'Desconocido';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'Tarjeta de Crédito':
      case 'Tarjeta de Débito':
        return '💳';
      case 'Efectivo':
        return '💵';
      case 'Transferencia':
        return '🏦';
      default:
        return '💰';
    }
  };

  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const completedSales = sales.filter(s => s.status === 'completed').length;
  const pendingSales = sales.filter(s => s.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Ventas</h1>
              <p className="text-gray-600">Controla y analiza todas las ventas del sistema</p>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {mockMetrics.map((metric) => (
            <Card key={metric.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {metric.changeType === 'increase' ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      <span className={`text-xs ${metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(metric.change)}%
                      </span>
                    </div>
                  </div>
                  <metric.icon className={`h-8 w-8 ${metric.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ventas Completadas</p>
                  <p className="text-2xl font-bold text-green-600">{completedSales}</p>
                </div>
                <Star className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ventas Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingSales}</p>
                </div>
                <RefreshCw className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total del Día</p>
                  <p className="text-2xl font-bold text-blue-600">${totalSales.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar ventas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Filtrar por estado"
                >
                  <option value="all">Todos los estados</option>
                  <option value="completed">Completadas</option>
                  <option value="pending">Pendientes</option>
                  <option value="cancelled">Canceladas</option>
                  <option value="refunded">Reembolsadas</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'total' | 'customer')}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Ordenar por"
                >
                  <option value="date">Más recientes</option>
                  <option value="total">Mayor valor</option>
                  <option value="customer">Cliente A-Z</option>
                </select>
              </div>
              <div className="flex gap-2">
                <UniversalExportButton
                  data={filteredSales}
                  title="Reporte de Ventas"
                  subtitle="Historial completo de transacciones de ventas"
                  columns={[
                    { key: 'id', label: 'ID', width: 10 },
                    { key: 'customer', label: 'Cliente', width: 20 },
                    { key: 'products', label: 'Productos', width: 15 },
                    { key: 'total', label: 'Total', type: 'currency', width: 12 },
                    { key: 'status', label: 'Estado', width: 12 },
                    { key: 'date', label: 'Fecha', type: 'date', width: 15 },
                    { key: 'paymentMethod', label: 'Método Pago', width: 16 }
                  ]}
                  summary={[
                    { label: 'Total ventas', value: filteredSales.length, icon: '💰' },
                    { label: 'Ingresos totales', value: `$${filteredSales.reduce((sum, s) => sum + s.total, 0).toLocaleString()}`, icon: '📈' },
          { label: 'Ventas completadas', value: filteredSales.filter(s => s.status === 'completed').length, icon: '✅' },
          { label: 'Ventas pendientes', value: filteredSales.filter(s => s.status === 'pending').length, icon: '⏳' }
                  ]}
                  filters={[
                    { label: 'Búsqueda', value: searchTerm || 'Ninguna' },
                    { label: 'Estado', value: filterStatus === 'all' ? 'Todas' : filterStatus },
                    { label: 'Orden', value: sortBy === 'date' ? 'Por fecha' : sortBy === 'total' ? 'Por total' : 'Por cliente' }
                  ]}
                  variant="outline"
                  size="sm"
                  className="border-gray-200 hover:border-green-500 hover:bg-green-50"
                />
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Venta
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Table */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Ventas</CardTitle>
            <CardDescription>
              Lista completa de todas las ventas registradas en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Cliente</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Total</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Items</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Estado</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Pago</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Vendedor</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Fecha</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm text-gray-600">#{sale.id}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{sale.customerName}</div>
                          <div className="text-sm text-gray-500">{sale.customerEmail}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-green-600">${sale.total.toFixed(2)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span>{sale.items}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(sale.status)}>
                          {getStatusLabel(sale.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getPaymentMethodIcon(sale.paymentMethod)}</span>
                          <span className="text-sm">{sale.paymentMethod}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">{sale.salesperson}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{new Date(sale.date).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-1">
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
                  ))}
                </tbody>
              </table>
            </div>

            {filteredSales.length === 0 && (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron ventas</h3>
                <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Análisis Rápido</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2">
                <PieChart className="h-6 w-6" />
                <span>Ventas por Día</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Users className="h-6 w-6" />
                <span>Top Vendedores</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Package className="h-6 w-6" />
                <span>Productos Más Vendidos</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <TrendingUp className="h-6 w-6" />
                <span>Tendencias</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



