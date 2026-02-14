/**
 * @fileoverview Gráfico de barras verticales para inasistencias
 * @module presentation/components/dashboard/AbsencesChart
 *
 * Muestra los estudiantes con mayor número de fallas:
 * - Barras apiladas (justificadas vs injustificadas)
 * - Top N estudiantes ordenados por fallas
 * - Indicador de riesgo de pérdida
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
import { IconAlertCircle } from '@tabler/icons-react';
import type { AbsencesChartProps } from '../../../shared/types/statisticsTypes';

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
  justified: {
    bg: 'rgba(52, 211, 153, 0.8)',     // emerald-400 - más vibrante
    border: 'rgb(52, 211, 153)',
  },
  unjustified: {
    bg: 'rgba(251, 113, 133, 0.8)',    // rose-400 - más suave y moderno
    border: 'rgb(251, 113, 133)',
  },
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
 * AbsencesChart - Gráfico de inasistencias por estudiante
 */
export const AbsencesChart: React.FC<AbsencesChartProps & { embedded?: boolean }> = ({
  data,
  height = 350,
  title = 'Estudiantes con Mayor Inasistencia',
  onStudentClick,
  isLoading = false,
  className = '',
  embedded = false,
}) => {
  // Configuración del gráfico
  const chartData = useMemo(() => {
    if (!data || !data.labels || data.labels.length === 0) {
      return null;
    }

    // Truncar nombres largos para el eje X
    const truncatedLabels = data.labels.map((label) => {
      if (label.length > 15) {
        return label.substring(0, 12) + '...';
      }
      return label;
    });

    return {
      labels: truncatedLabels,
      datasets: [
        {
          label: 'Injustificadas',
          data: data.unjustified,
          backgroundColor: COLORS.unjustified.bg,
          borderColor: 'transparent',
          borderWidth: 0,
          borderRadius: 4,
          barThickness: 24,
        },
        {
          label: 'Justificadas',
          data: data.justified,
          backgroundColor: COLORS.justified.bg,
          borderColor: 'transparent',
          borderWidth: 0,
          borderRadius: 4,
          barThickness: 24,
        },
      ],
    };
  }, [data]);

  // Opciones del gráfico
  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
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
          title: (items: any[]) => {
            if (items.length > 0 && data?.labels) {
              // Mostrar nombre completo en el tooltip
              return data.labels[items[0].dataIndex];
            }
            return '';
          },
          label: (context: any) => {
            const label = context.dataset.label;
            const value = context.parsed.y;
            return `${label}: ${value} falla${value !== 1 ? 's' : ''}`;
          },
          afterBody: (items: any[]) => {
            if (items.length > 0 && data) {
              const index = items[0].dataIndex;
              const total = (data.justified[index] || 0) + (data.unjustified[index] || 0);
              const unjustified = data.unjustified[index] || 0;
              const attendanceRate = Math.max(0, 100 - (unjustified * 0.625)); // Aproximado

              const lines = [
                '',
                `Total: ${total} fallas`,
              ];

              if (attendanceRate < 75) {
                lines.push('⚠️ En riesgo de pérdida');
              }

              return lines;
            }
            return [];
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: 'Nunito, sans-serif',
            size: 10,
          },
          color: '#6b7280',
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          stepSize: 5,
          font: {
            family: 'Nunito, sans-serif',
            size: 11,
          },
          color: '#6b7280',
        },
        title: {
          display: true,
          text: 'Número de Fallas',
          font: {
            family: 'Nunito, sans-serif',
            size: 12,
            weight: 'bold' as const,
          },
          color: '#6b7280',
        },
      },
    },
    onClick: (_event: any, elements: any[]) => {
      if (elements.length > 0 && onStudentClick && data?.labels) {
        const index = elements[0].index;
        onStudentClick(data.labels[index]);
      }
    },
  }), [data, onStudentClick]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    if (!data) return null;

    const totalUnjustified = data.unjustified.reduce((sum, val) => sum + val, 0);
    const totalJustified = data.justified.reduce((sum, val) => sum + val, 0);
    const atRiskCount = data.unjustified.filter((val) => val > 20).length; // Más de 20 fallas injustificadas

    return {
      totalUnjustified,
      totalJustified,
      total: totalUnjustified + totalJustified,
      atRiskCount,
    };
  }, [data]);

  // Clases del contenedor
  const containerClass = embedded
    ? className
    : `bg-white rounded-lg p-6 shadow-sm border border-gray-100 ${className}`;

  // Loading state
  if (isLoading) {
    return (
      <div className={containerClass}>
        {!embedded && <div className="h-6 w-56 bg-gray-200 rounded animate-pulse mb-4" />}
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
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            <p className="mt-2 text-sm">No hay datos de inasistencias</p>
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
          {stats && stats.atRiskCount > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 rounded-lg">
              <IconAlertCircle size={16} className="text-red-500" />
              <span className="text-xs font-medium text-red-700">
                {stats.atRiskCount} en riesgo
              </span>
            </div>
          )}
        </div>
      )}

      {/* Badge de riesgo compacto para modo embebido */}
      {embedded && stats && stats.atRiskCount > 0 && (
        <div className="flex items-center justify-end gap-1.5 mb-3">
          <div className="flex items-center gap-1 px-2 py-0.5 bg-red-50 rounded-full">
            <IconAlertCircle size={12} className="text-red-500" />
            <span className="text-xs font-medium text-red-700">
              {stats.atRiskCount} en riesgo
            </span>
          </div>
        </div>
      )}

      {/* Gráfico */}
      <div style={{ height }}>
        <Bar data={chartData} options={options} />
      </div>

      {/* Footer con estadísticas */}
      {stats && (
        <div className={`mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4 text-center ${embedded ? 'text-sm' : ''}`}>
          <div>
            <p className={`font-bold text-gray-900 ${embedded ? 'text-xl' : 'text-2xl'}`}>
              {data.topCount || data.labels.length}
            </p>
            <p className="text-xs text-gray-500">Estudiantes</p>
          </div>
          <div>
            <p className={`font-bold text-red-600 ${embedded ? 'text-xl' : 'text-2xl'}`}>
              {stats.totalUnjustified}
            </p>
            <p className="text-xs text-gray-500">Injustificadas</p>
          </div>
          <div>
            <p className={`font-bold text-green-600 ${embedded ? 'text-xl' : 'text-2xl'}`}>
              {stats.totalJustified}
            </p>
            <p className="text-xs text-gray-500">Justificadas</p>
          </div>
        </div>
      )}

      {/* Leyenda de riesgo - solo si no está embebido */}
      {!embedded && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <IconAlertCircle size={14} className="text-amber-500" />
            Estudiantes con más de 20 fallas injustificadas están en riesgo de pérdida por inasistencia
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================
// Exports
// ============================================

export default AbsencesChart;
