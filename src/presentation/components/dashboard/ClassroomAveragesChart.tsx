/**
 * @fileoverview Gráfico de barras horizontales para promedios por salón
 * @module presentation/components/dashboard/ClassroomAveragesChart
 *
 * Muestra los promedios generales de cada salón con:
 * - Barras horizontales ordenadas por promedio
 * - Comparativo con año anterior
 * - Colores según rendimiento
 * - Tooltips informativos
 *
 * @author Cubbico SIA
 * @version 1.0.0
 */

import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { ClassroomAveragesChartProps } from '../../../shared/types/statisticsTypes';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// ============================================
// Constantes
// ============================================

const COLORS = {
  currentYear: {
    high: 'rgba(16, 185, 129, 0.85)',     // emerald-500
    medium: 'rgba(251, 191, 36, 0.85)',   // amber-400
    low: 'rgba(244, 63, 94, 0.85)',       // rose-500
  },
  previousYear: 'rgba(203, 213, 225, 0.6)', // slate-300
  border: {
    high: 'rgb(16, 185, 129)',
    medium: 'rgb(251, 191, 36)',
    low: 'rgb(244, 63, 94)',
  },
};

/**
 * Obtiene el color según el promedio
 */
const getBarColor = (average: number): string => {
  if (average >= 4.0) return COLORS.currentYear.high;
  if (average >= 3.5) return COLORS.currentYear.medium;
  return COLORS.currentYear.low;
};

/**
 * Obtiene el color del borde según el promedio
 */
const getBorderColor = (average: number): string => {
  if (average >= 4.0) return COLORS.border.high;
  if (average >= 3.5) return COLORS.border.medium;
  return COLORS.border.low;
};

// ============================================
// Componente de Loading
// ============================================

const LoadingSkeleton: React.FC<{ height: number }> = ({ height }) => (
  <div
    className="animate-pulse bg-gray-200 rounded-lg"
    style={{ height }}
  />
);

// ============================================
// Componente Principal
// ============================================

/**
 * ClassroomAveragesChart - Gráfico de promedios por salón
 */
export const ClassroomAveragesChart: React.FC<ClassroomAveragesChartProps & { embedded?: boolean }> = ({
  data,
  showComparison = true,
  height = 400,
  title = 'Promedios por Salón',
  onClassroomClick,
  isLoading = false,
  className = '',
  embedded = false,
}) => {
  // Configuración del gráfico
  const chartData = useMemo(() => {
    if (!data || !data.labels || data.labels.length === 0) {
      return null;
    }

    const datasets = [
      {
        label: data.currentYearLabel || 'Año Actual',
        data: data.currentYear,
        backgroundColor: data.currentYear.map(getBarColor),
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 6,
        barThickness: embedded ? 16 : 22,
      },
    ];

    // Agregar dataset del año anterior si hay comparativo
    if (showComparison && data.previousYear && data.previousYear.length > 0) {
      datasets.push({
        label: data.previousYearLabel || 'Año Anterior',
        data: data.previousYear,
        backgroundColor: data.previousYear.map(() => COLORS.previousYear),
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 6,
        barThickness: embedded ? 16 : 22,
      });
    }

    return {
      labels: data.labels,
      datasets,
    };
  }, [data, showComparison, embedded]);

  // Opciones del gráfico
  const options = useMemo(() => ({
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showComparison && data?.previousYear && data.previousYear.length > 0,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: 'Nunito, sans-serif',
            size: 12,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          family: 'Nunito, sans-serif',
          size: 14,
          weight: 'bold' as const,
        },
        bodyFont: {
          family: 'Nunito, sans-serif',
          size: 13,
        },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.x;
            const label = context.dataset.label;
            return `${label}: ${value.toFixed(2)}`;
          },
          afterLabel: (context: any) => {
            if (context.datasetIndex === 0 && showComparison && data?.previousYear) {
              const prevValue = data.previousYear[context.dataIndex];
              const currentValue = context.parsed.x;
              if (prevValue && prevValue > 0) {
                const diff = currentValue - prevValue;
                const sign = diff >= 0 ? '+' : '';
                return `Cambio: ${sign}${diff.toFixed(2)}`;
              }
            }
            return '';
          },
        },
      },
    },
    scales: {
      x: {
        min: 0,
        max: 5,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          stepSize: 0.5,
          font: {
            family: 'Nunito, sans-serif',
            size: 11,
          },
          callback: (value: number | string) => {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            return numValue.toFixed(1);
          },
        },
        title: {
          display: true,
          text: 'Promedio (1-5)',
          font: {
            family: 'Nunito, sans-serif',
            size: 12,
            weight: 'bold' as const,
          },
          color: '#6b7280',
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: 'Nunito, sans-serif',
            size: 12,
          },
          color: '#374151',
        },
      },
    },
    onClick: (_event: any, elements: any[]) => {
      if (elements.length > 0 && onClassroomClick && data?.labels) {
        const index = elements[0].index;
        // Asumimos que el ID del salón está en el label o podríamos tener otro array
        onClassroomClick(data.labels[index]);
      }
    },
  }), [showComparison, data, onClassroomClick]);

  // Clases del contenedor
  const containerClass = embedded
    ? className
    : `bg-white rounded-xl p-6 shadow-sm border border-gray-100 ${className}`;

  // Estados de UI
  if (isLoading) {
    return (
      <div className={containerClass}>
        {!embedded && <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4" />}
        <LoadingSkeleton height={height} />
      </div>
    );
  }

  if (!chartData || chartData.labels.length === 0) {
    return (
      <div className={containerClass}>
        {!embedded && title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
        <div
          className="flex items-center justify-center"
          style={{ height }}
        >
          <div className="text-center px-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-gray-200 rounded-2xl flex items-center justify-center">
              <svg
                className="h-8 w-8 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-600">Sin datos de salones</p>
            <p className="text-xs text-gray-400 mt-1">Verifica que los estudiantes estén asignados a salones</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      {/* Header - solo si no está embebido */}
      {!embedded && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="hidden sm:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-600">Alto (≥4.0)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-gray-600">Medio (3.5-4.0)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-gray-600">Bajo (&lt;3.5)</span>
            </div>
          </div>
        </div>
      )}

      {/* Leyenda compacta para modo embebido */}
      {embedded && (
        <div className="flex items-center justify-end gap-3 mb-3 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-gray-500">≥4.0</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-gray-500">3.5-4.0</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-gray-500">&lt;3.5</span>
          </div>
        </div>
      )}

      {/* Gráfico */}
      <div style={{ height }}>
        <Bar data={chartData} options={options} />
      </div>

      {/* Footer con estadísticas rápidas */}
      <div className={`mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4 text-center ${embedded ? 'text-sm' : ''}`}>
        <div>
          <p className={`font-bold text-gray-900 ${embedded ? 'text-xl' : 'text-2xl'}`}>
            {chartData.labels.length}
          </p>
          <p className="text-xs text-gray-500">Salones</p>
        </div>
        <div>
          <p className={`font-bold text-green-600 ${embedded ? 'text-xl' : 'text-2xl'}`}>
            {data.currentYear.filter(v => v >= 4.0).length}
          </p>
          <p className="text-xs text-gray-500">Alto rendimiento</p>
        </div>
        <div>
          <p className={`font-bold text-red-600 ${embedded ? 'text-xl' : 'text-2xl'}`}>
            {data.currentYear.filter(v => v < 3.5).length}
          </p>
          <p className="text-xs text-gray-500">Requieren atención</p>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Exports
// ============================================

export default ClassroomAveragesChart;
