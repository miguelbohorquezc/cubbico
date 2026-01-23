/**
 * @fileoverview Gráfico de barras horizontales para promedios por asignatura
 * @module presentation/components/dashboard/SubjectAveragesChart
 *
 * Muestra las asignaturas ordenadas por promedio (las más bajas primero):
 * - Barras horizontales con colores según rendimiento
 * - Comparativo con año anterior
 * - Indicador de asignaturas críticas
 * - Porcentaje de aprobación en tooltip
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
import { IconBook, IconAlertTriangle } from '@tabler/icons-react';
import type { SubjectAveragesChartProps } from '../../../shared/types/statisticsTypes';
import { LOW_AVERAGE_THRESHOLD } from '../../../shared/types/statisticsTypes';

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
    high: 'rgba(16, 185, 129, 0.85)',     // emerald-500 - más vibrante
    medium: 'rgba(251, 191, 36, 0.85)',   // amber-400 - más cálido
    low: 'rgba(244, 63, 94, 0.85)',       // rose-500 - más moderno
  },
  previousYear: 'rgba(203, 213, 225, 0.6)', // slate-300 - más sutil
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
  if (average >= LOW_AVERAGE_THRESHOLD) return COLORS.currentYear.medium;
  return COLORS.currentYear.low;
};

/**
 * Obtiene el color del borde según el promedio
 */
const getBorderColor = (average: number): string => {
  if (average >= 4.0) return COLORS.border.high;
  if (average >= LOW_AVERAGE_THRESHOLD) return COLORS.border.medium;
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
 * SubjectAveragesChart - Gráfico de promedios por asignatura
 */
export const SubjectAveragesChart: React.FC<SubjectAveragesChartProps & { embedded?: boolean }> = ({
  data,
  showComparison = true,
  height = 400,
  title = 'Rendimiento por Asignatura',
  onSubjectClick,
  isLoading = false,
  className = '',
  embedded = false,
}) => {
  // Configuración del gráfico
  const chartData = useMemo(() => {
    if (!data || !data.labels || data.labels.length === 0) {
      return null;
    }

    // Limitar a 10 asignaturas máximo para mejor visualización
    const maxItems = embedded ? 8 : 12;
    const limitedLabels = data.labels.slice(0, maxItems);
    const limitedCurrentYear = data.currentYear.slice(0, maxItems);
    const limitedPreviousYear = data.previousYear?.slice(0, maxItems);

    const datasets = [
      {
        label: 'Año Actual',
        data: limitedCurrentYear,
        backgroundColor: limitedCurrentYear.map(getBarColor),
        borderColor: limitedCurrentYear.map(getBorderColor),
        borderWidth: 0,
        borderRadius: 6,
        barThickness: embedded ? 14 : 20,
      },
    ];

    // Agregar dataset del año anterior si hay comparativo
    if (showComparison && limitedPreviousYear && limitedPreviousYear.length > 0) {
      datasets.push({
        label: 'Año Anterior',
        data: limitedPreviousYear,
        backgroundColor: limitedPreviousYear.map(() => COLORS.previousYear),
        borderColor: limitedPreviousYear.map(() => 'transparent'),
        borderWidth: 0,
        borderRadius: 6,
        barThickness: embedded ? 14 : 20,
      });
    }

    return {
      labels: limitedLabels,
      datasets,
    };
  }, [data, showComparison, embedded]);

  // Estadísticas calculadas
  const stats = useMemo(() => {
    if (!data || !data.currentYear) return null;

    const criticalCount = data.currentYear.filter(
      (avg) => avg > 0 && avg < LOW_AVERAGE_THRESHOLD
    ).length;

    const highCount = data.currentYear.filter((avg) => avg >= 4.0).length;

    const overallAverage =
      data.currentYear.length > 0
        ? data.currentYear.reduce((sum, val) => sum + val, 0) / data.currentYear.length
        : 0;

    return {
      total: data.labels.length,
      criticalCount,
      highCount,
      overallAverage: overallAverage.toFixed(2),
    };
  }, [data]);

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
            if (context.datasetIndex === 0) {
              const value = context.parsed.x;
              const lines: string[] = [];

              // Cambio respecto al año anterior
              if (showComparison && data?.previousYear) {
                const prevValue = data.previousYear[context.dataIndex];
                if (prevValue && prevValue > 0) {
                  const diff = value - prevValue;
                  const sign = diff >= 0 ? '+' : '';
                  lines.push(`Cambio: ${sign}${diff.toFixed(2)}`);
                }
              }

              // Indicador de estado
              if (value < LOW_AVERAGE_THRESHOLD) {
                lines.push('⚠️ Requiere atención');
              } else if (value >= 4.0) {
                lines.push('✅ Buen rendimiento');
              }

              return lines;
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
            size: 11,
          },
          color: '#374151',
        },
      },
    },
    onClick: (_event: any, elements: any[]) => {
      if (elements.length > 0 && onSubjectClick && data?.areaIds) {
        const index = elements[0].index;
        onSubjectClick(data.areaIds[index]);
      }
    },
  }), [showComparison, data, onSubjectClick]);

  // Clases del contenedor
  const containerClass = embedded
    ? className
    : `bg-white rounded-xl p-6 shadow-sm border border-gray-100 ${className}`;

  // Loading state
  if (isLoading) {
    return (
      <div className={containerClass}>
        {!embedded && <div className="h-6 w-52 bg-gray-200 rounded animate-pulse mb-4" />}
        <LoadingSkeleton height={height} />
      </div>
    );
  }

  // Estado vacío
  if (!chartData || chartData.labels.length === 0) {
    return (
      <div className={containerClass}>
        {!embedded && title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
        <div
          className="flex items-center justify-center text-gray-500"
          style={{ height }}
        >
          <div className="text-center">
            <IconBook size={48} className="mx-auto text-gray-400" />
            <p className="mt-2 text-sm">No hay datos de asignaturas</p>
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
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {stats && stats.criticalCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                <IconAlertTriangle size={14} />
                {stats.criticalCount} crítica{stats.criticalCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-600">≥4.0</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-gray-600">3.5-4.0</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-gray-600">&lt;3.5</span>
            </div>
          </div>
        </div>
      )}

      {/* Header compacto para modo embebido */}
      {embedded && (
        <div className="flex items-center justify-between mb-3">
          {stats && stats.criticalCount > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
              <IconAlertTriangle size={12} />
              {stats.criticalCount} crítica{stats.criticalCount !== 1 ? 's' : ''}
            </span>
          )}
          <div className="flex items-center gap-2 text-xs ml-auto">
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
        </div>
      )}

      {/* Gráfico */}
      <div style={{ height }}>
        <Bar data={chartData} options={options} />
      </div>

      {/* Footer con estadísticas */}
      {stats && (
        <div className={`mt-4 pt-4 border-t border-gray-100 grid grid-cols-4 gap-4 text-center ${embedded ? 'text-sm' : ''}`}>
          <div>
            <p className={`font-bold text-gray-900 ${embedded ? 'text-lg' : 'text-2xl'}`}>
              {stats.total}
            </p>
            <p className="text-xs text-gray-500">Asignaturas</p>
          </div>
          <div>
            <p className={`font-bold text-blue-600 ${embedded ? 'text-lg' : 'text-2xl'}`}>
              {stats.overallAverage}
            </p>
            <p className="text-xs text-gray-500">Promedio</p>
          </div>
          <div>
            <p className={`font-bold text-green-600 ${embedded ? 'text-lg' : 'text-2xl'}`}>
              {stats.highCount}
            </p>
            <p className="text-xs text-gray-500">Alto</p>
          </div>
          <div>
            <p className={`font-bold text-red-600 ${embedded ? 'text-lg' : 'text-2xl'}`}>
              {stats.criticalCount}
            </p>
            <p className="text-xs text-gray-500">Críticas</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// Exports
// ============================================

export default SubjectAveragesChart;
