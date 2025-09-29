'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { 
  Home, 
  Package, 
  ShoppingCart, 
  User, 
  BarChart3, 
  TrendingUp, 
  Receipt, 
  Activity, 
  Users, 
  Cog, 
  Shield, 
  Building, 
  X, 
  ChevronDown, 
  ChevronRight,
  Brain,
  LogOut
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

export default function SidebarMenuFixed({ userRole = "cliente", isAuthenticated = false, isOpen, onClose }: SidebarMenuProps) {
  const router = useRouter();
  const { signOut, user, profile } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Obtener información del usuario
  let currentUserRole = profile?.rol || user?.role || userRole;
  const currentUserName = profile?.nombre || user?.email?.split('@')[0] || 'Usuario';
  
  // Debug y fallback para super admin
  console.log('🔍 Sidebar Fixed - Debug del rol:');
  console.log('  profile?.rol:', profile?.rol);
  console.log('  user?.role:', user?.role);
  console.log('  userRole prop:', userRole);
  console.log('  currentUserRole inicial:', currentUserRole);
  console.log('  isAuthenticated:', isAuthenticated);
  
  // Forzar super admin para admin@logicqp.com
  if (profile?.email === 'admin@logicqp.com' || user?.email === 'admin@logicqp.com') {
    currentUserRole = 'super_admin';
    console.log('🔧 Forzando rol super_admin para admin@logicqp.com');
  }
  
  if (profile?.rol === 'super_admin') {
    currentUserRole = 'super_admin';
    console.log('🔧 Confirmando rol super_admin desde perfil');
  }
  
  console.log('  currentUserRole final:', currentUserRole);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      onClose();
      
      const result = await signOut();
      
      if (result && result.error) {
        console.error('❌ Error al cerrar sesión:', result.error);
      }
      
      setIsLoggingOut(false);
      
    } catch (error) {
      console.error('❌ Error inesperado al cerrar sesión:', error);
      alert('Error inesperado al cerrar sesión. Redirigiendo al login...');
      setIsLoggingOut(false);
      
      try {
        window.location.href = '/login';
      } catch (redirectError) {
        console.error('❌ Error en redirección:', redirectError);
      }
    }
  };

  const [expandedSections, setExpandedSections] = useState<string[]>(["Público", "Gestión", "Administración"]);
  
  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionTitle) 
        ? prev.filter((title: string) => title !== sectionTitle)
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
        onClick={onClose}
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

          {/* User Info - SIEMPRE MOSTRAR SI HAY USUARIO */}
          {(profile || user) && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{currentUserName}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(currentUserRole)}`}>
                    {getRoleDisplayName(currentUserRole)}
                  </span>
                </div>
              </div>
              
              {/* Debug info */}
              <div className="mt-2 text-xs text-gray-500">
                <p>Email: {profile?.email || user?.email || 'No disponible'}</p>
                <p>Rol detectado: {currentUserRole}</p>
                <p>Perfil cargado: {profile ? 'Sí' : 'No'}</p>
              </div>
              
              {/* Logout Button */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  {isLoggingOut ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                      Cerrando...
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar Sesión
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Navigation Sections */}
          <div className="space-y-4">
            {navigationSections.map((section: any) => {
              // Para super admin, mostrar todos los elementos
              let filteredItems;
              if (currentUserRole === 'super_admin') {
                filteredItems = section.items;
                console.log(`🔧 Super admin - Mostrando todos los elementos de ${section.title}:`, filteredItems.length);
              } else {
                filteredItems = section.items.filter((item: any) => {
                  if (item.public) return true;
                  if (item.roles && item.roles.includes(currentUserRole)) return true;
                  return false;
                });
              }
              
              if (filteredItems.length === 0) return null;

              const isExpanded = expandedSections.includes(section.title);

              return (
                <div key={section.title}>
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="flex items-center justify-between w-full px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
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
                      {filteredItems.map((item: any) => (
                        <button
                          key={item.name}
                          onClick={() => {
                            router.push(item.href);
                            onClose();
                          }}
                          className="flex items-center w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          <item.icon className="h-4 w-4 mr-3" />
                          <span>{item.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
