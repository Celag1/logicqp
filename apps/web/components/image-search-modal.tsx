"use client";

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Camera, 
  Upload, 
  Search, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Image as ImageIcon,
  Sparkles,
  Eye,
  ShoppingCart
} from 'lucide-react';
import { useSafeCart } from '@/hooks/useSafeCart';
import { playAddToCartSound, triggerHapticFeedback } from '@/components/sound-effects';

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

interface ImageSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearchResults: (results: Product[]) => void;
}

interface SearchResult {
  product: Product;
  confidence: number;
  matchedFeatures: string[];
}

export default function ImageSearchModal({ isOpen, onClose, onSearchResults }: ImageSearchModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addItem } = useSafeCart();

  // Simulación de productos para búsqueda
  const mockProducts: Product[] = [
    {
      id: "1",
      codigo: "QPH-001",
      nombre: "Paracetamol 500mg",
      descripcion: "Analgésico y antipirético",
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
      descripcion: "Antiinflamatorio no esteroideo",
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
      descripcion: "Suplemento vitamínico",
      precio: 4.80,
      marca: "Qualipharm",
      categoria: "Vitaminas",
      stock_disponible: 200,
      rating: 4.9,
      reviews: 203,
      imagen_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop&crop=center&q=80&auto=format"
    }
  ];

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('La imagen es demasiado grande. Máximo 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const analyzeImage = async () => {
    if (!uploadedImage) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Simular análisis de imagen con IA
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simular resultados de búsqueda basados en la imagen
      const mockResults: SearchResult[] = mockProducts.map((product, index) => ({
        product,
        confidence: Math.random() * 0.4 + 0.6, // 60-100% confidence
        matchedFeatures: [
          'Forma de pastilla',
          'Color del empaque',
          'Texto visible',
          'Tamaño del producto'
        ].slice(0, Math.floor(Math.random() * 3) + 2)
      })).sort((a, b) => b.confidence - a.confidence);

      setSearchResults(mockResults);
      onSearchResults(mockResults.map(r => r.product));
      
      console.log('🔍 Análisis de imagen completado:', mockResults);
    } catch (err) {
      setError('Error al analizar la imagen. Inténtalo de nuevo.');
      console.error('Error analyzing image:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addToCart = (product: Product) => {
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
    
    playAddToCartSound();
    triggerHapticFeedback();
  };

  const resetModal = () => {
    setUploadedImage(null);
    setSearchResults([]);
    setError(null);
    setIsAnalyzing(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Camera className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Búsqueda por Imagen</h2>
                <p className="text-sm text-gray-600">Sube una imagen para encontrar productos similares</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          {!uploadedImage ? (
            /* Upload Area */
            <div
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Arrastra y suelta tu imagen aquí
                  </h3>
                  <p className="text-gray-600 mb-4">
                    O haz clic para seleccionar un archivo
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Seleccionar Imagen
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Formatos soportados: JPG, PNG, WebP (máx. 10MB)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                aria-label="Seleccionar imagen para búsqueda"
                title="Seleccionar imagen para búsqueda"
              />
            </div>
          ) : (
            /* Image Preview and Analysis */
            <div className="space-y-6">
              {/* Image Preview */}
              <div className="relative">
                <img
                  src={uploadedImage}
                  alt="Imagen subida"
                  className="w-full h-64 object-cover rounded-2xl"
                />
                <div className="absolute top-4 right-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setUploadedImage(null)}
                    className="bg-white/90 hover:bg-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Analysis Button */}
              <div className="text-center">
                <Button
                  onClick={analyzeImage}
                  disabled={isAnalyzing}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Analizando imagen...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Analizar con IA
                    </>
                  )}
                </Button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-red-800">{error}</span>
                </div>
              )}

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Productos encontrados ({searchResults.length})
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchResults.map((result, index) => (
                      <Card key={result.product.id} className="group hover:shadow-lg transition-all duration-200">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Product Image */}
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                              {result.product.imagen_url ? (
                                <img
                                  src={result.product.imagen_url}
                                  alt={result.product.nombre}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="space-y-2">
                              <h4 className="font-semibold text-gray-900 line-clamp-2">
                                {result.product.nombre}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {result.product.marca} • {result.product.categoria}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-green-600">
                                  ${result.product.precio.toFixed(2)}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {Math.round(result.confidence * 100)}% match
                                </Badge>
                              </div>
                            </div>

                            {/* Matched Features */}
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-gray-700">Características detectadas:</p>
                              <div className="flex flex-wrap gap-1">
                                {result.matchedFeatures.map((feature, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => addToCart(result.product)}
                              >
                                <ShoppingCart className="h-4 w-4 mr-1" />
                                Agregar
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="px-3"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
