"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Smartphone, 
  Mail, 
  Key, 
  CheckCircle, 
  AlertTriangle, 
  Copy, 
  Download,
  QrCode,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";
import { twoFactorAuthService, type TwoFactorSetup, type TwoFactorConfig } from "@/lib/services/two-factor-auth";

interface TwoFactorSetupProps {
  userId: string;
  onSetupComplete: () => void;
  onCancel: () => void;
}

export default function TwoFactorSetup({ userId, onSetupComplete, onCancel }: TwoFactorSetupProps) {
  const [currentStep, setCurrentStep] = useState<'method' | 'setup' | 'verify' | 'complete'>('method');
  const [selectedMethod, setSelectedMethod] = useState<'totp' | 'sms' | 'email'>('totp');
  const [setupData, setSetupData] = useState<TwoFactorSetup | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const handleMethodSelect = async (method: 'totp' | 'sms' | 'email') => {
    setSelectedMethod(method);
    setIsLoading(true);
    setError('');

    try {
      const setup = await twoFactorAuthService.initializeTwoFactor(userId, method);
      setSetupData(setup);
      setBackupCodes(setup.backupCodes);
      setCurrentStep('setup');
    } catch (error) {
      setError('Error inicializando 2FA. Intenta nuevamente.');
      console.error('Error inicializando 2FA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setError('Ingresa el código de verificación');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const isValid = await twoFactorAuthService.verifyTwoFactorSetup(userId, verificationCode);
      
      if (isValid) {
        setSuccess('¡2FA configurado exitosamente!');
        setCurrentStep('complete');
      } else {
        setError('Código de verificación incorrecto');
      }
    } catch (error) {
      setError('Error verificando código. Intenta nuevamente.');
      console.error('Error verificando código:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadBackupCodes = () => {
    const content = `Códigos de Respaldo - LogicQP\n\n${backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}\n\nGuarda estos códigos en un lugar seguro. Cada código solo se puede usar una vez.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'logicqp-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'totp': return Smartphone;
      case 'sms': return Smartphone;
      case 'email': return Mail;
      default: return Key;
    }
  };

  const getMethodDescription = (method: string) => {
    switch (method) {
      case 'totp': return 'Usa una app autenticadora como Google Authenticator o Authy';
      case 'sms': return 'Recibe códigos por mensaje de texto';
      case 'email': return 'Recibe códigos por correo electrónico';
      default: return '';
    }
  };

  if (currentStep === 'method') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Configurar Autenticación de Dos Factores</CardTitle>
            <CardDescription>
              Añade una capa extra de seguridad a tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4">
                <Button
                  variant="outline"
                  className="h-auto p-6 flex items-center space-x-4"
                  onClick={() => handleMethodSelect('totp')}
                  disabled={isLoading}
                >
                  <Smartphone className="h-6 w-6 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium">App Autenticadora</div>
                    <div className="text-sm text-gray-500">
                      Google Authenticator, Authy, etc.
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-6 flex items-center space-x-4"
                  onClick={() => handleMethodSelect('sms')}
                  disabled={isLoading}
                >
                  <Smartphone className="h-6 w-6 text-green-600" />
                  <div className="text-left">
                    <div className="font-medium">Mensaje de Texto</div>
                    <div className="text-sm text-gray-500">
                      Recibe códigos por SMS
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-6 flex items-center space-x-4"
                  onClick={() => handleMethodSelect('email')}
                  disabled={isLoading}
                >
                  <Mail className="h-6 w-6 text-purple-600" />
                  <div className="text-left">
                    <div className="font-medium">Correo Electrónico</div>
                    <div className="text-sm text-gray-500">
                      Recibe códigos por email
                    </div>
                  </div>
                </Button>
              </div>

              {isLoading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Configurando 2FA...</span>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'setup' && setupData) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <span>Configurar {selectedMethod === 'totp' ? 'App Autenticadora' : selectedMethod === 'sms' ? 'SMS' : 'Email'}</span>
            </CardTitle>
            <CardDescription>
              {getMethodDescription(selectedMethod)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedMethod === 'totp' && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 inline-block">
                    <img 
                      src={setupData.qrCode} 
                      alt="QR Code" 
                      className="w-48 h-48"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Escanea este código QR con tu app autenticadora
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Clave Manual (si no puedes escanear el QR)</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={showSecret ? setupData.manualEntryKey : '••••••••••••••••••••••••••••••••'}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSecret(!showSecret)}
                    >
                      {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(setupData.manualEntryKey)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {(selectedMethod === 'sms' || selectedMethod === 'email') && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Se enviará un código de verificación a tu {selectedMethod === 'sms' ? 'teléfono' : 'email'}.
                  Ingresa el código en el siguiente paso.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <h4 className="font-medium">Códigos de Respaldo</h4>
              <p className="text-sm text-gray-600">
                Guarda estos códigos en un lugar seguro. Úsalos si pierdes acceso a tu método de 2FA.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <div key={index} className="p-2 bg-gray-100 rounded font-mono text-sm text-center">
                    {code}
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadBackupCodes}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar Códigos
              </Button>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('method')}>
                Volver
              </Button>
              <Button onClick={() => setCurrentStep('verify')}>
                Continuar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'verify') {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Verificar Código</CardTitle>
            <CardDescription>
              Ingresa el código de 6 dígitos de tu {selectedMethod === 'totp' ? 'app autenticadora' : selectedMethod === 'sms' ? 'SMS' : 'email'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="verification-code">Código de Verificación</Label>
              <Input
                id="verification-code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="text-center text-lg font-mono"
              />
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('setup')}>
                Volver
              </Button>
              <Button 
                onClick={handleVerifyCode}
                disabled={!verificationCode.trim() || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Verificar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'complete') {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-green-800">¡2FA Configurado!</CardTitle>
            <CardDescription>
              Tu cuenta ahora está protegida con autenticación de dos factores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                La autenticación de dos factores ha sido habilitada exitosamente.
                A partir de ahora necesitarás un código adicional para iniciar sesión.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h4 className="font-medium">Próximos pasos:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Guarda los códigos de respaldo en un lugar seguro</li>
                <li>• Descarga una app autenticadora si no la tienes</li>
                <li>• Prueba el login con 2FA</li>
              </ul>
            </div>

            <Button onClick={onSetupComplete} className="w-full">
              <CheckCircle className="h-4 w-4 mr-2" />
              Finalizar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
