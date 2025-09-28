"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  X, 
  Camera, 
  Package, 
  Plus, 
  Minus, 
  CheckCircle, 
  AlertTriangle, 
  Search,
  History,
  TrendingUp,
  AlertCircle,
  Loader2,
  Scan,
  QrCode,
  BarChart3,
  Clock,
  MapPin,
  User,
  Calendar,
  DollarSign,
  Zap
} from "lucide-react";
import { barcodeInventoryService, BarcodeProduct, BarcodeScanResult, InventoryMovement } from "@/lib/services/barcode-inventory";
import { BarcodeGenerator } from "@/components/barcode/BarcodeGenerator";

interface BarcodeInventoryScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onProductScanned?: (result: BarcodeScanResult) => void;
  mode?: 'scan' | 'entry' | 'exit' | 'adjustment';
  userId: string;
}

export default function BarcodeInventoryScanner({
  isOpen,
  onClose,
  onProductScanned,
  mode = 'scan',
  userId
}: BarcodeInventoryScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [scanResult, setScanResult] = useState<BarcodeScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [movementHistory, setMovementHistory] = useState<InventoryMovement[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<BarcodeProduct[]>([]);
  
  // Estados para entrada de inventario
  const [entryQuantity, setEntryQuantity] = useState(1);
  const [entrySupplier, setEntrySupplier] = useState('');
  const [entryBatch, setEntryBatch] = useState('');
  const [entryExpirationDate, setEntryExpirationDate] = useState('');
  const [entryCost, setEntryCost] = useState(0);
  const [entryLocation, setEntryLocation] = useState('');
  const [entryNotes, setEntryNotes] = useState('');
  
  // Estados para salida de inventario
  const [exitQuantity, setExitQuantity] = useState(1);
  const [exitReason, setExitReason] = useState('');
  const [exitLocation, setExitLocation] = useState('');
  const [exitNotes, setExitNotes] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  // Limpiar al cerrar
  useEffect(() => {
    if (!isOpen) {
      stopScanning();
      resetForm();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      const [history, lowStock] = await Promise.all([
        barcodeInventoryService.getProductMovementHistory('', 10),
        barcodeInventoryService.getLowStockProducts()
      ]);
      
      setMovementHistory(history);
      setLowStockProducts(lowStock);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    }
  };

  const resetForm = () => {
    setScannedCode('');
    setScanResult(null);
    setEntryQuantity(1);
    setEntrySupplier('');
    setEntryBatch('');
    setEntryExpirationDate('');
    setEntryCost(0);
    setEntryLocation('');
    setEntryNotes('');
    setExitQuantity(1);
    setExitReason('');
    setExitLocation('');
    setExitNotes('');
  };

  const startScanning = async () => {
    try {
      setIsScanning(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        // Iniciar detección de códigos de barras
        startBarcodeDetection();
      }
    } catch (error) {
      console.error('Error accediendo a la cámara:', error);
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startBarcodeDetection = () => {
    const detectBarcode = () => {
      if (!isScanning || !videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Simular detección de código de barras
      const detectedCode = simulateBarcodeDetection(canvas);
      
      if (detectedCode && detectedCode !== scannedCode) {
        setScannedCode(detectedCode);
        handleBarcodeDetected(detectedCode);
      }

      if (isScanning) {
        requestAnimationFrame(detectBarcode);
      }
    };

    detectBarcode();
  };

  const simulateBarcodeDetection = (canvas: HTMLCanvasElement): string | null => {
    // Simulación de detección de código de barras
    // En producción usarías QuaggaJS, ZXing, o similar
    if (Math.random() < 0.01) { // 1% de probabilidad por frame
      const codes = ['QPH001', 'QPH002', 'QPH003', 'QPH004', 'QPH005'];
      return codes[Math.floor(Math.random() * codes.length)];
    }
    return null;
  };

  const handleBarcodeDetected = async (code: string) => {
    setIsProcessing(true);
    
    try {
      const result = await barcodeInventoryService.findProductByBarcode(code);
      setScanResult(result);
      onProductScanned?.(result);
    } catch (error) {
      console.error('Error procesando código de barras:', error);
      setScanResult({
        success: false,
        error: 'Error procesando código de barras',
        timestamp: new Date()
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualCodeEntry = async (code: string) => {
    if (!code.trim()) return;
    
    setScannedCode(code);
    await handleBarcodeDetected(code);
  };

  const processInventoryEntry = async () => {
    if (!scanResult?.product || !scannedCode) return;

    setIsProcessing(true);
    
    try {
      const result = await barcodeInventoryService.processInventoryEntry(
        scannedCode,
        entryQuantity,
        userId,
        entrySupplier,
        entryBatch,
        entryExpirationDate,
        entryCost,
        entryLocation
      );

      setScanResult(result);
      
      if (result.success) {
        // Recargar historial
        await loadInitialData();
      }
    } catch (error) {
      console.error('Error procesando entrada:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const processInventoryExit = async () => {
    if (!scanResult?.product || !scannedCode) return;

    setIsProcessing(true);
    
    try {
      const result = await barcodeInventoryService.processInventoryExit(
        scannedCode,
        exitQuantity,
        userId,
        exitReason,
        exitLocation
      );

      setScanResult(result);
      
      if (result.success) {
        // Recargar historial
        await loadInitialData();
      }
    } catch (error) {
      console.error('Error procesando salida:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Scan className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Escáner de Inventario con Códigos de Barras</CardTitle>
                <CardDescription>
                  Escanea códigos de barras para gestionar inventario en tiempo real
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <Tabs defaultValue="scanner" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="scanner">Escáner</TabsTrigger>
              <TabsTrigger value="entry">Entrada</TabsTrigger>
              <TabsTrigger value="exit">Salida</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
            </TabsList>

            <TabsContent value="scanner" className="flex-1 flex flex-col">
              <div className="p-4 space-y-4">
                {/* Entrada manual de código */}
                <div className="flex space-x-2">
                  <Input
                    value={scannedCode}
                    onChange={(e) => setScannedCode(e.target.value)}
                    placeholder="Ingresar código de barras manualmente"
                    onKeyDown={(e) => e.key === 'Enter' && handleManualCodeEntry(scannedCode)}
                  />
                  <Button 
                    onClick={() => handleManualCodeEntry(scannedCode)}
                    disabled={!scannedCode.trim() || isProcessing}
                  >
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Cámara */}
                <div className="relative">
                  {isScanning ? (
                    <div className="relative">
                      <video
                        ref={videoRef}
                        className="w-full h-64 object-cover rounded-lg border"
                        playsInline
                      />
                      <canvas
                        ref={canvasRef}
                        className="hidden"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-48 h-32 border-2 border-blue-500 rounded-lg flex items-center justify-center">
                          <Scan className="h-8 w-8 text-blue-500 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <div className="text-center">
                        <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Cámara no activa</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center mt-4 space-x-2">
                    {!isScanning ? (
                      <Button onClick={startScanning}>
                        <Camera className="h-4 w-4 mr-2" />
                        Iniciar Escáner
                      </Button>
                    ) : (
                      <Button onClick={stopScanning} variant="outline">
                        <X className="h-4 w-4 mr-2" />
                        Detener Escáner
                      </Button>
                    )}
                  </div>
                </div>

                {/* Resultado del escaneo */}
                {scanResult && (
                  <div className="mt-4">
                    {scanResult.success && scanResult.product ? (
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-green-800">{scanResult.product.nombre}</h4>
                              <Badge variant="outline" className="text-green-600">
                                {scanResult.product.codigo}
                              </Badge>
                            </div>
                            <p className="text-sm text-green-700">{scanResult.product.descripcion}</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Stock:</span> {scanResult.product.stock_disponible}
                              </div>
                              <div>
                                <span className="font-medium">Precio:</span> {formatPrice(scanResult.product.precio_venta)}
                              </div>
                              <div>
                                <span className="font-medium">Categoría:</span> {scanResult.product.categoria}
                              </div>
                              <div>
                                <span className="font-medium">Ubicación:</span> {scanResult.product.ubicacion}
                              </div>
                            </div>
                            {scanResult.product.stock_disponible <= scanResult.product.stock_minimo && (
                              <div className="flex items-center text-orange-600">
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                <span className="text-sm">Stock bajo</span>
                              </div>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription>
                          <div className="space-y-2">
                            <p className="text-red-800">{scanResult.error}</p>
                            {scanResult.suggestions && scanResult.suggestions.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-red-700 mb-2">Productos similares:</p>
                                <div className="space-y-1">
                                  {scanResult.suggestions.map((product) => (
                                    <div key={product.id} className="text-sm text-red-600">
                                      {product.nombre} ({product.codigo})
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="entry" className="flex-1 flex flex-col">
              <div className="p-4 space-y-4">
                {scanResult?.product ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Producto Seleccionado</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="font-medium">Nombre:</span> {scanResult.product.nombre}</div>
                        <div><span className="font-medium">Código:</span> {scanResult.product.codigo}</div>
                        <div><span className="font-medium">Stock Actual:</span> {scanResult.product.stock_disponible}</div>
                        <div><span className="font-medium">Precio Compra:</span> {formatPrice(scanResult.product.precio_compra)}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="entry-quantity">Cantidad</Label>
                        <Input
                          id="entry-quantity"
                          type="number"
                          value={entryQuantity}
                          onChange={(e) => setEntryQuantity(Number(e.target.value))}
                          min="1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="entry-cost">Costo Unitario</Label>
                        <Input
                          id="entry-cost"
                          type="number"
                          value={entryCost}
                          onChange={(e) => setEntryCost(Number(e.target.value))}
                          step="0.01"
                        />
                      </div>
                      <div>
                        <Label htmlFor="entry-supplier">Proveedor</Label>
                        <Input
                          id="entry-supplier"
                          value={entrySupplier}
                          onChange={(e) => setEntrySupplier(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="entry-batch">Lote</Label>
                        <Input
                          id="entry-batch"
                          value={entryBatch}
                          onChange={(e) => setEntryBatch(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="entry-expiration">Fecha Vencimiento</Label>
                        <Input
                          id="entry-expiration"
                          type="date"
                          value={entryExpirationDate}
                          onChange={(e) => setEntryExpirationDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="entry-location">Ubicación</Label>
                        <Input
                          id="entry-location"
                          value={entryLocation}
                          onChange={(e) => setEntryLocation(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="entry-notes">Observaciones</Label>
                      <Textarea
                        id="entry-notes"
                        value={entryNotes}
                        onChange={(e) => setEntryNotes(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <Button 
                      onClick={processInventoryEntry}
                      disabled={isProcessing || entryQuantity <= 0}
                      className="w-full"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Registrar Entrada
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Escanea un producto para registrar entrada</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="exit" className="flex-1 flex flex-col">
              <div className="p-4 space-y-4">
                {scanResult?.product ? (
                  <div className="space-y-4">
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-medium text-orange-800 mb-2">Producto Seleccionado</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="font-medium">Nombre:</span> {scanResult.product.nombre}</div>
                        <div><span className="font-medium">Código:</span> {scanResult.product.codigo}</div>
                        <div><span className="font-medium">Stock Disponible:</span> {scanResult.product.stock_disponible}</div>
                        <div><span className="font-medium">Precio Venta:</span> {formatPrice(scanResult.product.precio_venta)}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="exit-quantity">Cantidad</Label>
                        <Input
                          id="exit-quantity"
                          type="number"
                          value={exitQuantity}
                          onChange={(e) => setExitQuantity(Number(e.target.value))}
                          min="1"
                          max={scanResult.product.stock_disponible}
                        />
                      </div>
                      <div>
                        <Label htmlFor="exit-reason">Motivo</Label>
                        <Select value={exitReason} onValueChange={setExitReason}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar motivo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="venta">Venta</SelectItem>
                            <SelectItem value="transferencia">Transferencia</SelectItem>
                            <SelectItem value="devolucion">Devolución</SelectItem>
                            <SelectItem value="perdida">Pérdida</SelectItem>
                            <SelectItem value="otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="exit-location">Ubicación Origen</Label>
                        <Input
                          id="exit-location"
                          value={exitLocation}
                          onChange={(e) => setExitLocation(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="exit-notes">Observaciones</Label>
                      <Textarea
                        id="exit-notes"
                        value={exitNotes}
                        onChange={(e) => setExitNotes(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <Button 
                      onClick={processInventoryExit}
                      disabled={isProcessing || exitQuantity <= 0 || exitQuantity > scanResult.product.stock_disponible}
                      className="w-full"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Minus className="h-4 w-4 mr-2" />
                      )}
                      Registrar Salida
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Escanea un producto para registrar salida</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history" className="flex-1 flex flex-col">
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <History className="h-4 w-4 mr-2" />
                      Movimientos Recientes
                    </h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {movementHistory.map((movement) => (
                        <div key={movement.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {movement.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(movement.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Cantidad: {movement.cantidad} | {movement.motivo}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Stock Bajo
                    </h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {lowStockProducts.map((product) => (
                        <div key={product.id} className="p-3 border rounded-lg bg-orange-50">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{product.nombre}</span>
                            <Badge variant="destructive" className="text-xs">
                              {product.stock_disponible}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            Mínimo: {product.stock_minimo}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}




