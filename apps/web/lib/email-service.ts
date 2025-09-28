import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface InvoiceData {
  id: string;
  date: string;
  time: string;
  paymentMethod: string;
  customerEmail: string;
  items: Array<{
    product: {
      nombre: string;
      marca: string;
      precio: number;
    };
    quantity: number;
    subtotal: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configuración para Gmail (puedes cambiar por tu proveedor de email)
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER || 'tu-email@gmail.com',
        pass: process.env.SMTP_PASS || 'tu-app-password'
      }
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private getPaymentMethodText(method: string): string {
    const methods: { [key: string]: string } = {
      'tarjeta': 'Tarjeta de Crédito/Débito',
      'transferencia': 'Transferencia Bancaria',
      'efectivo': 'Pago en Efectivo',
      'digital': 'PayPal',
      'email_only': 'Factura por Email'
    };
    return methods[method] || method;
  }

  async sendInvoice(invoiceData: InvoiceData): Promise<boolean> {
    try {
      console.log('📧 Iniciando envío de factura por email...');
      console.log('📋 Datos de la factura:', {
        id: invoiceData.id,
        customer: invoiceData.customerEmail,
        total: invoiceData.total,
        items: invoiceData.items.length
      });

      // Validar email del cliente
      if (!invoiceData.customerEmail || !this.isValidEmail(invoiceData.customerEmail)) {
        console.error('❌ Email del cliente inválido:', invoiceData.customerEmail);
        return false;
      }

      // Verificar si las credenciales de email están configuradas
      const hasEmailConfig = process.env.SMTP_USER && process.env.SMTP_PASS && 
                            process.env.SMTP_USER !== 'tu-email@gmail.com' && 
                            process.env.SMTP_PASS !== 'tu-app-password' &&
                            process.env.SMTP_PASS.length > 10;

      console.log('🔧 Configuración de email:', {
        hasEmailConfig,
        smtpUser: process.env.SMTP_USER,
        smtpHost: process.env.SMTP_HOST,
        smtpPort: process.env.SMTP_PORT
      });

      if (!hasEmailConfig) {
        console.error('❌ Credenciales de email no configuradas correctamente');
        console.error('❌ Configura las variables de entorno SMTP_USER y SMTP_PASS');
        return false;
      }

      // Modo real: enviar email con Nodemailer
      const htmlContent = this.generateInvoiceHTML(invoiceData);
      
      const mailOptions = {
        from: `"Qualipharm Store" <${process.env.SMTP_USER}>`,
        to: invoiceData.customerEmail,
        subject: `Venta #${invoiceData.id} - Qualipharm Store`,
        html: htmlContent,
        attachments: [
          {
            filename: `factura-${invoiceData.id}.pdf`,
            content: this.generateInvoicePDF(invoiceData),
            contentType: 'application/pdf'
          }
        ]
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email enviado exitosamente:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      return false;
    }
  }

  private generateInvoiceHTML(invoiceData: InvoiceData): string {
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Venta #${invoiceData.id} - Qualipharm Store</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8fafc;
                background-color: #f8f9fa;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 10px;
                text-align: center;
                margin-bottom: 30px;
            }
            .header h1 {
                margin: 0;
                font-size: 2.5em;
                font-weight: 300;
            }
            .header p {
                margin: 10px 0 0 0;
                opacity: 0.9;
            }
            .invoice-info {
                background: white;
                padding: 25px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                margin-bottom: 20px;
            }
            .invoice-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 30px;
            }
            .detail-group h3 {
                color: #667eea;
                margin-bottom: 10px;
                font-size: 1.1em;
            }
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                background: white;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .items-table th {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px;
                text-align: left;
                font-weight: 600;
            }
            .items-table td {
                padding: 15px;
                border-bottom: 1px solid #eee;
            }
            .items-table tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            .total-section {
                background: white;
                padding: 25px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                margin-top: 20px;
            }
            .total-row {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid #eee;
            }
            .total-row.final {
                font-size: 1.3em;
                font-weight: bold;
                color: #667eea;
                border-top: 2px solid #667eea;
                margin-top: 10px;
                padding-top: 15px;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding: 20px;
                background: white;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .footer p {
                margin: 5px 0;
                color: #666;
            }
            .status-badge {
                display: inline-block;
                padding: 8px 16px;
                background: #28a745;
                color: white;
                border-radius: 20px;
                font-size: 0.9em;
                font-weight: 600;
                margin: 10px 0;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🏥 Qualipharm Store</h1>
            <p>Sistema de Gestión Farmacéutica LogicQP</p>
            <div class="status-badge">✅ PAGO CONFIRMADO</div>
        </div>

        <div class="invoice-info">
            <div class="invoice-details">
                <div class="detail-group">
                    <h3>📋 Información de la Venta</h3>
                    <p><strong>Número:</strong> #${invoiceData.id}</p>
                    <p><strong>Fecha:</strong> ${invoiceData.date}</p>
                    <p><strong>Hora:</strong> ${invoiceData.time}</p>
                </div>
                <div class="detail-group">
                    <h3>👤 Información del Cliente</h3>
                    <p><strong>Email:</strong> ${invoiceData.customerEmail}</p>
                    <p><strong>Método de Pago:</strong> ${this.getPaymentMethodName(invoiceData.paymentMethod)}</p>
                </div>
            </div>

            <table class="items-table">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th style="text-align: center;">Cantidad</th>
                        <th style="text-align: right;">Precio Unit.</th>
                        <th style="text-align: right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoiceData.items.map(item => `
                        <tr>
                            <td>
                                <strong>${item.product.nombre}</strong><br>
                                <small style="color: #666;">${item.product.marca}</small>
                            </td>
                            <td style="text-align: center;">${item.quantity}</td>
                            <td style="text-align: right;">$${item.product.precio.toFixed(2)}</td>
                            <td style="text-align: right;">$${item.subtotal.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="total-section">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>$${invoiceData.subtotal.toFixed(2)}</span>
                </div>
                <div class="total-row">
                    <span>IVA (15%):</span>
                    <span>$${invoiceData.tax.toFixed(2)}</span>
                </div>
                <div class="total-row final">
                    <span>TOTAL:</span>
                    <span>$${invoiceData.total.toFixed(2)}</span>
                </div>
            </div>
        </div>

        <div class="footer">
            <p><strong>¡Gracias por tu compra en Qualipharm Store!</strong></p>
            <p>Tu pedido ha sido procesado exitosamente.</p>
            <p><strong>📧 Venta enviada a:</strong> ${invoiceData.customerEmail}</p>
            <p><strong>📋 Número de venta:</strong> ${invoiceData.id}</p>
            <p><strong>💳 Método de pago:</strong> ${this.getPaymentMethodText(invoiceData.paymentMethod)}</p>
            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
            <p style="margin-top: 20px; font-size: 0.9em; color: #999;">
                © 2024 Qualipharm Laboratorio Farmacéutico - Todos los derechos reservados
            </p>
        </div>
    </body>
    </html>
    `;
  }

  private generateInvoicePDF(invoiceData: InvoiceData): Buffer {
    try {
      // Generar contenido HTML para el PDF
      const htmlContent = this.generateInvoiceHTML(invoiceData);
      
      // Crear un PDF simple usando jsPDF
      const { jsPDF } = require('jspdf');
      const doc = new jsPDF();
      
      // Configurar el documento
      doc.setFontSize(20);
      doc.text('VENTA #' + invoiceData.id, 20, 30);
      
      doc.setFontSize(12);
      doc.text('Qualipharm Store', 20, 45);
      doc.text('Sistema de Gestión Farmacéutica LogicQP', 20, 55);
      
      // Información de la factura
      doc.text('Fecha: ' + invoiceData.date, 20, 70);
      doc.text('Hora: ' + invoiceData.time, 20, 80);
      doc.text('Cliente: ' + invoiceData.customerEmail, 20, 90);
      doc.text('Método de Pago: ' + this.getPaymentMethodName(invoiceData.paymentMethod), 20, 100);
      
      // Tabla de productos
      let yPosition = 120;
      doc.text('PRODUCTOS:', 20, yPosition);
      yPosition += 10;
      
      invoiceData.items.forEach((item, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(10);
        doc.text(`${item.product.nombre}`, 20, yPosition);
        doc.text(`Cantidad: ${item.quantity}`, 20, yPosition + 5);
        doc.text(`Precio: $${item.product.precio.toFixed(2)}`, 20, yPosition + 10);
        doc.text(`Subtotal: $${item.subtotal.toFixed(2)}`, 20, yPosition + 15);
        yPosition += 25;
      });
      
      // Totales
      yPosition += 10;
      doc.setFontSize(12);
      doc.text('Subtotal: $' + invoiceData.subtotal.toFixed(2), 20, yPosition);
      doc.text('IVA (15%): $' + invoiceData.tax.toFixed(2), 20, yPosition + 10);
      doc.text('TOTAL: $' + invoiceData.total.toFixed(2), 20, yPosition + 20);
      
      // Footer
      doc.setFontSize(10);
      doc.text('¡Gracias por tu compra en Qualipharm Store!', 20, yPosition + 40);
      doc.text('© 2024 Qualipharm Laboratorio Farmacéutico', 20, yPosition + 50);
      
      // Convertir a buffer
      return Buffer.from(doc.output('arraybuffer'));
    } catch (error) {
      console.error('Error generando PDF:', error);
      // En caso de error, devolver un PDF simple
      const { jsPDF } = require('jspdf');
      const doc = new jsPDF();
      doc.text('Error generando PDF', 20, 30);
      doc.text('Venta #' + invoiceData.id, 20, 50);
      doc.text('Total: $' + invoiceData.total.toFixed(2), 20, 70);
      return Buffer.from(doc.output('arraybuffer'));
    }
  }

  private getPaymentMethodName(method: string): string {
    const methods: { [key: string]: string } = {
      'transferencia': 'Transferencia Bancaria',
      'tarjeta': 'Tarjeta de Crédito/Débito',
      'efectivo': 'Efectivo',
      'digital': 'Pago Digital'
    };
    return methods[method] || method;
  }
}

export const emailService = new EmailService();
