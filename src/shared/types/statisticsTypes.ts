/**
 * @fileoverview Tipos e interfaces para estadísticas del Dashboard
 * @module shared/types/statisticsTypes
 *
 * Define tipos para:
 * - Promedios por salón
 * - Alertas de bajo rendimiento
 * - Estadísticas de inasistencias
 * - Promedios por asignatura
 * - Comparativos anuales
 *
 * @author Cubbico SIA
 * @version 1.0.0
 */

// ============================================
// Constantes
// ============================================

/** Umbral de promedio bajo para alertas */
export const LOW_AVERAGE_THRESHOLD = 3.5;

/** Número de periodos académicos */
export const ACADEMIC_PERIODS = 4;

/** Escala de notas */
export const GRADE_SCALE = {
  MIN: 1.0,
  MAX: 5.0,
  PASSING: 3.0,
  LOW: 3.5,
  HIGH: 4.5,
};

// ============================================
// Tipos Base
// ============================================

/**
 * Estructura de notas de un estudiante en un área/periodo
 */
export interface StudentGrades {
  l1: number;
  l2: number;
  l3: number;
  fallas: number;
  fallasVerificadas: number;
}

/**
 * Promedio calculado con metadata
 */
export interface CalculatedAverage {
  /** Promedio numérico (1-5) */
  value: number;
  /** Número de notas incluidas en el cálculo */
  count: number;
  /** Indica si está por debajo del umbral */
  isLow: boolean;
}

// ============================================
// Estadísticas por Salón
// ============================================

/**
 * Estadísticas de un salón de clases
 */
export interface ClassroomStatistics {
  /** ID del salón */
  classroomId: string;
  /** Nombre del salón */
  classroomName: string;
  /** Nivel académico (Primaria, Secundaria) */
  nivel: string;
  /** Promedio general del salón */
  average: number;
  /** Número de estudiantes */
  studentCount: number;
  /** Estudiantes con promedio bajo */
  lowPerformanceCount: number;
  /** Total de fallas del salón */
  totalAbsences: number;
  /** Promedio del año anterior (para comparativo) */
  previousYearAverage?: number;
  /** Diferencia con año anterior */
  yearOverYearChange?: number;
}

/**
 * Datos para el gráfico de promedios por salón
 */
export interface ClassroomAveragesChartData {
  /** Labels (nombres de salones) */
  labels: string[];
  /** Promedios del año actual */
  currentYear: number[];
  /** Promedios del año anterior */
  previousYear: number[];
  /** Año actual */
  currentYearLabel: string;
  /** Año anterior */
  previousYearLabel: string;
}

// ============================================
// Alertas de Bajo Rendimiento
// ============================================

/**
 * Severidad de la alerta
 */
export type AlertSeverity = 'critical' | 'warning' | 'watch';

/**
 * Tendencia del rendimiento
 */
export type PerformanceTrend = 'improving' | 'stable' | 'declining';

/**
 * Alerta de estudiante con bajo rendimiento
 */
export interface LowPerformanceStudent {
  /** ID del estudiante */
  studentId: string;
  /** Nombre completo */
  fullName: string;
  /** Documento de identidad */
  document: string;
  /** ID del salón */
  classroomId: string;
  /** Nombre del salón */
  classroomName: string;
  /** Promedio actual */
  currentAverage: number;
  /** Promedio del periodo anterior */
  previousPeriodAverage?: number;
  /** Severidad de la alerta */
  severity: AlertSeverity;
  /** Tendencia */
  trend: PerformanceTrend;
  /** Asignaturas con problemas */
  problemSubjects: string[];
  /** Número de fallas */
  totalAbsences: number;
}

/**
 * Resumen de alertas
 */
export interface AlertsSummary {
  /** Total de estudiantes en alerta */
  totalAlerts: number;
  /** Críticos (promedio < 2.5) */
  criticalCount: number;
  /** Advertencia (promedio 2.5-3.0) */
  warningCount: number;
  /** En observación (promedio 3.0-3.5) */
  watchCount: number;
  /** Lista de estudiantes */
  students: LowPerformanceStudent[];
}

// ============================================
// Estadísticas de Inasistencias
// ============================================

/**
 * Estadísticas de fallas de un estudiante
 */
export interface StudentAbsences {
  /** ID del estudiante */
  studentId: string;
  /** Nombre completo */
  fullName: string;
  /** Salón */
  classroomName: string;
  /** Fallas totales */
  totalAbsences: number;
  /** Fallas justificadas */
  justifiedAbsences: number;
  /** Fallas injustificadas */
  unjustifiedAbsences: number;
  /** Porcentaje de asistencia */
  attendanceRate: number;
  /** En riesgo de perder por fallas */
  atRisk: boolean;
}

/**
 * Datos para el gráfico de inasistencias
 */
export interface AbsencesChartData {
  /** Labels (nombres de estudiantes) */
  labels: string[];
  /** Fallas justificadas */
  justified: number[];
  /** Fallas injustificadas */
  unjustified: number[];
  /** Top N estudiantes */
  topCount: number;
}

// ============================================
// Estadísticas por Asignatura
// ============================================

/**
 * Estadísticas de una asignatura
 */
export interface SubjectStatistics {
  /** ID del área */
  areaId: string;
  /** Nombre de la asignatura */
  subjectName: string;
  /** Área académica */
  academicArea: string;
  /** Nivel (Primaria, Secundaria) */
  nivel: string;
  /** Promedio general */
  average: number;
  /** Promedio año anterior */
  previousYearAverage?: number;
  /** Cambio año a año */
  yearOverYearChange?: number;
  /** Número de estudiantes evaluados */
  studentCount: number;
  /** Porcentaje de aprobación */
  passingRate: number;
  /** Es asignatura crítica (promedio bajo) */
  isCritical: boolean;
}

/**
 * Datos para el gráfico de asignaturas
 */
export interface SubjectAveragesChartData {
  /** Labels (nombres de asignaturas) */
  labels: string[];
  /** Promedios del año actual */
  currentYear: number[];
  /** Promedios del año anterior */
  previousYear: number[];
  /** IDs de las áreas */
  areaIds: string[];
}

// ============================================
// Resumen General del Dashboard
// ============================================

/**
 * Estadísticas generales del dashboard
 */
export interface DashboardStatistics {
  /** Año académico actual */
  currentYear: string;
  /** Año anterior para comparativo */
  previousYear: string;
  /** Periodo actual */
  currentPeriod: number;
  /** Total de estudiantes */
  totalStudents: number;
  /** Promedio general institucional */
  institutionalAverage: number;
  /** Promedio del año anterior */
  previousYearInstitutionalAverage?: number;
  /** Estadísticas por salón */
  classroomStats: ClassroomStatistics[];
  /** Alertas de bajo rendimiento */
  alerts: AlertsSummary;
  /** Top estudiantes con más fallas */
  topAbsences: StudentAbsences[];
  /** Estadísticas por asignatura */
  subjectStats: SubjectStatistics[];
  /** Fecha de última actualización */
  lastUpdated: Date;
  /** Indica si los datos están cargando */
  isLoading: boolean;
  /** Error si lo hay */
  error: string | null;
}

// ============================================
// Props de Componentes
// ============================================

/**
 * Props para el gráfico de promedios por salón
 */
export interface ClassroomAveragesChartProps {
  /** Datos del gráfico */
  data: ClassroomAveragesChartData;
  /** Mostrar comparativo con año anterior */
  showComparison?: boolean;
  /** Altura del gráfico */
  height?: number;
  /** Título del gráfico */
  title?: string;
  /** Callback al hacer click en un salón */
  onClassroomClick?: (classroomId: string) => void;
  /** Indica si está cargando */
  isLoading?: boolean;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Props para la tabla de alertas
 */
export interface LowPerformanceAlertProps {
  /** Resumen de alertas */
  data: AlertsSummary;
  /** Máximo de estudiantes a mostrar */
  maxItems?: number;
  /** Callback al hacer click en un estudiante */
  onStudentClick?: (studentId: string) => void;
  /** Indica si está cargando */
  isLoading?: boolean;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Props para el gráfico de inasistencias
 */
export interface AbsencesChartProps {
  /** Datos del gráfico */
  data: AbsencesChartData;
  /** Altura del gráfico */
  height?: number;
  /** Título del gráfico */
  title?: string;
  /** Callback al hacer click en un estudiante */
  onStudentClick?: (studentId: string) => void;
  /** Indica si está cargando */
  isLoading?: boolean;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Props para el gráfico de asignaturas
 */
export interface SubjectAveragesChartProps {
  /** Datos del gráfico */
  data: SubjectAveragesChartData;
  /** Mostrar comparativo con año anterior */
  showComparison?: boolean;
  /** Altura del gráfico */
  height?: number;
  /** Título del gráfico */
  title?: string;
  /** Callback al hacer click en una asignatura */
  onSubjectClick?: (areaId: string) => void;
  /** Indica si está cargando */
  isLoading?: boolean;
  /** Clases CSS adicionales */
  className?: string;
}

// ============================================
// Utilidades
// ============================================

/**
 * Calcula el promedio de un array de números
 * @param values - Array de valores numéricos
 * @returns Promedio o 0 si el array está vacío
 */
export const calculateAverage = (values: number[]): number => {
  if (!values || values.length === 0) return 0;
  const validValues = values.filter((v) => typeof v === 'number' && !isNaN(v));
  if (validValues.length === 0) return 0;
  const sum = validValues.reduce((acc, val) => acc + val, 0);
  return Number((sum / validValues.length).toFixed(2));
};

/**
 * Calcula el promedio de las notas de un estudiante (l1, l2, l3)
 * @param grades - Objeto con las notas
 * @returns Promedio de las notas
 */
export const calculateStudentAverage = (grades: Partial<StudentGrades>): number => {
  const values: number[] = [];
  if (typeof grades.l1 === 'number' && grades.l1 > 0) values.push(grades.l1);
  if (typeof grades.l2 === 'number' && grades.l2 > 0) values.push(grades.l2);
  if (typeof grades.l3 === 'number' && grades.l3 > 0) values.push(grades.l3);
  return calculateAverage(values);
};

/**
 * Determina la severidad de la alerta basada en el promedio
 * @param average - Promedio del estudiante
 * @returns Severidad de la alerta
 */
export const getAlertSeverity = (average: number): AlertSeverity => {
  if (average < 2.5) return 'critical';
  if (average < 3.0) return 'warning';
  return 'watch';
};

/**
 * Determina la tendencia comparando dos promedios
 * @param current - Promedio actual
 * @param previous - Promedio anterior
 * @returns Tendencia del rendimiento
 */
export const getPerformanceTrend = (
  current: number,
  previous: number | undefined
): PerformanceTrend => {
  if (previous === undefined) return 'stable';
  const diff = current - previous;
  if (diff > 0.2) return 'improving';
  if (diff < -0.2) return 'declining';
  return 'stable';
};

/**
 * Formatea un número como promedio (2 decimales)
 * @param value - Valor a formatear
 * @returns String formateado
 */
export const formatAverage = (value: number): string => {
  if (typeof value !== 'number' || isNaN(value)) return '-';
  return value.toFixed(2);
};

/**
 * Obtiene el color CSS basado en el promedio
 * @param average - Promedio
 * @returns Clase de color Tailwind
 */
export const getAverageColorClass = (average: number): string => {
  if (average >= 4.5) return 'text-green-600';
  if (average >= 4.0) return 'text-green-500';
  if (average >= 3.5) return 'text-amber-500';
  if (average >= 3.0) return 'text-orange-500';
  return 'text-red-500';
};

/**
 * Obtiene el color de fondo basado en la severidad
 * @param severity - Severidad de la alerta
 * @returns Clase de color Tailwind para fondo
 */
export const getSeverityBgClass = (severity: AlertSeverity): string => {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'warning':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'watch':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/**
 * Obtiene el icono de tendencia
 * @param trend - Tendencia
 * @returns Emoji o símbolo de tendencia
 */
export const getTrendIcon = (trend: PerformanceTrend): string => {
  switch (trend) {
    case 'improving':
      return '↑';
    case 'declining':
      return '↓';
    default:
      return '→';
  }
};
