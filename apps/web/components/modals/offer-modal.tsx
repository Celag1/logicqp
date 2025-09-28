"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { 
  X, 
  Save, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Calendar,
  Percent,
  DollarSign,
  Tag,
  Image,
  Type,
  FileText,
  ToggleLeft,
  Sparkles,
  Clock,
  Eye,
  TrendingUp
} from 'lucide-react';

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

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (offer: Omit<Offer, 'id' | 'productCount' | 'views'>) => void;
  offer?: Offer | null;
  mode: 'create' | 'edit';
}

const categoryOptions = [
  'Medicamentos',
  'Vitaminas y Suplementos',
  'Cuidado Personal',
  'Equipos Médicos',
  'Maternidad e Infantil',
  'Salud Mental',
  'Primeros Auxilios',
  'Cuidado de la Piel',
  'Salud Digestiva',
  'Salud Cardiovascular'
];

const emojiOptions = [
  '💊', '🧬', '🧴', '🩺', '👶', '🧠', '💉', '🦷', '👁️', '🦴',
  '🩹', '🌡️', '💊', '🧪', '🔬', '📋', '📊', '⚕️', '🏥', '🚑',
  '💊', '🧴', '🩺', '👶', '🧠', '💉', '🦷', '👁️', '🦴', '🩹'
];

export default function OfferModal({ isOpen, onClose, onSave, offer, mode }: OfferModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount: 0,
    originalPrice: 0,
    offerPrice: 0,
    category: 'Medicamentos',
    image: '💊',
    isActive: true,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Inicializar formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && offer) {
        setFormData({
          title: offer.title,
          description: offer.description,
          discount: offer.discount,
          originalPrice: offer.originalPrice,
          offerPrice: offer.offerPrice,
          category: offer.category,
          image: offer.image,
          isActive: offer.isActive,
          startDate: offer.startDate,
          endDate: offer.endDate
        });
      } else {
        setFormData({
          title: '',
          description: '',
          discount: 0,
          originalPrice: 0,
          offerPrice: 0,
          category: 'Medicamentos',
          image: '💊',
          isActive: true,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, offer]);

  // Calcular precio de oferta automáticamente
  useEffect(() => {
    if (formData.originalPrice > 0 && formData.discount > 0) {
      const calculatedOfferPrice = formData.originalPrice * (1 - formData.discount / 100);
      setFormData(prev => ({ ...prev, offerPrice: Math.round(calculatedOfferPrice * 100) / 100 }));
    }
  }, [formData.originalPrice, formData.discount]);

  // Validación en tiempo real
  const validateField = (name: string, value: string | number) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'title':
        if (!value || (typeof value === 'string' && !value.trim())) {
          newErrors.title = 'El título es requerido';
        } else if (typeof value === 'string' && value.length < 3) {
          newErrors.title = 'El título debe tener al menos 3 caracteres';
        } else if (typeof value === 'string' && value.length > 100) {
          newErrors.title = 'El título no puede exceder 100 caracteres';
        } else {
          delete newErrors.title;
        }
        break;
      case 'description':
        if (!value || (typeof value === 'string' && !value.trim())) {
          newErrors.description = 'La descripción es requerida';
        } else if (typeof value === 'string' && value.length < 10) {
          newErrors.description = 'La descripción debe tener al menos 10 caracteres';
        } else if (typeof value === 'string' && value.length > 300) {
          newErrors.description = 'La descripción no puede exceder 300 caracteres';
        } else {
          delete newErrors.description;
        }
        break;
      case 'discount':
        if (typeof value === 'number' && (value < 1 || value > 99)) {
          newErrors.discount = 'El descuento debe estar entre 1% y 99%';
        } else {
          delete newErrors.discount;
        }
        break;
      case 'originalPrice':
        if (typeof value === 'number' && value <= 0) {
          newErrors.originalPrice = 'El precio original debe ser mayor a 0';
        } else {
          delete newErrors.originalPrice;
        }
        break;
      case 'startDate':
        if (typeof value === 'string' && new Date(value) < new Date()) {
          newErrors.startDate = 'La fecha de inicio no puede ser anterior a hoy';
        } else {
          delete newErrors.startDate;
        }
        break;
      case 'endDate':
        if (typeof value === 'string' && new Date(value) <= new Date(formData.startDate)) {
          newErrors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
        } else {
          delete newErrors.endDate;
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (name: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSave = async () => {
    console.log('=== INICIANDO GUARDADO DE OFERTA ===');
    console.log('Datos del formulario:', formData);
    console.log('isFormValid:', isFormValid);
    
    // Validación simple
    if (!formData.title.trim() || formData.title.trim().length < 3) {
      console.log('❌ Título muy corto');
      return;
    }
    
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      console.log('❌ Descripción muy corta');
      return;
    }
    
    if (formData.discount <= 0 || formData.discount > 99) {
      console.log('❌ Descuento inválido');
      return;
    }
    
    if (formData.originalPrice <= 0) {
      console.log('❌ Precio original inválido');
      return;
    }

    console.log('✅ VALIDACIÓN EXITOSA - Procediendo a guardar');
    setIsLoading(true);
    
    try {
      console.log('📤 Enviando datos de oferta a la función onSave...');
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('📞 Llamando a onSave con datos:', formData);
      onSave(formData);
      console.log('✅ Oferta guardada exitosamente');
      onClose();
    } catch (error) {
      console.error('❌ Error saving offer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.title.trim().length >= 3 && 
                     formData.description.trim().length >= 10 && 
                     formData.discount > 0 && 
                     formData.originalPrice > 0;

  const getDaysRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {mode === 'create' ? 'Nueva Oferta' : 'Editar Oferta'}
              </h2>
              <p className="text-sm text-gray-500">
                {mode === 'create' ? 'Crea una nueva oferta especial' : 'Modifica los datos de la oferta'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Validation Status */}
          <div className={`p-3 rounded-lg flex items-center space-x-2 ${
            isFormValid 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-yellow-50 border border-yellow-200'
          }`}>
            {isFormValid ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-700 font-medium">
                  Formulario completo - Listo para guardar
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <span className="text-sm text-yellow-700">
                  Complete todos los campos requeridos para continuar
                </span>
              </>
            )}
          </div>

          {/* Preview Card */}
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600 flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                Vista Previa de la Oferta
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{formData.image}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">
                      {formData.title || 'Título de la oferta'}
                    </h3>
                    <Badge className="bg-green-100 text-green-800">
                      {formData.isActive ? 'Activa' : 'Inactiva'}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800">
                      {formData.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {formData.description || 'Descripción de la oferta'}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-sm">
                    <span className="text-green-600 font-bold">
                      {formData.discount}% OFF
                    </span>
                    <span className="text-gray-500">
                      ${formData.originalPrice} → ${formData.offerPrice}
                    </span>
                    <span className="text-gray-500">
                      {getDaysRemaining(formData.endDate)} días restantes
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center space-x-2">
                <Type className="h-4 w-4" />
                <span>Título de la oferta *</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Ej: Descuento en Vitaminas"
                className={errors.title ? 'border-red-500 focus:border-red-500' : ''}
                title="Título de la oferta"
              />
              {errors.title && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Categoría */}
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Tag className="h-4 w-4" />
                <span>Categoría *</span>
              </Label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Categoría de la oferta"
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Descripción *</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe los detalles de la oferta especial..."
              rows={3}
              className={errors.description ? 'border-red-500 focus:border-red-500' : ''}
              title="Descripción de la oferta"
            />
            <div className="flex justify-between items-center">
              {errors.description ? (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.description}
                </p>
              ) : (
                <div></div>
              )}
              <span className="text-xs text-gray-500">
                {formData.description.length}/300 caracteres
              </span>
            </div>
          </div>

          {/* Precios y Descuento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Precio Original */}
            <div className="space-y-2">
              <Label htmlFor="originalPrice" className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Precio Original *</span>
              </Label>
              <Input
                id="originalPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.originalPrice}
                onChange={(e) => handleInputChange('originalPrice', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={errors.originalPrice ? 'border-red-500 focus:border-red-500' : ''}
                title="Precio original del producto"
              />
              {errors.originalPrice && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.originalPrice}
                </p>
              )}
            </div>

            {/* Descuento */}
            <div className="space-y-2">
              <Label htmlFor="discount" className="flex items-center space-x-2">
                <Percent className="h-4 w-4" />
                <span>Descuento (%) *</span>
              </Label>
              <Input
                id="discount"
                type="number"
                min="1"
                max="99"
                value={formData.discount}
                onChange={(e) => handleInputChange('discount', parseInt(e.target.value) || 0)}
                placeholder="0"
                className={errors.discount ? 'border-red-500 focus:border-red-500' : ''}
                title="Porcentaje de descuento"
              />
              {errors.discount && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.discount}
                </p>
              )}
            </div>

            {/* Precio de Oferta (Calculado) */}
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Precio de Oferta</span>
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.offerPrice}
                readOnly
                className="bg-gray-50 text-gray-600"
                title="Precio calculado automáticamente"
              />
              <p className="text-xs text-gray-500">Calculado automáticamente</p>
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fecha de Inicio */}
            <div className="space-y-2">
              <Label htmlFor="startDate" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Fecha de Inicio *</span>
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className={errors.startDate ? 'border-red-500 focus:border-red-500' : ''}
                title="Fecha de inicio de la oferta"
              />
              {errors.startDate && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.startDate}
                </p>
              )}
            </div>

            {/* Fecha de Fin */}
            <div className="space-y-2">
              <Label htmlFor="endDate" className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Fecha de Fin *</span>
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className={errors.endDate ? 'border-red-500 focus:border-red-500' : ''}
                title="Fecha de fin de la oferta"
              />
              {errors.endDate && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>

          {/* Emoji y Estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Emoji */}
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Image className="h-4 w-4" />
                <span>Icono de la oferta</span>
              </Label>
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="w-full justify-start"
                >
                  <span className="text-xl mr-2">{formData.image}</span>
                  Seleccionar emoji
                </Button>
                {showEmojiPicker && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
                    <div className="grid grid-cols-10 gap-2">
                      {emojiOptions.map((emoji, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, image: emoji }));
                            setShowEmojiPicker(false);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg text-xl"
                          title={`Seleccionar ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <ToggleLeft className="h-4 w-4" />
                <span>Estado de la oferta</span>
              </Label>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <span className="text-sm text-gray-700">
                  {formData.isActive ? 'Oferta activa' : 'Oferta inactiva'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-xs text-gray-500">
            <strong>Estado del Formulario:</strong><br/>
            Título: {formData.title.length >= 3 ? '✅' : '❌'} ({formData.title.length}/3) | 
            Descripción: {formData.description.length >= 10 ? '✅' : '❌'} ({formData.description.length}/10) | 
            Descuento: {formData.discount > 0 ? '✅' : '❌'} ({formData.discount}%) | 
            Precio: {formData.originalPrice > 0 ? '✅' : '❌'} (${formData.originalPrice})
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                console.log('🔴 BOTÓN CLICKEADO - handleSave');
                handleSave();
              }}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {mode === 'create' ? 'Crear Oferta' : 'Guardar Cambios'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
