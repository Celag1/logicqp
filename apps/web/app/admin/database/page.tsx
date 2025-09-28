"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  Search, 
  Filter, 
  RefreshCw, 
  Download,
  Upload,
  Trash2,
  Edit,
  Eye,
  Plus,
  Settings,
  HardDrive,
  Activity,
  Clock,
  Users,
  Package,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";

interface DatabaseTable {
  id: string;
  name: string;
  description: string;
  recordCount: number;
  size: string;
  lastModified: string;
  status: 'active' | 'inactive' | 'maintenance';
  category: string;
}

interface DatabaseMetric {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: any;
  color: string;
}

interface Backup {
  id: string;
  name: string;
  size: string;
  date: string;
  status: 'completed' | 'failed' | 'in_progress';
  type: 'full' | 'incremental';
}

const mockTables: DatabaseTable[] = [
  {
    id: "1",
    name: "users",
    description: "Tabla de usuarios del sistema",
    recordCount: 1247,
    size: "2.3 MB",
    lastModified: "2024-01-20 14:30:00",
    status: 'active',
    category: "Usuarios"
  },
  {
    id: "2",
    name: "products",
    description: "Catálogo de productos",
    recordCount: 3456,
    size: "8.7 MB",
    lastModified: "2024-01-20 12:15:00",
    status: 'active',
    category: "Productos"
  },
  {
    id: "3",
    name: "orders",
    description: "Órdenes y pedidos",
    recordCount: 892,
    size: "4.1 MB",
    lastModified: "2024-01-20 10:45:00",
    status: 'active',
    category: "Ventas"
  },
  {
    id: "4",
    name: "inventory",
    description: "Control de inventario",
    recordCount: 2156,
    size: "3.8 MB",
    lastModified: "2024-01-19 16:20:00",
    status: 'active',
    category: "Inventario"
  },
  {
    id: "5",
    name: "logs",
    description: "Registros del sistema",
    recordCount: 15678,
    size: "12.4 MB",
    lastModified: "2024-01-20 15:00:00",
    status: 'active',
    category: "Sistema"
  },
  {
    id: "6",
    name: "backups",
    description: "Registro de respaldos",
    recordCount: 45,
    size: "156 KB",
    lastModified: "2024-01-18 02:00:00",
    status: 'maintenance',
    category: "Sistema"
  }
];

const mockMetrics: DatabaseMetric[] = [
  {
    id: "total_tables",
    title: "Total Tablas",
    value: 24,
    change: 2,
    changeType: "increase",
    icon: Database,
    color: "text-blue-600"
  },
  {
    id: "total_records",
    title: "Total Registros",
    value: "25.4K",
    change: 8.5,
    changeType: "increase",
    icon: BarChart3,
    color: "text-green-600"
  },
  {
    id: "database_size",
    title: "Tamaño Total",
    value: "31.2 MB",
    change: -1.2,
    changeType: "decrease",
    icon: HardDrive,
    color: "text-purple-600"
  },
  {
    id: "active_connections",
    title: "Conexiones Activas",
    value: 12,
    change: 3,
    changeType: "increase",
    icon: Activity,
    color: "text-orange-600"
  }
];

const mockBackups: Backup[] = [
  {
    id: "1",
    name: "backup_full_20240120",
    size: "28.5 MB",
    date: "2024-01-20 02:00:00",
    status: 'completed',
    type: 'full'
  },
  {
    id: "2",
    name: "backup_incremental_20240119",
    size: "2.1 MB",
    date: "2024-01-19 02:00:00",
    status: 'completed',
    type: 'incremental'
  },
  {
    id: "3",
    name: "backup_full_20240118",
    size: "27.8 MB",
    date: "2024-01-18 02:00:00",
    status: 'completed',
    type: 'full'
  },
  {
    id: "4",
    name: "backup_incremental_20240117",
    size: "1.9 MB",
    date: "2024-01-17 02:00:00",
    status: 'failed',
    type: 'incremental'
  }
];

export default function DatabasePage() {
  const [tables, setTables] = useState<DatabaseTable[]>(mockTables);
  const [backups, setBackups] = useState<Backup[]>(mockBackups);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'tables' | 'backups' | 'performance'>('tables');

  const categories = Array.from(new Set(tables.map(t => t.category)));

  const filteredTables = tables.filter(table => {
    const matchesSearch = table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         table.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || table.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || table.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'inactive': return 'Inactiva';
      case 'maintenance': return 'Mantenimiento';
      default: return 'Desconocido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'inactive': return <XCircle className="h-4 w-4 text-gray-600" />;
      case 'maintenance': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <XCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getBackupStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBackupStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'failed': return 'Fallido';
      case 'in_progress': return 'En Progreso';
      default: return 'Desconocido';
    }
  };

  const getBackupTypeColor = (type: string) => {
    switch (type) {
      case 'full': return 'bg-blue-100 text-blue-800';
      case 'incremental': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBackupTypeLabel = (type: string) => {
    switch (type) {
      case 'full': return 'Completo';
      case 'incremental': return 'Incremental';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Database className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Base de Datos</h1>
              <p className="text-gray-600">Administra y monitorea la base de datos del sistema</p>
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
                      <span className={`text-xs ${metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.changeType === 'increase' ? '+' : ''}{metric.change}%
                      </span>
                    </div>
                  </div>
                  <metric.icon className={`h-8 w-8 ${metric.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('tables')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tables'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Database className="h-4 w-4 inline mr-2" />
                Tablas
              </button>
              <button
                onClick={() => setActiveTab('backups')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'backups'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Download className="h-4 w-4 inline mr-2" />
                Respaldos
              </button>
              <button
                onClick={() => setActiveTab('performance')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'performance'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Activity className="h-4 w-4 inline mr-2" />
                Rendimiento
              </button>
            </nav>
          </div>
        </div>

        {/* Tables Tab */}
        {activeTab === 'tables' && (
          <>
            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-col md:flex-row gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar tablas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Filtrar por categoría"
                    >
                      <option value="all">Todas las categorías</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Filtrar por estado"
                    >
                      <option value="all">Todos los estados</option>
                      <option value="active">Activas</option>
                      <option value="inactive">Inactivas</option>
                      <option value="maintenance">Mantenimiento</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Actualizar
                    </Button>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Tabla
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tables Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTables.map((table) => (
                <Card key={table.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Database className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{table.name}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getStatusColor(table.status)}>
                              {getStatusLabel(table.status)}
                            </Badge>
                            <Badge className="bg-gray-100 text-gray-800">{table.category}</Badge>
                          </div>
                        </div>
                      </div>
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
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{table.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Registros:</span>
                        <span className="text-sm font-medium">{table.recordCount.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Tamaño:</span>
                        <span className="text-sm font-medium">{table.size}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Estado:</span>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(table.status)}
                          <span className="text-sm">{getStatusLabel(table.status)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Última modificación:</span>
                        <span className="text-sm">{new Date(table.lastModified).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <Button size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Estructura
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        <Settings className="h-4 w-4 mr-2" />
                        Optimizar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Backups Tab */}
        {activeTab === 'backups' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Respaldos de Base de Datos</CardTitle>
                    <CardDescription>Gestiona los respaldos automáticos y manuales</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Respaldo
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {backups.map((backup) => (
                    <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Download className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{backup.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{backup.size}</span>
                            <span>{new Date(backup.date).toLocaleDateString()}</span>
                            <Badge className={getBackupTypeColor(backup.type)}>
                              {getBackupTypeLabel(backup.type)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getBackupStatusColor(backup.status)}>
                          {getBackupStatusLabel(backup.status)}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Métricas de Rendimiento</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">CPU Usage</span>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Memory Usage</span>
                    <span className="text-sm font-medium">2.1 GB / 8 GB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Disk I/O</span>
                    <span className="text-sm font-medium">125 MB/s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Query Time</span>
                    <span className="text-sm font-medium">0.8 ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Acciones Rápidas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Optimizar Base de Datos
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Limpiar Cache
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="h-4 w-4 mr-2" />
                    Ver Logs de Rendimiento
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar Índices
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {filteredTables.length === 0 && activeTab === 'tables' && (
          <Card>
            <CardContent className="p-12 text-center">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron tablas</h3>
              <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
