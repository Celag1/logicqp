"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  CreditCard, 
  Banknote, 
  Smartphone, 
  DollarSign, 
  CheckCircle,
  AlertCircle,
  Clock,
  Info,
  Shield,
  Zap
} from "lucide-react";
import { paymentGatewayService, PaymentMethod } from "@/lib/services/payment-gateway";

interface PaymentMethodSelectorProps {
  amount: number;
  currency?: string;
  onMethodSelect: (methodId: string) => void;
  selectedMethod?: string;
  disabled?: boolean;
  showFees?: boolean;
}

export default function PaymentMethodSelector({
  amount,
  currency = 'USD',
  onMethodSelect,
  selectedMethod,
  disabled = false,
  showFees = true
}: PaymentMethodSelectorProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const methods = paymentGatewayService.getAvailablePaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error cargando métodos de pago:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMethodIcon = (iconName: string) => {
    switch (iconName) {
      case 'credit-card':
        return CreditCard;
      case 'paypal':
        return Smartphone;
      case 'mercadopago':
        return Banknote;
      case 'bank':
        return Banknote;
      case 'dollar-sign':
        return DollarSign;
      default:
        return CreditCard;
    }
  };

  const getMethodColor = (type: string) => {
    switch (type) {
      case 'card':
        return 'border-blue-200 bg-blue-50';
      case 'transfer':
        return 'border-green-200 bg-green-50';
      case 'cash':
        return 'border-yellow-200 bg-yellow-50';
      case 'crypto':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: currency
    }).format(value);
  };

  const calculateFees = (methodId: string) => {
    return paymentGatewayService.calculateFees(amount, methodId);
  };

  const getTotalWithFees = (methodId: string) => {
    return paymentGatewayService.getTotalWithFees(amount, methodId);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Método de Pago</h3>
        <Badge variant="outline" className="text-sm">
          {formatCurrency(amount)}
        </Badge>
      </div>

      <RadioGroup
        value={selectedMethod}
        onValueChange={onMethodSelect}
        disabled={disabled}
        className="space-y-3"
      >
        {paymentMethods.map((method) => {
          const Icon = getMethodIcon(method.icon);
          const fees = calculateFees(method.id);
          const total = getTotalWithFees(method.id);
          const isSelected = selectedMethod === method.id;

          return (
            <div key={method.id} className="relative">
              <Label
                htmlFor={method.id}
                className={`block cursor-pointer ${
                  disabled ? 'cursor-not-allowed opacity-50' : ''
                }`}
              >
                <Card
                  className={`transition-all duration-200 ${
                    isSelected
                      ? 'ring-2 ring-blue-500 border-blue-500'
                      : 'hover:border-gray-300'
                  } ${getMethodColor(method.type)}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <RadioGroupItem
                        value={method.id}
                        id={method.id}
                        className="mt-1"
                        disabled={disabled}
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            isSelected ? 'bg-blue-100' : 'bg-white'
                          }`}>
                            <Icon className={`h-5 w-5 ${
                              isSelected ? 'text-blue-600' : 'text-gray-600'
                            }`} />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900">
                                {method.name}
                              </h4>
                              <div className="flex items-center space-x-2">
                                {method.type === 'card' && (
                                  <Shield className="h-4 w-4 text-green-600" />
                                )}
                                {method.processingTime === 'Inmediato' && (
                                  <Zap className="h-4 w-4 text-yellow-600" />
                                )}
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 mt-1">
                              {method.description}
                            </p>
                            
                            <div className="flex items-center space-x-4 mt-2">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {method.processingTime}
                                </span>
                              </div>
                              
                              {showFees && fees > 0 && (
                                <div className="flex items-center space-x-1">
                                  <Info className="h-3 w-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">
                                    Comisión: {formatCurrency(fees)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {showFees && fees > 0 && (
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(total)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Total con comisión
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Label>
              
              {isSelected && (
                <div className="absolute -top-2 -right-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 bg-white rounded-full" />
                </div>
              )}
            </div>
          );
        })}
      </RadioGroup>

      {selectedMethod && showFees && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Resumen de Pago</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatCurrency(amount)}</span>
            </div>
            {calculateFees(selectedMethod) > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Comisión:</span>
                <span className="font-medium">{formatCurrency(calculateFees(selectedMethod))}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total:</span>
              <span>{formatCurrency(getTotalWithFees(selectedMethod))}</span>
            </div>
          </div>
        </div>
      )}

      {paymentMethods.length === 0 && (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay métodos de pago disponibles
          </h3>
          <p className="text-gray-500">
            Contacta al administrador para configurar los métodos de pago
          </p>
        </div>
      )}
    </div>
  );
}




