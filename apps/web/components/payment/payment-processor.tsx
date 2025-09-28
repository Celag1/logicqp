"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2, 
  CreditCard,
  Shield,
  AlertTriangle,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { 
  paymentGatewayService, 
  PaymentRequest, 
  PaymentResponse 
} from "@/lib/services/payment-gateway";

interface PaymentProcessorProps {
  paymentRequest: PaymentRequest;
  paymentMethodId: string;
  onPaymentComplete: (response: PaymentResponse) => void;
  onPaymentError: (error: string) => void;
  onCancel: () => void;
}

export default function PaymentProcessor({
  paymentRequest,
  paymentMethodId,
  onPaymentComplete,
  onPaymentError,
  onCancel
}: PaymentProcessorProps) {
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [maxRetries] = useState(3);

  useEffect(() => {
    processPayment();
  }, [paymentMethodId]);

  const processPayment = async () => {
    setIsProcessing(true);
    setProgress(0);
    setRetryCount(0);

    try {
      // Paso 1: Validar datos
      setCurrentStep('Validando datos de pago...');
      setProgress(20);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Paso 2: Conectar con pasarela
      setCurrentStep('Conectando con pasarela de pago...');
      setProgress(40);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Paso 3: Procesar pago
      setCurrentStep('Procesando pago...');
      setProgress(60);
      
      const response = await paymentGatewayService.processPayment(
        paymentMethodId,
        paymentRequest
      );

      setProgress(80);

      if (response.success) {
        setCurrentStep('Pago procesado exitosamente');
        setProgress(100);
        setPaymentResponse(response);
        
        // Simular delay para mostrar el progreso
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        onPaymentComplete(response);
      } else {
        throw new Error(response.error || 'Error procesando pago');
      }

    } catch (error) {
      console.error('Error procesando pago:', error);
      
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        setCurrentStep(`Reintentando... (${retryCount + 1}/${maxRetries})`);
        setProgress(0);
        
        // Reintentar después de un delay
        setTimeout(() => {
          processPayment();
        }, 2000);
      } else {
        setCurrentStep('Error procesando pago');
        setProgress(0);
        onPaymentError(error instanceof Error ? error.message : 'Error desconocido');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
    processPayment();
  };

  const getPaymentMethodName = (methodId: string) => {
    const methods = paymentGatewayService.getAvailablePaymentMethods();
    const method = methods.find(m => m.id === methodId);
    return method?.name || 'Método de pago';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: paymentRequest.currency
    }).format(amount);
  };

  const getStatusIcon = () => {
    if (isProcessing) {
      return <Loader2 className="h-6 w-6 animate-spin text-blue-600" />;
    }
    
    if (paymentResponse?.success) {
      return <CheckCircle className="h-6 w-6 text-green-600" />;
    }
    
    if (paymentResponse && !paymentResponse.success) {
      return <XCircle className="h-6 w-6 text-red-600" />;
    }
    
    return <Clock className="h-6 w-6 text-gray-600" />;
  };

  const getStatusColor = () => {
    if (isProcessing) return 'text-blue-600';
    if (paymentResponse?.success) return 'text-green-600';
    if (paymentResponse && !paymentResponse.success) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-xl">
            {isProcessing ? 'Procesando Pago' : 
             paymentResponse?.success ? 'Pago Exitoso' : 
             paymentResponse ? 'Error en el Pago' : 'Preparando Pago'}
          </CardTitle>
          <CardDescription>
            {isProcessing ? currentStep : 
             paymentResponse?.success ? 'Tu pago ha sido procesado correctamente' :
             paymentResponse ? 'Hubo un problema procesando tu pago' : 
             'Iniciando proceso de pago...'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Información del pago */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Detalles del Pago</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Método:</span>
                <span className="font-medium">{getPaymentMethodName(paymentMethodId)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monto:</span>
                <span className="font-medium">{formatCurrency(paymentRequest.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Orden:</span>
                <span className="font-medium">{paymentRequest.orderId}</span>
              </div>
            </div>
          </div>

          {/* Barra de progreso */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progreso</span>
                <span className="text-gray-600">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Estado del pago */}
          {paymentResponse && (
            <div className="space-y-4">
              {paymentResponse.success ? (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="text-green-800 font-medium">
                        ¡Pago procesado exitosamente!
                      </p>
                      {paymentResponse.paymentId && (
                        <p className="text-sm text-green-700">
                          ID de transacción: {paymentResponse.paymentId}
                        </p>
                      )}
                      {paymentResponse.redirectUrl && (
                        <p className="text-sm text-green-700">
                          Serás redirigido automáticamente...
                        </p>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="text-red-800 font-medium">
                        Error procesando el pago
                      </p>
                      <p className="text-sm text-red-700">
                        {paymentResponse.error}
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-col space-y-2">
            {isProcessing ? (
              <Button disabled className="w-full">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Procesando...
              </Button>
            ) : paymentResponse?.success ? (
              <div className="space-y-2">
                {paymentResponse.redirectUrl && (
                  <Button 
                    onClick={() => window.open(paymentResponse.redirectUrl, '_blank')}
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Continuar en Pasarela
                  </Button>
                )}
                <Button 
                  onClick={() => onPaymentComplete(paymentResponse)}
                  className="w-full"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Finalizar
                </Button>
              </div>
            ) : paymentResponse && !paymentResponse.success ? (
              <div className="space-y-2">
                {retryCount < maxRetries && (
                  <Button 
                    onClick={handleRetry}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reintentar
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={onCancel}
                  className="w-full"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                onClick={onCancel}
                className="w-full"
              >
                Cancelar
              </Button>
            )}
          </div>

          {/* Información de seguridad */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Pago Seguro</p>
                <p className="text-blue-700">
                  Tu información está protegida con encriptación SSL de 256 bits.
                  No almacenamos datos de tarjetas de crédito.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}




