import nodemailer from 'nodemailer';

interface EmailConfirmationData {
  email: string;
  confirmationUrl: string;
  userName: string;
}

class EmailConfirmationService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'celag3@gmail.com',
        pass: process.env.SMTP_PASS || 'szsw xhti kgfp khdy'
      }
    });
  }

  async sendConfirmationEmail(data: EmailConfirmationData): Promise<boolean> {
    try {
      const hasEmailConfig = process.env.SMTP_USER && process.env.SMTP_PASS && 
                            process.env.SMTP_USER !== 'tu-email@gmail.com' && 
                            process.env.SMTP_PASS !== 'tu-app-password';

      if (!hasEmailConfig) {
        console.log('📧 Modo demostración: Simulando envío de email de confirmación');
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('✅ Email de confirmación simulado enviado exitosamente');
        return true;
      }

      const htmlContent = this.generateConfirmationHTML(data);
      
      const mailOptions = {
        from: `"Qualipharm Laboratorio Farmacéutico" <${process.env.SMTP_USER}>`,
        to: data.email,
        subject: 'Confirma tu cuenta - Qualipharm Laboratorio Farmacéutico',
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email de confirmación enviado exitosamente:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email de confirmación:', error);
      return false;
    }
  }

  private generateConfirmationHTML(data: EmailConfirmationData): string {
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirma tu cuenta - Qualipharm</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: #ffffff;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #2563eb;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #2563eb;
                margin-bottom: 10px;
            }
            .subtitle {
                color: #666;
                font-size: 16px;
            }
            .content {
                margin-bottom: 30px;
            }
            .welcome {
                font-size: 24px;
                color: #2563eb;
                margin-bottom: 20px;
            }
            .message {
                font-size: 16px;
                margin-bottom: 30px;
                line-height: 1.8;
            }
            .button {
                display: inline-block;
                background-color: #2563eb;
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                font-size: 16px;
                margin: 20px 0;
                transition: background-color 0.3s;
            }
            .button:hover {
                background-color: #1d4ed8;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
            }
            .security-note {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
                border-left: 4px solid #28a745;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🏥 Qualipharm</div>
                <div class="subtitle">Laboratorio Farmacéutico</div>
            </div>
            
            <div class="content">
                <h1 class="welcome">¡Bienvenido, ${data.userName}!</h1>
                
                <div class="message">
                    <p>Gracias por registrarte en nuestro sistema. Para completar tu registro y acceder a todas las funcionalidades, necesitas confirmar tu dirección de email.</p>
                    
                    <p>Haz clic en el botón de abajo para confirmar tu cuenta:</p>
                </div>
                
                <div style="text-align: center;">
                    <a href="${data.confirmationUrl}" class="button">✅ Confirmar mi cuenta</a>
                </div>
                
                <div class="security-note">
                    <strong>🔒 Nota de seguridad:</strong> Este enlace es válido por 24 horas. Si no solicitaste esta cuenta, puedes ignorar este email.
                </div>
                
                <div class="message">
                    <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                    <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace;">
                        ${data.confirmationUrl}
                    </p>
                </div>
            </div>
            
            <div class="footer">
                <p><strong>Qualipharm Laboratorio Farmacéutico</strong></p>
                <p>Av. Principal 123, Quito, Ecuador</p>
                <p>Tel: +593 2 123 4567 | Email: info@qualipharm.com</p>
                <p>© 2025 LogicQP. Todos los derechos reservados.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}

export const emailConfirmationService = new EmailConfirmationService();