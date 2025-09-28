"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  X, 
  Save, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Palette,
  Image,
  Type,
  FileText,
  ToggleLeft,
  Sparkles,
  Eye
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
  image: string;
  color: string;
  isActive: boolean;
  createdAt: string;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Omit<Category, 'id' | 'createdAt' | 'productCount'>) => void;
  category?: Category | null;
  mode: 'create' | 'edit';
}

const colorOptions = [
  { value: 'bg-blue-100 text-blue-800', label: 'Azul', preview: '🔵' },
  { value: 'bg-green-100 text-green-800', label: 'Verde', preview: '🟢' },
  { value: 'bg-purple-100 text-purple-800', label: 'Morado', preview: '🟣' },
  { value: 'bg-orange-100 text-orange-800', label: 'Naranja', preview: '🟠' },
  { value: 'bg-pink-100 text-pink-800', label: 'Rosa', preview: '🩷' },
  { value: 'bg-indigo-100 text-indigo-800', label: 'Índigo', preview: '🔷' },
  { value: 'bg-red-100 text-red-800', label: 'Rojo', preview: '🔴' },
  { value: 'bg-yellow-100 text-yellow-800', label: 'Amarillo', preview: '🟡' },
  { value: 'bg-teal-100 text-teal-800', label: 'Verde azulado', preview: '🟢' },
  { value: 'bg-cyan-100 text-cyan-800', label: 'Cian', preview: '🔵' }
];

const emojiOptions = [
  '💊', '🧬', '🧴', '🩺', '👶', '🧠', '💉', '🦷', '👁️', '🦴',
  '🩹', '🌡️', '💊', '🧪', '🔬', '📋', '📊', '⚕️', '🏥', '🚑',
  '💊', '🧴', '🩺', '👶', '🧠', '💉', '🦷', '👁️', '🦴', '🩹'
];

export default function CategoryModal({ isOpen, onClose, onSave, category, mode }: CategoryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '💊',
    color: 'bg-blue-100 text-blue-800',
    isActive: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Inicializar formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && category) {
        setFormData({
          name: category.name,
          description: category.description,
          image: category.image,
          color: category.color,
          isActive: category.isActive
        });
      } else {
        setFormData({
          name: '',
          description: '',
          image: '💊',
          color: 'bg-blue-100 text-blue-800',
          isActive: true
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, category]);

  // Validación en tiempo real
  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'El nombre es requerido';
        } else if (value.length < 2) {
          newErrors.name = 'El nombre debe tener al menos 2 caracteres';
        } else if (value.length > 50) {
          newErrors.name = 'El nombre no puede exceder 50 caracteres';
        } else {
          delete newErrors.name;
        }
        break;
      case 'description':
        if (!value.trim()) {
          newErrors.description = 'La descripción es requerida';
        } else if (value.length < 10) {
          newErrors.description = 'La descripción debe tener al menos 10 caracteres';
        } else if (value.length > 200) {
          newErrors.description = 'La descripción no puede exceder 200 caracteres';
        } else {
          delete newErrors.description;
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSave = async () => {
    // Validar todos los campos
    const isNameValid = validateField('name', formData.name);
    const isDescriptionValid = validateField('description', formData.description);
    
    if (!isNameValid || !isDescriptionValid) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.name.trim() && formData.description.trim() && Object.keys(errors).length === 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {mode === 'create' ? 'Nueva Categoría' : 'Editar Categoría'}
              </h2>
              <p className="text-sm text-gray-500">
                {mode === 'create' ? 'Crea una nueva categoría de productos' : 'Modifica los datos de la categoría'}
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
          {/* Preview Card */}
          <Card className="bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600 flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                Vista Previa
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{formData.image}</div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">
                      {formData.name || 'Nombre de la categoría'}
                    </h3>
                    <Badge className={formData.color}>
                      {formData.isActive ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {formData.description || 'Descripción de la categoría'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center space-x-2">
                <Type className="h-4 w-4" />
                <span>Nombre de la categoría *</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ej: Medicamentos"
                className={errors.name ? 'border-red-500 focus:border-red-500' : ''}
                title="Nombre de la categoría"
              />
              {errors.name && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <ToggleLeft className="h-4 w-4" />
                <span>Estado de la categoría</span>
              </Label>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <span className="text-sm text-gray-700">
                  {formData.isActive ? 'Categoría activa' : 'Categoría inactiva'}
                </span>
              </div>
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
              placeholder="Describe brevemente qué productos incluye esta categoría..."
              rows={3}
              className={errors.description ? 'border-red-500 focus:border-red-500' : ''}
              title="Descripción de la categoría"
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
                {formData.description.length}/200 caracteres
              </span>
            </div>
          </div>

          {/* Emoji y Color */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Emoji */}
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Image className="h-4 w-4" />
                <span>Icono de la categoría</span>
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

            {/* Color */}
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Palette className="h-4 w-4" />
                <span>Color de la categoría</span>
              </Label>
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-full justify-start"
                >
                  <Badge className={`${formData.color} mr-2`}>
                    {colorOptions.find(c => c.value === formData.color)?.preview}
                  </Badge>
                  Seleccionar color
                </Button>
                {showColorPicker && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
                    <div className="grid grid-cols-2 gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, color: color.value }));
                            setShowColorPicker(false);
                          }}
                          className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg"
                          title={`Seleccionar ${color.label}`}
                        >
                          <Badge className={color.value}>
                            {color.preview}
                          </Badge>
                          <span className="text-sm">{color.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isFormValid || isLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {mode === 'create' ? 'Crear Categoría' : 'Guardar Cambios'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
