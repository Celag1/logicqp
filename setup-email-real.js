#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando emails reales con Gmail...\n');

// Crear archivo .env para Supabase
const supabaseEnvContent = `# =====================================================
# SUPABASE - VARIABLES DE ENTORNO PARA EMAILS REALES
# =====================================================

# Configuración SMTP para emails reales
SUPABASE_AUTH_EMAIL_SMTP_PASS=tu-app-password-gmail

# Configuración de la aplicación
SUPABASE_APP_URL=http://localhost:3000
`;

try {
  // Crear directorio supabase si no existe
  if (!fs.existsSync('supabase')) {
    fs.mkdirSync('supabase');
  }

  // Escribir archivo .env
  fs.writeFileSync('supabase/.env', supabaseEnvContent);
  console.log('✅ Archivo supabase/.env creado');

  // Crear archivo .env.local para la aplicación
  const appEnvContent = `# =====================================================
# LOGICQP - VARIABLES DE ENTORNO PARA DESARROLLO LOCAL
# =====================================================

# Configuración de Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# Configuración de Email (Gmail SMTP) - EMAILS REALES
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=celag3@gmail.com
SMTP_PASS=tu-app-password-gmail

# Configuración de la aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Configuración de seguridad
JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long

# Configuración de la empresa
EMPRESA_NOMBRE=Qualipharm Laboratorio Farmacéutico
EMPRESA_RUC=1234567890001
EMPRESA_EMAIL=info@qualipharm.com
EMPRESA_TELEFONO=+593 2 123 4567

# Configuración del sistema
SISTEMA_IVA=15.00
SISTEMA_MONEDA=USD
SISTEMA_TIMEZONE=America/Guayaquil
`;

  fs.writeFileSync('apps/web/.env.local', appEnvContent);
  console.log('✅ Archivo apps/web/.env.local creado');

  console.log('\n📧 CONFIGURACIÓN DE EMAILS REALES COMPLETADA');
  console.log('==========================================');
  console.log('✅ SMTP configurado: smtp.gmail.com:587');
  console.log('✅ Usuario: celag3@gmail.com');
  console.log('⚠️  IMPORTANTE: Debes configurar tu App Password de Gmail');
  console.log('📝 Pasos:');
  console.log('   1. Ve a tu cuenta de Google');
  console.log('   2. Seguridad > Verificación en 2 pasos');
  console.log('   3. Contraseñas de aplicaciones');
  console.log('   4. Genera una contraseña para "Mail"');
  console.log('   5. Reemplaza "tu-app-password-gmail" en los archivos .env');
  console.log('\n🔄 Reiniciando Supabase...');

  // Reiniciar Supabase
  try {
    execSync('npx supabase stop', { stdio: 'inherit' });
    execSync('npx supabase start', { stdio: 'inherit' });
    console.log('✅ Supabase reiniciado con configuración de email real');
  } catch (error) {
    console.log('⚠️  Error reiniciando Supabase:', error.message);
    console.log('💡 Ejecuta manualmente: npx supabase stop && npx supabase start');
  }

} catch (error) {
  console.error('❌ Error configurando emails reales:', error.message);
  process.exit(1);
}
