"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft, 
  CreditCard, 
  Truck, 
  Shield, 
  CheckCircle,
  AlertTriangle,
  Package,
  Heart,
  Share2,
  Star
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";

interface CartItem {
  id: string;
  codigo: string;
  nombre: string;
  marca: string;
  precio: number;
  cantidad: number;
  imagen?: string;
  categoria: string;
  stock_disponible: number;
  descuento?: number;
}

// Mock data para el carrito
const mockCartItems: CartItem[] = [
  {
    id: "1",
    codigo: "QPH-001",
    nombre: "Paracetamol 500mg",
    marca: "Genérico",
    precio: 2.50,
    cantidad: 2,
    imagen: "/images/paracetamol.jpg",
    categoria: "Analgésicos",
    stock_disponible: 50,
    descuento: 10
  },
  {
    id: "2",
    codigo: "QPH-002",
    nombre: "Ibuprofeno 400mg",
    marca: "Genérico",
    precio: 3.20,
    cantidad: 1,
    imagen: "/images/ibuprofeno.jpg",
    categoria: "Antiinflamatorios",
    stock_disponible: 30
  },
  {
    id: "3",
    codigo: "QPH-003",
    nombre: "Vitamina C 1000mg",
    marca: "Qualipharm",
    precio: 8.90,
    cantidad: 3,
    imagen: "/images/vitamina-c.jpg",
    categoria: "Vitaminas",
    stock_disponible: 25,
    descuento: 15
  }
];

export default function CarritoPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(mockCartItems);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  // Calcular totales
  const subtotal = cartItems.reduce((total, item) => {
    const itemTotal = item.precio * item.cantidad;
    const discount = item.descuento ? (itemTotal * item.descuento) / 100 : 0;
    return total + itemTotal - discount;
  }, 0);

  const couponDiscount = appliedCoupon ? (subtotal * appliedCoupon.discount) / 100 : 0;
  const shipping = subtotal > 50 ? 0 : 5.99; // Envío gratis sobre $50
  const total = subtotal - couponDiscount + shipping;

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCartItems(items => 
      items.map(item => 
        item.id === itemId 
          ? { ...item, cantidad: Math.min(newQuantity, item.stock_disponible) }
          : item
      )
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems(items => items.filter(item => item.id !== itemId));
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    
    // Simular validación de cupón
    const validCoupons = {
      "DESCUENTO10": 10,
      "BIENVENIDO": 15,
      "FARMACIA20": 20
    };
    
    const discount = validCoupons[couponCode.toUpperCase() as keyof typeof validCoupons];
    if (discount) {
      setAppliedCoupon({ code: couponCode.toUpperCase(), discount });
      setCouponCode("");
    } else {
      alert("Código de cupón inválido");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  const handleCheckout = () => {
    setLoading(true);
    // Simular proceso de checkout
    setTimeout(() => {
      setLoading(false);
      // Redirigir a checkout
      window.location.href = "/checkout";
    }, 1000);
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <ShoppingCart className="h-24 w-24 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Tu carrito está vacío
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Agrega algunos productos para comenzar tu compra
          </p>
          <Link href="/catalogo">
            <Button>
              <Package className="h-4 w-4 mr-2" />
              Ver Catálogo
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/catalogo">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continuar Comprando
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-blue-600" />
            Carrito de Compras
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'} en tu carrito
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Productos en el Carrito</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        {item.imagen ? (
                          <img 
                            src={item.imagen} 
                            alt={item.nombre}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-gray-400" />
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {item.nombre}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {item.marca} • {item.codigo}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                              {item.categoria}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex justify-between items-center mt-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.cantidad - 1)}
                              disabled={item.cantidad <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-12 text-center font-medium">
                              {item.cantidad}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.cantidad + 1)}
                              disabled={item.cantidad >= item.stock_disponible}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="text-right">
                            {item.descuento && (
                              <div className="text-sm text-gray-500 line-through">
                                ${(item.precio * item.cantidad).toFixed(2)}
                              </div>
                            )}
                            <div className="font-semibold text-lg">
                              ${((item.precio * item.cantidad) - (item.descuento ? (item.precio * item.cantidad * item.descuento) / 100 : 0)).toFixed(2)}
                            </div>
                            {item.descuento && (
                              <Badge variant="secondary" className="text-xs">
                                -{item.descuento}% descuento
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Stock Warning */}
                        {item.cantidad >= item.stock_disponible && (
                          <div className="flex items-center gap-2 mt-2 text-orange-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm">
                              Solo {item.stock_disponible} unidades disponibles
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Coupon Code */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Código de Descuento
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ingresa tu código"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim()}
                  >
                    Aplicar
                  </Button>
                </div>
                {appliedCoupon && (
                  <div className="flex items-center justify-between mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="text-sm text-green-700 dark:text-green-300">
                      {appliedCoupon.code} (-{appliedCoupon.discount}%)
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveCoupon}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento ({appliedCoupon.code}):</span>
                    <span>-${couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Envío:</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600">Gratis</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Shipping Info */}
              {shipping > 0 && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Agrega ${(50 - subtotal).toFixed(2)} más para envío gratis
                </div>
              )}

              {/* Checkout Button */}
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <CreditCard className="h-4 w-4 mr-2" />
                )}
                Proceder al Pago
              </Button>

              {/* Security Features */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Shield className="h-4 w-4" />
                  <span>Compra 100% segura</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Truck className="h-4 w-4" />
                  <span>Envío rápido y confiable</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>Garantía de calidad</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
