"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { OfferModal, DeleteConfirmationModal, ProductsModal, ExportOptionsModal } from "@/components/modals";
import { pdfExportService, type OfferData, type ExportOptions } from "@/lib/services/export-pdf";
import { 
  Zap, 
  Search, 
  Filter, 
  Clock, 
  Percent,
  Star,
  ShoppingCart,
  Eye,
  Edit,
  Trash2,
  Plus,
  Calendar,
  Tag,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Loader2,
  X
} from "lucide-react";

interface Offer {
  id: string;
  title: string;
  description: string;
  discount: number;
  originalPrice: number;
  offerPrice: number;
  category: string;
  image: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  productCount: number;
  views: number;
}

const mockOffers: Offer[] = [
  {
    id: "1",
    title: "Descuento en Vitaminas",
    description: "20% de descuento en toda la línea de vitaminas y suplementos",
    discount: 20,
    originalPrice: 100,
    offerPrice: 80,
    category: "Vitaminas",
    image: "🧬",
    isActive: true,
    startDate: "2024-01-01",
    endDate: "2024-01-31",
    productCount: 45,
    views: 1250
  },
  {
    id: "2",
    title: "Oferta de Medicamentos",
    description: "15% de descuento en medicamentos de prescripción",
    discount: 15,
    originalPrice: 200,
    offerPrice: 170,
    category: "Medicamentos",
    image: "💊",
    isActive: true,
    startDate: "2024-01-15",
    endDate: "2024-02-15",
    productCount: 78,
    views: 890
  },
  {
    id: "3",
    title: "Cuidado Personal",
    description: "30% de descuento en productos de cuidado personal",
    discount: 30,
    originalPrice: 150,
    offerPrice: 105,
    category: "Cuidado Personal",
    image: "🧴",
    isActive: true,
    startDate: "2024-01-10",
    endDate: "2024-01-25",
    productCount: 32,
    views: 2100
  },
  {
    id: "4",
    title: "Equipos Médicos",
    description: "10% de descuento en equipos médicos especializados",
    discount: 10,
    originalPrice: 500,
    offerPrice: 450,
    category: "Equipos Médicos",
    image: "🩺",
    isActive: false,
    startDate: "2023-12-01",
    endDate: "2023-12-31",
    productCount: 12,
    views: 450
  },
  {
    id: "5",
    title: "Maternidad e Infantil",
    description: "25% de descuento en productos para madres y bebés",
    discount: 25,
    originalPrice: 80,
    offerPrice: 60,
    category: "Maternidad",
    image: "👶",
    isActive: true,
    startDate: "2024-01-20",
    endDate: "2024-02-20",
    productCount: 28,
    views: 1680
  }
];

export default function OfertasPage() {
  const [offers, setOffers] = useState<Offer[]>(mockOffers);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [sortBy, setSortBy] = useState<'discount' | 'views' | 'date'>('discount');
  
  // Estados para modales
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [offerProducts, setOfferProducts] = useState<any[]>([]);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const now = new Date();
    const endDate = new Date(offer.endDate);
    const isExpired = endDate < now;
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && offer.isActive && !isExpired) ||
                         (filterStatus === 'inactive' && !offer.isActive) ||
                         (filterStatus === 'expired' && isExpired);
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'discount':
        return b.discount - a.discount;
      case 'views':
        return b.views - a.views;
      case 'date':
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      default:
        return 0;
    }
  });

  const getStatusBadge = (offer: Offer) => {
    const now = new Date();
    const endDate = new Date(offer.endDate);
    const isExpired = endDate < now;
    
    if (isExpired) {
      return <Badge className="bg-red-100 text-red-800">Expirada</Badge>;
    }
    if (!offer.isActive) {
      return <Badge className="bg-gray-100 text-gray-800">Inactiva</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">Activa</Badge>;
  };

  const getDaysRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Funciones CRUD
  const handleCreateOffer = () => {
    setSelectedOffer(null);
    setModalMode('create');
    setShowOfferModal(true);
  };

  const handleEditOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    setModalMode('edit');
    setShowOfferModal(true);
  };

  const handleViewOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    setModalMode('edit');
    setShowOfferModal(true);
  };

  const handleDeleteOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    setShowDeleteModal(true);
  };

  const handleSaveOffer = async (offerData: Omit<Offer, 'id' | 'productCount' | 'views'>) => {
    console.log('=== HANDLE SAVE OFFER LLAMADO ===');
    console.log('Datos recibidos:', offerData);
    console.log('Modal mode:', modalMode);
    console.log('Selected offer:', selectedOffer);
    
    setIsLoading(true);
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (modalMode === 'create') {
        console.log('📝 CREANDO NUEVA OFERTA');
        const newOffer: Offer = {
          ...offerData,
          id: Date.now().toString(),
          productCount: 0,
          views: 0
        };
        console.log('Nueva oferta creada:', newOffer);
        setOffers(prev => {
          const updated = [...prev, newOffer];
          console.log('Ofertas actualizadas:', updated);
          return updated;
        });
        setToastMessage('Oferta creada exitosamente');
        console.log('✅ OFERTA CREADA EXITOSAMENTE');
      } else {
        console.log('✏️ ACTUALIZANDO OFERTA EXISTENTE');
        setOffers(prev => 
          prev.map(offer => 
            offer.id === selectedOffer?.id 
              ? { ...offer, ...offerData }
              : offer
          )
        );
        setToastMessage('Oferta actualizada exitosamente');
        console.log('✅ OFERTA ACTUALIZADA EXITOSAMENTE');
      }
      
      setShowToast(true);
      setShowOfferModal(false);
      console.log('Modal cerrado y toast mostrado');
    } catch (error) {
      console.error('❌ Error saving offer:', error);
      setToastMessage('Error al guardar la oferta');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedOffer) return;
    
    setIsLoading(true);
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setOffers(prev => prev.filter(offer => offer.id !== selectedOffer.id));
      setToastMessage('Oferta eliminada exitosamente');
      setShowToast(true);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting offer:', error);
      setToastMessage('Error al eliminar la oferta');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModals = () => {
    setShowOfferModal(false);
    setShowDeleteModal(false);
    setShowProductsModal(false);
    setShowExportModal(false);
    setSelectedOffer(null);
  };

  const handleViewProducts = (offer: Offer) => {
    console.log('🔍 Ver productos de la oferta:', offer);
    
    // Simular productos de la oferta
    const mockProducts = [
      {
        id: '1',
        name: 'Vitamina C 1000mg',
        price: offer.originalPrice,
        offerPrice: offer.offerPrice,
        stock: 50,
        category: offer.category,
        image: '💊'
      },
      {
        id: '2', 
        name: 'Multivitamínico Completo',
        price: offer.originalPrice * 1.2,
        offerPrice: offer.offerPrice * 1.2,
        stock: 30,
        category: offer.category,
        image: '🧬'
      },
      {
        id: '3',
        name: 'Suplemento de Hierro',
        price: offer.originalPrice * 0.8,
        offerPrice: offer.offerPrice * 0.8,
        stock: 25,
        category: offer.category,
        image: '🩸'
      },
      {
        id: '4',
        name: 'Omega 3 Premium',
        price: offer.originalPrice * 1.5,
        offerPrice: offer.offerPrice * 1.5,
        stock: 20,
        category: offer.category,
        image: '🐟'
      },
      {
        id: '5',
        name: 'Calcio + Vitamina D',
        price: offer.originalPrice * 0.9,
        offerPrice: offer.offerPrice * 0.9,
        stock: 40,
        category: offer.category,
        image: '🦴'
      }
    ];

    // Guardar productos y mostrar modal
    setOfferProducts(mockProducts);
    setSelectedOffer(offer);
    setShowProductsModal(true);
    setToastMessage(`Mostrando ${mockProducts.length} productos de la oferta: ${offer.title}`);
    setShowToast(true);
  };

  const handleToggleOfferStatus = (offerId: string) => {
    setOffers(prev => 
      prev.map(offer => 
        offer.id === offerId 
          ? { ...offer, isActive: !offer.isActive }
          : offer
      )
    );
    setToastMessage('Estado de la oferta actualizado');
    setShowToast(true);
  };

  const handleExportWithOptions = async (options: ExportOptions) => {
    setShowExportModal(false);
    setToastMessage('Generando PDF con opciones personalizadas...');
    setShowToast(true);
    setIsLoading(true);
    
    try {
      // Convertir ofertas al formato esperado por el servicio PDF
      const offersData: OfferData[] = offers.map(offer => ({
        id: offer.id,
        title: offer.title,
        description: offer.description,
        discount: offer.discount,
        originalPrice: offer.originalPrice,
        offerPrice: offer.offerPrice,
        category: offer.category,
        image: offer.image,
        isActive: offer.isActive,
        startDate: offer.startDate,
        endDate: offer.endDate,
        productCount: offer.productCount,
        views: offer.views
      }));

      // Generar PDF con opciones personalizadas
      const result = await pdfExportService.exportOffers(offersData, options);
      
      if (result.success) {
        setToastMessage(`PDF generado exitosamente: ${result.filename}`);
        setShowToast(true);
        console.log('✅ PDF exportado con opciones:', result);
      } else {
        setToastMessage(`Error al generar PDF: ${result.error}`);
        setShowToast(true);
        console.error('❌ Error exportando PDF:', result.error);
      }
    } catch (error) {
      console.error('Error en exportación:', error);
      setToastMessage('Error al generar el PDF');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Zap className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ofertas y Promociones</h1>
              <p className="text-gray-600">Gestiona las ofertas especiales y descuentos</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
            setFilterStatus('all');
            setToastMessage('Mostrando todas las ofertas');
            setShowToast(true);
          }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Ofertas</p>
                  <p className="text-2xl font-bold text-gray-900">{offers.length}</p>
                </div>
                <Zap className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
            setFilterStatus('active');
            setToastMessage('Mostrando solo ofertas activas');
            setShowToast(true);
          }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Activas</p>
                  <p className="text-2xl font-bold text-green-600">{offers.filter(o => o.isActive && new Date(o.endDate) > new Date()).length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
            setSortBy('discount');
            setToastMessage('Ordenando por mayor descuento');
            setShowToast(true);
          }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Descuento Promedio</p>
                  <p className="text-2xl font-bold text-purple-600">{Math.round(offers.reduce((sum, o) => sum + o.discount, 0) / offers.length)}%</p>
                </div>
                <Percent className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
            setSortBy('views');
            setToastMessage('Ordenando por más vistas');
            setShowToast(true);
          }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Visualizaciones</p>
                  <p className="text-2xl font-bold text-orange-600">{offers.reduce((sum, o) => sum + o.views, 0).toLocaleString()}</p>
                </div>
                <Eye className="h-8 w-8 text-orange-600" />
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
                    placeholder="Buscar ofertas..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      if (e.target.value.length > 2) {
                        setToastMessage(`Buscando: "${e.target.value}"`);
                        setShowToast(true);
                      }
                    }}
                    className="pl-10"
                    title="Buscar ofertas por título, descripción o categoría"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value as 'all' | 'active' | 'inactive' | 'expired');
                    setToastMessage(`Filtro aplicado: ${e.target.value}`);
                    setShowToast(true);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Filtrar por estado"
                >
                  <option value="all">Todas las ofertas</option>
                  <option value="active">Solo activas</option>
                  <option value="inactive">Solo inactivas</option>
                  <option value="expired">Expiradas</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as 'discount' | 'views' | 'date');
                    setToastMessage(`Ordenamiento aplicado: ${e.target.value}`);
                    setShowToast(true);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Ordenar por"
                >
                  <option value="discount">Mayor descuento</option>
                  <option value="views">Más vistas</option>
                  <option value="date">Más recientes</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                    setSortBy('discount');
                    setToastMessage('Filtros limpiados');
                    setShowToast(true);
                  }}
                  title="Limpiar todos los filtros"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowExportModal(true)}
                  disabled={isLoading}
                  title="Exportar ofertas a PDF con opciones avanzadas"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
                <Button size="sm" onClick={handleCreateOffer}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Oferta
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map((offer) => {
            const daysRemaining = getDaysRemaining(offer.endDate);
            const isExpired = daysRemaining < 0;
            
            return (
              <Card key={offer.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{offer.image}</div>
                      <div>
                        <CardTitle className="text-lg">{offer.title}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusBadge(offer)}
                          <Badge className="bg-blue-100 text-blue-800">{offer.category}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewOffer(offer)}
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditOffer(offer)}
                        title="Editar oferta"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteOffer(offer)}
                        title="Eliminar oferta"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{offer.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Descuento:</span>
                      <span className="text-lg font-bold text-green-600">{offer.discount}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Precio original:</span>
                      <span className="text-sm line-through text-gray-400">${offer.originalPrice}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Precio oferta:</span>
                      <span className="text-lg font-bold text-blue-600">${offer.offerPrice}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Productos:</span>
                      <span className="text-sm">{offer.productCount}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Visualizaciones:</span>
                      <span className="text-sm">{offer.views.toLocaleString()}</span>
                    </div>
                    
                    {!isExpired && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Días restantes:</span>
                        <span className={`text-sm font-medium ${daysRemaining <= 3 ? 'text-red-600' : 'text-gray-600'}`}>
                          {daysRemaining} días
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <Button
                      variant={offer.isActive ? "outline" : "default"}
                      size="sm"
                      className="w-full"
                      onClick={() => handleToggleOfferStatus(offer.id)}
                      title={offer.isActive ? 'Desactivar oferta' : 'Activar oferta'}
                    >
                      {offer.isActive ? 'Desactivar' : 'Activar'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleViewProducts(offer)}
                      title="Ver productos de esta oferta"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Ver Productos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredOffers.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron ofertas</h3>
              <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
            </CardContent>
          </Card>
        )}

        {/* Modales */}
        <OfferModal
          isOpen={showOfferModal}
          onClose={handleCloseModals}
          onSave={handleSaveOffer}
          offer={selectedOffer}
          mode={modalMode}
        />

        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={handleCloseModals}
          onConfirm={handleConfirmDelete}
          title="Eliminar Oferta"
          description="¿Estás seguro de que deseas eliminar esta oferta? Esta acción no se puede deshacer."
          itemName={selectedOffer?.title || ''}
          isLoading={isLoading}
        />

        <ProductsModal
          isOpen={showProductsModal}
          onClose={handleCloseModals}
          offer={selectedOffer}
          products={offerProducts}
        />

        <ExportOptionsModal
          isOpen={showExportModal}
          onClose={handleCloseModals}
          onExport={handleExportWithOptions}
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
