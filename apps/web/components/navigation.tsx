"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
  TrendingUp
} from "lucide-react";

interface NavigationProps {
  userRole?: string;
  isAuthenticated?: boolean;
}

const navigationItems = [
  { name: "Inicio", href: "/", icon: Home, public: true },
  { name: "Catálogo", href: "/catalogo", icon: Package, public: true },
  { name: "Dashboard", href: "/dashboard", icon: BarChart3, roles: ["super_admin", "administrador", "vendedor", "inventario", "contable"] },
  { name: "Inventario", href: "/inventario", icon: TrendingUp, roles: ["super_admin", "administrador", "inventario"] },
  { name: "Compras", href: "/compras", icon: ShoppingCart, roles: ["super_admin", "administrador", "inventario"] },
  { name: "Reportes", href: "/reportes", icon: BarChart3, roles: ["super_admin", "administrador", "contable"] },
  { name: "Usuarios", href: "/admin/usuarios", icon: Users, roles: ["super_admin", "administrador"] },
  { name: "Permisos", href: "/admin/permisos", icon: Shield, roles: ["super_admin"] },
  { name: "Empresa", href: "/admin/empresa", icon: Settings, roles: ["super_admin"] },
];

export default function Navigation({ userRole = "cliente", isAuthenticated = false }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredNavigation = navigationItems.filter(item => {
    if (item.public) return true;
    if (item.roles && item.roles.includes(userRole)) return true;
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

  return (
    <nav className="bg-white shadow-lg border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">LogicQP</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* AI Assistant Button */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex items-center space-x-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Brain className="h-4 w-4" />
              <span>IA</span>
            </Button>

            {/* Search */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
            >
              <Bell className="h-4 w-4" />
            </Button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="hidden md:flex items-center space-x-2">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Usuario Demo</p>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(userRole)}`}>
                        {getRoleDisplayName(userRole)}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                >
                  <User className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {/* Mobile User Info */}
            {isAuthenticated && (
              <div className="px-3 py-2 border-t">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Usuario Demo</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(userRole)}`}>
                      {getRoleDisplayName(userRole)}
                    </span>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Perfil
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
