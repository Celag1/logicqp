"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ExportOptionsModal from '@/components/modals/export-options-modal';
import { universalExportService, type UniversalExportOptions } from '@/lib/services/universal-export';
import { TrendingUp, Loader2 } from 'lucide-react';

interface UniversalExportButtonProps {
  data: any[];
  title: string;
  subtitle?: string;
  columns: {
    key: string;
    label: string;
    width?: number;
    type?: 'text' | 'number' | 'currency' | 'date' | 'boolean' | 'badge';
    format?: (value: any) => string;
  }[];
  summary?: {
    label: string;
    value: string | number;
    icon?: string;
  }[];
  filters?: {
    label: string;
    value: string | number;
  }[];
  onExport?: (result: { success: boolean; filename?: string; error?: string }) => void;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  showAdvancedOptions?: boolean;
}

export default function UniversalExportButton({
  data,
  title,
  subtitle,
  columns,
  summary,
  filters,
  onExport,
  className = '',
  variant = 'outline',
  size = 'sm',
  disabled = false,
  showAdvancedOptions = true
}: UniversalExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleQuickExport = async () => {
    setIsLoading(true);
    
    try {
      const options: UniversalExportOptions = {
        title,
        subtitle,
        data,
        columns,
        summary,
        filters,
        format: 'A4',
        orientation: 'portrait',
        includeSummary: true,
        includeCharts: false
      };

      const result = await universalExportService.exportData(options);
      
      if (result.success) {
        setToastMessage(`PDF generado exitosamente: ${result.filename}`);
        setShowToast(true);
        onExport?.(result);
        console.log('✅ PDF exportado:', result);
      } else {
        setToastMessage(`Error al generar PDF: ${result.error}`);
        setShowToast(true);
        onExport?.(result);
        console.error('❌ Error exportando PDF:', result.error);
      }
    } catch (error) {
      console.error('Error en exportación:', error);
      setToastMessage('Error al generar el PDF');
      setShowToast(true);
      onExport?.({ success: false, error: 'Error desconocido' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdvancedExport = async (exportOptions: any) => {
    setShowExportModal(false);
    setIsLoading(true);
    
    try {
      const options: UniversalExportOptions = {
        title,
        subtitle,
        data,
        columns,
        summary,
        filters,
        format: exportOptions.format || 'A4',
        orientation: exportOptions.orientation || 'portrait',
        includeSummary: exportOptions.includeSummary !== false,
        includeCharts: exportOptions.includeCharts || false
      };

      const result = await universalExportService.exportData(options);
      
      if (result.success) {
        setToastMessage(`PDF generado exitosamente: ${result.filename}`);
        setShowToast(true);
        onExport?.(result);
        console.log('✅ PDF exportado con opciones:', result);
      } else {
        setToastMessage(`Error al generar PDF: ${result.error}`);
        setShowToast(true);
        onExport?.(result);
        console.error('❌ Error exportando PDF:', result.error);
      }
    } catch (error) {
      console.error('Error en exportación:', error);
      setToastMessage('Error al generar el PDF');
      setShowToast(true);
      onExport?.({ success: false, error: 'Error desconocido' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    if (showAdvancedOptions) {
      setShowExportModal(true);
    } else {
      handleQuickExport();
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={disabled || isLoading || data.length === 0}
        className={`${className} ${data.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={data.length === 0 ? 'No hay datos para exportar' : 'Exportar datos a PDF'}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generando...
          </>
        ) : (
          <>
            <TrendingUp className="h-4 w-4 mr-2" />
            Exportar PDF
          </>
        )}
      </Button>

      {showAdvancedOptions && (
        <ExportOptionsModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onExport={handleAdvancedExport}
          isLoading={isLoading}
        />
      )}

      {/* Toast de notificación */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex items-center space-x-3">
            <div className={`w-2 h-2 rounded-full ${toastMessage.includes('exitosamente') ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-gray-900 text-sm">{toastMessage}</span>
            <button
              onClick={() => setShowToast(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
