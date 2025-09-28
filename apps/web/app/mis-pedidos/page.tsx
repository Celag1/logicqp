"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Package, 
  Calendar, 
  DollarSign, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react";

// Datos de ejemplo para pedidos
const mockPedidos = [
  {
    id: "PED-001",
    fecha: "2024-01-15",
    estado: "entregado",
    total: 1250.50,
    items: 3,
    metodoPago: "Tarjeta de Crédito",
    direccion: "Av. Principal 123, Quito",
    tracking: "TRK123456789"
  },
  {
    id: "PED-002", 
    fecha: "2024-01-12",
    estado: "en_transito",
    total: 890.75,
    items: 2,
    metodoPago: "Transferencia",
    direccion: "Calle Secundaria 456, Guayaquil",
    tracking: "TRK987654321"
  },
  {
    id: "PED-003",
    fecha: "2024-01-10",
    estado: "procesando",
    total: 2100.00,
    items: 5,
    metodoPago: "Efectivo",
    direccion: "Plaza Central 789, Cuenca",
    tracking: null
  },
  {
    id: "PED-004",
    fecha: "2024-01-08",
    estado: "cancelado",
    total: 450.25,
    items: 1,
    metodoPago: "Tarjeta de Débito",
    direccion: "Zona Norte 321, Ambato",
    tracking: null
  }
];

const estadosPedido = {
  entregado: { label: "Entregado", color: "bg-green-100 text-green-800", icon: CheckCircle },
  en_transito: { label: "En Tránsito", color: "bg-blue-100 text-blue-800", icon: Truck },
  procesando: { label: "Procesando", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-800", icon: XCircle }
};

export default function MisPedidosPage() {
  const [pedidos] = useState(mockPedidos);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  const pedidosFiltrados = pedidos.filter(pedido => {
    const coincideBusqueda = pedido.id.toLowerCase().includes(busqueda.toLowerCase()) ||
                           pedido.fecha.includes(busqueda);
    const coincideEstado = filtroEstado === "todos" || pedido.estado === filtroEstado;
    return coincideBusqueda && coincideEstado;
  });

  const getEstadoInfo = (estado: keyof typeof estadosPedido) => {
    return estadosPedido[estado] || estadosPedido.procesando;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mis Pedidos</h1>
              <p className="text-gray-600 mt-2">Gestiona y realiza seguimiento de tus pedidos</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Filtros y Búsqueda */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por ID de pedido o fecha..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="entregado">Entregado</SelectItem>
                    <SelectItem value="en_transito">En Tránsito</SelectItem>
                    <SelectItem value="procesando">Procesando</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Pedidos</p>
                  <p className="text-2xl font-bold text-gray-900">{pedidos.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Entregados</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pedidos.filter(p => p.estado === 'entregado').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">En Proceso</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pedidos.filter(p => p.estado === 'procesando' || p.estado === 'en_transito').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Gastado</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(pedidos.reduce((sum, p) => sum + p.total, 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Pedidos */}
        <div className="space-y-4">
          {pedidosFiltrados.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron pedidos</h3>
                <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
              </CardContent>
            </Card>
          ) : (
            pedidosFiltrados.map((pedido) => {
              const estadoInfo = getEstadoInfo(pedido.estado as keyof typeof estadosPedido);
              const EstadoIcon = estadoInfo.icon;
              
              return (
                <Card key={pedido.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Pedido {pedido.id}</h3>
                            <p className="text-sm text-gray-500 flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(pedido.fecha)}
                            </p>
                          </div>
                          <Badge className={`${estadoInfo.color} flex items-center space-x-1`}>
                            <EstadoIcon className="h-3 w-3" />
                            <span>{estadoInfo.label}</span>
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Total</p>
                            <p className="text-lg font-semibold text-gray-900">{formatCurrency(pedido.total)}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Items</p>
                            <p className="text-lg font-semibold text-gray-900">{pedido.items}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Método de Pago</p>
                            <p className="text-lg font-semibold text-gray-900">{pedido.metodoPago}</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-600 mb-1">Dirección de Entrega</p>
                          <p className="text-sm text-gray-900">{pedido.direccion}</p>
                        </div>
                        
                        {pedido.tracking && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-600 mb-1">Código de Seguimiento</p>
                            <p className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              {pedido.tracking}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 mt-4 lg:mt-0 lg:ml-6">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </Button>
                        {pedido.tracking && (
                          <Button variant="outline" size="sm">
                            <Truck className="h-4 w-4 mr-2" />
                            Rastrear
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Factura
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
