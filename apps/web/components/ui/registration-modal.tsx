'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Loader2, Mail, ExternalLink } from 'lucide-react'

interface RegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  status: 'success' | 'error' | 'loading'
  email?: string
  message?: string
  errorMessage?: string
}

export function RegistrationModal({ 
  isOpen, 
  onClose, 
  status, 
  email, 
  message, 
  errorMessage 
}: RegistrationModalProps) {
  const [showDetails, setShowDetails] = useState(false)

  // Removed auto-close - user must close manually

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          {status === 'loading' && (
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
          )}
          
          {status === 'success' && (
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          )}
          
          {status === 'error' && (
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          )}

          <CardTitle className={`text-2xl font-bold ${
            status === 'success' ? 'text-green-800 dark:text-green-200' :
            status === 'error' ? 'text-red-800 dark:text-red-200' :
            'text-blue-800 dark:text-blue-200'
          }`}>
            {status === 'loading' && '⚡ Procesando Registro...'}
            {status === 'success' && '🎉 ¡Registro Exitoso!'}
            {status === 'error' && '❌ Error en el Registro'}
          </CardTitle>

          <CardDescription className="text-lg">
            {status === 'loading' && 'Estamos creando tu cuenta...'}
            {status === 'success' && 'Tu cuenta ha sido creada correctamente'}
            {status === 'error' && 'Hubo un problema al crear tu cuenta'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === 'success' && (
            <>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Email de Confirmación
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Hemos enviado un enlace de confirmación a <strong>{email}</strong>
                </p>
                <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    <strong>💡 Para desarrollo:</strong> Ve a{' '}
                    <a 
                      href="http://localhost:54324" 
                      target="_blank" 
                      className="underline font-bold text-blue-600 hover:text-blue-800"
                    >
                      http://localhost:54324
                    </a>{' '}
                    (Mailpit) para ver el email
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  ⚡ Próximos Pasos
                </h3>
                <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>1. Abre el email de confirmación</li>
                  <li>2. Haz clic en el enlace de verificación</li>
                  <li>3. Tu cuenta quedará activada</li>
                  <li>4. Podrás iniciar sesión</li>
                </ol>
              </div>
            </>
          )}

          {status === 'error' && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                🚫 Error Detallado
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                {errorMessage || 'Ocurrió un error inesperado'}
              </p>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-red-600 dark:text-red-400 underline mt-2"
              >
                {showDetails ? 'Ocultar' : 'Mostrar'} detalles técnicos
              </button>
              {showDetails && (
                <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
                  {message}
                </div>
              )}
            </div>
          )}

          {status === 'loading' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                🔄 Procesando...
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Estamos creando tu cuenta y enviando el email de confirmación.
                Por favor, espera un momento...
              </p>
            </div>
          )}

          <div className="flex space-x-3">
            {status === 'success' && (
              <>
                <Button 
                  onClick={onClose}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  ✅ Entendido
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.open('http://localhost:54324', '_blank')}
                  className="flex-1"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver Email
                </Button>
              </>
            )}
            
            {status === 'error' && (
              <Button 
                onClick={onClose}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Cerrar
              </Button>
            )}
            
            {status === 'loading' && (
              <Button 
                onClick={onClose}
                variant="outline"
                className="w-full"
                disabled
              >
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Procesando...
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
