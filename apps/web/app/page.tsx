"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AIAssistant from "@/components/ai-assistant";
import { 
  Pill, 
  Brain, 
  Zap, 
  Shield, 
  Users, 
  TrendingUp,
  ShoppingCart,
  Search,
  Star,
  Award
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
                <Brain className="h-6 w-6 text-yellow-300" />
                <span className="font-semibold">Powered by AI</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-300 to-white bg-clip-text text-transparent">
              LogicQP
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              La farmacia del futuro con inteligencia artificial avanzada, 
              gestión inteligente de inventario y asistente farmacéutico IA
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
                onClick={() => window.location.href = '/catalogo'}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Explorar Productos
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-blue-600"
                onClick={() => document.getElementById('ai-assistant')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Brain className="mr-2 h-5 w-5" />
                Asistente IA
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Características Revolucionarias
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tecnología de vanguardia que transforma la gestión farmacéutica
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Assistant */}
            <Card 
              className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg cursor-pointer"
              onClick={() => document.getElementById('ai-assistant')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Asistente IA</CardTitle>
                <CardDescription>
                  Chatbot inteligente que responde consultas farmacéuticas 24/7
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-2" />
                    Interacciones naturales en español
                  </li>
                  <li className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-2" />
                    Recomendaciones personalizadas
                  </li>
                  <li className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-2" />
                    Base de conocimiento farmacéutico
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Smart Inventory */}
            <Card 
              className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg cursor-pointer"
              onClick={() => window.location.href = '/inventario'}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Inventario Inteligente</CardTitle>
                <CardDescription>
                  Gestión automática con alertas predictivas y análisis avanzado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-2" />
                    Predicción de demanda con IA
                  </li>
                  <li className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-2" />
                    Alertas automáticas de stock
                  </li>
                  <li className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-2" />
                    Optimización de inventario
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Advanced Security */}
            <Card 
              className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg cursor-pointer"
              onClick={() => window.location.href = '/dashboard'}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Seguridad Avanzada</CardTitle>
                <CardDescription>
                  Sistema de roles y permisos con auditoría completa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-2" />
                    Control de acceso granular
                  </li>
                  <li className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-2" />
                    Auditoría de todas las acciones
                  </li>
                  <li className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-2" />
                    Cumplimiento normativo
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* PWA */}
            <Card 
              className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg cursor-pointer"
              onClick={() => window.location.href = '/dashboard'}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">PWA Nativa</CardTitle>
                <CardDescription>
                  Aplicación web progresiva que funciona offline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-2" />
                    Instalable como app nativa
                  </li>
                  <li className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-2" />
                    Funcionamiento offline
                  </li>
                  <li className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-2" />
                    Notificaciones push
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Multi-Rol */}
            <Card 
              className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg cursor-pointer"
              onClick={() => window.location.href = '/dashboard'}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Multi-Rol</CardTitle>
                <CardDescription>
                  Sistema completo para todos los usuarios de la farmacia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-2" />
                    Super Admin, Administrador
                  </li>
                  <li className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-2" />
                    Vendedor, Inventario, Contable
                  </li>
                  <li className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-2" />
                    Cliente con verificación
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Modern UI */}
            <Card 
              className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg cursor-pointer"
              onClick={() => window.location.href = '/catalogo'}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">UI Moderna</CardTitle>
                <CardDescription>
                  Interfaz elegante y responsive con animaciones fluidas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-2" />
                    Diseño responsive
                  </li>
                  <li className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-2" />
                    Animaciones fluidas
                  </li>
                  <li className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-2" />
                    Tema claro/oscuro
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">30+</div>
              <div className="text-blue-100">Productos Qualipharm</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">15</div>
              <div className="text-blue-100">Categorías</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">21</div>
              <div className="text-blue-100">Proveedores</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">6</div>
              <div className="text-blue-100">Roles de Usuario</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            ¿Listo para el Futuro de la Farmacia?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Únete a la revolución farmacéutica con la tecnología más avanzada del mercado
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
              onClick={() => window.location.href = '/catalogo'}
            >
              <Search className="mr-2 h-5 w-5" />
              Explorar Catálogo
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              onClick={() => document.getElementById('ai-assistant')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Brain className="mr-2 h-5 w-5" />
              Probar Asistente IA
            </Button>
          </div>
        </div>
      </section>

      {/* AI Assistant Component */}
      <div id="ai-assistant">
        <AIAssistant />
      </div>
    </div>
  );
}
