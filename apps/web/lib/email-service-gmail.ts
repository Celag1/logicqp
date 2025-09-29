import nodemailer from 'nodemailer';

// Configuración de Gmail para envío de emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'celag3@gmail.com',
    pass: 'szsw xhti kgfp khdy' // App Password de Gmail
  }
});

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface InvoiceData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  notes?: string;
}

export const emailServiceGmail = {
  sendInvoice: async (invoiceData: InvoiceData) => {
    try {
      console.log('📧 Enviando factura con Gmail a:', invoiceData.customerEmail);
      
      const itemsHtml = invoiceData.items.map(item => `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${item.price.toFixed(2)}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${item.subtotal.toFixed(2)}</td>
        </tr>
      `).join('');

      const emailContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">🏆 LogicQP</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">La Mejor Tienda Virtual del Mundo</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #0056b3; margin-bottom: 20px;">¡Gracias por tu compra!</h2>
            <p>Estimado/a <strong>${invoiceData.customerName}</strong>,</p>
            <p>Tu pedido ha sido procesado exitosamente. Aquí están los detalles de tu compra:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #0056b3; margin-bottom: 15px;">📋 Detalles del Pedido</h3>
              <p><strong>Número de Orden:</strong> <span style="color: #667eea; font-weight: bold;">#${invoiceData.orderId}</span></p>
              <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-EC')}</p>
              <p><strong>Método de Pago:</strong> ${invoiceData.paymentMethod}</p>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #0056b3; margin-bottom: 15px;">👤 Información del Cliente</h3>
              <p><strong>Nombre:</strong> ${invoiceData.customerName}</p>
              <p><strong>Email:</strong> ${invoiceData.customerEmail}</p>
              ${invoiceData.customerPhone ? `<p><strong>Teléfono:</strong> ${invoiceData.customerPhone}</p>` : ''}
              ${invoiceData.customerAddress ? `<p><strong>Dirección:</strong> ${invoiceData.customerAddress}</p>` : ''}
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #0056b3; margin-bottom: 15px;">🛒 Productos Comprados</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                  <tr style="background: #f8f9fa;">
                    <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Producto</th>
                    <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Cantidad</th>
                    <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Precio Unit.</th>
                    <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div style="border-top: 2px solid #667eea; padding-top: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span><strong>Subtotal:</strong></span>
                  <span><strong>$${invoiceData.subtotal.toFixed(2)}</strong></span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span><strong>IVA (15%):</strong></span>
                  <span><strong>$${invoiceData.tax.toFixed(2)}</strong></span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 18px; color: #667eea; font-weight: bold; border-top: 1px solid #ddd; padding-top: 10px;">
                  <span>TOTAL:</span>
                  <span>$${invoiceData.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            ${invoiceData.notes ? `
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #1976d2; margin: 0 0 10px 0;">📝 Notas Adicionales</h4>
              <p style="margin: 0;">${invoiceData.notes}</p>
            </div>
            ` : ''}

            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h3 style="color: #2e7d32; margin: 0 0 10px 0;">✅ Pago Confirmado</h3>
              <p style="margin: 0; color: #388e3c;">Tu pago ha sido procesado exitosamente. Recibirás tus productos pronto.</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #666; font-size: 14px;">
                Si tienes alguna pregunta, no dudes en contactarnos.<br>
                <strong>¡Gracias por elegir LogicQP - La Mejor Tienda Virtual del Mundo!</strong>
              </p>
            </div>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© 2025 LogicQP. Todos los derechos reservados.</p>
          </div>
        </div>
      `;

      const mailOptions = {
        from: `"LogicQP - La Mejor Tienda Virtual" <celag3@gmail.com>`,
        to: invoiceData.customerEmail,
        subject: `✅ Factura de Compra LogicQP - Orden #${invoiceData.orderId}`,
        html: emailContent,
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Factura enviada exitosamente a ${invoiceData.customerEmail}`);
      
      return { 
        success: true, 
        message: 'Factura enviada exitosamente' 
      };

    } catch (error: any) {
      console.error(`❌ Error enviando factura:`, error);
      return { 
        success: false, 
        message: 'Error al enviar factura', 
        error: error.message 
      };
    }
  }
};
