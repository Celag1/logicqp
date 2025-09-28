#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 VERIFICANDO DATOS QUALIPHARM');

async function verifyQualipharmData() {
  try {
    // Verificar usuarios
    const { data: usuariosData } = await supabase
      .from('profiles')
      .select('email, nombre, apellido, rol')
      .order('created_at');

    console.log(`✅ Usuarios: ${usuariosData?.length || 0}`);
    if (usuariosData) {
      usuariosData.forEach(usuario => {
        console.log(`   - ${usuario.nombre} ${usuario.apellido} (${usuario.email}) - ${usuario.rol}`);
      });
    }

    // Verificar productos
    const { data: productosData } = await supabase
      .from('productos')
      .select('nombre, precio, stock, codigo_barras')
      .order('nombre');

    console.log(`✅ Productos: ${productosData?.length || 0}`);

    // Verificar ventas
    const { data: ventasData } = await supabase
      .from('ventas')
      .select('id, total, estado')
      .order('fecha', { ascending: false });

    console.log(`✅ Ventas: ${ventasData?.length || 0}`);

    // Verificar empresa
    const { data: empresaData } = await supabase
      .from('empresa_config')
      .select('nombre, ruc')
      .single();

    if (empresaData) {
      console.log(`✅ Empresa: ${empresaData.nombre} (${empresaData.ruc})`);
    }

    console.log('🎉 ¡VERIFICACIÓN COMPLETADA!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  verifyQualipharmData();
}

module.exports = { verifyQualipharmData };