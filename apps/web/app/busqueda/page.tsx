"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Clock, 
  Star, 
  FileText, 
  Package, 
  Users, 
  BarChart3,
  Settings,
  ShoppingCart,
  TrendingUp,
  Calendar,
  Tag,
  ArrowRight,
  X
} from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'product' | 'user' | 'order' | 'report' | 'setting';
  category: string;
  relevance: number;
  lastModified: Date;
  tags: string[];
}

const mockResults: SearchResult[] = [
  {
    id: "1",
    title: "Producto: Laptop Dell Inspiron 15",
    description: "Laptop Dell Inspiron 15 3000 con procesador Intel Core i5, 8GB RAM, 256GB SSD",
    type: 'product',
    category: "Electrónicos",
    relevance: 95,
    lastModified: new Date('2024-01-15'),
    tags: ["laptop", "dell", "intel", "computadora"]
  },
  {
    id: "2",
    title: "Usuario: María González",
    description: "Cliente VIP con 15 pedidos completados. Email: maria.gonzalez@email.com",
    type: 'user',
    category: "Clientes",
    relevance: 88,
    lastModified: new Date('2024-01-14'),
    tags: ["cliente", "vip", "activo"]
  },
  {
    id: "3",
    title: "Orden: #ORD-2024-001",
    description: "Pedido de 3 productos por $1,250.00. Estado: En proceso",
    type: 'order',
    category: "Ventas",
    relevance: 92,
    lastModified: new Date('2024-01-16'),
    tags: ["orden", "venta", "proceso"]
  },
  {
    id: "4",
    title: "Reporte: Ventas Mensuales",
    description: "Análisis de ventas del mes de enero 2024 con gráficos y estadísticas",
    type: 'report',
    category: "Reportes",
    relevance: 85,
    lastModified: new Date('2024-01-10'),
    tags: ["reporte", "ventas", "análisis", "enero"]
  },
  {
    id: "5",
    title: "Configuración: Notificaciones",
    description: "Configuración de alertas y notificaciones del sistema",
    type: 'setting',
    category: "Sistema",
    relevance: 78,
    lastModified: new Date('2024-01-12'),
    tags: ["configuración", "notificaciones", "alertas"]
  }
];

const searchFilters = [
  { id: 'all', label: 'Todo', count: 156 },
  { id: 'product', label: 'Productos', count: 45 },
  { id: 'user', label: 'Usuarios', count: 23 },
  { id: 'order', label: 'Órdenes', count: 67 },
  { id: 'report', label: 'Reportes', count: 12 },
  { id: 'setting', label: 'Configuración', count: 9 }
];

const recentSearches = [
  "laptop dell",
  "ventas enero",
  "cliente maria",
  "orden 2024",
  "configuración sistema"
];

const popularSearches = [
  "inventario bajo",
  "clientes vip",
  "reporte ventas",
  "configuración email",
  "productos más vendidos"
];

export default function BusquedaPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setSearchQuery(query);
    
    // Simular búsqueda
    setTimeout(() => {
      const filteredResults = mockResults.filter(result => {
        const matchesQuery = result.title.toLowerCase().includes(query.toLowerCase()) ||
                           result.description.toLowerCase().includes(query.toLowerCase()) ||
                           result.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
        const matchesFilter = selectedFilter === 'all' || result.type === selectedFilter;
        return matchesQuery && matchesFilter;
      });
      
      setResults(filteredResults);
      setIsSearching(false);
    }, 1000);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product': return Package;
      case 'user': return Users;
      case 'order': return ShoppingCart;
      case 'report': return BarChart3;
      case 'setting': return Settings;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'product': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      case 'order': return 'bg-purple-100 text-purple-800';
      case 'report': return 'bg-orange-100 text-orange-800';
      case 'setting': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'product': return 'Producto';
      case 'user': return 'Usuario';
      case 'order': return 'Orden';
      case 'report': return 'Reporte';
      case 'setting': return 'Configuración';
      default: return 'Otro';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Search className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Búsqueda Avanzada</h1>
              <p className="text-gray-600">Encuentra cualquier información en tu sistema</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Search Interface */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Buscar productos, usuarios, órdenes, reportes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                      className="pl-10 pr-4 py-3 text-lg"
                    />
                  </div>
                  <Button 
                    onClick={() => handleSearch(searchQuery)}
                    disabled={!searchQuery.trim() || isSearching}
                    size="lg"
                  >
                    {isSearching ? "Buscando..." : "Buscar"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowFilters(!showFilters)}
                    size="lg"
                  >
                    <Filter className="h-5 w-5 mr-2" />
                    Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            {showFilters && (
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {searchFilters.map((filter) => (
                      <Button
                        key={filter.id}
                        variant={selectedFilter === filter.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedFilter(filter.id)}
                      >
                        {filter.label}
                        <Badge variant="secondary" className="ml-2">
                          {filter.count}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Search Results */}
            {results.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Resultados de búsqueda</span>
                    <Badge variant="outline">{results.length} encontrados</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {results.map((result) => {
                      const Icon = getTypeIcon(result.type);
                      return (
                        <div
                          key={result.id}
                          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Icon className="h-5 w-5 text-gray-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                  {result.title}
                                </h3>
                                <Badge className={getTypeColor(result.type)}>
                                  {getTypeLabel(result.type)}
                                </Badge>
                                <Badge variant="outline">
                                  {result.relevance}% relevancia
                                </Badge>
                              </div>
                              <p className="text-gray-600 mb-2">{result.description}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span className="flex items-center space-x-1">
                                  <Tag className="h-4 w-4" />
                                  <span>{result.category}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{result.lastModified.toLocaleDateString()}</span>
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {result.tags.map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {searchQuery && results.length === 0 && !isSearching && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron resultados</h3>
                  <p className="text-gray-500">Intenta con otros términos de búsqueda o ajusta los filtros</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Searches */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Búsquedas Recientes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentSearches.map((search, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start text-left"
                    onClick={() => {
                      setSearchQuery(search);
                      handleSearch(search);
                    }}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {search}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Popular Searches */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Búsquedas Populares</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {popularSearches.map((search, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left"
                    onClick={() => {
                      setSearchQuery(search);
                      handleSearch(search);
                    }}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    {search}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Search Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Consejos de Búsqueda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <p>• Usa comillas para búsquedas exactas</p>
                <p>• Combina términos con "AND" o "OR"</p>
                <p>• Usa filtros para refinar resultados</p>
                <p>• Busca por tags o categorías</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
