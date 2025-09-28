const { Client } = require('pg');

async function populateUsers() {
  console.log('👥 Poblando usuarios en la base de datos...');
  
  const client = new Client({
    host: '127.0.0.1',
    port: 54322,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres',
  });

  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL');

    // Insertar usuarios de ejemplo
    await client.query(`
      INSERT INTO public.profiles (id, email, nombre, apellido, rol, telefono, direccion, empresa, email_verificado) VALUES 
      ('550e8400-e29b-41d4-a716-446655440000', 'admin@qualipharm.com.ec', 'Administrador', 'Sistema', 'administrador', '+593 99 123 4567', 'Quito, Ecuador', 'Qualipharm', true),
      ('550e8400-e29b-41d4-a716-446655440001', 'vendedor@qualipharm.com.ec', 'Juan', 'Pérez', 'vendedor', '+593 98 765 4321', 'Quito, Ecuador', 'Qualipharm', true),
      ('550e8400-e29b-41d4-a716-446655440002', 'inventario@qualipharm.com.ec', 'María', 'González', 'vendedor', '+593 97 654 3210', 'Guayaquil, Ecuador', 'Qualipharm', true),
      ('550e8400-e29b-41d4-a716-446655440003', 'contador@qualipharm.com.ec', 'Carlos', 'Ruiz', 'vendedor', '+593 96 543 2109', 'Cuenca, Ecuador', 'Qualipharm', true),
      ('550e8400-e29b-41d4-a716-446655440004', 'cliente@farmacia.com.ec', 'Ana', 'Torres', 'cliente', '+593 95 432 1098', 'Ambato, Ecuador', 'Farmacia San Rafael', false)
      ON CONFLICT (email) DO NOTHING;
    `);

    console.log('✅ Usuarios insertados exitosamente');
    console.log('📊 Usuarios disponibles:');
    console.log('   - admin@qualipharm.com.ec (Administrador)');
    console.log('   - vendedor@qualipharm.com.ec (Vendedor)');
    console.log('   - inventario@qualipharm.com.ec (Inventario)');
    console.log('   - contador@qualipharm.com.ec (Contador)');
    console.log('   - cliente@farmacia.com.ec (Cliente)');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

populateUsers();
