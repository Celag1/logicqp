'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { verifyUsersInDatabase, testUserLogin } from '@/lib/supabase/verify-users'

interface UserStatus {
  email: string
  role: string
  verified: boolean
  authStatus: 'confirmed' | 'unconfirmed' | 'unknown'
}

export default function VerifyUsersPage() {
  const [users, setUsers] = useState<UserStatus[]>([])
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])

  const handleVerifyUsers = async () => {
    setLoading(true)
    setTestResults([])
    
    try {
      const result = await verifyUsersInDatabase()
      
      if (result.success) {
        // Mapear los resultados
        const userStatuses: UserStatus[] = []
        
        // Procesar perfiles
        result.profiles?.forEach((profile: any) => {
          userStatuses.push({
            email: profile.email,
            role: profile.rol,
            verified: profile.email_verified,
            authStatus: 'unknown'
          })
        })
        
        // Procesar usuarios de auth
        result.authUsers?.forEach((authUser: any) => {
          const existingUser = userStatuses.find(u => u.email === authUser.email)
          if (existingUser) {
            existingUser.authStatus = authUser.email_confirmed_at ? 'confirmed' : 'unconfirmed'
          }
        })
        
        setUsers(userStatuses)
      } else {
        setTestResults([`Error: ${(result.error as any)?.message || 'Error desconocido'}`])
      }
    } catch (error) {
      setTestResults([`Error inesperado: ${error}`])
    } finally {
      setLoading(false)
    }
  }

  const handleTestLogin = async (email: string, password: string) => {
    setTestResults(prev => [...prev, `Probando login para ${email}...`])
    
    try {
      const result = await testUserLogin(email, password)
      
      if (result.success) {
        setTestResults(prev => [...prev, `✅ Login exitoso para ${email}`])
      } else {
        setTestResults(prev => [...prev, `❌ Login fallido para ${email}: ${(result.error as any)?.message || 'Error desconocido'}`])
      }
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Error inesperado para ${email}: ${error}`])
    }
  }

  const testCredentials = [
    { email: 'celag3@gmail.com', password: 'Cel@g123', role: 'Super Admin' },
    { email: 'admin@qp.ec', password: 'admin123', role: 'Admin' },
    { email: 'ventas@qp.ec', password: 'ventas123', role: 'Ventas' },
    { email: 'invent@qp.ec', password: 'invent123', role: 'Inventario' },
    { email: 'contab@qp.ec', password: 'contab123', role: 'Contable' },
    { email: 'elipaz31@gmail.com', password: 'client123', role: 'Cliente' },
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Verificación de Usuarios en Base de Datos</CardTitle>
          <CardDescription>
            Verifica el estado de los usuarios en la base de datos y prueba la autenticación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleVerifyUsers} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Verificando...' : 'Verificar Usuarios en BD'}
          </Button>

          {users.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Estado de Usuarios:</h3>
              {users.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <p className="text-sm text-gray-600">Rol: {user.role}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={user.verified ? "default" : "secondary"}>
                      {user.verified ? "Verificado" : "No Verificado"}
                    </Badge>
                    <Badge variant={
                      user.authStatus === 'confirmed' ? "default" : 
                      user.authStatus === 'unconfirmed' ? "destructive" : "secondary"
                    }>
                      {user.authStatus === 'confirmed' ? "Auth OK" : 
                       user.authStatus === 'unconfirmed' ? "Auth Pendiente" : "Auth ?"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <h3 className="font-semibold">Pruebas de Login:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {testCredentials.map((cred, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestLogin(cred.email, cred.password)}
                  className="justify-start"
                >
                  Probar {cred.role}
                </Button>
              ))}
            </div>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Resultados de Pruebas:</h3>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg max-h-60 overflow-y-auto">
                {testResults.map((result, index) => (
                  <p key={index} className="text-sm font-mono">{result}</p>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
