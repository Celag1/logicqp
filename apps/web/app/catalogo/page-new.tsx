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
  EyeOff
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
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);

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
      const { supabase: supabasePublic } = await import('@/lib/supabase');
      
      const queryPromise = supabasePublic
        .from('productos')
        .select(`
          *,
          categorias(nombre),
          proveedores(nombre),
          lotes(
            id,
            cantidad_disponible,
            fecha_vencimiento
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
        stock_disponible: producto.lotes?.[0]?.cantidad_disponible || producto.stock || 0,
        rating: 4.5,
        reviews: 25,
        imagen_url: producto.foto_url || `https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=400&fit=crop&crop=center&q=80&auto=format&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`
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
    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        return prev.map((item: any) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity, subtotal: (item.quantity + quantity) * product.precio }
            : item
        );
      } else {
        return [...prev, { product, quantity, subtotal: quantity * product.precio }];
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
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
      alert('El carrito está vacío');
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePayment = () => {
    if (!selectedPaymentMethod) {
      alert('Por favor selecciona una forma de pago');
      return;
    }
    if (!customerEmail) {
      alert('Por favor ingresa tu email');
      return;
    }

    // Generar datos de la factura
    const invoice = {
      id: `INV-${Date.now()}`,
      date: new Date().toLocaleDateString('es-ES'),
      time: new Date().toLocaleTimeString('es-ES'),
      paymentMethod: selectedPaymentMethod,
      customerEmail,
      items: cart,
      subtotal: cartTotal,
      tax: cartTotal * 0.15, // 15% IVA
      total: cartTotal * 1.15
    };

    setInvoiceData(invoice);
    setShowPaymentModal(false);
    setShowInvoice(true);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleEmailInvoice = () => {
    // Simular envío de email
    alert(`Factura enviada a: ${customerEmail}\n\nNúmero de factura: ${invoiceData.id}`);
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
    if (stock < 10) return { text: 'Stock Bajo', color: 'secondary' };
    return { text: 'Disponible', color: 'default' };
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

            {/* Grid de Productos */}
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
              : "space-y-4"
            }>
              {filteredProducts.map((product: any) => (
                <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col h-full">
                      {/* Imagen del producto */}
                      <div className="relative mb-4">
                        <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg overflow-hidden">
                          <img
                            src={product.imagen_url}
                            alt={product.nombre}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <Badge 
                          className={`absolute top-2 right-2 ${
                            getStockStatus(product.stock_disponible).color === 'destructive' 
                              ? 'bg-red-500' 
                              : getStockStatus(product.stock_disponible).color === 'secondary'
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                        >
                          {getStockStatus(product.stock_disponible).text}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 left-2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                          onClick={() => handleToggleFavorite(product)}
                        >
                          <Heart 
                            className={`h-4 w-4 ${
                              favorites.includes(product.id) 
                                ? 'fill-red-500 text-red-500' 
                                : 'text-gray-400'
                            }`} 
                          />
                        </Button>
                      </div>

                      {/* Información del producto */}
                      <div className="flex-1 flex flex-col">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                          {product.nombre}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {product.descripcion}
                        </p>
                        <p className="text-xs text-blue-600 font-medium mb-2">
                          {product.marca} • {product.categoria}
                        </p>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-3">
                          <div className="flex">
                            {[...Array(5)].map((_: any, i: number) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(product.rating)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">
                            {product.rating} ({product.reviews})
                          </span>
                        </div>

                        {/* Precio y Stock */}
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-2xl font-bold text-blue-600">
                              ${product.precio.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Stock: {product.stock_disponible}
                            </p>
                          </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex gap-2 mt-auto">
                          <Button
                            onClick={() => handleViewProduct(product)}
                            variant="outline"
                            className="flex-1"
                            size="sm"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          <Button
                            onClick={() => addToCart(product, 1)}
                            disabled={product.stock_disponible === 0}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                            size="sm"
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
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

          {/* Carrito de Compras - 1/3 del ancho */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Carrito ({cartCount})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Tu carrito está vacío</p>
                    <p className="text-gray-400 text-sm">Agrega algunos productos para comenzar</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Lista de productos en el carrito */}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {cart.map((item: any) => (
                        <div key={item.product.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg">💊</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-gray-900 truncate">{item.product.nombre}</h4>
                            <p className="text-xs text-gray-500">{item.product.marca}</p>
                            <p className="text-sm font-medium text-blue-600">${item.product.precio.toFixed(2)} c/u</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="h-6 w-6 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="h-6 w-6 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeFromCart(item.product.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Resumen del carrito */}
                    <div className="border-t pt-4 space-y-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Subtotal:</span>
                        <span className="text-blue-600">${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>IVA (15%):</span>
                        <span>${(cartTotal * 0.15).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xl font-bold border-t pt-2">
                        <span>Total:</span>
                        <span className="text-blue-600">${(cartTotal * 1.15).toFixed(2)}</span>
                      </div>
                      
                      <Button 
                        onClick={handleCheckout}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-12 text-lg"
                      >
                        <CreditCard className="h-5 w-5 mr-2" />
                        Proceder al Pago
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={clearCart} 
                        className="w-full"
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
                  onClick={() => {
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Seleccionar Forma de Pago
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Email del Cliente</label>
              <Input
                type="email"
                placeholder="cliente@email.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full"
              />
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
                  Efectivo
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

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowPaymentModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handlePayment}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                Confirmar Pago
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Factura */}
      <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Factura Generada
            </DialogTitle>
          </DialogHeader>
          {invoiceData && (
            <div className="space-y-6">
              {/* Header de la factura */}
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-900">QUALIPHARM LABORATORIO FARMACÉUTICO</h2>
                <p className="text-gray-600">Sistema de Gestión Farmacéutica LogicQP</p>
                <p className="text-sm text-gray-500">Factura #{invoiceData.id}</p>
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
                  Imprimir Factura
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
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

