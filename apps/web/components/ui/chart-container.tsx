"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Download, 
  RefreshCw, 
  Maximize2, 
  Minimize2,
  BarChart3,
  TrendingUp,
  PieChart,
  LineChart
} from "lucide-react"

interface ChartContainerProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
  showHeader?: boolean
  showActions?: boolean
  loading?: boolean
  error?: string | null
  onRefresh?: () => void
  onExport?: () => void
  exportFormats?: ("png" | "jpg" | "pdf" | "csv")[]
  chartType?: "bar" | "line" | "pie" | "area" | "doughnut"
  fullscreen?: boolean
  onToggleFullscreen?: () => void
  empty?: boolean
  emptyMessage?: string
  emptyAction?: {
    label: string
    onClick: () => void
  }
}

const chartTypeIcons = {
  bar: BarChart3,
  line: LineChart,
  pie: PieChart,
  area: TrendingUp,
  doughnut: PieChart,
}

function ChartContainer({
  title,
  subtitle,
  children,
  className,
  showHeader = true,
  showActions = true,
  loading = false,
  error = null,
  onRefresh,
  onExport,
  exportFormats = ["png", "pdf"],
  chartType = "bar",
  fullscreen = false,
  onToggleFullscreen,
  empty = false,
  emptyMessage = "No hay datos para mostrar",
  emptyAction,
}: ChartContainerProps) {
  const ChartIcon = chartTypeIcons[chartType] || BarChart3

  const handleExport = (format: string) => {
    if (onExport) {
      onExport()
    }
    // Aquí puedes implementar la lógica de exportación específica
    console.log(`Exportando gráfico como ${format}`)
  }

  if (loading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <ChartIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="flex flex-col items-center space-y-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Cargando gráfico...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <ChartIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                <span className="text-destructive text-xs">!</span>
              </div>
              <p className="text-sm text-muted-foreground">{error}</p>
              {onRefresh && (
                <Button variant="outline" size="sm" onClick={onRefresh}>
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Reintentar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (empty) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <ChartIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <ChartIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">{emptyMessage}</p>
              {emptyAction && (
                <Button variant="outline" size="sm" onClick={emptyAction.onClick}>
                  {emptyAction.label}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("w-full", className)}>
      {showHeader && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <ChartIcon className="h-4 w-4 text-muted-foreground" />
            {showActions && (
              <div className="flex items-center space-x-1">
                {onRefresh && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRefresh}
                    className="h-8 w-8 p-0"
                    title="Actualizar datos"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                )}
                {onExport && (
                  <div className="relative group">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="Exportar gráfico"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <div className="absolute right-0 top-full mt-1 bg-popover border rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 min-w-[120px]">
                      {exportFormats.map((format) => (
                        <button
                          key={format}
                          onClick={() => handleExport(format)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground first:rounded-t-md last:rounded-b-md"
                        >
                          Exportar como {format.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {onToggleFullscreen && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleFullscreen}
                    className="h-8 w-8 p-0"
                    title={fullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                  >
                    {fullscreen ? (
                      <Minimize2 className="h-3 w-3" />
                    ) : (
                      <Maximize2 className="h-3 w-3" />
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn(
        "pt-0",
        fullscreen && "min-h-[600px]"
      )}>
        {children}
      </CardContent>
    </Card>
  )
}

// Componentes especializados para tipos de gráficos comunes
export function BarChartContainer(props: Omit<ChartContainerProps, "chartType">) {
  return <ChartContainer {...props} chartType="bar" />
}

export function LineChartContainer(props: Omit<ChartContainerProps, "chartType">) {
  return <ChartContainer {...props} chartType="line" />
}

export function PieChartContainer(props: Omit<ChartContainerProps, "chartType">) {
  return <ChartContainer {...props} chartType="pie" />
}

export function AreaChartContainer(props: Omit<ChartContainerProps, "chartType">) {
  return <ChartContainer {...props} chartType="area" />
}

export function DoughnutChartContainer(props: Omit<ChartContainerProps, "chartType">) {
  return <ChartContainer {...props} chartType="doughnut" />
}

// Exportación por defecto para compatibilidad con lazy loading
export default ChartContainer
