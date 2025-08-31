"use client"

import * as React from "react"
import { Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TimePickerProps {
  time?: string
  onTimeChange?: (time: string) => void
  placeholder?: string
  disabled?: boolean
}

export function TimePicker({
  time,
  onTimeChange,
  placeholder = "Seleccionar hora",
  disabled = false,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [hours, setHours] = React.useState("")
  const [minutes, setMinutes] = React.useState("")

  React.useEffect(() => {
    if (time) {
      const [h, m] = time.split(":")
      setHours(h)
      setMinutes(m)
    }
  }, [time])

  const handleTimeChange = () => {
    if (hours && minutes) {
      const formattedTime = `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`
      onTimeChange?.(formattedTime)
      setIsOpen(false)
    }
  }

  const handleQuickTime = (quickTime: string) => {
    onTimeChange?.(quickTime)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !time && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          {time || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Hora</Label>
            <Input
              type="number"
              min="0"
              max="23"
              placeholder="00"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-20"
            />
          </div>
          <div className="space-y-2">
            <Label>Minutos</Label>
            <Input
              type="number"
              min="0"
              max="59"
              placeholder="00"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="w-20"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleTimeChange} size="sm">
              Aplicar
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              size="sm"
            >
              Cancelar
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {["08:00", "12:00", "14:00", "16:00", "18:00", "20:00"].map(
              (quickTime) => (
                <Button
                  key={quickTime}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickTime(quickTime)}
                  className="text-xs"
                >
                  {quickTime}
                </Button>
              )
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
