"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  text?: string
  showText?: boolean
  variant?: "default" | "primary" | "secondary" | "muted"
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
}

const variantClasses = {
  default: "text-foreground",
  primary: "text-primary",
  secondary: "text-secondary-foreground",
  muted: "text-muted-foreground",
}

export function LoadingSpinner({
  size = "md",
  className,
  text,
  showText = false,
  variant = "default",
}: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center space-y-2", className)}>
      <Loader2
        className={cn(
          "animate-spin",
          sizeClasses[size],
          variantClasses[variant]
        )}
        aria-label="Cargando"
      />
      {showText && text && (
        <p className={cn("text-sm", variantClasses[variant])}>
          {text}
        </p>
      )}
    </div>
  )
}

// Variantes predefinidas para casos comunes
export function LoadingSpinnerInline({
  size = "sm",
  className,
  variant = "muted",
}: Omit<LoadingSpinnerProps, "text" | "showText">) {
  return (
    <Loader2
      className={cn(
        "animate-spin inline",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      aria-label="Cargando"
    />
  )
}

export function LoadingSpinnerPage({
  text = "Cargando...",
  className,
}: Pick<LoadingSpinnerProps, "text" | "className">) {
  return (
    <div className={cn("flex items-center justify-center min-h-[400px]", className)}>
      <LoadingSpinner size="xl" text={text} showText />
    </div>
  )
}

export function LoadingSpinnerOverlay({
  text = "Cargando...",
  className,
}: Pick<LoadingSpinnerProps, "text" | "className">) {
  return (
    <div className={cn(
      "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center",
      className
    )}>
      <LoadingSpinner size="xl" text={text} showText />
    </div>
  )
}
