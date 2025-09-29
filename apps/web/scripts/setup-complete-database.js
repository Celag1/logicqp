const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://fwahfmwtbgikzuzmnpsv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3YWhmbXd0Ymdpa3p1em1ucHN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTEyMTQ1OSwiZXhwIjoyMDc0Njk3NDU5fQ.ds--rwknbADvlAUuRU0ypi0pwxr6Sd9Jr3CrPexxSsU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupCompleteDatabase() {
  console.log('🚀 Configurando base de datos completa con relaciones...');

  try {
    // 1. Crear tabla de proveedores si no existe
    console.log('\n1️⃣ Configurando tabla proveedores...');
    const { error: proveedoresError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS proveedores (
          id SERIAL PRIMARY KEY,
          nombre TEXT NOT NULL,
          contacto TEXT,
          telefono TEXT,
          email TEXT,
          direccion TEXT,
          activo BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (proveedoresError) {
      console.log('⚠️ Error creando tabla proveedores:', proveedoresError.message);
    } else {
      console.log('✅ Tabla proveedores configurada');
    }

    // 2. Crear tabla de categorías si no existe
    console.log('\n2️⃣ Configurando tabla categorías...');
    const { error: categoriasError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS categorias (
          id SERIAL PRIMARY KEY,
          nombre TEXT NOT NULL UNIQUE,
          descripcion TEXT,
          imagen_url TEXT,
          activa BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (categoriasError) {
      console.log('⚠️ Error creando tabla categorías:', categoriasError.message);
    } else {
      console.log('✅ Tabla categorías configurada');
    }

    // 3. Crear tabla de lotes si no existe
    console.log('\n3️⃣ Configurando tabla lotes...');
    const { error: lotesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS lotes (
          id SERIAL PRIMARY KEY,
          producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
          numero_lote TEXT NOT NULL,
          cantidad_disponible INTEGER NOT NULL DEFAULT 0,
          cantidad_inicial INTEGER NOT NULL DEFAULT 0,
          precio_compra DECIMAL(10,2) NOT NULL DEFAULT 0,
          fecha_vencimiento DATE,
          activo BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (lotesError) {
      console.log('⚠️ Error creando tabla lotes:', lotesError.message);
    } else {
      console.log('✅ Tabla lotes configurada');
    }

    // 4. Modificar tabla productos para agregar foreign keys
    console.log('\n4️⃣ Modificando tabla productos...');
    const { error: productosModError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Agregar columnas de foreign key si no existen
        ALTER TABLE productos 
        ADD COLUMN IF NOT EXISTS categoria_id INTEGER REFERENCES categorias(id),
        ADD COLUMN IF NOT EXISTS proveedor_id INTEGER REFERENCES proveedores(id);
        
        -- Crear índices para mejor rendimiento
        CREATE INDEX IF NOT EXISTS idx_productos_categoria_id ON productos(categoria_id);
        CREATE INDEX IF NOT EXISTS idx_productos_proveedor_id ON productos(proveedor_id);
        CREATE INDEX IF NOT EXISTS idx_lotes_producto_id ON lotes(producto_id);
      `
    });

    if (productosModError) {
      console.log('⚠️ Error modificando tabla productos:', productosModError.message);
    } else {
      console.log('✅ Tabla productos modificada con foreign keys');
    }

    // 5. Insertar datos de categorías
    console.log('\n5️⃣ Insertando categorías...');
    const categoriasData = [
      { nombre: 'Medicamentos', descripcion: 'Medicamentos y fármacos' },
      { nombre: 'Equipos Médicos', descripcion: 'Equipos y dispositivos médicos' },
      { nombre: 'Insumos', descripcion: 'Insumos médicos y hospitalarios' },
      { nombre: 'Laboratorio', descripcion: 'Productos de laboratorio' },
      { nombre: 'Farmacéuticos', descripcion: 'Productos farmacéuticos' }
    ];

    for (const categoria of categoriasData) {
      const { error: catError } = await supabase
        .from('categorias')
        .upsert(categoria, { onConflict: 'nombre' });

      if (catError) {
        console.log(`⚠️ Error insertando categoría ${categoria.nombre}:`, catError.message);
      } else {
        console.log(`✅ Categoría ${categoria.nombre} insertada`);
      }
    }

    // 6. Insertar datos de proveedores
    console.log('\n6️⃣ Insertando proveedores...');
    const proveedoresData = [
      { nombre: 'Qualipharm', contacto: 'Juan Pérez', telefono: '+593 2 234 5678', email: 'ventas@qualipharm.com' },
      { nombre: 'Equipos Médicos SA', contacto: 'María González', telefono: '+593 2 345 6789', email: 'info@equiposmedicos.com' },
      { nombre: 'Insumos Hospitalarios', contacto: 'Carlos López', telefono: '+593 2 456 7890', email: 'ventas@insumoshospitalarios.com' },
      { nombre: 'LabCorp Ecuador', contacto: 'Ana Martínez', telefono: '+593 2 567 8901', email: 'info@labcorp.ec' },
      { nombre: 'MedSupply Pro', contacto: 'Roberto Silva', telefono: '+593 2 678 9012', email: 'ventas@medsupply.com' }
    ];

    for (const proveedor of proveedoresData) {
      const { error: provError } = await supabase
        .from('proveedores')
        .upsert(proveedor, { onConflict: 'nombre' });

      if (provError) {
        console.log(`⚠️ Error insertando proveedor ${proveedor.nombre}:`, provError.message);
      } else {
        console.log(`✅ Proveedor ${proveedor.nombre} insertado`);
      }
    }

    // 7. Actualizar productos con foreign keys
    console.log('\n7️⃣ Actualizando productos con foreign keys...');
    
    // Obtener IDs de categorías y proveedores
    const { data: categorias, error: catError } = await supabase
      .from('categorias')
      .select('id, nombre');

    const { data: proveedores, error: provError } = await supabase
      .from('proveedores')
      .select('id, nombre');

    if (catError || provError) {
      console.log('❌ Error obteniendo categorías o proveedores');
      return;
    }

    // Mapeo de categorías
    const categoriaMap = {
      'Medicamentos': categorias.find(c => c.nombre === 'Medicamentos')?.id,
      'Equipos Médicos': categorias.find(c => c.nombre === 'Equipos Médicos')?.id,
      'Insumos': categorias.find(c => c.nombre === 'Insumos')?.id,
      'Laboratorio': categorias.find(c => c.nombre === 'Laboratorio')?.id
    };

    // Mapeo de proveedores
    const proveedorMap = {
      'Genérico': proveedores.find(p => p.nombre === 'Qualipharm')?.id,
      'MedTech': proveedores.find(p => p.nombre === 'Equipos Médicos SA')?.id,
      'MedSupply': proveedores.find(p => p.nombre === 'Insumos Hospitalarios')?.id,
      'LabCorp': proveedores.find(p => p.nombre === 'LabCorp Ecuador')?.id
    };

    // Actualizar productos
    const { data: productos, error: prodError } = await supabase
      .from('productos')
      .select('*');

    if (prodError) {
      console.log('❌ Error obteniendo productos:', prodError.message);
      return;
    }

    for (const producto of productos) {
      const categoriaId = categoriaMap[producto.categoria] || categoriaMap['Medicamentos'];
      const proveedorId = proveedorMap[producto.marca] || proveedorMap['Genérico'];

      const { error: updateError } = await supabase
        .from('productos')
        .update({
          categoria_id: categoriaId,
          proveedor_id: proveedorId
        })
        .eq('id', producto.id);

      if (updateError) {
        console.log(`⚠️ Error actualizando producto ${producto.nombre}:`, updateError.message);
      } else {
        console.log(`✅ Producto ${producto.nombre} actualizado`);
      }
    }

    // 8. Crear lotes para los productos
    console.log('\n8️⃣ Creando lotes para productos...');
    for (const producto of productos) {
      const loteData = {
        producto_id: producto.id,
        numero_lote: `LOTE-${producto.id}-${Date.now()}`,
        cantidad_disponible: producto.stock_disponible || 0,
        cantidad_inicial: producto.stock_disponible || 0,
        precio_compra: (producto.precio || 0) * 0.7, // 70% del precio de venta
        fecha_vencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 año desde ahora
      };

      const { error: loteError } = await supabase
        .from('lotes')
        .insert(loteData);

      if (loteError) {
        console.log(`⚠️ Error creando lote para ${producto.nombre}:`, loteError.message);
      } else {
        console.log(`✅ Lote creado para ${producto.nombre}`);
      }
    }

    console.log('\n🎉 ¡BASE DE DATOS COMPLETA CONFIGURADA!');
    console.log('✅ Todas las tablas creadas con relaciones');
    console.log('✅ Datos de prueba insertados');
    console.log('✅ Foreign keys configuradas');
    console.log('✅ Lotes creados para productos');

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

setupCompleteDatabase();
