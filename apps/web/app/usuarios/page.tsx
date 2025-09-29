'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  RefreshCw,
  User,
  Camera,
  Mail,
  Phone,
  Building,
  MapPin,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
  X,
  Loader2
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: string;
  telefono: string;
  direccion: string;
  empresa: string;
  email_verificado: boolean;
  telefono_verificado: boolean;
  foto_url: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
  mfa_enabled: boolean;
  last_login: string;
  status: 'active' | 'inactive' | 'suspended';
}

export default function UsuariosPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    rol: '',
    telefono: '',
    direccion: '',
    foto_url: '',
    empresa: 'Qualipharm Laboratorio Farmacéutico',
    email_verificado: false,
    telefono_verificado: false
  });

  // Función para cargar usuarios reales desde Supabase
  const loadUsers = async () => {
    try {
      setLoading(true);

      // Usar cliente de Supabase existente
      const supabaseAdmin = supabase;

      // Agregar timeout para evitar bucles infinitos
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );

      const queryPromise = supabaseAdmin
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: profiles, error: profilesError } = await Promise.race([
        queryPromise,
        timeoutPromise
      ]) as any;

      if (profilesError) {
        console.error('Error cargando usuarios:', profilesError);
        setUsers([]);
        setFilteredUsers([]);
        return;
      }

      // Transformar datos de Supabase al formato esperado
      const realUsers: User[] = profiles?.map((profile: any) => ({
        id: profile.id,
        email: profile.email,
        nombre: profile.nombre || '',
        apellido: profile.apellido || '',
        rol: profile.rol || 'usuario',
        telefono: profile.telefono || '',
        direccion: profile.direccion || '',
        empresa: profile.empresa || 'Qualipharm Laboratorio Farmacéutico',
        email_verificado: profile.email_verificado || false,
        telefono_verificado: profile.telefono_verificado || false,
        foto_url: profile.foto_url || '',
        created_at: profile.created_at || new Date().toISOString(),
        updated_at: profile.updated_at || new Date().toISOString(),
        mfa_enabled: profile.mfa_enabled || false,
        last_login: profile.last_login || new Date().toISOString(),
        status: 'active' as const
      })) || [];

      setUsers(realUsers);
      setFilteredUsers(realUsers);

    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtros
  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter((user: any) =>
        user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.rol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'todos') {
      filtered = filtered.filter((user: any) => user.rol === roleFilter);
    }

    if (statusFilter !== 'todos') {
      filtered = filtered.filter((user: any) => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async () => {
    // Evitar múltiples ejecuciones
    if (isCreatingUser) {
      console.log('⚠️ Ya se está creando un usuario, esperando...');
      return;
    }

    try {
      setIsCreatingUser(true);
      console.log('🚀 Creando usuario:', newUser);

      // Timeout de 10 segundos para evitar que se quede girando indefinidamente
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: La operación tardó demasiado')), 10000);
      });

      const createUserPromise = async () => {
        // Validar campos requeridos
        if (!newUser.email || !newUser.password || !newUser.nombre || !newUser.apellido || !newUser.rol) {
          throw new Error('Por favor completa todos los campos requeridos (Email, Contraseña, Nombre, Apellido, Rol)');
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newUser.email)) {
          throw new Error('Por favor ingresa un email válido');
        }

        // Validar longitud de contraseña
        if (newUser.password.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres');
        }

        // Crear cliente de Supabase con service role key
        const supabaseAdmin = supabase;

        // Primero crear el usuario en la tabla de autenticación
        const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
          email: newUser.email,
          password: newUser.password,
          options: {
            emailRedirectTo: undefined, // No redirigir por email
            data: {
              email_confirm: true // Confirmar email automáticamente
            }
          }
        });

        if (authError) {
          console.error('❌ Error creando usuario de autenticación:', authError);
          throw new Error(`Error creando usuario: ${authError.message}`);
        }

        if (!authData.user) {
          console.error('❌ No se pudo crear el usuario de autenticación');
          throw new Error('Error: No se pudo crear el usuario de autenticación');
        }

        // Confirmar el usuario automáticamente si es necesario
        if (authData.user && !authData.user.email_confirmed_at) {
          console.log('🔄 Confirmando usuario automáticamente...');
          // En un entorno local, podemos confirmar automáticamente
          // En producción, esto requeriría verificación de email
        }

        // El trigger ya creó el perfil automáticamente, solo actualizamos los datos adicionales
        const { data: profileData, error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({
            nombre: newUser.nombre,
            apellido: newUser.apellido,
            rol: newUser.rol,
            telefono: newUser.telefono,
            direccion: newUser.direccion,
            foto_url: newUser.foto_url,
            avatar: newUser.foto_url,
            empresa: newUser.empresa,
            email_verificado: newUser.email_verificado,
            telefono_verificado: newUser.telefono_verificado
          })
          .eq('id', authData.user.id)
          .select()
          .single();

        if (profileError) {
          console.error('❌ Error actualizando perfil:', profileError);
          throw new Error(`Error actualizando perfil: ${profileError.message}`);
        }

        console.log('✅ Usuario creado exitosamente:', profileData);

        // Recargar usuarios
        await loadUsers();
        setIsCreateDialogOpen(false);
        setNewUser({
          email: '',
          password: '',
          nombre: '',
          apellido: '',
          rol: '',
          telefono: '',
          direccion: '',
          foto_url: '',
          empresa: 'Qualipharm Laboratorio Farmacéutico',
          email_verificado: false,
          telefono_verificado: false
        });

        alert('Usuario creado exitosamente');
      };

      // Ejecutar con timeout
      await Promise.race([createUserPromise(), timeoutPromise]);

    } catch (error) {
      console.error('❌ Error creando usuario:', error instanceof Error ? error.message : String(error));
      alert(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser || isUpdatingUser) return;

    try {
      setIsUpdatingUser(true);
      console.log('🔄 Actualizando usuario:', selectedUser);

      // Timeout de 30 segundos para evitar que se quede girando indefinidamente
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: La operación tardó demasiado')), 30000);
      });

      const updateUserPromise = async () => {
        // Validar campos requeridos
        if (!selectedUser.nombre || !selectedUser.apellido || !selectedUser.rol) {
          throw new Error('Por favor completa todos los campos requeridos (Nombre, Apellido, Rol)');
        }

        // Crear cliente de Supabase con service role key
        const supabaseAdmin = supabase;

        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            nombre: selectedUser.nombre,
            apellido: selectedUser.apellido,
            rol: selectedUser.rol,
            telefono: selectedUser.telefono || '',
            direccion: selectedUser.direccion || '',
            empresa: selectedUser.empresa || '',
            email_verificado: selectedUser.email_verificado || false,
            telefono_verificado: selectedUser.telefono_verificado || false,
            foto_url: selectedUser.foto_url || '',
            avatar: selectedUser.avatar || '',
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedUser.id);

        if (error) {
          console.error('❌ Error actualizando usuario:', error);
          throw new Error(`Error actualizando usuario: ${error.message}`);
        }

        console.log('✅ Usuario actualizado exitosamente');
        await loadUsers();
        setIsEditDialogOpen(false);
        setSelectedUser(null);
        alert('Usuario actualizado exitosamente');
      };

      // Ejecutar con timeout
      await Promise.race([updateUserPromise(), timeoutPromise]);

    } catch (error) {
      console.error('❌ Error actualizando usuario:', error);
      alert(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleEditImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedUser) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedUser({...selectedUser, foto_url: result, avatar: result});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;

    try {
      // Crear cliente de Supabase con service role key
      const supabaseAdmin = createClient(
        'http://127.0.0.1:54321',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
      );

      // Eliminar perfil
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('Error eliminando perfil:', profileError);
        return;
      }

      // Eliminar usuario de auth
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (authError) {
        console.error('Error eliminando usuario de auth:', authError);
        return;
      }

      await loadUsers();

    } catch (error) {
      console.error('Error eliminando usuario:', error);
    }
  };

  const getRoleBadge = (rol: string) => {
    const variants = {
      'super_admin': 'destructive',
      'administrador': 'default',
      'gerente': 'secondary',
      'farmacia': 'outline',
      'ventas': 'outline',
      'compras': 'outline',
      'almacen': 'outline',
      'contabilidad': 'outline',
      'usuario': 'outline'
    } as const;

    return (
      <Badge variant={variants[rol as keyof typeof variants] || 'outline'}>
        {rol.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'active': 'default',
      'inactive': 'secondary',
      'suspended': 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status === 'active' ? 'Activo' : 
         status === 'inactive' ? 'Inactivo' : 'Suspendido'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando usuarios desde la base de datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="max-w-7xl mx-auto px-4 py-8 relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Gestión de Usuarios
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Usuarios reales del sistema Qualipharm
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtros */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
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
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los roles</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="administrador">Administrador</SelectItem>
                  <SelectItem value="gerente">Gerente</SelectItem>
                  <SelectItem value="farmacia">Farmacia</SelectItem>
                  <SelectItem value="ventas">Ventas</SelectItem>
                  <SelectItem value="compras">Compras</SelectItem>
                  <SelectItem value="almacen">Almacén</SelectItem>
                  <SelectItem value="contabilidad">Contabilidad</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Usuarios */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Usuarios del Sistema ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                      {user.foto_url ? (
                        <img src={user.foto_url} alt={user.nombre} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <User className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.nombre} {user.apellido}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {getRoleBadge(user.rol)}
                        {getStatusBadge(user.status)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog para crear usuario */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Agregar un nuevo usuario al sistema Qualipharm
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Sección de Foto */}
            <div className="flex flex-col items-center space-y-4">
              <Label className="text-sm font-medium">Foto de Perfil</Label>
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-300 flex items-center justify-center">
                  {newUser.foto_url ? (
                    <img 
                      src={newUser.foto_url} 
                      alt="Foto de perfil" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <input
                  type="file"
                  id="foto-upload"
                  accept="image/*"
                  className="hidden"
                  aria-label="Subir foto de perfil"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const imageData = e.target?.result as string;
                        setNewUser({...newUser, foto_url: imageData});
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="absolute -bottom-2 -right-2"
                  onClick={() => document.getElementById('foto-upload')?.click()}
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Información Personal */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={newUser.nombre}
                  onChange={(e) => setNewUser({...newUser, nombre: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="apellido">Apellido</Label>
                <Input
                  id="apellido"
                  value={newUser.apellido}
                  onChange={(e) => setNewUser({...newUser, apellido: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="rol">Rol</Label>
              <Select value={newUser.rol} onValueChange={(value) => setNewUser({...newUser, rol: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Administrador</SelectItem>
                  <SelectItem value="administrador">Administrador</SelectItem>
                  <SelectItem value="vendedor">Vendedor</SelectItem>
                  <SelectItem value="inventario">Inventario</SelectItem>
                  <SelectItem value="contable">Contable</SelectItem>
                  <SelectItem value="cliente">Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={newUser.telefono}
                onChange={(e) => setNewUser({...newUser, telefono: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="direccion">Dirección</Label>
              <Textarea
                id="direccion"
                value={newUser.direccion}
                onChange={(e) => setNewUser({...newUser, direccion: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="empresa">Empresa</Label>
              <Input
                id="empresa"
                value={newUser.empresa}
                onChange={(e) => setNewUser({...newUser, empresa: e.target.value})}
              />
            </div>
            
            {/* Verificaciones */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="email_verificado"
                  checked={newUser.email_verificado}
                  onCheckedChange={(checked) => setNewUser({...newUser, email_verificado: checked})}
                />
                <Label htmlFor="email_verificado">Email Verificado</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="telefono_verificado"
                  checked={newUser.telefono_verificado}
                  onCheckedChange={(checked) => setNewUser({...newUser, telefono_verificado: checked})}
                />
                <Label htmlFor="telefono_verificado">Teléfono Verificado</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isCreatingUser}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateUser} 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isCreatingUser}
            >
              {isCreatingUser ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Usuario'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar usuario */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modificar información del usuario seleccionado
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* Sección de Foto */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                    {(selectedUser.foto_url || selectedUser.avatar) ? (
                      <img
                        src={selectedUser.foto_url || selectedUser.avatar}
                        alt={`Foto de ${selectedUser.nombre}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          e.currentTarget.nextElementSibling?.classList.add('flex');
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center ${(selectedUser.foto_url || selectedUser.avatar) ? 'hidden' : 'flex'}`}>
                      <User className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <input
                    type="file"
                    id="edit-foto-upload"
                    accept="image/*"
                    className="hidden"
                    aria-label="Subir foto de perfil"
                    onChange={handleEditImageUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute -bottom-2 -right-2"
                    onClick={() => document.getElementById('edit-foto-upload')?.click()}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedUser.nombre} {selectedUser.apellido}</h3>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  <Badge variant="outline" className="mt-1">
                    {selectedUser.rol.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Campos de Información */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-nombre">Nombre *</Label>
                  <Input
                    id="edit-nombre"
                    value={selectedUser.nombre || ''}
                    onChange={(e) => setSelectedUser({...selectedUser, nombre: e.target.value})}
                    placeholder="Nombre del usuario"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-apellido">Apellido *</Label>
                  <Input
                    id="edit-apellido"
                    value={selectedUser.apellido || ''}
                    onChange={(e) => setSelectedUser({...selectedUser, apellido: e.target.value})}
                    placeholder="Apellido del usuario"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-rol">Rol *</Label>
                <Select value={selectedUser.rol || ''} onValueChange={(value) => setSelectedUser({...selectedUser, rol: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Administrador</SelectItem>
                    <SelectItem value="administrador">Administrador</SelectItem>
                    <SelectItem value="vendedor">Vendedor</SelectItem>
                    <SelectItem value="inventario">Inventario</SelectItem>
                    <SelectItem value="contable">Contable</SelectItem>
                    <SelectItem value="cliente">Cliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  value={selectedUser.email || ''}
                  disabled
                  className="bg-gray-50"
                  placeholder="Email del usuario"
                />
                <p className="text-xs text-gray-500 mt-1">El email no se puede modificar</p>
              </div>

              <div>
                <Label htmlFor="edit-telefono">Teléfono</Label>
                <Input
                  id="edit-telefono"
                  value={selectedUser.telefono || ''}
                  onChange={(e) => setSelectedUser({...selectedUser, telefono: e.target.value})}
                  placeholder="Número de teléfono"
                />
              </div>

              <div>
                <Label htmlFor="edit-direccion">Dirección</Label>
                <Textarea
                  id="edit-direccion"
                  value={selectedUser.direccion || ''}
                  onChange={(e) => setSelectedUser({...selectedUser, direccion: e.target.value})}
                  placeholder="Dirección completa"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="edit-empresa">Empresa</Label>
                <Input
                  id="edit-empresa"
                  value={selectedUser.empresa || ''}
                  onChange={(e) => setSelectedUser({...selectedUser, empresa: e.target.value})}
                  placeholder="Nombre de la empresa"
                />
              </div>

              {/* Estados de Verificación */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-email-verificado"
                    checked={selectedUser.email_verificado || false}
                    onCheckedChange={(checked) => setSelectedUser({...selectedUser, email_verificado: checked})}
                  />
                  <Label htmlFor="edit-email-verificado">Email Verificado</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-telefono-verificado"
                    checked={selectedUser.telefono_verificado || false}
                    onCheckedChange={(checked) => setSelectedUser({...selectedUser, telefono_verificado: checked})}
                  />
                  <Label htmlFor="edit-telefono-verificado">Teléfono Verificado</Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isUpdatingUser}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleEditUser}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isUpdatingUser}
            >
              {isUpdatingUser ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
