"use client";

import { supabase } from '@/lib/supabase';

export interface BarcodeProduct {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  marca: string;
  precio_compra: number;
  precio_venta: number;
  stock_disponible: number;
  stock_minimo: number;
  ubicacion: string;
  proveedor: string;
  fecha_vencimiento?: string;
  lote?: string;
  estado: 'activo' | 'inactivo' | 'agotado';
  imagen_url?: string;
  barcode_format: 'CODE128' | 'EAN13' | 'EAN8' | 'UPC' | 'CODE39';
  created_at: string;
  updated_at: string;
}

export interface BarcodeScanResult {
  success: boolean;
  product?: BarcodeProduct;
  error?: string;
  suggestions?: BarcodeProduct[];
  timestamp: Date;
}

export interface InventoryMovement {
  id: string;
  producto_id: string;
  tipo: 'entrada' | 'salida' | 'ajuste' | 'transferencia';
  cantidad: number;
  cantidad_anterior: number;
  cantidad_nueva: number;
  motivo: string;
  usuario_id: string;
  ubicacion_origen?: string;
  ubicacion_destino?: string;
  lote?: string;
  fecha_vencimiento?: string;
  costo_unitario?: number;
  total_costo?: number;
  observaciones?: string;
  created_at: string;
}

export interface BarcodeSearchOptions {
  includeInactive?: boolean;
  includeOutOfStock?: boolean;
  searchByCode?: boolean;
  searchByName?: boolean;
  searchByDescription?: boolean;
  limit?: number;
}

class BarcodeInventoryService {
  private table = 'productos';
  private movementsTable = 'movimientos_inventario';

  /**
   * Buscar producto por código de barras
   */
  async findProductByBarcode(barcode: string, options: BarcodeSearchOptions = {}): Promise<BarcodeScanResult> {
    try {
      console.log('🔍 Buscando producto por código de barras:', barcode);

      const {
        includeInactive = false,
        includeOutOfStock = false,
        limit = 10
      } = options;

      let query = supabase
        .from(this.table)
        .select(`
          *,
          categorias(nombre, descripcion),
          proveedores(nombre, contacto)
        `)
        .eq('codigo', barcode);

      if (!includeInactive) {
        query = query.eq('activo', true);
      }

      if (!includeOutOfStock) {
        query = query.gt('stock_disponible', 0);
      }

      const { data, error } = await query.limit(limit);

      if (error) {
        console.error('❌ Error buscando producto por código:', error);
        return {
          success: false,
          error: 'Error de conexión con la base de datos',
          timestamp: new Date()
        };
      }

      if (!data || data.length === 0) {
        // Buscar productos similares
        const suggestions = await this.findSimilarProducts(barcode);
        
        return {
          success: false,
          error: 'Producto no encontrado',
          suggestions,
          timestamp: new Date()
        };
      }

      const product = this.mapToBarcodeProduct(data[0]);
      
      console.log('✅ Producto encontrado:', product.nombre);
      
      return {
        success: true,
        product,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Error en findProductByBarcode:', error);
      return {
        success: false,
        error: 'Error interno del servidor',
        timestamp: new Date()
      };
    }
  }

  /**
   * Buscar productos similares por código parcial
   */
  async findSimilarProducts(partialCode: string): Promise<BarcodeProduct[]> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select(`
          *,
          categorias(nombre, descripcion),
          proveedores(nombre, contacto)
        `)
        .or(`codigo.ilike.%${partialCode}%,nombre.ilike.%${partialCode}%`)
        .eq('activo', true)
        .limit(5);

      if (error) {
        console.error('❌ Error buscando productos similares:', error);
        return [];
      }

      return data?.map(item => this.mapToBarcodeProduct(item)) || [];

    } catch (error) {
      console.error('❌ Error en findSimilarProducts:', error);
      return [];
    }
  }

  /**
   * Registrar movimiento de inventario
   */
  async recordInventoryMovement(movement: Omit<InventoryMovement, 'id' | 'created_at'>): Promise<boolean> {
    try {
      console.log('📝 Registrando movimiento de inventario:', movement);

      const { error } = await supabase
        .from(this.movementsTable)
        .insert({
          ...movement,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Error registrando movimiento:', error);
        return false;
      }

      // Actualizar stock del producto
      await this.updateProductStock(
        movement.producto_id,
        movement.cantidad_nueva,
        movement.tipo
      );

      console.log('✅ Movimiento registrado exitosamente');
      return true;

    } catch (error) {
      console.error('❌ Error en recordInventoryMovement:', error);
      return false;
    }
  }

  /**
   * Actualizar stock de producto
   */
  async updateProductStock(productId: string, newStock: number, movementType: string): Promise<boolean> {
    try {
      console.log('📦 Actualizando stock del producto:', productId, 'Nuevo stock:', newStock);

      const { error } = await supabase
        .from(this.table)
        .update({
          stock_disponible: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (error) {
        console.error('❌ Error actualizando stock:', error);
        return false;
      }

      console.log('✅ Stock actualizado exitosamente');
      return true;

    } catch (error) {
      console.error('❌ Error en updateProductStock:', error);
      return false;
    }
  }

  /**
   * Procesar entrada de inventario por código de barras
   */
  async processInventoryEntry(
    barcode: string,
    quantity: number,
    userId: string,
    supplier?: string,
    batch?: string,
    expirationDate?: string,
    cost?: number,
    location?: string
  ): Promise<BarcodeScanResult> {
    try {
      console.log('📥 Procesando entrada de inventario:', { barcode, quantity });

      // Buscar producto
      const scanResult = await this.findProductByBarcode(barcode);
      
      if (!scanResult.success || !scanResult.product) {
        return scanResult;
      }

      const product = scanResult.product;
      const newStock = product.stock_disponible + quantity;

      // Registrar movimiento
      const movement: Omit<InventoryMovement, 'id' | 'created_at'> = {
        producto_id: product.id,
        tipo: 'entrada',
        cantidad: quantity,
        cantidad_anterior: product.stock_disponible,
        cantidad_nueva: newStock,
        motivo: 'Entrada por código de barras',
        usuario_id: userId,
        ubicacion_destino: location || product.ubicacion,
        lote: batch,
        fecha_vencimiento: expirationDate,
        costo_unitario: cost || product.precio_compra,
        total_costo: (cost || product.precio_compra) * quantity,
        observaciones: `Entrada automática por código de barras: ${barcode}`
      };

      const movementRecorded = await this.recordInventoryMovement(movement);

      if (!movementRecorded) {
        return {
          success: false,
          error: 'Error registrando movimiento de inventario',
          timestamp: new Date()
        };
      }

      // Actualizar producto con nuevo stock
      const updatedProduct = {
        ...product,
        stock_disponible: newStock
      };

      return {
        success: true,
        product: updatedProduct,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Error en processInventoryEntry:', error);
      return {
        success: false,
        error: 'Error procesando entrada de inventario',
        timestamp: new Date()
      };
    }
  }

  /**
   * Procesar salida de inventario por código de barras
   */
  async processInventoryExit(
    barcode: string,
    quantity: number,
    userId: string,
    reason: string,
    location?: string
  ): Promise<BarcodeScanResult> {
    try {
      console.log('📤 Procesando salida de inventario:', { barcode, quantity });

      // Buscar producto
      const scanResult = await this.findProductByBarcode(barcode);
      
      if (!scanResult.success || !scanResult.product) {
        return scanResult;
      }

      const product = scanResult.product;

      // Verificar stock disponible
      if (product.stock_disponible < quantity) {
        return {
          success: false,
          error: `Stock insuficiente. Disponible: ${product.stock_disponible}, Solicitado: ${quantity}`,
          product,
          timestamp: new Date()
        };
      }

      const newStock = product.stock_disponible - quantity;

      // Registrar movimiento
      const movement: Omit<InventoryMovement, 'id' | 'created_at'> = {
        producto_id: product.id,
        tipo: 'salida',
        cantidad: quantity,
        cantidad_anterior: product.stock_disponible,
        cantidad_nueva: newStock,
        motivo: reason,
        usuario_id: userId,
        ubicacion_origen: location || product.ubicacion,
        observaciones: `Salida automática por código de barras: ${barcode}`
      };

      const movementRecorded = await this.recordInventoryMovement(movement);

      if (!movementRecorded) {
        return {
          success: false,
          error: 'Error registrando movimiento de inventario',
          timestamp: new Date()
        };
      }

      // Actualizar producto con nuevo stock
      const updatedProduct = {
        ...product,
        stock_disponible: newStock
      };

      return {
        success: true,
        product: updatedProduct,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Error en processInventoryExit:', error);
      return {
        success: false,
        error: 'Error procesando salida de inventario',
        timestamp: new Date()
      };
    }
  }

  /**
   * Obtener historial de movimientos de un producto
   */
  async getProductMovementHistory(productId: string, limit: number = 50): Promise<InventoryMovement[]> {
    try {
      const { data, error } = await supabase
        .from(this.movementsTable)
        .select('*')
        .eq('producto_id', productId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error obteniendo historial de movimientos:', error);
        return [];
      }

      return data || [];

    } catch (error) {
      console.error('❌ Error en getProductMovementHistory:', error);
      return [];
    }
  }

  /**
   * Obtener productos con stock bajo
   */
  async getLowStockProducts(): Promise<BarcodeProduct[]> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select(`
          *,
          categorias(nombre, descripcion),
          proveedores(nombre, contacto)
        `)
        .eq('activo', true)
        .lte('stock_disponible', 'stock_minimo');

      if (error) {
        console.error('❌ Error obteniendo productos con stock bajo:', error);
        return [];
      }

      return data?.map(item => this.mapToBarcodeProduct(item)) || [];

    } catch (error) {
      console.error('❌ Error en getLowStockProducts:', error);
      return [];
    }
  }

  /**
   * Generar código de barras para producto
   */
  generateBarcode(product: BarcodeProduct): string {
    // En producción, esto podría generar códigos únicos basados en reglas de negocio
    return product.codigo || `QPH${product.id.slice(-8).toUpperCase()}`;
  }

  /**
   * Validar formato de código de barras
   */
  validateBarcodeFormat(barcode: string, format: string): boolean {
    const patterns = {
      'CODE128': /^[A-Za-z0-9]+$/,
      'EAN13': /^\d{13}$/,
      'EAN8': /^\d{8}$/,
      'UPC': /^\d{12}$/,
      'CODE39': /^[A-Z0-9\-\.\s\$\/\+\%]+$/
    };

    const pattern = patterns[format as keyof typeof patterns];
    return pattern ? pattern.test(barcode) : false;
  }

  // Métodos privados

  private mapToBarcodeProduct(data: any): BarcodeProduct {
    return {
      id: data.id,
      codigo: data.codigo,
      nombre: data.nombre,
      descripcion: data.descripcion,
      categoria: data.categorias?.nombre || data.categoria,
      marca: data.marca,
      precio_compra: data.precio_compra || 0,
      precio_venta: data.precio_venta || 0,
      stock_disponible: data.stock_disponible || 0,
      stock_minimo: data.stock_minimo || 0,
      ubicacion: data.ubicacion || 'Sin ubicación',
      proveedor: data.proveedores?.nombre || data.proveedor || 'Sin proveedor',
      fecha_vencimiento: data.fecha_vencimiento,
      lote: data.lote,
      estado: data.activo ? 'activo' : 'inactivo',
      imagen_url: data.imagen_url,
      barcode_format: data.barcode_format || 'CODE128',
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }
}

export const barcodeInventoryService = new BarcodeInventoryService();




