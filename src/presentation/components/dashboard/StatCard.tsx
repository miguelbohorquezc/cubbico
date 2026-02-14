/**
 * @fileoverview Componente StatCard para estadísticas del Dashboard
 * @module presentation/components/dashboard/StatCard
 *
 * Tarjeta de estadística individual con icono, valor y tendencia.
 * Inspirado en el diseño "Academix" (ui/ui.webp).
 *
 * @example
 * ```tsx
 * <StatCard
 *   title="Total Estudiantes"
 *   value={250}
 *   icon={<StudentsIcon />}
 *   color="primary"
 *   trend={{ direction: 'up', value: 5.2, period: 'vs mes anterior' }}
 * />
 * ```
 *
 * @author Cubbico SIA
 * @version 1.0.0
 */

import React from 'react';
import type {
  StatCardProps,
  TrendInfo,
  TrendDirection,
  DashboardColorVariant,
} from '../../../shared/types/dashboardTypes';
import { formatNumber } from '../../../shared/types/dashboardTypes';

// ============================================
// Constantes de estilo
// ============================================

/**
 * Mapeo de variantes de color a clases de Tailwind
 * Cada variante tiene: fondo del icono, color del icono, borde hover
 */
const COLOR_VARIANTS: Record<
  DashboardColorVariant,
  { iconBg: string; iconColor: string; hoverBorder: string }
> = {
  primary: {
    iconBg: 'bg-deep-blue-100',
    iconColor: 'text-deep-blue-600',
    hoverBorder: 'hover:border-deep-blue-200',
  },
  secondary: {
    iconBg: 'bg-medium-blue-100',
    iconColor: 'text-medium-blue-600',
    hoverBorder: 'hover:border-medium-blue-200',
  },
  accent: {
    iconBg: 'bg-gold-100',
    iconColor: 'text-gold-600',
    hoverBorder: 'hover:border-gold-200',
  },
  success: {
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    hoverBorder: 'hover:border-green-200',
  },
  warning: {
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    hoverBorder: 'hover:border-orange-200',
  },
  error: {
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    hoverBorder: 'hover:border-red-200',
  },
  info: {
    iconBg: 'bg-orchid-blue-100',
    iconColor: 'text-sky-600',
    hoverBorder: 'hover:border-sky-200',
  },
  neutral: {
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    hoverBorder: 'hover:border-gray-200',
  },
};

/**
 * Colores para indicadores de tendencia
 */
const TREND_COLORS: Record<TrendDirection, { text: string; bg: string }> = {
  up: { text: 'text-green-600', bg: 'bg-green-50' },
  down: { text: 'text-red-600', bg: 'bg-red-50' },
  neutral: { text: 'text-gray-500', bg: 'bg-gray-50' },
};

// ============================================
// Componentes internos
// ============================================

/**
 * Icono de flecha para tendencia
 */
const TrendArrow: React.FC<{ direction: TrendDirection }> = ({ direction }) => {
  if (direction === 'neutral') {
    return (
      <svg
        className="w-3 h-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 12H4"
        />
      </svg>
    );
  }

  const isUp = direction === 'up';
  return (
    <svg
      className={`w-3 h-3 ${isUp ? '' : 'rotate-180'}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 10l7-7m0 0l7 7m-7-7v18"
      />
    </svg>
  );
};

/**
 * Skeleton loader para estado de carga
 */
const StatCardSkeleton: React.FC = () => (
  <div
    className="bg-white rounded-lg border border-gray-100 p-5 animate-pulse"
    aria-label="Cargando estadística"
    role="status"
  >
    <div className="flex items-start gap-4">
      {/* Icon skeleton */}
      <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0" />

      {/* Content skeleton */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-8 bg-gray-200 rounded w-16" />
        <div className="h-3 bg-gray-200 rounded w-20" />
      </div>
    </div>
  </div>
);

/**
 * Icono por defecto cuando no se proporciona uno
 */
const DefaultIcon: React.FC = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

// ============================================
// Componente Principal
// ============================================

/**
 * StatCard - Tarjeta de estadística para el Dashboard
 *
 * Muestra una métrica con icono, valor numérico y opcionalmente
 * un indicador de tendencia. Diseño inspirado en Academix.
 *
 * @param props - Props del componente según StatCardProps
 * @returns Componente React
 */
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  trend,
  subtitle,
  valueFormat = 'number',
  onClick,
  className = '',
  isLoading = false,
}) => {
  // Estado de carga
  if (isLoading) {
    return <StatCardSkeleton />;
  }

  // Obtener estilos de color
  const colorStyles = COLOR_VARIANTS[color] || COLOR_VARIANTS.primary;

  // Formatear valor según tipo
  const formattedValue = React.useMemo(() => {
    if (typeof value === 'string') return value;

    switch (valueFormat) {
      case 'percentage':
        return `${formatNumber(value)}%`;
      case 'currency':
        return `$${formatNumber(value)}`;
      case 'text':
        return String(value);
      case 'number':
      default:
        return formatNumber(value);
    }
  }, [value, valueFormat]);

  // Determinar si es clickeable
  const isClickable = Boolean(onClick);
  const CardElement = isClickable ? 'button' : 'div';

  // Clases del contenedor
  const containerClasses = [
    // Base
    'bg-white rounded-lg border border-gray-100 p-5',
    'transition-all duration-200 ease-in-out',
    // Sombra
    'shadow-card hover:shadow-card-hover',
    // Hover border
    colorStyles.hoverBorder,
    // Clickeable
    isClickable && 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-deep-blue-500 focus:ring-offset-2',
    // Animación de entrada
    'animate-fade-in',
    // Clases adicionales
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <CardElement
      className={containerClasses}
      onClick={onClick}
      type={isClickable ? 'button' : undefined}
      aria-label={isClickable ? `Ver detalles de ${title}` : undefined}
      role={isClickable ? 'button' : 'article'}
    >
      <div className="flex items-start gap-4">
        {/* Icono con fondo de color */}
        <div
          className={`
            w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0
            ${colorStyles.iconBg} ${colorStyles.iconColor}
            transition-transform duration-200
            ${isClickable ? 'group-hover:scale-110' : ''}
          `}
          aria-hidden="true"
        >
          {icon || <DefaultIcon />}
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          {/* Título */}
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>

          {/* Valor */}
          <p className="mt-1 text-2xl font-bold text-gray-900 tracking-tight">
            {formattedValue}
          </p>

          {/* Subtítulo o Tendencia */}
          <div className="mt-1 flex items-center gap-2">
            {trend && (
              <span
                className={`
                  inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded
                  ${TREND_COLORS[trend.direction].text}
                  ${TREND_COLORS[trend.direction].bg}
                `}
                aria-label={`Tendencia: ${trend.direction === 'up' ? 'subió' : trend.direction === 'down' ? 'bajó' : 'sin cambio'} ${trend.value}%`}
              >
                <TrendArrow direction={trend.direction} />
                <span>{trend.value}%</span>
              </span>
            )}

            {(subtitle || trend?.period) && (
              <span className="text-xs text-gray-400 truncate">
                {subtitle || trend?.period}
              </span>
            )}
          </div>
        </div>
      </div>
    </CardElement>
  );
};

// ============================================
// Exports
// ============================================

export default StatCard;

/**
 * Re-exportar tipos relacionados para conveniencia
 */
export type { StatCardProps, TrendInfo, TrendDirection, DashboardColorVariant };
