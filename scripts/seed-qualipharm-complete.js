#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🌱 ========================================');
console.log('   POBLANDO BASE DE DATOS QUALIPHARM');
console.log('🌱 ========================================');
console.log('');

async function seedQualipharmComplete() {
  try {
    // 1. Limpiar datos existentes
    console.log('1. Limpiando datos existentes...');
    
    const tables = [
      'venta_items',
      'ventas', 
      'inventario',
      'productos',
      'categorias',
      'proveedores',
      'clientes',
      'profiles',
      'empresa_config',
      'configuracion',
      'reportes',
      'notificaciones',
      'audit_logs',
      'login_attempts',
      'mfa_sessions'
    ];

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).delete().neq('id', 0);
        if (error) {
          console.log(`   ⚠️ No se pudo limpiar ${table}: ${error.message}`);
        } else {
          console.log(`   ✅ ${table} limpiado`);
        }
      } catch (error) {
        console.log(`   ⚠️ Error limpiando ${table}: ${error.message}`);
      }
    }

    // 2. Insertar configuración de empresa
    console.log('');
    console.log('2. Insertando configuración de empresa...');
    
    const { error: empresaError } = await supabase
      .from('empresa_config')
      .insert([{
        nombre: 'Qualipharm Laboratorio Farmacéutico',
        ruc: '1791234567001',
        direccion: 'Av. 6 de Diciembre N37-140 y Alpallana, Quito, Ecuador',
        telefono: '+593 2 255 1234',
        email: 'info@qualipharm.com.ec',
        logo_url: '/logos/qualipharm-logo.png',
        descripcion: 'Laboratorio farmacéutico especializado en medicamentos de calidad para el mercado ecuatoriano'
      }]);

    if (empresaError) {
      console.log('   ⚠️ Error insertando empresa:', empresaError.message);
    } else {
      console.log('   ✅ Configuración de empresa insertada');
    }

    // 3. Insertar configuración del sistema
    console.log('');
    console.log('3. Insertando configuración del sistema...');
    
    const configuraciones = [
      { clave: 'smtp_host', valor: 'smtp.gmail.com', descripcion: 'Servidor SMTP para envío de emails', tipo: 'string' },
      { clave: 'smtp_port', valor: '587', descripcion: 'Puerto SMTP', tipo: 'number' },
      { clave: 'smtp_user', valor: 'qualipharm@gmail.com', descripcion: 'Usuario SMTP', tipo: 'string' },
      { clave: 'smtp_pass', valor: 'qualipharm123', descripcion: 'Contraseña SMTP', tipo: 'string' },
      { clave: 'sms_api_key', valor: 'twilio_api_key_here', descripcion: 'API Key para envío de SMS', tipo: 'string' },
      { clave: 'sms_phone', valor: '+593987654321', descripcion: 'Número de teléfono para SMS', tipo: 'string' },
      { clave: 'mfa_issuer', valor: 'LogicQP', descripcion: 'Emisor para códigos MFA', tipo: 'string' },
      { clave: 'session_timeout', valor: '3600', descripcion: 'Timeout de sesión en segundos', tipo: 'number' },
      { clave: 'max_login_attempts', valor: '5', descripcion: 'Máximo intentos de login', tipo: 'number' },
      { clave: 'password_min_length', valor: '8', descripcion: 'Longitud mínima de contraseña', tipo: 'number' },
      { clave: 'require_mfa', valor: 'true', descripcion: 'Requerir MFA para usuarios admin', tipo: 'boolean' },
      { clave: 'backup_frequency', valor: 'daily', descripcion: 'Frecuencia de respaldos', tipo: 'string' },
      { clave: 'tax_rate', valor: '12', descripcion: 'Tasa de IVA en porcentaje', tipo: 'number' },
      { clave: 'currency', valor: 'USD', descripcion: 'Moneda del sistema', tipo: 'string' },
      { clave: 'timezone', valor: 'America/Guayaquil', descripcion: 'Zona horaria', tipo: 'string' },
      { clave: 'language', valor: 'es', descripcion: 'Idioma del sistema', tipo: 'string' },
      { clave: 'theme', valor: 'light', descripcion: 'Tema de la interfaz', tipo: 'string' },
      { clave: 'notifications', valor: 'true', descripcion: 'Habilitar notificaciones', tipo: 'boolean' },
      { clave: 'audit_logs', valor: 'true', descripcion: 'Habilitar logs de auditoría', tipo: 'boolean' },
      { clave: 'maintenance_mode', valor: 'false', descripcion: 'Modo de mantenimiento', tipo: 'boolean' }
    ];

    const { error: configError } = await supabase
      .from('configuracion')
      .insert(configuraciones);

    if (configError) {
      console.log('   ⚠️ Error insertando configuración:', configError.message);
    } else {
      console.log('   ✅ Configuración del sistema insertada');
    }

    // 4. Insertar categorías
    console.log('');
    console.log('4. Insertando categorías de productos...');
    
    const categorias = [
      { nombre: 'Antibióticos', descripcion: 'Medicamentos para combatir infecciones bacterianas' },
      { nombre: 'Analgésicos', descripcion: 'Medicamentos para aliviar el dolor' },
      { nombre: 'Antiinflamatorios', descripcion: 'Medicamentos para reducir la inflamación' },
      { nombre: 'Antihistamínicos', descripcion: 'Medicamentos para alergias' },
      { nombre: 'Vitaminas', descripcion: 'Suplementos vitamínicos' },
      { nombre: 'Antibióticos Tópicos', descripcion: 'Antibióticos de aplicación externa' },
      { nombre: 'Antisépticos', descripcion: 'Sustancias para prevenir infecciones' },
      { nombre: 'Expectorantes', descripcion: 'Medicamentos para la tos' },
      { nombre: 'Antipiréticos', descripcion: 'Medicamentos para reducir la fiebre' },
      { nombre: 'Antiespasmódicos', descripcion: 'Medicamentos para cólicos' },
      { nombre: 'Hormonas', descripcion: 'Medicamentos hormonales' },
      { nombre: 'Cardiovasculares', descripcion: 'Medicamentos para el corazón' }
    ];

    const { error: categoriasError } = await supabase
      .from('categorias')
      .insert(categorias);

    if (categoriasError) {
      console.log('   ⚠️ Error insertando categorías:', categoriasError.message);
    } else {
      console.log('   ✅ Categorías insertadas');
    }

    // 5. Insertar proveedores
    console.log('');
    console.log('5. Insertando proveedores farmacéuticos...');
    
    const proveedores = [
      { nombre: 'Pfizer Ecuador', contacto: 'Dr. Carlos Mendoza', telefono: '+593 2 234 5678', email: 'ventas@pfizer.ec', direccion: 'Av. Amazonas N34-451, Quito' },
      { nombre: 'Novartis Ecuador', contacto: 'Lic. María González', telefono: '+593 2 345 6789', email: 'contacto@novartis.ec', direccion: 'Av. 6 de Diciembre N47-142, Quito' },
      { nombre: 'Roche Ecuador', contacto: 'Dr. Luis Herrera', telefono: '+593 2 456 7890', email: 'info@roche.ec', direccion: 'Av. República N25-300, Quito' },
      { nombre: 'Bayer Ecuador', contacto: 'Ing. Ana Torres', telefono: '+593 2 567 8901', email: 'ventas@bayer.ec', direccion: 'Av. Colón N12-456, Quito' },
      { nombre: 'GSK Ecuador', contacto: 'Dr. Roberto Silva', telefono: '+593 2 678 9012', email: 'contacto@gsk.ec', direccion: 'Av. Amazonas N56-789, Quito' },
      { nombre: 'Sanofi Ecuador', contacto: 'Lic. Carmen Ruiz', telefono: '+593 2 789 0123', email: 'info@sanofi.ec', direccion: 'Av. 10 de Agosto N23-456, Quito' },
      { nombre: 'Merck Ecuador', contacto: 'Dr. Pedro Vargas', telefono: '+593 2 890 1234', email: 'ventas@merck.ec', direccion: 'Av. Patria N45-678, Quito' },
      { nombre: 'Johnson & Johnson', contacto: 'Lic. Laura Morales', telefono: '+593 2 901 2345', email: 'contacto@jnj.ec', direccion: 'Av. Amazonas N78-901, Quito' }
    ];

    const { error: proveedoresError } = await supabase
      .from('proveedores')
      .insert(proveedores);

    if (proveedoresError) {
      console.log('   ⚠️ Error insertando proveedores:', proveedoresError.message);
    } else {
      console.log('   ✅ Proveedores insertados');
    }

    // 6. Insertar clientes
    console.log('');
    console.log('6. Insertando clientes (farmacias y hospitales)...');
    
    const clientes = [
      { nombre: 'Farmacia San Rafael', contacto: 'Dr. Rafael Morales', telefono: '+593 2 111 2222', email: 'ventas@farmaciasanrafael.ec', direccion: 'Av. Amazonas N12-345, Quito' },
      { nombre: 'Farmacia del Sol', contacto: 'Lic. Soledad Vega', telefono: '+593 2 222 3333', email: 'info@farmaciadelso.ec', direccion: 'Av. 6 de Diciembre N45-678, Quito' },
      { nombre: 'Hospital Metropolitano', contacto: 'Dr. Carlos Andrade', telefono: '+593 2 333 4444', email: 'compras@hmetro.ec', direccion: 'Av. Mariana de Jesús N34-567, Quito' },
      { nombre: 'Farmacia Cruz Verde', contacto: 'Lic. María Cruz', telefono: '+593 2 444 5555', email: 'ventas@cruzverde.ec', direccion: 'Av. Colón N56-789, Quito' },
      { nombre: 'Hospital Vozandes', contacto: 'Dr. Juan Pérez', telefono: '+593 2 555 6666', email: 'compras@vozandes.ec', direccion: 'Av. 10 de Agosto N67-890, Quito' },
      { nombre: 'Farmacia Sana Sana', contacto: 'Lic. Ana García', telefono: '+593 2 666 7777', email: 'info@sanasana.ec', direccion: 'Av. Patria N78-901, Quito' },
      { nombre: 'Clínica Pichincha', contacto: 'Dr. Luis Pichincha', telefono: '+593 2 777 8888', email: 'compras@clinicapichincha.ec', direccion: 'Av. Amazonas N89-012, Quito' },
      { nombre: 'Farmacia del Pueblo', contacto: 'Lic. Carmen Pueblo', telefono: '+593 2 888 9999', email: 'ventas@farmaciadelpueblo.ec', direccion: 'Av. 6 de Diciembre N90-123, Quito' }
    ];

    const { error: clientesError } = await supabase
      .from('clientes')
      .insert(clientes);

    if (clientesError) {
      console.log('   ⚠️ Error insertando clientes:', clientesError.message);
    } else {
      console.log('   ✅ Clientes insertados');
    }

    // 7. Insertar productos farmacéuticos
    console.log('');
    console.log('7. Insertando productos farmacéuticos...');
    
    const productos = [
      { nombre: 'Amoxicilina 500mg', descripcion: 'Antibiótico de amplio espectro', precio: 2.50, stock: 100, stock_minimo: 20, categoria_id: 1, proveedor_id: 1, codigo_barras: '7891234567890', imagen_url: '/productos/amoxicilina.jpg' },
      { nombre: 'Ibuprofeno 400mg', descripcion: 'Antiinflamatorio y analgésico', precio: 1.80, stock: 150, stock_minimo: 30, categoria_id: 3, proveedor_id: 2, codigo_barras: '7891234567891', imagen_url: '/productos/ibuprofeno.jpg' },
      { nombre: 'Paracetamol 500mg', descripcion: 'Analgésico y antipirético', precio: 1.20, stock: 200, stock_minimo: 40, categoria_id: 2, proveedor_id: 3, codigo_barras: '7891234567892', imagen_url: '/productos/paracetamol.jpg' },
      { nombre: 'Loratadina 10mg', descripcion: 'Antihistamínico', precio: 3.50, stock: 80, stock_minimo: 15, categoria_id: 4, proveedor_id: 4, codigo_barras: '7891234567893', imagen_url: '/productos/loratadina.jpg' },
      { nombre: 'Vitamina C 1000mg', descripcion: 'Suplemento vitamínico', precio: 4.20, stock: 120, stock_minimo: 25, categoria_id: 5, proveedor_id: 5, codigo_barras: '7891234567894', imagen_url: '/productos/vitamina-c.jpg' },
      { nombre: 'Neomicina Tópica', descripcion: 'Antibiótico tópico', precio: 5.80, stock: 60, stock_minimo: 10, categoria_id: 6, proveedor_id: 6, codigo_barras: '7891234567895', imagen_url: '/productos/neomicina.jpg' },
      { nombre: 'Alcohol 70%', descripcion: 'Antiséptico', precio: 2.30, stock: 300, stock_minimo: 50, categoria_id: 7, proveedor_id: 7, codigo_barras: '7891234567896', imagen_url: '/productos/alcohol.jpg' },
      { nombre: 'Jarabe para la Tos', descripcion: 'Expectorante', precio: 3.90, stock: 90, stock_minimo: 20, categoria_id: 8, proveedor_id: 8, codigo_barras: '7891234567897', imagen_url: '/productos/jarabe-tos.jpg' },
      { nombre: 'Aspirina 100mg', descripcion: 'Antipirético y analgésico', precio: 1.50, stock: 180, stock_minimo: 35, categoria_id: 9, proveedor_id: 1, codigo_barras: '7891234567898', imagen_url: '/productos/aspirina.jpg' },
      { nombre: 'Buscopan', descripcion: 'Antiespasmódico', precio: 4.50, stock: 70, stock_minimo: 15, categoria_id: 10, proveedor_id: 2, codigo_barras: '7891234567899', imagen_url: '/productos/buscopan.jpg' },
      { nombre: 'Insulina Regular', descripcion: 'Hormona para diabetes', precio: 15.80, stock: 40, stock_minimo: 8, categoria_id: 11, proveedor_id: 3, codigo_barras: '7891234567900', imagen_url: '/productos/insulina.jpg' },
      { nombre: 'Enalapril 5mg', descripcion: 'Medicamento cardiovascular', precio: 6.20, stock: 85, stock_minimo: 17, categoria_id: 12, proveedor_id: 4, codigo_barras: '7891234567901', imagen_url: '/productos/enalapril.jpg' },
      { nombre: 'Cefalexina 500mg', descripcion: 'Antibiótico', precio: 3.80, stock: 95, stock_minimo: 19, categoria_id: 1, proveedor_id: 5, codigo_barras: '7891234567902', imagen_url: '/productos/cefalexina.jpg' },
      { nombre: 'Diclofenaco 50mg', descripcion: 'Antiinflamatorio', precio: 2.90, stock: 110, stock_minimo: 22, categoria_id: 3, proveedor_id: 6, codigo_barras: '7891234567903', imagen_url: '/productos/diclofenaco.jpg' },
      { nombre: 'Omeprazol 20mg', descripcion: 'Protector gástrico', precio: 4.80, stock: 130, stock_minimo: 26, categoria_id: 2, proveedor_id: 7, codigo_barras: '7891234567904', imagen_url: '/productos/omeprazol.jpg' },
      { nombre: 'Cetirizina 10mg', descripcion: 'Antihistamínico', precio: 3.20, stock: 75, stock_minimo: 15, categoria_id: 4, proveedor_id: 8, codigo_barras: '7891234567905', imagen_url: '/productos/cetirizina.jpg' },
      { nombre: 'Vitamina D3', descripcion: 'Suplemento vitamínico', precio: 5.50, stock: 100, stock_minimo: 20, categoria_id: 5, proveedor_id: 1, codigo_barras: '7891234567906', imagen_url: '/productos/vitamina-d3.jpg' },
      { nombre: 'Mupirocina Tópica', descripcion: 'Antibiótico tópico', precio: 7.20, stock: 50, stock_minimo: 10, categoria_id: 6, proveedor_id: 2, codigo_barras: '7891234567907', imagen_url: '/productos/mupirocina.jpg' },
      { nombre: 'Yodo Povidona', descripcion: 'Antiséptico', precio: 3.40, stock: 140, stock_minimo: 28, categoria_id: 7, proveedor_id: 3, codigo_barras: '7891234567908', imagen_url: '/productos/yodo.jpg' },
      { nombre: 'Dextrometorfano', descripcion: 'Antitusivo', precio: 2.80, stock: 85, stock_minimo: 17, categoria_id: 8, proveedor_id: 4, codigo_barras: '7891234567909', imagen_url: '/productos/dextrometorfano.jpg' },
      { nombre: 'Acetaminofén', descripcion: 'Analgésico', precio: 1.60, stock: 160, stock_minimo: 32, categoria_id: 9, proveedor_id: 5, codigo_barras: '7891234567910', imagen_url: '/productos/acetaminofen.jpg' },
      { nombre: 'Hioscina', descripcion: 'Antiespasmódico', precio: 5.20, stock: 65, stock_minimo: 13, categoria_id: 10, proveedor_id: 6, codigo_barras: '7891234567911', imagen_url: '/productos/hioscina.jpg' },
      { nombre: 'Metformina 500mg', descripcion: 'Medicamento para diabetes', precio: 8.50, stock: 90, stock_minimo: 18, categoria_id: 11, proveedor_id: 7, codigo_barras: '7891234567912', imagen_url: '/productos/metformina.jpg' },
      { nombre: 'Losartán 50mg', descripcion: 'Medicamento cardiovascular', precio: 7.80, stock: 75, stock_minimo: 15, categoria_id: 12, proveedor_id: 8, codigo_barras: '7891234567913', imagen_url: '/productos/losartan.jpg' }
    ];

    const { error: productosError } = await supabase
      .from('productos')
      .insert(productos);

    if (productosError) {
      console.log('   ⚠️ Error insertando productos:', productosError.message);
    } else {
      console.log('   ✅ Productos insertados');
    }

    // 8. Crear usuarios del sistema
    console.log('');
    console.log('8. Creando usuarios del sistema...');
    
    const passwordHash = await bcrypt.hash('Ibot1801538719', 12);
    const adminPasswordHash = await bcrypt.hash('admin123456', 12);
    const vendedorPasswordHash = await bcrypt.hash('vendedor123456', 12);

    const usuarios = [
      {
        email: 'celag3@gmail.com',
        password_hash: passwordHash,
        nombre: 'Carlos',
        apellido: 'Elag',
        telefono: '0998769259',
        direccion: 'Quito, Ecuador',
        empresa: 'Qualipharm Laboratorio Farmacéutico',
        rol: 'super_admin',
        email_verificado: true,
        telefono_verificado: true,
        mfa_enabled: false
      },
      {
        email: 'admin@qualipharm.com.ec',
        password_hash: adminPasswordHash,
        nombre: 'Administrador',
        apellido: 'Sistema',
        telefono: '+593 2 255 1234',
        direccion: 'Av. 6 de Diciembre N37-140 y Alpallana, Quito',
        empresa: 'Qualipharm Laboratorio Farmacéutico',
        rol: 'administrador',
        email_verificado: true,
        telefono_verificado: true,
        mfa_enabled: false
      },
      {
        email: 'vendedor@qualipharm.com.ec',
        password_hash: vendedorPasswordHash,
        nombre: 'Juan',
        apellido: 'Pérez',
        telefono: '+593 2 255 1235',
        direccion: 'Av. 6 de Diciembre N37-140 y Alpallana, Quito',
        empresa: 'Qualipharm Laboratorio Farmacéutico',
        rol: 'vendedor',
        email_verificado: true,
        telefono_verificado: true,
        mfa_enabled: false
      }
    ];

    const { error: usuariosError } = await supabase
      .from('profiles')
      .insert(usuarios);

    if (usuariosError) {
      console.log('   ⚠️ Error insertando usuarios:', usuariosError.message);
    } else {
      console.log('   ✅ Usuarios del sistema creados');
    }

    // 9. Insertar ventas de ejemplo
    console.log('');
    console.log('9. Insertando ventas de ejemplo...');
    
    // Obtener IDs de usuarios y clientes
    const { data: usuariosData } = await supabase.from('profiles').select('id, email');
    const { data: clientesData } = await supabase.from('clientes').select('id');
    
    const vendedorId = usuariosData?.find(u => u.email === 'vendedor@qualipharm.com.ec')?.id;
    const cliente1Id = clientesData?.[0]?.id;
    const cliente2Id = clientesData?.[1]?.id;
    const cliente3Id = clientesData?.[2]?.id;
    const cliente4Id = clientesData?.[3]?.id;

    const ventas = [
      { cliente_id: cliente1Id, usuario_id: vendedorId, total: 15.50, subtotal: 13.84, iva: 1.66, estado: 'confirmada', metodo_pago: 'efectivo' },
      { cliente_id: cliente2Id, usuario_id: vendedorId, total: 28.30, subtotal: 25.27, iva: 3.03, estado: 'confirmada', metodo_pago: 'tarjeta' },
      { cliente_id: cliente3Id, usuario_id: vendedorId, total: 42.80, subtotal: 38.21, iva: 4.59, estado: 'enviada', metodo_pago: 'transferencia' },
      { cliente_id: cliente4Id, usuario_id: vendedorId, total: 19.20, subtotal: 17.14, iva: 2.06, estado: 'pendiente', metodo_pago: 'efectivo' }
    ];

    const { error: ventasError } = await supabase
      .from('ventas')
      .insert(ventas);

    if (ventasError) {
      console.log('   ⚠️ Error insertando ventas:', ventasError.message);
    } else {
      console.log('   ✅ Ventas insertadas');
    }

    // 10. Insertar items de venta
    console.log('');
    console.log('10. Insertando items de venta...');
    
    const { data: ventasData } = await supabase.from('ventas').select('id').order('id');
    const { data: productosData } = await supabase.from('productos').select('id, precio').order('id');

    const ventaItems = [
      { venta_id: ventasData?.[0]?.id, producto_id: productosData?.[0]?.id, cantidad: 2, precio_unitario: 2.50, subtotal: 5.00 },
      { venta_id: ventasData?.[0]?.id, producto_id: productosData?.[1]?.id, cantidad: 3, precio_unitario: 1.80, subtotal: 5.40 },
      { venta_id: ventasData?.[0]?.id, producto_id: productosData?.[2]?.id, cantidad: 4, precio_unitario: 1.20, subtotal: 4.80 },
      { venta_id: ventasData?.[1]?.id, producto_id: productosData?.[3]?.id, cantidad: 1, precio_unitario: 3.50, subtotal: 3.50 },
      { venta_id: ventasData?.[1]?.id, producto_id: productosData?.[4]?.id, cantidad: 2, precio_unitario: 4.20, subtotal: 8.40 },
      { venta_id: ventasData?.[1]?.id, producto_id: productosData?.[5]?.id, cantidad: 1, precio_unitario: 5.80, subtotal: 5.80 },
      { venta_id: ventasData?.[1]?.id, producto_id: productosData?.[6]?.id, cantidad: 2, precio_unitario: 2.30, subtotal: 4.60 },
      { venta_id: ventasData?.[1]?.id, producto_id: productosData?.[7]?.id, cantidad: 1, precio_unitario: 3.90, subtotal: 3.90 },
      { venta_id: ventasData?.[2]?.id, producto_id: productosData?.[8]?.id, cantidad: 3, precio_unitario: 1.50, subtotal: 4.50 },
      { venta_id: ventasData?.[2]?.id, producto_id: productosData?.[9]?.id, cantidad: 2, precio_unitario: 4.50, subtotal: 9.00 },
      { venta_id: ventasData?.[2]?.id, producto_id: productosData?.[10]?.id, cantidad: 1, precio_unitario: 15.80, subtotal: 15.80 },
      { venta_id: ventasData?.[2]?.id, producto_id: productosData?.[11]?.id, cantidad: 2, precio_unitario: 6.20, subtotal: 12.40 },
      { venta_id: ventasData?.[3]?.id, producto_id: productosData?.[12]?.id, cantidad: 1, precio_unitario: 3.80, subtotal: 3.80 },
      { venta_id: ventasData?.[3]?.id, producto_id: productosData?.[13]?.id, cantidad: 2, precio_unitario: 2.90, subtotal: 5.80 },
      { venta_id: ventasData?.[3]?.id, producto_id: productosData?.[14]?.id, cantidad: 1, precio_unitario: 4.80, subtotal: 4.80 },
      { venta_id: ventasData?.[3]?.id, producto_id: productosData?.[15]?.id, cantidad: 1, precio_unitario: 3.20, subtotal: 3.20 }
    ];

    const { error: ventaItemsError } = await supabase
      .from('venta_items')
      .insert(ventaItems);

    if (ventaItemsError) {
      console.log('   ⚠️ Error insertando items de venta:', ventaItemsError.message);
    } else {
      console.log('   ✅ Items de venta insertados');
    }

    // 11. Insertar movimientos de inventario
    console.log('');
    console.log('11. Insertando movimientos de inventario...');
    
    const adminId = usuariosData?.find(u => u.email === 'admin@qualipharm.com.ec')?.id;

    const movimientosInventario = [
      { producto_id: productosData?.[0]?.id, cantidad: 100, tipo_movimiento: 'entrada', motivo: 'Compra inicial de stock', usuario_id: adminId },
      { producto_id: productosData?.[1]?.id, cantidad: 150, tipo_movimiento: 'entrada', motivo: 'Compra inicial de stock', usuario_id: adminId },
      { producto_id: productosData?.[2]?.id, cantidad: 200, tipo_movimiento: 'entrada', motivo: 'Compra inicial de stock', usuario_id: adminId },
      { producto_id: productosData?.[3]?.id, cantidad: 80, tipo_movimiento: 'entrada', motivo: 'Compra inicial de stock', usuario_id: adminId },
      { producto_id: productosData?.[4]?.id, cantidad: 120, tipo_movimiento: 'entrada', motivo: 'Compra inicial de stock', usuario_id: adminId },
      { producto_id: productosData?.[0]?.id, cantidad: -2, tipo_movimiento: 'salida', motivo: 'Venta #1', usuario_id: vendedorId },
      { producto_id: productosData?.[1]?.id, cantidad: -3, tipo_movimiento: 'salida', motivo: 'Venta #1', usuario_id: vendedorId },
      { producto_id: productosData?.[2]?.id, cantidad: -4, tipo_movimiento: 'salida', motivo: 'Venta #1', usuario_id: vendedorId },
      { producto_id: productosData?.[3]?.id, cantidad: -1, tipo_movimiento: 'salida', motivo: 'Venta #2', usuario_id: vendedorId },
      { producto_id: productosData?.[4]?.id, cantidad: -2, tipo_movimiento: 'salida', motivo: 'Venta #2', usuario_id: vendedorId }
    ];

    const { error: inventarioError } = await supabase
      .from('inventario')
      .insert(movimientosInventario);

    if (inventarioError) {
      console.log('   ⚠️ Error insertando movimientos de inventario:', inventarioError.message);
    } else {
      console.log('   ✅ Movimientos de inventario insertados');
    }

    // 12. Insertar reportes de ejemplo
    console.log('');
    console.log('12. Insertando reportes de ejemplo...');
    
    const reportes = [
      { nombre: 'Reporte de Ventas Mensual', tipo: 'ventas', parametros: { mes: 1, año: 2025 }, usuario_id: adminId },
      { nombre: 'Inventario de Productos', tipo: 'inventario', parametros: { categoria: 'todos' }, usuario_id: adminId },
      { nombre: 'Clientes Activos', tipo: 'clientes', parametros: { periodo: 'ultimo_mes' }, usuario_id: adminId },
      { nombre: 'Productos Más Vendidos', tipo: 'productos', parametros: { limite: 10 }, usuario_id: vendedorId }
    ];

    const { error: reportesError } = await supabase
      .from('reportes')
      .insert(reportes);

    if (reportesError) {
      console.log('   ⚠️ Error insertando reportes:', reportesError.message);
    } else {
      console.log('   ✅ Reportes insertados');
    }

    // 13. Insertar notificaciones de ejemplo
    console.log('');
    console.log('13. Insertando notificaciones de ejemplo...');
    
    const notificaciones = [
      { usuario_id: adminId, titulo: 'Sistema Iniciado', mensaje: 'El sistema LogicQP ha sido iniciado correctamente', tipo: 'success' },
      { usuario_id: adminId, titulo: 'Nueva Venta', mensaje: 'Se ha registrado una nueva venta por $15.50', tipo: 'info' },
      { usuario_id: vendedorId, titulo: 'Stock Bajo', mensaje: 'El producto Amoxicilina tiene stock bajo', tipo: 'warning' },
      { usuario_id: vendedorId, titulo: 'Venta Confirmada', mensaje: 'Su venta #1 ha sido confirmada', tipo: 'success' }
    ];

    const { error: notificacionesError } = await supabase
      .from('notificaciones')
      .insert(notificaciones);

    if (notificacionesError) {
      console.log('   ⚠️ Error insertando notificaciones:', notificacionesError.message);
    } else {
      console.log('   ✅ Notificaciones insertadas');
    }

    // 14. Resumen final
    console.log('');
    console.log('🎉 ========================================');
    console.log('   POBLADO COMPLETADO EXITOSAMENTE');
    console.log('🎉 ========================================');
    console.log('');
    console.log('📊 DATOS INSERTADOS:');
    console.log('   ✅ 1 configuración de empresa (Qualipharm)');
    console.log('   ✅ 20 configuraciones del sistema');
    console.log('   ✅ 12 categorías de productos farmacéuticos');
    console.log('   ✅ 8 proveedores farmacéuticos');
    console.log('   ✅ 8 clientes (farmacias y hospitales)');
    console.log('   ✅ 24 productos farmacéuticos con códigos de barras');
    console.log('   ✅ 3 usuarios del sistema (Super-Admin, Admin, Vendedor)');
    console.log('   ✅ 4 ventas de ejemplo');
    console.log('   ✅ 16 items de venta');
    console.log('   ✅ 10 movimientos de inventario');
    console.log('   ✅ 4 reportes de ejemplo');
    console.log('   ✅ 4 notificaciones');
    console.log('');
    console.log('🔑 USUARIOS CREADOS:');
    console.log('   👑 Super-Admin: celag3@gmail.com');
    console.log('   👨‍💼 Admin: admin@qualipharm.com.ec');
    console.log('   👨‍💼 Vendedor: vendedor@qualipharm.com.ec');
    console.log('');
    console.log('🏥 ¡SISTEMA QUALIPHARM LISTO PARA USAR!');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ ========================================');
    console.error('   ERROR POBLANDO BASE DE DATOS');
    console.error('❌ ========================================');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    console.error('💡 SOLUCIONES:');
    console.error('   1. Verifica que Supabase Local esté ejecutándose');
    console.error('   2. Verifica la conexión a la base de datos');
    console.error('   3. Revisa los logs: docker-compose logs');
    console.error('');
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  seedQualipharmComplete();
}

module.exports = { seedQualipharmComplete };
