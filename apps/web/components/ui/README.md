# Componentes UI de LogicQP

Esta es la biblioteca completa de componentes UI modernos y reutilizables para LogicQP, construida sobre Radix UI y Tailwind CSS.

## 🚀 Componentes Base (Radix UI)

### Navegación y Layout
- **Accordion** - Acordeón colapsable
- **NavigationMenu** - Menú de navegación con dropdowns
- **Sheet** - Panel lateral deslizable
- **Resizable** - Paneles redimensionables
- **ScrollArea** - Área de desplazamiento personalizada

### Formularios y Entrada
- **Button** - Botones con múltiples variantes
- **Input** - Campo de entrada de texto
- **Textarea** - Área de texto multilínea
- **Select** - Selector desplegable
- **Checkbox** - Casilla de verificación
- **RadioGroup** - Grupo de botones de radio
- **Switch** - Interruptor de alternancia
- **Slider** - Control deslizante
- **Toggle** - Botón de alternancia
- **ToggleGroup** - Grupo de botones de alternancia

### Overlays y Modales
- **Dialog** - Modal/diálogo
- **AlertDialog** - Diálogo de confirmación
- **Popover** - Popover contextual
- **Tooltip** - Tooltip informativo
- **HoverCard** - Tarjeta de información al pasar el mouse
- **ContextMenu** - Menú contextual
- **Menubar** - Barra de menú horizontal

### Datos y Tablas
- **DataTable** - Tabla de datos con filtros y paginación
- **Table** - Tabla básica
- **Badge** - Etiqueta/badge
- **Avatar** - Avatar de usuario
- **Progress** - Barra de progreso
- **Skeleton** - Esqueleto de carga

### Calendario y Fechas
- **Calendar** - Calendario de selección de fechas
- **DatePicker** - Selector de fecha
- **TimePicker** - Selector de hora

## 🎯 Componentes Especializados

### Formularios Avanzados
- **FormField** - Campo de formulario unificado con validación
- **FormSection** - Sección de formulario colapsable
- **FormActions** - Acciones de formulario predefinidas
- **Combobox** - Campo de búsqueda con autocompletado
- **MultiSelect** - Selección múltiple con etiquetas
- **FileUpload** - Carga de archivos con drag & drop

### Navegación y UX
- **Breadcrumb** - Migas de pan
- **Pagination** - Paginación completa
- **SearchInput** - Campo de búsqueda con debounce
- **StatusBadge** - Badges de estado predefinidos

### Estados y Feedback
- **LoadingSpinner** - Indicadores de carga
- **EmptyState** - Estados vacíos con acciones
- **ErrorBoundary** - Manejo de errores
- **ConfirmDialog** - Diálogos de confirmación
- **Toast** - Notificaciones toast

### Gráficos y Visualización
- **ChartContainer** - Contenedor de gráficos con acciones
- **BarChartContainer** - Contenedor para gráficos de barras
- **LineChartContainer** - Contenedor para gráficos de líneas
- **PieChartContainer** - Contenedor para gráficos circulares

## 🎨 Variantes y Temas

### Variantes de Botones
- `default` - Botón principal
- `destructive` - Botón de acción destructiva
- `outline` - Botón con borde
- `secondary` - Botón secundario
- `ghost` - Botón transparente
- `link` - Botón como enlace

### Tamaños
- `sm` - Pequeño
- `default` - Mediano (por defecto)
- `lg` - Grande
- `icon` - Solo icono

### Estados
- `disabled` - Deshabilitado
- `loading` - Cargando
- `error` - Con error
- `success` - Exitoso

## 🔧 Uso Básico

### Importación
```tsx
import { Button, Card, Input } from "@/components/ui"
```

### Ejemplo de Formulario
```tsx
import { FormField, FormSection, FormActions } from "@/components/ui"

function ProductForm() {
  return (
    <form>
      <FormSection title="Información del Producto">
        <FormField
          label="Nombre"
          name="name"
          type="text"
          required
          placeholder="Ingrese el nombre del producto"
        />
        
        <FormField
          label="Categoría"
          name="category"
          type="select"
          options={[
            { value: "medicamentos", label: "Medicamentos" },
            { value: "vitaminas", label: "Vitaminas" }
          ]}
        />
      </FormSection>
      
      <FormActions
        actions={[
          { label: "Cancelar", onClick: onCancel, variant: "outline" },
          { label: "Guardar", onClick: onSave, variant: "default" }
        ]}
      />
    </form>
  )
}
```

### Ejemplo de Tabla
```tsx
import { DataTable } from "@/components/ui"

function ProductsTable() {
  const columns = [
    { key: "name", label: "Nombre" },
    { key: "price", label: "Precio" },
    { key: "stock", label: "Stock" }
  ]

  return (
    <DataTable
      data={products}
      columns={columns}
      searchable
      sortable
      pagination
    />
  )
}
```

## 🎯 Componentes Predefinidos

### Acciones de Formulario
- **SaveCancelActions** - Guardar y Cancelar
- **AddEditActions** - Agregar, Editar y Eliminar
- **ViewEditDeleteActions** - Ver, Editar y Eliminar
- **FormSubmitActions** - Enviar y Limpiar

### Estados Vacíos
- **NoDataEmptyState** - Sin datos
- **NoResultsEmptyState** - Sin resultados de búsqueda
- **ErrorEmptyState** - Con error
- **LoadingEmptyState** - Cargando

### Badges de Estado
- **OrderStatusBadge** - Estados de órdenes
- **PaymentStatusBadge** - Estados de pagos
- **InventoryStatusBadge** - Estados de inventario
- **UserStatusBadge** - Estados de usuarios
- **VerificationStatusBadge** - Estados de verificación

### Contenedores de Gráficos
- **BarChartContainer** - Para gráficos de barras
- **LineChartContainer** - Para gráficos de líneas
- **PieChartContainer** - Para gráficos circulares
- **AreaChartContainer** - Para gráficos de área
- **DoughnutChartContainer** - Para gráficos de dona

## 🎨 Personalización

### Tailwind CSS
Todos los componentes usan Tailwind CSS y pueden ser personalizados con clases adicionales:

```tsx
<Button className="bg-gradient-to-r from-blue-500 to-purple-500">
  Botón Personalizado
</Button>
```

### Variables CSS
Los componentes respetan las variables CSS de Tailwind:
- `--background`
- `--foreground`
- `--primary`
- `--primary-foreground`
- `--secondary`
- `--muted`
- `--accent`
- `--destructive`
- `--border`
- `--input`
- `--ring`

### Temas
Los componentes soportan temas claro/oscuro automáticamente:

```tsx
import { useTheme } from "@/hooks/use-theme"

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  return (
    <Button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      Cambiar Tema
    </Button>
  )
}
```

## 📱 Responsive Design

Todos los componentes están diseñados para ser completamente responsivos:

- **Mobile First** - Diseño optimizado para móviles
- **Breakpoints** - Adaptación automática a diferentes tamaños
- **Touch Friendly** - Optimizado para dispositivos táctiles
- **Accessibility** - Cumple con estándares ARIA

## ♿ Accesibilidad

- **ARIA Labels** - Etiquetas de accesibilidad
- **Keyboard Navigation** - Navegación por teclado
- **Screen Reader Support** - Soporte para lectores de pantalla
- **Focus Management** - Gestión del foco
- **Color Contrast** - Contraste de colores adecuado

## 🚀 Performance

- **Lazy Loading** - Carga diferida de componentes pesados
- **Memoization** - Optimización de re-renders
- **Bundle Splitting** - División del bundle
- **Tree Shaking** - Eliminación de código no utilizado

## 🔧 Desarrollo

### Estructura de Archivos
```
components/ui/
├── index.ts              # Exportaciones principales
├── README.md             # Esta documentación
├── button.tsx            # Componente Button
├── card.tsx              # Componente Card
├── input.tsx             # Componente Input
└── ...                   # Otros componentes
```

### Crear un Nuevo Componente
1. Crear archivo `component-name.tsx`
2. Implementar el componente usando Radix UI
3. Agregar exportación en `index.ts`
4. Documentar en este README

### Convenciones
- Usar TypeScript para todos los componentes
- Implementar interfaces claras para props
- Usar `cn()` para combinar clases de Tailwind
- Agregar `displayName` para debugging
- Incluir ejemplos de uso en comentarios

## 📚 Recursos Adicionales

- [Radix UI Documentation](https://www.radix-ui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [React Documentation](https://react.dev/)

## 🤝 Contribución

Para contribuir con nuevos componentes:

1. Crear el componente siguiendo las convenciones
2. Agregar tipos TypeScript apropiados
3. Incluir ejemplos de uso
4. Actualizar esta documentación
5. Probar en diferentes dispositivos y navegadores

---

**LogicQP** - Sistema de Gestión Farmacéutica Inteligente
