import { supabase } from '@/lib/supabase/client';

export interface Notification {
  id: number;
  usuario_id: string;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'warning' | 'error' | 'success';
  leida: boolean;
  created_at: string;
}

export interface RealtimeNotification {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
}

export class RealtimeNotificationService {
  private static instance: RealtimeNotificationService;
  private subscriptions: Map<string, any> = new Map();
  private listeners: Map<string, (notification: RealtimeNotification) => void> = new Map();

  private constructor() {}

  public static getInstance(): RealtimeNotificationService {
    if (!RealtimeNotificationService.instance) {
      RealtimeNotificationService.instance = new RealtimeNotificationService();
    }
    return RealtimeNotificationService.instance;
  }

  // Suscribirse a notificaciones en tiempo real
  public subscribeToNotifications(userId: string, callback: (notification: RealtimeNotification) => void): string {
    const subscriptionId = `notifications_${userId}_${Date.now()}`;
    
    console.log('🔔 Suscribiéndose a notificaciones para usuario:', userId);

    const subscription = supabase
      .channel(`notifications_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificaciones',
          filter: `usuario_id=eq.${userId}`
        },
        (payload) => {
          console.log('🔔 Nueva notificación recibida:', payload);
          
          const notification: RealtimeNotification = {
            id: payload.new.id,
            titulo: payload.new.titulo,
            mensaje: payload.new.mensaje,
            tipo: payload.new.tipo,
            timestamp: payload.new.created_at
          };

          callback(notification);
        }
      )
      .subscribe();

    this.subscriptions.set(subscriptionId, subscription);
    this.listeners.set(subscriptionId, callback);

    return subscriptionId;
  }

  // Desuscribirse de notificaciones
  public unsubscribeFromNotifications(subscriptionId: string): void {
    console.log('🔔 Desuscribiéndose de notificaciones:', subscriptionId);

    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionId);
      this.listeners.delete(subscriptionId);
    }
  }

  // Crear notificación
  public async createNotification(
    userId: string,
    titulo: string,
    mensaje: string,
    tipo: 'info' | 'warning' | 'error' | 'success' = 'info'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔔 Creando notificación:', { userId, titulo, tipo });

      const { error } = await supabase
        .from('notificaciones')
        .insert([{
          usuario_id: userId,
          titulo,
          mensaje,
          tipo,
          leida: false
        }]);

      if (error) {
        console.error('❌ Error creando notificación:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Notificación creada exitosamente');
      return { success: true };
    } catch (error) {
      console.error('❌ Error en createNotification:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  // Obtener notificaciones del usuario
  public async getUserNotifications(userId: string, limit: number = 50): Promise<{ notifications?: Notification[]; error?: string }> {
    try {
      console.log('🔔 Obteniendo notificaciones para usuario:', userId);

      const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('usuario_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error obteniendo notificaciones:', error);
        return { error: error.message };
      }

      console.log(`✅ ${data?.length || 0} notificaciones obtenidas`);
      return { notifications: data as Notification[] };
    } catch (error) {
      console.error('❌ Error en getUserNotifications:', error);
      return { error: 'Error interno del servidor' };
    }
  }

  // Marcar notificación como leída
  public async markAsRead(notificationId: number): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔔 Marcando notificación como leída:', notificationId);

      const { error } = await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('id', notificationId);

      if (error) {
        console.error('❌ Error marcando notificación como leída:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Notificación marcada como leída');
      return { success: true };
    } catch (error) {
      console.error('❌ Error en markAsRead:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  // Marcar todas las notificaciones como leídas
  public async markAllAsRead(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔔 Marcando todas las notificaciones como leídas para usuario:', userId);

      const { error } = await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('usuario_id', userId)
        .eq('leida', false);

      if (error) {
        console.error('❌ Error marcando todas las notificaciones como leídas:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Todas las notificaciones marcadas como leídas');
      return { success: true };
    } catch (error) {
      console.error('❌ Error en markAllAsRead:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  // Obtener contador de notificaciones no leídas
  public async getUnreadCount(userId: string): Promise<{ count: number; error?: string }> {
    try {
      console.log('🔔 Obteniendo contador de notificaciones no leídas para usuario:', userId);

      const { count, error } = await supabase
        .from('notificaciones')
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', userId)
        .eq('leida', false);

      if (error) {
        console.error('❌ Error obteniendo contador de notificaciones no leídas:', error);
        return { count: 0, error: error.message };
      }

      console.log(`✅ ${count || 0} notificaciones no leídas`);
      return { count: count || 0 };
    } catch (error) {
      console.error('❌ Error en getUnreadCount:', error);
      return { count: 0, error: 'Error interno del servidor' };
    }
  }

  // Crear notificación de stock bajo
  public async createLowStockNotification(
    userId: string,
    productName: string,
    currentStock: number,
    minStock: number
  ): Promise<{ success: boolean; error?: string }> {
    const titulo = '⚠️ Stock Bajo';
    const mensaje = `El producto ${productName} tiene stock bajo: ${currentStock}/${minStock} unidades`;
    
    return await this.createNotification(userId, titulo, mensaje, 'warning');
  }

  // Crear notificación de nueva venta
  public async createNewSaleNotification(
    userId: string,
    saleId: number,
    total: number,
    clientName: string
  ): Promise<{ success: boolean; error?: string }> {
    const titulo = '💰 Nueva Venta';
    const mensaje = `Nueva venta #${saleId} por $${total.toFixed(2)} - Cliente: ${clientName}`;
    
    return await this.createNotification(userId, titulo, mensaje, 'success');
  }

  // Crear notificación de cambio de rol
  public async createRoleChangeNotification(
    userId: string,
    newRole: string,
    adminName: string
  ): Promise<{ success: boolean; error?: string }> {
    const titulo = '👤 Cambio de Rol';
    const mensaje = `Tu rol ha sido cambiado a ${newRole} por ${adminName}`;
    
    return await this.createNotification(userId, titulo, mensaje, 'info');
  }

  // Crear notificación de sistema
  public async createSystemNotification(
    userId: string,
    titulo: string,
    mensaje: string,
    tipo: 'info' | 'warning' | 'error' | 'success' = 'info'
  ): Promise<{ success: boolean; error?: string }> {
    return await this.createNotification(userId, titulo, mensaje, tipo);
  }

  // Limpiar todas las suscripciones
  public cleanup(): void {
    console.log('🔔 Limpiando todas las suscripciones...');
    
    this.subscriptions.forEach((subscription, id) => {
      subscription.unsubscribe();
    });
    
    this.subscriptions.clear();
    this.listeners.clear();
  }
}

// Exportar instancia singleton
export const realtimeNotificationService = RealtimeNotificationService.getInstance();



