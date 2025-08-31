import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import Navigation from "@/components/navigation";
import { Toaster } from "@/components/ui/toaster";
import AIAssistant from "@/components/ai-assistant";
import ErrorBoundary from "@/components/error-boundary";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial', 'sans-serif']
});

export const metadata: Metadata = {
  title: "LogicQP - Sistema Farmacéutico Inteligente",
  description: "La farmacia del futuro con inteligencia artificial avanzada, gestión inteligente de inventario y asistente farmacéutico IA",
  keywords: "farmacia, inteligencia artificial, inventario, gestión farmacéutica, Qualipharm",
  authors: [{ name: "LogicQP Team" }],
  creator: "LogicQP",
  publisher: "Qualipharm Laboratorio Farmacéutico",
  robots: "index, follow",
  openGraph: {
    title: "LogicQP - Sistema Farmacéutico Inteligente",
    description: "La farmacia del futuro con inteligencia artificial avanzada",
    url: "https://logicqp.vercel.app",
    siteName: "LogicQP",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "LogicQP - Sistema Farmacéutico Inteligente",
      },
    ],
    locale: "es_EC",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LogicQP - Sistema Farmacéutico Inteligente",
    description: "La farmacia del futuro con inteligencia artificial avanzada",
    images: ["/og-image.jpg"],
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#2563eb",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LogicQP" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={`${inter.className} h-full bg-gray-50`}>
        <Providers>
          <ErrorBoundary>
            <div className="min-h-screen flex flex-col">
              <Navigation userRole="cliente" isAuthenticated={false} />
              <main className="flex-1">
                {children}
              </main>
              <footer className="bg-gray-900 text-white py-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">L</span>
                      </div>
                      <span className="text-xl font-bold">LogicQP</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      La farmacia del futuro con inteligencia artificial avanzada
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Productos</h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li><a href="/catalogo" className="hover:text-white transition-colors">Catálogo</a></li>
                      <li><a href="/catalogo?categoria=analgesicos" className="hover:text-white transition-colors">Analgésicos</a></li>
                      <li><a href="/catalogo?categoria=vitaminas" className="hover:text-white transition-colors">Vitaminas</a></li>
                      <li><a href="/catalogo?categoria=antibioticos" className="hover:text-white transition-colors">Antibióticos</a></li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Empresa</h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li><a href="/about" className="hover:text-white transition-colors">Sobre Nosotros</a></li>
                      <li><a href="/contact" className="hover:text-white transition-colors">Contacto</a></li>
                      <li><a href="/careers" className="hover:text-white transition-colors">Carreras</a></li>
                      <li><a href="/press" className="hover:text-white transition-colors">Prensa</a></li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Soporte</h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li><a href="/help" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
                      <li><a href="/docs" className="hover:text-white transition-colors">Documentación</a></li>
                      <li><a href="/api" className="hover:text-white transition-colors">API</a></li>
                      <li><a href="/status" className="hover:text-white transition-colors">Estado del Sistema</a></li>
                    </ul>
                  </div>
                </div>
                
                <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                  <div className="text-sm text-gray-400">
                    © 2025 LogicQP. Todos los derechos reservados.
                  </div>
                  <div className="flex space-x-6 mt-4 md:mt-0">
                    <a href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Privacidad
                    </a>
                    <a href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Términos
                    </a>
                    <a href="/cookies" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Cookies
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </div>
          <Toaster />
          <AIAssistant />
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
