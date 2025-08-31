"use client";

import { useEffect, useState } from 'react';
import { CheckCircle, X, ShoppingCart } from 'lucide-react';

interface NotificationToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export default function NotificationToast({ 
  message, 
  type, 
  duration = 4000, 
  onClose 
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Mostrar toast con animación
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Barra de progreso
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(progressTimer);
          return 0;
        }
        return prev - (100 / (duration / 100));
      });
    }, 100);

    // Auto-ocultar
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      clearInterval(progressTimer);
    };
  }, [duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-400';
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-pink-500 border-red-400';
      case 'info':
        return 'bg-gradient-to-r from-blue-500 to-purple-500 border-blue-400';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 border-gray-400';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-white" />;
      case 'error':
        return <X className="h-5 w-5 text-white" />;
      case 'info':
        return <ShoppingCart className="h-5 w-5 text-white" />;
      default:
        return <CheckCircle className="h-5 w-5 text-white" />;
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
    }`}>
      <div className={`${getToastStyles()} rounded-2xl shadow-2xl border-2 p-4 min-w-80 max-w-md backdrop-blur-sm`}>
        {/* Barra de progreso */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 rounded-t-2xl overflow-hidden">
          <div 
            className="h-full bg-white/60 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Contenido del toast */}
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm leading-5">
              {message}
            </p>
          </div>
          
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-white/20 transition-colors duration-200"
            aria-label="Cerrar notificación"
            title="Cerrar notificación"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
