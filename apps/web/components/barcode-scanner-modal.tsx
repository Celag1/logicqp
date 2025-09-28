"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Camera, 
  Barcode, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Search,
  ShoppingCart,
  Eye,
  Flashlight,
  FlashlightOff,
  RotateCcw,
  Zap
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

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductFound: (product: Product) => void;
}

interface ScanResult {
  code: string;
  format: string;
  confidence: number;
}

export default function BarcodeScannerModal({ isOpen, onClose, onProductFound }: BarcodeScannerModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { addItem } = useSafeCart();

  // Simulación de base de datos de productos por código de barras
  const mockProducts: Product[] = [
    {
      id: "1",
      codigo: "QPH001",
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
      codigo: "QPH002",
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
      codigo: "QPH003",
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

  // Inicializar cámara
  const initializeCamera = async () => {
    try {
      setError(null);
      setIsScanning(true);

      const constraints = {
        video: {
          facingMode: 'environment', // Cámara trasera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setCameraPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Iniciar detección de códigos de barras
      startBarcodeDetection();
      
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('No se pudo acceder a la cámara. Verifica los permisos.');
      setCameraPermission(false);
      setIsScanning(false);
    }
  };

  // Detener cámara
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsScanning(false);
  };

  // Detección de códigos de barras (simulada)
  const startBarcodeDetection = () => {
    scanIntervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        detectBarcode();
      }
    }, 100); // Detectar cada 100ms
  };

  // Simulación de detección de código de barras
  const detectBarcode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Configurar canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Dibujar frame actual
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Simular detección de código de barras (en producción usarías QuaggaJS, ZXing, etc.)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const detectedCode = simulateBarcodeDetection(imageData);

    if (detectedCode && detectedCode !== scannedCode) {
      setScannedCode(detectedCode);
      handleBarcodeDetected(detectedCode);
    }
  };

  // Simulación de detección de código de barras
  const simulateBarcodeDetection = (imageData: ImageData): string | null => {
    // Simular detección basada en patrones de píxeles
    const data = imageData.data;
    let hasPattern = false;
    
    // Buscar patrones que simulen códigos de barras
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Detectar líneas verticales (simulando código de barras)
      if (r < 100 && g < 100 && b < 100) {
        hasPattern = true;
        break;
      }
    }

    // Simular detección aleatoria cada cierto tiempo
    if (hasPattern && Math.random() < 0.01) { // 1% de probabilidad por frame
      const codes = ['QPH001', 'QPH002', 'QPH003'];
      return codes[Math.floor(Math.random() * codes.length)];
    }

    return null;
  };

  // Manejar código de barras detectado
  const handleBarcodeDetected = async (code: string) => {
    setIsProcessing(true);
    
    // Simular procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Buscar producto por código
    const product = mockProducts.find(p => p.codigo === code);
    
    if (product) {
      const result: ScanResult = {
        code,
        format: 'EAN-13',
        confidence: 0.95
      };
      
      setScanResults(prev => [result, ...prev.slice(0, 4)]); // Mantener últimos 5
      onProductFound(product);
      
      // Efectos de sonido y vibración
      playAddToCartSound();
      triggerHapticFeedback();
      
      console.log('🔍 Código de barras detectado:', code, product);
    } else {
      setError(`Producto no encontrado para el código: ${code}`);
    }
    
    setIsProcessing(false);
  };

  // Agregar producto al carrito
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

  // Limpiar estado
  const resetScanner = () => {
    setScannedCode(null);
    setScanResults([]);
    setError(null);
    setIsProcessing(false);
  };

  // Cerrar modal
  const handleClose = () => {
    stopCamera();
    resetScanner();
    onClose();
  };

  // Efectos
  useEffect(() => {
    if (isOpen) {
      initializeCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-sm text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Barcode className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Escáner de Código de Barras</h2>
            <p className="text-sm text-gray-300">Apunta la cámara al código de barras</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="text-white hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Área de cámara */}
      <div className="flex-1 relative bg-black">
        {cameraPermission === false ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
              <h3 className="text-xl font-semibold mb-2">Cámara no disponible</h3>
              <p className="text-gray-300 mb-4">No se pudo acceder a la cámara</p>
              <Button
                onClick={initializeCamera}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Camera className="h-4 w-4 mr-2" />
                Intentar de nuevo
              </Button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            
            {/* Overlay de escaneo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-32 border-2 border-white rounded-lg relative">
                {/* Líneas de escaneo animadas */}
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>
                
                {/* Esquinas */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white rounded-br-lg"></div>
              </div>
            </div>

            {/* Controles */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-4">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setFlashlightOn(!flashlightOn)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                {flashlightOn ? <FlashlightOff className="h-5 w-5" /> : <Flashlight className="h-5 w-5" />}
              </Button>
              
              <Button
                variant="secondary"
                size="lg"
                onClick={resetScanner}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
            </div>

            {/* Estado de procesamiento */}
            {isProcessing && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                  <p className="text-gray-900 font-medium">Procesando código...</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Panel de resultados */}
      {scanResults.length > 0 && (
        <div className="bg-white border-t border-gray-200 max-h-48 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Zap className="h-4 w-4 mr-2 text-green-600" />
              Códigos escaneados ({scanResults.length})
            </h3>
            
            <div className="space-y-2">
              {scanResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Barcode className="h-4 w-4 text-gray-600" />
                    <span className="font-mono text-sm">{result.code}</span>
                    <Badge variant="outline" className="text-xs">
                      {result.format}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-gray-600">
                      {Math.round(result.confidence * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border-t border-red-200 p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}

