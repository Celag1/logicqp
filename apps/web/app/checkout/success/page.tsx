"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos de la orden
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Procesando tu orden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">
              ¡Pago Exitoso en LogicQP!
            </CardTitle>
            <CardDescription className="text-green-700">
              La mejor tienda virtual del mundo ha procesado tu orden correctamente
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-green-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2 text-blue-600" />
                Detalles de la Orden
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Número de Orden:</span>
                  <span className="font-mono font-semibold">{orderId || 'N/A'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha:</span>
                  <span>{new Date().toLocaleDateString('es-EC')}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <span className="text-green-600 font-semibold">Pagado</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Mail className="h-5 w-5 mr-2 text-blue-600" />
                Factura Enviada
              </h3>
              
              <p className="text-blue-800 mb-4">
                LogicQP ha enviado tu factura profesional a tu dirección de email. 
                Revisa tu bandeja de entrada y la carpeta de spam.
              </p>
              
              <div className="bg-white rounded p-4 border border-blue-200">
                <p className="text-sm text-gray-600">
                  <strong>¿No recibiste el email?</strong><br />
                  Verifica tu carpeta de spam o contacta a soporte en 
                  <a href="mailto:info@logicqp.com" className="text-blue-600 hover:underline ml-1">
                    info@logicqp.com
                  </a>
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
              <h3 className="text-lg font-semibold mb-2 text-yellow-800">
                Próximos Pasos
              </h3>
              <ul className="space-y-2 text-yellow-700">
                <li>• Recibirás un email de confirmación con los detalles de tu orden</li>
                <li>• Nuestro equipo procesará tu pedido en las próximas 24 horas</li>
                <li>• Te contactaremos para coordinar la entrega</li>
                <li>• Guarda este número de orden para futuras consultas</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button asChild className="flex-1">
                <Link href="/catalogo">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Continuar Comprando
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="flex-1">
                <Link href="/mis-pedidos">
                  Ver Mis Pedidos
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
