# 🚀 CHECKLIST RÁPIDO - DESPLIEGUE VERCEL

## ✅ **ANTES DEL DESPLIEGUE**
- [ ] Build exitoso (`pnpm build`)
- [ ] Código en GitHub
- [ ] Cuenta Vercel activa
- [ ] Variables de entorno listas

## 🎯 **PASOS RÁPIDOS (5 minutos)**

### **1. Crear Proyecto Vercel**
- [ ] New Project → Import from GitHub
- [ ] Repo: `logicqp`
- [ ] Framework: Next.js
- [ ] Root Directory: `apps/web`

### **2. Configurar Build**
- [ ] Build Command: `pnpm build`
- [ ] Output Directory: `.next`
- [ ] Install Command: `pnpm install`

### **3. Variables de Entorno**
```env
NEXT_PUBLIC_SUPABASE_URL=https://iapixzikdhvghzsjkodu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhcGl4emlrZGh2Z2h6c2prb2R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODg3MDUsImV4cCI6MjA3MjA2NDcwNX0.myVS1ZgYewbf44jUblez3fB_OVAAmj6ddAkpGSGlJe0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhcGl4emlrZGh2Z2h6c2prb2R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQ4ODcwNSwiZXhwIjoyMDcyMDY0NzA1fQ.Z2Z17gPI1rpJNqemEhjpGdsJ9kbzRmTaVgr
```

### **4. Desplegar**
- [ ] Click "Deploy"
- [ ] Esperar build (2-3 min)
- [ ] Verificar URL

## 🔍 **VERIFICACIÓN POST-DESPLIEGUE**
- [ ] Landing Page carga
- [ ] Dashboard funciona
- [ ] Catálogo lista productos
- [ ] PWA se instala
- [ ] Responsive en móvil

## 🌐 **URLs FINALES**
- **Producción**: `https://logicqp.vercel.app`
- **Dashboard**: `https://logicqp.vercel.app/dashboard`
- **Catálogo**: `https://logicqp.vercel.app/catalogo`

## ⚡ **CONFIGURACIONES ADICIONALES**
- [ ] Dominio personalizado (opcional)
- [ ] Analytics habilitado
- [ ] Auto-deploy en push
- [ ] Previews en PRs

---

**¡Listo para desplegar en 5 minutos!** 🎯
