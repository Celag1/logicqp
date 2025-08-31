"use client"

import * as React from "react"
import { AlertTriangle, Info, HelpCircle, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive" | "warning" | "info" | "success"
  onConfirm: () => void
  onCancel?: () => void
  confirmLoading?: boolean
  disabled?: boolean
  className?: string
}

const variantConfig = {
  default: {
    icon: HelpCircle,
    iconColor: "text-muted-foreground",
    confirmVariant: "default" as const,
  },
  destructive: {
    icon: XCircle,
    iconColor: "text-destructive",
    confirmVariant: "destructive" as const,
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-yellow-600",
    confirmVariant: "default" as const,
  },
  info: {
    icon: Info,
    iconColor: "text-blue-600",
    confirmVariant: "default" as const,
  },
  success: {
    icon: CheckCircle,
    iconColor: "text-green-600",
    confirmVariant: "default" as const,
  },
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default",
  onConfirm,
  onCancel,
  confirmLoading = false,
  disabled = false,
  className,
}: ConfirmDialogProps) {
  const config = variantConfig[variant]
  const IconComponent = config.icon

  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={cn("sm:max-w-md", className)}>
        <AlertDialogHeader>
          <div className="flex items-center space-x-3">
            <IconComponent className={cn("h-5 w-5", config.iconColor)} />
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          {description && (
            <AlertDialogDescription className="pt-2">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={handleCancel}
            disabled={disabled || confirmLoading}
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={disabled || confirmLoading}
            className={cn(
              config.confirmVariant === "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
              config.confirmVariant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90",
              confirmLoading && "opacity-50 cursor-not-allowed"
            )}
          >
            {confirmLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Procesando...
              </>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Variantes predefinidas para casos comunes
export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title = "¿Estás seguro?",
  description = "Esta acción no se puede deshacer. ¿Deseas continuar?",
  itemName,
  onConfirm,
  onCancel,
  confirmLoading = false,
  disabled = false,
}: Omit<ConfirmDialogProps, "variant" | "confirmText" | "cancelText"> & {
  itemName?: string
}) {
  const finalTitle = itemName ? `¿Eliminar "${itemName}"?` : title
  const finalDescription = itemName 
    ? `¿Estás seguro de que deseas eliminar "${itemName}"? Esta acción no se puede deshacer.`
    : description

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={finalTitle}
      description={finalDescription}
      variant="destructive"
      confirmText="Eliminar"
      cancelText="Cancelar"
      onConfirm={onConfirm}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      disabled={disabled}
    />
  )
}

export function SaveConfirmDialog({
  open,
  onOpenChange,
  title = "¿Guardar cambios?",
  description = "¿Deseas guardar los cambios realizados?",
  onConfirm,
  onCancel,
  confirmLoading = false,
  disabled = false,
}: Omit<ConfirmDialogProps, "variant" | "confirmText" | "cancelText">) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      variant="info"
      confirmText="Guardar"
      cancelText="Cancelar"
      onConfirm={onConfirm}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      disabled={disabled}
    />
  )
}

export function UnsavedChangesDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  onDiscard,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  onCancel: () => void
  onDiscard: () => void
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <AlertDialogTitle>Cambios sin guardar</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            Tienes cambios sin guardar. ¿Qué deseas hacer?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0">
          <AlertDialogCancel onClick={onCancel}>
            Continuar editando
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onDiscard}
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            Descartar cambios
          </AlertDialogAction>
          <AlertDialogAction onClick={onConfirm}>
            Guardar cambios
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
