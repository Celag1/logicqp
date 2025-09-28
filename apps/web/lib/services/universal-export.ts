import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getCompanyInfo, getCompanyLogo } from '@/lib/utils/company-logo';

export interface ExportData {
  id: string;
  [key: string]: any;
}

export interface UniversalExportOptions {
  title: string;
  subtitle?: string;
  data: ExportData[];
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
  format?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
  includeSummary?: boolean;
  includeCharts?: boolean;
}

export class UniversalExportService {
  private doc: jsPDF;
  private currentY: number = 0;
  private pageHeight: number = 0;
  private margin: number = 20;
  private pageWidth: number = 0;

  private cleanText(text: string): string {
    if (!text) return '';
    
    // Limpiar TODOS los caracteres especiales y usar solo ASCII básico
    const cleaned = text
      .replace(/[^\x20-\x7E]/g, '') // Solo caracteres ASCII básicos (32-126)
      .replace(/\s+/g, ' ') // Normalizar espacios múltiples
      .trim();
    
    // Log para depuración
    if (text !== cleaned) {
      console.log('Texto limpiado:', { original: text, cleaned });
    }
    
    return cleaned;
  }

  private wrapText(text: string, maxWidth: number, fontSize: number): string[] {
    if (!text) return [''];
    
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const textWidth = this.doc.getTextWidth(testLine) * fontSize / 12; // Ajustar según tamaño de fuente
      
      if (textWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          // Si una sola palabra es muy larga, la cortamos
          lines.push(word.substring(0, Math.floor(maxWidth / (fontSize / 12))));
          currentLine = word.substring(Math.floor(maxWidth / (fontSize / 12)));
        }
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  }

  constructor(format: 'A4' | 'Letter' = 'A4', orientation: 'portrait' | 'landscape' = 'portrait') {
    this.doc = new jsPDF({
      orientation,
      unit: 'mm',
      format,
      compress: false,
      putOnlyUsedFonts: true
    });
    
    // Configurar codificación de caracteres específica
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(12);
    
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.currentY = this.margin;
  }

  private async addHeader(title: string, subtitle?: string) {
    try {
      // Obtener información de la empresa
      const companyInfo = await getCompanyInfo();
      const companyLogo = companyInfo.logo;
      
      // Fondo degradado simulado
      this.doc.setFillColor(59, 130, 246); // Blue-600
      this.doc.rect(0, 0, this.pageWidth, 40, 'F');
      
      // Si hay logo, intentar agregarlo
      if (companyLogo) {
        try {
          // Crear una imagen temporal para el logo
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = companyLogo;
          });
          
          // Agregar el logo (15x15mm)
          this.doc.addImage(img, 'PNG', this.margin, 5, 15, 15);
          
          // Título al lado del logo
          this.doc.setFontSize(16);
          this.doc.setFont('helvetica', 'bold');
          this.doc.setTextColor(255, 255, 255);
          this.doc.text('LogicQP', this.margin + 20, 12);
          
        } catch (logoError) {
          console.log('Error cargando logo, usando texto:', logoError);
          // Fallback a texto si el logo falla
          this.doc.setFontSize(16);
          this.doc.setFont('helvetica', 'bold');
          this.doc.setTextColor(255, 255, 255);
          this.doc.text('LogicQP', this.margin, 12);
        }
      } else {
        // Sin logo, solo texto
        this.doc.setFontSize(16);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(255, 255, 255);
        this.doc.text('LogicQP', this.margin, 12);
      }
      
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(255, 255, 255);
      this.doc.text('Sistema de Gestión Farmacéutica Avanzado', this.margin, 22);
      
      this.currentY = 45;
      
      // Título del reporte
      this.doc.setFontSize(18);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(31, 41, 55); // Gray-800
      this.doc.text(title, this.margin, this.currentY);
      
      if (subtitle) {
        this.currentY += 8;
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(75, 85, 99); // Gray-600
        this.doc.text(subtitle, this.margin, this.currentY);
      }
      
      this.currentY += 15;
      
      // Línea separadora elegante
      this.doc.setDrawColor(59, 130, 246);
      this.doc.setLineWidth(2);
      this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
      
      this.currentY += 10;
      
    } catch (error) {
      console.error('Error en addHeader:', error);
      // Fallback básico
      this.doc.setFontSize(16);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(255, 255, 255);
      this.doc.text('LogicQP', this.margin, 12);
      this.currentY = 45;
    }
  }

  private addSummary(summary: any[]) {
    if (!summary || summary.length === 0) return;

    // Fondo del resumen
    this.doc.setFillColor(249, 250, 251); // Gray-50
    this.doc.rect(this.margin, this.currentY - 5, this.pageWidth - (this.margin * 2), 30, 'F');
    
    // Borde del resumen
    this.doc.setDrawColor(229, 231, 235); // Gray-200
    this.doc.setLineWidth(0.5);
    this.doc.rect(this.margin, this.currentY - 5, this.pageWidth - (this.margin * 2), 30, 'S');

    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(31, 41, 55); // Gray-800
    this.doc.text('Resumen Ejecutivo', this.margin + 5, this.currentY + 3);
    
    this.currentY += 8;
    
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(75, 85, 99);
    
    // Organizar en dos columnas
    const midPoint = this.pageWidth / 2;
    let leftY = this.currentY;
    let rightY = this.currentY;
    
    summary.forEach((item, index) => {
      const isLeftColumn = index % 2 === 0;
      const currentY = isLeftColumn ? leftY : rightY;
      const currentX = isLeftColumn ? this.margin + 10 : midPoint + 10;
      
      // Usar solo texto simple sin iconos
      const cleanLabel = this.cleanText(item.label || '');
      const cleanValue = this.cleanText((item.value || '').toString());
      
      this.doc.text(`${cleanLabel}:`, currentX, currentY);
      
      // Valor en negrita
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(59, 130, 246); // Blue-600
      this.doc.text(`${cleanValue}`, currentX + 60, currentY);
      
      // Resetear estilos
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(75, 85, 99);
      
      if (isLeftColumn) {
        leftY += 6;
      } else {
        rightY += 6;
      }
    });
    
    this.currentY = Math.max(leftY, rightY) + 10;
  }

  private addStatistics(data: ExportData[], columns: any[]) {
    if (data.length === 0) return;

    // Título de estadísticas
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(31, 41, 55);
    this.doc.text('Análisis Estadístico', this.margin, this.currentY);
    this.currentY += 8;

    // Calcular estadísticas básicas
    const totalItems = data.length;
    const activeItems = data.filter(item => item.isActive !== false).length;
    const inactiveItems = totalItems - activeItems;
    const activePercentage = totalItems > 0 ? ((activeItems / totalItems) * 100).toFixed(1) : '0';

    // Crear gráfica de barras simple para estado activo/inactivo
    const chartWidth = 80;
    const chartHeight = 30;
    const chartX = this.margin + 10;
    const chartY = this.currentY;

    // Fondo del gráfico
    this.doc.setFillColor(248, 250, 252); // Gray-50
    this.doc.rect(chartX, chartY, chartWidth, chartHeight, 'F');
    this.doc.setDrawColor(229, 231, 235);
    this.doc.setLineWidth(0.5);
    this.doc.rect(chartX, chartY, chartWidth, chartHeight, 'S');

    // Barras del gráfico
    const barWidth = 15;
    const maxBarHeight = 20;
    const activeBarHeight = (activeItems / totalItems) * maxBarHeight;
    const inactiveBarHeight = (inactiveItems / totalItems) * maxBarHeight;

    // Barra de activos
    this.doc.setFillColor(34, 197, 94); // Green-500
    this.doc.rect(chartX + 10, chartY + chartHeight - activeBarHeight - 5, barWidth, activeBarHeight, 'F');

    // Barra de inactivos
    this.doc.setFillColor(239, 68, 68); // Red-500
    this.doc.rect(chartX + 30, chartY + chartHeight - inactiveBarHeight - 5, barWidth, inactiveBarHeight, 'F');

    // Etiquetas del gráfico
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(75, 85, 99);
    this.doc.text('Activos', chartX + 10, chartY + chartHeight + 5);
    this.doc.text('Inactivos', chartX + 30, chartY + chartHeight + 5);

    // Valores numéricos
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(34, 197, 94);
    this.doc.text(`${activeItems}`, chartX + 10 + barWidth/2 - 2, chartY + chartHeight - activeBarHeight - 8);
    
    this.doc.setTextColor(239, 68, 68);
    this.doc.text(`${inactiveItems}`, chartX + 30 + barWidth/2 - 2, chartY + chartHeight - inactiveBarHeight - 8);

    // Estadísticas numéricas a la derecha del gráfico
    const statsX = chartX + chartWidth + 15;
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(75, 85, 99);
    
    this.doc.text(`Total de elementos: ${totalItems}`, statsX, chartY + 8);
    this.doc.text(`Elementos activos: ${activeItems} (${activePercentage}%)`, statsX, chartY + 15);
    this.doc.text(`Elementos inactivos: ${inactiveItems}`, statsX, chartY + 22);

    this.currentY += chartHeight + 15;
  }

  private addCategoryAnalysis(data: ExportData[]) {
    if (data.length === 0) return;

    // Agrupar por categorías si existe el campo
    const categoryField = data[0].hasOwnProperty('category') ? 'category' : 
                         data[0].hasOwnProperty('name') ? 'name' : null;
    
    if (!categoryField) return;

    const categoryGroups = data.reduce((acc, item) => {
      const category = item[categoryField] || 'Sin categoría';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category]++;
      return acc;
    }, {} as Record<string, number>);

    const sortedCategories = Object.entries(categoryGroups)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5); // Top 5 categorías

    if (sortedCategories.length === 0) return;

    // Título del análisis
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(31, 41, 55);
    this.doc.text('Distribución por Categorías (Top 5)', this.margin, this.currentY);
    this.currentY += 8;

    // Crear gráfica de barras horizontales
    const chartWidth = 100;
    const chartHeight = sortedCategories.length * 8 + 10;
    const chartX = this.margin + 10;
    const chartY = this.currentY;

    // Fondo del gráfico
    this.doc.setFillColor(248, 250, 252);
    this.doc.rect(chartX, chartY, chartWidth, chartHeight, 'F');
    this.doc.setDrawColor(229, 231, 235);
    this.doc.setLineWidth(0.5);
    this.doc.rect(chartX, chartY, chartWidth, chartHeight, 'S');

    const maxValue = Math.max(...sortedCategories.map(([,count]) => count));
    const colors = [
      [59, 130, 246],   // Blue-500
      [16, 185, 129],   // Emerald-500
      [245, 158, 11],   // Amber-500
      [239, 68, 68],    // Red-500
      [139, 92, 246]    // Violet-500
    ];

    sortedCategories.forEach(([category, count], index) => {
      const barHeight = 6;
      const barY = chartY + 5 + (index * 8);
      const barWidth = (count / maxValue) * (chartWidth - 60);
      
      // Barra
      this.doc.setFillColor(...colors[index % colors.length]);
      this.doc.rect(chartX + 5, barY, barWidth, barHeight, 'F');

      // Etiqueta
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(75, 85, 99);
      this.doc.text(category.substring(0, 15), chartX + 5, barY + 4);

      // Valor
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(31, 41, 55);
      this.doc.text(`${count}`, chartX + chartWidth - 15, barY + 4);
    });

    this.currentY += chartHeight + 10;
  }

  private addFilters(filters: any[]) {
    if (!filters || filters.length === 0) return;

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(31, 41, 55);
    this.doc.text('Filtros Aplicados', this.margin, this.currentY);
    
    this.currentY += 6;
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(75, 85, 99);
    
    const filterText = filters.map(f => `${f.label}: ${f.value}`).join(' | ');
    this.doc.text(filterText, this.margin + 5, this.currentY);
    
    this.currentY += 10;
  }

  private addTable(data: ExportData[], columns: any[]) {
    if (data.length === 0) {
      this.doc.setFontSize(12);
      this.doc.setTextColor(107, 114, 128);
      this.doc.text('No hay datos para mostrar', this.margin, this.currentY);
      return;
    }

    // Calcular anchos de columnas con espaciado mínimo
    const availableWidth = this.pageWidth - (this.margin * 2);
    const minColumnWidth = 20; // Ancho mínimo por columna
    const totalMinWidth = columns.length * minColumnWidth;
    
    let columnWidths: number[];
    if (totalMinWidth > availableWidth) {
      // Si no hay suficiente espacio, usar ancho mínimo
      columnWidths = columns.map(() => minColumnWidth);
    } else {
      // Calcular anchos proporcionales con mínimo garantizado
      columnWidths = columns.map(col => {
        const proportionalWidth = col.width ? (availableWidth * col.width / 100) : (availableWidth / columns.length);
        return Math.max(proportionalWidth, minColumnWidth);
      });
      
      // Ajustar si excede el ancho disponible
      const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
      if (totalWidth > availableWidth) {
        const scaleFactor = availableWidth / totalWidth;
        columnWidths = columnWidths.map(width => width * scaleFactor);
      }
    }

    const rowHeight = 8;
    const headerHeight = 10;

    // Header de la tabla con diseño profesional
    this.doc.setFillColor(59, 130, 246); // Blue-600
    this.doc.rect(this.margin, this.currentY, availableWidth, headerHeight, 'F');
    
    // Borde del header
    this.doc.setDrawColor(37, 99, 235); // Blue-700
    this.doc.setLineWidth(0.5);
    this.doc.rect(this.margin, this.currentY, availableWidth, headerHeight, 'S');

    // Texto del header
    let x = this.margin;
    columns.forEach((col, index) => {
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(255, 255, 255); // Blanco
      
      // Truncar texto del header si es muy largo
      const maxHeaderWidth = columnWidths[index] - 6;
      const avgCharWidth = this.doc.getTextWidth('M') * 0.6;
      const maxHeaderChars = Math.floor(maxHeaderWidth / avgCharWidth);
      
      let headerText = col.label;
      if (headerText.length > maxHeaderChars) {
        headerText = headerText.substring(0, maxHeaderChars - 3) + '...';
      }
      
      // Centrar texto en la celda
      const textWidth = this.doc.getTextWidth(headerText);
      const cellCenter = x + (columnWidths[index] / 2);
      const textX = cellCenter - (textWidth / 2);
      
      // Asegurar que el texto no se salga de la celda
      const finalTextX = Math.max(x + 1, Math.min(textX, x + columnWidths[index] - textWidth - 1));
      
      this.doc.text(headerText, finalTextX, this.currentY + 6);
      x += columnWidths[index];
    });

    this.currentY += headerHeight;

    // Filas de datos con diseño profesional
    data.forEach((row, rowIndex) => {
      // Verificar si necesitamos una nueva página
      if (this.currentY + rowHeight > this.pageHeight - 20) {
        this.doc.addPage();
        this.currentY = this.margin;
        
        // Redibujar header en nueva página
        this.doc.setFillColor(59, 130, 246);
        this.doc.rect(this.margin, this.currentY, availableWidth, headerHeight, 'F');
        this.doc.setDrawColor(37, 99, 235);
        this.doc.setLineWidth(0.5);
        this.doc.rect(this.margin, this.currentY, availableWidth, headerHeight, 'S');
        
        let x = this.margin;
        columns.forEach((col, index) => {
          this.doc.setFontSize(10);
          this.doc.setFont('helvetica', 'bold');
          this.doc.setTextColor(255, 255, 255);
          
          // Truncar texto del header si es muy largo
          const maxHeaderWidth = columnWidths[index] - 6;
          const avgCharWidth = this.doc.getTextWidth('M') * 0.6;
          const maxHeaderChars = Math.floor(maxHeaderWidth / avgCharWidth);
          
          let headerText = col.label;
          if (headerText.length > maxHeaderChars) {
            headerText = headerText.substring(0, maxHeaderChars - 3) + '...';
          }
          
          const textWidth = this.doc.getTextWidth(headerText);
          const cellCenter = x + (columnWidths[index] / 2);
          const textX = cellCenter - (textWidth / 2);
          
          // Asegurar que el texto no se salga de la celda
          const finalTextX = Math.max(x + 1, Math.min(textX, x + columnWidths[index] - textWidth - 1));
          
          this.doc.text(headerText, finalTextX, this.currentY + 6);
          x += columnWidths[index];
        });
        
        this.currentY += headerHeight;
      }

      // Fondo alternado para filas
      if (rowIndex % 2 === 0) {
        this.doc.setFillColor(255, 255, 255); // Blanco
      } else {
        this.doc.setFillColor(249, 250, 251); // Gray-50
      }
      this.doc.rect(this.margin, this.currentY, availableWidth, rowHeight, 'F');

      // Borde de la fila
      this.doc.setDrawColor(229, 231, 235); // Gray-200
      this.doc.setLineWidth(0.3);
      this.doc.rect(this.margin, this.currentY, availableWidth, rowHeight, 'S');

      // Líneas verticales entre columnas
      let x = this.margin;
      for (let i = 0; i < columns.length - 1; i++) {
        x += columnWidths[i];
        this.doc.setDrawColor(229, 231, 235);
        this.doc.setLineWidth(0.2);
        this.doc.line(x, this.currentY, x, this.currentY + rowHeight);
      }

      // Contenido de las celdas
      x = this.margin;
      columns.forEach((col, colIndex) => {
        const value = row[col.key];
        let displayValue = '';

        // Formatear valor según el tipo
        switch (col.type) {
          case 'currency':
            displayValue = `$${value?.toFixed(2) || '0.00'}`;
            break;
          case 'number':
            displayValue = value?.toLocaleString() || '0';
            break;
          case 'date':
            displayValue = value ? new Date(value).toLocaleDateString('es-ES') : '';
            break;
          case 'boolean':
            displayValue = value ? 'Sí' : 'No';
            break;
          case 'badge':
            displayValue = value || '';
            break;
          default:
            displayValue = col.format ? col.format(value) : (value?.toString() || '');
        }

        // Calcular ancho máximo de texto basado en el ancho de la columna
        const maxTextWidth = columnWidths[colIndex] - 6; // 6mm de margen total (3mm cada lado)
        const fontSize = 9;
        this.doc.setFontSize(fontSize);
        
        // Calcular cuántos caracteres caben en la columna
        const avgCharWidth = this.doc.getTextWidth('M') * 0.6; // Aproximación del ancho promedio de caracteres
        const maxChars = Math.floor(maxTextWidth / avgCharWidth);
        
        // Truncar texto si es muy largo
        if (displayValue.length > maxChars) {
          displayValue = displayValue.substring(0, maxChars - 3) + '...';
        }

        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(31, 41, 55); // Gray-800
        
        // Alineación según tipo
        const textWidth = this.doc.getTextWidth(displayValue);
        let textX = x + 3; // Margen izquierdo por defecto
        
        if (col.type === 'number' || col.type === 'currency') {
          // Alinear a la derecha para números
          textX = Math.max(x + 3, x + columnWidths[colIndex] - textWidth - 3);
        } else if (textWidth < maxTextWidth) {
          // Centrar si cabe
          textX = x + (columnWidths[colIndex] / 2) - (textWidth / 2);
        }
        
        // Asegurar que el texto no se salga de la celda
        textX = Math.max(x + 1, Math.min(textX, x + columnWidths[colIndex] - textWidth - 1));
        
        this.doc.text(displayValue, textX, this.currentY + 5);
        x += columnWidths[colIndex];
      });

      this.currentY += rowHeight;
    });

    this.currentY += 10;
  }

  private addFooter() {
    const footerY = this.pageHeight - 15;
    
    // Fondo del footer
    this.doc.setFillColor(249, 250, 251); // Gray-50
    this.doc.rect(0, footerY - 8, this.pageWidth, 15, 'F');
    
    // Línea separadora superior
    this.doc.setDrawColor(59, 130, 246); // Blue-600
    this.doc.setLineWidth(1);
    this.doc.line(this.margin, footerY - 8, this.pageWidth - this.margin, footerY - 8);
    
    // Texto del footer
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(75, 85, 99); // Gray-600
    
    // Información de la empresa
    this.doc.text('LogicQP - Sistema de Gestión Farmacéutica Avanzado', this.margin, footerY - 2);
    this.doc.text('Grupo 6 - Cel@g - 2025', this.margin, footerY + 3);
    
    // Fecha y página
    const currentDate = new Date().toLocaleDateString('es-ES');
    this.doc.text(`Generado el ${currentDate}`, this.pageWidth - this.margin - 60, footerY - 2);
    this.doc.text(`Página ${this.doc.getCurrentPageInfo().pageNumber}`, this.pageWidth - this.margin - 20, footerY + 3);
  }

  public async exportData(options: UniversalExportOptions) {
    try {
      // Configurar documento
      this.doc = new jsPDF({
        orientation: options.orientation || 'portrait',
        unit: 'mm',
        format: options.format || 'A4'
      });
      
      this.pageWidth = this.doc.internal.pageSize.getWidth();
      this.pageHeight = this.doc.internal.pageSize.getHeight();
      this.currentY = this.margin;

      // Agregar contenido
      await this.addHeader(options.title, options.subtitle);
      
      if (options.includeSummary && options.summary) {
        this.addSummary(options.summary);
      }

      if (options.filters) {
        this.addFilters(options.filters);
      }

      // Agregar estadísticas y gráficas si se solicita
      if (options.includeCharts) {
        this.addStatistics(options.data, options.columns);
        this.addCategoryAnalysis(options.data);
      }

      this.addTable(options.data, options.columns);

      // Agregar footer a todas las páginas
      const totalPages = this.doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        this.doc.setPage(i);
        this.addFooter();
      }

      // Generar nombre del archivo
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `LogicQP_${options.title.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.pdf`;

      // Descargar PDF
      this.doc.save(filename);
      
      return {
        success: true,
        filename,
        totalRecords: options.data.length
      };
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

export const universalExportService = new UniversalExportService();
