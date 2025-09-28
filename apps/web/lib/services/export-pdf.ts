import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getCompanyInfo, getCompanyLogo } from '@/lib/utils/company-logo';

export interface OfferData {
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

export interface ExportOptions {
  includeInactive?: boolean;
  includeExpired?: boolean;
  sortBy?: 'discount' | 'views' | 'date';
  format?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
}

export class PDFExportService {
  private doc: jsPDF;
  private currentY: number = 0;
  private pageHeight: number = 0;
  private margin: number = 20;
  private pageWidth: number = 0;

  constructor(format: 'A4' | 'Letter' = 'A4', orientation: 'portrait' | 'landscape' = 'portrait') {
    this.doc = new jsPDF({
      orientation,
      unit: 'mm',
      format
    });
    
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.currentY = this.margin;
  }

  private async addHeader() {
    try {
      // Obtener información de la empresa
      const companyInfo = await getCompanyInfo();
      const companyLogo = companyInfo.logo;
      
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
          
          // Agregar el logo (20x20mm)
          this.doc.addImage(img, 'PNG', this.margin, this.currentY, 20, 20);
          
          // Título al lado del logo
          this.doc.setFontSize(18);
          this.doc.setFont('helvetica', 'bold');
          this.doc.setTextColor(59, 130, 246);
          this.doc.text('LogicQP', this.margin + 25, this.currentY + 12);
          
        } catch (logoError) {
          console.log('Error cargando logo, usando texto:', logoError);
          // Fallback a texto si el logo falla
          this.doc.setFontSize(18);
          this.doc.setFont('helvetica', 'bold');
          this.doc.setTextColor(59, 130, 246);
          this.doc.text('LogicQP', this.margin, this.currentY + 8);
        }
      } else {
        // Sin logo, solo texto
        this.doc.setFontSize(18);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(59, 130, 246);
        this.doc.text('LogicQP', this.margin, this.currentY + 8);
      }
      
      this.currentY += 15;
      
      // Subtítulo del reporte
      this.doc.setFontSize(16);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(75, 85, 99);
      this.doc.text('Reporte de Ofertas Especiales', this.margin, this.currentY);
      
      this.currentY += 15;
      
      // Línea separadora
      this.doc.setDrawColor(59, 130, 246);
      this.doc.setLineWidth(0.5);
      this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
      
      this.currentY += 10;
      
    } catch (error) {
      console.error('Error en addHeader:', error);
      // Fallback básico
      this.doc.setFontSize(18);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(59, 130, 246);
      this.doc.text('LogicQP - Sistema Farmacéutico', this.margin, this.currentY + 8);
      this.currentY += 20;
    }
  }

  private addSummary(offers: OfferData[]) {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(31, 41, 55); // Gray-800
    this.doc.text('Resumen Ejecutivo', this.margin, this.currentY);
    
    this.currentY += 8;
    
    const activeOffers = offers.filter(o => o.isActive && new Date(o.endDate) > new Date()).length;
    const totalDiscount = offers.reduce((sum, o) => sum + o.discount, 0);
    const avgDiscount = Math.round(totalDiscount / offers.length);
    const totalViews = offers.reduce((sum, o) => sum + o.views, 0);
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(75, 85, 99);
    
    const summaryData = [
      `• Total de ofertas: ${offers.length}`,
      `• Ofertas activas: ${activeOffers}`,
      `• Descuento promedio: ${avgDiscount}%`,
      `• Total de visualizaciones: ${totalViews.toLocaleString()}`,
      `• Fecha de generación: ${new Date().toLocaleString('es-ES')}`
    ];
    
    summaryData.forEach(line => {
      const cleanLine = this.cleanText(line);
      this.doc.text(cleanLine, this.margin + 5, this.currentY);
      this.currentY += 5;
    });
    
    this.currentY += 10;
  }

  private cleanText(text: string): string {
    // Limpiar texto removiendo caracteres problemáticos y normalizando
    return text
      .replace(/[^\x20-\x7E]/g, '') // Solo mantener caracteres ASCII básicos
      .replace(/[^\w\s\-.,:()%$]/g, '') // Remover caracteres especiales problemáticos
      .replace(/\s+/g, ' ') // Normalizar espacios múltiples
      .trim();
  }

  private getCategoryIcon(category: string): string {
    // Usar solo texto simple sin símbolos problemáticos
    return ''; // Sin icono para evitar códigos extraños
  }

  private wrapText(text: string, maxWidth: number, fontSize: number): string[] {
    // Función simple de wrap que funciona correctamente
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      // Usar una estimación simple del ancho
      const estimatedWidth = testLine.length * (fontSize * 0.6);
      
      if (estimatedWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          lines.push(word);
        }
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines.length > 0 ? lines : [text];
  }

  private addOfferCard(offer: OfferData, index: number) {
    // Verificar si necesitamos una nueva página
    if (this.currentY > this.pageHeight - 50) {
      this.doc.addPage();
      this.currentY = this.margin;
    }

    // Fondo de la tarjeta
    this.doc.setFillColor(249, 250, 251); // Gray-50
    this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), 40, 3, 3, 'F');
    
    // Borde de la tarjeta
    this.doc.setDrawColor(229, 231, 235); // Gray-200
    this.doc.setLineWidth(0.5);
    this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), 40, 3, 3, 'S');
    
    const cardX = this.margin + 5;
    const cardY = this.currentY + 5;
    
    // Título de la oferta (sin icono)
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(31, 41, 55);
    const cleanTitle = this.cleanText(offer.title);
    this.doc.text(cleanTitle, cardX, cardY + 8);
    
    // Porcentaje y estado en la primera línea (más a la izquierda)
    this.doc.setFillColor(220, 252, 231); // Green-100
    this.doc.roundedRect(cardX + 100, cardY + 4, 25, 6, 1, 1, 'F');
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(22, 101, 52); // Green-800
    this.doc.text(`${offer.discount}% OFF`, cardX + 102, cardY + 8);
    
    // Estado activo/inactivo
    const statusColor = offer.isActive ? [34, 197, 94] : [239, 68, 68]; // Green-500 : Red-500
    const statusText = offer.isActive ? 'ACTIVA' : 'INACTIVA';
    this.doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    this.doc.roundedRect(cardX + 130, cardY + 4, 20, 6, 1, 1, 'F');
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(255, 255, 255);
    this.doc.text(statusText, cardX + 132, cardY + 8);
    
    // Descripción en la segunda línea
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(75, 85, 99);
    const cleanDescription = this.cleanText(offer.description);
    const description = cleanDescription.length > 50 ? 
      cleanDescription.substring(0, 50) + '...' : 
      cleanDescription;
    this.doc.text(description, cardX, cardY + 16);
    
    // Fechas alineadas con el estado
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(75, 85, 99);
    this.doc.text(`Inicio: ${new Date(offer.startDate).toLocaleDateString('es-ES')}`, cardX + 130, cardY + 16);
    this.doc.text(`Fin: ${new Date(offer.endDate).toLocaleDateString('es-ES')}`, cardX + 130, cardY + 22);
    
    // Precios en la tercera línea
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(31, 41, 55);
    this.doc.text(`Original: $${offer.originalPrice}`, cardX, cardY + 24);
    
    // Precio de oferta
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(34, 197, 94); // Green-500
    this.doc.text(`Oferta: $${offer.offerPrice}`, cardX + 50, cardY + 24);
    
    // Ahorro
    const savings = offer.originalPrice - offer.offerPrice;
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(239, 68, 68); // Red-500
    this.doc.text(`Ahorro: $${savings.toFixed(2)}`, cardX + 100, cardY + 24);
    
    // Estadísticas (productos y vistas) alineadas con el estado
    this.doc.setFontSize(8);
    this.doc.setTextColor(107, 114, 128);
    this.doc.text(`Productos: ${offer.productCount}`, cardX + 130, cardY + 28);
    this.doc.text(`Vistas: ${offer.views.toLocaleString()}`, cardX + 130, cardY + 34);
    
    // Categoría (línea completa)
    this.doc.setFontSize(8);
    this.doc.setTextColor(59, 130, 246); // Blue-600
    const cleanCategory = this.cleanText(offer.category);
    this.doc.text(`Categoría: ${cleanCategory}`, cardX, cardY + 32);
    
    this.currentY += 45;
  }

  private addFooter() {
    const footerY = this.pageHeight - 15;
    
    // Línea separadora
    this.doc.setDrawColor(229, 231, 235);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, footerY - 5, this.pageWidth - this.margin, footerY - 5);
    
    // Texto del footer
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(107, 114, 128);
    this.doc.text('LogicQP - Sistema de Gestión Farmacéutica', this.margin, footerY);
    this.doc.text(`Página ${this.doc.getCurrentPageInfo().pageNumber}`, this.pageWidth - this.margin - 20, footerY);
  }

  public async exportOffers(offers: OfferData[], options: ExportOptions = {}) {
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

      // Filtrar ofertas según opciones
      let filteredOffers = offers;
      if (!options.includeInactive) {
        filteredOffers = filteredOffers.filter(o => o.isActive);
      }
      if (!options.includeExpired) {
        filteredOffers = filteredOffers.filter(o => new Date(o.endDate) > new Date());
      }

      // Ordenar ofertas
      if (options.sortBy) {
        filteredOffers = this.sortOffers(filteredOffers, options.sortBy);
      }

      // Agregar contenido
      await this.addHeader();
      this.addSummary(filteredOffers);
      
      // Agregar cada oferta
      filteredOffers.forEach((offer, index) => {
        this.addOfferCard(offer, index);
      });

      // Agregar footer a todas las páginas
      const totalPages = this.doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        this.doc.setPage(i);
        this.addFooter();
      }

      // Generar nombre del archivo
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `LogicQP_Ofertas_${timestamp}.pdf`;

      // Descargar PDF
      this.doc.save(filename);
      
      return {
        success: true,
        filename,
        totalOffers: filteredOffers.length
      };
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  private sortOffers(offers: OfferData[], sortBy: 'discount' | 'views' | 'date'): OfferData[] {
    return [...offers].sort((a, b) => {
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
  }

  public async exportToCanvas(elementId: string, filename: string = 'LogicQP_Reporte.pdf') {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Elemento no encontrado');
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(filename);
      
      return {
        success: true,
        filename
      };
    } catch (error) {
      console.error('Error generando PDF desde canvas:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

export const pdfExportService = new PDFExportService();
