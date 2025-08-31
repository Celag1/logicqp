"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, Clock, Minus } from "lucide-react"

interface StatusBadgeProps {
  status: string
  variant?: "default" | "secondary" | "destructive" | "outline"
  size?: "default" | "sm" | "lg"
  showIcon?: boolean
  className?: string
}

// Configuración de estados predefinidos
const statusConfig: Record<string, {
  label: string
  variant: "default" | "secondary" | "destructive" | "outline"
  icon?: React.ReactNode
  color?: string
}> = {
  // Estados de órdenes
  "pendiente": {
    label: "Pendiente",
    variant: "secondary",
    icon: <Clock className="h-3 w-3" />,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200"
  },
  "confirmada": {
    label: "Confirmada",
    variant: "default",
    icon: <CheckCircle className="h-3 w-3" />,
    color: "bg-blue-100 text-blue-800 border-blue-200"
  },
  "en_proceso": {
    label: "En Proceso",
    variant: "default",
    icon: <Clock className="h-3 w-3" />,
    color: "bg-orange-100 text-orange-800 border-orange-200"
  },
  "enviada": {
    label: "Enviada",
    variant: "default",
    icon: <CheckCircle className="h-3 w-3" />,
    color: "bg-purple-100 text-purple-800 border-purple-200"
  },
  "entregada": {
    label: "Entregada",
    variant: "default",
    icon: <CheckCircle className="h-3 w-3" />,
    color: "bg-green-100 text-green-800 border-green-200"
  },
  "cancelada": {
    label: "Cancelada",
    variant: "destructive",
    icon: <XCircle className="h-3 w-3" />,
    color: "bg-red-100 text-red-800 border-red-200"
  },

  // Estados de pagos
  "pagado": {
    label: "Pagado",
    variant: "default",
    icon: <CheckCircle className="h-3 w-3" />,
    color: "bg-green-100 text-green-800 border-green-200"
  },
  "pendiente_pago": {
    label: "Pendiente de Pago",
    variant: "secondary",
    icon: <Clock className="h-3 w-3" />,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200"
  },
  "fallido": {
    label: "Fallido",
    variant: "destructive",
    icon: <XCircle className="h-3 w-3" />,
    color: "bg-red-100 text-red-800 border-red-200"
  },
  "reembolsado": {
    label: "Reembolsado",
    variant: "outline",
    icon: <Minus className="h-3 w-3" />,
    color: "bg-gray-100 text-gray-800 border-gray-200"
  },

  // Estados de inventario
  "disponible": {
    label: "Disponible",
    variant: "default",
    icon: <CheckCircle className="h-3 w-3" />,
    color: "bg-green-100 text-green-800 border-green-200"
  },
  "agotado": {
    label: "Agotado",
    variant: "destructive",
    icon: <XCircle className="h-3 w-3" />,
    color: "bg-red-100 text-red-800 border-red-200"
  },
  "stock_bajo": {
    label: "Stock Bajo",
    variant: "secondary",
    icon: <AlertTriangle className="h-3 w-3" />,
    color: "bg-orange-100 text-orange-800 border-orange-200"
  },
  "reservado": {
    label: "Reservado",
    variant: "outline",
    icon: <Clock className="h-3 w-3" />,
    color: "bg-blue-100 text-blue-800 border-blue-200"
  },

  // Estados de usuarios
  "activo": {
    label: "Activo",
    variant: "default",
    icon: <CheckCircle className="h-3 w-3" />,
    color: "bg-green-100 text-green-800 border-green-200"
  },
  "inactivo": {
    label: "Inactivo",
    variant: "secondary",
    icon: <Minus className="h-3 w-3" />,
    color: "bg-gray-100 text-gray-800 border-gray-200"
  },
  "suspendido": {
    label: "Suspendido",
    variant: "destructive",
    icon: <XCircle className="h-3 w-3" />,
    color: "bg-red-100 text-red-800 border-red-200"
  },

  // Estados de verificación
  "verificado": {
    label: "Verificado",
    variant: "default",
    icon: <CheckCircle className="h-3 w-3" />,
    color: "bg-green-100 text-green-800 border-green-200"
  },
  "no_verificado": {
    label: "No Verificado",
    variant: "secondary",
    icon: <AlertTriangle className="h-3 w-3" />,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200"
  },
  "pendiente_verificacion": {
    label: "Pendiente",
    variant: "outline",
    icon: <Clock className="h-3 w-3" />,
    color: "bg-blue-100 text-blue-800 border-blue-200"
  }
}

export function StatusBadge({
  status,
  variant,
  size = "default",
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status.toLowerCase()] || {
    label: status,
    variant: "secondary" as const,
    icon: <Minus className="h-3 w-3" />
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    default: "px-2.5 py-0.5 text-sm",
    lg: "px-3 py-1 text-base"
  }

  return (
    <Badge
      variant={variant || config.variant}
      className={cn(
        "inline-flex items-center gap-1.5 font-medium",
        sizeClasses[size],
        config.color,
        className
      )}
    >
      {showIcon && config.icon}
      {config.label}
    </Badge>
  )
}

// Componentes especializados para casos comunes
export function OrderStatusBadge({ status, ...props }: Omit<StatusBadgeProps, "status"> & { status: string }) {
  return <StatusBadge status={status} {...props} />
}

export function PaymentStatusBadge({ status, ...props }: Omit<StatusBadgeProps, "status"> & { status: string }) {
  return <StatusBadge status={status} {...props} />
}

export function InventoryStatusBadge({ status, ...props }: Omit<StatusBadgeProps, "status"> & { status: string }) {
  return <StatusBadge status={status} {...props} />
}

export function UserStatusBadge({ status, ...props }: Omit<StatusBadgeProps, "status"> & { status: string }) {
  return <StatusBadge status={status} {...props} />
}

export function VerificationStatusBadge({ status, ...props }: Omit<StatusBadgeProps, "status"> & { status: string }) {
  return <StatusBadge status={status} {...props} />
}
