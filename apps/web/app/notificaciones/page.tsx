"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Bell, 
  Check, 
  X, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Clock,
  Settings,
  Filter,
  CheckCheck,
  Trash2,
  Archive,
  Star,
  Eye
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  isStarred: boolean;
  timestamp: Date;
  category: string;
  action?: {
    label: string;
    href: string;
  };
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Nueva Orden Recibida",
    message: "Se ha recibido una nueva orden #ORD-2024-001 por $1,250.00",
    type: 'info',
    priority: 'high',
    isRead: false,
    isStarred: false,
    timestamp: new Date('2024-01-16T10:30:00'),
    category: "Ventas",
    action: {
      label: "Ver Orden",
      href: "/ordenes/ORD-2024-001"
    }
  },
  {
    id: "2",
    title: "Inventario Bajo",
    message: "El producto 'Laptop Dell Inspiron' tiene solo 2 unidades en stock",
    type: 'warning',
    priority: 'high',
    isRead: false,
    isStarred: true,
    timestamp: new Date('2024-01-16T09:15:00'),
    category: "Inventario",
    action: {
      label: "Revisar Inventario",
      href: "/inventario"
    }
  },
  {
    id: "3",
    title: "Reporte Generado",
    message: "El reporte de ventas mensuales ha sido generado exitosamente",
    type: 'success',
    priority: 'low',
    isRead: true,
    isStarred: false,
    timestamp: new Date('2024-01-15T16:45:00'),
    category: "Reportes"
  },
  {
    id: "4",
    title: "Error en Sistema",
    message: "Se detectó un error en el módulo de pagos. Revisar logs.",
    type: 'error',
    priority: 'high',
    isRead: false,
    isStarred: false,
    timestamp: new Date('2024-01-15T14:20:00'),
    category: "Sistema",
    action: {
      label: "Ver Logs",
      href: "/admin/logs"
    }
  },
  {
    id: "5",
    title: "Usuario Nuevo",
    message: "María González se ha registrado como nuevo cliente",
    type: 'info',
    priority: 'low',
    isRead: true,
    isStarred: false,
    timestamp: new Date('2024-01-15T11:30:00'),
    category: "Usuarios"
  }
];

const notificationTypes = {
  info: { icon: Info, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  warning: { icon: AlertTriangle, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  success: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
  error: { icon: X, color: 'text-red-600', bgColor: 'bg-red-100' }
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

export default function NotificacionesPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && !notification.isRead) ||
                         (filter === 'starred' && notification.isStarred);
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    return matchesFilter && matchesType;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const starredCount = notifications.filter(n => n.isStarred).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const toggleStar = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isStarred: !notification.isStarred }
          : notification
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Bell className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notificaciones</h1>
                <p className="text-gray-600">Gestiona tus alertas y notificaciones del sistema</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar Todo como Leído
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configurar
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
                </div>
                <Bell className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">No Leídas</p>
                  <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Destacadas</p>
                  <p className="text-2xl font-bold text-yellow-600">{starredCount}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Leídas</p>
                  <p className="text-2xl font-bold text-green-600">{notifications.length - unreadCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Notifications List */}
          <div className="lg:col-span-3">
            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex space-x-2">
                    <Button
                      variant={filter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter('all')}
                    >
                      Todas
                      <Badge variant="secondary" className="ml-2">{notifications.length}</Badge>
                    </Button>
                    <Button
                      variant={filter === 'unread' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter('unread')}
                    >
                      No Leídas
                      <Badge variant="secondary" className="ml-2">{unreadCount}</Badge>
                    </Button>
                    <Button
                      variant={filter === 'starred' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter('starred')}
                    >
                      Destacadas
                      <Badge variant="secondary" className="ml-2">{starredCount}</Badge>
                    </Button>
                  </div>
                  
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Filtrar por tipo de notificación"
                  >
                    <option value="all">Todos los tipos</option>
                    <option value="info">Información</option>
                    <option value="warning">Advertencia</option>
                    <option value="success">Éxito</option>
                    <option value="error">Error</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <div className="space-y-4">
              {filteredNotifications.map((notification) => {
                const typeConfig = notificationTypes[notification.type];
                const Icon = typeConfig.icon;
                
                return (
                  <Card key={notification.id} className={`${!notification.isRead ? 'border-l-4 border-l-blue-500' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${typeConfig.bgColor}`}>
                          <Icon className={`h-5 w-5 ${typeConfig.color}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className={`text-lg font-semibold ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                                  {notification.title}
                                </h3>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                )}
                              </div>
                              
                              <p className={`text-sm ${notification.isRead ? 'text-gray-500' : 'text-gray-700'} mb-3`}>
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{getTimeAgo(notification.timestamp)}</span>
                                </span>
                                <Badge className={priorityColors[notification.priority]}>
                                  {notification.priority}
                                </Badge>
                                <span>{notification.category}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleStar(notification.id)}
                              >
                                <Star className={`h-4 w-4 ${notification.isStarred ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                              </Button>
                              
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {notification.action && (
                            <div className="mt-4">
                              <Button size="sm" variant="outline">
                                {notification.action.label}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredNotifications.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay notificaciones</h3>
                  <p className="text-gray-500">No se encontraron notificaciones con los filtros seleccionados</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Marcar Todo como Leído
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Archive className="h-4 w-4 mr-2" />
                  Archivar Leídas
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar Todas
                </Button>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Configuración</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Notificaciones por Email</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Notificaciones Push</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Solo Alertas Importantes</span>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
