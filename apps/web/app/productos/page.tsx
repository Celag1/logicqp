"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
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
import { BarcodeGenerator, BarcodeCell, ProductBarcodeLabel } from '@/components/barcode/BarcodeGenerator';
import { 
  Package, 
  PackagePlus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  RefreshCw,
  Barcode,
  Printer,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Minus,
  ShoppingCart
} from 'lucide-react';

interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria_id: string;
  categoria_nombre: string;
  precio: number;
  stock: number;
  stock_minimo: number;
  unidad_medida: string;
  proveedor_id: string;
  proveedor_nombre: string;
  foto_url?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

interface EditFormData {
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria_id: string;
  precio: number;
  stock: number;
  stock_minimo: number;
  unidad_medida: string;
  proveedor_id: string;
  activo: boolean;
}

export default function ProductosPage() {
  const { profile, loading: authLoading } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [stockFilter, setStockFilter] = useState('todos');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showBarcodeDialog, setShowBarcodeDialog] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    codigo: '',
    nombre: '',
    descripcion: '',
    categoria_id: '',
    precio: 0,
    stock: 0,
    stock_minimo: 0,
    unidad_medida: 'unidad',
    proveedor_id: '',
    activo: true
  });
  const [saving, setSaving] = useState(false);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [selectedProductoForBarcode, setSelectedProductoForBarcode] = useState<Producto | null>(null);
  const [activeTab, setActiveTab] = useState('productos');

  // Cargar productos desde Supabase
  const loadProductosData = useCallback(async () => {
    try {
      console.log('📥 Obteniendo productos desde Supabase...')
      setLoading(true)
      setLoadError(null)
      
      const { data, error } = await supabase
        .from('productos')
        .select(`
          *,
          categorias: categoria_id (nombre),
          proveedores: proveedor_id (nombre)
        `)
      
      if (error) {
        console.error('❌ Error obteniendo productos:', error)
        throw error
      }
      
      if (!data || data.length === 0) {
        console.log('⚠️ No hay productos en la base de datos')
        setProductos([])
        setFilteredProductos([])
        setLoadError(null)
        return
      }
      
      // Transformar datos para incluir nombres de categorías y proveedores
      const productosTransformados = data.map((producto: any) => ({
        ...producto,
        categoria_nombre: producto.categorias?.nombre || 'Sin categoría',
        proveedor_nombre: producto.proveedores?.nombre || 'Sin proveedor'
      }))
      
      console.log(`✅ ${productosTransformados.length} productos obtenidos`)
      setProductos(productosTransformados)
      setFilteredProductos(productosTransformados)
      setLoadError(null)
      
    } catch (error) {
      console.error('❌ Error cargando productos:', error)
      setLoadError('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar categorías y proveedores
  const loadCategoriasAndProveedores = useCallback(async () => {
    try {
      const [categoriasRes, proveedoresRes] = await Promise.all([
        supabase.from('categorias').select('*').eq('activa', true),
        supabase.from('proveedores').select('*').eq('activo', true)
      ])

      if (categoriasRes.data) setCategorias(categoriasRes.data)
      if (proveedoresRes.data) setProveedores(proveedoresRes.data)
    } catch (error) {
      console.error('❌ Error cargando categorías y proveedores:', error)
    }
  }, [])

  // Efecto para cargar datos al montar el componente
  useEffect(() => {
    loadProductosData()
    loadCategoriasAndProveedores()
  }, [loadProductosData, loadCategoriasAndProveedores])

  // Filtrar productos
  useEffect(() => {
    let filtered = productos

    if (searchTerm) {
      filtered = filtered.filter(producto =>
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (categoryFilter !== 'todos') {
      filtered = filtered.filter(producto => producto.categoria_id === categoryFilter)
    }

    if (stockFilter === 'bajo') {
      filtered = filtered.filter(producto => producto.stock <= producto.stock_minimo)
    } else if (stockFilter === 'sin_stock') {
      filtered = filtered.filter(producto => producto.stock === 0)
    }

    setFilteredProductos(filtered)
  }, [productos, searchTerm, categoryFilter, stockFilter])

  // Manejar edición de producto
  const handleEditProducto = (producto: Producto) => {
    setEditingProducto(producto)
    setEditFormData({
      codigo: producto.codigo,
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      categoria_id: producto.categoria_id,
      precio: producto.precio,
      stock: producto.stock,
      stock_minimo: producto.stock_minimo,
      unidad_medida: producto.unidad_medida,
      proveedor_id: producto.proveedor_id,
      activo: producto.activo
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

  // Guardar cambios del producto
  const handleSaveProducto = async () => {
    if (!editingProducto) return

    try {
      setSaving(true)
      console.log('💾 Guardando cambios para producto:', editingProducto.id)

      const updateData = {
        codigo: editFormData.codigo,
        nombre: editFormData.nombre,
        descripcion: editFormData.descripcion,
        categoria_id: editFormData.categoria_id,
        precio: editFormData.precio,
        stock: editFormData.stock,
        stock_minimo: editFormData.stock_minimo,
        unidad_medida: editFormData.unidad_medida,
        proveedor_id: editFormData.proveedor_id,
        activo: editFormData.activo
      }

      const { error } = await supabase
        .from('productos')
        .update(updateData)
        .eq('id', editingProducto.id)

      if (error) {
        console.error('❌ Error actualizando producto:', error)
        throw error
      }

      console.log('✅ Producto actualizado exitosamente')
      
      // Recargar datos
      await loadProductosData()
      
      setShowEditDialog(false)
      setEditingProducto(null)
      
    } catch (error) {
      console.error('❌ Error guardando producto:', error)
    } finally {
      setSaving(false)
    }
  }

  // Mostrar código de barras
  const handleShowBarcode = (producto: Producto) => {
    setSelectedProductoForBarcode(producto)
    setShowBarcodeDialog(true)
  }

  // Obtener color del badge según el stock
  const getStockBadgeColor = (stock: number, stockMinimo: number) => {
    if (stock === 0) return 'bg-red-100 text-red-800 border-red-200'
    if (stock <= stockMinimo) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-green-100 text-green-800 border-green-200'
  }

  // Calcular estadísticas
  const totalProductos = productos.length
  const productosActivos = productos.filter(p => p.activo).length
  const stockBajo = productos.filter(p => p.stock <= p.stock_minimo).length
  const sinStock = productos.filter(p => p.stock === 0).length

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
          <XCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
          <p className="text-gray-600 mt-2">
            Administra el inventario de productos farmacéuticos de Qualipharm
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            onClick={loadProductosData}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <PackagePlus className="h-4 w-4 mr-2" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Productos</p>
                <p className="text-2xl font-bold text-gray-900">{totalProductos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Productos Activos</p>
                <p className="text-2xl font-bold text-gray-900">{productosActivos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
                <p className="text-2xl font-bold text-gray-900">{stockBajo}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sin Stock</p>
                <p className="text-2xl font-bold text-gray-900">{sinStock}</p>
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
                  placeholder="Buscar productos por nombre, código o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las categorías</SelectItem>
                  {categorias.map(categoria => (
                    <SelectItem key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="bajo">Stock Bajo</SelectItem>
                  <SelectItem value="sin_stock">Sin Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de productos */}
      <Card>
        <CardHeader>
          <CardTitle>Productos ({filteredProductos.length})</CardTitle>
          <CardDescription>
            Lista de productos farmacéuticos con códigos de barras
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Cargando productos...</span>
            </div>
          ) : loadError ? (
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{loadError}</p>
              <Button onClick={loadProductosData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          ) : filteredProductos.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No se encontraron productos</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <PackagePlus className="h-4 w-4 mr-2" />
                Agregar Producto
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProductos.map((producto) => (
                <div
                  key={producto.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Barcode className="h-8 w-8 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{producto.nombre}</h3>
                        <Badge variant="outline">{producto.codigo}</Badge>
                        {!producto.activo && (
                          <Badge variant="destructive">Inactivo</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{producto.descripcion}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Categoría: {producto.categoria_nombre}</span>
                        <span>Proveedor: {producto.proveedor_nombre}</span>
                        <span>Precio: ${producto.precio.toFixed(2)}</span>
                        <span>Unidad: {producto.unidad_medida}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStockBadgeColor(producto.stock, producto.stock_minimo)}>
                      Stock: {producto.stock} (Mín: {producto.stock_minimo})
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShowBarcode(producto)}
                    >
                      <Barcode className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProducto(producto)}
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

      {/* Dialog de código de barras */}
      <Dialog open={showBarcodeDialog} onOpenChange={setShowBarcodeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Código de Barras del Producto</DialogTitle>
            <DialogDescription>
              Código de barras para {selectedProductoForBarcode?.nombre}
            </DialogDescription>
          </DialogHeader>
          {selectedProductoForBarcode && (
            <div className="space-y-6">
              <ProductBarcodeLabel
                codigo={selectedProductoForBarcode.codigo}
                nombre={selectedProductoForBarcode.nombre}
                precio={selectedProductoForBarcode.precio}
              />
              <div className="flex justify-center">
                <Button onClick={() => window.print()}>
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir Etiqueta
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de edición */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
            <DialogDescription>
              Modifica la información del producto seleccionado
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  value={editFormData.codigo}
                  onChange={(e) => handleEditFormChange('codigo', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={editFormData.nombre}
                  onChange={(e) => handleEditFormChange('nombre', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={editFormData.descripcion}
                onChange={(e) => handleEditFormChange('descripcion', e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="categoria">Categoría</Label>
                <Select
                  value={editFormData.categoria_id}
                  onValueChange={(value) => handleEditFormChange('categoria_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map(categoria => (
                      <SelectItem key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="proveedor">Proveedor</Label>
                <Select
                  value={editFormData.proveedor_id}
                  onValueChange={(value) => handleEditFormChange('proveedor_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {proveedores.map(proveedor => (
                      <SelectItem key={proveedor.id} value={proveedor.id}>
                        {proveedor.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="precio">Precio</Label>
                <Input
                  id="precio"
                  type="number"
                  step="0.01"
                  value={editFormData.precio}
                  onChange={(e) => handleEditFormChange('precio', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={editFormData.stock}
                  onChange={(e) => handleEditFormChange('stock', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="stock_minimo">Stock Mínimo</Label>
                <Input
                  id="stock_minimo"
                  type="number"
                  value={editFormData.stock_minimo}
                  onChange={(e) => handleEditFormChange('stock_minimo', parseInt(e.target.value))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="unidad_medida">Unidad de Medida</Label>
                <Select
                  value={editFormData.unidad_medida}
                  onValueChange={(value) => handleEditFormChange('unidad_medida', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unidad">Unidad</SelectItem>
                    <SelectItem value="caja">Caja</SelectItem>
                    <SelectItem value="frasco">Frasco</SelectItem>
                    <SelectItem value="inhalador">Inhalador</SelectItem>
                    <SelectItem value="paquete">Paquete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="activo">Producto Activo</Label>
                  <p className="text-sm text-gray-500">El producto está disponible para venta</p>
                </div>
                <Switch
                  id="activo"
                  checked={editFormData.activo}
                  onCheckedChange={(checked) => handleEditFormChange('activo', checked)}
                />
              </div>
            </div>
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
              onClick={handleSaveProducto}
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

