'use client'

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Lock, CheckCircle, AlertCircle } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

interface StripePaymentProps {
  amount: number;
  items: any[];
  customerEmail: string;
  onSuccess: (invoiceData: any) => void;
  onError: (error: string) => void;
}

function CheckoutForm({ amount, items, customerEmail, onSuccess, onError }: StripePaymentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  useEffect(() => {
    // Crear PaymentIntent cuando el componente se monta
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethod: 'tarjeta',
          items,
          customerEmail,
          total: amount,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setClientSecret(data.clientSecret);
      } else {
        onError(data.error || 'Error creando el pago');
      }
    } catch (error) {
      onError('Error de conexión');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      onError('Elemento de tarjeta no encontrado');
      setLoading(false);
      return;
    }

    try {
      // Confirmar el pago
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardholderName,
            email: customerEmail,
          },
        },
      });

      if (error) {
        onError(error.message || 'Error procesando el pago');
      } else if (paymentIntent.status === 'succeeded') {
        // Confirmar el pago en el servidor
        const response = await fetch('/api/payment', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            items,
            customerEmail,
            total: amount,
          }),
        });

        const data = await response.json();

        if (data.success) {
          onSuccess(data.invoiceData);
        } else {
          onError(data.error || 'Error confirmando el pago');
        }
      }
    } catch (error) {
      onError('Error procesando el pago');
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="cardholder-name">Nombre del titular de la tarjeta</Label>
          <Input
            id="cardholder-name"
            type="text"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            placeholder="Juan Pérez"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label>Información de la tarjeta</Label>
          <div className="mt-2 p-4 border border-gray-300 rounded-lg bg-white">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800">
            <Lock className="h-4 w-4" />
            <span className="text-sm font-medium">Pago 100% seguro</span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Tu información está protegida con encriptación de nivel bancario
          </p>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!stripe || loading || !cardholderName}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 text-lg"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Procesando pago...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pagar ${amount.toFixed(2)}
          </div>
        )}
      </Button>
    </form>
  );
}

export function StripePayment({ amount, items, customerEmail, onSuccess, onError }: StripePaymentProps) {
  return (
    <Elements stripe={stripePromise}>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Pago con Tarjeta
          </CardTitle>
          <p className="text-sm text-gray-600">
            Procesado de forma segura por Stripe
          </p>
        </CardHeader>
        <CardContent>
          <CheckoutForm
            amount={amount}
            items={items}
            customerEmail={customerEmail}
            onSuccess={onSuccess}
            onError={onError}
          />
        </CardContent>
      </Card>
    </Elements>
  );
}
