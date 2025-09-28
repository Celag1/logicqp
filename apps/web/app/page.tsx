"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LazyWrapper, LazyAIAssistant } from "@/components/ui/lazy-wrapper";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
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
import { memo, useCallback } from "react";

// Componente memoizado para el botón de navegación
const NavigationButton = memo(({ 
  href, 
  children, 
  icon: Icon, 
  variant = "default",
  className = ""
}: {
  href: string;
  children: React.ReactNode;
  icon: any;
  variant?: "default" | "outline";
  className?: string;
}) => {
  const handleClick = useCallback(() => {
    window.location.href = href;
  }, [href]);

  return (
    <Button 
      size="lg" 
      variant={variant}
      className={className}
      onClick={handleClick}
    >
      <Icon className="mr-2 h-5 w-5" />
      {children}
    </Button>
  );
});

NavigationButton.displayName = "NavigationButton";

// Componente memoizado para las tarjetas de características
const FeatureCard = memo(({ 
  title, 
  description, 
  icon: Icon, 
  features, 
  onClick,
  gradientFrom,
  gradientTo
}: {
  title: string;
  description: string;
  icon: any;
  features: string[];
  onClick: () => void;
  gradientFrom: string;
  gradientTo: string;
}) => {
  return (
    <Card 
      className="group card-premium hover:shadow-3xl transition-all duration-500 cursor-pointer hover-lift"
      onClick={onClick}
    >
      <CardHeader className="text-center p-8">
        <div className={`mx-auto w-20 h-20 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl`}>
          <Icon className="h-10 w-10 text-white" />
        </div>
        <CardTitle className="text-3xl font-bold mb-4 gradient-text">{title}</CardTitle>
        <CardDescription className="text-lg text-gray-600 font-medium leading-relaxed">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <ul className="space-y-4 text-base text-gray-700">
          {features.map((feature, index) => (
            <li key={index} className={`flex items-center group-hover:translate-x-2 transition-transform duration-300 ${
              index === 0 ? 'delay-0' : 
              index === 1 ? 'delay-100' : 
              index === 2 ? 'delay-200' : 
              index === 3 ? 'delay-300' : 
              'delay-500'
            }`}>
              <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <Star className="h-3 w-3 text-white" />
              </div>
              <span className="font-medium">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
});

FeatureCard.displayName = "FeatureCard";

export default function HomePage() {
  const handleScrollToAI = useCallback(() => {
    document.getElementById('ai-assistant')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        {/* Efectos decorativos de fondo */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/90 via-purple-600/90 to-indigo-700/90" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-300/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-300/20 rounded-full blur-2xl animate-pulse animation-delay-4000" />
        </div>
        
        <div className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-3 glass-effect rounded-full px-8 py-4 hover-lift">
                <Brain className="h-7 w-7 text-yellow-300 animate-pulse" />
                <span className="font-bold text-lg">Powered by AI</span>
                <div className="w-2 h-2 bg-yellow-300 rounded-full animate-ping" />
              </div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black mb-8 gradient-text text-shadow">
              LogicQP
            </h1>
            
            <p className="text-2xl md:text-3xl mb-12 text-blue-100 max-w-4xl mx-auto font-medium leading-relaxed">
              La farmacia del futuro con inteligencia artificial avanzada, 
              gestión inteligente de inventario y asistente farmacéutico IA
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <NavigationButton
                href="/catalogo"
                icon={ShoppingCart}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold text-lg px-8 py-4 rounded-2xl shadow-2xl hover:shadow-3xl hover-lift"
              >
                🛒 Explorar Productos
              </NavigationButton>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white/30 text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 rounded-2xl backdrop-blur-sm glass-effect hover-lift"
                onClick={handleScrollToAI}
              >
                <Brain className="mr-3 h-6 w-6" />
                🤖 Asistente IA
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-6 py-3 mb-6">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold text-gray-700">Características Premium</span>
            </div>
            <h2 className="text-5xl font-black text-gray-900 mb-6 gradient-text">
              Características Revolucionarias
            </h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto font-medium leading-relaxed">
              Tecnología de vanguardia que transforma la gestión farmacéutica
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="Asistente IA"
              description="Chatbot inteligente que responde consultas farmacéuticas 24/7"
              icon={Brain}
              features={[
                "Interacciones naturales en español",
                "Recomendaciones personalizadas",
                "Base de conocimiento farmacéutico"
              ]}
              onClick={handleScrollToAI}
              gradientFrom="from-blue-500"
              gradientTo="to-purple-600"
            />

            <FeatureCard
              title="Inventario Inteligente"
              description="Gestión automática con alertas predictivas y análisis avanzado"
              icon={TrendingUp}
              features={[
                "Predicción de demanda con IA",
                "Alertas automáticas de stock",
                "Optimización de inventario"
              ]}
              onClick={() => window.location.href = '/inventario'}
              gradientFrom="from-green-500"
              gradientTo="to-emerald-600"
            />

            <FeatureCard
              title="Seguridad Avanzada"
              description="Sistema de roles y permisos con auditoría completa"
              icon={Shield}
              features={[
                "Control de acceso granular",
                "Auditoría de todas las acciones",
                "Cumplimiento normativo"
              ]}
              onClick={() => window.location.href = '/dashboard'}
              gradientFrom="from-red-500"
              gradientTo="to-pink-600"
            />

            <FeatureCard
              title="PWA Nativa"
              description="Aplicación web progresiva que funciona offline"
              icon={Zap}
              features={[
                "Instalable como app nativa",
                "Funcionamiento offline",
                "Notificaciones push"
              ]}
              onClick={() => window.location.href = '/dashboard'}
              gradientFrom="from-orange-500"
              gradientTo="to-red-600"
            />

            <FeatureCard
              title="Multi-Rol"
              description="Sistema completo para todos los usuarios de la farmacia"
              icon={Users}
              features={[
                "Super Admin, Administrador",
                "Vendedor, Inventario, Contable",
                "Cliente con verificación"
              ]}
              onClick={() => window.location.href = '/dashboard'}
              gradientFrom="from-indigo-500"
              gradientTo="to-blue-600"
            />

            <FeatureCard
              title="UI Moderna"
              description="Interfaz elegante y responsive con animaciones fluidas"
              icon={Award}
              features={[
                "Diseño responsive",
                "Animaciones fluidas",
                "Tema claro/oscuro"
              ]}
              onClick={() => window.location.href = '/catalogo'}
              gradientFrom="from-purple-500"
              gradientTo="to-pink-600"
            />
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
        <LazyWrapper fallback={<LoadingSpinner size="lg" text="Cargando Asistente IA..." />}>
          <LazyAIAssistant />
        </LazyWrapper>
      </div>
    </div>
  );
}
