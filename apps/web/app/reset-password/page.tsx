'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Lock, Eye, EyeOff, ArrowLeft, Shield, Pill, Loader2, CheckCircle } from 'lucide-react'
import { getCompanyLogo } from '@/lib/utils/company-logo'
import { supabase } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [companyLogo, setCompanyLogo] = useState<string>('')
  
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Cargar logo de la empresa
  useEffect(() => {
    const loadCompanyLogo = async () => {
      try {
        const logo = await getCompanyLogo();
        setCompanyLogo(logo);
      } catch (error) {
        console.error('Error cargando logo de la empresa:', error);
      }
    };

    loadCompanyLogo();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      })
      return
    }

    if (password.length < 8) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 8 caracteres",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      console.log('🔑 Reset Password: Actualizando contraseña...')
      
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        console.error('❌ Reset Password: Error actualizando contraseña:', error)
        toast({
          title: "Error",
          description: error.message || 'No se pudo actualizar la contraseña',
          variant: "destructive",
        })
      } else {
        console.log('✅ Reset Password: Contraseña actualizada exitosamente')
        setSuccess(true)
        toast({
          title: "Contraseña actualizada",
          description: "Tu contraseña ha sido restablecida exitosamente",
        })
      }
    } catch (error) {
      console.error('❌ Reset Password: Error inesperado:', error)
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 dark:from-slate-900 dark:via-green-900 dark:to-emerald-900 px-4 py-8">
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.3); }
            50% { box-shadow: 0 0 30px rgba(34, 197, 94, 0.6); }
          }
          .float-animation {
            animation: float 3s ease-in-out infinite;
          }
          .pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
          }
        `}</style>
        
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Logo/Brand section */}
          <div className="text-center mb-8">
            {companyLogo ? (
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-2xl mb-6 overflow-hidden">
                <img 
                  src={companyLogo} 
                  alt="Logo de LogicQP"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl shadow-2xl mb-6">
                <Shield className="w-10 h-10 text-white" />
              </div>
            )}
            
            {/* Título estilizado */}
            <div className="flex items-center justify-center space-x-3 mb-2">
              <h1 className="text-4xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent tracking-tight float-animation">
                LogicQP
              </h1>
              <div className="relative float-animation">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-sm opacity-75 pulse-glow"></div>
                <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-full">
                  <Pill className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Success Card */}
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-0 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
                ¡Contraseña restablecida!
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Tu contraseña ha sido actualizada exitosamente
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-8 pb-8">
              <div className="text-center space-y-4">
                <p className="text-slate-600 dark:text-slate-400">
                  Ya puedes iniciar sesión con tu nueva contraseña.
                </p>
                
                <div className="pt-4">
                  <Link href="/login">
                    <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5">
                      Ir al login
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 px-4 py-8">
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.6); }
        }
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand section */}
        <div className="text-center mb-8">
          {companyLogo ? (
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-2xl mb-6 overflow-hidden">
              <img 
                src={companyLogo} 
                alt="Logo de LogicQP"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-2xl mb-6">
              <Shield className="w-10 h-10 text-white" />
            </div>
          )}
          
          {/* Título estilizado */}
          <div className="flex items-center justify-center space-x-3 mb-2">
            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight float-animation">
              LogicQP
            </h1>
            <div className="relative float-animation">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-sm opacity-75 pulse-glow"></div>
              <div className="relative bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-full">
                <Pill className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
            Restablecer contraseña
          </p>
          </div>

        {/* Reset Password Card */}
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-0 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
              Nueva contraseña
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
            Ingresa tu nueva contraseña
          </CardDescription>
        </CardHeader>
          
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Password Field */}
            <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600"
                    placeholder="••••••••"
                required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-full w-12 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 cursor-pointer rounded-r-xl"
                    title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
            </div>

              {/* Confirm Password Field */}
            <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600"
                    placeholder="••••••••"
                required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0 top-0 h-full w-12 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 cursor-pointer rounded-r-xl"
                    title={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
            </div>

              {/* Submit Button */}
            <Button 
              type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Actualizando contraseña...
                  </>
                ) : (
                  'Restablecer contraseña'
                )}
            </Button>
            </form>

            {/* Links */}
            <div className="mt-6 space-y-4">
            <div className="text-center">
              <Link 
                href="/login" 
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200 inline-flex items-center"
              >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                Volver al login
              </Link>
            </div>
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Contraseña segura
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Usa al menos 8 caracteres con una combinación de letras, números y símbolos.
                  </p>
                </div>
              </div>
            </div>
        </CardContent>
      </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © 2025 LogicQP. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}
