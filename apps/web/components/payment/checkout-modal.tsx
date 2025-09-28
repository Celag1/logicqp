"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  X, 
  ShoppingCart, 
  CreditCard, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  Package,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Loader2
} from "lucide-react";
import PaymentMethodSelector from "./payment-method-selector";
import PaymentProcessor from "./payment-processor";
import { 
  paymentGatewayService, 
  PaymentRequest, 
  PaymentResponse 
} from "@/lib/services/payment-gateway";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onOrderComplete: (orderId: string) => void;
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  onOrderComplete,
  customerInfo
}: CheckoutModalProps) {
  const [currentStep, setCurrentStep] = useState<'info' | 'payment' | 'processing'>('info');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null);
  
  // Información del cliente
  const [customerData, setCustomerData] = useState({
    name: customerInfo?.name || '',
    email: customerInfo?.email || '',
    phone: customerInfo?.phone || '',
    address: customerInfo?.address || '',
    notes: ''
  });

  // Calcular totales
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 10; // Envío gratis sobre $100
  const tax = subtotal * 0.15; // IVA 15%
  const total = subtotal + shipping + tax;

  // Generar ID de orden
  const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  useEffect(() => {
    if (isOpen) {
      setCurrentStep('info');
      setSelectedPaymentMethod('');
      setPaymentResponse(null);
    }
  }, [isOpen]);

  const handleCustomerInfoSubmit = () => {
    if (!customerData.name || !customerData.email || !customerData.phone || !customerData.address) {
      return;
    }
    setCurrentStep('payment');
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
  };

  const handlePaymentProcess = async () => {
    if (!selectedPaymentMethod) return;

    setIsProcessing(true);
    setCurrentStep('processing');

    try {
      const paymentRequest: PaymentRequest = {
        amount: total,
        currency: 'USD',
        orderId,
        customerId: customerData.email,
        customerEmail: customerData.email,
        customerName: customerData.name,
        description: `Orden ${orderId} - ${cartItems.length} productos`,
        returnUrl: `${window.location.origin}/checkout/success?order=${orderId}`,
        cancelUrl: `${window.location.origin}/checkout/cancel`,
        metadata: {
          items: cartItems.length,
          customerPhone: customerData.phone,
          customerAddress: customerData.address,
          notes: customerData.notes
        }
      };

      // Simular procesamiento (en producción esto se haría en el componente PaymentProcessor)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await paymentGatewayService.processPayment(selectedPaymentMethod, paymentRequest);
      setPaymentResponse(response);

      if (response.success) {
        onOrderComplete(orderId);
      }

    } catch (error) {
      console.error('Error procesando pago:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTotalWithFees = () => {
    if (!selectedPaymentMethod) return total;
    return paymentGatewayService.getTotalWithFees(total, selectedPaymentMethod);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Finalizar Compra</CardTitle>
                <CardDescription>
                  Completa tu pedido de forma segura
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <Tabs value={currentStep} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info" disabled={currentStep === 'processing'}>
                <User className="h-4 w-4 mr-2" />
                Información
              </TabsTrigger>
              <TabsTrigger value="payment" disabled={currentStep === 'info' || currentStep === 'processing'}>
                <CreditCard className="h-4 w-4 mr-2" />
                Pago
              </TabsTrigger>
              <TabsTrigger value="processing" disabled={currentStep !== 'processing'}>
                <Loader2 className="h-4 w-4 mr-2" />
                Procesando
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="flex-1 flex flex-col">
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Información del cliente */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Información de Contacto</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nombre Completo *</Label>
                        <Input
                          id="name"
                          value={customerData.name}
                          onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                          placeholder="Tu nombre completo"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={customerData.email}
                          onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                          placeholder="tu@email.com"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">Teléfono *</Label>
                        <Input
                          id="phone"
                          value={customerData.phone}
                          onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                          placeholder="+593 99 999 9999"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="address">Dirección *</Label>
                        <Textarea
                          id="address"
                          value={customerData.address}
                          onChange={(e) => setCustomerData({...customerData, address: e.target.value})}
                          placeholder="Tu dirección completa"
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="notes">Notas adicionales</Label>
                        <Textarea
                          id="notes"
                          value={customerData.notes}
                          onChange={(e) => setCustomerData({...customerData, notes: e.target.value})}
                          placeholder="Instrucciones especiales para la entrega"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Resumen del pedido */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Resumen del Pedido</h3>
                    
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-gray-600">
                              {item.quantity} x {formatCurrency(item.price)}
                            </p>
                          </div>
                          <div className="font-medium">
                            {formatCurrency(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Envío:</span>
                        <span>{shipping === 0 ? 'Gratis' : formatCurrency(shipping)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">IVA (15%):</span>
                        <span>{formatCurrency(tax)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                    </div>

                    {shipping === 0 && (
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          ¡Envío gratis! Tu pedido califica para envío sin costo.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleCustomerInfoSubmit}
                    disabled={!customerData.name || !customerData.email || !customerData.phone || !customerData.address}
                    className="px-8"
                  >
                    Continuar al Pago
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="payment" className="flex-1 flex flex-col">
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Selección de método de pago */}
                  <div>
                    <PaymentMethodSelector
                      amount={total}
                      onMethodSelect={handlePaymentMethodSelect}
                      selectedMethod={selectedPaymentMethod}
                      showFees={true}
                    />
                  </div>

                  {/* Resumen final */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Resumen Final</h3>
                    
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Envío:</span>
                        <span>{shipping === 0 ? 'Gratis' : formatCurrency(shipping)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">IVA:</span>
                        <span>{formatCurrency(tax)}</span>
                      </div>
                      {selectedPaymentMethod && (
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Comisión:</span>
                          <span>{formatCurrency(paymentGatewayService.calculateFees(total, selectedPaymentMethod))}</span>
                        </div>
                      )}
                      <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                        <span>Total a Pagar:</span>
                        <span>{formatCurrency(getTotalWithFees())}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Información de Entrega</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Cliente:</strong> {customerData.name}</p>
                        <p><strong>Email:</strong> {customerData.email}</p>
                        <p><strong>Teléfono:</strong> {customerData.phone}</p>
                        <p><strong>Dirección:</strong> {customerData.address}</p>
                        {customerData.notes && (
                          <p><strong>Notas:</strong> {customerData.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep('info')}
                  >
                    Volver
                  </Button>
                  <Button 
                    onClick={handlePaymentProcess}
                    disabled={!selectedPaymentMethod}
                    className="px-8"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Procesar Pago
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="processing" className="flex-1 flex flex-col">
              <div className="flex-1 flex items-center justify-center p-6">
                {selectedPaymentMethod && (
                  <PaymentProcessor
                    paymentRequest={{
                      amount: total,
                      currency: 'USD',
                      orderId,
                      customerId: customerData.email,
                      customerEmail: customerData.email,
                      customerName: customerData.name,
                      description: `Orden ${orderId}`,
                      returnUrl: `${window.location.origin}/checkout/success?order=${orderId}`,
                      cancelUrl: `${window.location.origin}/checkout/cancel`
                    }}
                    paymentMethodId={selectedPaymentMethod}
                    onPaymentComplete={(response) => {
                      setPaymentResponse(response);
                      if (response.success) {
                        onOrderComplete(orderId);
                      }
                    }}
                    onPaymentError={(error) => {
                      console.error('Error en pago:', error);
                    }}
                    onCancel={() => setCurrentStep('payment')}
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}




