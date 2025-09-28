"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Smartphone, Wifi, WifiOff, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Verificar si ya está instalado
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };

    checkIfInstalled();

    // Escuchar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    // Escuchar cambios en el estado de conexión
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar estado inicial de conexión
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast({
          title: "¡Instalación exitosa!",
          description: "LogicQP se ha instalado en tu dispositivo.",
        });
        setIsInstalled(true);
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Error durante la instalación:', error);
      toast({
        title: "Error de instalación",
        description: "No se pudo instalar la aplicación. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        toast({
          title: "Notificaciones habilitadas",
          description: "Recibirás notificaciones importantes de LogicQP.",
        });
      } else {
        toast({
          title: "Notificaciones deshabilitadas",
          description: "Puedes habilitarlas desde la configuración de tu navegador.",
          variant: "destructive",
        });
      }
    }
  };

  if (isInstalled) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-green-600" />
            Aplicación Instalada
            <Badge variant="default" className="bg-green-600">
              ✓
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm">
            LogicQP está instalado en tu dispositivo y funciona como una aplicación nativa.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  if (!showInstallPrompt) {
    return null;
  }

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Download className="h-4 w-4 text-blue-600" />
          Instalar LogicQP
          <Badge variant="secondary">
            PWA
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <CardDescription className="text-sm">
          Instala LogicQP en tu dispositivo para una experiencia mejorada con funcionalidad offline.
        </CardDescription>
        
        <div className="flex flex-col gap-2">
          <Button 
            onClick={handleInstall}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <Download className="mr-2 h-4 w-4" />
            Instalar Aplicación
          </Button>
          
          <Button 
            onClick={requestNotificationPermission}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <Bell className="mr-2 h-4 w-4" />
            Habilitar Notificaciones
          </Button>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-600">
          {isOnline ? (
            <>
              <Wifi className="h-3 w-3 text-green-500" />
              <span>En línea</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3 text-red-500" />
              <span>Sin conexión - Modo offline disponible</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Hook para manejar el estado de PWA
export function usePWAStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Verificar estado de conexión
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    // Verificar si está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Verificar si se puede instalar
    const handleBeforeInstallPrompt = () => {
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  return { isOnline, isInstalled, canInstall };
}
