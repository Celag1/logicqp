"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  X, 
  Search, 
  Filter, 
  Mic, 
  MicOff,
  Camera,
  Image as ImageIcon,
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
  MapPin,
  Volume2,
  VolumeX,
  Loader2,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Sparkles
} from "lucide-react";
import { advancedSearchService, AdvancedSearchFilters, SearchResult, SearchSuggestion, SearchHistory } from "@/lib/services/advanced-search";

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResultSelect?: (result: SearchResult) => void;
}

export default function AdvancedSearchModal({ isOpen, onClose, onResultSelect }: AdvancedSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [popularSearches, setPopularSearches] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  
  // Filtros avanzados
  const [filters, setFilters] = useState<AdvancedSearchFilters>({
    query: "",
    sortBy: 'relevance',
    sortOrder: 'desc',
    limit: 20
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      loadInitialData();
    }
  }, [isOpen]);

  // Búsqueda con debouncing
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters]);

  // Cargar datos iniciales
  const loadInitialData = async () => {
    try {
      const [history, popular] = await Promise.all([
        Promise.resolve(advancedSearchService.getSearchHistory()),
        advancedSearchService.getPopularSearches()
      ]);
      
      setSearchHistory(history);
      setPopularSearches(popular);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    }
  };

  // Realizar búsqueda
  const performSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    
    try {
      const searchFilters = {
        ...filters,
        query: searchQuery
      };

      const { results, total, suggestions: searchSuggestions, searchTime: time } = await advancedSearchService.search(searchFilters);
      
      setSearchResults(results);
      setSuggestions(searchSuggestions);
      setTotalResults(total);
      setSearchTime(time);
      setShowResults(true);
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Búsqueda por voz
  const startVoiceSearch = async () => {
    if (isListening) {
      stopVoiceSearch();
      return;
    }

    try {
      setIsListening(true);
      const transcript = await advancedSearchService.searchByVoice();
      setSearchQuery(transcript);
    } catch (error) {
      console.error('Error en búsqueda por voz:', error);
    } finally {
      setIsListening(false);
    }
  };

  const stopVoiceSearch = () => {
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Búsqueda por imagen
  const handleImageSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsSearching(true);
      const results = await advancedSearchService.searchByImage(file);
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Error en búsqueda por imagen:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Manejar selección de sugerencia
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text);
    inputRef.current?.focus();
  };

  // Manejar selección de historial
  const handleHistorySelect = (history: SearchHistory) => {
    setSearchQuery(history.query);
    inputRef.current?.focus();
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Obtener icono de resultado
  const getResultIcon = (type: string) => {
    switch (type) {
      case "product": return Package;
      case "category": return Tag;
      case "order": return FileText;
      case "user": return Users;
      default: return Search;
    }
  };

  // Obtener color de resultado
  const getResultColor = (type: string) => {
    switch (type) {
      case "product": return "bg-blue-100 text-blue-800";
      case "category": return "bg-green-100 text-green-800";
      case "order": return "bg-purple-100 text-purple-800";
      case "user": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Búsqueda Avanzada con IA</CardTitle>
                <CardDescription>Encuentra productos, pedidos, usuarios y más con inteligencia artificial</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-1" />
                Filtros
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Barra de búsqueda principal */}
          <div className="p-4 border-b">
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  ref={inputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar con IA: productos, pedidos, usuarios..."
                  className="pl-10 pr-20"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  </div>
                )}
              </div>
              
              {/* Botones de búsqueda */}
              <div className="flex space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startVoiceSearch}
                  className={isListening ? "bg-red-100 text-red-600" : ""}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                
                <label htmlFor="image-search" className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Camera className="h-4 w-4" />
                    </span>
                  </Button>
                </label>
                <input
                  id="image-search"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSearch}
                  className="hidden"
                  aria-label="Búsqueda por imagen"
                />
                
                {searchQuery && (
                  <Button variant="outline" size="sm" onClick={clearSearch}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Filtros rápidos */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Ordenar por</label>
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value) => setFilters({...filters, sortBy: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevancia</SelectItem>
                        <SelectItem value="price">Precio</SelectItem>
                        <SelectItem value="name">Nombre</SelectItem>
                        <SelectItem value="rating">Calificación</SelectItem>
                        <SelectItem value="date">Fecha</SelectItem>
                        <SelectItem value="popularity">Popularidad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Orden</label>
                    <Select
                      value={filters.sortOrder}
                      onValueChange={(value) => setFilters({...filters, sortOrder: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Descendente</SelectItem>
                        <SelectItem value="asc">Ascendente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="in-stock"
                      checked={filters.inStock || false}
                      onCheckedChange={(checked) => setFilters({...filters, inStock: checked})}
                    />
                    <label htmlFor="in-stock" className="text-sm font-medium">
                      Solo en stock
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          <ScrollArea className="flex-1">
            {!showResults && !searchQuery ? (
              /* Estado vacío - Mostrar sugerencias */
              <div className="p-6">
                <Tabs defaultValue="suggestions" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="suggestions">Sugerencias</TabsTrigger>
                    <TabsTrigger value="history">Historial</TabsTrigger>
                    <TabsTrigger value="popular">Populares</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="suggestions" className="mt-4">
                    <div className="space-y-6">
                      {/* Sugerencias de IA */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                          <Lightbulb className="h-4 w-4 mr-2" />
                          Sugerencias Inteligentes
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <Button
                            variant="outline"
                            className="h-auto p-4 flex flex-col items-center space-y-2"
                            onClick={() => setSearchQuery("laptop gaming")}
                          >
                            <Package className="h-6 w-6" />
                            <span className="text-xs">Laptops Gaming</span>
                          </Button>
                          <Button
                            variant="outline"
                            className="h-auto p-4 flex flex-col items-center space-y-2"
                            onClick={() => setSearchQuery("smartphone samsung")}
                          >
                            <Package className="h-6 w-6" />
                            <span className="text-xs">Smartphones</span>
                          </Button>
                          <Button
                            variant="outline"
                            className="h-auto p-4 flex flex-col items-center space-y-2"
                            onClick={() => setSearchQuery("auriculares bluetooth")}
                          >
                            <Package className="h-6 w-6" />
                            <span className="text-xs">Auriculares</span>
                          </Button>
                          <Button
                            variant="outline"
                            className="h-auto p-4 flex flex-col items-center space-y-2"
                            onClick={() => setSearchQuery("pedido reciente")}
                          >
                            <FileText className="h-6 w-6" />
                            <span className="text-xs">Pedidos</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="history" className="mt-4">
                    <div className="space-y-2">
                      {searchHistory.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No hay búsquedas recientes</p>
                      ) : (
                        searchHistory.map((history) => (
                          <div
                            key={history.id}
                            className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleHistorySelect(history)}
                          >
                            <div className="flex items-center space-x-3">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900">{history.query}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className="text-xs">
                                {history.resultCount} resultados
                              </Badge>
                              <ArrowRight className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="popular" className="mt-4">
                    <div className="space-y-2">
                      {popularSearches.map((search) => (
                        <div
                          key={search.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleSuggestionSelect(search)}
                        >
                          <div className="flex items-center space-x-3">
                            <TrendingUp className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{search.text}</span>
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
                  </TabsContent>
                </Tabs>
              </div>
            ) : showResults ? (
              /* Resultados de búsqueda */
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">
                      {totalResults} resultado{totalResults !== 1 ? 's' : ''} para "{searchQuery}"
                    </h3>
                    <p className="text-xs text-gray-500">
                      Encontrado en {searchTime}ms
                    </p>
                  </div>
                  {searchResults.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        <Sparkles className="h-3 w-3 mr-1" />
                        IA Powered
                      </Badge>
                    </div>
                  )}
                </div>

                {searchResults.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron resultados</h3>
                    <p className="text-gray-500 mb-4">Intenta con términos de búsqueda diferentes o usa búsqueda por voz</p>
                    <div className="flex justify-center space-x-2">
                      <Button variant="outline" onClick={clearSearch}>
                        Limpiar búsqueda
                      </Button>
                      <Button variant="outline" onClick={startVoiceSearch}>
                        <Mic className="h-4 w-4 mr-1" />
                        Búsqueda por voz
                      </Button>
                    </div>
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
                          onClick={() => onResultSelect?.(result)}
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
                                  {result.metadata?.price && (
                                    <span className="text-sm font-semibold text-green-600">
                                      {formatPrice(result.metadata.price)}
                                    </span>
                                  )}
                                  {result.metadata?.rating && (
                                    <div className="flex items-center space-x-1">
                                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                      <span className="text-xs text-gray-500">{result.metadata.rating}</span>
                                    </div>
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    {Math.round(result.relevance * 100)}% relevancia
                                  </Badge>
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {result.description}
                              </p>
                              
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center space-x-2">
                                  {result.metadata?.category && (
                                    <Badge variant="secondary" className="text-xs">
                                      {result.metadata.category}
                                    </Badge>
                                  )}
                                  {result.metadata?.inStock !== undefined && (
                                    <Badge 
                                      variant={result.metadata.inStock ? "default" : "destructive"}
                                      className="text-xs"
                                    >
                                      {result.metadata.inStock ? "En Stock" : "Sin Stock"}
                                    </Badge>
                                  )}
                                  {result.metadata?.tags && result.metadata.tags.slice(0, 2).map((tag, index) => (
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
