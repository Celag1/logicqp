const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugDatabase() {
  console.log('🔍 Verificando base de datos...');
  
  try {
    // Verificar productos
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('*');
    
    console.log('📊 Productos encontrados:', productos?.length || 0);
    if (productosError) {
      console.error('❌ Error productos:', productosError);
    } else {
      console.log('✅ Primeros 3 productos:', productos?.slice(0, 3));
    }
    
    // Verificar categorías
    const { data: categorias, error: categoriasError } = await supabase
      .from('categorias')
      .select('*');
    
    console.log('📊 Categorías encontradas:', categorias?.length || 0);
    if (categoriasError) {
      console.error('❌ Error categorías:', categoriasError);
    }
    
    // Verificar proveedores
    const { data: proveedores, error: proveedoresError } = await supabase
      .from('proveedores')
      .select('*');
    
    console.log('📊 Proveedores encontrados:', proveedores?.length || 0);
    if (proveedoresError) {
      console.error('❌ Error proveedores:', proveedoresError);
    }
    
    // Verificar lotes
    const { data: lotes, error: lotesError } = await supabase
      .from('lotes')
      .select('*');
    
    console.log('📊 Lotes encontrados:', lotes?.length || 0);
    if (lotesError) {
      console.error('❌ Error lotes:', lotesError);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

debugDatabase();

