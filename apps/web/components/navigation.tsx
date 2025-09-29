"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { getCompanyLogo } from "@/lib/utils/company-logo";
import SidebarMenu from "./sidebar-menu";
import AIAssistantModal from "./modals/ai-assistant-modal";
import NotificationsModal from "./modals/notifications-modal";
import SearchModal from "./modals/search-modal";
import AdvancedSearchModal from "./search/advanced-search-modal";
import SmartSearchBar from "./search/smart-search-bar";
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
  ChevronDown,
  Store,
  ClipboardList,
  PieChart,
  Database,
  Globe,
  Lock,
  Briefcase,
  Star
} from "lucide-react";

interface NavigationProps {
  userRole?: string;
  isAuthenticated?: boolean;
}

// Estructura de menús desplegables modernos para el menú principal horizontal
const navigationMenu = [
  {
    title: "Inicio",
    href: "/",
    icon: Home,
    public: true,
    description: "Página principal"
  },
  {
    title: "Catálogo",
    icon: Store,
    public: true,
    description: "Productos y servicios",
    submenu: [
      { name: "Ver Catálogo", href: "/catalogo", icon: Package, description: "Explorar productos" },
      { name: "Categorías", href: "/catalogo/categorias", icon: ClipboardList, description: "Por categorías" },
      { name: "Ofertas", href: "/catalogo/ofertas", icon: Zap, description: "Promociones especiales" },
      { name: "Nuevos Productos", href: "/catalogo/nuevos", icon: Star, description: "Últimos lanzamientos" }
    ]
  },
  {
    title: "Gestión",
    icon: Briefcase,
    description: "Herramientas de gestión",
    roles: ["super_admin", "administrador", "vendedor", "inventario", "contable"],
    submenu: [
      { 
        name: "Dashboard", 
        href: "/dashboard", 
        icon: BarChart3, 
        description: "Panel de control principal",
        roles: ["super_admin", "administrador", "vendedor", "inventario", "contable"]
      },
      { 
        name: "Inventario", 
        href: "/inventario", 
        icon: TrendingUp, 
        description: "Control de stock",
        roles: ["super_admin", "administrador", "inventario"]
      },
      { 
        name: "Órdenes", 
        href: "/ordenes", 
        icon: Receipt, 
        description: "Gestión de pedidos",
        roles: ["super_admin", "administrador", "vendedor", "contable"]
      },
      { 
        name: "Reportes", 
        href: "/reportes", 
        icon: PieChart, 
        description: "Análisis y estadísticas",
        roles: ["super_admin", "administrador", "contable"]
      },
      { 
        name: "Ventas", 
        href: "/ventas", 
        icon: ShoppingBag, 
        description: "Control de ventas",
        roles: ["super_admin", "administrador", "vendedor"]
      }
    ]
  },
  {
    title: "Administración",
    icon: Shield,
    description: "Configuración del sistema",
    roles: ["super_admin", "administrador"],
    submenu: [
      { 
        name: "Usuarios", 
        href: "/usuarios", 
        icon: Users, 
        description: "Gestión de usuarios",
        roles: ["super_admin", "administrador"]
      },
      { 
        name: "Configuración", 
        href: "/configuracion", 
        icon: Cog, 
        description: "Configuración general",
        roles: ["super_admin", "administrador"]
      },
      { 
        name: "Permisos", 
        href: "/admin/permisos", 
        icon: Lock, 
        description: "Control de acceso",
        roles: ["super_admin"]
      },
      { 
        name: "Empresa", 
        href: "/admin/empresa", 
        icon: Building, 
        description: "Datos de la empresa",
        roles: ["super_admin"]
      },
      { 
        name: "Base de Datos", 
        href: "/admin/database", 
        icon: Database, 
        description: "Gestión de datos",
        roles: ["super_admin"]
      }
    ]
  },
  {
    title: "Mi Cuenta",
    icon: User,
    public: true,
    description: "Perfil y configuración personal",
    submenu: [
      { name: "Perfil", href: "/perfil", icon: User, description: "Mi información personal" },
      { name: "Carrito", href: "/carrito", icon: ShoppingCart, description: "Mis productos" },
      { name: "Pedidos", href: "/mis-pedidos", icon: FileText, description: "Historial de pedidos" }
    ]
  }
];

export default function Navigation({ userRole, isAuthenticated }: NavigationProps) {
  const router = useRouter();
  const { signOut, user, profile, loading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<string>('');
  
  // Obtener información real del usuario desde useAuth
  const currentUser = user;
  const currentUserRole = profile?.rol || user?.role || "cliente";
  const currentIsAuthenticated = !!user;
  const currentUserName = profile?.nombre || user?.email?.split('@')[0] || 'Usuario';
  
  // Debug logs solo en desarrollo y con throttling
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const timeoutId = setTimeout(() => {
        console.log('🔍 Navigation Debug:');
        console.log('  - user:', user);
        console.log('  - profile:', profile);
        console.log('  - currentUserRole:', currentUserRole);
        console.log('  - currentUserName:', currentUserName);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [user, profile, currentUserRole, currentUserName]);
  

  // Cargar logo de la empresa
  useEffect(() => {
    const loadData = async () => {
      try {
        const logo = await getCompanyLogo();
        setCompanyLogo(logo);
      } catch (error) {
        console.error('Error cargando logo:', error);
      }
    };

    loadData();
  }, []);

  // Cerrar sidebar cuando el usuario no esté autenticado
  useEffect(() => {
    if (!currentIsAuthenticated) {
      setIsSidebarOpen(false);
    }
  }, [currentIsAuthenticated]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Cerrar el sidebar inmediatamente
      setIsSidebarOpen(false);
      
      const { error } = await signOut();
      
      if (error) {
        console.error('Error al cerrar sesión:', error);
        // No mostrar alerta, la función signOut ya maneja la redirección
        console.log('Redirigiendo a login...');
      }
      
      // La redirección se maneja en la función signOut
      setIsLoggingOut(false);
      
      // Dar tiempo para que se complete la redirección
      setTimeout(() => {
        setIsLoggingOut(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error inesperado al cerrar sesión:', error);
      alert('Error inesperado al cerrar sesión.');
      setIsLoggingOut(false);
    }
  };
  
  // Filtrar menús basado en permisos
  const filteredMenu = navigationMenu.filter((item: any) => {
    if (item.public) return true;
    if (item.roles && item.roles.includes(currentUserRole)) return true;
    return false;
  });

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

  // Función para filtrar submenús
  const getFilteredSubmenu = (submenu: any[]) => {
    if (!submenu) return [];
    return submenu.filter((item: any) => {
      if (!item.roles) return true;
      return item.roles.includes(currentUserRole);
    });
  };

  return (
    <nav className="bg-white shadow-lg border-b sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y Botón Hamburguesa */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsSidebarOpen(true);
              }}
              className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link href="/" className="flex items-center space-x-2">
              {companyLogo ? (
                <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                  <img 
                    src={companyLogo} 
                    alt="Logo de LogicQP"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
              )}
              <span className="text-lg font-semibold text-gray-900">LogicQP</span>
            </Link>
          </div>

          {/* Menú Principal Horizontal - Mejorado con Dropdowns */}
          <div className="hidden lg:flex items-center space-x-1">
            {filteredMenu.map((item: any) => {
              const Icon = item.icon;
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const filteredSubmenu = hasSubmenu ? getFilteredSubmenu(item.submenu) : [];
              
              return (
                <div
                  key={item.title}
                  className="relative group"
                  onMouseEnter={() => hasSubmenu && setActiveDropdown(item.title)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </Link>
                  ) : (
                    <button
                      className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{item.title}</span>
                      {hasSubmenu && <ChevronDown className="h-3 w-3 transition-transform group-hover:rotate-180" />}
                    </button>
                  )}

                  {/* Dropdown Menu */}
                  {hasSubmenu && activeDropdown === item.title && filteredSubmenu.length > 0 && (
                    <div className="absolute top-full left-0 mt-1 w-80 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-[60]">
                      <div className="px-3 py-2 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                      <div className="py-1">
                        {filteredSubmenu.map((subItem: any) => {
                          const SubIcon = subItem.icon;
                          return (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-150 group"
                            >
                              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors">
                                <SubIcon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{subItem.name}</p>
                                <p className="text-xs text-gray-500 truncate">{subItem.description}</p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center space-x-4">
            {/* AI Assistant Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAIModalOpen(true)}
              className="hidden md:flex items-center space-x-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 hover:scale-105"
            >
              <Brain className="h-4 w-4" />
              <span className="hidden lg:inline">Asistente IA</span>
            </Button>

            {currentIsAuthenticated && (
              <>
                <div className="hidden md:flex items-center space-x-2">
                  {/* Foto del usuario o avatar con iniciales */}
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                    {(profile?.foto_url || profile?.avatar) ? (
                      <img 
                        src={profile?.foto_url || profile?.avatar} 
                        alt={`Foto de ${currentUserName}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Si falla la imagen, mostrar iniciales
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center text-white font-semibold text-sm ${(profile?.foto_url || profile?.avatar) ? 'hidden' : 'flex'}`}>
                      {currentUserName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{currentUserName}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(currentUserRole)}`}>
                      {getRoleDisplayName(currentUserRole)}
                    </span>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsNotificationsModalOpen(true)}
                  className="text-gray-500 hover:text-gray-700 relative transition-all duration-200 hover:scale-105"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                </Button>
                
                <SmartSearchBar
                  onAdvancedSearch={() => setIsAdvancedSearchOpen(true)}
                  className="w-64"
                  placeholder="Buscar productos, pedidos..."
                />
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            )}
            
            {!currentIsAuthenticated && (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push('/login')}
                  className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  Iniciar Sesión
                </Button>
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => router.push('/register')}
                >
                  Registrarse
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Menu - Restaurado */}
      <SidebarMenu
        userRole={currentUserRole}
        isAuthenticated={currentIsAuthenticated}
        isOpen={isSidebarOpen}
        onClose={() => {
          setIsSidebarOpen(false);
        }}
      />

      {/* Modals */}
      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />
      
      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
      />
      
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
      
      <AdvancedSearchModal
        isOpen={isAdvancedSearchOpen}
        onClose={() => setIsAdvancedSearchOpen(false)}
      />
    </nav>
  );
}