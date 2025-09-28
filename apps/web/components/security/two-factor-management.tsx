"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Shield, 
  Smartphone, 
  Mail, 
  Key, 
  Settings, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  Eye,
  EyeOff,
  Copy,
  Download,
  Trash2
} from "lucide-react";
import { twoFactorAuthService, TwoFactorConfig } from "@/lib/services/two-factor-auth";
import TwoFactorSetup from "./two-factor-setup";

interface TwoFactorManagementProps {
  userId: string;
  onConfigChange: () => void;
}

export default function TwoFactorManagement({ userId, onConfigChange }: TwoFactorManagementProps) {
  const [config, setConfig] = useState<TwoFactorConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    loadConfig();
  }, [userId]);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const twoFactorConfig = await twoFactorAuthService.getTwoFactorConfig(userId);
      setConfig(twoFactorConfig);
    } catch (error) {
      console.error('Error cargando configuración 2FA:', error);
      setError('Error cargando configuración 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable2FA = () => {
    setIsSettingUp(true);
    setError('');
    setSuccess('');
  };

  const handleDisable2FA = async () => {
    if (!password.trim()) {
      setError('Ingresa tu contraseña para deshabilitar 2FA');
      return;
    }

    setIsDisabling(true);
    setError('');

    try {
      const success = await twoFactorAuthService.disableTwoFactor(userId, password);
      
      if (success) {
        setSuccess('2FA deshabilitado exitosamente');
        await loadConfig();
        onConfigChange();
      } else {
        setError('Error deshabilitando 2FA. Verifica tu contraseña.');
      }
    } catch (error) {
      setError('Error deshabilitando 2FA');
      console.error('Error deshabilitando 2FA:', error);
    } finally {
      setIsDisabling(false);
      setPassword('');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadBackupCodes = () => {
    if (!config?.backupCodes) return;

    const content = `Códigos de Respaldo - LogicQP\n\n${config.backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}\n\nGuarda estos códigos en un lugar seguro. Cada código solo se puede usar una vez.`;
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

  const getMethodName = (method: string) => {
    switch (method) {
      case 'totp': return 'App Autenticadora';
      case 'sms': return 'Mensaje de Texto';
      case 'email': return 'Correo Electrónico';
      default: return 'Desconocido';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Cargando configuración 2FA...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isSettingUp) {
    return (
      <TwoFactorSetup
        userId={userId}
        onSetupComplete={() => {
          setIsSettingUp(false);
          loadConfig();
          onConfigChange();
        }}
        onCancel={() => setIsSettingUp(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span>Autenticación de Dos Factores</span>
          </CardTitle>
          <CardDescription>
            Añade una capa extra de seguridad a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Estado actual */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                config?.enabled ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <Shield className={`h-5 w-5 ${
                  config?.enabled ? 'text-green-600' : 'text-gray-400'
                }`} />
              </div>
              <div>
                <h4 className="font-medium">
                  {config?.enabled ? '2FA Habilitado' : '2FA Deshabilitado'}
                </h4>
                <p className="text-sm text-gray-600">
                  {config?.enabled 
                    ? `Protegido con ${getMethodName(config.method)}`
                    : 'Tu cuenta no está protegida con 2FA'
                  }
                </p>
              </div>
            </div>
            <Badge variant={config?.enabled ? 'default' : 'secondary'}>
              {config?.enabled ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>

          {/* Configuración actual */}
          {config?.enabled && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Método Configurado</h4>
                <div className="flex items-center space-x-2">
                  {React.createElement(getMethodIcon(config.method), { 
                    className: "h-5 w-5 text-blue-600" 
                  })}
                  <span className="text-blue-800">{getMethodName(config.method)}</span>
                </div>
              </div>

              {/* Códigos de respaldo */}
              {config.backupCodes && config.backupCodes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Códigos de Respaldo</h4>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowBackupCodes(!showBackupCodes)}
                      >
                        {showBackupCodes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadBackupCodes}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {showBackupCodes ? (
                    <div className="grid grid-cols-2 gap-2">
                      {config.backupCodes.map((code, index) => (
                        <div key={index} className="p-2 bg-gray-100 rounded font-mono text-sm text-center">
                          {code}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-100 rounded text-center">
                      <span className="text-gray-600">
                        {config.backupCodes.length} códigos disponibles
                      </span>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-600">
                    Usa estos códigos si pierdes acceso a tu método de 2FA. 
                    Cada código solo se puede usar una vez.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Acciones */}
          <div className="space-y-3">
            {!config?.enabled ? (
              <Button onClick={handleEnable2FA} className="w-full">
                <Shield className="h-4 w-4 mr-2" />
                Habilitar 2FA
              </Button>
            ) : (
              <div className="space-y-2">
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    Deshabilitar 2FA reducirá la seguridad de tu cuenta. 
                    Solo hazlo si es absolutamente necesario.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="disable-password">Contraseña actual (requerida para deshabilitar)</Label>
                  <div className="flex space-x-2">
                    <input
                      id="disable-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tu contraseña actual"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button
                      onClick={handleDisable2FA}
                      disabled={!password.trim() || isDisabling}
                      variant="destructive"
                    >
                      {isDisabling ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mensajes */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Información adicional */}
          <div className="text-xs text-gray-600 space-y-1">
            <p>• La autenticación de dos factores añade una capa extra de seguridad</p>
            <p>• Necesitarás un código adicional cada vez que inicies sesión</p>
            <p>• Guarda los códigos de respaldo en un lugar seguro</p>
            <p>• Puedes cambiar el método de 2FA en cualquier momento</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
