#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('📧 CONFIGURACIÓN DE GMAIL PARA EMAILS REALES');
console.log('=============================================\n');

console.log('📝 INSTRUCCIONES PARA OBTENER TU CONTRASEÑA DE APLICACIÓN:');
console.log('1. Ve a tu cuenta de Google: https://myaccount.google.com/');
console.log('2. Seguridad > Verificación en 2 pasos');
console.log('3. Contraseñas de aplicaciones');
console.log('4. Selecciona "Mail" y genera una contraseña');
console.log('5. Copia la contraseña de 16 caracteres (ej: abcd efgh ijkl mnop)\n');

rl.question('🔑 Ingresa tu contraseña de aplicación de Gmail: ', (password) => {
  if (!password || password.length < 16) {
    console.log('❌ Contraseña inválida. Debe tener al menos 16 caracteres.');
    rl.close();
    return;
  }

  try {
    // Actualizar supabase/.env
    const supabaseEnvPath = 'supabase/.env';
    if (fs.existsSync(supabaseEnvPath)) {
      let content = fs.readFileSync(supabaseEnvPath, 'utf8');
      content = content.replace(/SUPABASE_AUTH_EMAIL_SMTP_PASS=.*/, `SUPABASE_AUTH_EMAIL_SMTP_PASS=${password}`);
      fs.writeFileSync(supabaseEnvPath, content);
      console.log('✅ supabase/.env actualizado');
    }

    // Actualizar apps/web/.env.local
    const appEnvPath = 'apps/web/.env.local';
    if (fs.existsSync(appEnvPath)) {
      let content = fs.readFileSync(appEnvPath, 'utf8');
      content = content.replace(/SMTP_PASS=.*/, `SMTP_PASS=${password}`);
      fs.writeFileSync(appEnvPath, content);
      console.log('✅ apps/web/.env.local actualizado');
    }

    console.log('\n🎉 CONFIGURACIÓN COMPLETADA');
    console.log('============================');
    console.log('✅ Contraseña de Gmail configurada correctamente');
    console.log('✅ Emails reales habilitados');
    console.log('🔄 Reiniciando Supabase...');

    // Reiniciar Supabase
    const { execSync } = require('child_process');
    try {
      execSync('npx supabase stop', { stdio: 'inherit' });
      execSync('npx supabase start', { stdio: 'inherit' });
      console.log('✅ Supabase reiniciado con configuración de email real');
      console.log('\n🚀 ¡SISTEMA LISTO PARA ENVIAR EMAILS REALES!');
    } catch (error) {
      console.log('⚠️  Error reiniciando Supabase:', error.message);
      console.log('💡 Ejecuta manualmente: npx supabase stop && npx supabase start');
    }

  } catch (error) {
    console.error('❌ Error configurando Gmail:', error.message);
  }

  rl.close();
});


