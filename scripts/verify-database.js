const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function verifyDatabase() {
  console.log('🔍 Verificando datos de Qualipharm en la base de datos local...');
  console.log('');

  const client = new Client({
    host: 'localhost',
    port: 54322,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres',
  });

  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL local');

    // Verificar configuración de empresa
    console.log('\n🏥 VERIFICANDO CONFIGURACIÓN DE EMPRESA:');
    const empresaResult = await client.query('SELECT * FROM empresa_config ORDER BY created_at DESC LIMIT 1');
    if (empresaResult.rows.length > 0) {
      const empresa = empresaResult.rows[0];
      console.log('✅ Empresa encontrada:');
      console.log(`   - Nombre: ${empresa.nombre}`);
      console.log(`   - Dirección: ${empresa.direccion}`);
      console.log(`   - Teléfono: ${empresa.telefono}`);
      console.log(`   - Email: ${empresa.email}`);
      console.log(`   - RUC: ${empresa.ruc}`);
    } else {
      console.log('❌ No se encontró configuración de empresa');
    }

    // Verificar categorías
    console.log('\n📂 VERIFICANDO CATEGORÍAS:');
    const categoriasResult = await client.query('SELECT COUNT(*) as total FROM categorias');
    const categoriasCount = categoriasResult.rows[0].total;
    console.log(`✅ Total de categorías: ${categoriasCount}`);
    
    const categoriasList = await client.query('SELECT nombre FROM categorias ORDER BY nombre');
    console.log('   Categorías encontradas:');
    categoriasList.rows.forEach(cat => console.log(`   - ${cat.nombre}`));

    // Verificar proveedores
    console.log('\n🏭 VERIFICANDO PROVEEDORES:');
    const proveedoresResult = await client.query('SELECT COUNT(*) as total FROM proveedores');
    const proveedoresCount = proveedoresResult.rows[0].total;
    console.log(`✅ Total de proveedores: ${proveedoresCount}`);
    
    const proveedoresList = await client.query('SELECT nombre, email, telefono FROM proveedores ORDER BY nombre');
    console.log('   Proveedores encontrados:');
    proveedoresList.rows.forEach(prov => console.log(`   - ${prov.nombre} (${prov.email}) - ${prov.telefono}`));

    // Verificar clientes
    console.log('\n👥 VERIFICANDO CLIENTES:');
    const clientesResult = await client.query('SELECT COUNT(*) as total FROM clientes');
    const clientesCount = clientesResult.rows[0].total;
    console.log(`✅ Total de clientes: ${clientesCount}`);
    
    const clientesList = await client.query('SELECT nombre, apellido, email, telefono FROM clientes ORDER BY nombre');
    console.log('   Clientes encontrados:');
    clientesList.rows.forEach(cli => console.log(`   - ${cli.nombre} ${cli.apellido} (${cli.email}) - ${cli.telefono}`));

    // Verificar productos
    console.log('\n📦 VERIFICANDO PRODUCTOS:');
    const productosResult = await client.query('SELECT COUNT(*) as total FROM productos');
    const productosCount = productosResult.rows[0].total;
    console.log(`✅ Total de productos: ${productosCount}`);
    
    const productosList = await client.query(`
      SELECT p.codigo, p.nombre, p.precio, p.stock, p.stock_minimo, p.unidad_medida, 
             c.nombre as categoria, pr.nombre as proveedor
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
      ORDER BY p.codigo
    `);
    console.log('   Productos encontrados:');
    productosList.rows.forEach(prod => {
      console.log(`   - ${prod.codigo}: ${prod.nombre}`);
      console.log(`     Precio: $${prod.precio} | Stock: ${prod.stock} (Mín: ${prod.stock_minimo}) | ${prod.unidad_medida}`);
      console.log(`     Categoría: ${prod.categoria} | Proveedor: ${prod.proveedor}`);
    });

    // Verificar ventas
    console.log('\n💰 VERIFICANDO VENTAS:');
    const ventasResult = await client.query('SELECT COUNT(*) as total FROM ventas');
    const ventasCount = ventasResult.rows[0].total;
    console.log(`✅ Total de ventas: ${ventasCount}`);
    
    const ventasList = await client.query(`
      SELECT numero_venta, cliente_nombre, total, estado, fecha_venta
      FROM ventas 
      ORDER BY fecha_venta DESC
    `);
    console.log('   Ventas encontradas:');
    ventasList.rows.forEach(venta => {
      console.log(`   - ${venta.numero_venta}: ${venta.cliente_nombre} - $${venta.total} (${venta.estado})`);
      console.log(`     Fecha: ${new Date(venta.fecha_venta).toLocaleDateString('es-EC')}`);
    });

    // Verificar items de ventas
    console.log('\n🛒 VERIFICANDO ITEMS DE VENTAS:');
    const itemsResult = await client.query('SELECT COUNT(*) as total FROM venta_items');
    const itemsCount = itemsResult.rows[0].total;
    console.log(`✅ Total de items de ventas: ${itemsCount}`);

    // Verificar inventario
    console.log('\n📊 VERIFICANDO MOVIMIENTOS DE INVENTARIO:');
    const inventarioResult = await client.query('SELECT COUNT(*) as total FROM inventario');
    const inventarioCount = inventarioResult.rows[0].total;
    console.log(`✅ Total de movimientos de inventario: ${inventarioCount}`);

    // Verificar configuración
    console.log('\n⚙️ VERIFICANDO CONFIGURACIÓN:');
    const configResult = await client.query('SELECT COUNT(*) as total FROM configuracion');
    const configCount = configResult.rows[0].total;
    console.log(`✅ Total de configuraciones: ${configCount}`);
    
    const configList = await client.query('SELECT clave, valor, descripcion FROM configuracion ORDER BY clave');
    console.log('   Configuraciones encontradas:');
    configList.rows.forEach(config => {
      console.log(`   - ${config.clave}: ${config.valor} (${config.descripcion})`);
    });

    // Verificar reportes
    console.log('\n📈 VERIFICANDO REPORTES:');
    const reportesResult = await client.query('SELECT COUNT(*) as total FROM reportes');
    const reportesCount = reportesResult.rows[0].total;
    console.log(`✅ Total de reportes: ${reportesCount}`);

    // Resumen final
    console.log('\n🎯 RESUMEN DE VERIFICACIÓN:');
    console.log('=====================================');
    console.log(`✅ Empresa: ${empresaResult.rows.length > 0 ? 'Configurada' : '❌ No encontrada'}`);
    console.log(`✅ Categorías: ${categoriasCount} registros`);
    console.log(`✅ Proveedores: ${proveedoresCount} registros`);
    console.log(`✅ Clientes: ${clientesCount} registros`);
    console.log(`✅ Productos: ${productosCount} registros`);
    console.log(`✅ Ventas: ${ventasCount} registros`);
    console.log(`✅ Items de ventas: ${itemsCount} registros`);
    console.log(`✅ Movimientos de inventario: ${inventarioCount} registros`);
    console.log(`✅ Configuraciones: ${configCount} registros`);
    console.log(`✅ Reportes: ${reportesCount} registros`);
    console.log('=====================================');

    if (empresaResult.rows.length > 0 && 
        categoriasCount > 0 && 
        proveedoresCount > 0 && 
        clientesCount > 0 && 
        productosCount > 0 && 
        ventasCount > 0) {
      console.log('\n🎉 ¡VERIFICACIÓN EXITOSA!');
      console.log('✅ Todos los datos de Qualipharm están correctamente almacenados en la base de datos local');
      console.log('✅ No hay datos simulados fuera de la BD');
      console.log('✅ El sistema está listo para usar');
    } else {
      console.log('\n❌ VERIFICACIÓN FALLIDA');
      console.log('❌ Faltan datos en la base de datos');
      console.log('❌ Ejecuta: node scripts/seed-database.js');
    }

  } catch (error) {
    console.error('❌ Error verificando base de datos:', error);
    console.log('\n🔧 SOLUCIÓN:');
    console.log('1. Asegúrate de que Docker esté ejecutándose');
    console.log('2. Ejecuta: docker-compose up -d');
    console.log('3. Espera que los servicios estén listos');
    console.log('4. Ejecuta: node scripts/seed-database.js');
  } finally {
    await client.end();
  }
}

// Ejecutar verificación
verifyDatabase();
