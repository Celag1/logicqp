"use client"

import * as React from "react"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
  showHome?: boolean
  homeHref?: string
  className?: string
  onItemClick?: (item: BreadcrumbItem, index: number) => void
}

export function Breadcrumb({
  items,
  separator = <ChevronRight className="h-4 w-4" />,
  showHome = true,
  homeHref = "/",
  className,
  onItemClick,
}: BreadcrumbProps) {
  const allItems = showHome 
    ? [{ label: "Inicio", href: homeHref, icon: <Home className="h-4 w-4" /> }, ...items]
    : items

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}
    >
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1
        const isClickable = item.href || onItemClick

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <span className="mx-2 text-muted-foreground" aria-hidden="true">
                {separator}
              </span>
            )}
            
            {isClickable ? (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-auto p-0 text-sm font-normal hover:text-foreground",
                  isLast && "text-foreground font-medium"
                )}
                onClick={() => onItemClick?.(item, index)}
                aria-current={isLast ? "page" : undefined}
              >
                {item.icon && <span className="mr-1">{item.icon}</span>}
                {item.label}
              </Button>
            ) : (
              <span
                className={cn(
                  "flex items-center",
                  isLast && "text-foreground font-medium"
                )}
                aria-current={isLast ? "page" : undefined}
              >
                {item.icon && <span className="mr-1">{item.icon}</span>}
                {item.label}
              </span>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
