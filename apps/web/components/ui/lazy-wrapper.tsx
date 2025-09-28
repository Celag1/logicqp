"use client";

import { Suspense, lazy, ComponentType, ReactNode } from "react";
import { LoadingSpinner } from "./loading-spinner";

interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

export function LazyWrapper({ 
  children, 
  fallback = <LoadingSpinner size="lg" />,
  className 
}: LazyWrapperProps) {
  return (
    <Suspense fallback={fallback}>
      <div className={className}>
        {children}
      </div>
    </Suspense>
  );
}

// Función helper para crear componentes lazy
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: ReactNode
) {
  const LazyComponent = lazy(importFunc);
  
  return function LazyWrapperComponent(props: any) {
    return (
      <Suspense fallback={fallback || <LoadingSpinner size="lg" />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Componentes lazy específicos
export const LazyAIAssistant = createLazyComponent(
  () => import("@/components/ai-assistant"),
  <LoadingSpinner size="lg" text="Cargando Asistente IA..." />
);

export const LazyBarcodeScanner = createLazyComponent(
  () => import("@/components/barcode-scanner"),
  <LoadingSpinner size="md" text="Cargando Escáner..." />
);

export const LazyChart = createLazyComponent(
  () => import("@/components/ui/chart-container"),
  <LoadingSpinner size="md" text="Cargando Gráfico..." />
);
