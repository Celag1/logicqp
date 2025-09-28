'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff, Loader2, Lock, Mail, User, UserPlus, CheckCircle, AlertCircle, Phone, Building } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    apellido: '',
    telefono: '',
    empresa: '',
    direccion: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [passwordStrength, setPasswordStrength] = useState(0)
  
  const { signUp, sendConfirmationEmail } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Validaciones en tiempo real
  useEffect(() => {
    validateForm()
  }, [formData])

  // Aplicar ancho de la barra de fortaleza de contraseña
  useEffect(() => {
    const strengthBar = document.querySelector('[data-width]') as HTMLElement
    if (strengthBar) {
      const width = strengthBar.getAttribute('data-width')
      if (width) {
        strengthBar.style.width = width
      }
    }
  }, [passwordStrength])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    return strength
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido'
    }

    if (!formData.apellido.trim()) {
      errors.apellido = 'El apellido es requerido'
    }

    if (!formData.email.trim()) {
      errors.email = 'El email es requerido'
    } else if (!validateEmail(formData.email)) {
      errors.email = 'El email no es válido'
    }

    if (!formData.password) {
      errors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirma tu contraseña'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden'
    }

    if (formData.telefono && !/^[0-9+\-\s()]+$/.test(formData.telefono)) {
      errors.telefono = 'El teléfono no es válido'
    }

    setValidationErrors(errors)
    setPasswordStrength(calculatePasswordStrength(formData.password))
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500'
    if (passwordStrength <= 3) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Débil'
    if (passwordStrength <= 3) return 'Media'
    return 'Fuerte'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validar formulario antes de enviar
    validateForm()
    
    if (Object.keys(validationErrors).length > 0) {
      toast({
        title: "Error de validación",
        description: "Por favor corrige los errores en el formulario",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      console.log('👤 Registro: Creando usuario...')
      
      // Crear usuario en Supabase
      const { error } = await signUp(
        formData.email, 
        formData.password, 
        formData.nombre,
        formData.apellido,
        formData.telefono,
        formData.empresa,
        formData.direccion
      )
      
      if (error) {
        console.error('❌ Registro: Error creando usuario:', error)
        toast({
          title: "Error de registro",
          description: error.message || 'Error creando la cuenta',
          variant: "destructive",
        })
      } else {
        console.log('✅ Registro: Usuario creado exitosamente')
        
        // Enviar email de confirmación personalizado
        console.log('📧 Enviando email de confirmación...')
        const emailResult = await sendConfirmationEmail(
          formData.email, 
          `${formData.nombre} ${formData.apellido}`
        )
        
        if (emailResult.success) {
          toast({
            title: "🎉 ¡Registro exitoso!",
            description: "Usuario creado. Revisa tu email para confirmar tu cuenta.",
          })
          
          // Redirigir a página de confirmación
          setTimeout(() => {
            router.push('/login?message=check-email')
          }, 2000)
        } else {
          toast({
            title: "Usuario creado",
            description: "Cuenta creada pero error enviando email de confirmación. Intenta hacer login.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error('❌ Registro: Error inesperado:', error)
      toast({
        title: "Error",
        description: "Error inesperado durante el registro",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
            <CardTitle className="text-2xl text-center">Crear cuenta</CardTitle>
            <CardDescription className="text-center">
              Regístrate para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="nombre"
                      name="nombre"
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className={`pl-10 ${validationErrors.nombre ? 'border-red-500' : ''}`}
                      placeholder="Tu nombre"
                    />
                    {validationErrors.nombre && (
                      <div className="flex items-center mt-1 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {validationErrors.nombre}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="apellido">Apellido *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="apellido"
                      name="apellido"
                      type="text"
                      required
                      value={formData.apellido}
                      onChange={handleInputChange}
                      className={`pl-10 ${validationErrors.apellido ? 'border-red-500' : ''}`}
                      placeholder="Tu apellido"
                    />
                    {validationErrors.apellido && (
                      <div className="flex items-center mt-1 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {validationErrors.apellido}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`pl-10 ${validationErrors.email ? 'border-red-500' : ''}`}
                    placeholder="tu@email.com"
                  />
                  {validationErrors.email && (
                    <div className="flex items-center mt-1 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {validationErrors.email}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className={`pl-10 ${validationErrors.telefono ? 'border-red-500' : ''}`}
                    placeholder="0998765432"
                  />
                  {validationErrors.telefono && (
                    <div className="flex items-center mt-1 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {validationErrors.telefono}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="empresa">Empresa</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="empresa"
                    name="empresa"
                    type="text"
                    value={formData.empresa}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="Nombre de tu empresa (opcional)"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="direccion">Dirección</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="direccion"
                    name="direccion"
                    type="text"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="Tu dirección (opcional)"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Contraseña *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 ${validationErrors.password ? 'border-red-500' : ''}`}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                
                {/* Indicador de fortaleza de contraseña */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Fortaleza:</span>
                      <span className={`font-medium ${
                        passwordStrength <= 2 ? 'text-red-500' : 
                        passwordStrength <= 3 ? 'text-yellow-500' : 'text-green-500'
                      }`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        data-width={`${(passwordStrength / 5) * 100}%`}
                      ></div>
                    </div>
                  </div>
                )}
                
                {validationErrors.password && (
                  <div className="flex items-center mt-1 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {validationErrors.password}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmar contraseña *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 ${validationErrors.confirmPassword ? 'border-red-500' : ''}`}
                    placeholder="Repite tu contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <div className="flex items-center mt-1 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {validationErrors.confirmPassword}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || Object.keys(validationErrors).length > 0}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Crear cuenta
                  </>
                )}
              </Button>
            </form>

            {/* Información adicional */}
            <div className="mt-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium">¿Qué sucede después del registro?</p>
                    <ul className="mt-2 space-y-1 text-blue-600">
                      <li>• Recibirás un email de confirmación</li>
                      <li>• Haz clic en el enlace para activar tu cuenta</li>
                      <li>• Podrás acceder a todas las funcionalidades</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  ¿Ya tienes una cuenta?{' '}
                  <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                    Inicia sesión
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}