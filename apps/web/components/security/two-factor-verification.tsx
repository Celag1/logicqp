"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Smartphone, 
  Mail, 
  Key, 
  CheckCircle, 
  AlertTriangle, 
  Loader2,
  RefreshCw,
  Clock,
  Lock
} from "lucide-react";
import { twoFactorAuthService, TwoFactorChallenge } from "@/lib/services/two-factor-auth";

interface TwoFactorVerificationProps {
  userId: string;
  onVerificationComplete: () => void;
  onCancel: () => void;
  onUseBackupCode: () => void;
}

export default function TwoFactorVerification({
  userId,
  onVerificationComplete,
  onCancel,
  onUseBackupCode
}: TwoFactorVerificationProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [challenge, setChallenge] = useState<TwoFactorChallenge | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [maxAttempts] = useState(3);
  const [isLocked, setIsLocked] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'backup'>('code');

  const inputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Crear desafío 2FA al cargar
    createChallenge();
    
    // Focus en el input
    if (inputRef.current) {
      inputRef.current.focus();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (challenge && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [challenge, timeLeft]);

  const createChallenge = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const newChallenge = await twoFactorAuthService.createTwoFactorChallenge(userId, 'totp');
      setChallenge(newChallenge);
      setTimeLeft(5 * 60); // 5 minutos
    } catch (error) {
      setError('Error creando desafío 2FA. Intenta nuevamente.');
      console.error('Error creando desafío:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async () => {
    if (!verificationCode.trim()) {
      setError('Ingresa el código de verificación');
      return;
    }

    if (isLocked) {
      setError('Demasiados intentos fallidos. Intenta más tarde.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const isValid = await twoFactorAuthService.verifyTwoFactorCode(
        userId, 
        verificationCode, 
        challenge?.id
      );

      if (isValid) {
        onVerificationComplete();
      } else {
        setAttempts(prev => {
          const newAttempts = prev + 1;
          if (newAttempts >= maxAttempts) {
            setIsLocked(true);
            setError('Demasiados intentos fallidos. Tu cuenta ha sido bloqueada temporalmente.');
          } else {
            setError(`Código incorrecto. ${maxAttempts - newAttempts} intentos restantes.`);
          }
          return newAttempts;
        });
      }
    } catch (error) {
      setError('Error verificando código. Intenta nuevamente.');
      console.error('Error verificando código:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupCodeSubmit = async () => {
    if (!backupCode.trim()) {
      setError('Ingresa un código de respaldo');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const isValid = await twoFactorAuthService.verifyTwoFactorCode(userId, backupCode);
      
      if (isValid) {
        onVerificationComplete();
      } else {
        setError('Código de respaldo incorrecto');
      }
    } catch (error) {
      setError('Error verificando código de respaldo');
      console.error('Error verificando código de respaldo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (timeLeft > 0) {
      setError(`Espera ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')} antes de solicitar un nuevo código`);
      return;
    }

    await createChallenge();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (activeTab === 'code') {
        handleCodeSubmit();
      } else {
        handleBackupCodeSubmit();
      }
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-xl">Verificación de Dos Factores</CardTitle>
          <CardDescription>
            Ingresa el código de tu app autenticadora o usa un código de respaldo
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'code' | 'backup')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="code" disabled={isLocked}>
                <Smartphone className="h-4 w-4 mr-2" />
                Código App
              </TabsTrigger>
              <TabsTrigger value="backup" disabled={isLocked}>
                <Key className="h-4 w-4 mr-2" />
                Código Respaldo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="code" className="space-y-4">
              <div>
                <Label htmlFor="verification-code">Código de 6 dígitos</Label>
                <Input
                  ref={inputRef}
                  id="verification-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyPress={handleKeyPress}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-lg font-mono"
                  disabled={isLoading || isLocked}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ingresa el código de 6 dígitos de tu app autenticadora
                </p>
              </div>

              {timeLeft > 0 && (
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Nuevo código disponible en {formatTime(timeLeft)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleResendCode}
                  disabled={timeLeft > 0 || isLoading || isLocked}
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Reenviar
                </Button>
                <Button
                  onClick={handleCodeSubmit}
                  disabled={!verificationCode.trim() || isLoading || isLocked}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Verificar
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="backup" className="space-y-4">
              <div>
                <Label htmlFor="backup-code">Código de Respaldo</Label>
                <Input
                  id="backup-code"
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="12345678"
                  className="text-center font-mono"
                  disabled={isLoading || isLocked}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ingresa uno de tus códigos de respaldo de 8 dígitos
                </p>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Los códigos de respaldo solo se pueden usar una vez. 
                  Asegúrate de generar nuevos códigos después de usar uno.
                </AlertDescription>
              </Alert>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={onUseBackupCode}
                  disabled={isLoading || isLocked}
                >
                  <Key className="h-4 w-4 mr-2" />
                  No tengo códigos
                </Button>
                <Button
                  onClick={handleBackupCodeSubmit}
                  disabled={!backupCode.trim() || isLoading || isLocked}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Verificar
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {isLocked && (
            <Alert className="border-orange-200 bg-orange-50">
              <Lock className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Tu cuenta ha sido bloqueada temporalmente debido a múltiples intentos fallidos. 
                Intenta nuevamente en 15 minutos o contacta al soporte.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
            <Button variant="link" onClick={onUseBackupCode} disabled={isLoading || isLocked}>
              ¿Problemas con 2FA?
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
