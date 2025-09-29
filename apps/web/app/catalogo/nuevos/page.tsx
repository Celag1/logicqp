"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Search, 
  Filter, 
  Clock, 
  Package,
  TrendingUp,
  Eye,
  ShoppingCart,
  Heart,
  Share2,
  Grid,
  List,
  Calendar,
  Tag,
  Download
} from "lucide-react";
import UniversalExportButton from "@/components/universal-export-button";

interface NewProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isNew: boolean;
  addedDate: string;
  rating: number;
  reviews: number;
  stock: number;
  brand: string;
  tags: string[];
}

const mockNewProducts: NewProduct[] = [
  {
    id: "1",
    name: "Vitamina D3 Ultra",
    description: "Suplemento de vitamina D3 de alta concentración para fortalecer el sistema inmunológico",
    price: 45.99,
    category: "Vitaminas",
    image: "🧬",
    isNew: true,
    addedDate: "2024-01-20",
    rating: 4.8,
    reviews: 156,
    stock: 45,
    brand: "HealthMax",
    tags: ["nuevo", "vitamina", "inmunidad"]
  },
  {
    id: "2",
    name: "Termómetro Digital Avanzado",
    description: "Termómetro digital con pantalla LCD y memoria de lecturas",
    price: 89.99,
    category: "Equipos Médicos",
    image: "🌡️",
    isNew: true,
    addedDate: "2024-01-19",
    rating: 4.6,
    reviews: 89,
    stock: 23,
    brand: "MedTech",
    tags: ["nuevo", "termómetro", "digital"]
  },
  {
    id: "3",
    name: "Crema Hidratante Natural",
    description: "Crema hidratante con ingredientes 100% naturales para piel sensible",
    price: 32.50,
    category: "Cuidado Personal",
    image: "🧴",
    isNew: true,
    addedDate: "2024-01-18",
    rating: 4.9,
    reviews: 234,
    stock: 67,
    brand: "NaturalCare",
    tags: ["nuevo", "natural", "hidratante"]
  },
  {
    id: "4",
    name: "Multivitamínico Completo",
    description: "Complejo multivitamínico con 25 vitaminas y minerales esenciales",
    price: 67.99,
    category: "Vitaminas",
    image: "💊",
    isNew: true,
    addedDate: "2024-01-17",
    rating: 4.7,
    reviews: 178,
    stock: 34,
    brand: "VitaLife",
    tags: ["nuevo", "multivitamínico", "completo"]
  },
  {
    id: "5",
    name: "Monitor de Presión Arterial",
    description: "Monitor digital de presión arterial con brazalete ajustable",
    price: 125.00,
    category: "Equipos Médicos",
    image: "🩺",
    isNew: true,
    addedDate: "2024-01-16",
    rating: 4.5,
    reviews: 67,
    stock: 12,
    brand: "CardioCheck",
    tags: ["nuevo", "presión", "monitor"]
  },
  {
    id: "6",
    name: "Shampoo Anticaspa Premium",
    description: "Shampoo especializado para el tratamiento de la caspa con ingredientes activos",
    price: 28.99,
    category: "Cuidado Personal",
    image: "🧴",
    isNew: true,
    addedDate: "2024-01-15",
    rating: 4.4,
    reviews: 145,
    stock: 56,
    brand: "HairCare Pro",
    tags: ["nuevo", "shampoo", "anticaspa"]
  }
];

export default function NuevosProductosPage() {
  const [products, setProducts] = useState<NewProduct[]>(mockNewProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price' | 'rating' | 'name'>('newest');

  const categories = Array.from(new Set(products.map((p: any) => p.category)));

  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
      case 'price':
        return a.price - b.price;
      case 'rating':
        return b.rating - a.rating;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const getDaysSinceAdded = (addedDate: string) => {
    const now = new Date();
    const added = new Date(addedDate);
    const diffTime = now.getTime() - added.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Agotado', color: 'bg-red-100 text-red-800' };
    if (stock < 10) return { text: 'Poco stock', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'En stock', color: 'bg-green-100 text-green-800' };
  };

  const handleAddToCart = (product: NewProduct) => {
    console.log('Agregando al carrito:', product.name);
    // Aquí se implementaría la lógica para agregar al carrito
    alert(`Producto "${product.name}" agregado al carrito`);
  };

  const handleViewDetails = (product: NewProduct) => {
    console.log('Viendo detalles de:', product.name);
    // Aquí se implementaría la navegación a los detalles del producto
    alert(`Viendo detalles de "${product.name}"`);
  };

  const handleToggleFavorite = (product: NewProduct) => {
    console.log('Alternando favorito:', product.name);
    // Aquí se implementaría la lógica para marcar como favorito
    alert(`Producto "${product.name}" marcado como favorito`);
  };

  const handleShare = (product: NewProduct) => {
    console.log('Compartiendo:', product.name);
    // Aquí se implementaría la lógica para compartir
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href
      });
    } else {
      alert(`Compartiendo "${product.name}"`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nuevos Productos</h1>
              <p className="text-gray-600">Descubre los productos más recientes de nuestro catálogo</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Nuevos</p>
                  <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                </div>
                <Star className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Esta Semana</p>
                  <p className="text-2xl font-bold text-blue-600">{products.filter((p: any) => getDaysSinceAdded(p.addedDate) <= 7).length}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Precio Promedio</p>
                  <p className="text-2xl font-bold text-purple-600">${Math.round(products.reduce((sum: number, p: any) => sum + p.price, 0) / products.length)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rating Promedio</p>
                  <p className="text-2xl font-bold text-orange-600">{Math.ceil((products.reduce((sum: number, p: any) => sum + p.rating, 0) / products.length) * 100) / 100}</p>
                </div>
                <Package className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar productos nuevos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Filtrar por categoría"
                >
                  <option value="all">Todas las categorías</option>
                  {categories.map((category: string) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'price' | 'rating' | 'name')}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Ordenar por"
                >
                  <option value="newest">Más recientes</option>
                  <option value="price">Menor precio</option>
                  <option value="rating">Mejor rating</option>
                  <option value="name">Nombre A-Z</option>
                </select>
              </div>
              <div className="flex gap-2">
                <UniversalExportButton
                  data={filteredProducts}
                  title="Reporte de Nuevos Productos"
                  columns={[
                    { key: 'name', label: 'Nombre' },
                    { key: 'description', label: 'Descripción' },
                    { key: 'price', label: 'Precio', format: (value: number) => `$${value.toFixed(2)}` },
                    { key: 'category', label: 'Categoría' },
                    { key: 'brand', label: 'Marca' },
                    { key: 'rating', label: 'Rating', format: (value: number) => value.toFixed(2) },
                    { key: 'reviews', label: 'Reseñas', format: (value: number) => value.toString() },
                    { key: 'stock', label: 'Stock', format: (value: number) => value.toString() },
                    { key: 'addedDate', label: 'Fecha Agregado', format: (value: string) => new Date(value).toLocaleDateString('es-ES') }
                  ]}
                />
                <div className="flex border border-gray-300 rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product: any) => {
              const stockStatus = getStockStatus(product.stock);
              const daysSinceAdded = getDaysSinceAdded(product.addedDate);
              
              return (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{product.image}</div>
                        <div>
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className="bg-green-100 text-green-800">Nuevo</Badge>
                            <Badge className="bg-blue-100 text-blue-800">{product.category}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleToggleFavorite(product)}
                          title="Marcar como favorito"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleShare(product)}
                          title="Compartir producto"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{product.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Precio:</span>
                        <span className="text-xl font-bold text-blue-600">${product.price}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Marca:</span>
                        <span className="text-sm font-medium">{product.brand}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Rating:</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{product.rating}</span>
                          <span className="text-xs text-gray-500">({product.reviews})</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Stock:</span>
                        <Badge className={stockStatus.color}>{stockStatus.text}</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Agregado:</span>
                        <span className="text-sm">{daysSinceAdded} días atrás</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {product.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleViewDetails(product)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </Button>
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-1">
                      {product.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product: any) => {
              const stockStatus = getStockStatus(product.stock);
              const daysSinceAdded = getDaysSinceAdded(product.addedDate);
              
              return (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">{product.image}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                            <Badge className="bg-green-100 text-green-800">Nuevo</Badge>
                            <Badge className="bg-blue-100 text-blue-800">{product.category}</Badge>
                          </div>
                          <p className="text-gray-600 mb-2">{product.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span>{product.rating} ({product.reviews} reseñas)</span>
                            </span>
                            <span>{product.brand}</span>
                            <span>Agregado hace {daysSinceAdded} días</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-xl font-bold text-blue-600">${product.price}</div>
                          <Badge className={stockStatus.color}>{stockStatus.text}</Badge>
                        </div>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleToggleFavorite(product)}
                            title="Marcar como favorito"
                          >
                            <Heart className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleShare(product)}
                            title="Compartir producto"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewDetails(product)}
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {filteredProducts.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos nuevos</h3>
              <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
