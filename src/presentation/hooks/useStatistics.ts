/**
 * @fileoverview Hook para obtener y transformar estadísticas del Dashboard
 * @module presentation/hooks/useStatistics
 *
 * Proporciona datos listos para los componentes de gráficos:
 * - Promedios por salón
 * - Alertas de bajo rendimiento
 * - Top inasistencias
 * - Promedios por asignatura
 *
 * @author Cubbico SIA
 * @version 1.0.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  fetchDashboardStatistics,
  fetchClassroomStatistics,
  fetchLowPerformanceStudents,
  fetchTopAbsences,
  fetchSubjectStatistics,
} from '../../infrastructure/statistics.service';
import type {
  DashboardStatistics,
  ClassroomAveragesChartData,
  AbsencesChartData,
  SubjectAveragesChartData,
  AlertsSummary,
  ClassroomStatistics,
  StudentAbsences,
  SubjectStatistics,
} from '../../shared/types/statisticsTypes';

// ============================================
// Tipos
// ============================================

export interface UseStatisticsOptions {
  /** Cargar datos automáticamente al montar */
  autoLoad?: boolean;
  /** Intervalo de refresco en ms (0 = sin refresco) */
  refreshInterval?: number;
  /** Periodo académico actual */
  currentPeriod?: number;
}

export interface UseStatisticsReturn {
  /** Datos completos del dashboard */
  data: DashboardStatistics | null;
  /** Datos formateados para el gráfico de salones */
  classroomChartData: ClassroomAveragesChartData | null;
  /** Datos de alertas de bajo rendimiento */
  alertsData: AlertsSummary | null;
  /** Datos formateados para el gráfico de inasistencias */
  absencesChartData: AbsencesChartData | null;
  /** Datos formateados para el gráfico de asignaturas */
  subjectChartData: SubjectAveragesChartData | null;
  /** Indica si está cargando */
  isLoading: boolean;
  /** Error si lo hay */
  error: string | null;
  /** Función para recargar datos */
  refresh: () => Promise<void>;
  /** Año actual */
  currentYear: string;
  /** Año anterior */
  previousYear: string;
}

// ============================================
// Transformadores de Datos
// ============================================

/**
 * Transforma estadísticas de salones al formato del gráfico
 */
const transformClassroomData = (
  stats: ClassroomStatistics[],
  currentYear: string,
  previousYear: string
): ClassroomAveragesChartData => {
  // Ordenar por promedio descendente para el gráfico
  const sorted = [...stats].sort((a, b) => b.average - a.average);

  return {
    labels: sorted.map((s) => s.classroomName),
    currentYear: sorted.map((s) => s.average),
    previousYear: sorted.map((s) => s.previousYearAverage || 0),
    currentYearLabel: currentYear,
    previousYearLabel: previousYear,
  };
};

/**
 * Transforma datos de inasistencias al formato del gráfico
 */
const transformAbsencesData = (
  absences: StudentAbsences[],
  limit: number = 10
): AbsencesChartData => {
  // Ya vienen ordenados por fallas injustificadas descendente
  const top = absences.slice(0, limit);

  return {
    labels: top.map((s) => s.fullName),
    justified: top.map((s) => s.justifiedAbsences),
    unjustified: top.map((s) => s.unjustifiedAbsences),
    topCount: top.length,
  };
};

/**
 * Transforma estadísticas de asignaturas al formato del gráfico
 */
const transformSubjectData = (
  stats: SubjectStatistics[],
  _currentYear: string,
  _previousYear: string
): SubjectAveragesChartData => {
  // Ya vienen ordenadas por promedio ascendente (las peores primero)
  // Pero para el gráfico mostramos las 15 primeras máximo
  const limited = stats.slice(0, 15);

  return {
    labels: limited.map((s) => s.subjectName),
    currentYear: limited.map((s) => s.average),
    previousYear: limited.map((s) => s.previousYearAverage || 0),
    areaIds: limited.map((s) => s.areaId),
  };
};

// ============================================
// Hook Principal
// ============================================

/**
 * Hook para obtener estadísticas del Dashboard
 *
 * @param options - Opciones de configuración
 * @returns Datos y funciones del hook
 *
 * @example
 * ```tsx
 * const {
 *   classroomChartData,
 *   alertsData,
 *   absencesChartData,
 *   subjectChartData,
 *   isLoading,
 *   error,
 *   refresh
 * } = useStatistics({ autoLoad: true });
 * ```
 */
export const useStatistics = (
  options: UseStatisticsOptions = {}
): UseStatisticsReturn => {
  const {
    autoLoad = true,
    refreshInterval = 0,
    currentPeriod = 1,
  } = options;

  // Estado
  const [data, setData] = useState<DashboardStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Años - Usar 2025 como año escolar actual
  // TODO: Hacer configurable o detectar dinámicamente
  const currentYear = useMemo(() => '2025', []);
  const previousYear = useMemo(() => '2024', []);

  /**
   * Carga los datos del dashboard
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const statistics = await fetchDashboardStatistics(currentPeriod);
      setData(statistics);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al cargar estadísticas';
      setError(message);
      console.error('useStatistics error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPeriod]);

  /**
   * Función de refresco expuesta
   */
  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Cargar datos al montar (si autoLoad está activo)
  useEffect(() => {
    if (autoLoad) {
      loadData();
    }
  }, [autoLoad, loadData]);

  // Refresco automático (si refreshInterval > 0)
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const intervalId = setInterval(() => {
      loadData();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [refreshInterval, loadData]);

  // Transformar datos para gráficos
  const classroomChartData = useMemo(() => {
    if (!data?.classroomStats) return null;
    return transformClassroomData(data.classroomStats, currentYear, previousYear);
  }, [data?.classroomStats, currentYear, previousYear]);

  const alertsData = useMemo(() => {
    return data?.alerts || null;
  }, [data?.alerts]);

  const absencesChartData = useMemo(() => {
    if (!data?.topAbsences) return null;
    return transformAbsencesData(data.topAbsences, 10);
  }, [data?.topAbsences]);

  const subjectChartData = useMemo(() => {
    if (!data?.subjectStats) return null;
    return transformSubjectData(data.subjectStats, currentYear, previousYear);
  }, [data?.subjectStats, currentYear, previousYear]);

  return {
    data,
    classroomChartData,
    alertsData,
    absencesChartData,
    subjectChartData,
    isLoading,
    error,
    refresh,
    currentYear,
    previousYear,
  };
};

// ============================================
// Hooks Específicos (Opcionales)
// ============================================

/**
 * Hook específico para estadísticas de salones
 */
export const useClassroomStatistics = (autoLoad = true) => {
  const [data, setData] = useState<ClassroomStatistics[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentYear = '2025';
  const previousYear = '2024';

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stats = await fetchClassroomStatistics(currentYear, previousYear);
      setData(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar');
    } finally {
      setIsLoading(false);
    }
  }, [currentYear, previousYear]);

  useEffect(() => {
    if (autoLoad) load();
  }, [autoLoad, load]);

  const chartData = useMemo(
    () => transformClassroomData(data, currentYear, previousYear),
    [data, currentYear, previousYear]
  );

  return { data, chartData, isLoading, error, refresh: load };
};

/**
 * Hook específico para alertas de bajo rendimiento
 */
export const useLowPerformanceAlerts = (autoLoad = true) => {
  const [data, setData] = useState<AlertsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentYear = '2025';
  const previousYear = '2024';

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const alerts = await fetchLowPerformanceStudents(currentYear, previousYear);
      setData(alerts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar');
    } finally {
      setIsLoading(false);
    }
  }, [currentYear, previousYear]);

  useEffect(() => {
    if (autoLoad) load();
  }, [autoLoad, load]);

  return { data, isLoading, error, refresh: load };
};

/**
 * Hook específico para top inasistencias
 */
export const useTopAbsences = (limit = 10, autoLoad = true) => {
  const [data, setData] = useState<StudentAbsences[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentYear = '2025';

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const absences = await fetchTopAbsences(currentYear, limit);
      setData(absences);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar');
    } finally {
      setIsLoading(false);
    }
  }, [currentYear, limit]);

  useEffect(() => {
    if (autoLoad) load();
  }, [autoLoad, load]);

  const chartData = useMemo(() => transformAbsencesData(data, limit), [data, limit]);

  return { data, chartData, isLoading, error, refresh: load };
};

/**
 * Hook específico para estadísticas de asignaturas
 */
export const useSubjectStatistics = (autoLoad = true) => {
  const [data, setData] = useState<SubjectStatistics[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentYear = '2025';
  const previousYear = '2024';

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stats = await fetchSubjectStatistics(currentYear, previousYear);
      setData(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar');
    } finally {
      setIsLoading(false);
    }
  }, [currentYear, previousYear]);

  useEffect(() => {
    if (autoLoad) load();
  }, [autoLoad, load]);

  const chartData = useMemo(
    () => transformSubjectData(data, currentYear, previousYear),
    [data, currentYear, previousYear]
  );

  return { data, chartData, isLoading, error, refresh: load };
};

// ============================================
// Exports
// ============================================

export default useStatistics;
