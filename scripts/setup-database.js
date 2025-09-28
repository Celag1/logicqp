const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  console.log('🚀 Configurando base de datos LogicQP...');
  
  const client = new Client({
    host: '127.0.0.1',
    port: 54322,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres',
  });

  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL local');

    // Crear esquema auth si no existe
    await client.query('CREATE SCHEMA IF NOT EXISTS auth;');
    console.log('✅ Esquema auth creado');

    // Crear tabla auth.users
    await client.query(`
      CREATE TABLE IF NOT EXISTS auth.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla auth.users creada');

    // Crear tipos personalizados
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM (
          'super_admin',
          'administrador', 
          'vendedor',
          'inventario',
          'contador',
          'cliente'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE venta_estado AS ENUM (
          'pendiente',
          'completada',
          'cancelada'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE inventario_movimiento AS ENUM (
          'entrada',
          'salida',
          'ajuste'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE reporte_tipo AS ENUM (
          'ventas',
          'inventario',
          'clientes',
          'productos'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✅ Tipos personalizados creados');

    // Crear tabla profiles
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        nombre TEXT NOT NULL,
        apellido TEXT,
        rol user_role NOT NULL DEFAULT 'vendedor',
        telefono TEXT,
        direccion TEXT,
        empresa TEXT,
        email_verificado BOOLEAN DEFAULT FALSE,
        telefono_verificado BOOLEAN DEFAULT FALSE,
        foto_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla profiles creada');

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
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla empresa_config creada');

    // Crear tabla categorias
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.categorias (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre TEXT NOT NULL,
        descripcion TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla categorias creada');

    // Crear tabla proveedores
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.proveedores (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre TEXT NOT NULL,
        contacto TEXT,
        telefono TEXT,
        email TEXT,
        direccion TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla proveedores creada');

    // Crear tabla clientes
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.clientes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre TEXT NOT NULL,
        contacto TEXT,
        telefono TEXT,
        email TEXT,
        direccion TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla clientes creada');

    // Crear tabla productos
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.productos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre TEXT NOT NULL,
        descripcion TEXT,
        codigo_barras TEXT UNIQUE,
        precio DECIMAL(10,2) NOT NULL,
        costo DECIMAL(10,2),
        categoria_id UUID,
        proveedor_id UUID,
        stock_minimo INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla productos creada');

    // Crear tabla ventas
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.ventas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        cliente_id UUID,
        vendedor_id UUID,
        total DECIMAL(10,2) NOT NULL,
        estado venta_estado DEFAULT 'pendiente',
        fecha_venta TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla ventas creada');

    // Crear tabla venta_items
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.venta_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        venta_id UUID NOT NULL,
        producto_id UUID NOT NULL,
        cantidad INTEGER NOT NULL,
        precio_unitario DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla venta_items creada');

    // Crear tabla inventario
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.inventario (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        producto_id UUID NOT NULL,
        movimiento inventario_movimiento NOT NULL,
        cantidad INTEGER NOT NULL,
        motivo TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla inventario creada');

    // Crear tabla configuracion
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.configuracion (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        clave TEXT UNIQUE NOT NULL,
        valor TEXT NOT NULL,
        descripcion TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla configuracion creada');

    // Crear tabla reportes
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.reportes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tipo reporte_tipo NOT NULL,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        parametros JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla reportes creada');

    // Crear tabla auditoria
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.auditoria (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tabla TEXT NOT NULL,
        accion TEXT NOT NULL,
        usuario_id UUID,
        datos_anteriores JSONB,
        datos_nuevos JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla auditoria creada');

    // Insertar datos de Qualipharm
    console.log('🌱 Insertando datos de Qualipharm...');
    
    // Configuración de empresa
    await client.query(`
      INSERT INTO public.empresa_config (nombre, logo_url, direccion, telefono, email, ruc) VALUES
      ('Qualipharm Laboratorio Farmacéutico', '/logo-qualipharm.png', 'Av. 6 de Diciembre N37-140 y Alpallana, Quito, Ecuador', '+593 2 255 1234', 'info@qualipharm.com.ec', '1791234567001')
      ON CONFLICT DO NOTHING;
    `);

    // Categorías farmacéuticas
    await client.query(`
      INSERT INTO public.categorias (nombre, descripcion) VALUES
      ('Antibióticos', 'Medicamentos antibióticos de amplio y específico espectro'),
      ('Analgésicos', 'Medicamentos para el alivio del dolor'),
      ('Antiinflamatorios', 'Medicamentos antiinflamatorios no esteroideos'),
      ('Antihistamínicos', 'Medicamentos para alergias y reacciones alérgicas'),
      ('Cardiovasculares', 'Medicamentos para el sistema cardiovascular'),
      ('Digestivos', 'Medicamentos para el sistema digestivo'),
      ('Respiratorios', 'Medicamentos para el sistema respiratorio'),
      ('Dermatológicos', 'Medicamentos para afecciones de la piel'),
      ('Oftalmológicos', 'Medicamentos para afecciones oculares'),
      ('Suplementos', 'Vitaminas y suplementos nutricionales'),
      ('Equipos Médicos', 'Equipos y dispositivos médicos'),
      ('Insumos Médicos', 'Insumos y material médico desechable')
      ON CONFLICT DO NOTHING;
    `);

    // Proveedores farmacéuticos
    await client.query(`
      INSERT INTO public.proveedores (nombre, contacto, telefono, email, direccion) VALUES
      ('Pfizer Ecuador S.A.', 'Dr. Carlos Mendoza', '+593 2 234 5678', 'ventas@pfizer.ec', 'Av. Amazonas N35-123, Quito'),
      ('Roche Ecuador S.A.', 'Lic. María González', '+593 2 345 6789', 'contacto@roche.ec', 'Av. 6 de Diciembre N45-234, Quito'),
      ('Novartis Ecuador S.A.', 'Dr. Roberto Silva', '+593 2 456 7890', 'info@novartis.ec', 'Av. Colón N56-345, Quito'),
      ('Bayer Ecuador S.A.', 'Lic. Ana Torres', '+593 2 567 8901', 'ventas@bayer.ec', 'Av. Amazonas N67-456, Quito'),
      ('GSK Ecuador S.A.', 'Dr. Luis Herrera', '+593 2 678 9012', 'contacto@gsk.ec', 'Av. 6 de Diciembre N78-567, Quito'),
      ('Sanofi Ecuador S.A.', 'Lic. Carmen Ruiz', '+593 2 789 0123', 'info@sanofi.ec', 'Av. Colón N89-678, Quito'),
      ('Merck Ecuador S.A.', 'Dr. Pedro Vargas', '+593 2 890 1234', 'ventas@merck.ec', 'Av. Amazonas N90-789, Quito'),
      ('Abbott Ecuador S.A.', 'Lic. Sofía Morales', '+593 2 901 2345', 'contacto@abbott.ec', 'Av. 6 de Diciembre N01-890, Quito')
      ON CONFLICT DO NOTHING;
    `);

    // Clientes (farmacias y hospitales)
    await client.query(`
      INSERT INTO public.clientes (nombre, contacto, telefono, email, direccion) VALUES
      ('Farmacia San Rafael', 'Dr. Juan Pérez', '+593 2 111 1111', 'ventas@farmaciasanrafael.ec', 'Av. Amazonas N12-345, Quito'),
      ('Hospital Metropolitano', 'Lic. María López', '+593 2 222 2222', 'compras@hospitalmetro.ec', 'Av. 6 de Diciembre N23-456, Quito'),
      ('Farmacia Cruz Verde', 'Dr. Carlos Ruiz', '+593 2 333 3333', 'gerencia@cruzverde.ec', 'Av. Colón N34-567, Quito'),
      ('Clínica Pichincha', 'Lic. Ana García', '+593 2 444 4444', 'compras@clinicapichincha.ec', 'Av. Amazonas N45-678, Quito'),
      ('Farmacia Sana Sana', 'Dr. Luis Torres', '+593 2 555 5555', 'ventas@sanasanafarmacia.ec', 'Av. 6 de Diciembre N56-789, Quito'),
      ('Hospital de los Valles', 'Lic. Carmen Silva', '+593 2 666 6666', 'compras@hospitalvalles.ec', 'Av. Colón N67-890, Quito'),
      ('Farmacia del Pueblo', 'Dr. Pedro Herrera', '+593 2 777 7777', 'gerencia@farmaciadelpueblo.ec', 'Av. Amazonas N78-901, Quito'),
      ('Clínica Internacional', 'Lic. Sofía Mendoza', '+593 2 888 8888', 'compras@clinicainternacional.ec', 'Av. 6 de Diciembre N89-012, Quito')
      ON CONFLICT DO NOTHING;
    `);

    // Productos farmacéuticos con códigos de barras
    await client.query(`
      INSERT INTO public.productos (nombre, descripcion, codigo_barras, precio, costo, stock_minimo) VALUES
      ('Amoxicilina 500mg', 'Antibiótico de amplio espectro', '1234567890123', 2.50, 1.80, 100),
      ('Ibuprofeno 400mg', 'Antiinflamatorio no esteroideo', '1234567890124', 1.20, 0.85, 200),
      ('Paracetamol 500mg', 'Analgésico y antipirético', '1234567890125', 0.80, 0.55, 300),
      ('Loratadina 10mg', 'Antihistamínico', '1234567890126', 1.50, 1.10, 150),
      ('Omeprazol 20mg', 'Inhibidor de bomba de protones', '1234567890127', 2.20, 1.60, 120),
      ('Losartán 50mg', 'Antihipertensivo', '1234567890128', 3.50, 2.50, 80),
      ('Metformina 500mg', 'Antidiabético oral', '1234567890129', 1.80, 1.30, 100),
      ('Atorvastatina 20mg', 'Hipolipemiante', '1234567890130', 4.20, 3.00, 60),
      ('Salbutamol Inhalador', 'Broncodilatador', '1234567890131', 8.50, 6.20, 50),
      ('Prednisolona 5mg', 'Corticoide', '1234567890132', 2.80, 2.00, 90),
      ('Fluconazol 150mg', 'Antifúngico', '1234567890133', 5.50, 4.00, 40),
      ('Ciprofloxacina 500mg', 'Antibiótico fluoroquinolona', '1234567890134', 3.20, 2.30, 70),
      ('Diclofenaco 50mg', 'Antiinflamatorio', '1234567890135', 1.40, 1.00, 180),
      ('Ranitidina 150mg', 'Antagonista H2', '1234567890136', 1.60, 1.15, 110),
      ('Furosemida 40mg', 'Diurético de asa', '1234567890137', 0.90, 0.65, 130),
      ('Warfarina 5mg', 'Anticoagulante', '1234567890138', 2.10, 1.50, 30),
      ('Insulina Glargina', 'Antidiabético inyectable', '1234567890139', 25.00, 18.00, 20),
      ('Aspirina 100mg', 'Antiagregante plaquetario', '1234567890140', 0.60, 0.40, 250),
      ('Vitamina D3 1000UI', 'Suplemento vitamínico', '1234567890141', 3.80, 2.70, 80),
      ('Calcio 600mg', 'Suplemento mineral', '1234567890142', 2.30, 1.65, 120),
      ('Termómetro Digital', 'Equipo médico', '1234567890143', 15.00, 10.50, 25),
      ('Tensiómetro Digital', 'Equipo médico', '1234567890144', 45.00, 32.00, 15),
      ('Jeringas 5ml', 'Insumo médico', '1234567890145', 0.25, 0.18, 500),
      ('Guantes Nitrilo', 'Insumo médico', '1234567890146', 0.15, 0.10, 1000)
      ON CONFLICT DO NOTHING;
    `);

    // Configuraciones del sistema
    await client.query(`
      INSERT INTO public.configuracion (clave, valor, descripcion) VALUES
      ('empresa_nombre', 'Qualipharm Laboratorio Farmacéutico', 'Nombre de la empresa'),
      ('empresa_ruc', '1791234567001', 'RUC de la empresa'),
      ('empresa_direccion', 'Av. 6 de Diciembre N37-140 y Alpallana, Quito, Ecuador', 'Dirección de la empresa'),
      ('empresa_telefono', '+593 2 255 1234', 'Teléfono de la empresa'),
      ('empresa_email', 'info@qualipharm.com.ec', 'Email de la empresa'),
      ('moneda', 'USD', 'Moneda principal'),
      ('impuesto_iva', '12', 'Porcentaje de IVA'),
      ('stock_minimo_global', '50', 'Stock mínimo global'),
      ('dias_vencimiento_alerta', '30', 'Días de alerta para vencimiento'),
      ('tipo_facturacion', 'electronica', 'Tipo de facturación'),
      ('backup_automatico', 'true', 'Backup automático habilitado'),
      ('notificaciones_email', 'true', 'Notificaciones por email habilitadas'),
      ('sesion_timeout', '3600', 'Timeout de sesión en segundos'),
      ('password_min_length', '8', 'Longitud mínima de contraseña'),
      ('max_intentos_login', '3', 'Máximo intentos de login'),
      ('auditoria_habilitada', 'true', 'Auditoría habilitada'),
      ('version_sistema', '1.0.0', 'Versión del sistema'),
      ('fecha_instalacion', '2025-01-01', 'Fecha de instalación'),
      ('licencia_valida', 'true', 'Licencia válida'),
      ('modo_mantenimiento', 'false', 'Modo mantenimiento')
      ON CONFLICT DO NOTHING;
    `);

    console.log('✅ Base de datos configurada exitosamente');
    console.log('📊 Datos de Qualipharm insertados:');
    console.log('   - 1 configuración de empresa');
    console.log('   - 12 categorías farmacéuticas');
    console.log('   - 8 proveedores farmacéuticos');
    console.log('   - 8 clientes (farmacias y hospitales)');
    console.log('   - 24 productos farmacéuticos con códigos de barras');
    console.log('   - 20 configuraciones del sistema');
    
  } catch (error) {
    console.error('❌ Error configurando base de datos:', error);
  } finally {
    await client.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
