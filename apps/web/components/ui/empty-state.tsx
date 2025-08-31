"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: "default" | "outline" | "secondary" | "ghost"
    size?: "default" | "sm" | "lg"
  }
  secondaryAction?: {
    label: string
    onClick: () => void
    variant?: "default" | "outline" | "secondary" | "ghost"
    size?: "default" | "sm" | "lg"
  }
  image?: string
  imageAlt?: string
  className?: string
  compact?: boolean
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  image,
  imageAlt,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <Card className={cn("w-full", compact ? "p-6" : "p-12", className)}>
      <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
        {image && (
          <div className="mb-4">
            <img
              src={image}
              alt={imageAlt || title}
              className="h-24 w-24 object-contain opacity-50"
            />
          </div>
        )}
        
        {icon && (
          <div className="mb-4 text-muted-foreground">
            {icon}
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground max-w-sm">
              {description}
            </p>
          )}
        </div>

        {(action || secondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            {action && (
              <Button
                onClick={action.onClick}
                variant={action.variant || "default"}
                size={action.size || "default"}
              >
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                onClick={secondaryAction.onClick}
                variant={secondaryAction.variant || "outline"}
                size={secondaryAction.size || "default"}
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Variantes predefinidas para casos comunes
export function NoDataEmptyState({
  title = "No hay datos",
  description = "No se encontraron resultados para mostrar.",
  action,
  secondaryAction,
  className,
  compact,
}: Omit<EmptyStateProps, "icon" | "image" | "imageAlt">) {
  return (
    <EmptyState
      title={title}
      description={description}
      action={action}
      secondaryAction={secondaryAction}
      className={className}
      compact={compact}
      icon={
        <svg
          className="h-12 w-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      }
    />
  )
}

export function NoResultsEmptyState({
  title = "No se encontraron resultados",
  description = "Intenta ajustar los filtros o criterios de búsqueda.",
  action,
  secondaryAction,
  className,
  compact,
}: Omit<EmptyStateProps, "icon" | "image" | "imageAlt">) {
  return (
    <EmptyState
      title={title}
      description={description}
      action={action}
      secondaryAction={secondaryAction}
      className={className}
      compact={compact}
      icon={
        <svg
          className="h-12 w-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      }
    />
  )
}

export function ErrorEmptyState({
  title = "Algo salió mal",
  description = "No se pudieron cargar los datos. Intenta de nuevo más tarde.",
  action,
  secondaryAction,
  className,
  compact,
}: Omit<EmptyStateProps, "icon" | "image" | "imageAlt">) {
  return (
    <EmptyState
      title={title}
      description={description}
      action={action}
      secondaryAction={secondaryAction}
      className={className}
      compact={compact}
      icon={
        <svg
          className="h-12 w-12 text-destructive"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      }
    />
  )
}

export function LoadingEmptyState({
  title = "Cargando...",
  description = "Por favor espera mientras se cargan los datos.",
  className,
  compact,
}: Omit<EmptyStateProps, "icon" | "image" | "imageAlt" | "action" | "secondaryAction">) {
  return (
    <EmptyState
      title={title}
      description={description}
      className={className}
      compact={compact}
      icon={
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      }
    />
  )
}
