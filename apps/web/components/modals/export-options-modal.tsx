"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  X, 
  Download, 
  FileText, 
  Settings,
  Filter,
  SortAsc,
  Layout,
  RotateCcw
} from 'lucide-react';

interface ExportOptions {
  includeInactive?: boolean;
  includeExpired?: boolean;
  sortBy?: 'discount' | 'views' | 'date';
  format?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
  includeCharts?: boolean;
  includeSummary?: boolean;
}

interface ExportOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
  isLoading?: boolean;
}

function ExportOptionsModal({ 
  isOpen, 
  onClose, 
  onExport, 
  isLoading = false 
}: ExportOptionsModalProps) {
  const [options, setOptions] = useState<ExportOptions>({
    includeInactive: false,
    includeExpired: false,
    sortBy: 'discount',
    format: 'A4',
    orientation: 'portrait',
    includeCharts: true,
    includeSummary: true
  });

  const handleOptionChange = (key: keyof ExportOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = () => {
    onExport(options);
  };

  const resetToDefaults = () => {
    setOptions({
      includeInactive: false,
      includeExpired: false,
      sortBy: 'discount',
      format: 'A4',
      orientation: 'portrait',
      includeCharts: true,
      includeSummary: true
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Download className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Opciones de Exportación
              </h2>
              <p className="text-sm text-gray-500">
                Configura los parámetros para generar el PDF
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Filtros */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filtros de Contenido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Incluir ofertas inactivas</Label>
                  <p className="text-xs text-gray-500">Mostrar ofertas deshabilitadas en el PDF</p>
                </div>
                <Switch
                  checked={options.includeInactive}
                  onCheckedChange={(checked) => handleOptionChange('includeInactive', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Incluir ofertas expiradas</Label>
                  <p className="text-xs text-gray-500">Mostrar ofertas que ya terminaron</p>
                </div>
                <Switch
                  checked={options.includeExpired}
                  onCheckedChange={(checked) => handleOptionChange('includeExpired', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Ordenamiento */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <SortAsc className="h-5 w-5 mr-2" />
                Ordenamiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Ordenar por:</Label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { value: 'discount', label: 'Mayor descuento', desc: 'Ofertas con más descuento primero' },
                    { value: 'views', label: 'Más vistas', desc: 'Ofertas más populares primero' },
                    { value: 'date', label: 'Más recientes', desc: 'Ofertas más nuevas primero' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="sortBy"
                        value={option.value}
                        checked={options.sortBy === option.value}
                        onChange={(e) => handleOptionChange('sortBy', e.target.value)}
                        className="text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formato */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Layout className="h-5 w-5 mr-2" />
                Formato del Documento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Tamaño de página</Label>
                  <select
                    value={options.format}
                    onChange={(e) => handleOptionChange('format', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Seleccionar tamaño de página"
                  >
                    <option value="A4">A4 (210 x 297 mm)</option>
                    <option value="Letter">Letter (8.5 x 11 in)</option>
                  </select>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Orientación</Label>
                  <select
                    value={options.orientation}
                    onChange={(e) => handleOptionChange('orientation', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Seleccionar orientación de página"
                  >
                    <option value="portrait">Vertical</option>
                    <option value="landscape">Horizontal</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Opciones adicionales */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Opciones Adicionales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Incluir resumen ejecutivo</Label>
                  <p className="text-xs text-gray-500">Agregar estadísticas generales al inicio</p>
                </div>
                <Switch
                  checked={options.includeSummary}
                  onCheckedChange={(checked) => handleOptionChange('includeSummary', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Incluir gráficos</Label>
                  <p className="text-xs text-gray-500">Agregar visualizaciones de datos</p>
                </div>
                <Switch
                  checked={options.includeCharts}
                  onCheckedChange={(checked) => handleOptionChange('includeCharts', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={resetToDefaults}
            disabled={isLoading}
            className="flex items-center"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar por defecto
          </Button>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleExport}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              {isLoading ? 'Generando PDF...' : 'Generar PDF'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExportOptionsModal;
