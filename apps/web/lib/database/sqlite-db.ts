import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Crear directorio de base de datos si no existe
const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'logicqp.db');
const db = new Database(dbPath);

// Habilitar foreign keys
db.pragma('foreign_keys = ON');

// Crear tablas
export function initializeDatabase() {
  console.log('🗄️ Inicializando base de datos SQLite...');

  // Tabla de usuarios/profiles
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      nombre TEXT NOT NULL,
      apellido TEXT,
      telefono TEXT,
      direccion TEXT,
      empresa TEXT,
      rol TEXT NOT NULL DEFAULT 'cliente',
      email_verificado BOOLEAN DEFAULT FALSE,
      telefono_verificado BOOLEAN DEFAULT FALSE,
      mfa_enabled BOOLEAN DEFAULT FALSE,
      mfa_secret TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Tabla de configuración de empresa
  db.exec(`
    CREATE TABLE IF NOT EXISTS empresa_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      ruc TEXT UNIQUE NOT NULL,
      direccion TEXT NOT NULL,
      telefono TEXT NOT NULL,
      email TEXT NOT NULL,
      logo_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Tabla de categorías
  db.exec(`
    CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Tabla de proveedores
  db.exec(`
    CREATE TABLE IF NOT EXISTS proveedores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      contacto TEXT,
      telefono TEXT,
      email TEXT,
      direccion TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Tabla de clientes
  db.exec(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      contacto TEXT,
      telefono TEXT,
      email TEXT,
      direccion TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Tabla de productos
  db.exec(`
    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      precio DECIMAL(10,2) NOT NULL,
      stock INTEGER DEFAULT 0,
      categoria_id INTEGER,
      proveedor_id INTEGER,
      codigo_barras TEXT UNIQUE,
      imagen_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (categoria_id) REFERENCES categorias(id),
      FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
    );
  `);

  // Tabla de ventas
  db.exec(`
    CREATE TABLE IF NOT EXISTS ventas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER,
      usuario_id TEXT,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
      total DECIMAL(10,2) NOT NULL,
      estado TEXT DEFAULT 'pendiente',
      metodo_pago TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id),
      FOREIGN KEY (usuario_id) REFERENCES profiles(id)
    );
  `);

  // Tabla de items de venta
  db.exec(`
    CREATE TABLE IF NOT EXISTS venta_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      venta_id INTEGER NOT NULL,
      producto_id INTEGER NOT NULL,
      cantidad INTEGER NOT NULL,
      precio_unitario DECIMAL(10,2) NOT NULL,
      subtotal DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
      FOREIGN KEY (producto_id) REFERENCES productos(id)
    );
  `);

  // Tabla de inventario
  db.exec(`
    CREATE TABLE IF NOT EXISTS inventario (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      producto_id INTEGER NOT NULL,
      cantidad INTEGER NOT NULL,
      tipo_movimiento TEXT NOT NULL,
      motivo TEXT,
      usuario_id TEXT,
      fecha_movimiento DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (producto_id) REFERENCES productos(id),
      FOREIGN KEY (usuario_id) REFERENCES profiles(id)
    );
  `);

  // Tabla de configuración del sistema
  db.exec(`
    CREATE TABLE IF NOT EXISTS configuracion (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clave TEXT UNIQUE NOT NULL,
      valor TEXT NOT NULL,
      descripcion TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Tabla de reportes
  db.exec(`
    CREATE TABLE IF NOT EXISTS reportes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      tipo TEXT NOT NULL,
      parametros TEXT,
      archivo_url TEXT,
      usuario_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES profiles(id)
    );
  `);

  // Tabla de logs de auditoría
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id TEXT,
      accion TEXT NOT NULL,
      tabla_afectada TEXT,
      registro_id TEXT,
      datos_anteriores TEXT,
      datos_nuevos TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES profiles(id)
    );
  `);

  // Tabla de sesiones MFA
  db.exec(`
    CREATE TABLE IF NOT EXISTS mfa_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      used BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES profiles(id)
    );
  `);

  console.log('✅ Base de datos SQLite inicializada correctamente');
}

// Función para poblar datos iniciales
export function seedDatabase() {
  console.log('🌱 Poblando base de datos con datos de Qualipharm...');

  // Limpiar datos existentes
  db.exec('DELETE FROM venta_items');
  db.exec('DELETE FROM ventas');
  db.exec('DELETE FROM inventario');
  db.exec('DELETE FROM productos');
  db.exec('DELETE FROM categorias');
  db.exec('DELETE FROM proveedores');
  db.exec('DELETE FROM clientes');
  db.exec('DELETE FROM profiles');
  db.exec('DELETE FROM empresa_config');

  // Insertar configuración de empresa
  const insertEmpresa = db.prepare(`
    INSERT INTO empresa_config (nombre, ruc, direccion, telefono, email, logo_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertEmpresa.run(
    'Qualipharm Laboratorio Farmacéutico',
    '1791234567001',
    'Av. 6 de Diciembre N37-140 y Alpallana, Quito, Ecuador',
    '+593 2 255 1234',
    'info@qualipharm.com.ec',
    '/logos/qualipharm-logo.png'
  );

  // Insertar categorías
  const insertCategoria = db.prepare(`
    INSERT INTO categorias (nombre, descripcion)
    VALUES (?, ?)
  `);
  const categorias = [
    ['Antibióticos', 'Medicamentos para combatir infecciones bacterianas'],
    ['Analgésicos', 'Medicamentos para aliviar el dolor'],
    ['Antiinflamatorios', 'Medicamentos para reducir la inflamación'],
    ['Antihistamínicos', 'Medicamentos para alergias'],
    ['Vitaminas', 'Suplementos vitamínicos'],
    ['Antibióticos Tópicos', 'Antibióticos de aplicación externa'],
    ['Antisépticos', 'Sustancias para prevenir infecciones'],
    ['Expectorantes', 'Medicamentos para la tos'],
    ['Antipiréticos', 'Medicamentos para reducir la fiebre'],
    ['Antiespasmódicos', 'Medicamentos para cólicos'],
    ['Hormonas', 'Medicamentos hormonales'],
    ['Cardiovasculares', 'Medicamentos para el corazón']
  ];
  categorias.forEach(([nombre, descripcion]) => {
    insertCategoria.run(nombre, descripcion);
  });

  // Insertar proveedores
  const insertProveedor = db.prepare(`
    INSERT INTO proveedores (nombre, contacto, telefono, email, direccion)
    VALUES (?, ?, ?, ?, ?)
  `);
  const proveedores = [
    ['Pfizer Ecuador', 'Dr. Carlos Mendoza', '+593 2 234 5678', 'ventas@pfizer.ec', 'Av. Amazonas N34-451, Quito'],
    ['Novartis Ecuador', 'Lic. María González', '+593 2 345 6789', 'contacto@novartis.ec', 'Av. 6 de Diciembre N47-142, Quito'],
    ['Roche Ecuador', 'Dr. Luis Herrera', '+593 2 456 7890', 'info@roche.ec', 'Av. República N25-300, Quito'],
    ['Bayer Ecuador', 'Ing. Ana Torres', '+593 2 567 8901', 'ventas@bayer.ec', 'Av. Colón N12-456, Quito'],
    ['GSK Ecuador', 'Dr. Roberto Silva', '+593 2 678 9012', 'contacto@gsk.ec', 'Av. Amazonas N56-789, Quito'],
    ['Sanofi Ecuador', 'Lic. Carmen Ruiz', '+593 2 789 0123', 'info@sanofi.ec', 'Av. 10 de Agosto N23-456, Quito'],
    ['Merck Ecuador', 'Dr. Pedro Vargas', '+593 2 890 1234', 'ventas@merck.ec', 'Av. Patria N45-678, Quito'],
    ['Johnson & Johnson', 'Lic. Laura Morales', '+593 2 901 2345', 'contacto@jnj.ec', 'Av. Amazonas N78-901, Quito']
  ];
  proveedores.forEach(([nombre, contacto, telefono, email, direccion]) => {
    insertProveedor.run(nombre, contacto, telefono, email, direccion);
  });

  // Insertar clientes
  const insertCliente = db.prepare(`
    INSERT INTO clientes (nombre, contacto, telefono, email, direccion)
    VALUES (?, ?, ?, ?, ?)
  `);
  const clientes = [
    ['Farmacia San Rafael', 'Dr. Rafael Morales', '+593 2 111 2222', 'ventas@farmaciasanrafael.ec', 'Av. Amazonas N12-345, Quito'],
    ['Farmacia del Sol', 'Lic. Soledad Vega', '+593 2 222 3333', 'info@farmaciadelso.ec', 'Av. 6 de Diciembre N45-678, Quito'],
    ['Hospital Metropolitano', 'Dr. Carlos Andrade', '+593 2 333 4444', 'compras@hmetro.ec', 'Av. Mariana de Jesús N34-567, Quito'],
    ['Farmacia Cruz Verde', 'Lic. María Cruz', '+593 2 444 5555', 'ventas@cruzverde.ec', 'Av. Colón N56-789, Quito'],
    ['Hospital Vozandes', 'Dr. Juan Pérez', '+593 2 555 6666', 'compras@vozandes.ec', 'Av. 10 de Agosto N67-890, Quito'],
    ['Farmacia Sana Sana', 'Lic. Ana García', '+593 2 666 7777', 'info@sanasana.ec', 'Av. Patria N78-901, Quito'],
    ['Clínica Pichincha', 'Dr. Luis Pichincha', '+593 2 777 8888', 'compras@clinicapichincha.ec', 'Av. Amazonas N89-012, Quito'],
    ['Farmacia del Pueblo', 'Lic. Carmen Pueblo', '+593 2 888 9999', 'ventas@farmaciadelpueblo.ec', 'Av. 6 de Diciembre N90-123, Quito']
  ];
  clientes.forEach(([nombre, contacto, telefono, email, direccion]) => {
    insertCliente.run(nombre, contacto, telefono, email, direccion);
  });

  // Insertar productos
  const insertProducto = db.prepare(`
    INSERT INTO productos (nombre, descripcion, precio, stock, categoria_id, proveedor_id, codigo_barras, imagen_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const productos = [
    ['Amoxicilina 500mg', 'Antibiótico de amplio espectro', 2.50, 100, 1, 1, '7891234567890', '/productos/amoxicilina.jpg'],
    ['Ibuprofeno 400mg', 'Antiinflamatorio y analgésico', 1.80, 150, 3, 2, '7891234567891', '/productos/ibuprofeno.jpg'],
    ['Paracetamol 500mg', 'Analgésico y antipirético', 1.20, 200, 2, 3, '7891234567892', '/productos/paracetamol.jpg'],
    ['Loratadina 10mg', 'Antihistamínico', 3.50, 80, 4, 4, '7891234567893', '/productos/loratadina.jpg'],
    ['Vitamina C 1000mg', 'Suplemento vitamínico', 4.20, 120, 5, 5, '7891234567894', '/productos/vitamina-c.jpg'],
    ['Neomicina Tópica', 'Antibiótico tópico', 5.80, 60, 6, 6, '7891234567895', '/productos/neomicina.jpg'],
    ['Alcohol 70%', 'Antiséptico', 2.30, 300, 7, 7, '7891234567896', '/productos/alcohol.jpg'],
    ['Jarabe para la Tos', 'Expectorante', 3.90, 90, 8, 8, '7891234567897', '/productos/jarabe-tos.jpg'],
    ['Aspirina 100mg', 'Antipirético y analgésico', 1.50, 180, 9, 1, '7891234567898', '/productos/aspirina.jpg'],
    ['Buscopan', 'Antiespasmódico', 4.50, 70, 10, 2, '7891234567899', '/productos/buscopan.jpg'],
    ['Insulina Regular', 'Hormona para diabetes', 15.80, 40, 11, 3, '7891234567900', '/productos/insulina.jpg'],
    ['Enalapril 5mg', 'Medicamento cardiovascular', 6.20, 85, 12, 4, '7891234567901', '/productos/enalapril.jpg'],
    ['Cefalexina 500mg', 'Antibiótico', 3.80, 95, 1, 5, '7891234567902', '/productos/cefalexina.jpg'],
    ['Diclofenaco 50mg', 'Antiinflamatorio', 2.90, 110, 3, 6, '7891234567903', '/productos/diclofenaco.jpg'],
    ['Omeprazol 20mg', 'Protector gástrico', 4.80, 130, 2, 7, '7891234567904', '/productos/omeprazol.jpg'],
    ['Cetirizina 10mg', 'Antihistamínico', 3.20, 75, 4, 8, '7891234567905', '/productos/cetirizina.jpg'],
    ['Vitamina D3', 'Suplemento vitamínico', 5.50, 100, 5, 1, '7891234567906', '/productos/vitamina-d3.jpg'],
    ['Mupirocina Tópica', 'Antibiótico tópico', 7.20, 50, 6, 2, '7891234567907', '/productos/mupirocina.jpg'],
    ['Yodo Povidona', 'Antiséptico', 3.40, 140, 7, 3, '7891234567908', '/productos/yodo.jpg'],
    ['Dextrometorfano', 'Antitusivo', 2.80, 85, 8, 4, '7891234567909', '/productos/dextrometorfano.jpg'],
    ['Acetaminofén', 'Analgésico', 1.60, 160, 9, 5, '7891234567910', '/productos/acetaminofen.jpg'],
    ['Hioscina', 'Antiespasmódico', 5.20, 65, 10, 6, '7891234567911', '/productos/hioscina.jpg'],
    ['Metformina 500mg', 'Medicamento para diabetes', 8.50, 90, 11, 7, '7891234567912', '/productos/metformina.jpg'],
    ['Losartán 50mg', 'Medicamento cardiovascular', 7.80, 75, 12, 8, '7891234567913', '/productos/losartan.jpg']
  ];
  productos.forEach(([nombre, descripcion, precio, stock, categoria_id, proveedor_id, codigo_barras, imagen_url]) => {
    insertProducto.run(nombre, descripcion, precio, stock, categoria_id, proveedor_id, codigo_barras, imagen_url);
  });

  // Insertar configuración del sistema
  const insertConfig = db.prepare(`
    INSERT INTO configuracion (clave, valor, descripcion)
    VALUES (?, ?, ?)
  `);
  const configuraciones = [
    ['smtp_host', 'smtp.gmail.com', 'Servidor SMTP para envío de emails'],
    ['smtp_port', '587', 'Puerto SMTP'],
    ['smtp_user', 'qualipharm@gmail.com', 'Usuario SMTP'],
    ['smtp_pass', 'qualipharm123', 'Contraseña SMTP'],
    ['sms_api_key', 'twilio_api_key_here', 'API Key para envío de SMS'],
    ['sms_phone', '+593987654321', 'Número de teléfono para SMS'],
    ['mfa_issuer', 'LogicQP', 'Emisor para códigos MFA'],
    ['session_timeout', '3600', 'Timeout de sesión en segundos'],
    ['max_login_attempts', '5', 'Máximo intentos de login'],
    ['password_min_length', '8', 'Longitud mínima de contraseña'],
    ['require_mfa', 'true', 'Requerir MFA para usuarios admin'],
    ['backup_frequency', 'daily', 'Frecuencia de respaldos'],
    ['tax_rate', '12', 'Tasa de IVA en porcentaje'],
    ['currency', 'USD', 'Moneda del sistema'],
    ['timezone', 'America/Guayaquil', 'Zona horaria'],
    ['language', 'es', 'Idioma del sistema'],
    ['theme', 'light', 'Tema de la interfaz'],
    ['notifications', 'true', 'Habilitar notificaciones'],
    ['audit_logs', 'true', 'Habilitar logs de auditoría'],
    ['maintenance_mode', 'false', 'Modo de mantenimiento']
  ];
  configuraciones.forEach(([clave, valor, descripcion]) => {
    insertConfig.run(clave, valor, descripcion);
  });

  console.log('✅ Base de datos poblada con datos de Qualipharm');
}

// Función para obtener la instancia de la base de datos
export function getDatabase() {
  return db;
}

// Función para cerrar la base de datos
export function closeDatabase() {
  db.close();
}

// Inicializar la base de datos al importar el módulo
initializeDatabase();
seedDatabase();



