// Componentes UI base
export * from "./ui"

// Componentes de navegación
export { default as Navigation } from "./navigation"
export { ThemeToggle } from "./theme-toggle"
export { LanguageSwitch } from "./language-switch"

// Componentes de funcionalidad
export { default as AIAssistant } from "./ai-assistant"
export { BarcodeScanner } from "./barcode-scanner"
export { CameraCapture } from "./camera-capture"
export { SmartImagePicker } from "./smart-image-picker"

// Componentes de datos
export { DataTable } from "./ui/data-table"

// Tipos de componentes
export type { Product, Category, Supplier, Lot, Order, OrderItem, User, DashboardMetric, ChartData } from "../types"
