# 🚀 LogicQP - Sistema Farmacéutico Inteligente

**La farmacia del futuro con inteligencia artificial avanzada, gestión inteligente de inventario y asistente farmacéutico IA**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.0-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)

## 🌟 Características Revolucionarias

### 🤖 **Inteligencia Artificial Avanzada**
- **Asistente IA Farmacéutico** - Chatbot inteligente 24/7
- **Predicción de Demanda** - Análisis predictivo con IA
- **Optimización de Inventario** - Recomendaciones automáticas
- **Búsqueda Inteligente** - Filtrado semántico avanzado

### 📱 **Aplicación Web Progresiva (PWA)**
- **Instalable como app nativa** en dispositivos móviles
- **Funcionamiento offline** con cache inteligente
- **Notificaciones push** en tiempo real
- **Acceso rápido** con shortcuts personalizados

### 🔐 **Sistema de Seguridad Avanzado**
- **Control de acceso granular** por roles
- **Auditoría completa** de todas las acciones
- **Cumplimiento normativo** farmacéutico
- **Verificación de email** para clientes

### 📊 **Dashboard Inteligente**
- **Métricas en tiempo real** con KPIs avanzados
- **Gráficas interactivas** para análisis de ventas
- **Alertas automáticas** de stock crítico
- **Insights de IA** para toma de decisiones

## 🏗️ Arquitectura del Sistema

### **Frontend Stack**
- **Next.js 14** - Framework React con App Router
- **TypeScript 5.3** - Tipado estático avanzado
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Componentes UI modernos y accesibles
- **Zustand** - Gestión de estado ligera
- **TanStack Query** - Cache y sincronización de datos
- **React Hook Form** - Gestión de formularios
- **Zod** - Validación de esquemas
- **Framer Motion** - Animaciones fluidas

### **Backend Stack**
- **Supabase** - Backend-as-a-Service completo
- **PostgreSQL** - Base de datos relacional
- **Row Level Security (RLS)** - Seguridad a nivel de fila
- **Edge Functions** - Funciones serverless
- **Storage** - Almacenamiento de archivos
- **Auth** - Sistema de autenticación

### **Base de Datos**
- **30+ productos farmacéuticos** con datos realistas
- **15 categorías** médicas especializadas
- **21 proveedores** del sector farmacéutico
- **Sistema de lotes** con trazabilidad FEFO
- **Auditoría completa** de transacciones

## 🚀 Instalación Local

### **Prerrequisitos**
- Node.js 18+ 
- pnpm 8+
- Git

### **1. Clonar el Repositorio**
```bash
git clone https://github.com/tu-usuario/logicqp.git
cd logicqp
```

### **2. Instalar Dependencias**
```bash
# Instalar pnpm globalmente si no lo tienes
npm install -g pnpm

# Instalar dependencias del monorepo
pnpm install
```

### **3. Configurar Variables de Entorno**
```bash
cd apps/web
cp .env.example .env.local
```

Editar `.env.local` con tus credenciales de Supabase:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=LogicQP
NEXT_PUBLIC_APP_VERSION=1.0.0

# AI Configuration (Opcional)
OPENAI_API_KEY=tu_openai_key
GOOGLE_AI_API_KEY=tu_google_ai_key

# Image Search APIs (Opcional)
CLOUDINARY_CLOUD_NAME=tu_cloudinary_name
CLOUDINARY_API_KEY=tu_cloudinary_key
CLOUDINARY_API_SECRET=tu_cloudinary_secret

# Timezone
TZ=America/Guayaquil
```

### **4. Configurar Supabase**
```bash
cd ../../supabase

# Ejecutar en el SQL Editor de Supabase Dashboard:
# 1. 000_complete_schema.sql
# 2. 001_functions_views.sql
# 3. seed_data.sql
```

### **5. Ejecutar la Aplicación**
```bash
cd ../apps/web
pnpm dev
```

La aplicación estará disponible en: http://localhost:3000

## 🌐 Despliegue en Vercel

### **1. Conectar con GitHub**
- Ve a [Vercel](https://vercel.com)
- Conecta tu repositorio de GitHub
- Selecciona el repositorio `logicqp`

### **2. Configurar Variables de Entorno**
En Vercel Dashboard, agrega las mismas variables de `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- Otras variables según necesites

### **3. Configurar Build Settings**
```bash
# Build Command
pnpm build

# Output Directory
.next

# Install Command
pnpm install
```

### **4. Desplegar**
- Vercel detectará automáticamente que es un monorepo
- Selecciona la carpeta `apps/web` como root
- Haz click en "Deploy"

## 🧪 Usuarios de Prueba

### **Super Administrador**
- **Email:** superadmin@logicqp.ec
- **Password:** LogicQP*2025
- **Acceso:** 100% del sistema

### **Administrador**
- **Email:** admin@logicqp.ec
- **Password:** LogicQP*2025
- **Acceso:** Todo excepto configuración de empresa

### **Vendedor**
- **Email:** vendedor@logicqp.ec
- **Password:** LogicQP*2025
- **Acceso:** Ventas, catálogo, clientes

### **Inventario**
- **Email:** inventario@logicqp.ec
- **Password:** LogicQP*2025
- **Acceso:** Gestión de stock, compras, lotes

### **Contable**
- **Email:** contable@logicqp.ec
- **Password:** LogicQP*2025
- **Acceso:** Reportes, finanzas, auditoría

### **Cliente**
- **Email:** cliente@logicqp.ec
- **Password:** LogicQP*2025
- **Acceso:** Catálogo, carrito, órdenes

## 📱 Funcionalidades PWA

### **Instalación**
- **Chrome/Edge:** Icono de instalación en la barra de direcciones
- **Safari:** Botón "Compartir" → "Añadir a pantalla de inicio"
- **Android:** Notificación de instalación automática

### **Características Offline**
- **Cache inteligente** de páginas visitadas
- **Funcionamiento básico** sin conexión
- **Sincronización automática** al reconectar

### **Accesos Directos**
- **Catálogo** - Explorar productos
- **Dashboard** - Ver métricas
- **Asistente IA** - Consultar chatbot

## 🔧 Desarrollo

### **Estructura del Proyecto**
```
logicqp/
├── apps/
│   └── web/                 # Frontend Next.js
│       ├── app/            # App Router
│       ├── components/     # Componentes UI
│       ├── lib/           # Utilidades
│       └── public/        # Archivos estáticos
├── supabase/               # Backend y base de datos
│   ├── migrations/        # Esquemas SQL
│   ├── seed/             # Datos de prueba
│   └── functions/        # Edge Functions
└── package.json           # Configuración del monorepo
```

### **Comandos Útiles**
```bash
# Desarrollo
pnpm dev                    # Ejecutar en modo desarrollo
pnpm build                 # Construir para producción
pnpm start                 # Ejecutar en modo producción
pnpm lint                  # Verificar código
pnpm type-check           # Verificar tipos TypeScript

# Base de datos
cd supabase
npx supabase start        # Iniciar Supabase local
npx supabase stop         # Detener Supabase local
npx supabase reset        # Resetear base de datos
```

### **Scripts de Base de Datos**
- **`000_complete_schema.sql`** - Esquema completo con RLS
- **`001_functions_views.sql`** - Funciones RPC y vistas
- **`seed_data.sql`** - Datos de prueba realistas
- **`verificacion_final.sql`** - Verificación completa del sistema

## 🚀 Características Avanzadas

### **Sistema de Roles y Permisos**
- **6 roles predefinidos** con permisos granulares
- **Control de acceso por tabla** con RLS
- **Auditoría automática** de todas las acciones
- **Escalabilidad** para nuevos roles

### **Gestión de Inventario Inteligente**
- **Sistema FEFO** (First Expired, First Out)
- **Alertas automáticas** de stock crítico
- **Trazabilidad completa** de lotes
- **Predicción de demanda** con IA

### **E-commerce Integrado**
- **Catálogo avanzado** con filtros inteligentes
- **Carrito de compras** persistente
- **Checkout seguro** con validaciones
- **Historial de órdenes** completo

### **Reportes y Analytics**
- **Dashboard en tiempo real** con métricas clave
- **Gráficas interactivas** para análisis
- **Exportación de datos** en múltiples formatos
- **Insights de IA** para optimización

## 🔒 Seguridad

### **Autenticación y Autorización**
- **Supabase Auth** con múltiples proveedores
- **JWT tokens** seguros
- **Refresh tokens** automáticos
- **Sesiones persistentes**

### **Protección de Datos**
- **Row Level Security (RLS)** en todas las tablas
- **Encriptación** de datos sensibles
- **Auditoría completa** de cambios
- **Cumplimiento GDPR** y normativas locales

### **API Security**
- **Rate limiting** para prevenir abuso
- **Validación de entrada** con Zod
- **Sanitización** de datos
- **CORS** configurado correctamente

## 📊 Monitoreo y Analytics

### **Performance**
- **Core Web Vitals** optimizados
- **Lighthouse Score** 95+
- **Bundle analyzer** integrado
- **Lazy loading** de componentes

### **Error Tracking**
- **Error boundaries** en React
- **Logging centralizado** en Supabase
- **Alertas automáticas** para errores críticos
- **Métricas de usuario** anónimas

## 🌍 Internacionalización

### **Idiomas Soportados**
- **Español (Ecuador)** - Idioma principal
- **Inglés** - Soporte completo
- **Extensible** para otros idiomas

### **Configuración**
- **next-intl** para traducciones
- **Formateo de fechas** localizado
- **Monedas** en USD y EUR
- **Zonas horarias** configurables

## 🤝 Contribución

### **Cómo Contribuir**
1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### **Estándares de Código**
- **TypeScript strict** habilitado
- **ESLint** con reglas personalizadas
- **Prettier** para formateo
- **Husky** con pre-commit hooks

### **Testing**
- **Vitest** para unit tests
- **Testing Library** para componentes
- **Cypress** para E2E tests
- **Coverage** mínimo del 80%

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

### **Documentación**
- [Documentación de la API](https://docs.logicqp.ec)
- [Guía de Usuario](https://help.logicqp.ec)
- [FAQ](https://faq.logicqp.ec)

### **Contacto**
- **Email:** support@logicqp.ec
- **Discord:** [Servidor LogicQP](https://discord.gg/logicqp)
- **GitHub Issues:** [Reportar Bug](https://github.com/tu-usuario/logicqp/issues)

### **Estado del Sistema**
- [Status Page](https://status.logicqp.ec)
- [Uptime Monitor](https://uptime.logicqp.ec)

## 🙏 Agradecimientos

- **Qualipharm Laboratorio Farmacéutico** por la confianza
- **Supabase** por la infraestructura backend
- **Vercel** por el hosting y despliegue
- **Comunidad Next.js** por el framework
- **Contribuidores** que hacen esto posible

---

## 🎯 Roadmap

### **Q1 2024** ✅
- [x] Sistema base completo
- [x] Asistente IA básico
- [x] Dashboard inteligente
- [x] PWA funcional

### **Q2 2024** 🚧
- [ ] Integración con ChatGPT API
- [ ] Análisis predictivo avanzado
- [ ] App móvil nativa
- [ ] Integración con sistemas externos

### **Q3 2024** 📋
- [ ] Machine Learning para inventario
- [ ] Blockchain para trazabilidad
- [ ] API pública para desarrolladores
- [ ] Marketplace de plugins

### **Q4 2024** 🔮
- [ ] IA generativa para reportes
- [ ] Realidad aumentada para inventario
- [ ] Integración con IoT
- [ ] Plataforma multi-tenant

---

**¡Gracias por elegir LogicQP! 🚀**

*Transformando la gestión farmacéutica con tecnología de vanguardia*
