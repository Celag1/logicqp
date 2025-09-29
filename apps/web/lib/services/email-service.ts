import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Función para obtener configuración de email desde la base de datos
async function getEmailConfig(): Promise<EmailConfig> {
  try {
    const { data, error } = await supabase
      .from('configuracion')
      .select('clave, valor')
      .in('clave', ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass']);

    if (error || !data) {
      throw new Error('No se pudo obtener configuración de email');
    }

    const config: any = {};
    data.forEach((item: any) => {
      config[item.clave] = item.valor;
    });

    return {
      host: config.smtp_host || 'smtp.gmail.com',
      port: parseInt(config.smtp_port) || 587,
      secure: false,
      auth: {
        user: config.smtp_user || 'qualipharm@gmail.com',
        pass: config.smtp_pass || 'qualipharm123'
      }
    };
  } catch (error) {
    console.error('❌ Error obteniendo configuración de email:', error);
    // Configuración por defecto
    return {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'qualipharm@gmail.com',
        pass: 'qualipharm123'
      }
    };
  }
}

// Función para crear transporter de email
async function createTransporter() {
  const config = await getEmailConfig();
  
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
    tls: {
      rejectUnauthorized: false
    }
  });
}

// Función para enviar email de bienvenida
export async function sendWelcomeEmail(userEmail: string, userName: string, password: string): Promise<boolean> {
  try {
    console.log('📧 Enviando email de bienvenida a:', userEmail);

    const transporter = await createTransporter();

    const template: EmailTemplate = {
      subject: '¡Bienvenido a LogicQP - Qualipharm!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Bienvenido a LogicQP</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .credentials { background: #e5e7eb; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏥 Qualipharm Laboratorio Farmacéutico</h1>
              <h2>¡Bienvenido a LogicQP!</h2>
            </div>
            <div class="content">
              <p>Hola <strong>${userName}</strong>,</p>
              <p>Te damos la bienvenida al sistema LogicQP de Qualipharm Laboratorio Farmacéutico.</p>
              
              <div class="credentials">
                <h3>🔑 Tus credenciales de acceso:</h3>
                <p><strong>Email:</strong> ${userEmail}</p>
                <p><strong>Contraseña temporal:</strong> ${password}</p>
                <p><strong>Rol:</strong> Cliente</p>
              </div>

              <p>Por seguridad, te recomendamos cambiar tu contraseña en tu primer acceso.</p>
              
              <p style="text-align: center;">
                <a href="http://localhost:3000/login" class="button">Acceder al Sistema</a>
              </p>

              <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
            </div>
            <div class="footer">
              <p>Qualipharm Laboratorio Farmacéutico<br>
              Av. 6 de Diciembre N37-140 y Alpallana, Quito, Ecuador<br>
              Tel: +593 2 255 1234 | Email: info@qualipharm.com.ec</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Bienvenido a LogicQP - Qualipharm Laboratorio Farmacéutico
        
        Hola ${userName},
        
        Te damos la bienvenida al sistema LogicQP.
        
        Tus credenciales de acceso:
        - Email: ${userEmail}
        - Contraseña temporal: ${password}
        - Rol: Cliente
        
        Accede al sistema en: http://localhost:3000/login
        
        Por seguridad, cambia tu contraseña en tu primer acceso.
        
        Qualipharm Laboratorio Farmacéutico
        Av. 6 de Diciembre N37-140 y Alpallana, Quito, Ecuador
        Tel: +593 2 255 1234 | Email: info@qualipharm.com.ec
      `
    };

    const info = await transporter.sendMail({
      from: '"Qualipharm LogicQP" <qualipharm@gmail.com>',
      to: userEmail,
      subject: template.subject,
      text: template.text,
      html: template.html
    });

    console.log('✅ Email de bienvenida enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email de bienvenida:', error);
    return false;
  }
}

// Función para enviar email de notificación de venta
export async function sendSaleNotificationEmail(
  clientEmail: string, 
  clientName: string, 
  saleData: {
    id: string;
    total: number;
    fecha: string;
    productos: Array<{ nombre: string; cantidad: number; precio: number }>;
  }
): Promise<boolean> {
  try {
    console.log('📧 Enviando notificación de venta a:', clientEmail);

    const transporter = await createTransporter();

    const productosHtml = saleData.productos.map((p: any) => 
      `<tr><td>${p.nombre}</td><td>${p.cantidad}</td><td>$${p.precio.toFixed(2)}</td><td>$${(p.cantidad * p.precio).toFixed(2)}</td></tr>`
    ).join('');

    const template: EmailTemplate = {
      subject: `Factura de Venta #${saleData.id} - Qualipharm`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Factura de Venta</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .invoice { background: white; padding: 20px; border-radius: 5px; margin: 15px 0; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f3f4f6; }
            .total { font-size: 18px; font-weight: bold; color: #2563eb; }
            .footer { text-align: center; padding: 20px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏥 Qualipharm Laboratorio Farmacéutico</h1>
              <h2>Factura de Venta</h2>
            </div>
            <div class="content">
              <p>Estimado/a <strong>${clientName}</strong>,</p>
              <p>Adjunto encontrará la factura de su compra realizada en Qualipharm.</p>
              
              <div class="invoice">
                <h3>📋 Detalles de la Venta</h3>
                <p><strong>Número de Factura:</strong> #${saleData.id}</p>
                <p><strong>Fecha:</strong> ${new Date(saleData.fecha).toLocaleDateString('es-EC')}</p>
                
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
                    ${productosHtml}
                  </tbody>
                </table>
                
                <div class="total">
                  <p>Total: $${saleData.total.toFixed(2)}</p>
                </div>
              </div>

              <p>Gracias por confiar en Qualipharm para sus necesidades farmacéuticas.</p>
            </div>
            <div class="footer">
              <p>Qualipharm Laboratorio Farmacéutico<br>
              Av. 6 de Diciembre N37-140 y Alpallana, Quito, Ecuador<br>
              Tel: +593 2 255 1234 | Email: info@qualipharm.com.ec</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Factura de Venta #${saleData.id} - Qualipharm Laboratorio Farmacéutico
        
        Estimado/a ${clientName},
        
        Adjunto encontrará la factura de su compra.
        
        Detalles de la Venta:
        - Número: #${saleData.id}
        - Fecha: ${new Date(saleData.fecha).toLocaleDateString('es-EC')}
        
        Productos:
        ${saleData.productos.map((p: any) => `- ${p.nombre} x${p.cantidad} = $${(p.cantidad * p.precio).toFixed(2)}`).join('\n')}
        
        Total: $${saleData.total.toFixed(2)}
        
        Gracias por confiar en Qualipharm.
        
        Qualipharm Laboratorio Farmacéutico
        Av. 6 de Diciembre N37-140 y Alpallana, Quito, Ecuador
        Tel: +593 2 255 1234 | Email: info@qualipharm.com.ec
      `
    };

    const info = await transporter.sendMail({
      from: '"Qualipharm LogicQP" <qualipharm@gmail.com>',
      to: clientEmail,
      subject: template.subject,
      text: template.text,
      html: template.html
    });

    console.log('✅ Notificación de venta enviada:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error enviando notificación de venta:', error);
    return false;
  }
}

// Función para enviar email de alerta de stock bajo
export async function sendLowStockAlertEmail(
  adminEmail: string,
  productData: {
    nombre: string;
    stock: number;
    stock_minimo: number;
  }
): Promise<boolean> {
  try {
    console.log('📧 Enviando alerta de stock bajo a:', adminEmail);

    const transporter = await createTransporter();

    const template: EmailTemplate = {
      subject: '⚠️ Alerta: Stock Bajo - Qualipharm',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Alerta de Stock Bajo</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #fef2f2; }
            .alert { background: #fecaca; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #dc2626; }
            .footer { text-align: center; padding: 20px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Alerta de Stock Bajo</h1>
              <h2>Qualipharm Laboratorio Farmacéutico</h2>
            </div>
            <div class="content">
              <div class="alert">
                <h3>🚨 Producto con Stock Bajo</h3>
                <p><strong>Producto:</strong> ${productData.nombre}</p>
                <p><strong>Stock Actual:</strong> ${productData.stock} unidades</p>
                <p><strong>Stock Mínimo:</strong> ${productData.stock_minimo} unidades</p>
                <p><strong>Estado:</strong> <span style="color: #dc2626; font-weight: bold;">REQUIERE REABASTECIMIENTO</span></p>
              </div>
              
              <p>Por favor, proceda a reabastecer este producto lo antes posible para evitar desabastecimiento.</p>
              
              <p>Acceda al sistema para gestionar el inventario: <a href="http://localhost:3000/inventario">http://localhost:3000/inventario</a></p>
            </div>
            <div class="footer">
              <p>Sistema LogicQP - Qualipharm Laboratorio Farmacéutico</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Alerta de Stock Bajo - Qualipharm Laboratorio Farmacéutico
        
        Producto con Stock Bajo:
        - Producto: ${productData.nombre}
        - Stock Actual: ${productData.stock} unidades
        - Stock Mínimo: ${productData.stock_minimo} unidades
        - Estado: REQUIERE REABASTECIMIENTO
        
        Por favor, proceda a reabastecer este producto lo antes posible.
        
        Acceda al sistema: http://localhost:3000/inventario
        
        Sistema LogicQP - Qualipharm Laboratorio Farmacéutico
      `
    };

    const info = await transporter.sendMail({
      from: '"Qualipharm LogicQP" <qualipharm@gmail.com>',
      to: adminEmail,
      subject: template.subject,
      text: template.text,
      html: template.html
    });

    console.log('✅ Alerta de stock bajo enviada:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error enviando alerta de stock bajo:', error);
    return false;
  }
}

// Función para enviar email de cambio de rol
export async function sendRoleChangeEmail(
  userEmail: string,
  userName: string,
  newRole: string,
  adminName: string
): Promise<boolean> {
  try {
    console.log('📧 Enviando notificación de cambio de rol a:', userEmail);

    const transporter = await createTransporter();

    const template: EmailTemplate = {
      subject: '👤 Cambio de Rol - LogicQP Qualipharm',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Cambio de Rol</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .role-info { background: #e5e7eb; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>👤 Cambio de Rol</h1>
              <h2>Qualipharm Laboratorio Farmacéutico</h2>
            </div>
            <div class="content">
              <p>Hola <strong>${userName}</strong>,</p>
              <p>Tu rol en el sistema LogicQP ha sido actualizado por <strong>${adminName}</strong>.</p>
              
              <div class="role-info">
                <h3>🎯 Nuevo Rol Asignado</h3>
                <p><strong>Rol:</strong> ${newRole}</p>
                <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-EC')}</p>
              </div>

              <p>Por favor, inicia sesión nuevamente para que los cambios surtan efecto.</p>
              
              <p style="text-align: center;">
                <a href="http://localhost:3000/login" style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Acceder al Sistema</a>
              </p>
            </div>
            <div class="footer">
              <p>Qualipharm Laboratorio Farmacéutico<br>
              Av. 6 de Diciembre N37-140 y Alpallana, Quito, Ecuador<br>
              Tel: +593 2 255 1234 | Email: info@qualipharm.com.ec</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Cambio de Rol - Qualipharm Laboratorio Farmacéutico
        
        Hola ${userName},
        
        Tu rol en el sistema LogicQP ha sido actualizado por ${adminName}.
        
        Nuevo Rol Asignado:
        - Rol: ${newRole}
        - Fecha: ${new Date().toLocaleDateString('es-EC')}
        
        Por favor, inicia sesión nuevamente para que los cambios surtan efecto.
        
        Acceder al sistema: http://localhost:3000/login
        
        Qualipharm Laboratorio Farmacéutico
        Av. 6 de Diciembre N37-140 y Alpallana, Quito, Ecuador
        Tel: +593 2 255 1234 | Email: info@qualipharm.com.ec
      `
    };

    const info = await transporter.sendMail({
      from: '"Qualipharm LogicQP" <qualipharm@gmail.com>',
      to: userEmail,
      subject: template.subject,
      text: template.text,
      html: template.html
    });

    console.log('✅ Notificación de cambio de rol enviada:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error enviando notificación de cambio de rol:', error);
    return false;
  }
}
