"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CategoryModal, DeleteConfirmationModal } from "@/components/modals";
import UniversalExportButton from "@/components/universal-export-button";
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Grid, 
  List,
  Package,
  Star,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Loader2,
  X
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
  averagePrice: number;
  image: string;
  color: string;
  isActive: boolean;
  createdAt: string;
}

const mockCategories: Category[] = [
  {
    id: "1",
    name: "Medicamentos",
    description: "Medicamentos de prescripción y de venta libre",
    productCount: 245,
    averagePrice: 15.50,
    image: "💊",
    color: "bg-blue-100 text-blue-800",
    isActive: true,
    createdAt: "2024-01-15"
  },
  {
    id: "2",
    name: "Vitaminas y Suplementos",
    description: "Vitaminas, minerales y suplementos nutricionales",
    productCount: 189,
    averagePrice: 22.75,
    image: "🧬",
    color: "bg-green-100 text-green-800",
    isActive: true,
    createdAt: "2024-01-15"
  },
  {
    id: "3",
    name: "Cuidado Personal",
    description: "Productos de higiene y cuidado personal",
    productCount: 156,
    averagePrice: 8.90,
    image: "🧴",
    color: "bg-purple-100 text-purple-800",
    isActive: true,
    createdAt: "2024-01-15"
  },
  {
    id: "4",
    name: "Equipos Médicos",
    description: "Instrumentos y equipos médicos especializados",
    productCount: 78,
    averagePrice: 125.30,
    image: "🩺",
    color: "bg-orange-100 text-orange-800",
    isActive: true,
    createdAt: "2024-01-15"
  },
  {
    id: "5",
    name: "Maternidad e Infantil",
    description: "Productos para madres y bebés",
    productCount: 92,
    averagePrice: 18.45,
    image: "👶",
    color: "bg-pink-100 text-pink-800",
    isActive: true,
    createdAt: "2024-01-15"
  },
  {
    id: "6",
    name: "Salud Mental",
    description: "Productos para el bienestar mental y emocional",
    productCount: 45,
    averagePrice: 35.80,
    image: "🧠",
    color: "bg-indigo-100 text-indigo-800",
    isActive: false,
    createdAt: "2024-01-15"
  }
];

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Estados para modales
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterActive === 'all' || 
                         (filterActive === 'active' && category.isActive) ||
                         (filterActive === 'inactive' && !category.isActive);
    return matchesSearch && matchesFilter;
  });

  const toggleCategoryStatus = (id: string) => {
    setCategories(prev => 
      prev.map(category => 
        category.id === id 
          ? { ...category, isActive: !category.isActive }
          : category
      )
    );
  };

  // Funciones CRUD
  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setModalMode('create');
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setModalMode('edit');
    setShowCategoryModal(true);
  };

  const handleViewCategory = (category: Category) => {
    setSelectedCategory(category);
    setModalMode('edit');
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const handleSaveCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'productCount'>) => {
    setIsLoading(true);
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (modalMode === 'create') {
        const newCategory: Category = {
          ...categoryData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          productCount: 0
        };
        setCategories(prev => [...prev, newCategory]);
        setToastMessage('Categoría creada exitosamente');
      } else {
        setCategories(prev => 
          prev.map(cat => 
            cat.id === selectedCategory?.id 
              ? { ...cat, ...categoryData }
              : cat
          )
        );
        setToastMessage('Categoría actualizada exitosamente');
      }
      
      setShowToast(true);
      setShowCategoryModal(false);
    } catch (error) {
      console.error('Error saving category:', error);
      setToastMessage('Error al guardar la categoría');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCategory) return;
    
    setIsLoading(true);
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCategories(prev => prev.filter(cat => cat.id !== selectedCategory.id));
      setToastMessage('Categoría eliminada exitosamente');
      setShowToast(true);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting category:', error);
      setToastMessage('Error al eliminar la categoría');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModals = () => {
    setShowCategoryModal(false);
    setShowDeleteModal(false);
    setSelectedCategory(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Categorías de Productos</h1>
              <p className="text-gray-600">Gestiona las categorías y clasificaciones de productos</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Categorías</p>
                  <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                </div>
                <ClipboardList className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Activas</p>
                  <p className="text-2xl font-bold text-green-600">{categories.filter(c => c.isActive).length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Productos</p>
                  <p className="text-2xl font-bold text-purple-600">{categories.reduce((sum, c) => sum + c.productCount, 0)}</p>
                </div>
                <Package className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Promedio por Categoría</p>
                  <p className="text-2xl font-bold text-orange-600">{Math.round(categories.reduce((sum, c) => sum + c.productCount, 0) / categories.length)}</p>
                </div>
                <Star className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar categorías..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filterActive}
                  onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Filtrar por estado"
                >
                  <option value="all">Todas las categorías</option>
                  <option value="active">Solo activas</option>
                  <option value="inactive">Solo inactivas</option>
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex border border-gray-300 rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <UniversalExportButton
                    data={filteredCategories}
                    title="Categorías de Productos"
                    subtitle="Lista completa de categorías farmacéuticas"
                    columns={[
                      { key: 'name', label: 'Nombre', width: 25 },
                      { key: 'description', label: 'Descripción', width: 30 },
                      { key: 'productCount', label: 'Cantidad de Productos', type: 'number', width: 20 },
                      { key: 'averagePrice', label: 'Precio Promedio', type: 'currency', width: 20 },
                      { key: 'isActive', label: 'Estado', type: 'boolean', width: 10 }
                    ]}
                    summary={[
                      { label: 'Total categorías', value: filteredCategories.length, icon: '📂' },
                      { label: 'Categorías activas', value: filteredCategories.filter(c => c.isActive).length, icon: '✅' },
                      { label: 'Categorías inactivas', value: filteredCategories.filter(c => !c.isActive).length, icon: '❌' },
                      { label: 'Total productos', value: filteredCategories.reduce((sum, c) => sum + c.productCount, 0), icon: '📦' },
                      { label: 'Promedio productos/categoría', value: Math.round(filteredCategories.reduce((sum, c) => sum + c.productCount, 0) / filteredCategories.length || 0), icon: '📊' },
                      { label: 'Categoría con más productos', value: filteredCategories.reduce((max, c) => c.productCount > max.productCount ? c : max, filteredCategories[0])?.name || 'N/A', icon: '🏆' }
                    ]}
                    filters={[
                      { label: 'Búsqueda', value: searchTerm || 'Ninguna' },
                      { label: 'Estado', value: 'Todas' }
                    ]}
                    variant="outline"
                    size="sm"
                    className="border-gray-200 hover:border-blue-500 hover:bg-blue-50"
                    showAdvancedOptions={true}
                  />
                  <Button size="sm" onClick={handleCreateCategory}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Categoría
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <Card key={category.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{category.image}</div>
                      <div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <Badge className={category.color}>
                          {category.isActive ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewCategory(category)}
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                        title="Editar categoría"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteCategory(category)}
                        title="Eliminar categoría"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{category.productCount} productos</span>
                    <span>Creada: {new Date(category.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-4">
                    <Button
                      variant={category.isActive ? "outline" : "default"}
                      size="sm"
                      className="w-full"
                      onClick={() => toggleCategoryStatus(category.id)}
                    >
                      {category.isActive ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCategories.map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{category.image}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                        <p className="text-gray-600">{category.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>{category.productCount} productos</span>
                          <span>Creada: {new Date(category.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={category.color}>
                        {category.isActive ? 'Activa' : 'Inactiva'}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewCategory(category)}
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                          title="Editar categoría"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteCategory(category)}
                          title="Eliminar categoría"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredCategories.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron categorías</h3>
              <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
            </CardContent>
          </Card>
        )}

        {/* Modales */}
        <CategoryModal
          isOpen={showCategoryModal}
          onClose={handleCloseModals}
          onSave={handleSaveCategory}
          category={selectedCategory}
          mode={modalMode}
        />

        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={handleCloseModals}
          onConfirm={handleConfirmDelete}
          title="Eliminar Categoría"
          description="¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer."
          itemName={selectedCategory?.name || ''}
          isLoading={isLoading}
        />

        {/* Toast de notificación */}
        {showToast && (
          <div className="fixed top-4 right-4 z-50">
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-gray-900">{toastMessage}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowToast(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
