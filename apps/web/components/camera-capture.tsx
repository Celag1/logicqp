"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, X, Download, RotateCcw } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function CameraCapture({ onCapture, onClose, isOpen }: CameraCaptureProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen && !isStreaming) {
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      setError('Error al acceder a la cámara: ' + (err as Error).message);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    if (!isStreaming) {
      startCamera();
    }
  };

  const confirmCapture = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      handleClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Captura de Imagen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            {!capturedImage ? (
              <video
                ref={videoRef}
                className="w-full h-64 bg-gray-900 rounded-lg"
                autoPlay
                playsInline
                muted
              />
            ) : (
              <img
                src={capturedImage}
                alt="Imagen capturada"
                className="w-full h-64 object-cover rounded-lg"
              />
            )}

            {!isStreaming && !capturedImage && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 rounded-lg">
                <div className="text-center text-white">
                  <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Iniciando cámara...</p>
                </div>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {error && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            {!capturedImage ? (
              <Button onClick={captureImage} className="flex-1" disabled={!isStreaming}>
                <Camera className="h-4 w-4 mr-2" />
                Capturar
              </Button>
            ) : (
              <>
                <Button onClick={retakePhoto} variant="secondary" className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Volver a Tomar
                </Button>
                <Button onClick={confirmCapture} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Confirmar
                </Button>
              </>
            )}
            <Button onClick={handleClose} variant="outline">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            {!capturedImage 
              ? 'Posiciona la cámara y presiona "Capturar"'
              : 'Revisa la imagen y confirma o toma otra foto'
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
