const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridos');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUsers() {
  console.log('🔐 Creando usuarios...');
  
  const users = [
    {
      email: 'celag3@gmail.com',
      password: 'Cel@g123',
      user_metadata: { nombre: 'Celso Aguirre' },
      role: 'super_admin'
    },
    {
      email: 'admin@qp.ec',
      password: 'admin123',
      user_metadata: { nombre: 'Administrador' },
      role: 'administrador'
    },
    {
      email: 'ventas@qp.ec',
      password: 'ventas123',
      user_metadata: { nombre: 'Usuario Ventas' },
      role: 'vendedor'
    },
    {
      email: 'invent@qp.ec',
      password: 'invent123',
      user_metadata: { nombre: 'Usuario Inventario' },
      role: 'inventario'
    },
    {
      email: 'contab@qp.ec',
      password: 'contab123',
      user_metadata: { nombre: 'Usuario Contable' },
      role: 'contable'
    },
    {
      email: 'elipaz31@gmail.com',
      password: 'client123',
      user_metadata: { nombre: 'Eli Paz' },
      role: 'cliente'
    }
  ];

  for (const user of users) {
    try {
      // Crear usuario en Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        user_metadata: user.user_metadata,
        email_confirm: true
      });

      if (authError) {
        console.error(`Error creando usuario ${user.email}:`, authError.message);
        continue;
      }

      // Actualizar perfil con rol
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          rol: user.role,
          email_verified: true 
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error(`Error actualizando perfil para ${user.email}:`, profileError.message);
      } else {
        console.log(`✅ Usuario creado: ${user.email} (${user.role})`);
      }
    } catch (error) {
      console.error(`Error procesando usuario ${user.email}:`, error.message);
    }
  }
}

async function createCategories() {
  console.log('📂 Creando categorías...');
  
  const categories = [
    { nombre: 'Analgésicos', descripcion: 'Medicamentos para el dolor' },
    { nombre: 'Antiinflamatorios', descripcion: 'Medicamentos antiinflamatorios' },
    { nombre: 'Antibióticos', descripcion: 'Medicamentos antibióticos' },
    { nombre: 'Vitaminas', descripcion: 'Suplementos vitamínicos' },
    { nombre: 'Dermatológicos', descripcion: 'Productos para la piel' },
    { nombre: 'Oftalmológicos', descripcion: 'Productos para los ojos' },
    { nombre: 'Cardiovasculares', descripcion: 'Medicamentos para el corazón' },
    { nombre: 'Respiratorios', descripcion: 'Medicamentos para el sistema respiratorio' },
    { nombre: 'Digestivos', descripcion: 'Medicamentos para el sistema digestivo' },
    { nombre: 'Hormonales', descripcion: 'Medicamentos hormonales' },
    { nombre: 'Oncológicos', descripcion: 'Medicamentos para el cáncer' },
    { nombre: 'Neurológicos', descripcion: 'Medicamentos para el sistema nervioso' },
    { nombre: 'Inmunológicos', descripcion: 'Medicamentos para el sistema inmune' },
    { nombre: 'Ginecológicos', descripcion: 'Medicamentos para la salud femenina' },
    { nombre: 'Pediátricos', descripcion: 'Medicamentos para niños' }
  ];

  for (const category of categories) {
    try {
      const { error } = await supabase
        .from('categorias')
        .insert(category);

      if (error) {
        console.error(`Error creando categoría ${category.nombre}:`, error.message);
      } else {
        console.log(`✅ Categoría creada: ${category.nombre}`);
      }
    } catch (error) {
      console.error(`Error procesando categoría ${category.nombre}:`, error.message);
    }
  }
}

async function createSuppliers() {
  console.log('🏢 Creando proveedores...');
  
  const suppliers = [
    { nombre: 'Laboratorio Roche', ruc: '1791234567001', direccion: 'Quito, Ecuador', telefono: '02-2345678', email: 'contacto@roche.ec' },
    { nombre: 'Pfizer Ecuador', ruc: '1791234567002', direccion: 'Guayaquil, Ecuador', telefono: '04-3456789', email: 'info@pfizer.ec' },
    { nombre: 'Novartis Ecuador', ruc: '1791234567003', direccion: 'Cuenca, Ecuador', telefono: '07-4567890', email: 'ventas@novartis.ec' },
    { nombre: 'Merck Ecuador', ruc: '1791234567004', direccion: 'Manta, Ecuador', telefono: '05-5678901', email: 'contacto@merck.ec' },
    { nombre: 'GSK Ecuador', ruc: '1791234567005', direccion: 'Portoviejo, Ecuador', telefono: '05-6789012', email: 'info@gsk.ec' },
    { nombre: 'AstraZeneca Ecuador', ruc: '1791234567006', direccion: 'Santo Domingo, Ecuador', telefono: '02-7890123', email: 'ventas@astrazeneca.ec' },
    { nombre: 'Sanofi Ecuador', ruc: '1791234567007', direccion: 'Machala, Ecuador', telefono: '07-8901234', email: 'contacto@sanofi.ec' },
    { nombre: 'Bayer Ecuador', ruc: '1791234567008', direccion: 'Esmeraldas, Ecuador', telefono: '06-9012345', email: 'info@bayer.ec' },
    { nombre: 'Johnson & Johnson Ecuador', ruc: '1791234567009', direccion: 'Ibarra, Ecuador', telefono: '06-0123456', email: 'ventas@jnj.ec' },
    { nombre: 'Eli Lilly Ecuador', ruc: '1791234567010', direccion: 'Loja, Ecuador', telefono: '07-1234567', email: 'contacto@lilly.ec' },
    { nombre: 'Bristol Myers Squibb Ecuador', ruc: '1791234567011', direccion: 'Tulcán, Ecuador', telefono: '06-2345678', email: 'info@bms.ec' },
    { nombre: 'Abbott Ecuador', ruc: '1791234567012', direccion: 'Ambato, Ecuador', telefono: '03-3456789', email: 'ventas@abbott.ec' },
    { nombre: 'Takeda Ecuador', ruc: '1791234567013', direccion: 'Riobamba, Ecuador', telefono: '03-4567890', email: 'contacto@takeda.ec' },
    { nombre: 'Amgen Ecuador', ruc: '1791234567014', direccion: 'Latacunga, Ecuador', telefono: '03-5678901', email: 'info@amgen.ec' },
    { nombre: 'Biogen Ecuador', ruc: '1791234567015', direccion: 'Babahoyo, Ecuador', telefono: '05-6789012', email: 'ventas@biogen.ec' },
    { nombre: 'Regeneron Ecuador', ruc: '1791234567016', direccion: 'Quevedo, Ecuador', telefono: '05-7890123', email: 'contacto@regeneron.ec' },
    { nombre: 'Gilead Ecuador', ruc: '1791234567017', direccion: 'Milagro, Ecuador', telefono: '04-8901234', email: 'info@gilead.ec' },
    { nombre: 'Vertex Ecuador', ruc: '1791234567018', direccion: 'Daule, Ecuador', telefono: '04-9012345', email: 'ventas@vertex.ec' },
    { nombre: 'Moderna Ecuador', ruc: '1791234567019', direccion: 'Nobol, Ecuador', telefono: '04-0123456', email: 'contacto@moderna.ec' },
    { nombre: 'BioNTech Ecuador', ruc: '1791234567020', direccion: 'Salinas, Ecuador', telefono: '04-1234567', email: 'info@biontech.ec' }
  ];

  for (const supplier of suppliers) {
    try {
      const { error } = await supabase
        .from('proveedores')
        .insert(supplier);

      if (error) {
        console.error(`Error creando proveedor ${supplier.nombre}:`, error.message);
      } else {
        console.log(`✅ Proveedor creado: ${supplier.nombre}`);
      }
    } catch (error) {
      console.error(`Error procesando proveedor ${supplier.nombre}:`, error.message);
    }
  }
}

async function createProducts() {
  console.log('💊 Creando productos Qualipharm...');
  
  // Obtener categorías para asignar productos
  const { data: categories } = await supabase.from('categorias').select('id, nombre');
  const { data: suppliers } = await supabase.from('proveedores').select('id');
  
  if (!categories || !suppliers) {
    console.error('No se pudieron obtener categorías o proveedores');
    return;
  }

  const products = [
    // Analgésicos
    { nombre: 'Paracetamol Qualipharm 500mg', sku: 'QP-PAR-500', barcode: '7701234567890', categoria: 'Analgésicos', precio: 2.50, stock_minimo: 100 },
    { nombre: 'Ibuprofeno Qualipharm 400mg', sku: 'QP-IBU-400', barcode: '7701234567891', categoria: 'Analgésicos', precio: 3.20, stock_minimo: 80 },
    { nombre: 'Aspirina Qualipharm 100mg', sku: 'QP-ASP-100', barcode: '7701234567892', categoria: 'Analgésicos', precio: 1.80, stock_minimo: 120 },
    { nombre: 'Diclofenaco Qualipharm 50mg', sku: 'QP-DIC-50', barcode: '7701234567893', categoria: 'Analgésicos', precio: 4.50, stock_minimo: 60 },
    { nombre: 'Ketorolaco Qualipharm 10mg', sku: 'QP-KET-10', barcode: '7701234567894', categoria: 'Analgésicos', precio: 6.80, stock_minimo: 40 },
    
    // Antiinflamatorios
    { nombre: 'Naproxeno Qualipharm 250mg', sku: 'QP-NAP-250', barcode: '7701234567895', categoria: 'Antiinflamatorios', precio: 3.90, stock_minimo: 70 },
    { nombre: 'Celecoxib Qualipharm 200mg', sku: 'QP-CEL-200', barcode: '7701234567896', categoria: 'Antiinflamatorios', precio: 8.50, stock_minimo: 30 },
    { nombre: 'Meloxicam Qualipharm 15mg', sku: 'QP-MEL-15', barcode: '7701234567897', categoria: 'Antiinflamatorios', precio: 5.20, stock_minimo: 50 },
    
    // Antibióticos
    { nombre: 'Amoxicilina Qualipharm 500mg', sku: 'QP-AMO-500', barcode: '7701234567898', categoria: 'Antibióticos', precio: 12.80, stock_minimo: 40 },
    { nombre: 'Azitromicina Qualipharm 250mg', sku: 'QP-AZI-250', barcode: '7701234567899', categoria: 'Antibióticos', precio: 15.60, stock_minimo: 35 },
    { nombre: 'Ciprofloxacino Qualipharm 500mg', sku: 'QP-CIP-500', barcode: '7701234567900', categoria: 'Antibióticos', precio: 18.90, stock_minimo: 25 },
    
    // Vitaminas
    { nombre: 'Vitamina C Qualipharm 1000mg', sku: 'QP-VITC-1000', barcode: '7701234567901', categoria: 'Vitaminas', precio: 4.20, stock_minimo: 90 },
    { nombre: 'Vitamina D Qualipharm 1000UI', sku: 'QP-VITD-1000', barcode: '7701234567902', categoria: 'Vitaminas', precio: 6.80, stock_minimo: 70 },
    { nombre: 'Vitamina B12 Qualipharm 1000mcg', sku: 'QP-VITB12-1000', barcode: '7701234567903', categoria: 'Vitaminas', precio: 8.50, stock_minimo: 60 },
    { nombre: 'Multivitamínico Qualipharm', sku: 'QP-MULTI', barcode: '7701234567904', categoria: 'Vitaminas', precio: 12.90, stock_minimo: 50 },
    
    // Dermatológicos
    { nombre: 'Hidrocortisona Qualipharm 1%', sku: 'QP-HID-1', barcode: '7701234567905', categoria: 'Dermatológicos', precio: 7.20, stock_minimo: 45 },
    { nombre: 'Betametasona Qualipharm 0.1%', sku: 'QP-BET-01', barcode: '7701234567906', categoria: 'Dermatológicos', precio: 9.80, stock_minimo: 35 },
    { nombre: 'Clotrimazol Qualipharm 1%', sku: 'QP-CLO-1', barcode: '7701234567907', categoria: 'Dermatológicos', precio: 5.60, stock_minimo: 55 },
    
    // Oftalmológicos
    { nombre: 'Tobramicina Qualipharm 0.3%', sku: 'QP-TOB-03', barcode: '7701234567908', categoria: 'Oftalmológicos', precio: 14.20, stock_minimo: 30 },
    { nombre: 'Ciprofloxacino Oftálmico Qualipharm', sku: 'QP-CIP-OPT', barcode: '7701234567909', categoria: 'Oftalmológicos', precio: 16.80, stock_minimo: 25 },
    
    // Cardiovasculares
    { nombre: 'Atenolol Qualipharm 50mg', sku: 'QP-ATE-50', barcode: '7701234567910', categoria: 'Cardiovasculares', precio: 11.50, stock_minimo: 40 },
    { nombre: 'Lisinopril Qualipharm 10mg', sku: 'QP-LIS-10', barcode: '7701234567911', categoria: 'Cardiovasculares', precio: 13.80, stock_minimo: 35 },
    { nombre: 'Amlodipino Qualipharm 5mg', sku: 'QP-AML-5', barcode: '7701234567912', categoria: 'Cardiovasculares', precio: 9.60, stock_minimo: 45 },
    
    // Respiratorios
    { nombre: 'Salbutamol Qualipharm 2mg', sku: 'QP-SAL-2', barcode: '7701234567913', categoria: 'Respiratorios', precio: 8.90, stock_minimo: 50 },
    { nombre: 'Budesonida Qualipharm 200mcg', sku: 'QP-BUD-200', barcode: '7701234567914', categoria: 'Respiratorios', precio: 22.40, stock_minimo: 25 },
    
    // Digestivos
    { nombre: 'Omeprazol Qualipharm 20mg', sku: 'QP-OME-20', barcode: '7701234567915', categoria: 'Digestivos', precio: 6.80, stock_minimo: 70 },
    { nombre: 'Ranitidina Qualipharm 150mg', sku: 'QP-RAN-150', barcode: '7701234567916', categoria: 'Digestivos', precio: 4.20, stock_minimo: 80 },
    { nombre: 'Lansoprazol Qualipharm 30mg', sku: 'QP-LAN-30', barcode: '7701234567917', categoria: 'Digestivos', precio: 8.90, stock_minimo: 55 },
    
    // Hormonales
    { nombre: 'Levotiroxina Qualipharm 50mcg', sku: 'QP-LEV-50', barcode: '7701234567918', categoria: 'Hormonales', precio: 15.60, stock_minimo: 30 },
    { nombre: 'Metformina Qualipharm 500mg', sku: 'QP-MET-500', barcode: '7701234567919', categoria: 'Hormonales', precio: 7.80, stock_minimo: 65 },
    { nombre: 'Glibenclamida Qualipharm 5mg', sku: 'QP-GLI-5', barcode: '7701234567920', categoria: 'Hormonales', precio: 5.40, stock_minimo: 75 }
  ];

  for (const product of products) {
    try {
      const categoria = categories.find(c => c.nombre === product.categoria);
      if (!categoria) {
        console.error(`Categoría no encontrada: ${product.categoria}`);
        continue;
      }

      const { error } = await supabase
        .from('productos')
        .insert({
          nombre: product.nombre,
          sku: product.sku,
          barcode: product.barcode,
          categoria_id: categoria.id,
          precio: product.precio,
          stock_minimo: product.stock_minimo,
          marca: 'Qualipharm'
        });

      if (error) {
        console.error(`Error creando producto ${product.nombre}:`, error.message);
      } else {
        console.log(`✅ Producto creado: ${product.nombre}`);
      }
    } catch (error) {
      console.error(`Error procesando producto ${product.nombre}:`, error.message);
    }
  }
}

async function createPermissions() {
  console.log('🔐 Creando permisos...');
  
  const modules = [
    'productos', 'lotes', 'proveedores', 'compras', 'movimientos_stock',
    'clientes', 'carritos', 'ordenes', 'pagos', 'envios',
    'auditoria', 'permisos', 'empresa_config', 'reportes', 'dashboard'
  ];

  const roles = ['super_admin', 'administrador', 'vendedor', 'inventario', 'contable', 'cliente'];

  for (const role of roles) {
    for (const module of modules) {
      try {
        let permissions = {
          puede_leer: false,
          puede_crear: false,
          puede_editar: false,
          puede_borrar: false
        };

        // Super admin tiene todos los permisos
        if (role === 'super_admin') {
          permissions = {
            puede_leer: true,
            puede_crear: true,
            puede_editar: true,
            puede_borrar: true
          };
        }
        // Administrador tiene todos los permisos excepto empresa_config
        else if (role === 'administrador' && module !== 'empresa_config') {
          permissions = {
            puede_leer: true,
            puede_crear: true,
            puede_editar: true,
            puede_borrar: true
          };
        }
        // Vendedor puede leer productos y gestionar órdenes
        else if (role === 'vendedor' && ['productos', 'ordenes', 'clientes', 'reportes', 'dashboard'].includes(module)) {
          permissions = {
            puede_leer: true,
            puede_crear: ['ordenes', 'clientes'].includes(module),
            puede_editar: ['ordenes', 'clientes'].includes(module),
            puede_borrar: false
          };
        }
        // Inventario puede gestionar productos, lotes, compras
        else if (role === 'inventario' && ['productos', 'lotes', 'proveedores', 'compras', 'movimientos_stock', 'reportes', 'dashboard'].includes(module)) {
          permissions = {
            puede_leer: true,
            puede_crear: true,
            puede_editar: true,
            puede_borrar: false
          };
        }
        // Contable puede leer órdenes y gestionar pagos
        else if (role === 'contable' && ['ordenes', 'pagos', 'reportes', 'dashboard'].includes(module)) {
          permissions = {
            puede_leer: true,
            puede_crear: ['pagos'].includes(module),
            puede_editar: ['pagos'].includes(module),
            puede_borrar: false
          };
        }
        // Cliente solo puede leer productos y gestionar su carrito/órdenes
        else if (role === 'cliente' && ['productos', 'carritos', 'ordenes'].includes(module)) {
          permissions = {
            puede_leer: true,
            puede_crear: ['carritos', 'ordenes'].includes(module),
            puede_editar: ['carritos'].includes(module),
            puede_borrar: false
          };
        }

        const { error } = await supabase
          .from('permisos')
          .insert({
            rol: role,
            modulo: module,
            ...permissions
          });

        if (error) {
          console.error(`Error creando permiso ${role}-${module}:`, error.message);
        }
      } catch (error) {
        console.error(`Error procesando permiso ${role}-${module}:`, error.message);
      }
    }
  }
  
  console.log('✅ Permisos creados');
}

async function createCompanyConfig() {
  console.log('🏢 Creando configuración de empresa...');
  
  try {
    const { error } = await supabase
      .from('empresa_config')
      .insert({
        nombre_comercial: 'Qualipharm Laboratorio Farmacéutico',
        ruc: '1791234567001',
        direccion: 'Av. Amazonas N45-123, Quito, Ecuador',
        telefonos: ['02-2345678', '02-2345679'],
        politicas: {
          envio_gratis_desde: 50,
          tiempo_entrega: '2-3 días hábiles',
          politica_devolucion: '30 días',
          garantia: 'Hasta vencimiento'
        }
      });

    if (error) {
      console.error('Error creando configuración de empresa:', error.message);
    } else {
      console.log('✅ Configuración de empresa creada');
    }
  } catch (error) {
    console.error('Error procesando configuración de empresa:', error.message);
  }
}

async function main() {
  console.log('🚀 Iniciando seed de la base de datos...\n');

  try {
    await createUsers();
    console.log('');
    
    await createCategories();
    console.log('');
    
    await createSuppliers();
    console.log('');
    
    await createProducts();
    console.log('');
    
    await createPermissions();
    console.log('');
    
    await createCompanyConfig();
    console.log('');

    console.log('🎉 Seed completado exitosamente!');
    console.log('\n📋 Resumen:');
    console.log('- 6 usuarios creados con diferentes roles');
    console.log('- 15 categorías de productos');
    console.log('- 20 proveedores');
    console.log('- 30 productos Qualipharm');
    console.log('- Matriz de permisos completa');
    console.log('- Configuración de empresa');
    
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  }
}

main();
