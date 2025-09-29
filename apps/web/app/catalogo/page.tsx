'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Heart, 
  Star, 
  Package, 
  TrendingUp, 
  Award, 
  Shield,
  SlidersHorizontal,
  X,
  CreditCard,
  Banknote,
  Smartphone,
  Mail,
  Printer,
  CheckCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  Crown,
  Gem,
  Flame,
  Rocket
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface Product {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  marca: string;
  categoria: string;
  stock_disponible: number;
  rating: number;
  reviews: number;
  imagen_url: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

type SortOption = 'nombre' | 'precio' | 'stock_disponible' | 'rating';
type SortOrder = 'asc' | 'desc';

export default function CatalogoPage() {
  const { user } = useAuth();
  
  // Estilos CSS personalizados para el scrollbar
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #3b82f6 #f1f5f9;
      }
      .custom-scrollbar::-webkit-scrollbar {
        width: 10px;
        height: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 5px;
        margin: 5px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%);
        border-radius: 5px;
        border: 2px solid #f1f5f9;
        min-height: 20px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, #2563eb 0%, #7c3aed 100%);
        border: 2px solid #e2e8f0;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:active {
        background: linear-gradient(180deg, #1d4ed8 0%, #6d28d9 100%);
      }
      .custom-scrollbar::-webkit-scrollbar-corner {
        background: #f1f5f9;
      }
    `;
    document.head.appendChild(style);
    return () => {
      try {
        document.head.removeChild(style);
      } catch (e) {
        // Element already removed
      }
    };
  }, []);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['Todas']);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('nombre');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showProductDetail, setShowProductDetail] = useState<Product | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingNotes, setShippingNotes] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [paymentError, setPaymentError] = useState<string>('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Función para cargar productos reales desde Supabase
  const loadProducts = useCallback(async () => {
    try {
      console.log('🚀 Iniciando loadProducts...');
      setLoading(true);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );

      console.log('📡 Ejecutando consulta a Supabase...');
      // Usar la configuración centralizada de Supabase
      const { supabase: supabasePublic } = await import('@/lib/supabase/client');
      
      const queryPromise = supabasePublic
        .from('productos')
        .select(`
          *,
          lotes (
            cantidad_disponible,
            precio_compra
          ),
          categorias (
            nombre
          ),
          proveedores (
            nombre
          )
        `)
        .eq('activo', true)
        .order('nombre');

      const { data: productos, error: productosError } = await Promise.race([
        queryPromise,
        timeoutPromise
      ]) as any;

      console.log('🔍 Debug catálogo:');
      console.log('Productos recibidos:', productos);
      console.log('Error:', productosError);
      console.log('Cantidad de productos:', productos?.length || 0);

      if (productosError) {
        console.error('Error cargando productos:', productosError);
        setProducts([]);
        setFilteredProducts([]);
        setCategories(['Todas']);
        return;
      }

      if (!productos || productos.length === 0) {
        console.warn('⚠️ No se encontraron productos en la base de datos');
        setProducts([]);
        setFilteredProducts([]);
        setCategories(['Todas']);
        return;
      }

      const realProducts: Product[] = productos?.map((producto: any) => ({
        id: producto.id.toString(),
        codigo: producto.codigo,
        nombre: producto.nombre,
        descripcion: producto.descripcion || 'Sin descripción',
        precio: producto.precio || 0,
        marca: producto.proveedores?.nombre || 'Qualipharm',
        categoria: producto.categorias?.nombre || 'Sin categoría',
        stock_disponible: producto.lotes?.reduce((total: number, lote: any) => total + (lote.cantidad_disponible || 0), 0) || producto.stock || 0,
        rating: 4.5,
        reviews: 25,
        imagen_url: producto.imagen_url || `https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=400&fit=crop&crop=center&q=80&auto=format&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`
      })) || [];

      setProducts(realProducts);
      setFilteredProducts(realProducts);

      const uniqueCategories = ['Todas', ...Array.from(new Set(realProducts.map((p: any) => p.categoria)))];
      setCategories(uniqueCategories);

      console.log('✅ Productos cargados exitosamente:', realProducts.length);
      console.log('✅ Categorías:', uniqueCategories);

    } catch (error) {
      console.error('❌ Error cargando productos:', error);
      setProducts([]);
      setFilteredProducts([]);
      setCategories(['Todas']);
    } finally {
      console.log('🏁 Finalizando loadProducts, setLoading(false)');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Filtros y búsqueda
  useEffect(() => {
    let filtered = products;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter((product: any) =>
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.marca.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por categoría
    if (selectedCategory !== 'Todas') {
      filtered = filtered.filter((product: any) => product.categoria === selectedCategory);
    }

    // Filtro por rango de precio
    filtered = filtered.filter((product: any) => 
      product.precio >= priceRange[0] && product.precio <= priceRange[1]
    );

    // Filtro por marcas
    if (selectedBrands.length > 0) {
      filtered = filtered.filter((product: any) => selectedBrands.includes(product.marca));
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortBy === 'precio' || sortBy === 'stock_disponible' || sortBy === 'rating') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, priceRange, selectedBrands, sortBy, sortOrder]);

  // Estadísticas
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum: number, product: any) => sum + (product.precio * product.stock_disponible), 0);
    const avgRating = products.reduce((sum: number, product: any) => sum + product.rating, 0) / totalProducts || 0;
    const lowStock = products.filter((product: any) => product.stock_disponible < 10).length;

    return { totalProducts, totalValue, avgRating, lowStock };
  }, [products]);

  // Funciones del carrito
  const addToCart = (product: Product, quantity: number = 1) => {
    console.log('🛒 Agregando al carrito:', product.nombre, 'cantidad:', quantity);
    
    // Validar stock disponible
    if (product.stock_disponible <= 0) {
      alert('❌ Este producto no está disponible en stock');
      return;
    }

    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;
      
      // Validar que no exceda el stock disponible
      if (newQuantity > product.stock_disponible) {
        alert(`❌ Solo hay ${product.stock_disponible} unidades disponibles de este producto`);
        return prev;
      }

      if (existingItem) {
        return prev.map((item: any) =>
          item.product.id === product.id
            ? { ...item, quantity: newQuantity, subtotal: newQuantity * product.precio }
            : item
        );
      } else {
        return [...prev, { product, quantity, subtotal: quantity * product.precio }];
      }
    });

    // Mostrar notificación de éxito
    alert(`✅ ${product.nombre} agregado al carrito`);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    // Validar stock disponible
    const product = products.find(p => p.id === productId);
    if (product && quantity > product.stock_disponible) {
      alert(`❌ Solo hay ${product.stock_disponible} unidades disponibles de este producto`);
      return;
    }

    setCart(prev =>
      prev.map((item: any) =>
        item.product.id === productId
          ? { ...item, quantity, subtotal: quantity * item.product.precio }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter((item: any) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('❌ El carrito está vacío');
      return;
    }
    
    // Validar que todos los productos tengan stock suficiente
    const outOfStock = cart.filter((item: any) => item.quantity > item.product.stock_disponible);
    if (outOfStock.length > 0) {
      alert(`❌ Los siguientes productos no tienen stock suficiente:\n${outOfStock.map((item: any) => `- ${item.product.nombre} (disponible: ${item.product.stock_disponible})`).join('\n')}`);
      return;
    }
    
    // Pre-llenar datos si el usuario está autenticado
    if (user?.email) {
      setCustomerEmail(user.email);
      setCustomerName(user.user_metadata?.full_name || '');
    }
    
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      setPaymentError('❌ Por favor selecciona una forma de pago');
      return;
    }
    if (!customerEmail) {
      setPaymentError('❌ Por favor ingresa tu email');
      return;
    }

    if (!customerName) {
      setPaymentError('❌ Por favor ingresa tu nombre completo');
      return;
    }

    if (!customerPhone) {
      setPaymentError('❌ Por favor ingresa tu teléfono');
      return;
    }

    if (!shippingAddress) {
      setPaymentError('❌ Por favor ingresa la dirección de envío');
      return;
    }

    if (!shippingCity) {
      setPaymentError('❌ Por favor ingresa la ciudad de envío');
      return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      setPaymentError('❌ Por favor ingresa un email válido');
      return;
    }

    setPaymentLoading(true);
    setPaymentError('');

    try {
      // Si el usuario está logueado, usar sus datos del perfil
      const finalCustomerName = user ? `${user.user_metadata?.nombre || ''} ${user.user_metadata?.apellido || ''}`.trim() || customerName : customerName;
      const finalCustomerPhone = user ? user.user_metadata?.telefono || customerPhone : customerPhone;
      const finalCustomerEmail = user ? user.email : customerEmail;

      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethod: selectedPaymentMethod,
          items: cart,
          customerEmail: finalCustomerEmail,
          customerName: finalCustomerName,
          customerPhone: finalCustomerPhone,
          shippingAddress,
          shippingCity,
          shippingNotes,
          total: cartTotal,
          userId: user?.id || null
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (selectedPaymentMethod === 'tarjeta' && data.clientSecret) {
          // Para tarjetas, mostrar el formulario de Stripe
          setShowPaymentModal(false);
          setShowInvoice(true);
          setInvoiceData(data.invoiceData);
        } else {
          // Para otros métodos, mostrar factura directamente
          setInvoiceData(data.invoiceData);
          setShowPaymentModal(false);
          setShowInvoice(true);
        }
      } else {
        setPaymentError(data.error || 'Error procesando el pago');
      }
    } catch (error) {
      setPaymentError('Error de conexión. Intenta nuevamente.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleEmailInvoice = async () => {
    // Mostrar mensaje de carga
    const loadingMessage = document.createElement('div');
    loadingMessage.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;">
        <div style="background: white; padding: 30px; border-radius: 10px; text-align: center; max-width: 400px;">
          <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
          <h3 style="margin: 0 0 10px; color: #333;">📧 Enviando Venta...</h3>
          <p style="margin: 0; color: #666;">Procesando y enviando venta por email</p>
        </div>
      </div>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    `;
    document.body.appendChild(loadingMessage);

    try {
      console.log('📧 Iniciando envío de factura por email...');
      console.log('📋 Datos de la factura:', {
        id: invoiceData.id,
        customer: invoiceData.customerEmail,
        total: invoiceData.total,
        items: invoiceData.items.length
      });

      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethod: 'email_only',
          items: invoiceData.items,
          customerEmail: invoiceData.customerEmail,
          total: invoiceData.subtotal,
        }),
      });

      console.log('📡 Respuesta del servidor:', response.status);

      const data = await response.json();
      console.log('📊 Datos recibidos:', data);

      // Remover mensaje de carga
      document.body.removeChild(loadingMessage);

      if (data.success && data.emailSent) {
        // Mostrar mensaje de éxito con estilo
        // Usar React state en lugar de DOM dinámico
        setShowInvoice(true);
      } else {
        // Mostrar mensaje de factura generada exitosamente
        // Usar React state en lugar de DOM dinámico
        setShowInvoice(true);
      }
    } catch (error) {
      console.error('❌ Error enviando factura:', error);
      
      // Remover mensaje de carga
      if (document.body.contains(loadingMessage)) {
        document.body.removeChild(loadingMessage);
      }

      // Mostrar mensaje de error
      const errorMessage = document.createElement('div');
      errorMessage.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;">
          <div style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; border-radius: 15px; text-align: center; max-width: 500px; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
            <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
            <h3 style="margin: 0 0 15px; font-size: 24px;">Error de Conexión</h3>
            <p style="margin: 0 0 20px; font-size: 16px;">No se pudo enviar la factura. Por favor, intenta nuevamente.</p>
            <button class="close-modal-btn" style="background: rgba(255,255,255,0.2); border: 2px solid white; color: white; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 16px;">Cerrar</button>
          </div>
        </div>
      `;
      document.body.appendChild(errorMessage);
      
      // Agregar event listener para el botón cerrar
      setTimeout(() => {
        const closeBtn = errorMessage.querySelector('.close-modal-btn');
        if (closeBtn) {
          closeBtn.addEventListener('click', () => {
            document.body.removeChild(errorMessage);
          });
        }
      }, 100);
    }
  };

  const handleCompletePurchase = () => {
    // Limpiar carrito después del pago
    clearCart();
    setShowInvoice(false);
    setInvoiceData(null);
    setSelectedPaymentMethod('');
    setCustomerEmail('');
    alert('¡Compra completada exitosamente!');
  };

  const handleViewProduct = (product: Product) => {
    setShowProductDetail(product);
    setSelectedQuantity(1);
  };

  const handleToggleFavorite = (product: Product) => {
    setFavorites(prev => 
      prev.includes(product.id) 
        ? prev.filter((id: any) => id !== product.id)
        : [...prev, product.id]
    );
  };

  const cartCount = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum: number, item: any) => sum + item.subtotal, 0);

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Agotado', color: 'destructive' };
    if (stock < 5) return { text: `Solo ${stock}`, color: 'destructive' };
    if (stock < 10) return { text: `Stock Bajo (${stock})`, color: 'secondary' };
    return { text: `${stock} disponibles`, color: 'default' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Cargando tienda virtual</h2>
          <p className="text-gray-600">Preparando los mejores productos farmacéuticos para ti...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Moderno */}
      <div className="bg-white/90 backdrop-blur-md shadow-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                🏥 Qualipharm Store
              </h1>
              <p className="text-gray-600 mt-1">
                Tu farmacia virtual de confianza - {stats.totalProducts} productos disponibles
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Total en carrito</p>
                <p className="text-2xl font-bold text-blue-600">${cartTotal.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{cartCount} productos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layout Principal: Catálogo y Carrito Lado a Lado */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Catálogo de Productos - 2/3 del ancho */}
          <div className="lg:col-span-2">
            {/* Filtros y Búsqueda */}
            <Card className="mb-6 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-blue-600" />
                  Filtros y Búsqueda
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                  
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category: string) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

                  <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                    const [field, order] = value.split('-');
                    setSortBy(field as SortOption);
                    setSortOrder(order as SortOrder);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nombre-asc">Nombre A-Z</SelectItem>
                      <SelectItem value="nombre-desc">Nombre Z-A</SelectItem>
                      <SelectItem value="precio-asc">Precio Menor a Mayor</SelectItem>
                      <SelectItem value="precio-desc">Precio Mayor a Menor</SelectItem>
                      <SelectItem value="stock_disponible-desc">Mayor Stock</SelectItem>
                      <SelectItem value="rating-desc">Mejor Calificación</SelectItem>
                    </SelectContent>
                  </Select>
              </div>

                <div className="flex items-center justify-between">
                  <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "grid" | "list")}>
                    <TabsList>
                      <TabsTrigger value="grid">
                        <Grid className="h-4 w-4 mr-2" />
                        Cuadrícula
                      </TabsTrigger>
                      <TabsTrigger value="list">
                        <List className="h-4 w-4 mr-2" />
                        Lista
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <p className="text-sm text-gray-600">
                    {filteredProducts.length} productos encontrados
                  </p>
            </div>
          </CardContent>
        </Card>

            {/* Grid de Productos Premium */}
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8" 
              : "space-y-6"
            }>
              {filteredProducts.map((product: any, index: number) => (
                <Card key={product.id} className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/95 backdrop-blur-sm overflow-hidden relative">
                  {/* Badge de Destacado */}
                  {index < 3 && (
                    <div className="absolute top-4 left-4 z-10">
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg">
                        <Crown className="h-3 w-3 mr-1" />
                        Destacado
                      </Badge>
        </div>
                  )}
                  
                  <CardContent className="p-6">
                    <div className="flex flex-col h-full">
                      {/* Imagen del producto */}
                      <div className="relative mb-4">
                        <div className="aspect-square bg-gradient-to-br from-blue-100 via-purple-50 to-indigo-100 rounded-xl overflow-hidden shadow-inner">
                    <img
                      src={product.imagen_url}
                      alt={product.nombre}
                            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        
                        <Badge 
                          className={`absolute top-2 right-2 shadow-lg ${
                            getStockStatus(product.stock_disponible).color === 'destructive' 
                              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' 
                              : getStockStatus(product.stock_disponible).color === 'secondary'
                              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                              : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                          }`}
                        >
                          {getStockStatus(product.stock_disponible).text}
                      </Badge>
                        
                    <Button
                      size="sm"
                          variant="ghost"
                          className="absolute top-2 left-2 h-8 w-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
                          onClick={() => handleToggleFavorite(product)}
                        >
                          <Heart 
                            className={`h-4 w-4 transition-all duration-300 ${
                              favorites.includes(product.id) 
                                ? 'fill-red-500 text-red-500 scale-110' 
                                : 'text-gray-400 hover:text-red-400'
                            }`} 
                          />
                    </Button>
                        
                        {/* Efecto de brillo */}
                        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
                        </div>
                  </div>

                      {/* Información del producto */}
                      <div className="flex-1 flex flex-col">
                        <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {product.nombre}
                        </h3>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                          {product.descripcion}
                        </p>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                            {product.marca}
                          </Badge>
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                            {product.categoria}
                        </Badge>
                        </div>

                        {/* Rating Premium */}
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex">
                            {[...Array(5)].map((_: any, i: number) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 transition-colors ${
                                  i < Math.floor(product.rating)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 font-medium">
                            {product.rating} ({product.reviews} reseñas)
                          </span>
                        </div>

                        {/* Precio y Stock Premium */}
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              ${product.precio.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">cada unidad</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Disponible</p>
                            <p className="text-lg font-bold text-green-600">{product.stock_disponible}</p>
                        </div>
                      </div>

                        {/* Botones de acción Premium */}
                        <div className="flex gap-2 mt-auto">
                          <Button
                            onClick={() => handleViewProduct(product)}
                            variant="outline"
                            className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
                            size="sm"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              addToCart(product, 1);
                            }}
                            disabled={product.stock_disponible === 0}
                            className="flex-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 group"
                            size="sm"
                          >
                            <ShoppingCart className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" />
                          Agregar
                        </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Carrito de Compras Premium - 1/3 del ancho */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-2xl border-0 bg-white/95 backdrop-blur-sm h-[600px] flex flex-col">
              <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white rounded-t-lg relative overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90" />
                <div className="relative z-10">
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <ShoppingCart className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-lg font-bold">Carrito Premium</div>
                      <div className="text-sm text-blue-100">{cartCount} productos</div>
                    </div>
                  </CardTitle>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
              </CardHeader>
              <CardContent className="p-6 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="relative mb-6">
                      <ShoppingCart className="h-20 w-20 text-gray-300 mx-auto" />
                      <div className="absolute -top-2 -right-2">
                        <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
                      </div>
                    </div>
                    <p className="text-gray-500 text-xl font-medium mb-2">Tu carrito está vacío</p>
                    <p className="text-gray-400 text-sm">Agrega algunos productos premium para comenzar</p>
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    {/* Lista de productos en el carrito Premium */}
                    <div className="space-y-3">
                      {cart.map((item: any) => (
                        <div key={item.product.id} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-300">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-200 to-purple-200 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                            <span className="text-xl">💊</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-gray-900 truncate">{item.product.nombre}</h4>
                            <p className="text-xs text-gray-600 font-medium">{item.product.marca}</p>
                            <p className="text-sm font-bold text-blue-600">${item.product.precio.toFixed(2)} c/u</p>
                            <p className="text-xs text-gray-500">Subtotal: ${item.subtotal.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center space-x-1 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="h-6 w-6 p-0 border-blue-200 text-blue-600 hover:bg-blue-50"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-xs font-bold text-gray-700">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="h-6 w-6 p-0 border-blue-200 text-blue-600 hover:bg-blue-50"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeFromCart(item.product.id)}
                              className="h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white shadow-sm"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Resumen del carrito Premium */}
                    <div className="border-t border-gray-200 pt-6 space-y-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-gray-700">Subtotal:</span>
                        <span className="text-blue-600">${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>IVA (15%):</span>
                        <span>${(cartTotal * 0.15).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xl font-bold border-t border-gray-300 pt-3">
                        <span className="text-gray-800">Total:</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">${(cartTotal * 1.15).toFixed(2)}</span>
                      </div>
                      
                      <Button 
                        onClick={handleCheckout}
                        className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 hover:from-green-600 hover:via-emerald-600 hover:to-teal-700 text-white h-14 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 group"
                      >
                        <CreditCard className="h-6 w-6 mr-2 group-hover:scale-110 transition-transform" />
                        Proceder al Pago Premium
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={clearCart} 
                        className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-300"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Vaciar Carrito
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de Detalle del Producto */}
      <Dialog open={!!showProductDetail} onOpenChange={() => setShowProductDetail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              {showProductDetail?.nombre}
            </DialogTitle>
          </DialogHeader>
          {showProductDetail && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg overflow-hidden">
                <img
                  src={showProductDetail.imagen_url}
                  alt={showProductDetail.nombre}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{showProductDetail.nombre}</h3>
                  <p className="text-gray-600 mb-4">{showProductDetail.descripcion}</p>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-3xl font-bold text-blue-600">${showProductDetail.precio.toFixed(2)}</span>
                    <Badge className={getStockStatus(showProductDetail.stock_disponible).color}>
                      {getStockStatus(showProductDetail.stock_disponible).text}
                          </Badge>
                        </div>
                </div>
                
                <div className="space-y-2">
                  <p><span className="font-medium">Marca:</span> {showProductDetail.marca}</p>
                  <p><span className="font-medium">Categoría:</span> {showProductDetail.categoria}</p>
                  <p><span className="font-medium">Stock disponible:</span> {showProductDetail.stock_disponible}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                    disabled={selectedQuantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{selectedQuantity}</span>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedQuantity(Math.min(showProductDetail.stock_disponible, selectedQuantity + 1))}
                    disabled={selectedQuantity >= showProductDetail.stock_disponible}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addToCart(showProductDetail, selectedQuantity);
                    setShowProductDetail(null);
                  }}
                  disabled={showProductDetail.stock_disponible === 0}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Agregar al Carrito
                </Button>
                          </div>
                        </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Pago */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              {user ? 'Finalizar Compra' : 'Comprar como Invitado'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Email del Cliente {!user && <span className="text-orange-600">(Requerido para enviar la factura)</span>}
              </label>
              <Input
                type="email"
                placeholder={user ? user.email : "tu-email@ejemplo.com"}
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full"
                required
              />
              {!user && (
                <p className="text-xs text-gray-500 mt-1">
                  📧 Te enviaremos la factura a este email
                </p>
              )}
            </div>

            {/* Datos del Cliente */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Nombre Completo <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Tu nombre completo"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  placeholder="0999-999-999"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full"
                  required
                />
              </div>
            </div>

            {/* Datos de Envío */}
            <div className="border-t pt-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">📦 Datos de Envío</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Dirección <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Calle principal, número, referencia"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Ciudad <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="Quito, Guayaquil, etc."
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      className="w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Notas de Envío
                    </label>
                    <Input
                      type="text"
                      placeholder="Instrucciones adicionales (opcional)"
                      value={shippingNotes}
                      onChange={(e) => setShippingNotes(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Forma de Pago</label>
              <div className="space-y-2">
                <Button
                  variant={selectedPaymentMethod === 'transferencia' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setSelectedPaymentMethod('transferencia')}
                >
                  <Banknote className="h-4 w-4 mr-2" />
                  Transferencia Bancaria
                </Button>
                <Button
                  variant={selectedPaymentMethod === 'tarjeta' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setSelectedPaymentMethod('tarjeta')}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Tarjeta de Crédito/Débito
                </Button>
                <Button
                  variant={selectedPaymentMethod === 'efectivo' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setSelectedPaymentMethod('efectivo')}
                >
                  <Banknote className="h-4 w-4 mr-2" />
                  Efectivo (Contraentrega)
                </Button>
                <Button
                  variant={selectedPaymentMethod === 'digital' ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setSelectedPaymentMethod('digital')}
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  Pago Digital (PayPal, etc.)
                          </Button>
                        </div>
                      </div>

            {/* Mensaje informativo para pago en efectivo */}
            {selectedPaymentMethod === 'efectivo' && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
                <div className="flex items-start">
                  <div className="text-lg mr-2">💵</div>
                  <div>
                    <strong>Pago Contraentrega:</strong> El pago se realizará al momento de recibir el producto. 
                    Asegúrate de tener el monto exacto disponible.
                  </div>
                </div>
              </div>
            )}

            {paymentError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {paymentError}
          </div>
        )}

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentError('');
                }}
                className="flex-1"
                disabled={paymentLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handlePayment}
                disabled={paymentLoading}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                {paymentLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Procesando...
          </div>
                ) : (
                  'Confirmar Pago'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Venta */}
      <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Venta Generada
            </DialogTitle>
          </DialogHeader>
          {invoiceData && (
            <div className="space-y-6">
              {/* Header de la factura */}
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-900">QUALIPHARM LABORATORIO FARMACÉUTICO</h2>
                <p className="text-gray-600">Sistema de Gestión Farmacéutica LogicQP</p>
                <p className="text-sm text-gray-500">Venta #{invoiceData.id}</p>
                <p className="text-sm text-gray-500">
                  Fecha: {invoiceData.date} - Hora: {invoiceData.time}
                </p>
              </div>

              {/* Información del cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Cliente:</h3>
                  <p className="text-gray-600">{invoiceData.customerEmail}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Forma de Pago:</h3>
                  <p className="text-gray-600 capitalize">{invoiceData.paymentMethod}</p>
                </div>
              </div>

              {/* Detalle de productos */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Detalle de Productos:</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">Producto</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Cantidad</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Precio Unit.</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceData.items.map((item: any, index: number) => (
                        <tr key={index}>
                          <td className="border border-gray-300 px-4 py-2">
                            <div>
                              <p className="font-medium">{item.product.nombre}</p>
                              <p className="text-sm text-gray-500">{item.product.marca}</p>
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right">${item.product.precio.toFixed(2)}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right">${item.subtotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totales */}
              <div className="border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${invoiceData.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IVA (15%):</span>
                      <span>${invoiceData.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>${invoiceData.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={handlePrintInvoice}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir Venta
                </Button>
                <Button
                  onClick={handleEmailInvoice}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar por Email
                </Button>
                <Button
                  onClick={handleCompletePurchase}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Finalizar Compra
                </Button>
                <Button
                  onClick={() => {
                    setShowInvoice(false);
                    setInvoiceData(null);
                    setCart([]);
                    setShowPaymentModal(false);
                    setPaymentError('');
                    setCustomerEmail('');
                    setCustomerName('');
                    setCustomerPhone('');
                    setShippingAddress('');
                    setShippingCity('');
                    setShippingNotes('');
                    setSelectedPaymentMethod('');
                  }}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cerrar
                </Button>
      </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
