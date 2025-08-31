"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SearchInputProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  onSearch?: (value: string) => void
  clearable?: boolean
  disabled?: boolean
  className?: string
  inputClassName?: string
  showSearchButton?: boolean
  searchButtonText?: string
  debounceMs?: number
}

export function SearchInput({
  value,
  onValueChange,
  placeholder = "Buscar...",
  onSearch,
  clearable = true,
  disabled = false,
  className,
  inputClassName,
  showSearchButton = false,
  searchButtonText = "Buscar",
  debounceMs = 300,
}: SearchInputProps) {
  const [inputValue, setInputValue] = React.useState(value)
  const [isFocused, setIsFocused] = React.useState(false)
  const debounceTimeoutRef = React.useRef<NodeJS.Timeout>()

  React.useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onValueChange(newValue)

    // Debounce para búsquedas automáticas
    if (debounceMs > 0 && onSearch) {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      debounceTimeoutRef.current = setTimeout(() => {
        onSearch(newValue)
      }, debounceMs)
    }
  }

  const handleClear = () => {
    setInputValue("")
    onValueChange("")
    if (onSearch) {
      onSearch("")
    }
  }

  const handleSearch = () => {
    if (onSearch) {
      onSearch(inputValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearch) {
      onSearch(inputValue)
    }
  }

  React.useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "pl-10 pr-20",
            isFocused && "ring-2 ring-ring ring-offset-2",
            inputClassName
          )}
          aria-label="Campo de búsqueda"
        />
        
        {clearable && inputValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={disabled}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-3 w-3" />
          </Button>
        )}

        {showSearchButton && (
          <Button
            onClick={handleSearch}
            disabled={disabled || !inputValue}
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-3 text-xs"
          >
            {searchButtonText}
          </Button>
        )}
      </div>
    </div>
  )
}
