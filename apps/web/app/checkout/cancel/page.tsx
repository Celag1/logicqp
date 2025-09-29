"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-800">
              Pago Cancelado
            </CardTitle>
            <CardDescription className="text-red-700">
              Tu pago fue cancelado o no se completó
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-red-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                ¿Qué pasó?
              </h3>
              
              <ul className="space-y-2 text-gray-600">
                <li>• El proceso de pago fue interrumpido</li>
                <li>• No se realizó ningún cargo a tu tarjeta</li>
                <li>• Tu carrito de compras se mantiene intacto</li>
                <li>• Puedes intentar el pago nuevamente</li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold mb-4 text-blue-800">
                Posibles Causas
              </h3>
              
              <ul className="space-y-2 text-blue-700">
                <li>• Problemas de conexión a internet</li>
                <li>• Datos de tarjeta incorrectos</li>
                <li>• Fondos insuficientes</li>
                <li>• Restricciones de tu banco</li>
                <li>• Ventana de pago cerrada accidentalmente</li>
              </ul>
            </div>

            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
              <h3 className="text-lg font-semibold mb-2 text-yellow-800">
                ¿Necesitas Ayuda?
              </h3>
              <p className="text-yellow-700 mb-4">
                Si continúas teniendo problemas, contacta a nuestro equipo de soporte:
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> info@logicqp.com</p>
                <p><strong>Teléfono:</strong> +593 2 234 5678</p>
                <p><strong>Horario:</strong> Lunes a Viernes, 8:00 AM - 6:00 PM</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button asChild className="flex-1">
                <Link href="/carrito">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Intentar Nuevamente
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="flex-1">
                <Link href="/catalogo">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Catálogo
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
