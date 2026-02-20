/**
 * @fileoverview Tabla de alertas de estudiantes con bajo rendimiento
 * @module presentation/components/dashboard/LowPerformanceAlert
 *
 * Muestra estudiantes con promedio menor al umbral (3.5) con:
 * - Badges de severidad por colores
 * - Indicador de tendencia
 * - Asignaturas problemáticas
 * - Contador de fallas
 *
 * @author Cubbico SIA
 * @version 1.0.0
 */

import React, { useState, useMemo } from 'react';
import {
  IconAlertTriangle,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconChevronRight,
  IconUsers,
} from '@tabler/icons-react';
import type { LowPerformanceAlertProps, LowPerformanceStudent, AlertSeverity, PerformanceTrend } from '../../../shared/types/statisticsTypes';
import { formatAverage } from '../../../shared/types/statisticsTypes';

// ============================================
// Constantes
// ============================================

const SEVERITY_CONFIG: Record<AlertSeverity, { label: string; icon: string; color: string }> = {
  critical: {
    label: 'Crítico',
    icon: '',
    color: 'bg-rose-100 text-rose-700 border-rose-200',
  },
  warning: {
    label: 'Alerta',
    icon: '',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  watch: {
    label: 'Observación',
    icon: '',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
  },
};

// ============================================
// Subcomponentes
// ============================================

/**
 * Badge de severidad
 */
const SeverityBadge: React.FC<{ severity: AlertSeverity }> = ({ severity }) => {
  const config = SEVERITY_CONFIG[severity];
  return (
    <span
      className={`
        inline-flex items-center
        px-2 py-0.5
        text-[10px] font-semibold uppercase tracking-wide
        rounded-md
        ${config.color}
      `}
    >
      {config.label}
    </span>
  );
};

/**
 * Indicador de tendencia
 */
const TrendIndicator: React.FC<{ trend: PerformanceTrend }> = ({ trend }) => {
  const config = {
    improving: {
      icon: IconTrendingUp,
      color: 'text-green-600',
      label: 'Mejorando',
    },
    declining: {
      icon: IconTrendingDown,
      color: 'text-red-600',
      label: 'Declinando',
    },
    stable: {
      icon: IconMinus,
      color: 'text-gray-500',
      label: 'Estable',
    },
  };

  const { icon: Icon, color, label } = config[trend];

  return (
    <div className={`flex items-center gap-1 ${color}`} title={label}>
      <Icon size={16} stroke={2} />
      <span className="text-xs hidden lg:inline">{label}</span>
    </div>
  );
};

/**
 * Skeleton de carga
 */
const LoadingSkeleton: React.FC = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="animate-pulse flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="h-6 w-16 bg-gray-200 rounded-full" />
      </div>
    ))}
  </div>
);

/**
 * Fila de estudiante
 */
const StudentRow: React.FC<{
  student: LowPerformanceStudent;
  onClick?: (studentId: string) => void;
}> = ({ student, onClick }) => {
  // Obtener iniciales del nombre
  const initials = useMemo(() => {
    const parts = student.fullName.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return student.fullName.substring(0, 2).toUpperCase();
  }, [student.fullName]);

  // Color del avatar según severidad - más suaves y modernos
  const avatarConfig = {
    critical: { bg: 'bg-orchid-blue-50', ring: 'ring-rose-200' },
    warning: { bg: 'bg-orchid-blue-50', ring: 'ring-orange-200' },
    watch: { bg: 'bg-orchid-blue-50', ring: 'ring-amber-200' },
  }[student.severity];

  return (
    <div
      onClick={() => onClick?.(student.studentId)}
      className={`
        flex items-center gap-3 p-3
        hover:bg-gradient-to-r hover:bg-orchid-blue-60
        border-b border-gray-100/80 last:border-b-0
        transition-all duration-200
        ${onClick ? 'cursor-pointer' : ''}
        group
      `}
    >
      {/* Avatar */}
      <div
        className={`
          flex-shrink-0 w-9 h-9
          ${avatarConfig.bg}
          rounded-lg ring-2 ${avatarConfig.ring}
          flex items-center justify-center
          text-white text-xs font-bold
          shadow-sm
          group-hover:scale-105 transition-transform duration-200
        `}
      >
        {initials}
      </div>

      {/* Info del estudiante */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900 truncate">
            {student.fullName}
          </p>
          <SeverityBadge severity={student.severity} />
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-500 truncate">
            {student.classroomName}
          </span>
          {student.problemSubjects.length > 0 && (
            <>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-red-600 truncate">
                {student.problemSubjects.slice(0, 2).join(', ')}
                {student.problemSubjects.length > 2 && ` +${student.problemSubjects.length - 2}`}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Promedio y tendencia */}
      <div className="flex items-center gap-3">
        {/* Fallas */}
        {student.totalAbsences > 0 && (
          <div className="hidden sm:flex flex-col items-center">
            <span className="text-xs font-medium text-gray-900">
              {student.totalAbsences}
            </span>
            <span className="text-[10px] text-gray-500">fallas</span>
          </div>
        )}

        {/* Promedio */}
        <div className="flex flex-col items-center">
          <span
            className={`
              text-lg font-bold
              ${student.severity === 'critical' ? 'text-red-600' : ''}
              ${student.severity === 'warning' ? 'text-orange-600' : ''}
              ${student.severity === 'watch' ? 'text-amber-600' : ''}
            `}
          >
            {formatAverage(student.currentAverage)}
          </span>
          <TrendIndicator trend={student.trend} />
        </div>

        {/* Chevron */}
        {onClick && (
          <IconChevronRight
            size={20}
            className="text-gray-400"
          />
        )}
      </div>
    </div>
  );
};

// ============================================
// Componente Principal
// ============================================

/**
 * LowPerformanceAlert - Tabla de alertas de bajo rendimiento
 */
export const LowPerformanceAlert: React.FC<LowPerformanceAlertProps & { embedded?: boolean }> = ({
  data,
  maxItems = 10,
  onStudentClick,
  isLoading = false,
  className = '',
  embedded = false,
}) => {
  const [showAll, setShowAll] = useState(false);

  // Estudiantes a mostrar (limitados o todos)
  const displayedStudents = useMemo(() => {
    if (!data?.students) return [];
    if (showAll) return data.students;
    return data.students.slice(0, maxItems);
  }, [data?.students, maxItems, showAll]);

  const hasMore = data?.students && data.students.length > maxItems;

  // Clases del contenedor
  const containerClass = embedded
    ? className
    : `bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden ${className}`;

  // Loading state
  if (isLoading) {
    return (
      <div className={embedded ? className : `bg-white rounded-lg p-6 shadow-sm border border-gray-100 ${className}`}>
        {!embedded && <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4" />}
        <LoadingSkeleton />
      </div>
    );
  }

  // Estado vacío
  if (!data || data.totalAlerts === 0) {
    return (
      <div className={embedded ? className : `bg-white rounded-lg p-6 shadow-sm border border-gray-100 ${className}`}>
        {!embedded && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Alertas de Rendimiento
          </h3>
        )}
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-20 h-20 bg-orchid-blue-50 rounded-lg flex items-center justify-center mb-4 shadow-sm">
            <IconUsers size={36} className="text-tosca-600" />
          </div>
          <p className="text-gray-800 font-semibold">Todo en orden</p>
          <p className="text-sm text-gray-500 mt-1 max-w-[200px]">
            No hay estudiantes con bajo rendimiento
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      {/* Header - solo si no está embebido */}
      {!embedded && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconAlertTriangle size={20} className="text-amber-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Alertas de Rendimiento
              </h3>
            </div>
            <span className="text-sm text-gray-500">
              {data.totalAlerts} estudiante{data.totalAlerts !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Contadores por severidad */}
          <div className="flex items-center gap-4 mt-3">
            {data.criticalCount > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs text-gray-600">
                  {data.criticalCount} crítico{data.criticalCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            {data.warningCount > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-xs text-gray-600">
                  {data.warningCount} alerta{data.warningCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            {data.watchCount > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs text-gray-600">
                  {data.watchCount} en observación
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resumen compacto para modo embebido */}
      {embedded && (
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100/80">
          <span className="text-sm font-semibold text-gray-700">
            {data.totalAlerts} estudiante{data.totalAlerts !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            {data.criticalCount > 0 && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-rose-50 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span className="text-xs font-medium text-rose-600">{data.criticalCount}</span>
              </div>
            )}
            {data.warningCount > 0 && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-50 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                <span className="text-xs font-medium text-orange-600">{data.warningCount}</span>
              </div>
            )}
            {data.watchCount > 0 && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="text-xs font-medium text-amber-600">{data.watchCount}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lista de estudiantes */}
      <div className={`divide-y divide-gray-100 ${embedded ? 'max-h-[350px] overflow-y-auto' : ''}`}>
        {displayedStudents.map((student) => (
          <StudentRow
            key={student.studentId}
            student={student}
            onClick={onStudentClick}
          />
        ))}
      </div>

      {/* Footer - Ver más */}
      {hasMore && (
        <div className={`p-3 border-t border-gray-100 ${embedded ? '' : 'bg-gray-50'}`}>
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="
              w-full py-2 px-4
              text-sm font-medium text-amber-600
              hover:text-amber-700 hover:bg-amber-50
              rounded-lg
              transition-colors duration-150
            "
          >
            {showAll
              ? 'Mostrar menos'
              : `Ver todos (${data.students.length - maxItems} más)`}
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================
// Exports
// ============================================

export default LowPerformanceAlert;
