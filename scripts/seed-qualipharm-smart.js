#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🌱 ========================================');
console.log('   POBLANDO BASE DE DATOS QUALIPHARM (INTELIGENTE)');
console.log('   - Solo inserta datos que no existen');
console.log('   - Preserva datos existentes');
console.log('   - No elimina información');
console.log('🌱 ========================================');
console.log('');

async function seedQualipharmSmart() {
  try {
    // 1. Verificar conexión
    console.log('1. Verificando conexión a la base de datos...');
    
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (testError) {
      throw new Error(`Error conectando a la base de datos: ${testError.message}`);
    }

    console.log('   ✅ Conexión establecida');

    // 2. Verificar si ya hay datos
    console.log('');
    console.log('2. Verificando datos existentes...');
    
    const { data: existingData } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (existingData && existingData.length > 0) {
      console.log('   ⚠️ Ya existen datos en la base de datos');
      console.log('   🔍 Verificando qué datos faltan...');
    } else {
      console.log('   📝 Base de datos vacía, insertando datos iniciales...');
    }

    // 3. Insertar configuración de empresa (solo si no existe)
    console.log('');
    console.log('3. Verificando configuración de empresa...');
    
    const { data: empresaExistente } = await supabase
      .from('empresa_config')
      .select('id')
      .limit(1);

    if (!empresaExistente || empresaExistente.length === 0) {
      console.log('   📝 Insertando configuración de empresa...');
      
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
    } else {
      console.log('   ✅ Configuración de empresa ya existe');
    }

    // 4. Insertar configuración del sistema (solo si no existe)
    console.log('');
    console.log('4. Verificando configuración del sistema...');
    
    const { data: configExistente } = await supabase
      .from('configuracion')
      .select('id')
      .limit(1);

    if (!configExistente || configExistente.length === 0) {
      console.log('   📝 Insertando configuración del sistema...');
      
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
    } else {
      console.log('   ✅ Configuración del sistema ya existe');
    }

    // 5. Insertar categorías (solo si no existen)
    console.log('');
    console.log('5. Verificando categorías de productos...');
    
    const { data: categoriasExistentes } = await supabase
      .from('categorias')
      .select('id')
      .limit(1);

    if (!categoriasExistentes || categoriasExistentes.length === 0) {
      console.log('   📝 Insertando categorías...');
      
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
    } else {
      console.log('   ✅ Categorías ya existen');
    }

    // 6. Insertar proveedores (solo si no existen)
    console.log('');
    console.log('6. Verificando proveedores farmacéuticos...');
    
    const { data: proveedoresExistentes } = await supabase
      .from('proveedores')
      .select('id')
      .limit(1);

    if (!proveedoresExistentes || proveedoresExistentes.length === 0) {
      console.log('   📝 Insertando proveedores...');
      
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
    } else {
      console.log('   ✅ Proveedores ya existen');
    }

    // 7. Insertar clientes (solo si no existen)
    console.log('');
    console.log('7. Verificando clientes (farmacias y hospitales)...');
    
    const { data: clientesExistentes } = await supabase
      .from('clientes')
      .select('id')
      .limit(1);

    if (!clientesExistentes || clientesExistentes.length === 0) {
      console.log('   📝 Insertando clientes...');
      
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
    } else {
      console.log('   ✅ Clientes ya existen');
    }

    // 8. Insertar productos (solo si no existen)
    console.log('');
    console.log('8. Verificando productos farmacéuticos...');
    
    const { data: productosExistentes } = await supabase
      .from('productos')
      .select('id')
      .limit(1);

    if (!productosExistentes || productosExistentes.length === 0) {
      console.log('   📝 Insertando productos...');
      
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
    } else {
      console.log('   ✅ Productos ya existen');
    }

    // 9. Verificar/crear usuarios del sistema (solo si no existen)
    console.log('');
    console.log('9. Verificando usuarios del sistema...');
    
    const { data: usuariosExistentes } = await supabase
      .from('profiles')
      .select('email, rol')
      .in('email', ['celag3@gmail.com', 'admin@qualipharm.com.ec', 'vendedor@qualipharm.com.ec']);

    const emailsExistentes = usuariosExistentes?.map(u => u.email) || [];
    
    if (emailsExistentes.length < 3) {
      console.log('   📝 Creando usuarios faltantes...');
      
      const passwordHash = await bcrypt.hash('Ibot1801538719', 12);
      const adminPasswordHash = await bcrypt.hash('admin123456', 12);
      const vendedorPasswordHash = await bcrypt.hash('vendedor123456', 12);

      const usuarios = [];
      
      if (!emailsExistentes.includes('celag3@gmail.com')) {
        usuarios.push({
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
        });
      }
      
      if (!emailsExistentes.includes('admin@qualipharm.com.ec')) {
        usuarios.push({
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
        });
      }
      
      if (!emailsExistentes.includes('vendedor@qualipharm.com.ec')) {
        usuarios.push({
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
        });
      }

      if (usuarios.length > 0) {
        const { error: usuariosError } = await supabase
          .from('profiles')
          .insert(usuarios);

        if (usuariosError) {
          console.log('   ⚠️ Error insertando usuarios:', usuariosError.message);
        } else {
          console.log(`   ✅ ${usuarios.length} usuarios insertados`);
        }
      }
    } else {
      console.log('   ✅ Usuarios del sistema ya existen');
    }

    // 10. Resumen final
    console.log('');
    console.log('🎉 ========================================');
    console.log('   POBLADO INTELIGENTE COMPLETADO');
    console.log('🎉 ========================================');
    console.log('');
    console.log('✅ CARACTERÍSTICAS:');
    console.log('   - Solo inserta datos que no existen');
    console.log('   - Preserva todos los datos existentes');
    console.log('   - No elimina información');
    console.log('   - Verifica antes de insertar');
    console.log('   - Seguro para ejecutar múltiples veces');
    console.log('');
    console.log('🔒 DATOS PROTEGIDOS:');
    console.log('   - Ventas existentes preservadas');
    console.log('   - Inventario actual preservado');
    console.log('   - Usuarios existentes preservados');
    console.log('   - Configuraciones preservadas');
    console.log('');
    console.log('🚀 ¡SISTEMA SEGURO Y OPERATIVO!');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ ========================================');
    console.error('   ERROR EN POBLADO INTELIGENTE');
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
  seedQualipharmSmart();
}

module.exports = { seedQualipharmSmart };
