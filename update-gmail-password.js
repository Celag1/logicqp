#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Actualizando contraseña de Gmail...\n');

// Contraseña de aplicación de Gmail (reemplaza con tu contraseña real)
const gmailAppPassword = 'abcd efgh ijkl mnop'; // Reemplaza con tu contraseña real

try {
  // Actualizar supabase/.env
  const supabaseEnvPath = 'supabase/.env';
  if (fs.existsSync(supabaseEnvPath)) {
    let content = fs.readFileSync(supabaseEnvPath, 'utf8');
    content = content.replace('tu-app-password-gmail', gmailAppPassword);
    fs.writeFileSync(supabaseEnvPath, content);
    console.log('✅ supabase/.env actualizado');
  }

  // Actualizar apps/web/.env.local
  const appEnvPath = 'apps/web/.env.local';
  if (fs.existsSync(appEnvPath)) {
    let content = fs.readFileSync(appEnvPath, 'utf8');
    content = content.replace('tu-app-password-gmail', gmailAppPassword);
    fs.writeFileSync(appEnvPath, content);
    console.log('✅ apps/web/.env.local actualizado');
  }

  console.log('\n📧 CONFIGURACIÓN ACTUALIZADA');
  console.log('=============================');
  console.log('✅ Contraseña de Gmail configurada');
  console.log('⚠️  IMPORTANTE: Esta es una contraseña de prueba');
  console.log('📝 Para usar emails reales:');
  console.log('   1. Ve a tu cuenta de Google');
  console.log('   2. Seguridad > Verificación en 2 pasos');
  console.log('   3. Contraseñas de aplicaciones');
  console.log('   4. Genera una contraseña para "Mail"');
  console.log('   5. Reemplaza la contraseña en los archivos .env');
  console.log('\n🧪 Probando configuración...');

} catch (error) {
  console.error('❌ Error actualizando contraseña:', error.message);
  process.exit(1);
}
