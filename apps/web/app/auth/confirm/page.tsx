'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'

export default function ConfirmEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const email = searchParams.get('email')
    const token = searchParams.get('token')

    if (!email || !token) {
      setStatus('error')
      setMessage('Enlace de confirmación inválido')
      return
    }

    // Confirmar email en Supabase
    confirmEmail(email)
  }, [searchParams])

  const confirmEmail = async (email: string) => {
    try {
      console.log('📧 Confirmando email:', email)
      
      // Actualizar el perfil para marcar email como verificado
      const response = await fetch('/api/auth/confirm-email', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          action: 'confirm'
        })
      })

      if (response.ok) {
        setStatus('success')
        setMessage('¡Tu cuenta ha sido confirmada exitosamente! Ya puedes iniciar sesión.')
      } else {
        setStatus('error')
        setMessage('Error confirmando el email. Por favor, intenta de nuevo.')
      }
    } catch (error) {
      console.error('Error confirmando email:', error)
      setStatus('error')
      setMessage('Error confirmando el email. Por favor, intenta de nuevo.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏥 Qualipharm
          </h1>
          <p className="text-gray-600">Laboratorio Farmacéutico</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Confirmar Email</CardTitle>
            <CardDescription className="text-center">
              Verificando tu cuenta...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-6">
              {status === 'loading' && (
                <>
                  <Loader2 className="h-16 w-16 text-blue-500 animate-spin mx-auto" />
                  <p className="text-gray-600">Confirmando tu cuenta...</p>
                </>
              )}

              {status === 'success' && (
                <>
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-green-700">
                      ¡Cuenta confirmada!
                    </h3>
                    <p className="text-gray-600">{message}</p>
                    <div className="space-y-3">
                      <Button 
                        onClick={() => router.push('/login')}
                        className="w-full"
                      >
                        Ir al Login
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => router.push('/')}
                        className="w-full"
                      >
                        Ir al Inicio
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {status === 'error' && (
                <>
                  <XCircle className="h-16 w-16 text-red-500 mx-auto" />
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-red-700">
                      Error de confirmación
                    </h3>
                    <p className="text-gray-600">{message}</p>
                    <div className="space-y-3">
                      <Button 
                        onClick={() => router.push('/register')}
                        className="w-full"
                      >
                        Intentar de nuevo
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => router.push('/login')}
                        className="w-full"
                      >
                        Ir al Login
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {status === 'expired' && (
                <>
                  <Mail className="h-16 w-16 text-yellow-500 mx-auto" />
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-yellow-700">
                      Enlace expirado
                    </h3>
                    <p className="text-gray-600">
                      El enlace de confirmación ha expirado. Por favor, solicita uno nuevo.
                    </p>
                    <div className="space-y-3">
                      <Button 
                        onClick={() => router.push('/register')}
                        className="w-full"
                      >
                        Registrarse de nuevo
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => router.push('/login')}
                        className="w-full"
                      >
                        Ir al Login
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                ¿Necesitas ayuda?{' '}
                <Link href="/contact" className="font-medium text-blue-600 hover:text-blue-500">
                  Contáctanos
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}