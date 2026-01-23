/**
 * @fileoverview Barrel export para componentes del Dashboard
 * @module presentation/components/dashboard
 *
 * Este módulo exporta todos los componentes UI del Dashboard.
 * Importar desde aquí para mantener imports limpios.
 *
 * @example
 * ```tsx
 * import { StatCard, ProgressBar, Card } from '@/presentation/components/dashboard';
 * ```
 *
 * @author Cubbico SIA
 * @version 1.0.0
 */

// ============================================
// Componentes
// ============================================

/**
 * StatCard - Tarjeta de estadística con icono, valor y tendencia
 * @see {@link ./StatCard.tsx}
 */
export { StatCard, default as StatCardDefault } from './StatCard';

/**
 * ClassroomAveragesChart - Gráfico de promedios por salón
 * @see {@link ./ClassroomAveragesChart.tsx}
 */
export { ClassroomAveragesChart } from './ClassroomAveragesChart';

/**
 * LowPerformanceAlert - Tabla de alertas de bajo rendimiento
 * @see {@link ./LowPerformanceAlert.tsx}
 */
export { LowPerformanceAlert } from './LowPerformanceAlert';

/**
 * AbsencesChart - Gráfico de inasistencias por estudiante
 * @see {@link ./AbsencesChart.tsx}
 */
export { AbsencesChart } from './AbsencesChart';

/**
 * SubjectAveragesChart - Gráfico de promedios por asignatura
 * @see {@link ./SubjectAveragesChart.tsx}
 */
export { SubjectAveragesChart } from './SubjectAveragesChart';

// ============================================
// Tipos re-exportados
// ============================================

export type {
  StatCardProps,
  TrendInfo,
  TrendDirection,
  DashboardColorVariant,
} from './StatCard';

// ============================================
// Componentes futuros (placeholders)
// ============================================

// TODO: MT-D03 - ProgressBar
// export { ProgressBar } from './ProgressBar';

// TODO: MT-D04 - IconBadge
// export { IconBadge } from './IconBadge';

// TODO: MT-D05 - DataTableV2
// export { DataTableV2 } from './DataTableV2';

// TODO: MT-D06 - Card
// export { Card } from './Card';
