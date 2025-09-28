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
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  rol: string;
  telefono: string;
  direccion: string;
  empresa: string;
  email_verificado: boolean;
  telefono_verificado: boolean;
  foto_url: string;
  created_at: string;
  updated_at: string;
}

const roleLabels: Record<string, string> = {
  super_admin: 'Super Administrador',
  administrador: 'Administrador',
  vendedor: 'Vendedor',
  inventario: 'Inventario',
  contador: 'Contador',
  cliente: 'Cliente'
};

const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    super_admin: 'bg-red-100 text-red-800',
    administrador: 'bg-orange-100 text-orange-800',
    vendedor: 'bg-blue-100 text-blue-800',
    inventario: 'bg-green-100 text-green-800',
    contador: 'bg-purple-100 text-purple-800',
    cliente: 'bg-gray-100 text-gray-800'
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
};

const getStatusColor = (verified: boolean) => {
  return verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<User>>({});
  const [addFormData, setAddFormData] = useState<Partial<User>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [fotoPreview, setFotoPreview] = useState<string>('');
  const [addFotoPreview, setAddFotoPreview] = useState<string>('');
  const [isUploadingFoto, setIsUploadingFoto] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const { user } = useAuth();

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      
      console.log('📥 Obteniendo datos reales de usuarios desde Supabase...');
      
      // Usar el cliente de Supabase
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        throw new Error(`Error de Supabase: ${error.message}`);
      }
      
      console.log('✅ Datos obtenidos desde Supabase:', profiles);
      
      if (Array.isArray(profiles)) {
        const usersData = profiles.map((profile: any) => ({
            id: profile.id,
          email: profile.email,
          password: '••••••••',
          nombre: profile.nombre || 'Sin nombre',
            apellido: profile.apellido || '',
          rol: profile.rol || 'cliente',
            telefono: profile.telefono || '',
            direccion: profile.direccion || '',
          empresa: profile.empresa || '',
            email_verificado: profile.email_verificado || false,
            telefono_verificado: profile.telefono_verificado || false,
          foto_url: profile.foto_url || '',
            created_at: profile.created_at || new Date().toISOString(),
            updated_at: profile.updated_at || new Date().toISOString()
        }));
        
        setUsuarios(usersData);
        console.log('✅ Usuarios cargados:', usersData.length);
      } else {
        console.warn('⚠️ Respuesta no es un array:', profiles);
        setUsuarios([]);
      }
    } catch (error) {
      console.error('❌ Error cargando datos de usuarios:', error);
      setLoadError(error instanceof Error ? error.message : 'Error desconocido');
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      telefono: user.telefono,
      empresa: user.empresa,
      direccion: user.direccion,
      rol: user.rol,
      email_verificado: user.email_verificado,
      telefono_verificado: user.telefono_verificado,
      foto_url: user.foto_url
    });
    setFotoPreview(user.foto_url || '');
    setShowEditModal(true);
  };

  const handleEditFormChange = (field: keyof User, value: string | boolean) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddFormChange = (field: keyof User, value: string | boolean) => {
    setAddFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFotoUpload = async (event: React.ChangeEvent<HTMLInputElement>, isAddModal: boolean = false) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB');
      return;
    }

    try {
      setIsUploadingFoto(true);
      
      // Convertir a Base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        if (isAddModal) {
          setAddFotoPreview(base64String);
          setAddFormData(prev => ({
            ...prev,
            foto_url: base64String
          }));
        } else {
          setFotoPreview(base64String);
          setEditFormData(prev => ({
            ...prev,
            foto_url: base64String
          }));
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('❌ Error cargando foto:', error);
      alert('Error al cargar la imagen');
    } finally {
      setIsUploadingFoto(false);
    }
  };

  const handleRemoveFoto = () => {
    setFotoPreview('');
    setEditFormData(prev => ({
      ...prev,
      foto_url: ''
    }));
  };

  const handleRemoveAddFoto = () => {
    setAddFotoPreview('');
    setAddFormData(prev => ({
      ...prev,
      foto_url: ''
    }));
  };

  const handleDragStart = (e: React.MouseEvent) => {
    // Solo permitir arrastre desde el header
    const target = e.target as HTMLElement;
    if (target.closest('[data-drag-handle]')) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      const modal = e.currentTarget as HTMLElement;
      const rect = modal.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleDragMove = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      const modal = e.currentTarget as HTMLElement;
      const rect = modal.getBoundingClientRect();
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Limitar el movimiento dentro de la ventana
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;
      
      // Calcular posición con límites
      const constrainedX = Math.max(0, Math.min(newX, maxX));
      const constrainedY = Math.max(0, Math.min(newY, maxY));
      
      // Aplicar nueva posición
      modal.style.left = `${constrainedX}px`;
      modal.style.top = `${constrainedY}px`;
      modal.style.transform = 'none';
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      setIsSaving(true);
      
      // Actualizar en Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          nombre: editFormData.nombre,
          apellido: editFormData.apellido,
          email: editFormData.email,
          telefono: editFormData.telefono,
          empresa: editFormData.empresa,
          direccion: editFormData.direccion,
          rol: editFormData.rol,
          email_verificado: editFormData.email_verificado,
          telefono_verificado: editFormData.telefono_verificado,
          foto_url: editFormData.foto_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id);

      if (error) {
        throw new Error(`Error actualizando usuario: ${error.message}`);
      }

      // Actualizar lista local
      setUsuarios(prev => prev.map(user => 
        user.id === selectedUser.id 
          ? { ...user, ...editFormData }
          : user
      ));

      setShowEditModal(false);
      setSelectedUser(null);
      setEditFormData({});
      setFotoPreview('');
      
      alert('✅ Usuario actualizado exitosamente');
      
    } catch (error) {
      console.error('❌ Error actualizando usuario:', error);
      alert('❌ Error al actualizar usuario');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddUser = async () => {
    try {
      setIsAdding(true);
      
      // Validar datos requeridos
      if (!addFormData.nombre || !addFormData.email || !addFormData.rol) {
        alert('Por favor completa todos los campos requeridos');
        return;
      }

      // Verificar si el usuario ya existe
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', addFormData.email)
        .single();

      if (existingUser) {
        alert('Ya existe un usuario con este email');
        setIsAdding(false);
        return;
      }

      // Crear usuario en Supabase Auth primero
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: addFormData.email!,
        password: addFormData.password || 'TempPassword123!',
        options: {
          data: {
            nombre: addFormData.nombre,
            apellido: addFormData.apellido || '',
            rol: addFormData.rol
          }
        }
      });

      if (authError) {
        console.error('❌ Error creando usuario en Auth:', authError);
        throw new Error(`Error creando usuario: ${authError.message}`);
      }

      if (authData.user) {
        // Crear o actualizar perfil en la base de datos usando upsert
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: addFormData.email,
            nombre: addFormData.nombre,
            apellido: addFormData.apellido || '',
            rol: addFormData.rol,
            telefono: addFormData.telefono || '',
            direccion: addFormData.direccion || '',
            empresa: addFormData.empresa || '',
            email_verificado: addFormData.email_verificado || false,
            telefono_verificado: addFormData.telefono_verificado || false,
            foto_url: addFormData.foto_url || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('❌ Error creando/actualizando perfil:', profileError);
          throw new Error(`Error creando perfil: ${profileError.message}`);
        }

        // Actualizar lista local
        const newUser: User = {
          id: authData.user.id,
          email: addFormData.email!,
          password: '••••••••',
          nombre: addFormData.nombre!,
          apellido: addFormData.apellido || '',
          rol: addFormData.rol!,
          telefono: addFormData.telefono || '',
          direccion: addFormData.direccion || '',
          empresa: addFormData.empresa || '',
          email_verificado: addFormData.email_verificado || false,
          telefono_verificado: addFormData.telefono_verificado || false,
          foto_url: addFormData.foto_url || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        setUsuarios(prev => [newUser, ...prev]);
      }

      setShowAddUser(false);
      setAddFormData({});
      setAddFotoPreview('');
      
      alert('✅ Usuario creado exitosamente');
      
    } catch (error) {
      console.error('❌ Error creando usuario:', error);
      alert(`❌ Error al crear usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        throw new Error(`Error eliminando usuario: ${error.message}`);
      }

      // Actualizar lista local
      setUsuarios(prev => prev.filter(user => user.id !== userId));
      
      alert('✅ Usuario eliminado exitosamente');
      
    } catch (error) {
      console.error('❌ Error eliminando usuario:', error);
      alert('❌ Error al eliminar usuario');
    }
  };

  const filteredUsers = usuarios.filter(user => {
    const matchesSearch = user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.rol === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.email_verificado) ||
                         (statusFilter === 'inactive' && !user.email_verificado);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  useEffect(() => {
    if (user) {
      loadUsuarios();
    }
  }, [user]);

  useEffect(() => {
    if (!showEditModal) {
      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 });
    } else {
      // Resetear posición del modal cuando se abre
      setTimeout(() => {
        const modal = document.querySelector('.cursor-move.select-none') as HTMLElement;
        if (modal) {
          modal.style.left = '50%';
          modal.style.top = '50%';
          modal.style.transform = 'translate(-50%, -50%)';
        }
      }, 10);
    }
  }, [showEditModal]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Acceso Denegado
          </h1>
          <p className="text-gray-600">
            Debes iniciar sesión para acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-2 flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent break-words">
                Gestión de Usuarios
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 break-words">
                Administra los usuarios del sistema farmacéutico
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
              onClick={loadUsuarios}
              disabled={loading}
                className="w-full sm:w-auto"
                size="sm"
              >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden xs:inline">{loading ? 'Actualizando...' : 'Actualizar'}</span>
              <span className="xs:hidden">{loading ? '...' : '↻'}</span>
              </Button>
              <Button 
                onClick={() => setShowAddUser(true)}
                className="w-full sm:w-auto"
                size="sm"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                <span className="hidden xs:inline">Nuevo Usuario</span>
                <span className="xs:hidden">Nuevo</span>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Usuarios</CardTitle>
                <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="pb-3">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{usuarios.length}</div>
                <p className="text-xs text-gray-500 mt-1 truncate">Usuarios registrados</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 truncate">Usuarios Activos</CardTitle>
                <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg flex-shrink-0">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent className="pb-3">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">
                {usuarios.filter(u => u.email_verificado).length}
              </div>
                <p className="text-xs text-gray-500 mt-1 truncate">Email verificado</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 truncate">Usuarios Inactivos</CardTitle>
                <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg flex-shrink-0">
                  <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                </div>
              </CardHeader>
              <CardContent className="pb-3">
              <div className="text-2xl sm:text-3xl font-bold text-red-600">
                {usuarios.filter(u => !u.email_verificado).length}
              </div>
                <p className="text-xs text-gray-500 mt-1 truncate">Pendientes de verificación</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 truncate">Super Admins</CardTitle>
                <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg flex-shrink-0">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent className="pb-3">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                {usuarios.filter(u => u.rol === 'super_admin').length}
              </div>
                <p className="text-xs text-gray-500 mt-1 truncate">Administradores del sistema</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                <span className="hidden sm:inline">Filtros de Búsqueda</span>
                <span className="sm:hidden">Filtros</span>
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 hidden sm:block">
                Filtra y busca usuarios específicos del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <Label htmlFor="search" className="text-sm font-medium text-gray-700">Buscar Usuario</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Buscar por nombre o email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10 sm:h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role-filter" className="text-sm font-medium text-gray-700">Filtrar por Rol</Label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="h-10 sm:h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm">
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los roles</SelectItem>
                      {Object.entries(roleLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status-filter" className="text-sm font-medium text-gray-700">Filtrar por Estado</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-10 sm:h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="active">Activos</SelectItem>
                      <SelectItem value="inactive">Inactivos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-800 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  <span>Lista de Usuarios</span>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                  {filteredUsers.length} usuarios
                </Badge>
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 hidden sm:block">
                Gestiona los usuarios del sistema farmacéutico
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Cargando usuarios...</p>
              </div>
            )}

            {loadError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 m-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error al cargar usuarios
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{loadError}</p>
                                    </div>
                              </div>
                              </div>
                            </div>
            )}

            {!loading && !loadError && (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {filteredUsers.length === 0 ? (
                    <li className="px-6 py-4 text-center text-gray-500">
                      No hay usuarios registrados
                    </li>
                  ) : (
                    filteredUsers.map((usuario) => (
                      <li key={usuario.id} className="px-6 py-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {usuario.foto_url ? (
                                <img 
                                  src={usuario.foto_url} 
                                  alt={usuario.nombre}
                                  className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                  <span className="text-white font-medium">
                                    {usuario.nombre.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                          </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {usuario.nombre} {usuario.apellido}
                          </div>
                              <div className="text-sm text-gray-500">
                                {usuario.email}
                        </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={`${getRoleColor(usuario.rol)} px-2 py-1 text-xs font-medium`}>
                                  {roleLabels[usuario.rol]}
                              </Badge>
                                <Badge className={`${getStatusColor(usuario.email_verificado)} px-2 py-1 text-xs font-medium`}>
                                  {usuario.email_verificado ? 'Verificado' : 'No verificado'}
                              </Badge>
                            </div>
                          </div>
                            </div>
                            <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                              onClick={() => handleEditUser(usuario)}
                              className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                          >
                              <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                              onClick={() => handleDeleteUser(usuario.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-colors"
                          >
                              <Trash2 className="h-4 w-4 mr-1" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                      </li>
                    ))
                  )}
                </ul>
                </div>
            )}
            </CardContent>
          </Card>

    {/* Edit User Modal - Custom Draggable */}
    {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setShowEditModal(false)}
          />
          
          {/* Modal Content */}
          <div 
            className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto cursor-move select-none"
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            style={{ 
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            } as React.CSSProperties}
          >
            {/* Header */}
            <div 
              className="cursor-move bg-gray-50 border-b border-gray-200 p-4 rounded-t-lg"
              data-drag-handle
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Editar Usuario</h2>
                  <p className="text-sm text-gray-600">
                    Modifica la información del usuario seleccionado
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  </div>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600 ml-2"
                    title="Cerrar modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          
          <div className="space-y-4 px-6 py-4">
            {/* Sección de Foto */}
            <div className="flex flex-col items-center space-y-4">
                  <Label className="text-sm font-medium text-gray-700">Foto del Usuario</Label>
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200">
                  {fotoPreview ? (
                    <img 
                      src={fotoPreview} 
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <User className="h-8 w-8 text-white" />
                    </div>
                  )}
                </div>
                {fotoPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveFoto}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    title="Eliminar foto"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isUploadingFoto}
                      onClick={() => {
                        const input = document.getElementById('foto-input') as HTMLInputElement;
                        input?.click();
                      }}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {isUploadingFoto ? 'Cargando...' : 'Cambiar Foto'}
                    </Button>
                    <input
                      id="foto-input"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFotoUpload(e, false)}
                      className="hidden"
                      disabled={isUploadingFoto}
                      aria-label="Seleccionar foto de perfil"
                    />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-nombre">Nombre</Label>
                <Input
                  id="edit-nombre"
                  value={editFormData.nombre || ''}
                  onChange={(e) => handleEditFormChange('nombre', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-apellido">Apellido</Label>
                <Input
                  id="edit-apellido"
                  value={editFormData.apellido || ''}
                  onChange={(e) => handleEditFormChange('apellido', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email || ''}
                onChange={(e) => handleEditFormChange('email', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-telefono">Teléfono</Label>
                <Input
                  id="edit-telefono"
                  value={editFormData.telefono || ''}
                  onChange={(e) => handleEditFormChange('telefono', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-rol">Rol</Label>
                <Select
                  value={editFormData.rol || ''}
                  onValueChange={(value) => handleEditFormChange('rol', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-empresa">Empresa</Label>
              <Input
                id="edit-empresa"
                value={editFormData.empresa || ''}
                onChange={(e) => handleEditFormChange('empresa', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="edit-direccion">Dirección</Label>
              <Textarea
                id="edit-direccion"
                value={editFormData.direccion || ''}
                onChange={(e) => handleEditFormChange('direccion', e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-email-verificado"
                  checked={editFormData.email_verificado || false}
                  onCheckedChange={(checked) => handleEditFormChange('email_verificado', checked)}
                />
                <Label htmlFor="edit-email-verificado" className="text-sm font-medium">
                  Email Verificado
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-telefono-verificado"
                  checked={editFormData.telefono_verificado || false}
                  onCheckedChange={(checked) => handleEditFormChange('telefono_verificado', checked)}
                />
                <Label htmlFor="edit-telefono-verificado" className="text-sm font-medium">
                  Teléfono Verificado
                </Label>
              </div>
            </div>
          </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setFotoPreview('');
                    setEditFormData({});
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveUser}
                disabled={isSaving}
              >
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </div>
        </div>
        )}

        {/* Add User Modal - Modern Professional Design */}
        {showAddUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with blur effect */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20 backdrop-blur-sm" 
              onClick={() => setShowAddUser(false)}
            />
            
            {/* Modal Content with modern styling */}
            <div 
              className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden cursor-move select-none border border-white/20"
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              style={{ 
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              } as React.CSSProperties}
            >
              {/* Header with gradient */}
              <div 
                className="cursor-move bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-6"
                data-drag-handle
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <UserPlus className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Agregar Nuevo Usuario</h2>
                      <p className="text-blue-100 text-sm">
                        Crea un nuevo usuario en el sistema farmacéutico
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                      <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                      <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                    </div>
                    <button
                      onClick={() => setShowAddUser(false)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                      title="Cerrar modal"
                    >
                      <X className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            
              {/* Content with modern scroll */}
              <div className="overflow-y-auto max-h-[calc(95vh-200px)] px-8 py-6">
                {/* Photo Section with modern design */}
                <div className="flex flex-col items-center space-y-6 mb-8">
                  <div className="text-center">
                    <Label className="text-lg font-semibold text-gray-800 mb-2 block">Foto del Usuario</Label>
                    <p className="text-sm text-gray-500">Selecciona una imagen para el perfil del usuario</p>
                  </div>
                  
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-2xl ring-4 ring-blue-100 group-hover:ring-blue-200 transition-all duration-300">
                      {addFotoPreview ? (
                        <img 
                          src={addFotoPreview} 
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 flex items-center justify-center">
                          <User className="h-12 w-12 text-white" />
                        </div>
                      )}
                    </div>
                    
                    {addFotoPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveAddFoto}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                        title="Eliminar foto"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    
                    {/* Upload overlay */}
                    <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isUploadingFoto}
                      onClick={() => {
                        const input = document.getElementById('add-foto-input') as HTMLInputElement;
                        input?.click();
                      }}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {isUploadingFoto ? 'Cargando...' : 'Seleccionar Foto'}
                    </Button>
                    <input
                      id="add-foto-input"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFotoUpload(e, true)}
                      className="hidden"
                      disabled={isUploadingFoto}
                      aria-label="Seleccionar foto de perfil para nuevo usuario"
                    />
                  </div>
                </div>

                {/* Form Fields with modern design */}
                <div className="space-y-6">
                  {/* Personal Information Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <User className="h-5 w-5 mr-2 text-blue-600" />
                      Información Personal
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="add-nombre" className="text-sm font-semibold text-gray-700 flex items-center">
                          Nombre <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                          id="add-nombre"
                          value={addFormData.nombre || ''}
                          onChange={(e) => handleAddFormChange('nombre', e.target.value)}
                          placeholder="Nombre del usuario"
                          required
                          className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="add-apellido" className="text-sm font-semibold text-gray-700">
                          Apellido
                        </Label>
                        <Input
                          id="add-apellido"
                          value={addFormData.apellido || ''}
                          onChange={(e) => handleAddFormChange('apellido', e.target.value)}
                          placeholder="Apellido del usuario"
                          className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Section */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Mail className="h-5 w-5 mr-2 text-green-600" />
                      Información de Contacto
                    </h3>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="add-email" className="text-sm font-semibold text-gray-700 flex items-center">
                          Email <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                          id="add-email"
                          type="email"
                          value={addFormData.email || ''}
                          onChange={(e) => handleAddFormChange('email', e.target.value)}
                          placeholder="email@ejemplo.com"
                          required
                          className="h-12 border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-xl transition-all duration-200"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="add-password" className="text-sm font-semibold text-gray-700">
                          Contraseña
                        </Label>
                        <Input
                          id="add-password"
                          type="password"
                          value={addFormData.password || ''}
                          onChange={(e) => handleAddFormChange('password', e.target.value)}
                          placeholder="Dejar vacío para contraseña temporal"
                          className="h-12 border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-xl transition-all duration-200"
                        />
                        <p className="text-xs text-gray-500 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Si no se especifica, se usará una contraseña temporal
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="add-telefono" className="text-sm font-semibold text-gray-700 flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          Teléfono
                        </Label>
                        <Input
                          id="add-telefono"
                          value={addFormData.telefono || ''}
                          onChange={(e) => handleAddFormChange('telefono', e.target.value)}
                          placeholder="Número de teléfono"
                          className="h-12 border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-xl transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Role and Company Section */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-purple-600" />
                      Rol y Empresa
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="add-rol" className="text-sm font-semibold text-gray-700 flex items-center">
                          Rol <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Select
                          value={addFormData.rol || ''}
                          onValueChange={(value) => handleAddFormChange('rol', value)}
                        >
                          <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl transition-all duration-200">
                            <SelectValue placeholder="Seleccionar rol" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(roleLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="add-empresa" className="text-sm font-semibold text-gray-700 flex items-center">
                          <Building className="h-4 w-4 mr-1" />
                          Empresa
                        </Label>
                        <Input
                          id="add-empresa"
                          value={addFormData.empresa || ''}
                          onChange={(e) => handleAddFormChange('empresa', e.target.value)}
                          placeholder="Nombre de la empresa"
                          className="h-12 border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-orange-600" />
                      Dirección
                    </h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="add-direccion" className="text-sm font-semibold text-gray-700">
                        Dirección Completa
                      </Label>
                      <Textarea
                        id="add-direccion"
                        value={addFormData.direccion || ''}
                        onChange={(e) => handleAddFormChange('direccion', e.target.value)}
                        placeholder="Dirección completa del usuario"
                        rows={3}
                        className="border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-xl transition-all duration-200 resize-none"
                      />
                    </div>
                  </div>

                  {/* Verification Section */}
                  <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-xl p-6 border border-indigo-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-indigo-600" />
                      Verificaciones
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200">
                        <Switch
                          id="add-email-verificado"
                          checked={addFormData.email_verificado || false}
                          onCheckedChange={(checked) => handleAddFormChange('email_verificado', checked)}
                          className="data-[state=checked]:bg-green-500"
                        />
                        <div>
                          <Label htmlFor="add-email-verificado" className="text-sm font-semibold text-gray-700 cursor-pointer">
                            Email Verificado
                          </Label>
                          <p className="text-xs text-gray-500">Usuario ha verificado su email</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200">
                        <Switch
                          id="add-telefono-verificado"
                          checked={addFormData.telefono_verificado || false}
                          onCheckedChange={(checked) => handleAddFormChange('telefono_verificado', checked)}
                          className="data-[state=checked]:bg-green-500"
                        />
                        <div>
                          <Label htmlFor="add-telefono-verificado" className="text-sm font-semibold text-gray-700 cursor-pointer">
                            Teléfono Verificado
                          </Label>
                          <p className="text-xs text-gray-500">Usuario ha verificado su teléfono</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer with modern design */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200 px-8 py-6">
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="text-sm text-gray-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                    Los campos marcados con <span className="text-red-500 mx-1">*</span> son obligatorios
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddUser(false);
                        setAddFotoPreview('');
                        setAddFormData({});
                      }}
                      className="px-6 py-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 rounded-xl transition-all duration-200 font-medium"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleAddUser}
                      disabled={isAdding}
                      className="px-8 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAdding ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creando Usuario...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Crear Usuario
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
