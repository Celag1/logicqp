# 🗄️ Configuración de Base de Datos LogicQP en Supabase

## 📋 Pasos para Configurar tu Base de Datos

### 1. **Acceder a tu Dashboard de Supabase**
- Ve a https://supabase.com/dashboard
- Inicia sesión con tu cuenta
- Selecciona tu proyecto **LogicQP**

### 2. **Ejecutar el Esquema de Base de Datos**
- Ve a **SQL Editor** en el menú lateral
- Crea un nuevo query
- Copia y pega el contenido del archivo `supabase/migrations/000_complete_schema.sql`
- Haz clic en **Run** para ejecutar

### 3. **Ejecutar las Funciones y Vistas**
- Crea otro nuevo query
- Copia y pega el contenido del archivo `supabase/migrations/001_functions_views.sql`
- Haz clic en **Run** para ejecutar

### 4. **Insertar Datos de Prueba**
- Crea otro nuevo query
- Copia y pega el contenido del archivo `supabase/seed/seed_data.sql`
- Haz clic en **Run** para ejecutar

### 5. **Verificar la Configuración**
- Ve a **Table Editor** en el menú lateral
- Verifica que se hayan creado todas las tablas:
  - `profiles`
  - `categorias`
  - `proveedores`
  - `productos`
  - `lotes`
  - `compras`
  - `compra_items`
  - `movimientos_stock`
  - `clientes`
  - `carritos`
  - `carrito_items`
  - `ordenes`
  - `orden_items`
  - `pagos`
  - `envios`
  - `auditoria`
  - `permisos`
  - `empresa_config`

### 6. **Verificar las Vistas**
- Ve a **Table Editor** → **Views**
- Verifica que se hayan creado:
  - `vw_kardex_producto`
  - `vw_ventas_mensuales`
  - `vw_top_productos`
  - `vw_stock_critico`

### 7. **Verificar las Funciones RPC**
- Ve a **Database** → **Functions**
- Verifica que se hayan creado:
  - `fn_my_role()`
  - `fn_set_user_role()`
  - `fn_checkout()`
  - `fn_registrar_compra()`
  - `fn_low_stock_alerts()`
  - `fn_dashboard_metrics()`
  - `fn_log_event()`

### 8. **Verificar el Storage**
- Ve a **Storage** en el menú lateral
- Verifica que se haya creado el bucket `productos`

## ⚠️ Notas Importantes

- **Ejecuta los archivos en el orden especificado**
- **No modifiques el orden de ejecución**
- **Si hay errores, verifica que cada paso se haya ejecutado correctamente**
- **Los datos de prueba incluyen 30 productos Qualipharm con lotes realistas**

## 🔍 Verificación Final

Después de ejecutar todos los pasos, deberías ver:
- ✅ 15 categorías de productos
- ✅ 20 proveedores
- ✅ 30 productos Qualipharm
- ✅ 30 lotes con fechas de vencimiento realistas
- ✅ Configuración de empresa
- ✅ Bucket de storage configurado
- ✅ Todas las políticas RLS activas

## 🚀 Siguiente Paso

Una vez que la base de datos esté configurada, podrás:
1. **Iniciar el frontend**: `pnpm dev`
2. **Probar la autenticación** con los usuarios de prueba
3. **Explorar el catálogo** de productos
4. **Probar las funcionalidades** del sistema

¿Necesitas ayuda con algún paso específico?
