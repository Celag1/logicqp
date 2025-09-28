"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  X, 
  Mic, 
  MicOff, 
  Camera, 
  Filter, 
  Clock, 
  TrendingUp, 
  Sparkles,
  Loader2,
  ArrowRight,
  Package,
  Tag,
  Users,
  FileText
} from "lucide-react";
import { useAdvancedSearch } from "@/hooks/use-advanced-search";
import { SearchResult, SearchSuggestion } from "@/lib/services/advanced-search";

interface SmartSearchBarProps {
  onResultSelect?: (result: SearchResult) => void;
  onAdvancedSearch?: () => void;
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
  maxSuggestions?: number;
}

export default function SmartSearchBar({
  onResultSelect,
  onAdvancedSearch,
  placeholder = "Buscar con IA...",
  className = "",
  showSuggestions = true,
  maxSuggestions = 8
}: SmartSearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showVoiceIndicator, setShowVoiceIndicator] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    query,
    setQuery,
    results,
    suggestions,
    isSearching,
    isListening,
    startVoiceSearch,
    stopVoiceSearch,
    searchByImage,
    clearSearch,
    error
  } = useAdvancedSearch({
    debounceMs: 200,
    autoSearch: true,
    initialFilters: {
      limit: maxSuggestions
    }
  });

  // Manejar clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejar teclas
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'Enter' && results.length > 0) {
      onResultSelect?.(results[0]);
      setIsOpen(false);
    }
  };

  // Manejar cambio de query
  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      setIsOpen(true);
    }
  };

  // Manejar selección de resultado
  const handleResultSelect = (result: SearchResult) => {
    onResultSelect?.(result);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  // Manejar selección de sugerencia
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    inputRef.current?.focus();
  };

  // Búsqueda por voz
  const handleVoiceSearch = async () => {
    if (isListening) {
      stopVoiceSearch();
      return;
    }

    try {
      setShowVoiceIndicator(true);
      await startVoiceSearch();
    } catch (error) {
      console.error('Error en búsqueda por voz:', error);
    } finally {
      setShowVoiceIndicator(false);
    }
  };

  // Búsqueda por imagen
  const handleImageSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      searchByImage(file);
      setIsOpen(true);
    }
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
      case "product": return "text-blue-600";
      case "category": return "text-green-600";
      case "order": return "text-purple-600";
      case "user": return "text-orange-600";
      default: return "text-gray-600";
    }
  };

  const displayResults = results.slice(0, maxSuggestions);
  const displaySuggestions = suggestions.slice(0, maxSuggestions);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Barra de búsqueda principal */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-20"
        />
        
        {/* Indicadores de estado */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {isSearching && (
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          )}
          
          {isListening && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-red-600">Escuchando...</span>
            </div>
          )}
          
          {query && !isSearching && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Botones de búsqueda */}
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleVoiceSearch}
          className={`h-6 w-6 p-0 ${isListening ? 'text-red-600' : ''}`}
          disabled={isSearching}
        >
          {isListening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
        </Button>
        
        <label htmlFor="smart-image-search" className="cursor-pointer">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            asChild
          >
            <span>
              <Camera className="h-3 w-3" />
            </span>
          </Button>
        </label>
        <input
          id="smart-image-search"
          type="file"
          accept="image/*"
          onChange={handleImageSearch}
          className="hidden"
          aria-label="Búsqueda por imagen"
        />
      </div>

      {/* Panel de resultados */}
      {isOpen && showSuggestions && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg border">
          <CardContent className="p-0">
            <ScrollArea className="max-h-96">
              {error && (
                <div className="p-4 text-center text-red-600 text-sm">
                  <X className="h-4 w-4 mx-auto mb-2" />
                  {error}
                </div>
              )}

              {displayResults.length > 0 && (
                <div className="p-2">
                  <div className="flex items-center justify-between px-2 py-1 mb-2">
                    <span className="text-xs font-medium text-gray-600">
                      Resultados ({results.length})
                    </span>
                    <Badge variant="outline" className="text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      IA
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    {displayResults.map((result) => {
                      const Icon = getResultIcon(result.type);
                      const colorClass = getResultColor(result.type);
                      
                      return (
                        <div
                          key={result.id}
                          className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleResultSelect(result)}
                        >
                          <Icon className={`h-4 w-4 ${colorClass}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900 truncate">
                                {result.title}
                              </span>
                              {result.metadata?.price && (
                                <span className="text-xs text-green-600 font-medium">
                                  {formatPrice(result.metadata.price)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              {result.description}
                            </p>
                          </div>
                          <ArrowRight className="h-3 w-3 text-gray-400" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {displaySuggestions.length > 0 && displayResults.length === 0 && (
                <div className="p-2">
                  <div className="flex items-center space-x-2 px-2 py-1 mb-2">
                    <TrendingUp className="h-3 w-3 text-gray-400" />
                    <span className="text-xs font-medium text-gray-600">
                      Sugerencias
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    {displaySuggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleSuggestionSelect(suggestion)}
                      >
                        <Search className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {suggestion.text}
                        </span>
                        {suggestion.count && (
                          <Badge variant="secondary" className="text-xs">
                            {suggestion.count}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {displayResults.length === 0 && displaySuggestions.length === 0 && query && !isSearching && (
                <div className="p-4 text-center text-gray-500">
                  <Search className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">No se encontraron resultados</p>
                  <p className="text-xs">Intenta con otros términos</p>
                </div>
              )}

              {!query && (
                <div className="p-4 text-center text-gray-500">
                  <Sparkles className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Búsqueda inteligente con IA</p>
                  <p className="text-xs">Escribe, habla o sube una imagen</p>
                </div>
              )}

              {/* Acciones adicionales */}
              <div className="border-t p-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAdvancedSearch}
                  className="w-full"
                >
                  <Filter className="h-3 w-3 mr-1" />
                  Búsqueda Avanzada
                </Button>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
