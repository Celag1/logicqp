'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, Download, BarChart3, TrendingUp } from 'lucide-react';

interface ProductData {
  nombre: string;
  ventas: number;
  crecimiento: number;
  categoria: string;
  porcentaje: number;
}

interface ProductsChartProps {
  data?: ProductData[];
  maxItems?: number;
}

// Datos mock realistas para demostración
const mockProductsData: ProductData[] = [
  { nombre: "Paracetamol 500mg", ventas: 156, crecimiento: 12.5, categoria: "Analgésicos", porcentaje: 18.2 },
  { nombre: "Vitamina C 1000mg", ventas: 134, crecimiento: 8.7, categoria: "Vitaminas", porcentaje: 15.6 },
  { nombre: "Ibuprofeno 400mg", ventas: 98, crecimiento: 15.2, categoria: "Antiinflamatorios", porcentaje: 11.4 },
  { nombre: "Omeprazol 20mg", ventas: 87, crecimiento: 6.3, categoria: "Gastrointestinales", porcentaje: 10.1 },
  { nombre: "Loratadina 10mg", ventas: 76, crecimiento: 9.8, categoria: "Antihistamínicos", porcentaje: 8.9 },
  { nombre: "Metformina 500mg", ventas: 65, crecimiento: 11.4, categoria: "Antidiabéticos", porcentaje: 7.6 },
  { nombre: "Amlodipino 5mg", ventas: 58, crecimiento: 7.2, categoria: "Cardiovasculares", porcentaje: 6.8 },
  { nombre: "Salbutamol 100mcg", ventas: 52, crecimiento: 13.8, categoria: "Respiratorios", porcentaje: 6.1 },
  { nombre: "Diclofenaco 50mg", ventas: 48, crecimiento: 5.9, categoria: "Antiinflamatorios", porcentaje: 5.6 },
  { nombre: "Ranitidina 150mg", ventas: 42, crecimiento: 8.1, categoria: "Gastrointestinales", porcentaje: 4.9 }
];

export function ProductsChart({ data = mockProductsData, maxItems = 10 }: ProductsChartProps) {
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'doughnut'>('bar');
  const [sortBy, setSortBy] = useState<'ventas' | 'crecimiento'>('ventas');
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  // Ordenar y limitar datos
  const sortedData = [...data]
    .sort((a, b) => b[sortBy] - a[sortBy])
    .slice(0, maxItems);

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

        const colors = [
          '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444',
          '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
        ];

        const chartData = {
          labels: sortedData.map(d => d.nombre.length > 20 ? d.nombre.substring(0, 20) + '...' : d.nombre),
          datasets: [
            {
              label: 'Ventas',
              data: sortedData.map(d => d.ventas),
              backgroundColor: chartType === 'bar' ? colors[0] : colors.slice(0, sortedData.length),
              borderColor: chartType === 'bar' ? colors[0] : colors.slice(0, sortedData.length),
              borderWidth: chartType === 'bar' ? 0 : 2,
              borderRadius: chartType === 'bar' ? 4 : 0,
              hoverBackgroundColor: chartType === 'bar' ? '#2563eb' : colors.slice(0, sortedData.length).map(c => c + '80'),
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
                display: chartType !== 'bar',
                position: 'bottom' as const,
                labels: {
                  padding: 20,
                  usePointStyle: true,
                  font: {
                    size: 12
                  }
                }
              },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                borderColor: colors[0],
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                  label: function(context: any) {
                    const value = context.parsed.y || context.parsed;
                    const product = sortedData[context.dataIndex];
                    return [
                      `Ventas: ${value}`,
                      `Crecimiento: ${product.crecimiento}%`,
                      `Categoría: ${product.categoria}`
                    ];
                  }
                }
              }
            },
            scales: chartType === 'bar' ? {
              x: {
                grid: {
                  display: false
                },
                ticks: {
                  color: '#6b7280',
                  font: {
                    size: 11
                  },
                  maxRotation: 45,
                  minRotation: 0
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
                  }
                }
              }
            } : undefined,
            interaction: {
              intersect: false,
              mode: 'index'
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
  }, [sortedData, chartType, sortBy]);

  const handleExportChart = () => {
    if (chartInstance.current) {
      const canvas = chartInstance.current.canvas;
      const link = document.createElement('a');
      link.download = `productos-vendidos-${chartType}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const totalVentas = sortedData.reduce((sum, item) => sum + item.ventas, 0);
  const promedioCrecimiento = sortedData.reduce((sum, item) => sum + item.crecimiento, 0) / sortedData.length;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-yellow-600" />
            <span>Productos Más Vendidos</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ventas">Por Ventas</SelectItem>
                <SelectItem value="crecimiento">Por Crecimiento</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Barras</SelectItem>
                <SelectItem value="pie">Circular</SelectItem>
                <SelectItem value="doughnut">Anillo</SelectItem>
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
            <p className="text-2xl font-bold text-gray-900">{totalVentas.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total de ventas del top {maxItems}</p>
          </div>
          
          <div className="text-right">
            <div className="flex items-center space-x-1 text-green-600">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="font-semibold">{promedioCrecimiento.toFixed(1)}%</span>
            </div>
            <p className="text-xs text-gray-500">Crecimiento promedio</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-80 relative">
          <canvas ref={chartRef} />
          
          {!chartInstance.current && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-yellow-400 mx-auto mb-4 animate-pulse" />
                <p className="text-gray-600">Cargando gráfica...</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 space-y-3">
          {sortedData.slice(0, 5).map((product, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-yellow-600">{index + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{product.nombre}</p>
                  <p className="text-sm text-gray-500">{product.categoria}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{product.ventas} ventas</p>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-sm text-green-600">{product.crecimiento}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
