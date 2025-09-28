"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSafeCart } from "@/hooks/useSafeCart";
import { CartItem } from "@/hooks/useCart";
import NotificationToast from "@/components/notification-toast";
import { playAddToCartSound, triggerHapticFeedback } from "@/components/sound-effects";
import ImageSearchModal from "@/components/image-search-modal";
import BarcodeScannerModal from "@/components/barcode-scanner-modal";
import UniversalExportButton from "@/components/universal-export-button";
import { 
  Search, 
  Grid, 
  List, 
  Camera, 
  Barcode, 
  Star, 
  ShoppingCart,
  Eye,
  Heart,
  TrendingUp,
  Zap,
  Pill,
  Sparkles,
  Shield,
  AlertTriangle,
  CheckCircle,
  Plus,
  Minus
} from "lucide-react";

interface Product {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  marca: string;
  categoria: string;
  stock_disponible: number;
  imagen_url?: string;
  rating?: number;
  reviews?: number;
}

// Mock data - En producción esto vendría de la API
const mockProducts: Product[] = [
  {
    id: "1",
    codigo: "QPH-001",
    nombre: "Paracetamol 500mg",
    descripcion: "Analgésico y antipirético para aliviar dolor y fiebre",
    precio: 2.50,
    marca: "Qualipharm",
    categoria: "Analgésicos",
    stock_disponible: 150,
    rating: 4.8,
    reviews: 127,
    imagen_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop&crop=center&q=80&auto=format"
  },
  {
    id: "2",
    codigo: "QPH-002",
    nombre: "Ibuprofeno 400mg",
    descripcion: "Antiinflamatorio no esteroideo para dolor e inflamación",
    precio: 3.20,
    marca: "Qualipharm",
    categoria: "Antiinflamatorios",
    stock_disponible: 89,
    rating: 4.6,
    reviews: 95,
    imagen_url: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300&h=300&fit=crop&crop=center&q=80&auto=format"
  },
  {
    id: "3",
    codigo: "QPH-003",
    nombre: "Vitamina C 1000mg",
    descripcion: "Suplemento vitamínico para fortalecer el sistema inmune",
    precio: 8.90,
    marca: "Qualipharm",
    categoria: "Vitaminas",
    stock_disponible: 200,
    rating: 4.9,
    reviews: 203,
    imagen_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop&crop=center&q=80&auto=format"
  },
  {
    id: "4",
    codigo: "QPH-004",
    nombre: "Omeprazol 20mg",
    descripcion: "Protector gástrico para úlceras y reflujo",
    precio: 12.50,
    marca: "Qualipharm",
    categoria: "Gastrointestinales",
    stock_disponible: 67,
    rating: 4.7,
    reviews: 156,
    imagen_url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop&crop=center&q=80&auto=format"
  },
  {
    id: "5",
    codigo: "QPH-005",
    nombre: "Loratadina 10mg",
    descripcion: "Antihistamínico para alergias sin somnolencia",
    precio: 6.80,
    marca: "Qualipharm",
    categoria: "Antihistamínicos",
    stock_disponible: 120,
    rating: 4.5,
    reviews: 89,
    imagen_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop&crop=center&q=80&auto=format"
  },
  {
    id: "6",
    codigo: "QPH-006",
    nombre: "Aspirina 100mg",
    descripcion: "Antiagregante plaquetario para prevención cardiovascular",
    precio: 4.20,
    marca: "Qualipharm",
    categoria: "Cardiovasculares",
    stock_disponible: 75,
    rating: 4.4,
    reviews: 112,
    imagen_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop&crop=center&q=80&auto=format"
  },
  {
    id: "7",
    codigo: "QPH-007",
    nombre: "Salbutamol 100mcg",
    descripcion: "Broncodilatador para crisis asmáticas",
    precio: 15.30,
    marca: "Qualipharm",
    categoria: "Respiratorios",
    stock_disponible: 45,
    rating: 4.8,
    reviews: 178,
    imagen_url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop&crop=center&q=80&auto=format"
  },
  {
    id: "8",
    codigo: "QPH-008",
    nombre: "Metformina 500mg",
    descripcion: "Antidiabético oral para control de glucosa",
    precio: 18.90,
    marca: "Qualipharm",
    categoria: "Endocrinológicos",
    stock_disponible: 60,
    rating: 4.6,
    reviews: 134,
    imagen_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop&crop=center&q=80&auto=format"
  },
  {
    id: "9",
    codigo: "QPH-009",
    nombre: "Dermatol 2%",
    descripcion: "Crema tópica para tratamiento de afecciones dermatológicas",
    precio: 22.50,
    marca: "Qualipharm",
    categoria: "Dermatológicos",
    stock_disponible: 85,
    rating: 4.7,
    reviews: 167,
    imagen_url: "https://images.unsplash.com/photo-1550572017-edd951aa4f39?w=300&h=300&fit=crop&crop=center&q=80&auto=format"
  },
  {
    id: "10",
    codigo: "QPH-010",
    nombre: "Oftalmic Plus",
    descripcion: "Gotas oftálmicas para alivio de irritación ocular",
    precio: 28.90,
    marca: "Qualipharm",
    categoria: "Oftalmológicos",
    stock_disponible: 42,
    rating: 4.8,
    reviews: 198,
    imagen_url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop&crop=center&q=80&auto=format"
  },
  {
    id: "11",
    codigo: "QPH-011",
    nombre: "Antibiotico XR",
    descripcion: "Antibiótico de amplio espectro para infecciones bacterianas",
    precio: 45.60,
    marca: "Qualipharm",
    categoria: "Antibióticos",
    stock_disponible: 38,
    rating: 4.9,
    reviews: 234,
    imagen_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop&crop=center&q=80&auto=format"
  },
  {
    id: "12",
    codigo: "QPH-012",
    nombre: "Hormona Plus",
    descripcion: "Terapia hormonal para desequilibrios endocrinológicos",
    precio: 89.90,
    marca: "Qualipharm",
    categoria: "Hormonales",
    stock_disponible: 25,
    rating: 4.6,
    reviews: 156,
    imagen_url: "https://images.unsplash.com/photo-1550572017-edd951aa4f39?w=300&h=300&fit=crop&crop=center&q=80&auto=format"
  }
];

const categories = [
  "Todas",
  "Analgésicos",
  "Antiinflamatorios", 
  "Antibióticos",
  "Antihistamínicos",
  "Vitaminas",
  "Dermatológicos",
  "Oftalmológicos",
  "Cardiovasculares",
  "Gastrointestinales",
  "Respiratorios",
  "Antidiabéticos",
  "Endocrinológicos",
  "Hormonales"
];

const brands = ["Todas", "Qualipharm", "Genérico"];

export default function CatalogoPage() {
  const [products] = useState<Product[]>(mockProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedBrand, setSelectedBrand] = useState("Todas");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("relevance");
  const [showScanner, setShowScanner] = useState(false);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [imageLoading, setImageLoading] = useState<{[key: string]: boolean}>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const { items: cartItems, addItem, updateQuantity, removeItem, getTotal, getItemCount } = useSafeCart();

  // Inicializar estado de carga de imágenes con lazy loading
  useEffect(() => {
    const initialLoadingState = products.reduce((acc, product) => {
      if (product.imagen_url) {
        acc[product.id] = true;
      }
      return acc;
    }, {} as {[key: string]: boolean});
    setImageLoading(initialLoadingState);

    // Preload primeras 4 imágenes para mejor UX con timeout
    const preloadImages = products.slice(0, 4);
    preloadImages.forEach(product => {
      if (product.imagen_url) {
        const img = new Image();
        const timeoutId = setTimeout(() => {
          // Si la imagen tarda más de 5 segundos, marcar como fallida
          setImageLoading(prev => ({ ...prev, [product.id]: false }));
          console.warn(`Image load timeout for product ${product.id}`);
        }, 5000);
        
        img.onload = () => {
          clearTimeout(timeoutId);
          setImageLoading(prev => ({ ...prev, [product.id]: false }));
        };
        img.onerror = () => {
          clearTimeout(timeoutId);
          setImageLoading(prev => ({ ...prev, [product.id]: false }));
          // Marcar como fallida para mostrar icono por defecto
          product.imagen_url = undefined;
        };
        
        img.src = product.imagen_url;
      }
    });
  }, [products]);

  // Filtrado inteligente con IA
  useEffect(() => {
    let filtered = products;

    // Filtro por búsqueda (inteligente)
    if (searchTerm) {
      filtered = filtered.filter(product => {
        const searchLower = searchTerm.toLowerCase();
        return (
          product.nombre.toLowerCase().includes(searchLower) ||
          product.descripcion.toLowerCase().includes(searchLower) ||
          product.codigo.toLowerCase().includes(searchLower) ||
          product.categoria.toLowerCase().includes(searchLower) ||
          product.marca.toLowerCase().includes(searchLower)
        );
      });
    }

    // Filtro por categoría
    if (selectedCategory !== "Todas") {
      filtered = filtered.filter(product => product.categoria === selectedCategory);
    }

    // Filtro por marca
    if (selectedBrand !== "Todas") {
      filtered = filtered.filter(product => product.marca === selectedBrand);
    }

    // Ordenamiento inteligente
    switch (sortBy) {
      case "price_low":
        filtered = [...filtered].sort((a, b) => a.precio - b.precio);
        break;
      case "price_high":
        filtered = [...filtered].sort((a, b) => b.precio - a.precio);
        break;
      case "rating":
        filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "stock":
        filtered = [...filtered].sort((a, b) => b.stock_disponible - a.stock_disponible);
        break;
      case "name":
        filtered = [...filtered].sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      default:
        // Ordenamiento por relevancia (IA-powered)
        filtered = [...filtered].sort((a, b) => {
          let scoreA = 0;
          let scoreB = 0;

          // Score por rating
          scoreA += (a.rating || 0) * 10;
          scoreB += (b.rating || 0) * 10;

          // Score por stock (preferir productos disponibles)
          scoreA += Math.min(a.stock_disponible, 100);
          scoreB += Math.min(b.stock_disponible, 100);

          // Score por marca Qualipharm
          if (a.marca === "Qualipharm") scoreA += 50;
          if (b.marca === "Qualipharm") scoreB += 50;

          return scoreB - scoreA;
        });
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, selectedBrand, sortBy]);

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      codigo: product.codigo,
      nombre: product.nombre,
      precio: product.precio,
      stock_disponible: product.stock_disponible,
      imagen_url: product.imagen_url,
      categoria: product.categoria,
      marca: product.marca
    });
    
    // Efectos de sonido y vibración
    playAddToCartSound();
    triggerHapticFeedback();
    
    // Mostrar toast elegante
    setToastMessage(`Se agregó ${product.nombre} al carrito`);
    setShowToast(true);
  };

  const handleQuickView = (product: Product) => {
    // Modal de vista rápida elegante
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4 transform transition-all duration-300 scale-95 opacity-0">
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-xl font-bold text-gray-900">${product.nombre}</h3>
          <button class="text-gray-400 hover:text-gray-600" onclick="this.closest('.fixed').remove()">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="space-y-4">
          <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <p class="text-gray-700">${product.descripcion}</p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center p-3 bg-blue-50 rounded-lg">
              <p class="text-sm text-gray-600">Precio</p>
              <p class="text-2xl font-bold text-blue-600">$${product.precio.toFixed(2)}</p>
            </div>
            <div class="text-center p-3 bg-green-50 rounded-lg">
              <p class="text-sm text-gray-600">Stock</p>
              <p class="text-2xl font-bold text-green-600">${product.stock_disponible}</p>
            </div>
          </div>
          <div class="flex items-center justify-center space-x-2">
            <Star class="h-5 w-5 text-yellow-400 fill-current" />
            <span class="font-medium">${product.rating}</span>
            <span class="text-gray-500">(${product.reviews} reseñas)</span>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    setTimeout(() => {
      const content = modal.querySelector('.bg-white');
      if (content) {
        content.classList.remove('scale-95', 'opacity-0');
      }
    }, 100);
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { status: "Agotado", color: "destructive", icon: AlertTriangle };
    if (stock < 10) return { status: "Stock Bajo", color: "destructive", icon: AlertTriangle };
    if (stock < 50) return { status: "Stock Medio", color: "warning", icon: AlertTriangle };
    return { status: "Disponible", color: "default", icon: CheckCircle };
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Analgésicos": return Pill;
      case "Vitaminas": return Sparkles;
      case "Cardiovasculares": return Heart;
      case "Respiratorios": return TrendingUp;
      case "Gastrointestinales": return Shield;
      case "Antihistamínicos": return Zap;
      case "Endocrinológicos": return TrendingUp;
      default: return Zap;
    }
  };

  const getTotalCart = () => {
    if (!cartItems || !Array.isArray(cartItems)) return 0;
    return (cartItems as CartItem[]).reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const getCartItemCount = () => {
    if (!cartItems || !Array.isArray(cartItems)) return 0;
    return (cartItems as CartItem[]).reduce((total, item) => total + item.cantidad, 0);
  };

  const handleImageLoad = (productId: string) => {
    setImageLoading(prev => ({ ...prev, [productId]: false }));
    
    // Optimizar rendimiento: remover imagen del DOM si no es visible
    const imgElement = document.querySelector(`img[data-product-id="${productId}"]`);
    if (imgElement) {
      imgElement.setAttribute('data-loaded', 'true');
    }
  };

  const handleImageError = (productId: string) => {
    setImageLoading(prev => ({ ...prev, [productId]: false }));
    // Log del error para debugging
    console.warn(`Error loading image for product ${productId}`);
    
    // Marcar la imagen como fallida para mostrar el icono por defecto
    const product = products.find(p => p.id === productId);
    if (product) {
      product.imagen_url = undefined;
    }
  };

  // Función para manejar resultados de búsqueda por imagen
  const handleImageSearchResults = (results: Product[]) => {
    console.log('🔍 Resultados de búsqueda por imagen:', results);
    
    // Filtrar productos basado en los resultados
    const resultIds = results.map(r => r.id);
    setFilteredProducts(products.filter(p => resultIds.includes(p.id)));
    
    // Mostrar toast de confirmación
    setToastMessage(`Se encontraron ${results.length} productos similares`);
    setShowToast(true);
    
    // Cerrar el modal
    setShowImageSearch(false);
  };

  // Función para manejar productos encontrados por código de barras
  const handleBarcodeProductFound = (product: Product) => {
    console.log('📱 Producto encontrado por código de barras:', product);
    
    // Filtrar para mostrar solo el producto encontrado
    setFilteredProducts([product]);
    
    // Mostrar toast de confirmación
    setToastMessage(`Producto encontrado: ${product.nombre}`);
    setShowToast(true);
    
    // Cerrar el modal
    setShowScanner(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section Profesional */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900">
        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            {/* Icono principal */}
            <div className="flex justify-center mb-8">
              <div className="p-6 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 shadow-2xl">
                <Pill className="h-16 w-16 text-white" />
              </div>
            </div>
            
            {/* Título principal */}
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Catálogo de Productos
            </h1>
            
            {/* Subtítulo */}
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed">
              Descubre nuestra amplia gama de productos farmacéuticos de alta calidad, 
              respaldados por la más avanzada tecnología y estándares internacionales
            </p>
            
            {/* Estadísticas del carrito */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/20">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-white">{getCartItemCount()}</div>
                  <div className="text-blue-200 text-sm">Productos en carrito</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/20">
                <div className="p-2 bg-green-500/20 rounded-xl">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-white">${getTotalCart().toFixed(2)}</div>
                  <div className="text-blue-200 text-sm">Total acumulado</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/20">
                <div className="p-2 bg-purple-500/20 rounded-xl">
                  <span className="text-2xl">📦</span>
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-white">{filteredProducts.length}</div>
                  <div className="text-blue-200 text-sm">Productos disponibles</div>
                </div>
              </div>
            </div>
            
            {/* Botón de carrito si hay productos */}
            {getCartItemCount() > 0 && (
              <Button
                onClick={() => window.location.href = '/checkout'}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-2xl transform hover:scale-105 transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-2xl"
              >
                <ShoppingCart className="h-6 w-6 mr-3" />
                Proceder al Carrito
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Barra de herramientas */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Controles de vista */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 mr-2">Vista:</span>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="shadow-md rounded-xl"
              >
                <Grid className="h-4 w-4 mr-2" />
                Cuadrícula
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="shadow-md rounded-xl"
              >
                <List className="h-4 w-4 mr-2" />
                Lista
              </Button>
            </div>
            
            {/* Botones de acción */}
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setShowImageSearch(true)}
                variant="outline"
                size="sm"
                className="bg-white/50 hover:bg-white border-blue-200 text-blue-700 hover:text-blue-800 rounded-xl"
              >
                <Camera className="h-4 w-4 mr-2" />
                Búsqueda por Imagen
              </Button>
              
              <Button
                onClick={() => setShowScanner(true)}
                variant="outline"
                size="sm"
                className="bg-white/50 hover:bg-white border-green-200 text-green-700 hover:text-green-800 rounded-xl"
              >
                <Barcode className="h-4 w-4 mr-2" />
                Escanear Código
              </Button>
              
              <UniversalExportButton
                data={filteredProducts}
                title="Catálogo de Productos"
                subtitle="Lista completa de productos farmacéuticos"
                columns={[
                  { key: 'codigo', label: 'Código', width: 15 },
                  { key: 'nombre', label: 'Producto', width: 25 },
                  { key: 'marca', label: 'Marca', width: 15 },
                  { key: 'categoria', label: 'Categoría', width: 15 },
                  { key: 'precio', label: 'Precio', type: 'currency', width: 10 },
                  { key: 'stock_disponible', label: 'Stock', type: 'number', width: 10 },
                  { key: 'rating', label: 'Rating', type: 'number', width: 10 }
                ]}
                summary={[
                  { label: 'Total productos', value: filteredProducts.length, icon: '📦' },
                  { label: 'Categorías', value: Array.from(new Set(filteredProducts.map(p => p.categoria))).length, icon: '🏷️' },
                  { label: 'Marcas', value: Array.from(new Set(filteredProducts.map(p => p.marca))).length, icon: '🏢' },
                  { label: 'Precio promedio', value: `$${(filteredProducts.reduce((sum, p) => sum + p.precio, 0) / filteredProducts.length).toFixed(2)}`, icon: '💰' }
                ]}
                filters={[
                  { label: 'Búsqueda', value: searchTerm || 'Ninguna' },
                  { label: 'Categoría', value: selectedCategory || 'Todas' },
                  { label: 'Marca', value: selectedBrand || 'Todas' },
                  { label: 'Orden', value: sortBy === 'precio' ? 'Por precio' : sortBy === 'nombre' ? 'Por nombre' : 'Por popularidad' }
                ]}
                variant="outline"
                size="sm"
                className="bg-white/50 hover:bg-white border-purple-200 text-purple-700 hover:text-purple-800 rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Panel de Filtros Profesional */}
      <div className="bg-gradient-to-r from-white via-blue-50/30 to-indigo-50/30 border-b shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
              <span className="mr-3">🔍</span>
              Filtros Inteligentes
            </h2>
            <p className="text-gray-600">
              Encuentra exactamente lo que necesitas con nuestros filtros avanzados
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Búsqueda Inteligente */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 flex items-center">
                <Search className="h-4 w-4 mr-2 text-blue-600" />
                Búsqueda Inteligente
              </label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  placeholder="Buscar productos, marcas, códigos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 rounded-xl bg-white/80 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Filtro de Categoría */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 flex items-center">
                <span className="mr-2">📂</span>
                Categoría
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 py-3 rounded-xl bg-white/80 backdrop-blur-sm">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="rounded-lg">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Marca */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 flex items-center">
                <span className="mr-2">🏷️</span>
                Marca
              </label>
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Seleccionar marca" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>

            {/* Ordenamiento */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                🔄 Ordenar Por
              </label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Seleccionar orden" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">🎯 Más Relevantes</SelectItem>
                <SelectItem value="price_low">💰 Precio: Menor a Mayor</SelectItem>
                <SelectItem value="price_high">💰 Precio: Mayor a Menor</SelectItem>
                <SelectItem value="rating">⭐ Mejor Valorados</SelectItem>
                <SelectItem value="stock">📦 Más Stock</SelectItem>
                <SelectItem value="name">🔤 Nombre A-Z</SelectItem>
              </SelectContent>
            </Select>
            </div>
          </div>

          {/* Filtros Avanzados */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                🔧 Filtros Avanzados
              </h3>
            </div>
            
            <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    📱 Escanear Código
                  </label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowScanner(true)}
                className="border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
              >
                <Barcode className="h-4 w-4 mr-2" />
                Escanear Código
              </Button>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    📷 Búsqueda por Imagen
                  </label>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowImageSearch(true)}
                className="border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
              >
                <Camera className="h-4 w-4 mr-2" />
                Búsqueda por Imagen
              </Button>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    📄 Exportar Catálogo
                  </label>
                  <UniversalExportButton
                    data={filteredProducts}
                    title="Catálogo de Productos"
                    subtitle="Lista completa de productos farmacéuticos"
                    columns={[
                      { key: 'codigo', label: 'Código', width: 15 },
                      { key: 'nombre', label: 'Producto', width: 25 },
                      { key: 'marca', label: 'Marca', width: 15 },
                      { key: 'categoria', label: 'Categoría', width: 15 },
                      { key: 'precio', label: 'Precio', type: 'currency', width: 10 },
                      { key: 'stock_disponible', label: 'Stock', type: 'number', width: 10 },
                      { key: 'rating', label: 'Rating', type: 'number', width: 10 }
                    ]}
                    summary={[
                      { label: 'Total productos', value: filteredProducts.length, icon: '📦' },
                      { label: 'Categorías', value: Array.from(new Set(filteredProducts.map(p => p.categoria))).length, icon: '🏷️' },
                      { label: 'Marcas', value: Array.from(new Set(filteredProducts.map(p => p.marca))).length, icon: '🏢' },
                      { label: 'Precio promedio', value: `$${(filteredProducts.reduce((sum, p) => sum + p.precio, 0) / filteredProducts.length).toFixed(2)}`, icon: '💰' }
                    ]}
                    filters={[
                      { label: 'Búsqueda', value: searchTerm || 'Ninguna' },
                      { label: 'Categoría', value: selectedCategory || 'Todas' },
                      { label: 'Marca', value: selectedBrand || 'Todas' },
                      { label: 'Orden', value: sortBy === 'precio' ? 'Por precio' : sortBy === 'nombre' ? 'Por nombre' : 'Por popularidad' }
                    ]}
                    variant="outline"
                    size="sm"
                    className="border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all duration-200"
                  />
                </div>
            </div>
            
            <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-full">
              🎯 {filteredProducts.length} productos encontrados
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Productos */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No se encontraron productos</h3>
            <p className="text-gray-600 text-lg">Intenta ajustar los filtros o términos de búsqueda</p>
          </div>
        ) : (
          <div className={`grid gap-8 ${
            viewMode === "grid" 
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1"
          }`}>
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product.stock_disponible);
              const CategoryIcon = getCategoryIcon(product.categoria);
              const cartItem = cartItems && Array.isArray(cartItems) ? (cartItems as CartItem[]).find(item => item.id === product.id) : undefined;
              
              return (
                <Card key={product.id} className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-xl bg-white overflow-hidden transform hover:-translate-y-2">
                  {/* Imagen del Producto con Overlay */}
                  <div className="relative aspect-square bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 overflow-hidden">
                    {product.imagen_url ? (
                      <>
                        {/* Estado de carga optimizado */}
                        {imageLoading[product.id] !== false && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                            <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                          </div>
                        )}
                        
                        <img 
                          src={product.imagen_url} 
                          alt={product.nombre}
                          loading="lazy"
                          decoding="async"
                          data-product-id={product.id}
                          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
                            imageLoading[product.id] === false ? 'opacity-100' : 'opacity-0'
                          }`}
                          onLoad={() => handleImageLoad(product.id)}
                          onError={() => handleImageError(product.id)}
                          style={{
                            willChange: 'transform',
                            backfaceVisibility: 'hidden'
                          }}
                          onLoadStart={() => {
                            // Timeout de 8 segundos para imágenes individuales
                            setTimeout(() => {
                              if (imageLoading[product.id] !== false) {
                                handleImageError(product.id);
                              }
                            }, 8000);
                          }}
                        />
                        
                        {/* Overlay gradiente sutil */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                        <div className="text-center">
                          <CategoryIcon className="h-16 w-16 text-blue-600 opacity-60 group-hover:opacity-80 transition-opacity duration-300 mx-auto mb-2" />
                          <p className="text-xs text-gray-500 font-medium">Imagen no disponible</p>
                        </div>
                    </div>
                    )}
                    
                    {/* Badge de Estado de Stock */}
                    <div className="absolute top-3 right-3">
                      <Badge variant={stockStatus.color as any} className="text-xs font-medium shadow-lg">
                        <stockStatus.icon className="h-3 w-3 mr-1" />
                        {stockStatus.status}
                      </Badge>
                    </div>

                    {/* Acciones Rápidas con Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-6">
                      <div className="flex space-x-3">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleQuickView(product)}
                          className="bg-white/90 hover:bg-white shadow-lg transform hover:scale-110 transition-all duration-200"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock_disponible === 0}
                          className="bg-blue-600 hover:bg-blue-700 shadow-lg transform hover:scale-110 transition-all duration-200"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Indicador de Cantidad en Carrito */}
                    {cartItem && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-blue-600 text-white shadow-lg">
                          {cartItem.cantidad} en carrito
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    {/* Información del Producto */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-bold text-gray-900 text-lg line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                          {product.nombre}
                        </h3>
                        <Badge variant="outline" className="text-xs font-medium border-blue-200 text-blue-700">
                          {product.marca}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {product.descripcion}
                      </p>
                      
                      {/* Rating y Reviews */}
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-semibold ml-1 text-gray-900">{product.rating}</span>
                          <span className="text-xs text-gray-500 ml-1">({product.reviews} reseñas)</span>
                        </div>
                      </div>
                    </div>

                    {/* Precio y Acciones */}
                    <div className="mt-6 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          ${product.precio.toFixed(2)}
                        </span>
                        <div className="text-sm text-gray-500">
                          Stock: <span className="font-medium">{product.stock_disponible} unidades</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {cartItem ? (
                          <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(product.id, cartItem.cantidad - 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              max={product.stock_disponible}
                              value={cartItem.cantidad}
                              onChange={(e) => {
                                const newQuantity = parseInt(e.target.value) || 1;
                                if (newQuantity >= 1 && newQuantity <= product.stock_disponible) {
                                  updateQuantity(product.id, newQuantity);
                                }
                              }}
                              onBlur={(e) => {
                                const newQuantity = parseInt(e.target.value) || 1;
                                if (newQuantity < 1) {
                                  updateQuantity(product.id, 1);
                                } else if (newQuantity > product.stock_disponible) {
                                  updateQuantity(product.id, product.stock_disponible);
                                }
                              }}
                              className="h-8 w-16 text-center font-semibold text-blue-600 border-blue-200 focus:border-blue-400 focus:ring-blue-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              title={`Cantidad (máximo: ${product.stock_disponible})`}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddToCart(product)}
                              disabled={product.stock_disponible === 0}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock_disponible === 0}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Agregar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Carrito Flotante */}
      {getCartItemCount() > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Tu Carrito</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/checkout'}
                className="text-blue-600 hover:text-blue-700"
              >
                Ver Todo
              </Button>
            </div>
            
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {cartItems && Array.isArray(cartItems) && (cartItems as CartItem[]).slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <Pill className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.nombre}</p>
                    <p className="text-xs text-gray-500">Cantidad: {item.cantidad}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-600">${(item.precio * item.cantidad).toFixed(2)}</p>
                  </div>
                </div>
              ))}
              {cartItems && Array.isArray(cartItems) && (cartItems as CartItem[]).length > 3 && (
                <div className="text-center text-sm text-gray-500 py-2">
                  +{(cartItems as CartItem[]).length - 3} productos más
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="text-xl font-bold text-green-600">${getTotalCart().toFixed(2)}</span>
              </div>
              <Button
                onClick={() => window.location.href = '/checkout'}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Proceder al Pago
              </Button>
            </div>
          </div>
        </div>
             )}
       
             {/* Toast de notificación */}
      {showToast && (
        <NotificationToast
          message={toastMessage}
          type="success"
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}

      {/* Modal de búsqueda por imagen */}
      <ImageSearchModal
        isOpen={showImageSearch}
        onClose={() => setShowImageSearch(false)}
        onSearchResults={handleImageSearchResults}
      />

      {/* Modal de escáner de código de barras */}
      <BarcodeScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onProductFound={handleBarcodeProductFound}
      />
    </div>
  );
}
