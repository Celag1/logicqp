"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  Menu,
  X,
  Home,
  Package,
  BarChart3,
  Users,
  Settings,
  LogOut,
  ShoppingCart,
  User,
  Bell,
  Search,
  Brain,
  Zap,
  Shield,
  TrendingUp,
  FileText,
  ShoppingBag,
  UserCheck,
  Building,
  CreditCard,
  Receipt,
  Cog,
  ChevronRight,
  ChevronDown,
  Activity
} from "lucide-react";

interface SidebarMenuProps {
  userRole?: string;
  isAuthenticated?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  name: string;
  href: string;
  icon: any;
  public: boolean;
  roles?: string[];
}

const navigationSections: { title: string; items: MenuItem[] }[] = [
  {
    title: "Público",
    items: [
      { name: "Inicio", href: "/", icon: Home, public: true },
      { name: "Catálogo", href: "/catalogo", icon: Package, public: true },
      { name: "Carrito", href: "/carrito", icon: ShoppingCart, public: true },
      { name: "Perfil", href: "/perfil", icon: User, public: true },
    ]
  },
  {
    title: "Gestión",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: BarChart3, public: false, roles: ["super_admin", "administrador", "vendedor", "inventario", "contable"] },
      { name: "Inventario", href: "/inventario", icon: TrendingUp, public: false, roles: ["super_admin", "administrador", "inventario"] },
      { name: "Órdenes", href: "/ordenes", icon: Receipt, public: false, roles: ["super_admin", "administrador", "vendedor", "contable"] },
      { name: "Analytics", href: "/analytics", icon: Activity, public: false, roles: ["super_admin", "administrador", "contable"] },
      { name: "Reportes", href: "/reportes", icon: BarChart3, public: false, roles: ["super_admin", "administrador", "contable"] },
    ]
  },
  {
    title: "Administración",
    items: [
      { name: "Usuarios", href: "/usuarios", icon: Users, public: false, roles: ["super_admin", "administrador"] },
      { name: "Configuración", href: "/configuracion", icon: Cog, public: false, roles: ["super_admin", "administrador"] },
      { name: "Permisos", href: "/admin/permisos", icon: Shield, public: false, roles: ["super_admin"] },
      { name: "Empresa", href: "/admin/empresa", icon: Building, public: false, roles: ["super_admin"] },
    ]
  }
];

export default function SidebarMenu({ userRole = "cliente", isAuthenticated = false, isOpen, onClose }: SidebarMenuProps) {
  const router = useRouter();
  const { signOut, user, profile } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Obtener información real del usuario
  const currentUserRole = profile?.rol || user?.role || userRole;
  const currentUserName = profile?.nombre || user?.email?.split('@')[0] || 'Usuario';


  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      // Cerrar el sidebar inmediatamente
      onClose();
      
      // Cerrar sesión usando el hook
      const result = await signOut();
      
      if (result && result.error) {
        console.error('❌ Sidebar: Error al cerrar sesión:', result.error);
        // No mostrar alerta, la función signOut ya maneja la redirección
        console.log('Redirigiendo a login...');
      }
      
      // La redirección se maneja en la función signOut
      setIsLoggingOut(false);
      
    } catch (error) {
      console.error('❌ Sidebar: Error inesperado al cerrar sesión:', error);
      alert('Error inesperado al cerrar sesión. Redirigiendo al login...');
      setIsLoggingOut(false);
      
      // Forzar redirección incluso si hay error
      try {
        window.location.href = '/login';
      } catch (redirectError) {
        console.error('❌ Error en redirección:', redirectError);
      }
    }
  };
  const [expandedSections, setExpandedSections] = useState<string[]>(["Público", "Gestión", "Administración"]);
  
  // Sistema de permisos básico

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionTitle) 
        ? prev.filter(title => title !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames: { [key: string]: string } = {
      super_admin: "Super Administrador",
      administrador: "Administrador",
      vendedor: "Vendedor",
      inventario: "Inventario",
      contable: "Contable",
      cliente: "Cliente"
    };
    return roleNames[role] || role;
  };

  const getRoleColor = (role: string) => {
    const roleColors: { [key: string]: string } = {
      super_admin: "bg-red-100 text-red-800",
      administrador: "bg-purple-100 text-purple-800",
      vendedor: "bg-blue-100 text-blue-800",
      inventario: "bg-green-100 text-green-800",
      contable: "bg-orange-100 text-orange-800",
      cliente: "bg-gray-100 text-gray-800"
    };
    return roleColors[role] || "bg-gray-100 text-gray-800";
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => {
          onClose();
        }}
      />

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">LogicQP</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          {isAuthenticated && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  {(profile?.foto_url || profile?.avatar) ? (
                    <img 
                      src={profile?.foto_url || profile?.avatar} 
                      alt={`Foto de ${currentUserName}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Si falla la imagen, mostrar icono
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        e.currentTarget.nextElementSibling?.classList.add('flex');
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center ${(profile?.foto_url || profile?.avatar) ? 'hidden' : 'flex'}`}>
                    <User className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{currentUserName}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(currentUserRole)}`}>
                    {getRoleDisplayName(currentUserRole)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Sections */}
          <div className="space-y-4">
            {navigationSections.map((section) => {
              const filteredItems = section.items.filter((item) => {
                if (item.public) return true;
                if (item.roles && item.roles.includes(currentUserRole)) return true;
                return false;
              });
              if (filteredItems.length === 0) return null;

              const isExpanded = expandedSections.includes(section.title);

              return (
                <div key={section.title}>
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full flex items-center justify-between p-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <span>{section.title}</span>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="ml-4 space-y-1">
                      {filteredItems.map((item: MenuItem) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            onClick={onClose}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Acciones Rápidas</h3>
            <div className="space-y-2">
              <Link
                href="/asistente-ia"
                className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                onClick={onClose}
              >
                <Brain className="h-4 w-4" />
                <span>Asistente IA</span>
              </Link>
              <Link
                href="/busqueda"
                className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                onClick={onClose}
              >
                <Search className="h-4 w-4" />
                <span>Búsqueda</span>
              </Link>
              <Link
                href="/notificaciones"
                className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                onClick={onClose}
              >
                <Bell className="h-4 w-4" />
                <span>Notificaciones</span>
              </Link>
            </div>
          </div>

          {/* Logout */}
          {isAuthenticated && (
            <div className="mt-8 pt-6 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}