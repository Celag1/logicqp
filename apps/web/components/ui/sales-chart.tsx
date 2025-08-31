'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Download, BarChart3 } from 'lucide-react';

interface SalesData {
  month: string;
  sales: number;
  orders: number;
  customers: number;
}

interface SalesChartProps {
  data?: SalesData[];
  period?: string;
  onPeriodChange?: (period: string) => void;
}

// Datos mock realistas para demostración
const mockSalesData: SalesData[] = [
  { month: 'Ene', sales: 45230, orders: 156, customers: 89 },
  { month: 'Feb', sales: 48950, orders: 168, customers: 92 },
  { month: 'Mar', sales: 52340, orders: 175, customers: 95 },
  { month: 'Abr', sales: 48760, orders: 162, customers: 88 },
  { month: 'May', sales: 54120, orders: 183, customers: 97 },
  { month: 'Jun', sales: 59840, orders: 195, customers: 104 },
  { month: 'Jul', sales: 62350, orders: 208, customers: 112 },
  { month: 'Ago', sales: 58760, orders: 198, customers: 105 },
  { month: 'Sep', sales: 65420, orders: 215, customers: 118 },
  { month: 'Oct', sales: 69850, orders: 228, customers: 125 },
  { month: 'Nov', sales: 72340, orders: 235, customers: 132 },
  { month: 'Dic', sales: 78920, orders: 248, customers: 141 }
];

export function SalesChart({ data = mockSalesData, period = 'año', onPeriodChange }: SalesChartProps) {
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
  const [selectedMetric, setSelectedMetric] = useState<'sales' | 'orders' | 'customers'>('sales');
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Importar Chart.js dinámicamente
    const initChart = async () => {
      try {
        const { Chart, registerables } = await import('chart.js/auto');
        Chart.register(...registerables);

        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

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
              fill: chartType === 'area',
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
                    if (selectedMetric === 'sales') {
                      return `$${value.toLocaleString()}`;
                    }
                    return `${value} ${getMetricLabel(selectedMetric).toLowerCase()}`;
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
                    if (selectedMetric === 'sales') {
                      return `$${(value / 1000).toFixed(0)}k`;
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
      case 'sales': return 'Ventas';
      case 'orders': return 'Órdenes';
      case 'customers': return 'Clientes';
      default: return 'Ventas';
    }
  };

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'sales': return '#3b82f6';
      case 'orders': return '#10b981';
      case 'customers': return '#8b5cf6';
      default: return '#3b82f6';
    }
  };

  const getMetricBackgroundColor = (metric: string) => {
    switch (metric) {
      case 'sales': return 'rgba(59, 130, 246, 0.1)';
      case 'orders': return 'rgba(16, 185, 129, 0.1)';
      case 'customers': return 'rgba(139, 92, 246, 0.1)';
      default: return 'rgba(59, 130, 246, 0.1)';
    }
  };

  const handleExportChart = () => {
    if (chartInstance.current) {
      const canvas = chartInstance.current.canvas;
      const link = document.createElement('a');
      link.download = `ventas-${period}-${selectedMetric}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const totalValue = data.reduce((sum, item) => sum + item[selectedMetric], 0);
  const growth = data.length > 1 ? 
    ((data[data.length - 1][selectedMetric] - data[data.length - 2][selectedMetric]) / data[data.length - 2][selectedMetric] * 100) : 0;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span>Ventas Mensuales</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Select value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Ventas</SelectItem>
                <SelectItem value="orders">Órdenes</SelectItem>
                <SelectItem value="customers">Clientes</SelectItem>
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
              {selectedMetric === 'sales' ? `$${totalValue.toLocaleString()}` : totalValue.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              Total {getMetricLabel(selectedMetric).toLowerCase()} del período
            </p>
          </div>
          
          <div className="text-right">
            <div className={`flex items-center space-x-1 ${
              growth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`h-4 w-4 ${
                growth >= 0 ? 'text-green-600' : 'text-red-600'
              }`} />
              <span className="font-semibold">{Math.abs(growth).toFixed(1)}%</span>
            </div>
            <p className="text-xs text-gray-500">
              vs período anterior
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-80 relative">
          <canvas ref={chartRef} />
          
          {!chartInstance.current && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-blue-400 mx-auto mb-4 animate-pulse" />
                <p className="text-gray-600">Cargando gráfica...</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm font-medium text-gray-600">Promedio</p>
            <p className="text-lg font-semibold text-gray-900">
              {selectedMetric === 'sales' 
                ? `$${(totalValue / data.length).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                : Math.round(totalValue / data.length)
              }
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Máximo</p>
            <p className="text-lg font-semibold text-gray-900">
              {selectedMetric === 'sales'
                ? `$${Math.max(...data.map(d => d[selectedMetric])).toLocaleString()}`
                : Math.max(...data.map(d => d[selectedMetric]))
              }
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Mínimo</p>
            <p className="text-lg font-semibold text-gray-900">
              {selectedMetric === 'sales'
                ? `$${Math.min(...data.map(d => d[selectedMetric])).toLocaleString()}`
                : Math.min(...data.map(d => d[selectedMetric]))
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
