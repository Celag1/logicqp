// Base de datos local simple para desarrollo
interface LocalDatabase {
  profiles: Map<string, any>;
  users: Map<string, any>;
}

class LocalDatabaseManager {
  private db: LocalDatabase;

  constructor() {
    this.db = {
      profiles: new Map(),
      users: new Map()
    };
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Crear usuario de prueba por defecto
    const defaultUser = {
      id: 'dev-user-1',
      email: 'admin@logicqp.com',
      password: 'admin123',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const defaultProfile = {
      id: 'dev-user-1',
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

    this.db.users.set(defaultUser.id, defaultUser);
    this.db.profiles.set(defaultProfile.id, defaultProfile);
  }

  // Métodos para perfiles
  async getProfile(id: string) {
    return this.db.profiles.get(id) || null;
  }

  async updateProfile(id: string, updates: any) {
    const existing = this.db.profiles.get(id);
    if (!existing) {
      throw new Error('Perfil no encontrado');
    }

    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.db.profiles.set(id, updated);
    return updated;
  }

  async createProfile(profile: any) {
    this.db.profiles.set(profile.id, profile);
    return profile;
  }

  // Métodos para usuarios
  async getUser(id: string) {
    return this.db.users.get(id) || null;
  }

  async getUserByEmail(email: string) {
    for (const user of this.db.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async createUser(user: any) {
    this.db.users.set(user.id, user);
    return user;
  }

  // Métodos de autenticación
  async authenticateUser(email: string, password: string) {
    const user = await this.getUserByEmail(email);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }
}

// Instancia singleton
export const localDB = new LocalDatabaseManager();



