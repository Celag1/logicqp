# 🚀 LogicQP - Sistema de Gestión Farmacéutica

## 📋 Descripción

LogicQP es un sistema completo de gestión farmacéutica construido con **Next.js 14**, **Supabase** y **TypeScript**. Incluye gestión de inventario, ventas, usuarios, reportes y análisis en tiempo real.

## ✨ Características Principales

### 🔐 **Sistema de Autenticación**
- Login/Registro con Supabase Auth
- Verificación de email obligatoria
- 6 roles con permisos granulares
- Row Level Security (RLS) implementado

### 🏪 **Gestión de Inventario**
- Control de stock con trazabilidad FEFO
- Alertas de stock bajo y vencimientos
- Gestión de proveedores
- Códigos de barras y escaneo

### 🛒 **E-commerce Integrado**
- Catálogo de productos con filtros avanzados
- Carrito de compras persistente (Zustand)
- Sistema de pedidos y facturación
- Gestión de clientes

### 📊 **Dashboard Inteligente**
- Métricas en tiempo real
- Gráficas interactivas (Chart.js)
- Reportes personalizables
- Insights de IA

### 👥 **Gestión de Usuarios**
- **Super Admin**: Control total del sistema
- **Administrador**: Gestión de usuarios y configuración
- **Vendedor**: Ventas y atención al cliente
- **Inventario**: Control de stock y compras
- **Contable**: Reportes financieros
- **Cliente**: Acceso al catálogo y pedidos

## 🛠️ Tecnologías Utilizadas

### **Frontend**
- **Next.js 14** con App Router
- **TypeScript** estricto
- **Tailwind CSS** + **shadcn/ui**
- **Zustand** para estado global
- **TanStack Query** para datos
- **React Hook Form** + **Zod**

### **Backend**
- **Supabase** (PostgreSQL)
- **Row Level Security (RLS)**
- **Funciones RPC** personalizadas
- **Triggers** para auditoría
- **Vistas materializadas**

### **Herramientas**
- **ESLint** + **Prettier**
- **Husky** para git hooks
- **Vitest** para testing
- **PWA** ready

## 🚀 Instalación y Configuración

### 1. **Clonar el Repositorio**
```bash
git clone <tu-repositorio>
cd logicqp
```

### 2. **Instalar Dependencias**
```bash
pnpm install
```

### 3. **Configurar Variables de Entorno**
```bash
cd apps/web
cp env.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

### 4. **Configurar Base de Datos**
Ejecuta los scripts SQL en `supabase/migrations/` en tu proyecto de Supabase:

1. `000_complete_schema.sql` - Esquema completo
2. `001_functions_views.sql` - Funciones y vistas
3. `010_rls.sql` - Políticas de seguridad
4. `020_functions.sql` - Funciones RPC
5. `030_views.sql` - Vistas materializadas

### 5. **Ejecutar la Aplicación**
```bash
# Desarrollo
pnpm dev

# Construcción
pnpm build

# Producción
pnpm start
```

## 📁 Estructura del Proyecto

```
apps/web/
├── app/                    # App Router de Next.js 14
│   ├── admin/             # Panel de administración
│   ├── catalogo/          # Catálogo de productos
│   ├── dashboard/         # Dashboard principal
│   ├── inventario/        # Gestión de inventario
│   ├── login/             # Autenticación
│   └── register/          # Registro de usuarios
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes de shadcn/ui
│   ├── navigation.tsx    # Navegación principal
│   └── ai-assistant.tsx  # Asistente de IA
├── hooks/                # Hooks personalizados
│   ├── useAuth.ts        # Autenticación
│   ├── useCart.ts        # Carrito de compras
│   └── useToast.ts       # Notificaciones
├── lib/                  # Utilidades y servicios
│   ├── supabase/         # Cliente de Supabase
│   ├── services/         # Servicios de API
│   └── utils.ts          # Funciones utilitarias
└── types/                # Definiciones de TypeScript
```

## 🔧 Configuración de Supabase

### 1. **Crear Proyecto**
- Ve a [supabase.com](https://supabase.com)
- Crea un nuevo proyecto
- Anota la URL y las claves

### 2. **Configurar Base de Datos**
```sql
-- Ejecutar en el SQL Editor de Supabase
\i supabase/migrations/000_complete_schema.sql
\i supabase/migrations/001_functions_views.sql
\i supabase/migrations/010_rls.sql
\i supabase/migrations/020_functions.sql
\i supabase/migrations/030_views.sql
```

### 3. **Configurar RLS**
```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
-- ... (ver archivo 010_rls.sql)
```

### 4. **Insertar Datos de Prueba**
```sql
-- Usuarios de prueba
\i supabase/seed/seed_data.sql
```

## 🧪 Testing

```bash
# Ejecutar tests
pnpm test

# Tests con UI
pnpm test:ui

# Cobertura
pnpm test:coverage
```

## 📱 PWA

La aplicación está configurada como PWA con:
- Manifest personalizado
- Service Worker
- Instalación offline
- Notificaciones push

## 🚀 Despliegue

### **Vercel (Recomendado)**
```bash
# Conectar repositorio a Vercel
# Configurar variables de entorno
# Deploy automático en push
```

### **Netlify**
```bash
# Conectar repositorio a Netlify
# Configurar build command: pnpm build
# Configurar publish directory: .next
```

### **Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔒 Seguridad

- **Row Level Security (RLS)** en todas las tablas
- **Autenticación JWT** con Supabase
- **Validación de datos** con Zod
- **Sanitización de inputs** automática
- **Rate limiting** configurado

## 📊 Monitoreo

- **Logs estructurados** con Winston
- **Métricas de performance** con Next.js Analytics
- **Error tracking** con Sentry (opcional)
- **Health checks** automáticos

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

- **Documentación**: [docs.logicqp.com](https://docs.logicqp.com)
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/logicqp/issues)
- **Discord**: [Servidor de la comunidad](https://discord.gg/logicqp)

## 🙏 Agradecimientos

- **Supabase** por la infraestructura backend
- **shadcn/ui** por los componentes
- **Vercel** por el hosting y deployment
- **Comunidad Next.js** por el framework

---

**Desarrollado con ❤️ por el equipo LogicQP**

