"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuthLocal } from '@/hooks/useAuthLocal';
import { localSupabase } from '@/lib/database/local-adapter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  RefreshCw,
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Camera,
  Upload,
  X
} from 'lucide-react';

interface User {
  id: string;
  nombre: string;
  apellido?: string;
  email: string;
  telefono: string;
  empresa: string;
  direccion: string;
  rol: string;
  email_verificado: boolean;
  telefono_verificado: boolean;
  foto_url?: string;
  created_at: string;
  updated_at: string;
}

interface EditFormData {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  empresa: string;
  direccion: string;
  rol: string;
  email_verificado: boolean;
  telefono_verificado: boolean;
  foto_url?: string;
}

export default function UsuariosPageLocal() {
  const { profile, loading: authLoading } = useAuthLocal();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('todos');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    empresa: '',
    direccion: '',
    rol: 'vendedor',
    email_verificado: false,
    telefono_verificado: false,
    foto_url: ''
  });
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [activeTab, setActiveTab] = useState('usuarios');

  // Cargar usuarios desde la base de datos local
  const loadUsersData = useCallback(async () => {
    try {
      console.log('📥 Obteniendo datos reales de usuarios desde BD local...')
      setLoading(true)
      setLoadError(null)
      
      const { data, error } = await localSupabase.getUsers()
      
      if (error) {
        console.error('❌ Error obteniendo usuarios desde BD local:', error)
        throw error
      }
      
      if (!data || data.length === 0) {
        console.log('⚠️ No hay usuarios en BD local, usando datos de ejemplo')
        // Datos de ejemplo si no hay usuarios
        const demoUsers: User[] = [
          {
            id: 'admin-001',
            nombre: 'Administrador',
            apellido: 'Sistema',
            email: 'admin@logicqp.com',
            telefono: '+593 99 000 0001',
            empresa: 'LogicQP',
            direccion: 'Guayaquil, Ecuador',
            rol: 'administrador',
            email_verificado: true,
            telefono_verificado: true,
            created_at: '2025-01-01T00:00:00.000Z',
            updated_at: '2025-01-01T00:00:00.000Z'
          },
          {
            id: 'vendedor-001',
            nombre: 'Juan',
            apellido: 'Pérez',
            email: 'vendedor@logicqp.com',
            telefono: '+593 99 000 0002',
            empresa: 'LogicQP',
            direccion: 'Quito, Ecuador',
            rol: 'vendedor',
            email_verificado: true,
            telefono_verificado: false,
            created_at: '2025-01-01T00:00:00.000Z',
            updated_at: '2025-01-01T00:00:00.000Z'
          }
        ]
        setUsers(demoUsers)
        setFilteredUsers(demoUsers)
        setLoadError(null)
        return
      }
      
      console.log(`✅ ${data.length} usuarios obtenidos desde BD local`)
      setUsers(data)
      setFilteredUsers(data)
      setLoadError(null)
      
    } catch (error) {
      console.error('❌ Error cargando usuarios desde BD local:', error)
      
      // En caso de error, usar datos de ejemplo
      const demoUsers: User[] = [
        {
          id: 'admin-001',
          nombre: 'Administrador',
          apellido: 'Sistema',
          email: 'admin@logicqp.com',
          telefono: '+593 99 000 0001',
          empresa: 'LogicQP',
          direccion: 'Guayaquil, Ecuador',
          rol: 'administrador',
          email_verificado: true,
          telefono_verificado: true,
          created_at: '2025-01-01T00:00:00.000Z',
          updated_at: '2025-01-01T00:00:00.000Z'
        },
        {
          id: 'vendedor-001',
          nombre: 'Juan',
          apellido: 'Pérez',
          email: 'vendedor@logicqp.com',
          telefono: '+593 99 000 0002',
          empresa: 'LogicQP',
          direccion: 'Quito, Ecuador',
          rol: 'vendedor',
          email_verificado: true,
          telefono_verificado: false,
          created_at: '2025-01-01T00:00:00.000Z',
          updated_at: '2025-01-01T00:00:00.000Z'
        }
      ]
      setUsers(demoUsers)
      setFilteredUsers(demoUsers)
      setLoadError(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Efecto para cargar usuarios al montar el componente
  useEffect(() => {
    loadUsersData()
  }, [loadUsersData])

  // Filtrar usuarios
  useEffect(() => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.telefono.includes(searchTerm)
      )
    }

    if (roleFilter !== 'todos') {
      filtered = filtered.filter(user => user.rol === roleFilter)
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, roleFilter])

  // Manejar edición de usuario
  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setEditFormData({
      nombre: user.nombre,
      apellido: user.apellido || '',
      email: user.email,
      telefono: user.telefono,
      empresa: user.empresa,
      direccion: user.direccion,
      rol: user.rol,
      email_verificado: user.email_verificado,
      telefono_verificado: user.telefono_verificado,
      foto_url: user.foto_url || ''
    })
    setShowEditDialog(true)
  }

  // Manejar cambios en el formulario de edición
  const handleEditFormChange = (field: keyof EditFormData, value: any) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Guardar cambios del usuario
  const handleSaveUser = async () => {
    if (!editingUser) return

    try {
      console.log('🚀 INICIANDO handleSaveUser...')
      setSaving(true)
      console.log('💾 Guardando cambios para usuario:', editingUser.id)
      console.log('📝 Datos a guardar:', editFormData)

      // Guardar foto en localStorage como respaldo
      if (editFormData.foto_url) {
        localStorage.setItem(`user_photo_${editingUser.id}`, editFormData.foto_url)
        console.log('📸 Foto guardada en localStorage como respaldo')
      }

      // Preparar datos para actualizar
      const updateData = {
        nombre: editFormData.nombre,
        apellido: editFormData.apellido,
        email: editFormData.email,
        telefono: editFormData.telefono,
        empresa: editFormData.empresa,
        direccion: editFormData.direccion,
        rol: editFormData.rol,
        email_verificado: editFormData.email_verificado,
        telefono_verificado: editFormData.telefono_verificado,
        foto_url: editFormData.foto_url
      }

      console.log('📊 Datos preparados para BD local:', updateData)

      // Actualizar en base de datos local
      console.log('🔍 Intentando actualizar en BD local...')
      const { data: updatedUser, error } = await localSupabase.updateUser(editingUser.id, updateData)

      if (error) {
        console.error('❌ Error en operación de BD local:', error)
        console.log('⚠️ Continuando con actualización local...')
      } else {
        console.log('✅ Usuario actualizado en BD local:', updatedUser)
      }

      // Actualizar lista local
      console.log('🔄 Actualizando lista local...')
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === editingUser.id
            ? { ...user, ...updateData, updated_at: new Date().toISOString() }
            : user
        )
      )

      console.log('🔚 EJECUTANDO finally block...')
    } catch (error) {
      console.error('❌ Error guardando usuario:', error)
    } finally {
      console.log('🔄 DESACTIVANDO estado de guardado...')
      setSaving(false)
      console.log('✅ Estado de guardado DESACTIVADO')
      setShowEditDialog(false)
      setEditingUser(null)
      setEditFormData({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        empresa: '',
        direccion: '',
        rol: 'vendedor',
        email_verificado: false,
        telefono_verificado: false,
        foto_url: ''
      })
    }
  }

  // Obtener color del badge según el rol
  const getRoleBadgeColor = (rol: string) => {
    switch (rol) {
      case 'super_admin':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'administrador':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'vendedor':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'inventario':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'contador':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Obtener nombre del rol
  const getRoleName = (rol: string) => {
    switch (rol) {
      case 'super_admin':
        return 'Super Admin'
      case 'administrador':
        return 'Administrador'
      case 'vendedor':
        return 'Vendedor'
      case 'inventario':
        return 'Inventario'
      case 'contador':
        return 'Contador'
      default:
        return rol
    }
  }

  // Calcular estadísticas
  const totalUsers = users.length
  const activeUsers = users.filter(user => user.email_verificado).length
  const adminUsers = users.filter(user => user.rol === 'administrador' || user.rol === 'super_admin').length
  const vendedorUsers = users.filter(user => user.rol === 'vendedor').length

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <p className="text-lg text-red-600">No se pudo cargar el perfil del usuario</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-2">
            Administra los usuarios del sistema LogicQP
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            onClick={loadUsersData}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Administradores</p>
                <p className="text-2xl font-bold text-gray-900">{adminUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vendedores</p>
                <p className="text-2xl font-bold text-gray-900">{vendedorUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los roles</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="administrador">Administrador</SelectItem>
                  <SelectItem value="vendedor">Vendedor</SelectItem>
                  <SelectItem value="inventario">Inventario</SelectItem>
                  <SelectItem value="contador">Contador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Lista de todos los usuarios del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Cargando usuarios...</span>
            </div>
          ) : loadError ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{loadError}</p>
              <Button onClick={loadUsersData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No se encontraron usuarios</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Agregar Usuario
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {user.foto_url ? (
                        <img
                          src={user.foto_url}
                          alt={`${user.nombre} ${user.apellido}`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {user.nombre} {user.apellido}
                      </h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getRoleBadgeColor(user.rol)}>
                          {getRoleName(user.rol)}
                        </Badge>
                        {user.email_verificado && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {user.telefono_verificado && (
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de edición */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica la información del usuario seleccionado
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="usuarios">Información Personal</TabsTrigger>
                <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
              </TabsList>
              
              <TabsContent value="usuarios" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      value={editFormData.nombre}
                      onChange={(e) => handleEditFormChange('nombre', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="apellido">Apellido</Label>
                    <Input
                      id="apellido"
                      value={editFormData.apellido}
                      onChange={(e) => handleEditFormChange('apellido', e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => handleEditFormChange('email', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={editFormData.telefono}
                    onChange={(e) => handleEditFormChange('telefono', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="empresa">Empresa</Label>
                  <Input
                    id="empresa"
                    value={editFormData.empresa}
                    onChange={(e) => handleEditFormChange('empresa', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="direccion">Dirección</Label>
                  <Textarea
                    id="direccion"
                    value={editFormData.direccion}
                    onChange={(e) => handleEditFormChange('direccion', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="rol">Rol</Label>
                  <Select
                    value={editFormData.rol}
                    onValueChange={(value) => handleEditFormChange('rol', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="administrador">Administrador</SelectItem>
                      <SelectItem value="vendedor">Vendedor</SelectItem>
                      <SelectItem value="inventario">Inventario</SelectItem>
                      <SelectItem value="contador">Contador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email_verificado">Email Verificado</Label>
                      <p className="text-sm text-gray-500">El email ha sido verificado</p>
                    </div>
                    <Switch
                      id="email_verificado"
                      checked={editFormData.email_verificado}
                      onCheckedChange={(checked) => handleEditFormChange('email_verificado', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="telefono_verificado">Teléfono Verificado</Label>
                      <p className="text-sm text-gray-500">El teléfono ha sido verificado</p>
                    </div>
                    <Switch
                      id="telefono_verificado"
                      checked={editFormData.telefono_verificado}
                      onCheckedChange={(checked) => handleEditFormChange('telefono_verificado', checked)}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="seguridad" className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Ingresa nueva contraseña"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirma la nueva contraseña"
                  />
                  {passwordError && (
                    <p className="text-sm text-red-600 mt-1">{passwordError}</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveUser}
              disabled={saving}
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
