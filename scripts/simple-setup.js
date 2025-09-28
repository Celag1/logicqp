const { Client } = require('pg');

async function simpleSetup() {
  console.log('🚀 Configuración simple de LogicQP...');
  
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

    // Crear esquema auth
    await client.query('CREATE SCHEMA IF NOT EXISTS auth;');
    
    // Crear tabla auth.users
    await client.query(`
      CREATE TABLE IF NOT EXISTS auth.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Crear tipos
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('administrador', 'vendedor', 'cliente');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    // Crear tabla profiles
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        nombre TEXT NOT NULL,
        apellido TEXT,
        rol user_role DEFAULT 'vendedor',
        telefono TEXT,
        direccion TEXT,
        empresa TEXT,
        email_verificado BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Crear tabla empresa_config
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.empresa_config (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre TEXT NOT NULL,
        logo_url TEXT,
        direccion TEXT,
        telefono TEXT,
        email TEXT,
        ruc TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Crear tabla productos
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.productos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre TEXT NOT NULL,
        descripcion TEXT,
        codigo_barras TEXT UNIQUE,
        precio DECIMAL(10,2) NOT NULL,
        stock_minimo INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Insertar datos básicos
    await client.query(`
      INSERT INTO public.empresa_config (nombre, direccion, telefono, email, ruc) VALUES
      ('Qualipharm Laboratorio Farmacéutico', 'Av. 6 de Diciembre N37-140, Quito', '+593 2 255 1234', 'info@qualipharm.com.ec', '1791234567001')
      ON CONFLICT DO NOTHING;
    `);

    await client.query(`
      INSERT INTO public.profiles (email, nombre, apellido, rol, telefono, direccion, empresa, email_verificado) VALUES
      ('admin@qualipharm.com.ec', 'Administrador', 'Sistema', 'administrador', '+593 99 123 4567', 'Quito, Ecuador', 'Qualipharm', true),
      ('vendedor@qualipharm.com.ec', 'Juan', 'Pérez', 'vendedor', '+593 98 765 4321', 'Quito, Ecuador', 'Qualipharm', true)
      ON CONFLICT DO NOTHING;
    `);

    await client.query(`
      INSERT INTO public.productos (nombre, descripcion, codigo_barras, precio, stock_minimo) VALUES
      ('Amoxicilina 500mg', 'Antibiótico de amplio espectro', '1234567890123', 2.50, 100),
      ('Ibuprofeno 400mg', 'Antiinflamatorio', '1234567890124', 1.20, 200),
      ('Paracetamol 500mg', 'Analgésico', '1234567890125', 0.80, 300)
      ON CONFLICT DO NOTHING;
    `);

    console.log('✅ Base de datos configurada exitosamente');
    console.log('📊 Datos de Qualipharm insertados');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

simpleSetup();
