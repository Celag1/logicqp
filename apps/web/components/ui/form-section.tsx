"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ChevronDown, ChevronRight, Settings, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FormSectionProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
  collapsibleIcon?: React.ReactNode
  actions?: React.ReactNode
  onAdd?: () => void
  onRemove?: () => void
  addButtonText?: string
  removeButtonText?: string
  showAddButton?: boolean
  showRemoveButton?: boolean
  variant?: "default" | "bordered" | "minimal"
  size?: "sm" | "md" | "lg"
}

export function FormSection({
  title,
  subtitle,
  children,
  className,
  collapsible = false,
  defaultCollapsed = false,
  collapsibleIcon,
  actions,
  onAdd,
  onRemove,
  addButtonText = "Agregar",
  removeButtonText = "Eliminar",
  showAddButton = false,
  showRemoveButton = false,
  variant = "default",
  size = "md",
}: FormSectionProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)

  const toggleCollapse = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed)
    }
  }

  const sizeClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  }

  const variantClasses = {
    default: "border bg-card shadow-sm",
    bordered: "border bg-transparent",
    minimal: "bg-transparent",
  }

  const renderHeader = () => (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {collapsible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapse}
            className="h-6 w-6 p-0 hover:bg-muted"
            aria-label={isCollapsed ? "Expandir sección" : "Colapsar sección"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        )}
        
        {collapsibleIcon && (
          <div className="text-muted-foreground">
            {collapsibleIcon}
          </div>
        )}
        
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {showAddButton && onAdd && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAdd}
            className="flex items-center space-x-1"
          >
            <Plus className="h-3 w-3" />
            <span>{addButtonText}</span>
          </Button>
        )}

        {showRemoveButton && onRemove && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRemove}
            className="flex items-center space-x-1 text-destructive hover:text-destructive"
          >
            <Minus className="h-3 w-3" />
            <span>{removeButtonText}</span>
          </Button>
        )}

        {actions}
      </div>
    </div>
  )

  if (variant === "minimal") {
    return (
      <div className={cn("space-y-4", className)}>
        {renderHeader()}
        {!isCollapsed && (
          <div className="space-y-4">
            {children}
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className={cn(
      "w-full",
      variantClasses[variant],
      className
    )}>
      <CardHeader className={cn(
        "pb-4",
        sizeClasses[size]
      )}>
        {renderHeader()}
      </CardHeader>
      
      {!isCollapsed && (
        <>
          <Separator />
          <CardContent className={cn(
            "pt-4",
            sizeClasses[size]
          )}>
            <div className="space-y-4">
              {children}
            </div>
          </CardContent>
        </>
      )}
    </Card>
  )
}

// Componentes especializados para casos comunes
export function CollapsibleFormSection(props: Omit<FormSectionProps, "collapsible">) {
  return <FormSection {...props} collapsible={true} />
}

export function BorderedFormSection(props: Omit<FormSectionProps, "variant">) {
  return <FormSection {...props} variant="bordered" />
}

export function MinimalFormSection(props: Omit<FormSectionProps, "variant">) {
  return <FormSection {...props} variant="minimal" />
}

export function FormSectionWithActions({
  title,
  subtitle,
  children,
  onAdd,
  onRemove,
  addButtonText,
  removeButtonText,
  ...props
}: Omit<FormSectionProps, "showAddButton" | "showRemoveButton"> & {
  onAdd?: () => void
  onRemove?: () => void
  addButtonText?: string
  removeButtonText?: string
}) {
  return (
    <FormSection
      {...props}
      title={title}
      subtitle={subtitle}
      onAdd={onAdd}
      onRemove={onRemove}
      addButtonText={addButtonText}
      removeButtonText={removeButtonText}
      showAddButton={true}
      showRemoveButton={false}
    >
      {children}
    </FormSection>
  )
}

// Componente para agrupar campos relacionados
export function FormFieldGroup({
  title,
  children,
  className,
  variant = "default",
}: {
  title?: string
  children: React.ReactNode
  className?: string
  variant?: "default" | "bordered" | "minimal"
}) {
  if (!title) {
    return <div className={cn("space-y-4", className)}>{children}</div>
  }

  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-sm font-medium text-foreground">{title}</h4>
      <div className={cn(
        "space-y-4",
        variant === "bordered" && "pl-4 border-l-2 border-muted",
        variant === "minimal" && "pl-2"
      )}>
        {children}
      </div>
    </div>
  )
}
