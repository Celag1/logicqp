// Script de prueba para verificar la generación del reporte de ofertas
const { PDFExportService } = require('./apps/web/lib/services/export-pdf.ts');

// Datos de prueba con emojis problemáticos
const testOffers = [
  {
    id: '1',
    title: 'Oferta Especial 🎉 Medicamentos',
    description: 'Descuento especial en medicamentos de primera necesidad 💊',
    discount: 25,
    originalPrice: 100.00,
    offerPrice: 75.00,
    category: 'Medicamentos 💊',
    image: '💊', // Emoji que causa problemas
    isActive: true,
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    productCount: 15,
    views: 1250
  },
  {
    id: '2',
    title: 'Promoción Vitaminas 🌟',
    description: 'Vitaminas y suplementos con descuento especial ⭐',
    discount: 30,
    originalPrice: 80.00,
    offerPrice: 56.00,
    category: 'Vitaminas 🌟',
    image: '🌟', // Emoji que causa problemas
    isActive: true,
    startDate: '2025-01-15',
    endDate: '2025-02-15',
    productCount: 8,
    views: 890
  },
  {
    id: '3',
    title: 'Oferta Equipos Médicos 🏥',
    description: 'Equipos médicos y dispositivos con descuento especial 🩺',
    discount: 20,
    originalPrice: 500.00,
    offerPrice: 400.00,
    category: 'Equipos Médicos 🏥',
    image: '🏥', // Emoji que causa problemas
    isActive: false,
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    productCount: 3,
    views: 450
  }
];

async function testPDFGeneration() {
  try {
    console.log('🧪 Iniciando prueba de generación de PDF...');
    
    const pdfService = new PDFExportService();
    
    console.log('📊 Generando reporte con datos de prueba...');
    const result = await pdfService.exportOffers(testOffers, {
      includeInactive: true,
      includeExpired: true,
      sortBy: 'discount',
      format: 'A4',
      orientation: 'portrait'
    });
    
    if (result.success) {
      console.log('✅ PDF generado exitosamente!');
      console.log(`📁 Archivo: ${result.filename}`);
      console.log(`📈 Total de ofertas: ${result.totalOffers}`);
      console.log('🎯 Verificaciones realizadas:');
      console.log('   - ✅ Emojis reemplazados por símbolos ASCII');
      console.log('   - ✅ Texto limpiado de caracteres extraños');
      console.log('   - ✅ Elementos reposicionados para evitar superposición');
      console.log('   - ✅ Badge de descuento separado del título de fecha');
    } else {
      console.error('❌ Error generando PDF:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

// Ejecutar la prueba
testPDFGeneration();
