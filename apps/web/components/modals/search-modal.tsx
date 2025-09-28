"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  X, 
  Search, 
  Filter, 
  Clock, 
  TrendingUp, 
  Star, 
  Package, 
  Users, 
  FileText, 
  Settings,
  ArrowRight,
  History,
  Zap,
  Tag,
  DollarSign,
  Calendar,
  MapPin
} from "lucide-react";

interface SearchResult {
  id: string;
  type: "product" | "category" | "user" | "order" | "page";
  title: string;
  description: string;
  url: string;
  category?: string;
  price?: number;
  rating?: number;
  inStock?: boolean;
  image?: string;
  tags?: string[];
  timestamp?: Date;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const searchCategories = [
  { value: "all", label: "Todo", icon: Search },
  { value: "products", label: "Productos", icon: Package },
  { value: "categories", label: "Categorías", icon: Tag },
  { value: "orders", label: "Pedidos", icon: FileText },
  { value: "users", label: "Usuarios", icon: Users },
  { value: "pages", label: "Páginas", icon: Settings }
];

const recentSearches = [
  "laptop gaming",
  "smartphone samsung",
  "auriculares bluetooth",
  "pedido PED-001",
  "usuario admin"
];

const popularSearches = [
  { term: "laptop", count: 1250 },
  { term: "smartphone", count: 980 },
  { term: "auriculares", count: 750 },
  { term: "tablet", count: 620 },
  { term: "smartwatch", count: 480 }
];

// Mock search results
const mockSearchResults: SearchResult[] = [
  {
    id: "1",
    type: "product",
    title: "Laptop Gaming ASUS ROG",
    description: "Laptop gaming de alto rendimiento con RTX 4060, 16GB RAM, 512GB SSD",
    url: "/catalogo/laptop-gaming-asus-rog",
    category: "Electrónicos",
    price: 1299.99,
    rating: 4.8,
    inStock: true,
    tags: ["gaming", "laptop", "asus", "rtx"]
  },
  {
    id: "2",
    type: "product",
    title: "Smartphone Samsung Galaxy S24",
    description: "Smartphone Android con cámara de 200MP, 256GB almacenamiento",
    url: "/catalogo/smartphone-samsung-galaxy-s24",
    category: "Electrónicos",
    price: 899.99,
    rating: 4.6,
    inStock: true,
    tags: ["smartphone", "samsung", "android", "camera"]
  },
  {
    id: "3",
    type: "category",
    title: "Electrónicos",
    description: "Categoría de productos electrónicos y tecnología",
    url: "/catalogo/categorias/electronicos",
    category: "Categorías",
    tags: ["electronicos", "tecnologia", "gadgets"]
  },
  {
    id: "4",
    type: "order",
    title: "Pedido #PED-001",
    description: "Pedido del 15 de enero - Estado: En tránsito",
    url: "/mis-pedidos",
    category: "Pedidos",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    tags: ["pedido", "envio", "tracking"]
  },
  {
    id: "5",
    type: "user",
    title: "Juan Pérez",
    description: "Usuario administrador - Última actividad: Hace 2 horas",
    url: "/usuarios/juan-perez",
    category: "Usuarios",
    tags: ["usuario", "admin", "activo"]
  }
];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Simulate search with debouncing
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const filteredResults = mockSearchResults.filter(result => {
      const matchesQuery = result.title.toLowerCase().includes(query.toLowerCase()) ||
                          result.description.toLowerCase().includes(query.toLowerCase()) ||
                          result.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
      
      const matchesCategory = selectedCategory === "all" || result.type === selectedCategory;
      
      return matchesQuery && matchesCategory;
    });
    
    setSearchResults(filteredResults);
    setShowResults(true);
    setIsSearching(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleQuickSearch = (term: string) => {
    setSearchQuery(term);
    inputRef.current?.focus();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case "product": return Package;
      case "category": return Tag;
      case "order": return FileText;
      case "user": return Users;
      case "page": return Settings;
      default: return Search;
    }
  };

  const getResultColor = (type: string) => {
    switch (type) {
      case "product": return "bg-blue-100 text-blue-800";
      case "category": return "bg-green-100 text-green-800";
      case "order": return "bg-purple-100 text-purple-800";
      case "user": return "bg-orange-100 text-orange-800";
      case "page": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col">
        <CardHeader className="flex-shrink-0 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                <Search className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Búsqueda Avanzada</CardTitle>
                <CardDescription>Encuentra productos, pedidos, usuarios y más</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Search Input */}
          <div className="p-4 border-b">
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  ref={inputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos, pedidos, usuarios..."
                  className="pl-10 pr-4"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  {searchCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4" />
                          <span>{category.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <ScrollArea className="flex-1">
            {!showResults && !searchQuery ? (
              /* Empty State - Show suggestions */
              <div className="p-6">
                {/* Recent Searches */}
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <History className="h-4 w-4 mr-2" />
                    Búsquedas Recientes
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickSearch(search)}
                        className="text-xs"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {search}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Popular Searches */}
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Búsquedas Populares
                  </h3>
                  <div className="space-y-2">
                    {popularSearches.map((search, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleQuickSearch(search.term)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                          </div>
                          <span className="text-sm text-gray-900">{search.term}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {search.count} búsquedas
                          </Badge>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <Zap className="h-4 w-4 mr-2" />
                    Acciones Rápidas
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center space-y-2"
                      onClick={() => handleQuickSearch("laptop")}
                    >
                      <Package className="h-6 w-6" />
                      <span className="text-xs">Productos</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center space-y-2"
                      onClick={() => handleQuickSearch("pedido")}
                    >
                      <FileText className="h-6 w-6" />
                      <span className="text-xs">Pedidos</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center space-y-2"
                      onClick={() => handleQuickSearch("usuario")}
                    >
                      <Users className="h-6 w-6" />
                      <span className="text-xs">Usuarios</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center space-y-2"
                      onClick={() => handleQuickSearch("categoria")}
                    >
                      <Tag className="h-6 w-6" />
                      <span className="text-xs">Categorías</span>
                    </Button>
                  </div>
                </div>
              </div>
            ) : showResults ? (
              /* Search Results */
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-700">
                    {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} para "{searchQuery}"
                  </h3>
                  {searchResults.length > 0 && (
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      Filtros Avanzados
                    </Button>
                  )}
                </div>

                {searchResults.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron resultados</h3>
                    <p className="text-gray-500 mb-4">Intenta con términos de búsqueda diferentes</p>
                    <Button variant="outline" onClick={() => setSearchQuery("")}>
                      Limpiar búsqueda
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {searchResults.map((result) => {
                      const Icon = getResultIcon(result.type);
                      const colorClass = getResultColor(result.type);
                      
                      return (
                        <div
                          key={result.id}
                          className="p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {result.title}
                                </h4>
                                <div className="flex items-center space-x-2">
                                  {result.price && (
                                    <span className="text-sm font-semibold text-green-600">
                                      {formatPrice(result.price)}
                                    </span>
                                  )}
                                  {result.rating && (
                                    <div className="flex items-center space-x-1">
                                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                      <span className="text-xs text-gray-500">{result.rating}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {result.description}
                              </p>
                              
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center space-x-2">
                                  {result.category && (
                                    <Badge variant="secondary" className="text-xs">
                                      {result.category}
                                    </Badge>
                                  )}
                                  {result.inStock !== undefined && (
                                    <Badge 
                                      variant={result.inStock ? "default" : "destructive"}
                                      className="text-xs"
                                    >
                                      {result.inStock ? "En Stock" : "Sin Stock"}
                                    </Badge>
                                  )}
                                  {result.tags && result.tags.slice(0, 2).map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                                
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                  <ArrowRight className="h-3 w-3" />
                                  <span>Ver detalles</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
