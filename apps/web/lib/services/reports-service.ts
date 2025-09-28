import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

export interface ReportData {
  id?: number;
  nombre: string;
  tipo: string;
  parametros: any;
  archivo_url?: string;
  usuario_id: string;
  created_at?: string;
}

export interface SalesReport {
  totalVentas: number;
  totalIngresos: number;
  promedioVenta: number;
  ventasPorDia: Array<{ fecha: string; ventas: number; ingresos: number }>;
  ventasPorMes: Array<{ mes: string; ventas: number; ingresos: number }>;
  topProductos: Array<{ producto: string; cantidad: number; ingresos: number }>;
  topClientes: Array<{ cliente: string; ventas: number; ingresos: number }>;
}

export interface InventoryReport {
  totalProductos: number;
  productosConStock: number;
  productosSinStock: number;
  productosStockBajo: number;
  valorTotalInventario: number;
  movimientosRecientes: Array<{
    producto: string;
    tipo: string;
    cantidad: number;
    fecha: string;
  }>;
  productosMasMovidos: Array<{
    producto: string;
    movimientos: number;
    entradas: number;
    salidas: number;
  }>;
}

export interface CustomerReport {
  totalClientes: number;
  clientesActivos: number;
  clientesNuevos: number;
  clientesPorTipo: Array<{ tipo: string; cantidad: number }>;
  topClientes: Array<{
    cliente: string;
    ventas: number;
    ingresos: number;
    ultimaCompra: string;
  }>;
  clientesSinCompras: Array<{
    cliente: string;
    fechaRegistro: string;
    diasSinComprar: number;
  }>;
}

export interface ProductReport {
  totalProductos: number;
  productosActivos: number;
  productosInactivos: number;
  productosPorCategoria: Array<{ categoria: string; cantidad: number }>;
  productosPorProveedor: Array<{ proveedor: string; cantidad: number }>;
  productosMasVendidos: Array<{
    producto: string;
    ventas: number;
    ingresos: number;
    stock: number;
  }>;
  productosMenosVendidos: Array<{
    producto: string;
    ventas: number;
    ingresos: number;
    stock: number;
  }>;
}

export class ReportsService {
  private static instance: ReportsService;

  private constructor() {}

  public static getInstance(): ReportsService {
    if (!ReportsService.instance) {
      ReportsService.instance = new ReportsService();
    }
    return ReportsService.instance;
  }

  // Generar reporte de ventas
  public async generateSalesReport(
    startDate: string,
    endDate: string,
    userId: string
  ): Promise<{ report?: SalesReport; error?: string }> {
    try {
      console.log('📊 Generando reporte de ventas...');

      // Obtener ventas en el rango de fechas
      const { data: ventas, error: ventasError } = await supabase
        .from('ventas')
        .select(`
          id,
          total,
          fecha,
          estado,
          clientes(nombre),
          venta_items(
            cantidad,
            precio_unitario,
            productos(nombre)
          )
        `)
        .gte('fecha', startDate)
        .lte('fecha', endDate)
        .eq('estado', 'confirmada')
        .order('fecha', { ascending: true });

      if (ventasError) {
        console.error('❌ Error obteniendo ventas:', ventasError);
        return { error: ventasError.message };
      }

      // Calcular estadísticas
      const totalVentas = ventas?.length || 0;
      const totalIngresos = ventas?.reduce((sum, venta) => sum + venta.total, 0) || 0;
      const promedioVenta = totalVentas > 0 ? totalIngresos / totalVentas : 0;

      // Agrupar por día
      const ventasPorDia = this.groupSalesByDay(ventas || []);
      
      // Agrupar por mes
      const ventasPorMes = this.groupSalesByMonth(ventas || []);

      // Top productos
      const topProductos = this.getTopProducts(ventas || []);

      // Top clientes
      const topClientes = this.getTopClients(ventas || []);

      const report: SalesReport = {
        totalVentas,
        totalIngresos,
        promedioVenta,
        ventasPorDia,
        ventasPorMes,
        topProductos,
        topClientes
      };

      // Guardar reporte
      await this.saveReport('ventas', report, userId, { startDate, endDate });

      console.log('✅ Reporte de ventas generado exitosamente');
      return { report };
    } catch (error) {
      console.error('❌ Error en generateSalesReport:', error);
      return { error: 'Error interno del servidor' };
    }
  }

  // Generar reporte de inventario
  public async generateInventoryReport(userId: string): Promise<{ report?: InventoryReport; error?: string }> {
    try {
      console.log('📊 Generando reporte de inventario...');

      // Obtener productos
      const { data: productos, error: productosError } = await supabase
        .from('productos')
        .select('nombre, stock, stock_minimo, precio')
        .eq('activo', true);

      if (productosError) {
        console.error('❌ Error obteniendo productos:', productosError);
        return { error: productosError.message };
      }

      // Obtener movimientos recientes
      const { data: movimientos, error: movimientosError } = await supabase
        .from('inventario')
        .select(`
          cantidad,
          tipo_movimiento,
          fecha_movimiento,
          productos(nombre)
        `)
        .order('fecha_movimiento', { ascending: false })
        .limit(50);

      if (movimientosError) {
        console.error('❌ Error obteniendo movimientos:', movimientosError);
        return { error: movimientosError.message };
      }

      // Calcular estadísticas
      const totalProductos = productos?.length || 0;
      const productosConStock = productos?.filter(p => p.stock > 0).length || 0;
      const productosSinStock = productos?.filter(p => p.stock === 0).length || 0;
      const productosStockBajo = productos?.filter(p => p.stock <= p.stock_minimo).length || 0;
      const valorTotalInventario = productos?.reduce((sum, p) => sum + (p.stock * p.precio), 0) || 0;

      // Procesar movimientos
      const movimientosRecientes = movimientos?.map(m => ({
        producto: m.productos?.nombre || 'N/A',
        tipo: m.tipo_movimiento,
        cantidad: m.cantidad,
        fecha: new Date(m.fecha_movimiento).toLocaleDateString('es-EC')
      })) || [];

      // Productos más movidos
      const productosMasMovidos = this.getMostMovedProducts(movimientos || []);

      const report: InventoryReport = {
        totalProductos,
        productosConStock,
        productosSinStock,
        productosStockBajo,
        valorTotalInventario,
        movimientosRecientes,
        productosMasMovidos
      };

      // Guardar reporte
      await this.saveReport('inventario', report, userId, {});

      console.log('✅ Reporte de inventario generado exitosamente');
      return { report };
    } catch (error) {
      console.error('❌ Error en generateInventoryReport:', error);
      return { error: 'Error interno del servidor' };
    }
  }

  // Generar reporte de clientes
  public async generateCustomerReport(userId: string): Promise<{ report?: CustomerReport; error?: string }> {
    try {
      console.log('📊 Generando reporte de clientes...');

      // Obtener clientes
      const { data: clientes, error: clientesError } = await supabase
        .from('clientes')
        .select('id, nombre, created_at, activo');

      if (clientesError) {
        console.error('❌ Error obteniendo clientes:', clientesError);
        return { error: clientesError.message };
      }

      // Obtener ventas por cliente
      const { data: ventas, error: ventasError } = await supabase
        .from('ventas')
        .select(`
          cliente_id,
          total,
          fecha,
          clientes(nombre)
        `)
        .eq('estado', 'confirmada');

      if (ventasError) {
        console.error('❌ Error obteniendo ventas:', ventasError);
        return { error: ventasError.message };
      }

      // Calcular estadísticas
      const totalClientes = clientes?.length || 0;
      const clientesActivos = clientes?.filter(c => c.activo).length || 0;
      const clientesNuevos = clientes?.filter(c => {
        const fechaRegistro = new Date(c.created_at);
        const hace30Dias = new Date();
        hace30Dias.setDate(hace30Dias.getDate() - 30);
        return fechaRegistro > hace30Dias;
      }).length || 0;

      // Clientes por tipo (activo/inactivo)
      const clientesPorTipo = [
        { tipo: 'Activos', cantidad: clientesActivos },
        { tipo: 'Inactivos', cantidad: totalClientes - clientesActivos }
      ];

      // Top clientes
      const topClientes = this.getTopClients(ventas || []);

      // Clientes sin compras
      const clientesSinCompras = this.getClientsWithoutPurchases(clientes || [], ventas || []);

      const report: CustomerReport = {
        totalClientes,
        clientesActivos,
        clientesNuevos,
        clientesPorTipo,
        topClientes,
        clientesSinCompras
      };

      // Guardar reporte
      await this.saveReport('clientes', report, userId, {});

      console.log('✅ Reporte de clientes generado exitosamente');
      return { report };
    } catch (error) {
      console.error('❌ Error en generateCustomerReport:', error);
      return { error: 'Error interno del servidor' };
    }
  }

  // Generar reporte de productos
  public async generateProductReport(userId: string): Promise<{ report?: ProductReport; error?: string }> {
    try {
      console.log('📊 Generando reporte de productos...');

      // Obtener productos
      const { data: productos, error: productosError } = await supabase
        .from('productos')
        .select(`
          nombre,
          precio,
          stock,
          activo,
          categorias(nombre),
          proveedores(nombre)
        `);

      if (productosError) {
        console.error('❌ Error obteniendo productos:', productosError);
        return { error: productosError.message };
      }

      // Obtener ventas por producto
      const { data: ventas, error: ventasError } = await supabase
        .from('venta_items')
        .select(`
          cantidad,
          precio_unitario,
          productos(nombre)
        `);

      if (ventasError) {
        console.error('❌ Error obteniendo ventas:', ventasError);
        return { error: ventasError.message };
      }

      // Calcular estadísticas
      const totalProductos = productos?.length || 0;
      const productosActivos = productos?.filter(p => p.activo).length || 0;
      const productosInactivos = totalProductos - productosActivos;

      // Productos por categoría
      const productosPorCategoria = this.groupProductsByCategory(productos || []);

      // Productos por proveedor
      const productosPorProveedor = this.groupProductsBySupplier(productos || []);

      // Productos más vendidos
      const productosMasVendidos = this.getMostSoldProducts(ventas || []);

      // Productos menos vendidos
      const productosMenosVendidos = this.getLeastSoldProducts(ventas || []);

      const report: ProductReport = {
        totalProductos,
        productosActivos,
        productosInactivos,
        productosPorCategoria,
        productosPorProveedor,
        productosMasVendidos,
        productosMenosVendidos
      };

      // Guardar reporte
      await this.saveReport('productos', report, userId, {});

      console.log('✅ Reporte de productos generado exitosamente');
      return { report };
    } catch (error) {
      console.error('❌ Error en generateProductReport:', error);
      return { error: 'Error interno del servidor' };
    }
  }

  // Guardar reporte
  private async saveReport(
    tipo: string,
    data: any,
    userId: string,
    parametros: any
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('reportes')
        .insert([{
          nombre: `Reporte de ${tipo} - ${new Date().toLocaleDateString('es-EC')}`,
          tipo: tipo,
          parametros: parametros,
          usuario_id: userId
        }]);

      if (error) {
        console.error('❌ Error guardando reporte:', error);
      }
    } catch (error) {
      console.error('❌ Error en saveReport:', error);
    }
  }

  // Métodos auxiliares
  private groupSalesByDay(ventas: any[]): Array<{ fecha: string; ventas: number; ingresos: number }> {
    const grouped = ventas.reduce((acc, venta) => {
      const fecha = new Date(venta.fecha).toLocaleDateString('es-EC');
      if (!acc[fecha]) {
        acc[fecha] = { ventas: 0, ingresos: 0 };
      }
      acc[fecha].ventas += 1;
      acc[fecha].ingresos += venta.total;
      return acc;
    }, {});

    return Object.entries(grouped).map(([fecha, data]: [string, any]) => ({
      fecha,
      ventas: data.ventas,
      ingresos: data.ingresos
    }));
  }

  private groupSalesByMonth(ventas: any[]): Array<{ mes: string; ventas: number; ingresos: number }> {
    const grouped = ventas.reduce((acc, venta) => {
      const mes = new Date(venta.fecha).toLocaleDateString('es-EC', { year: 'numeric', month: 'long' });
      if (!acc[mes]) {
        acc[mes] = { ventas: 0, ingresos: 0 };
      }
      acc[mes].ventas += 1;
      acc[mes].ingresos += venta.total;
      return acc;
    }, {});

    return Object.entries(grouped).map(([mes, data]: [string, any]) => ({
      mes,
      ventas: data.ventas,
      ingresos: data.ingresos
    }));
  }

  private getTopProducts(ventas: any[]): Array<{ producto: string; cantidad: number; ingresos: number }> {
    const productSales = ventas.reduce((acc, venta) => {
      venta.venta_items?.forEach((item: any) => {
        const producto = item.productos?.nombre || 'N/A';
        if (!acc[producto]) {
          acc[producto] = { cantidad: 0, ingresos: 0 };
        }
        acc[producto].cantidad += item.cantidad;
        acc[producto].ingresos += item.cantidad * item.precio_unitario;
      });
      return acc;
    }, {});

    return Object.entries(productSales)
      .map(([producto, data]: [string, any]) => ({
        producto,
        cantidad: data.cantidad,
        ingresos: data.ingresos
      }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10);
  }

  private getTopClients(ventas: any[]): Array<{ cliente: string; ventas: number; ingresos: number }> {
    const clientSales = ventas.reduce((acc, venta) => {
      const cliente = venta.clientes?.nombre || 'N/A';
      if (!acc[cliente]) {
        acc[cliente] = { ventas: 0, ingresos: 0 };
      }
      acc[cliente].ventas += 1;
      acc[cliente].ingresos += venta.total;
      return acc;
    }, {});

    return Object.entries(clientSales)
      .map(([cliente, data]: [string, any]) => ({
        cliente,
        ventas: data.ventas,
        ingresos: data.ingresos
      }))
      .sort((a, b) => b.ingresos - a.ingresos)
      .slice(0, 10);
  }

  private getMostMovedProducts(movimientos: any[]): Array<{ producto: string; movimientos: number; entradas: number; salidas: number }> {
    const productMovements = movimientos.reduce((acc, mov) => {
      const producto = mov.productos?.nombre || 'N/A';
      if (!acc[producto]) {
        acc[producto] = { movimientos: 0, entradas: 0, salidas: 0 };
      }
      acc[producto].movimientos += 1;
      if (mov.tipo_movimiento === 'entrada') {
        acc[producto].entradas += 1;
      } else if (mov.tipo_movimiento === 'salida') {
        acc[producto].salidas += 1;
      }
      return acc;
    }, {});

    return Object.entries(productMovements)
      .map(([producto, data]: [string, any]) => ({
        producto,
        movimientos: data.movimientos,
        entradas: data.entradas,
        salidas: data.salidas
      }))
      .sort((a, b) => b.movimientos - a.movimientos)
      .slice(0, 10);
  }

  private getClientsWithoutPurchases(clientes: any[], ventas: any[]): Array<{ cliente: string; fechaRegistro: string; diasSinComprar: number }> {
    const clientesConVentas = new Set(ventas.map(v => v.cliente_id));
    
    return clientes
      .filter(c => !clientesConVentas.has(c.id))
      .map(c => {
        const fechaRegistro = new Date(c.created_at);
        const ahora = new Date();
        const diasSinComprar = Math.floor((ahora.getTime() - fechaRegistro.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          cliente: c.nombre,
          fechaRegistro: fechaRegistro.toLocaleDateString('es-EC'),
          diasSinComprar
        };
      })
      .sort((a, b) => b.diasSinComprar - a.diasSinComprar)
      .slice(0, 10);
  }

  private groupProductsByCategory(productos: any[]): Array<{ categoria: string; cantidad: number }> {
    const grouped = productos.reduce((acc, producto) => {
      const categoria = producto.categorias?.nombre || 'Sin categoría';
      acc[categoria] = (acc[categoria] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([categoria, cantidad]) => ({ categoria, cantidad: cantidad as number }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }

  private groupProductsBySupplier(productos: any[]): Array<{ proveedor: string; cantidad: number }> {
    const grouped = productos.reduce((acc, producto) => {
      const proveedor = producto.proveedores?.nombre || 'Sin proveedor';
      acc[proveedor] = (acc[proveedor] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([proveedor, cantidad]) => ({ proveedor, cantidad: cantidad as number }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }

  private getMostSoldProducts(ventas: any[]): Array<{ producto: string; ventas: number; ingresos: number; stock: number }> {
    const productSales = ventas.reduce((acc, venta) => {
      const producto = venta.productos?.nombre || 'N/A';
      if (!acc[producto]) {
        acc[producto] = { ventas: 0, ingresos: 0, stock: 0 };
      }
      acc[producto].ventas += venta.cantidad;
      acc[producto].ingresos += venta.cantidad * venta.precio_unitario;
      return acc;
    }, {});

    return Object.entries(productSales)
      .map(([producto, data]: [string, any]) => ({
        producto,
        ventas: data.ventas,
        ingresos: data.ingresos,
        stock: data.stock
      }))
      .sort((a, b) => b.ventas - a.ventas)
      .slice(0, 10);
  }

  private getLeastSoldProducts(ventas: any[]): Array<{ producto: string; ventas: number; ingresos: number; stock: number }> {
    const productSales = ventas.reduce((acc, venta) => {
      const producto = venta.productos?.nombre || 'N/A';
      if (!acc[producto]) {
        acc[producto] = { ventas: 0, ingresos: 0, stock: 0 };
      }
      acc[producto].ventas += venta.cantidad;
      acc[producto].ingresos += venta.cantidad * venta.precio_unitario;
      return acc;
    }, {});

    return Object.entries(productSales)
      .map(([producto, data]: [string, any]) => ({
        producto,
        ventas: data.ventas,
        ingresos: data.ingresos,
        stock: data.stock
      }))
      .sort((a, b) => a.ventas - b.ventas)
      .slice(0, 10);
  }
}

// Exportar instancia singleton
export const reportsService = ReportsService.getInstance();



