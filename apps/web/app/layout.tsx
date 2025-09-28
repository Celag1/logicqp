import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";
import AIAssistant from "@/components/ai-assistant";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { PerformanceMonitor } from "@/components/analytics/performance-monitor";

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
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LogicQP" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={`${inter.className} h-full gradient-bg antialiased`}>
        <Providers>
          <ErrorBoundary>
            <div className="min-h-screen flex flex-col relative">
              {/* Fondo decorativo */}
              <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30" />
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse animation-delay-2000" />
              </div>
              
              <Navigation />
              <main className="flex-1 relative z-10">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
            <AIAssistant />
            <PerformanceMonitor />
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
