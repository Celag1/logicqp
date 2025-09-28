'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Mail, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Shield,
  Zap
} from 'lucide-react';

export function PaymentDemo() {
  const [step, setStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: 'Selecciona Productos',
      description: 'Navega por el catálogo y añade productos al carrito',
      icon: '🛒',
      status: 'completed'
    },
    {
      id: 2,
      title: 'Procede al Pago',
      description: 'Haz clic en "Proceder al Pago" en el carrito',
      icon: '💳',
      status: 'completed'
    },
    {
      id: 3,
      title: 'Selecciona Método',
      description: 'Elige entre tarjeta, transferencia, efectivo o digital',
      icon: '⚡',
      status: 'current'
    },
    {
      id: 4,
      title: 'Confirma Pago',
      description: 'Procesa el pago de forma segura',
      icon: '🔒',
      status: 'pending'
    },
    {
      id: 5,
      title: 'Recibe Factura',
      description: 'Factura enviada automáticamente por email',
      icon: '📧',
      status: 'pending'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🚀 Sistema de Pagos Profesional
        </h2>
        <p className="text-lg text-gray-600">
          Como las mejores tiendas virtuales del mundo (Amazon, Temu, etc.)
        </p>
      </div>

      {/* Pasos del proceso */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((stepItem, index) => (
            <div key={stepItem.id} className="flex flex-col items-center">
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2
                ${stepItem.status === 'completed' 
                  ? 'bg-green-500 text-white' 
                  : stepItem.status === 'current'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-300 text-gray-600'
                }
              `}>
                {stepItem.status === 'completed' ? '✅' : stepItem.icon}
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-sm">{stepItem.title}</h3>
                <p className="text-xs text-gray-500 max-w-24">{stepItem.description}</p>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-gray-400 mt-6" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Características principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <CreditCard className="h-5 w-5" />
              Pagos con Tarjeta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-700 mb-3">
              Integración real con Stripe para procesar pagos con tarjeta de crédito/débito
            </p>
            <Badge className="bg-blue-500 text-white">Stripe</Badge>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Mail className="h-5 w-5" />
              Email Real
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-700 mb-3">
              Envío automático de facturas por email con HTML profesional y PDF
            </p>
            <Badge className="bg-green-500 text-white">SMTP</Badge>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Shield className="h-5 w-5" />
              Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-purple-700 mb-3">
              Encriptación SSL/TLS y cumplimiento PCI DSS para máxima seguridad
            </p>
            <Badge className="bg-purple-500 text-white">SSL/TLS</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Métodos de pago disponibles */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Métodos de Pago Disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <CreditCard className="h-6 w-6 text-blue-600" />
              <div>
                <h4 className="font-medium">Tarjeta de Crédito/Débito</h4>
                <p className="text-sm text-gray-600">Procesado por Stripe</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="h-6 w-6 text-green-600">🏦</div>
              <div>
                <h4 className="font-medium">Transferencia Bancaria</h4>
                <p className="text-sm text-gray-600">Instrucciones por email</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="h-6 w-6 text-green-600">💵</div>
              <div>
                <h4 className="font-medium">Efectivo</h4>
                <p className="text-sm text-gray-600">Pago en tienda</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="h-6 w-6 text-blue-600">📱</div>
              <div>
                <h4 className="font-medium">Pago Digital</h4>
                <p className="text-sm text-gray-600">PayPal, etc.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instrucciones de configuración */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="h-5 w-5" />
            Configuración Requerida
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-yellow-700">
              Para activar el envío de emails y pagos con tarjeta, configura las variables de entorno:
            </p>
            <div className="bg-yellow-100 p-3 rounded-lg text-sm font-mono">
              <div># Email (Gmail)</div>
              <div>SMTP_USER=tu-email@gmail.com</div>
              <div>SMTP_PASS=tu-app-password</div>
              <div className="mt-2"># Stripe</div>
              <div>STRIPE_SECRET_KEY=sk_test_...</div>
              <div>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...</div>
            </div>
            <p className="text-xs text-yellow-600">
              Ver el archivo README-PAYMENT-SETUP.md para instrucciones detalladas
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
