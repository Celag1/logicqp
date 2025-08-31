"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, ShoppingBag, Truck, CreditCard, Sparkles } from 'lucide-react';
import { playSuccessSound, playConfettiSound, triggerHapticFeedback } from '@/components/sound-effects';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  total: number;
  itemCount: number;
}

export default function SuccessModal({ isOpen, onClose, orderNumber, total, itemCount }: SuccessModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      setCountdown(10);
      
      // Efectos de sonido y vibración
      playSuccessSound();
      playConfettiSound();
      triggerHapticFeedback();
      
      // Ocultar confeti después de 3 segundos
      const confettiTimer = setTimeout(() => setShowConfetti(false), 3000);
      
      // Countdown para redirección automática
      const countdownTimer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownTimer);
            window.location.href = '/dashboard';
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearTimeout(confettiTimer);
        clearInterval(countdownTimer);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay con efecto de desenfoque */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        {/* Modal principal */}
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full transform transition-all duration-500 scale-100 opacity-100">
          {/* Header con gradiente */}
          <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 p-8 text-center text-white">
            {/* Confeti animado */}
            {showConfetti && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-bounce"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${1 + Math.random() * 2}s`
                    }}
                  />
                ))}
              </div>
            )}
            
            {/* Icono de éxito */}
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">¡Compra Exitosa!</h2>
              <p className="text-green-100 text-sm">Tu pedido ha sido procesado correctamente</p>
            </div>
          </div>

          {/* Contenido del modal */}
          <div className="p-8">
            {/* Número de orden */}
            <div className="text-center mb-6">
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-600 mb-1">Número de Orden</p>
                <p className="text-2xl font-bold text-gray-900 font-mono">{orderNumber}</p>
              </div>
            </div>

            {/* Resumen de la compra */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <ShoppingBag className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-gray-700">Productos</span>
                </div>
                <span className="font-semibold text-blue-600">{itemCount} items</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-700">Total Pagado</span>
                </div>
                <span className="font-bold text-green-600 text-lg">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Mensaje de confirmación */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center space-x-2 text-green-600 mb-2">
                <Truck className="h-4 w-4" />
                <span className="text-sm font-medium">Envío confirmado</span>
              </div>
              <p className="text-gray-600 text-sm">
                Recibirás un email de confirmación con los detalles de tu pedido
              </p>
            </div>

            {/* Botones de acción */}
            <div className="space-y-3">
              <Button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Ir al Dashboard
              </Button>
              
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full border-gray-300 hover:bg-gray-50"
              >
                Continuar Comprando
              </Button>
            </div>

            {/* Countdown para redirección automática */}
            <div className="text-center mt-4">
              <p className="text-xs text-gray-500">
                Redirigiendo automáticamente en {countdown} segundos...
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
