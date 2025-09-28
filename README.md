# 🏥 LogicQP - Sistema de Gestión Farmacéutica

Sistema completo de gestión para laboratorios farmacéuticos desarrollado con Next.js 14, Supabase y TypeScript.

## 🚀 Características Principales

- **Gestión de Inventario** - Control completo de productos farmacéuticos
- **Ventas Online** - Tienda virtual integrada con carrito de compras
- **Gestión de Usuarios** - Sistema de roles y permisos
- **Reportes Avanzados** - Análisis de ventas e inventario
- **Autenticación Segura** - Login con Supabase Auth
- **Responsive Design** - Optimizado para móviles y desktop

## 🛠️ Tecnologías

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Base de Datos:** PostgreSQL con RLS
- **Despliegue:** Vercel + Supabase Cloud

## 📦 Instalación

### Prerrequisitos
- Node.js 18+
- pnpm
- Supabase CLI

### Desarrollo Local

1. **Clonar repositorio**
```bash
git clone https://github.com/tu-usuario/logicqp.git
cd logicqp
```

2. **Instalar dependencias**
```bash
pnpm install
```

3. **Configurar Supabase Local**
```bash
cd supabase
npx supabase start
```

4. **Configurar variables de entorno**
```bash
cp env.example .env.local
# Editar .env.local con tus credenciales
```

5. **Ejecutar migraciones**
```bash
npx supabase db reset
```

6. **Iniciar aplicación**
```bash
pnpm dev
```

## 🔧 Configuración

### Variables de Entorno

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Email
EMAIL_SMTP_USER=tu-email@gmail.com
EMAIL_SMTP_PASS=tu-app-password

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📊 Base de Datos

### Tablas Principales
- `profiles` - Usuarios del sistema
- `productos` - Catálogo de productos
- `categorias` - Categorías de productos
- `lotes` - Control de lotes
- `ventas` - Registro de ventas
- `inventario` - Control de stock

### Usuarios por Defecto
- **Super Admin:** celag3@gmail.com / Ibot1801538719
- **Administrador:** Wormandrade@gmail.com / admin123

## 🚀 Despliegue

### Supabase Cloud
1. Crear proyecto en [Supabase](https://supabase.com)
2. Ejecutar migraciones desde `supabase/migrations/`
3. Configurar autenticación

### Vercel
1. Conectar repositorio en [Vercel](https://vercel.com)
2. Configurar variables de entorno
3. Desplegar

## 📱 Funcionalidades

### Para Administradores
- Gestión completa de usuarios
- Control de inventario
- Reportes avanzados
- Configuración del sistema

### Para Vendedores
- Procesamiento de ventas
- Consulta de inventario
- Gestión de clientes

### Para Clientes
- Catálogo de productos
- Carrito de compras
- Historial de pedidos

## 🔒 Seguridad

- Autenticación con Supabase Auth
- Row Level Security (RLS)
- Validación de datos
- Cifrado de contraseñas

## 📈 Monitoreo

- Logs de Supabase
- Analytics de Vercel
- Métricas de rendimiento

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 📞 Soporte

Para soporte técnico, contactar a:
- Email: celag3@gmail.com
- Teléfono: +593 99 876 9259

---

**Desarrollado con ❤️ para Qualipharm Laboratorio Farmacéutico**