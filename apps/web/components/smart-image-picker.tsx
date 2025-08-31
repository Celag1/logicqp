"use client"

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Camera, Upload, Search, X, Image as ImageIcon } from 'lucide-react';
import { CameraCapture } from './camera-capture';

interface SmartImagePickerProps {
  onImageSelect: (imageData: string, source: 'upload' | 'camera' | 'search') => void;
  onClose: () => void;
  isOpen: boolean;
}

export function SmartImagePicker({ onImageSelect, onClose, isOpen }: SmartImagePickerProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'search'>('upload');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImageSelect(result, 'upload');
        onClose();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (imageData: string) => {
    onImageSelect(imageData, 'camera');
    setIsCameraOpen(false);
    onClose();
  };

  const handleImageSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Simulación de búsqueda de imágenes
      // En un caso real, aquí se integraría con una API de búsqueda de imágenes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Resultados simulados
      const mockResults = [
        'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Imagen+1',
        'https://via.placeholder.com/300x200/7C3AED/FFFFFF?text=Imagen+2',
        'https://via.placeholder.com/300x200/EC4899/FFFFFF?text=Imagen+3',
        'https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Imagen+4',
      ];
      
      setSearchResults(mockResults);
    } catch (error) {
      console.error('Error en la búsqueda:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    onImageSelect(imageUrl, 'search');
    onClose();
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Selector Inteligente de Imágenes</span>
              <Button onClick={onClose} variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tabs */}
            <div className="flex space-x-1 bg-muted p-1 rounded-lg">
              <Button
                variant={activeTab === 'upload' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('upload')}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Subir
              </Button>
              <Button
                variant={activeTab === 'camera' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('camera')}
                className="flex-1"
              >
                <Camera className="h-4 w-4 mr-2" />
                Cámara
              </Button>
              <Button
                variant={activeTab === 'search' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('search')}
                className="flex-1"
              >
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'upload' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Subir imagen</p>
                  <p className="text-gray-500 mb-4">
                    Arrastra y suelta una imagen aquí, o haz clic para seleccionar
                  </p>
                  <Button onClick={openFileDialog}>
                    Seleccionar Archivo
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    aria-label="Seleccionar archivo de imagen"
                  />
                </div>
              </div>
            )}

            {activeTab === 'camera' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Capturar con cámara</p>
                  <p className="text-gray-500 mb-4">
                    Usa la cámara de tu dispositivo para tomar una foto
                  </p>
                  <Button onClick={() => setIsCameraOpen(true)}>
                    Abrir Cámara
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'search' && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Buscar imágenes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleImageSearch()}
                  />
                  <Button onClick={handleImageSearch} disabled={isSearching}>
                    <Search className="h-4 w-4 mr-2" />
                    {isSearching ? 'Buscando...' : 'Buscar'}
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {searchResults.map((imageUrl, index) => (
                      <div
                        key={index}
                        className="relative group cursor-pointer rounded-lg overflow-hidden border hover:border-primary transition-colors"
                        onClick={() => handleImageSelect(imageUrl)}
                      >
                        <img
                          src={imageUrl}
                          alt={`Resultado ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchQuery && searchResults.length === 0 && !isSearching && (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No se encontraron resultados para "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Camera Capture Modal */}
      {isCameraOpen && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setIsCameraOpen(false)}
          isOpen={isCameraOpen}
        />
      )}
    </>
  );
}
