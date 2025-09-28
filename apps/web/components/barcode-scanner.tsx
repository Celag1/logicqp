"use client"

import React, { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, X, Check } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function BarcodeScanner({ onScan, onClose, isOpen }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    if (isOpen && !codeReader.current) {
      codeReader.current = new BrowserMultiFormatReader();
    }

    return () => {
      if (codeReader.current) {
        try {
          // @ts-ignore - reset() puede no existir en todas las versiones
          if ((codeReader.current as any).reset) {
            (codeReader.current as any).reset();
          }
        } catch (error) {
          // Ignorar errores al limpiar
        }
      }
    };
  }, [isOpen]);

  const startScanning = async () => {
    if (!codeReader.current || !videoRef.current) return;

    try {
      setIsScanning(true);
      setError(null);

      const videoInputDevices = await (codeReader.current as any).listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        setError('No se encontraron cámaras disponibles');
        return;
      }

      await (codeReader.current as any).decodeFromVideoDevice(
        videoInputDevices[0].deviceId,
        videoRef.current,
        (result: any, error: any) => {
          if (result) {
            onScan(result.getText());
            stopScanning();
          }
          if (error && error.name !== 'NotFoundException') {
            setError('Error al escanear: ' + error.message);
          }
        }
      );
    } catch (err) {
      setError('Error al iniciar la cámara: ' + (err as Error).message);
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReader.current) {
      try {
        // @ts-ignore - reset() puede no existir en todas las versiones
        if ((codeReader.current as any).reset) {
          (codeReader.current as any).reset();
        }
      } catch (error) {
        // Ignorar errores al limpiar
      }
    }
    setIsScanning(false);
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Escáner de Código de Barras
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full h-64 bg-gray-900 rounded-lg"
              autoPlay
              playsInline
            />
            {!isScanning && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 rounded-lg">
                <div className="text-center text-white">
                  <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Presiona "Iniciar Escaneo" para comenzar</p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            {!isScanning ? (
              <Button onClick={startScanning} className="flex-1">
                <Camera className="h-4 w-4 mr-2" />
                Iniciar Escaneo
              </Button>
            ) : (
              <Button onClick={stopScanning} variant="secondary" className="flex-1">
                <X className="h-4 w-4 mr-2" />
                Detener Escaneo
              </Button>
            )}
            <Button onClick={handleClose} variant="outline">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Coloca el código de barras frente a la cámara para escanearlo
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default BarcodeScanner;