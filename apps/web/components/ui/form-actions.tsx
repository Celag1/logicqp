"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Save, 
  X, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Eye, 
  Edit, 
  Copy,
  Download,
  Upload,
  Check,
  Loader2
} from "lucide-react"

interface FormAction {
  label: string
  onClick: () => void
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  icon?: React.ReactNode
  disabled?: boolean
  loading?: boolean
  type?: "button" | "submit" | "reset"
  className?: string
}

interface FormActionsProps {
  actions: FormAction[]
  className?: string
  layout?: "horizontal" | "vertical" | "justified"
  showSeparator?: boolean
  separatorText?: string
  align?: "left" | "center" | "right"
  size?: "sm" | "md" | "lg"
  variant?: "default" | "bordered" | "minimal"
}

const actionIcons = {
  save: <Save className="h-4 w-4" />,
  cancel: <X className="h-4 w-4" />,
  reset: <RotateCcw className="h-4 w-4" />,
  add: <Plus className="h-4 w-4" />,
  delete: <Trash2 className="h-4 w-4" />,
  view: <Eye className="h-4 w-4" />,
  edit: <Edit className="h-4 w-4" />,
  copy: <Copy className="h-4 w-4" />,
  download: <Download className="h-4 w-4" />,
  upload: <Upload className="h-4 w-4" />,
  submit: <Check className="h-4 w-4" />,
}

export function FormActions({
  actions,
  className,
  layout = "horizontal",
  showSeparator = false,
  separatorText,
  align = "right",
  size = "md",
  variant = "default",
}: FormActionsProps) {
  const sizeClasses = {
    sm: "gap-2",
    md: "gap-3",
    lg: "gap-4",
  }

  const variantClasses = {
    default: "p-4 bg-muted/50 rounded-lg",
    bordered: "p-4 border rounded-lg",
    minimal: "pt-4",
  }

  const layoutClasses = {
    horizontal: "flex-row",
    vertical: "flex-col",
    justified: "flex-row justify-between",
  }

  const alignClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }

  const renderAction = (action: FormAction, index: number) => {
    const IconComponent = action.icon || actionIcons[action.label.toLowerCase() as keyof typeof actionIcons]
    
    return (
      <Button
        key={index}
        variant={action.variant || "outline"}
        size={action.size || (size === "md" ? "default" : size)}
        onClick={action.onClick}
        disabled={action.disabled || action.loading}
        type={action.type || "button"}
        className={cn(action.className)}
      >
        {action.loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : IconComponent ? (
          <span className="mr-2">{IconComponent}</span>
        ) : null}
        {action.label}
      </Button>
    )
  }

  return (
    <div className={cn(
      "w-full",
      variantClasses[variant],
      className
    )}>
      {showSeparator && (
        <div className="flex items-center mb-4">
          <Separator className="flex-1" />
          {separatorText && (
            <span className="px-3 text-sm text-muted-foreground">
              {separatorText}
            </span>
          )}
          <Separator className="flex-1" />
        </div>
      )}

      <div className={cn(
        "flex",
        layoutClasses[layout],
        alignClasses[align],
        sizeClasses[size]
      )}>
        {actions.map((action, index) => renderAction(action, index))}
      </div>
    </div>
  )
}

// Componentes predefinidos para casos comunes
export function SaveCancelActions({
  onSave,
  onCancel,
  saveLoading = false,
  saveDisabled = false,
  saveText = "Guardar",
  cancelText = "Cancelar",
  className,
  ...props
}: {
  onSave: () => void
  onCancel: () => void
  saveLoading?: boolean
  saveDisabled?: boolean
  saveText?: string
  cancelText?: string
  className?: string
} & Omit<FormActionsProps, "actions">) {
  const actions: FormAction[] = [
    {
      label: cancelText,
      onClick: onCancel,
      variant: "outline",
    },
    {
      label: saveText,
      onClick: onSave,
      variant: "default",
      loading: saveLoading,
      disabled: saveDisabled,
      type: "submit",
    },
  ]

  return (
    <FormActions
      actions={actions}
      className={className}
      {...props}
    />
  )
}

export function AddEditActions({
  onAdd,
  onEdit,
  onDelete,
  addLoading = false,
  editLoading = false,
  deleteLoading = false,
  addDisabled = false,
  editDisabled = false,
  deleteDisabled = false,
  addText = "Agregar",
  editText = "Editar",
  deleteText = "Eliminar",
  className,
  ...props
}: {
  onAdd?: () => void
  onEdit?: () => void
  onDelete?: () => void
  addLoading?: boolean
  editLoading?: boolean
  deleteLoading?: boolean
  addDisabled?: boolean
  editDisabled?: boolean
  deleteDisabled?: boolean
  addText?: string
  editText?: string
  deleteText?: string
  className?: string
} & Omit<FormActionsProps, "actions">) {
  const actions: FormAction[] = []

  if (onAdd) {
    actions.push({
      label: addText,
      onClick: onAdd,
      variant: "default",
      loading: addLoading,
      disabled: addDisabled,
    })
  }

  if (onEdit) {
    actions.push({
      label: editText,
      onClick: onEdit,
      variant: "outline",
      loading: editLoading,
      disabled: editDisabled,
    })
  }

  if (onDelete) {
    actions.push({
      label: deleteText,
      onClick: onDelete,
      variant: "destructive",
      loading: deleteLoading,
      disabled: deleteDisabled,
    })
  }

  return (
    <FormActions
      actions={actions}
      className={className}
      {...props}
    />
  )
}

export function ViewEditDeleteActions({
  onView,
  onEdit,
  onDelete,
  viewLoading = false,
  editLoading = false,
  deleteLoading = false,
  viewDisabled = false,
  editDisabled = false,
  deleteDisabled = false,
  viewText = "Ver",
  editText = "Editar",
  deleteText = "Eliminar",
  className,
  ...props
}: {
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  viewLoading?: boolean
  editLoading?: boolean
  deleteLoading?: boolean
  viewDisabled?: boolean
  editDisabled?: boolean
  deleteDisabled?: boolean
  viewText?: string
  editText?: string
  deleteText?: string
  className?: string
} & Omit<FormActionsProps, "actions">) {
  const actions: FormAction[] = []

  if (onView) {
    actions.push({
      label: viewText,
      onClick: onView,
      variant: "outline",
      loading: viewLoading,
      disabled: viewDisabled,
    })
  }

  if (onEdit) {
    actions.push({
      label: editText,
      onClick: onEdit,
      variant: "outline",
      loading: editLoading,
      disabled: editDisabled,
    })
  }

  if (onDelete) {
    actions.push({
      label: deleteText,
      onClick: onDelete,
      variant: "destructive",
      loading: deleteLoading,
      disabled: deleteDisabled,
    })
  }

  return (
    <FormActions
      actions={actions}
      className={className}
      {...props}
    />
  )
}

export function FormSubmitActions({
  onSubmit,
  onReset,
  onSubmitLoading = false,
  onSubmitDisabled = false,
  submitText = "Enviar",
  resetText = "Limpiar",
  className,
  ...props
}: {
  onSubmit: () => void
  onReset?: () => void
  onSubmitLoading?: boolean
  onSubmitDisabled?: boolean
  submitText?: string
  resetText?: string
  className?: string
} & Omit<FormActionsProps, "actions">) {
  const actions: FormAction[] = [
    {
      label: submitText,
      onClick: onSubmit,
      variant: "default",
      loading: onSubmitLoading,
      disabled: onSubmitDisabled,
      type: "submit",
    },
  ]

  if (onReset) {
    actions.unshift({
      label: resetText,
      onClick: onReset,
      variant: "outline",
      type: "reset",
    })
  }

  return (
    <FormActions
      actions={actions}
      className={className}
      {...props}
    />
  )
}
