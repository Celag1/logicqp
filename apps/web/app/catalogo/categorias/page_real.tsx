"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

// Importar Supabase para obtener datos reales
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

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

export default function CategoriasPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Función para cargar categorías reales desde Supabase
  const loadCategories = async () => {
    try {
      setLoading(true);

      const { data: categorias, error: categoriasError } = await supabase
        .from('categorias')
        .select(`
          *,
          productos(
            id,
            precio_venta
          )
        `)
        .order('nombre', { ascending: true });

      if (categoriasError) {
        console.error('Error cargando categorías:', categoriasError);
        return;
      }

      // Transformar datos de Supabase al formato esperado
      const realCategories: Category[] = categorias?.map((categoria: any, index: number) => {
        const productCount = categoria.productos?.length || 0;
        const averagePrice = productCount > 0 
          ? categoria.productos.reduce((sum: number, p: any) => sum + (p.precio_venta || 0), 0) / productCount
          : 0;

        // Asignar colores e iconos basados en el tipo de categoría
        const getCategoryStyle = (name: string) => {
          const lowerName = name.toLowerCase();
          if (lowerName.includes('antibiótico')) return { image: '💊', color: 'bg-red-100 text-red-800' };
          if (lowerName.includes('analgésico')) return { image: '🩹', color: 'bg-blue-100 text-blue-800' };
          if (lowerName.includes('antiinflamatorio')) return { image: '🧴', color: 'bg-green-100 text-green-800' };
          if (lowerName.includes('antihistamínico')) return { image: '🤧', color: 'bg-yellow-100 text-yellow-800' };
          if (lowerName.includes('vitamina')) return { image: '💊', color: 'bg-purple-100 text-purple-800' };
          if (lowerName.includes('mineral')) return { image: '💊', color: 'bg-indigo-100 text-indigo-800' };
          if (lowerName.includes('probiótico')) return { image: '🦠', color: 'bg-pink-100 text-pink-800' };
          if (lowerName.includes('equipo')) return { image: '🩺', color: 'bg-gray-100 text-gray-800' };
          if (lowerName.includes('insumo')) return { image: '🧻', color: 'bg-orange-100 text-orange-800' };
          return { image: '💊', color: 'bg-blue-100 text-blue-800' };
        };

        const style = getCategoryStyle(categoria.nombre);

        return {
          id: categoria.id.toString(),
          name: categoria.nombre,
          description: categoria.descripcion || 'Sin descripción',
          productCount: productCount,
          averagePrice: averagePrice,
          image: style.image,
          color: style.color,
          isActive: true,
          createdAt: categoria.created_at || new Date().toISOString()
        };
      }) || [];

      setCategories(realCategories);
      setFilteredCategories(realCategories);

    } catch (error) {
      console.error('Error cargando categorías:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtros
  useEffect(() => {
    let filtered = categories;

    if (searchTerm) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCategories(filtered);
  }, [categories, searchTerm]);

  useEffect(() => {
    loadCategories();
  }, []);

  const getTotalProducts = () => {
    return categories.reduce((total, category) => total + category.productCount, 0);
  };

  const getAveragePrice = () => {
    const totalPrice = categories.reduce((total, category) => total + category.averagePrice, 0);
    return categories.length > 0 ? totalPrice / categories.length : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando categorías desde la base de datos...</p>
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
                Categorías de Productos
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                {filteredCategories.length} categorías farmacéuticas de Qualipharm
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Categoría
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Categorías</p>
                  <p className="text-3xl font-bold text-blue-600">{categories.length}</p>
                </div>
                <ClipboardList className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Productos</p>
                  <p className="text-3xl font-bold text-green-600">{getTotalProducts()}</p>
                </div>
                <Package className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Precio Promedio</p>
                  <p className="text-3xl font-bold text-purple-600">${getAveragePrice().toFixed(2)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar categorías..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Categorías */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map((category) => (
              <Card key={category.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl ${category.color}`}>
                      {category.image}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{category.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Productos:</span>
                        <span className="font-medium">{category.productCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Precio Promedio:</span>
                        <span className="font-medium">${category.averagePrice.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCategories.map((category) => (
              <Card key={category.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${category.color}`}>
                      {category.image}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-500">
                          <Package className="h-4 w-4 inline mr-1" />
                          {category.productCount} productos
                        </span>
                        <span className="text-sm text-gray-500">
                          <TrendingUp className="h-4 w-4 inline mr-1" />
                          ${category.averagePrice.toFixed(2)} promedio
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredCategories.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg">No se encontraron categorías</p>
            <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
}


