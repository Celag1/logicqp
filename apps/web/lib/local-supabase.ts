// Simulador de Supabase local para desarrollo
interface LocalSupabaseResponse<T> {
  data: T | null;
  error: any;
}

interface LocalSupabaseClient {
  auth: {
    signInWithPassword: (credentials: { email: string; password: string }) => Promise<LocalSupabaseResponse<{ user: any }>>;
    signUp: (credentials: { email: string; password: string }) => Promise<LocalSupabaseResponse<{ user: any }>>;
    signOut: () => Promise<LocalSupabaseResponse<void>>;
    getSession: () => Promise<LocalSupabaseResponse<{ session: any }>>;
    onAuthStateChange: (callback: (event: string, session: any) => void) => { data: { subscription: { unsubscribe: () => void } } };
  };
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: any) => {
        single: () => Promise<LocalSupabaseResponse<any>>;
      };
    };
    update: (data: any) => {
      eq: (column: string, value: any) => Promise<LocalSupabaseResponse<any>>;
    };
    insert: (data: any) => Promise<LocalSupabaseResponse<any>>;
  };
}

// Base de datos local en memoria
class LocalDatabase {
  private profiles: Map<string, any> = new Map();
  private users: Map<string, any> = new Map();
  private sessions: Map<string, any> = new Map();

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Usuario administrador por defecto
    const adminUser = {
      id: 'admin-1',
      email: 'admin@logicqp.com',
      password: 'admin123',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const adminProfile = {
      id: 'admin-1',
      email: 'admin@logicqp.com',
      nombre: 'Administrador',
      apellido: 'LogicQP',
      rol: 'super_admin',
      telefono: '+1234567890',
      direccion: 'Calle Principal 123',
      empresa: 'LogicQP',
      email_verificado: true,
      telefono_verificado: true,
      foto_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.users.set(adminUser.id, adminUser);
    this.profiles.set(adminProfile.id, adminProfile);
  }

  // Métodos para autenticación
  async authenticateUser(email: string, password: string) {
    for (const user of Array.from(this.users.values())) {
      if (user.email === email && user.password === password) {
        return user;
      }
    }
    return null;
  }

  async createUser(userData: any) {
    this.users.set(userData.id, userData);
    return userData;
  }

  async getUserById(id: string) {
    return this.users.get(id) || null;
  }

  // Métodos para perfiles
  async getProfile(id: string) {
    return this.profiles.get(id) || null;
  }

  async updateProfile(id: string, updates: any) {
    const existing = this.profiles.get(id);
    if (!existing) {
      throw new Error('Perfil no encontrado');
    }

    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.profiles.set(id, updated);
    return updated;
  }

  async createProfile(profileData: any) {
    this.profiles.set(profileData.id, profileData);
    return profileData;
  }

  // Métodos para sesiones
  async createSession(userId: string) {
    const sessionId = `session-${Date.now()}`;
    const session = {
      id: sessionId,
      user_id: userId,
      created_at: new Date().toISOString()
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  async getSession(sessionId: string) {
    return this.sessions.get(sessionId) || null;
  }

  async deleteSession(sessionId: string) {
    this.sessions.delete(sessionId);
  }
}

const localDB = new LocalDatabase();

// Cliente Supabase local simulado
export const localSupabase: LocalSupabaseClient = {
  auth: {
    async signInWithPassword({ email, password }) {
      try {
        console.log('🔑 Local Supabase: Intentando login con', email);
        
        const user = await localDB.authenticateUser(email, password);
        if (!user) {
          return { data: null, error: { message: 'Credenciales inválidas' } };
        }

        const session = await localDB.createSession(user.id);
        console.log('✅ Local Supabase: Login exitoso para', user.email);
        
        return { data: { user: { ...user, session } }, error: null };
      } catch (error) {
        console.error('❌ Local Supabase: Error en login:', error);
        return { data: null, error };
      }
    },

    async signUp({ email, password }) {
      try {
        console.log('📝 Local Supabase: Intentando registro con', email);
        
        const userId = `user-${Date.now()}`;
        const userData = {
          id: userId,
          email,
          password,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const user = await localDB.createUser(userData);
        
        // Crear perfil básico
        const profileData = {
          id: userId,
          email,
          nombre: email.split('@')[0] || 'Usuario',
          apellido: '',
          rol: 'cliente',
          telefono: '',
          direccion: '',
          empresa: '',
          email_verificado: false,
          telefono_verificado: false,
          foto_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        await localDB.createProfile(profileData);
        
        console.log('✅ Local Supabase: Registro exitoso para', email);
        return { data: { user }, error: null };
      } catch (error) {
        console.error('❌ Local Supabase: Error en registro:', error);
        return { data: null, error };
      }
    },

    async signOut() {
      try {
        console.log('🚪 Local Supabase: Cerrando sesión');
        // En una implementación real, aquí se limpiaría la sesión
        return { data: undefined, error: null };
      } catch (error) {
        console.error('❌ Local Supabase: Error en logout:', error);
        return { data: null, error };
      }
    },

    async getSession() {
      try {
        // En una implementación real, aquí se obtendría la sesión actual
        return { data: { session: null }, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    onAuthStateChange(callback) {
      // En una implementación real, aquí se configuraría el listener
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      };
    }
  },

  from(table: string) {
    return {
      select(columns: string) {
        return {
          eq(column: string, value: any) {
            return {
              async single(): Promise<LocalSupabaseResponse<any>> {
                try {
                  console.log(`🔍 Local Supabase: Consultando ${table} donde ${column} = ${value}`);
                  
                  if (table === 'profiles') {
                    const profile = await localDB.getProfile(value);
                    return { data: profile, error: profile ? null : { message: 'Perfil no encontrado' } };
                  }
                  
                  return { data: null, error: { message: 'Tabla no encontrada' } };
                } catch (error) {
                  console.error(`❌ Local Supabase: Error consultando ${table}:`, error);
                  return { data: null, error };
                }
              }
            };
          }
        };
      },

      update(data: any) {
        return {
          eq: async (column: string, value: any): Promise<LocalSupabaseResponse<any>> => {
            try {
              console.log(`💾 Local Supabase: Actualizando ${table} donde ${column} = ${value}`);
              
              if (table === 'profiles') {
                const updated = await localDB.updateProfile(value, data);
                return { data: updated, error: null };
              }
              
              return { data: null, error: { message: 'Tabla no encontrada' } };
            } catch (error) {
              console.error(`❌ Local Supabase: Error actualizando ${table}:`, error);
              return { data: null, error };
            }
          }
        };
      },

      async insert(data: any): Promise<LocalSupabaseResponse<any>> {
        try {
          console.log(`➕ Local Supabase: Insertando en ${table}`);
          
          if (table === 'profiles') {
            const created = await localDB.createProfile(data);
            return { data: created, error: null };
          }
          
          return { data: null, error: { message: 'Tabla no encontrada' } };
        } catch (error) {
          console.error(`❌ Local Supabase: Error insertando en ${table}:`, error);
          return { data: null, error };
        }
      }
    };
  }
};

console.log('🏠 Local Supabase inicializado correctamente');



