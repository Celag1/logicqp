# 🚀 GUÍA COMPLETA DE DESPLIEGUE EN VERCEL - LOGICQP

## 📋 **PASOS PARA PUBLICAR EN VERCEL**

### **PASO 1: Preparar Repositorio GitHub**
```bash
# Asegurarse de que el código esté en GitHub
git add .
git commit -m "🚀 Preparando para despliegue en Vercel"
git push origin main
```

### **PASO 2: Crear Proyecto en Vercel**
1. **Ir a [vercel.com](https://vercel.com)**
2. **Iniciar sesión** con tu cuenta
3. **Click en "New Project"**
4. **Importar desde GitHub**:
   - Seleccionar repositorio `logicqp`
   - Framework: **Next.js**
   - Root Directory: `apps/web`
   - Build Command: `pnpm build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`

### **PASO 3: Configurar Variables de Entorno**
En la configuración del proyecto, agregar:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://iapixzikdhvghzsjkodu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhcGl4emlrZGh2Z2h6c2prb2R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODg3MDUsImV4cCI6MjA3MjA2NDcwNX0.myVS1ZgYewbf44jUblez3fB_OVAAmj6ddAkpGSGlJe0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhcGl4emlrZGh2Z2h6c2prb2R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQ4ODcwNSwiZXhwIjoyMDcyMDY0NzA1fQ.Z2Z17gPI1rpJNqemEhjpGdsJ9kbzRmTaVgr

# App
NEXT_PUBLIC_APP_NAME=LogicQP
NEXT_PUBLIC_APP_URL=https://logicqp.vercel.app
NEXT_PUBLIC_CURRENCY=USD
NEXT_PUBLIC_TIMEZONE=America/Guayaquil
```

### **PASO 4: Configurar Dominio Personalizado (Opcional)**
1. **Ir a Settings > Domains**
2. **Agregar dominio personalizado**:
   - `logicqp.com` (si lo tienes)
   - `app.logicqp.com`
   - `logicqp.app`

### **PASO 5: Configurar Despliegue Automático**
1. **Settings > Git**
2. **Habilitar "Auto Deploy"**
3. **Branch de producción**: `main`
4. **Previews automáticos** para PRs

### **PASO 6: Configurar Analytics (Opcional)**
1. **Settings > Analytics**
2. **Habilitar Web Analytics**
3. **Configurar eventos personalizados**

## ⚙️ **CONFIGURACIONES AVANZADAS**

### **Regiones de Despliegue**
- **Principal**: `iad1` (US East - Virginia)
- **Fallback**: `sfo1` (US West - San Francisco)

### **Funciones Edge**
- **API Routes**: 30 segundos máximo
- **Middleware**: Optimizado para velocidad

### **Headers de Seguridad**
- **XSS Protection**: Habilitado
- **Content Type Options**: Nosniff
- **Frame Options**: DENY
- **Referrer Policy**: Strict

## 🔍 **VERIFICACIÓN POST-DESPLIEGUE**

### **Checklist de Verificación**
- [ ] **Landing Page** carga correctamente
- [ ] **Dashboard** muestra métricas
- [ ] **Catálogo** lista productos
- [ ] **Autenticación** funciona
- [ ] **PWA** se instala
- [ ] **Responsive** en móviles
- [ ] **Performance** > 90 en Lighthouse

### **URLs de Prueba**
- **Principal**: `https://logicqp.vercel.app`
- **Dashboard**: `https://logicqp.vercel.app/dashboard`
- **Catálogo**: `https://logicqp.vercel.app/catalogo`
- **Login**: `https://logicqp.vercel.app/login`

## 🚨 **SOLUCIÓN DE PROBLEMAS COMUNES**

### **Error: Build Failed**
```bash
# Verificar dependencias
pnpm install
# Limpiar caché
rm -rf .next
# Rebuild
pnpm build
```

### **Error: Environment Variables**
- Verificar que todas las variables estén en Vercel
- No incluir `.env.local` en el repositorio
- Usar `NEXT_PUBLIC_` para variables del cliente

### **Error: Supabase Connection**
- Verificar URL y API keys
- Confirmar que Supabase esté activo
- Verificar políticas RLS

## 🎯 **RESULTADO FINAL**
- **URL de producción**: `https://logicqp.vercel.app`
- **Despliegue automático** en cada push
- **CDN global** para máxima velocidad
- **SSL automático** y seguro
- **Analytics** integrados
- **Monitoreo** en tiempo real

## 📞 **SOPORTE**
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)

---

**¡LogicQP estará disponible globalmente en minutos!** 🚀✨
