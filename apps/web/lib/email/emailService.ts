import nodemailer from 'nodemailer'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null
  private config: EmailConfig | null = null

  constructor() {
    this.initializeConfig()
  }

  private initializeConfig() {
    // Configuración para Gmail (puedes cambiar por otro proveedor)
    this.config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER || 'notificaciones@qualipharm.com.ec',
        pass: process.env.SMTP_PASSWORD || ''
      }
    }

    // Crear transporter
    this.transporter = nodemailer.createTransport(this.config)
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!this.transporter) {
        throw new Error('Email service not initialized')
      }

      const mailOptions = {
        from: `"Qualipharm Laboratorio Farmacéutico" <${this.config?.auth.user}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments
      }

      const result = await this.transporter.sendMail(mailOptions)
      console.log('✅ Email enviado exitosamente:', result.messageId)
      return true
    } catch (error) {
      console.error('❌ Error enviando email:', error)
      return false
    }
  }

  // Email de bienvenida para nuevos usuarios
  async sendWelcomeEmail(userEmail: string, userName: string, password: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bienvenido a Qualipharm</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c5aa0; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { background: #333; color: white; padding: 10px; text-align: center; font-size: 12px; }
          .button { display: inline-block; padding: 10px 20px; background: #2c5aa0; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Qualipharm Laboratorio Farmacéutico</h1>
            <p>Sistema de Gestión Farmacéutica</p>
          </div>
          <div class="content">
            <h2>¡Bienvenido, ${userName}!</h2>
            <p>Su cuenta ha sido creada exitosamente en el sistema Qualipharm.</p>
            <p><strong>Credenciales de acceso:</strong></p>
            <ul>
              <li><strong>Email:</strong> ${userEmail}</li>
              <li><strong>Contraseña temporal:</strong> ${password}</li>
            </ul>
            <p>Por seguridad, le recomendamos cambiar su contraseña en el primer inicio de sesión.</p>
            <p style="text-align: center;">
              <a href="http://localhost:3000/login" class="button">Iniciar Sesión</a>
            </p>
            <p>Si tiene alguna pregunta, no dude en contactarnos.</p>
          </div>
          <div class="footer">
            <p>Qualipharm Laboratorio Farmacéutico | Av. 6 de Diciembre N37-140 y Alpallana, Quito, Ecuador</p>
            <p>Tel: +593 2 255 1234 | Email: info@qualipharm.com.ec</p>
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail({
      to: userEmail,
      subject: 'Bienvenido a Qualipharm - Sistema de Gestión Farmacéutica',
      html
    })
  }

  // Email de notificación de venta
  async sendSaleNotification(
    clientEmail: string, 
    clientName: string, 
    saleNumber: string, 
    total: number, 
    items: Array<{ nombre: string; cantidad: number; precio: number }>
  ): Promise<boolean> {
    const itemsHtml = items.map(item => 
      `<tr>
        <td>${item.nombre}</td>
        <td style="text-align: center;">${item.cantidad}</td>
        <td style="text-align: right;">$${item.precio.toFixed(2)}</td>
        <td style="text-align: right;">$${(item.cantidad * item.precio).toFixed(2)}</td>
      </tr>`
    ).join('')

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmación de Venta - Qualipharm</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c5aa0; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { background: #333; color: white; padding: 10px; text-align: center; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { font-size: 18px; font-weight: bold; color: #2c5aa0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Qualipharm Laboratorio Farmacéutico</h1>
            <p>Confirmación de Venta</p>
          </div>
          <div class="content">
            <h2>Estimado/a ${clientName},</h2>
            <p>Le confirmamos que su pedido ha sido procesado exitosamente.</p>
            <p><strong>Número de Venta:</strong> ${saleNumber}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-EC')}</p>
            
            <h3>Detalle de Productos:</h3>
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unit.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div style="text-align: right; margin-top: 20px;">
              <p class="total">Total: $${total.toFixed(2)}</p>
            </div>
            
            <p>Gracias por confiar en Qualipharm para sus necesidades farmacéuticas.</p>
          </div>
          <div class="footer">
            <p>Qualipharm Laboratorio Farmacéutico | Av. 6 de Diciembre N37-140 y Alpallana, Quito, Ecuador</p>
            <p>Tel: +593 2 255 1234 | Email: info@qualipharm.com.ec</p>
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail({
      to: clientEmail,
      subject: `Confirmación de Venta ${saleNumber} - Qualipharm`,
      html
    })
  }

  // Email de notificación de stock bajo
  async sendLowStockAlert(
    adminEmail: string,
    products: Array<{ codigo: string; nombre: string; stock: number; stock_minimo: number }>
  ): Promise<boolean> {
    const productsHtml = products.map(product => 
      `<tr>
        <td>${product.codigo}</td>
        <td>${product.nombre}</td>
        <td style="text-align: center; color: red; font-weight: bold;">${product.stock}</td>
        <td style="text-align: center;">${product.stock_minimo}</td>
      </tr>`
    ).join('')

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Alerta de Stock Bajo - Qualipharm</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { background: #333; color: white; padding: 10px; text-align: center; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .alert { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Alerta de Stock Bajo</h1>
            <p>Qualipharm Laboratorio Farmacéutico</p>
          </div>
          <div class="content">
            <div class="alert">
              <h3>¡Atención!</h3>
              <p>Los siguientes productos tienen stock por debajo del mínimo establecido:</p>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Producto</th>
                  <th>Stock Actual</th>
                  <th>Stock Mínimo</th>
                </tr>
              </thead>
              <tbody>
                ${productsHtml}
              </tbody>
            </table>
            
            <p>Por favor, proceda a realizar los pedidos necesarios para reponer el inventario.</p>
          </div>
          <div class="footer">
            <p>Qualipharm Laboratorio Farmacéutico | Av. 6 de Diciembre N37-140 y Alpallana, Quito, Ecuador</p>
            <p>Tel: +593 2 255 1234 | Email: info@qualipharm.com.ec</p>
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail({
      to: adminEmail,
      subject: '⚠️ Alerta de Stock Bajo - Qualipharm',
      html
    })
  }

  // Email de reporte generado
  async sendReportEmail(
    userEmail: string,
    reportName: string,
    reportUrl: string,
    reportData: any
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reporte Generado - Qualipharm</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c5aa0; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { background: #333; color: white; padding: 10px; text-align: center; font-size: 12px; }
          .button { display: inline-block; padding: 10px 20px; background: #2c5aa0; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Qualipharm Laboratorio Farmacéutico</h1>
            <p>Reporte Generado</p>
          </div>
          <div class="content">
            <h2>Su reporte está listo</h2>
            <p><strong>Reporte:</strong> ${reportName}</p>
            <p><strong>Fecha de generación:</strong> ${new Date().toLocaleString('es-EC')}</p>
            
            <p style="text-align: center;">
              <a href="${reportUrl}" class="button">Descargar Reporte</a>
            </p>
            
            <p>El reporte contiene la información solicitada y está disponible para su descarga.</p>
          </div>
          <div class="footer">
            <p>Qualipharm Laboratorio Farmacéutico | Av. 6 de Diciembre N37-140 y Alpallana, Quito, Ecuador</p>
            <p>Tel: +593 2 255 1234 | Email: info@qualipharm.com.ec</p>
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail({
      to: userEmail,
      subject: `Reporte Generado: ${reportName} - Qualipharm`,
      html
    })
  }

  // Verificar configuración de email
  async verifyConnection(): Promise<boolean> {
    try {
      if (!this.transporter) {
        return false
      }
      await this.transporter.verify()
      console.log('✅ Configuración de email verificada correctamente')
      return true
    } catch (error) {
      console.error('❌ Error verificando configuración de email:', error)
      return false
    }
  }
}

// Instancia singleton
export const emailService = new EmailService()
