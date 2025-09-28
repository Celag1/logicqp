'use client'

import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'

interface BarcodeGeneratorProps {
  value: string
  format?: 'CODE128' | 'EAN13' | 'EAN8' | 'UPC' | 'CODE39'
  width?: number
  height?: number
  displayValue?: boolean
  fontSize?: number
  margin?: number
  className?: string
}

export function BarcodeGenerator({
  value,
  format = 'CODE128',
  width = 2,
  height = 100,
  displayValue = true,
  fontSize = 14,
  margin = 10,
  className = ''
}: BarcodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && value) {
      try {
        JsBarcode(canvasRef.current, value, {
          format: format,
          width: width,
          height: height,
          displayValue: displayValue,
          fontSize: fontSize,
          margin: margin,
          background: '#ffffff',
          lineColor: '#000000',
          textAlign: 'center',
          textPosition: 'bottom',
          textMargin: 2
        })
      } catch (error) {
        console.error('Error generando código de barras:', error)
      }
    }
  }, [value, format, width, height, displayValue, fontSize, margin])

  if (!value) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 ${className}`}>
        <span className="text-gray-500 text-sm">Sin código de barras</span>
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <canvas ref={canvasRef} />
      <div className="mt-2 text-xs text-gray-600 text-center">
        {format} - {value}
      </div>
    </div>
  )
}

// Componente para mostrar código de barras en tabla
export function BarcodeCell({ value, format = 'CODE128' }: { value: string; format?: string }) {
  return (
    <div className="flex items-center justify-center">
      <BarcodeGenerator
        value={value}
        format={format as any}
        width={1.5}
        height={60}
        fontSize={10}
        margin={5}
        className="max-w-full"
      />
    </div>
  )
}

// Componente para imprimir etiquetas de productos
export function ProductBarcodeLabel({ 
  codigo, 
  nombre, 
  precio, 
  formato = 'CODE128' 
}: { 
  codigo: string
  nombre: string
  precio: number
  formato?: string
}) {
  return (
    <div className="border border-gray-300 p-4 bg-white w-64">
      <div className="text-center mb-2">
        <h3 className="font-bold text-lg">Qualipharm</h3>
        <p className="text-sm text-gray-600">Laboratorio Farmacéutico</p>
      </div>
      
      <div className="mb-3">
        <BarcodeGenerator
          value={codigo}
          format={formato as any}
          width={2}
          height={80}
          fontSize={12}
          margin={5}
        />
      </div>
      
      <div className="text-center">
        <p className="font-semibold text-sm mb-1">{nombre}</p>
        <p className="text-lg font-bold text-green-600">${precio.toFixed(2)}</p>
        <p className="text-xs text-gray-500">Código: {codigo}</p>
      </div>
    </div>
  )
}

