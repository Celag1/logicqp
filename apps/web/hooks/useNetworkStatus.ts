import { useState, useEffect, useCallback } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  isSlow: boolean;
  connectionType: string | null;
  downlink: number | null;
  rtt: number | null;
  effectiveType: string | null;
  lastSeen: Date;
  retryCount: number;
}

export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: true,
    isSlow: false,
    connectionType: null,
    downlink: null,
    rtt: null,
    effectiveType: null,
    lastSeen: new Date(),
    retryCount: 0,
  });

  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState<string | null>(null);

  // Función para verificar la calidad de la conexión
  const checkConnectionQuality = useCallback(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      if (connection) {
        const isSlow = connection.effectiveType === 'slow-2g' || 
                      connection.effectiveType === '2g' || 
                      connection.downlink < 1.0 ||
                      connection.rtt > 1000;

        setNetworkStatus(prev => ({
          ...prev,
          isSlow,
          connectionType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          effectiveType: connection.effectiveType,
          lastSeen: new Date(),
        }));

        // Marcar como bloqueado si la conexión es muy lenta
        if (isSlow && !isBlocked) {
          setIsBlocked(true);
          setBlockReason('Conexión lenta detectada');
        }
      }
    }
  }, [isBlocked]);

  // Función para verificar si la aplicación está bloqueada
  const checkForBlocking = useCallback(() => {
    const now = new Date();
    const timeSinceLastSeen = now.getTime() - networkStatus.lastSeen.getTime();
    
    // Si han pasado más de 30 segundos sin actividad, considerar bloqueado
    if (timeSinceLastSeen > 30000 && !isBlocked) {
      setIsBlocked(true);
      setBlockReason('Timeout de inactividad');
    }

    // Si hay muchos reintentos, considerar bloqueado
    if (networkStatus.retryCount > 5) {
      setIsBlocked(true);
      setBlockReason('Demasiados reintentos');
    }
  }, [networkStatus.lastSeen, networkStatus.retryCount, isBlocked]);

  // Función para reintentar conexión
  const retryConnection = useCallback(async () => {
    try {
      setNetworkStatus(prev => ({
        ...prev,
        retryCount: prev.retryCount + 1,
      }));

      // Simular verificación de conexión
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Verificar estado de la red
      if (navigator.onLine) {
        setNetworkStatus(prev => ({
          ...prev,
          isOnline: true,
          lastSeen: new Date(),
        }));
        
        // Si la conexión se restablece, desbloquear
        if (isBlocked) {
          setIsBlocked(false);
          setBlockReason(null);
        }
      }
    } catch (error) {
      console.error('Error al reintentar conexión:', error);
    }
  }, [isBlocked]);

  // Función para desbloquear manualmente
  const unblock = useCallback(() => {
    setIsBlocked(false);
    setBlockReason(null);
    setNetworkStatus(prev => ({
      ...prev,
      retryCount: 0,
      lastSeen: new Date(),
    }));
  }, []);

  // Función para marcar actividad
  const markActivity = useCallback(() => {
    setNetworkStatus(prev => ({
      ...prev,
      lastSeen: new Date(),
    }));
  }, []);

  // Efectos para monitorear la red
  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: true,
        lastSeen: new Date(),
      }));
      
      if (isBlocked) {
        setIsBlocked(false);
        setBlockReason(null);
      }
    };

    const handleOffline = () => {
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: false,
        lastSeen: new Date(),
      }));
      
      setIsBlocked(true);
      setBlockReason('Sin conexión a internet');
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        markActivity();
        checkConnectionQuality();
      }
    };

    // Eventos de red
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Verificación inicial
    checkConnectionQuality();

    // Verificaciones periódicas
    const qualityInterval = setInterval(checkConnectionQuality, 10000); // Cada 10 segundos
    const blockingInterval = setInterval(checkForBlocking, 5000); // Cada 5 segundos

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(qualityInterval);
      clearInterval(blockingInterval);
    };
  }, [checkConnectionQuality, checkForBlocking, markActivity, isBlocked]);

  return {
    networkStatus,
    isBlocked,
    blockReason,
    retryConnection,
    unblock,
    markActivity,
  };
}
