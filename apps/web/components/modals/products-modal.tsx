"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  ShoppingCart, 
  Eye, 
  Star,
  Package,
  DollarSign,
  Percent,
  Tag,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  offerPrice: number;
  stock: number;
  category: string;
  image: string;
}

interface Offer {
  id: string;
  title: string;
  description: string;
  discount: number;
  originalPrice: number;
  offerPrice: number;
  category: string;
  image: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  productCount: number;
  views: number;
}

interface ProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: Offer | null;
  products: Product[];
}

export default function ProductsModal({ isOpen, onClose, offer, products }: ProductsModalProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  if (!isOpen || !offer) return null;

  const handleAddToCart = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const getDiscountPercentage = (originalPrice: number, offerPrice: number) => {
    return Math.round(((originalPrice - offerPrice) / originalPrice) * 100);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Package className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Productos de la Oferta
              </h2>
              <p className="text-sm text-gray-500">
                {offer.title} - {products.length} productos disponibles
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Offer Info */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <div className="flex items-center space-x-4">
            <div className="text-3xl">{offer.image}</div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{offer.title}</h3>
                <Badge className="bg-green-100 text-green-800">
                  {offer.discount}% OFF
                </Badge>
                <Badge className="bg-blue-100 text-blue-800">
                  {offer.category}
                </Badge>
              </div>
              <p className="text-gray-600 mb-2">{offer.description}</p>
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-gray-500">
                  Precio original: <span className="line-through">${offer.originalPrice}</span>
                </span>
                <span className="text-green-600 font-bold">
                  Precio oferta: ${offer.offerPrice}
                </span>
                <span className="text-gray-500">
                  Ahorro: ${(offer.originalPrice - offer.offerPrice).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const discount = getDiscountPercentage(product.price, product.offerPrice);
              const isSelected = selectedProducts.includes(product.id);
              
              return (
                <Card key={product.id} className={`relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="text-2xl">{product.image}</div>
                      <div className="flex space-x-1">
                        <Badge className="bg-red-100 text-red-800">
                          -{discount}%
                        </Badge>
                        <Badge className="bg-gray-100 text-gray-800">
                          {product.stock} en stock
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <p className="text-sm text-gray-500">{product.category}</p>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Precio original:</span>
                        <span className="text-sm line-through text-gray-400">${product.price}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Precio oferta:</span>
                        <span className="text-lg font-bold text-green-600">${product.offerPrice}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Ahorro:</span>
                        <span className="text-sm font-medium text-green-600">
                          ${(product.price - product.offerPrice).toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="pt-3 space-y-2">
                        <Button
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          className="w-full"
                          onClick={() => handleAddToCart(product.id)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {isSelected ? 'Agregado al carrito' : 'Agregar al carrito'}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            console.log('Ver detalles del producto:', product);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalles
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedProducts.length > 0 ? (
              <span className="flex items-center">
                <ShoppingCart className="h-4 w-4 mr-2" />
                {selectedProducts.length} producto(s) seleccionado(s)
              </span>
            ) : (
              <span>Selecciona productos para agregar al carrito</span>
            )}
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            {selectedProducts.length > 0 && (
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  console.log('Proceder al carrito con productos:', selectedProducts);
                  onClose();
                }}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Ir al carrito ({selectedProducts.length})
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
