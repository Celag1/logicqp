"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { DatePicker } from "@/components/ui/date-picker"
import { TimePicker } from "@/components/ui/time-picker"
import { Combobox } from "@/components/ui/combobox"
import { MultiSelect } from "@/components/ui/multi-select"
import { FileUpload } from "@/components/ui/file-upload"
import { AlertTriangle, Info, CheckCircle } from "lucide-react"

interface FormFieldProps {
  label?: string
  name: string
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "textarea" | "select" | "checkbox" | "radio" | "switch" | "slider" | "date" | "time" | "combobox" | "multiselect" | "file"
  placeholder?: string
  value?: any
  onChange?: (value: any) => void
  onBlur?: () => void
  error?: string | null
  helpText?: string
  required?: boolean
  disabled?: boolean
  className?: string
  labelClassName?: string
  inputClassName?: string
  errorClassName?: string
  helpTextClassName?: string
  
  // Props específicos para diferentes tipos
  options?: Array<{ value: string; label: string }>
  min?: number
  max?: number
  step?: number
  multiple?: boolean
  accept?: string
  maxSize?: number
  maxFiles?: number
  
  // Props para validación
  pattern?: string
  minLength?: number
  maxLength?: number
  
  // Props para accesibilidad
  id?: string
  ariaLabel?: string
  ariaDescribedBy?: string
}

const statusIcons = {
  error: <AlertTriangle className="h-4 w-4 text-destructive" />,
  success: <CheckCircle className="h-4 w-4 text-green-600" />,
  info: <Info className="h-4 w-4 text-blue-600" />,
}

export function FormField({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  helpText,
  required = false,
  disabled = false,
  className,
  labelClassName,
  inputClassName,
  errorClassName,
  helpTextClassName,
  options = [],
  min,
  max,
  step,
  multiple = false,
  accept,
  maxSize,
  maxFiles,
  pattern,
  minLength,
  maxLength,
  id,
  ariaLabel,
  ariaDescribedBy,
}: FormFieldProps) {
  const fieldId = id || name
  const hasError = !!error
  const hasHelpText = !!helpText
  const status = hasError ? "error" : hasHelpText ? "info" : undefined

  const renderInput = () => {
    const commonProps = {
      id: fieldId,
      name,
      value,
      onChange: (e: any) => onChange?.(e.target?.value ?? e),
      onBlur,
      disabled,
      required,
      "aria-label": ariaLabel || label,
      "aria-describedby": ariaDescribedBy || (hasError ? `${fieldId}-error` : hasHelpText ? `${fieldId}-help` : undefined),
      "aria-invalid": hasError,
      className: cn(inputClassName),
    }

    switch (type) {
      case "textarea":
        return (
          <Textarea
            {...commonProps}
            placeholder={placeholder}
            minLength={minLength}
            maxLength={maxLength}
          />
        )

      case "select":
        return (
          <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "checkbox":
        return (
          <Checkbox
            id={fieldId}
            checked={value}
            onCheckedChange={onChange}
            disabled={disabled}
            required={required}
            aria-label={ariaLabel || label}
          />
        )

      case "radio":
        return (
          <RadioGroup value={value} onValueChange={onChange} disabled={disabled}>
            {options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${fieldId}-${option.value}`} />
                <Label htmlFor={`${fieldId}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "switch":
        return (
          <Switch
            id={fieldId}
            checked={value}
            onCheckedChange={onChange}
            disabled={disabled}
            aria-label={ariaLabel || label}
          />
        )

      case "slider":
        return (
          <Slider
            value={[value || 0]}
            onValueChange={(vals) => onChange?.(vals[0])}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            aria-label={ariaLabel || label}
          />
        )

      case "date":
        return (
          <DatePicker
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
          />
        )

      case "time":
        return (
          <TimePicker
            time={value}
            onTimeChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
          />
        )

      case "combobox":
        return (
          <Combobox
            options={options}
            value={value}
            onValueChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
          />
        )

      case "multiselect":
        return (
          <MultiSelect
            options={options}
            selected={value || []}
            onChange={onChange || (() => {})}
            placeholder={placeholder}
            disabled={disabled}
          />
        )

      case "file":
        return (
          <FileUpload
            files={value || []}
            onFilesChange={onChange || (() => {})}
            multiple={multiple}
            accept={accept}
            maxSize={maxSize}
            maxFiles={maxFiles}
            disabled={disabled}
          />
        )

      default:
        return (
          <Input
            {...commonProps}
            type={type}
            placeholder={placeholder}
            pattern={pattern}
            minLength={minLength}
            maxLength={maxLength}
            min={min}
            max={max}
            step={step}
          />
        )
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label
          htmlFor={fieldId}
          className={cn(
            "text-sm font-medium",
            required && "after:content-['*'] after:ml-0.5 after:text-destructive",
            labelClassName
          )}
        >
          {label}
        </Label>
      )}

      {renderInput()}

      {hasError && (
        <div
          id={`${fieldId}-error`}
          className={cn(
            "flex items-center space-x-2 text-sm text-destructive",
            errorClassName
          )}
          role="alert"
        >
          {statusIcons.error}
          <span>{error}</span>
        </div>
      )}

      {hasHelpText && !hasError && (
        <div
          id={`${fieldId}-help`}
          className={cn(
            "flex items-center space-x-2 text-sm text-muted-foreground",
            helpTextClassName
          )}
        >
          {statusIcons.info}
          <span>{helpText}</span>
        </div>
      )}
    </div>
  )
}

// Componentes especializados para casos comunes
export function TextFormField(props: Omit<FormFieldProps, "type">) {
  return <FormField {...props} type="text" />
}

export function EmailFormField(props: Omit<FormFieldProps, "type">) {
  return <FormField {...props} type="email" />
}

export function PasswordFormField(props: Omit<FormFieldProps, "type">) {
  return <FormField {...props} type="password" />
}

export function NumberFormField(props: Omit<FormFieldProps, "type">) {
  return <FormField {...props} type="number" />
}

export function SelectFormField(props: Omit<FormFieldProps, "type">) {
  return <FormField {...props} type="select" />
}

export function CheckboxFormField(props: Omit<FormFieldProps, "type">) {
  return <FormField {...props} type="checkbox" />
}

export function FileFormField(props: Omit<FormFieldProps, "type">) {
  return <FormField {...props} type="file" />
}
