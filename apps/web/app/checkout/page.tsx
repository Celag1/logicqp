"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSafeCart } from "@/hooks/useSafeCart";
import SuccessModal from "@/components/success-modal";
import { notificationService, NotificationData } from "@/lib/services/notifications";
import { 
  ShoppingCart, 
  CreditCard, 
  Truck, 
  Shield, 
  CheckCircle, 
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  Pill,
  MapPin,
  Phone,
  Mail,
  User,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const { items: cartItems, updateQuantity, removeItem, getTotal, clearCart, isHydrated } = useSafeCart();
  const [showPassword, setShowPassword] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [modalData, setModalData] = useState({
    total: 0,
    itemCount: 0
  });
  
  // Estado completamente independiente para el modal
  const [modalState, setModalState] = useState({
    isOpen: false,
    orderNumber: "",
    total: 0,
    itemCount: 0
  });

  // Estado para notificaciones
  const [notificationStatus, setNotificationStatus] = useState({
    email: false,
    sms: false,
    sending: false
  });
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvv: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Función para enviar notificaciones
  const sendNotifications = async (orderNumber: string, total: number, itemCount: number) => {
    try {
      setNotificationStatus(prev => ({ ...prev, sending: true }));
      
      console.log('📬 Enviando notificaciones...');
      
      // Preparar datos para las notificaciones
      const notificationData: NotificationData = {
        orderNumber,
        customerName: `${formData.firstName} ${formData.lastName}`.trim(),
        customerEmail: formData.email,
        customerPhone: formData.phone,
        total,
        items: cartItems.map(item => ({
          name: item.nombre,
          quantity: item.cantidad,
          price: item.precio
        })),
        shippingAddress: `${formData.address}, ${formData.city}, ${formData.postalCode}`,
        estimatedDelivery: shippingMethod === "express" ? "1-2 días hábiles" : "3-5 días hábiles"
      };

      // Enviar todas las notificaciones
      const results = await notificationService.sendAllNotifications(notificationData);
      
      setNotificationStatus({
        email: results.email,
        sms: results.sms,
        sending: false
      });

      console.log('📊 Resultados de notificaciones:', results);
      
      // Mostrar toast de confirmación
      if (results.email || results.sms) {
        console.log('✅ Notificaciones enviadas exitosamente');
      } else {
        console.log('⚠️ Algunas notificaciones fallaron');
      }
      
    } catch (error) {
      console.error('❌ Error al enviar notificaciones:', error);
      setNotificationStatus(prev => ({ ...prev, sending: false }));
    }
  };

  const handleCheckout = async () => {
    // Generar número de orden único
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const newOrderNumber = `LQP-${timestamp}-${random}`;
    
    // Guardar datos del modal antes de limpiar el carrito
    const currentTotal = getTotal() + (shippingMethod === "standard" ? 2.50 : shippingMethod === "express" ? 5.00 : 0) + (getTotal() * 0.15);
    const currentItemCount = cartItems.length;
    
    console.log('Checkout: Abriendo modal con datos:', { newOrderNumber, currentTotal, currentItemCount });
    
    // Usar estado independiente para el modal
    setModalState({
      isOpen: true,
      orderNumber: newOrderNumber,
      total: currentTotal,
      itemCount: currentItemCount
    });
    
    // También mantener los estados originales para compatibilidad
    setOrderNumber(newOrderNumber);
    setModalData({
      total: currentTotal,
      itemCount: currentItemCount
    });
    setShowSuccessModal(true);
    
    // Enviar notificaciones
    await sendNotifications(newOrderNumber, currentTotal, currentItemCount);
    
    // NO limpiar el carrito automáticamente - se limpiará cuando se cierre el modal
    console.log('Checkout: Modal abierto - carrito se mantendrá hasta cierre manual');
  };

  // Efecto para mantener el modal abierto hasta que se cierre manualmente
  useEffect(() => {
    if (showSuccessModal) {
      // El modal permanecerá abierto hasta que se cierre manualmente
      console.log('Modal de éxito abierto - permanecerá visible hasta cierre manual');
    }
  }, [showSuccessModal]);

  // Función para cerrar el modal manualmente
  const handleCloseModal = () => {
    console.log('Cerrando modal manualmente');
    setShowSuccessModal(false);
    setModalState(prev => ({ ...prev, isOpen: false }));
    
    // Limpiar carrito cuando se cierre el modal
    console.log('Limpiando carrito al cerrar modal');
    clearCart();
  };

  // Función para ir al dashboard y cerrar el modal
  const handleGoToDashboard = () => {
    console.log('Yendo al dashboard y cerrando modal');
    setShowSuccessModal(false);
    setModalState(prev => ({ ...prev, isOpen: false }));
    
    // Limpiar carrito antes de ir al dashboard
    console.log('Limpiando carrito antes de ir al dashboard');
    clearCart();
    
    // Redirigir al dashboard
    window.location.href = '/dashboard';
  };

  // Debug: Monitorear cambios en el estado del modal
  useEffect(() => {
    console.log('Estado del modal:', { showSuccessModal, orderNumber, modalData });
  }, [showSuccessModal, orderNumber, modalData]);

  // Debug: Monitorear estado independiente del modal
  useEffect(() => {
    console.log('Estado independiente del modal:', modalState);
  }, [modalState]);

  // Mostrar estado de carga durante la hidratación
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <ShoppingCart className="h-12 w-12 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Cargando carrito...</h2>
          <p className="text-gray-600 mb-6">Espera un momento mientras se cargan tus productos</p>
          <div className="flex space-x-2 justify-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="h-12 w-12 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Tu carrito está vacío</h2>
          <p className="text-gray-600 mb-6">Agrega algunos productos para continuar</p>
          <Link href="/catalogo">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Ir al Catálogo
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/catalogo">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Catálogo
                </Button>
              </Link>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Checkout
              </h1>
            </div>
            <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              <span className="text-blue-600 font-semibold">
                {cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de Checkout */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información Personal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span>Información Personal</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                    <Input
                      placeholder="Tu nombre"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                    <Input
                      placeholder="Tu apellido"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                    <Input
                      placeholder="+593 99 123 4567"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dirección de Envío */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span>Dirección de Envío</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                  <Input
                    placeholder="Calle y número"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                    <Input
                      placeholder="Guayaquil"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Código Postal</label>
                    <Input
                      placeholder="090101"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange("postalCode", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Método de Envío */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-blue-600" />
                  <span>Método de Envío</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={shippingMethod} onValueChange={setShippingMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el método de envío" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">🚚 Envío Estándar (3-5 días) - $2.50</SelectItem>
                    <SelectItem value="express">⚡ Envío Express (1-2 días) - $5.00</SelectItem>
                    <SelectItem value="pickup">🏪 Recoger en Tienda - Gratis</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Método de Pago */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <span>Método de Pago</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant={paymentMethod === "card" ? "default" : "outline"}
                    onClick={() => setPaymentMethod("card")}
                    className="h-16"
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Tarjeta
                  </Button>
                  <Button
                    variant={paymentMethod === "transfer" ? "default" : "outline"}
                    onClick={() => setPaymentMethod("transfer")}
                    className="h-16"
                  >
                    <Shield className="h-5 w-5 mr-2" />
                    Transferencia
                  </Button>
                  <Button
                    variant={paymentMethod === "cash" ? "default" : "outline"}
                    onClick={() => setPaymentMethod("cash")}
                    className="h-16"
                  >
                    💰 Efectivo
                  </Button>
                </div>

                {paymentMethod === "card" && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Número de Tarjeta</label>
                      <Input
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                        onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre en Tarjeta</label>
                        <Input
                          placeholder="Como aparece en la tarjeta"
                          value={formData.cardName}
                          onChange={(e) => handleInputChange("cardName", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Vencimiento</label>
                        <Input
                          placeholder="MM/AA"
                          value={formData.cardExpiry}
                          onChange={(e) => handleInputChange("cardExpiry", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                        <Input
                          placeholder="123"
                          value={formData.cardCvv}
                          onChange={(e) => handleInputChange("cardCvv", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Resumen del Carrito */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                  <span>Resumen del Pedido</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Productos */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <Pill className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.nombre}</p>
                        <p className="text-xs text-gray-500">{item.marca}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, Math.max(0, item.cantidad - 1))}
                          className="h-6 w-6 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          max={item.stock_disponible}
                          value={item.cantidad}
                          onChange={(e) => {
                            const newQuantity = parseInt(e.target.value) || 1;
                            if (newQuantity >= 1 && newQuantity <= item.stock_disponible) {
                              updateQuantity(item.id, newQuantity);
                            }
                          }}
                          onBlur={(e) => {
                            const newQuantity = parseInt(e.target.value) || 1;
                            if (newQuantity < 1) {
                              updateQuantity(item.id, 1);
                            } else if (newQuantity > item.stock_disponible) {
                              updateQuantity(item.id, item.stock_disponible);
                            }
                          }}
                          className="h-6 w-12 text-center text-sm font-medium border-gray-300 focus:border-blue-400 focus:ring-blue-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          title={`Cantidad (máximo: ${item.stock_disponible})`}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeItem(item.id)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal */}
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${getTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Envío:</span>
                    <span>
                      {shippingMethod === "standard" ? "$2.50" : 
                       shippingMethod === "express" ? "$5.00" : "Gratis"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>IVA (15%):</span>
                    <span>${(getTotal() * 0.15).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-green-600">
                        ${(getTotal() + (shippingMethod === "standard" ? 2.50 : shippingMethod === "express" ? 5.00 : 0) + (getTotal() * 0.15)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botón de Pago */}
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg text-lg py-3"
                  size="lg"
                >
                  <Lock className="h-5 w-5 mr-2" />
                  Completar Compra
                </Button>

                {/* Garantías */}
                <div className="text-center space-y-2 pt-4 border-t">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>Pago 100% Seguro</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Garantía de Calidad</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de éxito */}
      <SuccessModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onGoToDashboard={handleGoToDashboard}
        orderNumber={modalState.orderNumber}
        total={modalState.total}
        itemCount={modalState.itemCount}
        notificationStatus={notificationStatus}
      />
    </div>
  );
}
