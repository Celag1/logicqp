'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Download, BarChart3, AlertTriangle } from 'lucide-react';

interface InventoryData {
  month: string;
  stock_total: number;
  stock_critico: number;
  rotacion: number;
  compras: number;
}

interface InventoryChartProps {
  data?: InventoryData[];
}

// Datos mock realistas para demostración
const mockInventoryData: InventoryData[] = [
  { month: 'Ene', stock_total: 15420, stock_critico: 1250, rotacion: 2.8, compras: 18500 },
  { month: 'Feb', stock_total: 14890, stock_critico: 1180, rotacion: 2.9, compras: 17200 },
  { month: 'Mar', stock_total: 16230, stock_critico: 1350, rotacion: 3.1, compras: 19800 },
  { month: 'Abr', stock_total: 15870, stock_critico: 1280, rotacion: 2.7, compras: 18100 },
  { month: 'May', stock_total: 17540, stock_critico: 1420, rotacion: 3.3, compras: 21500 },
  { month: 'Jun', stock_total: 16890, stock_critico: 1380, rotacion: 3.0, compras: 20200 },
  { month: 'Jul', stock_total: 18320, stock_critico: 1510, rotacion: 3.4, compras: 22800 },
  { month: 'Ago', stock_total: 17650, stock_critico: 1450, rotacion: 3.2, compras: 21100 },
  { month: 'Sep', stock_total: 19480, stock_critico: 1580, rotacion: 3.6, compras: 23900 },
  { month: 'Oct', stock_total: 18720, stock_critico: 1520, rotacion: 3.3, compras: 22500 },
  { month: 'Nov', stock_total: 20150, stock_critico: 1650, rotacion: 3.8, compras: 25200 },
  { month: 'Dic', stock_total: 19380, stock_critico: 1590, rotacion: 3.5, compras: 23800 }
];

export function InventoryChart({ data = mockInventoryData }: InventoryChartProps) {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [selectedMetric, setSelectedMetric] = useState<'stock_total' | 'stock_critico' | 'rotacion' | 'compras'>('stock_total');
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const initChart = async () => {
      try {
        const { Chart, registerables } = await import('chart.js/auto');
        Chart.register(...registerables);

        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        if (!chartRef.current) return;
        
        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;

        const chartData = {
          labels: data.map(d => d.month),
          datasets: [
            {
              label: getMetricLabel(selectedMetric),
              data: data.map(d => d[selectedMetric]),
              borderColor: getMetricColor(selectedMetric),
              backgroundColor: getMetricBackgroundColor(selectedMetric),
              tension: chartType === 'line' ? 0.4 : 0,
              fill: chartType === 'line',
              borderWidth: 3,
              pointBackgroundColor: getMetricColor(selectedMetric),
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 8,
            }
          ]
        };

        chartInstance.current = new Chart(ctx, {
          type: chartType,
          data: chartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                borderColor: getMetricColor(selectedMetric),
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                  label: function(context: any) {
                    const value = context.parsed.y;
                    if (selectedMetric === 'stock_total' || selectedMetric === 'stock_critico' || selectedMetric === 'compras') {
                      return `${getMetricLabel(selectedMetric)}: ${value.toLocaleString()}`;
                    }
                    return `${getMetricLabel(selectedMetric)}: ${value}`;
                  }
                }
              }
            },
            scales: {
              x: {
                grid: {
                  display: false
                },
                ticks: {
                  color: '#6b7280',
                  font: {
                    size: 12
                  }
                }
              },
              y: {
                grid: {
                  color: '#e5e7eb',
                  borderDash: [5, 5]
                },
                ticks: {
                  color: '#6b7280',
                  font: {
                    size: 12
                  },
                  callback: function(value: any) {
                    if (selectedMetric === 'stock_total' || selectedMetric === 'stock_critico' || selectedMetric === 'compras') {
                      return `${(value / 1000).toFixed(0)}k`;
                    }
                    return value;
                  }
                }
              }
            },
            interaction: {
              intersect: false,
              mode: 'index'
            },
            elements: {
              point: {
                hoverBackgroundColor: getMetricColor(selectedMetric),
                hoverBorderColor: '#ffffff'
              }
            }
          }
        });
      } catch (error) {
        console.error('Error al cargar Chart.js:', error);
      }
    };

    initChart();

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, chartType, selectedMetric]);

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'stock_total': return 'Stock Total';
      case 'stock_critico': return 'Stock Crítico';
      case 'rotacion': return 'Rotación';
      case 'compras': return 'Compras';
      default: return 'Stock Total';
    }
  };

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'stock_total': return '#10b981';
      case 'stock_critico': return '#ef4444';
      case 'rotacion': return '#8b5cf6';
      case 'compras': return '#f59e0b';
      default: return '#10b981';
    }
  };

  const getMetricBackgroundColor = (metric: string) => {
    switch (metric) {
      case 'stock_total': return 'rgba(16, 185, 129, 0.1)';
      case 'stock_critico': return 'rgba(239, 68, 68, 0.1)';
      case 'rotacion': return 'rgba(139, 92, 246, 0.1)';
      case 'compras': return 'rgba(245, 158, 11, 0.1)';
      default: return 'rgba(16, 185, 129, 0.1)';
    }
  };

  const handleExportChart = () => {
    if (chartInstance.current) {
      const canvas = chartInstance.current.canvas;
      const link = document.createElement('a');
      link.download = `inventario-${selectedMetric}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const currentValue = data[data.length - 1][selectedMetric];
  const previousValue = data[data.length - 2][selectedMetric];
  const growth = previousValue ? ((currentValue - previousValue) / previousValue * 100) : 0;
  const isCritical = selectedMetric === 'stock_critico' && currentValue > 1500;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-green-600" />
            <span>Tendencias de Inventario</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Select value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stock_total">Stock Total</SelectItem>
                <SelectItem value="stock_critico">Stock Crítico</SelectItem>
                <SelectItem value="rotacion">Rotación</SelectItem>
                <SelectItem value="compras">Compras</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Línea</SelectItem>
                <SelectItem value="bar">Barras</SelectItem>
                <SelectItem value="area">Área</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={handleExportChart}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {selectedMetric === 'stock_total' || selectedMetric === 'stock_critico' || selectedMetric === 'compras'
                ? currentValue.toLocaleString()
                : currentValue.toFixed(1)
              }
            </p>
            <p className="text-sm text-gray-600">
              {getMetricLabel(selectedMetric)} actual
            </p>
          </div>
          
          <div className="text-right">
            <div className={`flex items-center space-x-1 ${
              growth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <Package className={`h-4 w-4 ${
                growth >= 0 ? 'text-green-600' : 'text-red-600'
              }`} />
              <span className="font-semibold">{Math.abs(growth).toFixed(1)}%</span>
            </div>
            <p className="text-xs text-gray-500">
              vs mes anterior
            </p>
          </div>
        </div>
        
        {isCritical && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                Alerta: Stock crítico elevado. Revisar inventario urgentemente.
              </span>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="h-80 relative">
          <canvas ref={chartRef} />
          
          {!chartInstance.current && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-green-400 mx-auto mb-4 animate-pulse" />
                <p className="text-gray-600">Cargando gráfica...</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-600">Stock Promedio</p>
            <p className="text-lg font-semibold text-gray-900">
              {Math.round(data.reduce((sum, item) => sum + item.stock_total, 0) / data.length).toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-600">Rotación Promedio</p>
            <p className="text-lg font-semibold text-gray-900">
              {(data.reduce((sum, item) => sum + item.rotacion, 0) / data.length).toFixed(1)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
