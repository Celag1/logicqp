"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  X, 
  Bell, 
  Check, 
  CheckCheck, 
  AlertCircle, 
  Info, 
  ShoppingCart, 
  Package, 
  CreditCard, 
  Truck, 
  Star, 
  Settings,
  Filter,
  Trash2,
  MoreVertical,
  Clock,
  Mail,
  Smartphone
} from "lucide-react";

interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error" | "order" | "payment" | "shipping" | "promotion";
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  isImportant: boolean;
  actionUrl?: string;
  actionText?: string;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const notificationTypes = {
  info: { icon: Info, color: "bg-blue-100 text-blue-800", bgColor: "bg-blue-50" },
  success: { icon: Check, color: "bg-green-100 text-green-800", bgColor: "bg-green-50" },
  warning: { icon: AlertCircle, color: "bg-yellow-100 text-yellow-800", bgColor: "bg-yellow-50" },
  error: { icon: AlertCircle, color: "bg-red-100 text-red-800", bgColor: "bg-red-50" },
  order: { icon: ShoppingCart, color: "bg-purple-100 text-purple-800", bgColor: "bg-purple-50" },
  payment: { icon: CreditCard, color: "bg-indigo-100 text-indigo-800", bgColor: "bg-indigo-50" },
  shipping: { icon: Truck, color: "bg-orange-100 text-orange-800", bgColor: "bg-orange-50" },
  promotion: { icon: Star, color: "bg-pink-100 text-pink-800", bgColor: "bg-pink-50" }
};

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "order",
    title: "Pedido Confirmado",
    message: "Tu pedido #PED-001 ha sido confirmado y está siendo procesado.",
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    isRead: false,
    isImportant: true,
    actionUrl: "/mis-pedidos",
    actionText: "Ver Pedido"
  },
  {
    id: "2",
    type: "shipping",
    title: "Envío en Camino",
    message: "Tu pedido #PED-002 está en camino. Código de seguimiento: TRK123456789",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: false,
    isImportant: true,
    actionUrl: "/mis-pedidos",
    actionText: "Rastrear"
  },
  {
    id: "3",
    type: "payment",
    title: "Pago Procesado",
    message: "Tu pago de $125.50 ha sido procesado exitosamente.",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    isRead: true,
    isImportant: false,
    actionUrl: "/mis-pedidos",
    actionText: "Ver Factura"
  },
  {
    id: "4",
    type: "promotion",
    title: "Oferta Especial",
    message: "¡20% de descuento en productos seleccionados! Válido hasta el 31 de enero.",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    isRead: true,
    isImportant: false,
    actionUrl: "/catalogo/ofertas",
    actionText: "Ver Ofertas"
  },
  {
    id: "5",
    type: "info",
    title: "Mantenimiento Programado",
    message: "El sistema estará en mantenimiento el domingo de 2:00 AM a 4:00 AM.",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    isRead: true,
    isImportant: false
  },
  {
    id: "6",
    type: "success",
    title: "Perfil Actualizado",
    message: "Tu información de perfil ha sido actualizada correctamente.",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    isRead: true,
    isImportant: false,
    actionUrl: "/perfil",
    actionText: "Ver Perfil"
  }
];

export default function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<"all" | "unread" | "important">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [settings, setSettings] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: true
  });

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === "all" || 
      (filter === "unread" && !notification.isRead) ||
      (filter === "important" && notification.isImportant);
    
    const matchesType = typeFilter === "all" || notification.type === typeFilter;
    
    return matchesFilter && matchesType;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const importantCount = notifications.filter(n => n.isImportant && !n.isRead).length;

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

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Ahora";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  };

  const getNotificationTypeInfo = (type: keyof typeof notificationTypes) => {
    return notificationTypes[type] || notificationTypes.info;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl h-[80vh] flex flex-col">
        <CardHeader className="flex-shrink-0 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{unreadCount}</span>
                  </div>
                )}
              </div>
              <div>
                <CardTitle className="text-xl">Notificaciones</CardTitle>
                <CardDescription>
                  {unreadCount > 0 ? `${unreadCount} no leídas` : "Todas leídas"}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Marcar todas
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Filters */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filtrar notificaciones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas ({notifications.length})</SelectItem>
                    <SelectItem value="unread">No leídas ({unreadCount})</SelectItem>
                    <SelectItem value="important">Importantes ({importantCount})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:w-48">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de notificación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="order">Pedidos</SelectItem>
                    <SelectItem value="shipping">Envíos</SelectItem>
                    <SelectItem value="payment">Pagos</SelectItem>
                    <SelectItem value="promotion">Promociones</SelectItem>
                    <SelectItem value="info">Información</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <ScrollArea className="flex-1">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay notificaciones</h3>
                <p className="text-gray-500">No se encontraron notificaciones con los filtros seleccionados</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {filteredNotifications.map((notification) => {
                  const typeInfo = getNotificationTypeInfo(notification.type);
                  const Icon = typeInfo.icon;
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                        notification.isRead ? "bg-white" : "bg-blue-50 border-blue-200"
                      } ${typeInfo.bgColor}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${typeInfo.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-sm font-medium ${notification.isRead ? "text-gray-900" : "text-gray-900"}`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-2">
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              )}
                              <span className="text-xs text-gray-500">{getTimeAgo(notification.timestamp)}</span>
                            </div>
                          </div>
                          
                          <p className={`text-sm mt-1 ${notification.isRead ? "text-gray-600" : "text-gray-700"}`}>
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center space-x-2">
                              {notification.actionUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs"
                                >
                                  {notification.actionText}
                                </Button>
                              )}
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Marcar leída
                                </Button>
                              )}
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="text-red-600 hover:text-red-700 text-xs"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Settings */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-700">Configuración de Notificaciones</h4>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Configurar
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Email</span>
                </div>
                <Switch
                  checked={settings.email}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, email: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Push</span>
                </div>
                <Switch
                  checked={settings.push}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, push: checked }))}
                />
              </div>
            </div>
            
            {notifications.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAll}
                  className="w-full text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpiar Todas las Notificaciones
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
