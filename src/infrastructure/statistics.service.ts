/**
 * @fileoverview Servicio de estadísticas para el Dashboard
 * @module infrastructure/statistics.service
 *
 * Proporciona funciones para calcular estadísticas académicas:
 * - Promedios por salón
 * - Estudiantes con bajo rendimiento
 * - Top inasistencias
 * - Promedios por asignatura
 * - Comparativos anuales
 *
 * @author Cubbico SIA
 * @version 1.0.0
 */

import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from './firebase/firebase';
import type {
  ClassroomStatistics,
  LowPerformanceStudent,
  AlertsSummary,
  StudentAbsences,
  SubjectStatistics,
  DashboardStatistics,
  StudentGrades,
} from '../shared/types/statisticsTypes';
import {
  calculateAverage,
  calculateStudentAverage,
  getAlertSeverity,
  getPerformanceTrend,
  LOW_AVERAGE_THRESHOLD,
  ACADEMIC_PERIODS,
} from '../shared/types/statisticsTypes';

// ============================================
// Tipos Internos
// ============================================

interface StudentData {
  id: string;
  name: string;
  lastName: string;
  document: string;
  classroomId: string;
  classRoom: string;
  className: string;
}

interface ClassroomData {
  id: string;
  nombreSalon: string;
  nivel: string;
  directorGrupo: string;
}

interface AreaData {
  id: string;
  asignatura: string;
  area: string;
  nivel: string;
}

interface HistoryGrades {
  l1?: number;
  l2?: number;
  l3?: number;
  fallas?: number;
  fallasVerificadas?: number;
}

// ============================================
// Funciones de Obtención de Datos
// ============================================

/**
 * Obtiene todos los estudiantes
 */
const fetchAllStudents = async (): Promise<StudentData[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'student'));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name || '',
      lastName: doc.data().lastName || '',
      document: doc.data().document || '',
      classroomId: doc.data().classroomId || '',
      classRoom: doc.data().classRoom || '',
      className: doc.data().className || '',
    }));
  } catch (error) {
    console.error('Error fetching students:', error);
    return [];
  }
};

/**
 * Obtiene todos los salones
 */
const fetchAllClassrooms = async (): Promise<ClassroomData[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'classrooms'));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      nombreSalon: doc.data().nombreSalon || '',
      nivel: doc.data().nivel || '',
      directorGrupo: doc.data().directorGrupo || '',
    }));
  } catch (error) {
    console.error('Error fetching classrooms:', error);
    return [];
  }
};

/**
 * Obtiene todas las áreas/asignaturas
 */
const fetchAllAreas = async (): Promise<AreaData[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'areas'));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      asignatura: doc.data().asignatura || '',
      area: doc.data().area || '',
      nivel: doc.data().nivel || '',
    }));
  } catch (error) {
    console.error('Error fetching areas:', error);
    return [];
  }
};

/**
 * Obtiene el historial de notas de un estudiante
 */
const fetchStudentHistory = async (
  studentId: string
): Promise<Record<string, any> | null> => {
  try {
    const docRef = doc(db, 'history', studentId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      // Solo log para los primeros estudiantes para no saturar la consola
      return null;
    }
    const data = docSnap.data();
    return data;
  } catch (error) {
    console.error(`Error fetching history for student ${studentId}:`, error);
    return null;
  }
};

// Variable para tracking de debug (solo logea los primeros)
let debugCounter = 0;
const MAX_DEBUG_LOGS = 3;

/**
 * Extrae las notas de un periodo específico del historial
 */
const extractGradesFromHistory = (
  historyData: Record<string, any> | null,
  year: string,
  period: number,
  areaId: string
): HistoryGrades | null => {
  if (!historyData) return null;

  // Debug: mostrar estructura del historial (solo primeras veces)
  if (debugCounter < MAX_DEBUG_LOGS) {
    console.log('[Statistics] History structure keys:', Object.keys(historyData));
    if (historyData.years) {
      console.log('[Statistics] Years available:', Object.keys(historyData.years));
    }
    debugCounter++;
  }

  // Intentar ambos esquemas de datos
  const yearData = historyData[year] || historyData?.years?.[year];
  if (!yearData) return null;

  const periodData =
    yearData?.periods?.[period] || yearData?.periods?.[String(period)];
  if (!periodData) return null;

  const areaData = periodData?.areas?.[areaId];
  if (!areaData) return null;

  const grades = areaData?.grades;
  if (!grades) return null;

  return {
    l1: typeof grades.l1 === 'number' ? grades.l1 : parseFloat(grades.l1) || 0,
    l2: typeof grades.l2 === 'number' ? grades.l2 : parseFloat(grades.l2) || 0,
    l3: typeof grades.l3 === 'number' ? grades.l3 : parseFloat(grades.l3) || 0,
    fallas: typeof grades.fallas === 'number' ? grades.fallas : parseInt(grades.fallas) || 0,
    fallasVerificadas:
      typeof grades.fallasVerificadas === 'number'
        ? grades.fallasVerificadas
        : parseInt(grades.fallasVerificadas) || 0,
  };
};

/**
 * Calcula el promedio general de un estudiante en un año
 * considerando todas las áreas y periodos
 */
const calculateStudentYearAverage = (
  historyData: Record<string, any> | null,
  year: string,
  areas: AreaData[]
): { average: number; totalAbsences: number; problemSubjects: string[] } => {
  if (!historyData) {
    return { average: 0, totalAbsences: 0, problemSubjects: [] };
  }

  const allAverages: number[] = [];
  let totalAbsences = 0;
  const problemSubjects: string[] = [];

  // Iterar por todos los periodos
  for (let period = 1; period <= ACADEMIC_PERIODS; period++) {
    // Iterar por todas las áreas
    for (const area of areas) {
      const grades = extractGradesFromHistory(historyData, year, period, area.id);
      if (grades) {
        const avg = calculateStudentAverage(grades);
        if (avg > 0) {
          allAverages.push(avg);
          if (avg < LOW_AVERAGE_THRESHOLD && !problemSubjects.includes(area.asignatura)) {
            problemSubjects.push(area.asignatura);
          }
        }
        totalAbsences += (grades.fallas || 0) - (grades.fallasVerificadas || 0);
      }
    }
  }

  return {
    average: calculateAverage(allAverages),
    totalAbsences: Math.max(0, totalAbsences),
    problemSubjects,
  };
};

// ============================================
// Funciones de Estadísticas
// ============================================

/**
 * Obtiene estadísticas de promedios por salón
 */
export const fetchClassroomStatistics = async (
  year: string,
  previousYear?: string
): Promise<ClassroomStatistics[]> => {
  try {
    const [students, classrooms, areas] = await Promise.all([
      fetchAllStudents(),
      fetchAllClassrooms(),
      fetchAllAreas(),
    ]);

    console.log('[Statistics] fetchClassroomStatistics:', {
      students: students.length,
      classrooms: classrooms.length,
      areas: areas.length,
      year,
    });

    // Debug: mostrar algunos estudiantes para verificar estructura
    if (students.length > 0) {
      console.log('[Statistics] Sample student:', students[0]);
    }

    // Crear mapa de nombre de salón a ID para fallback
    const classroomNameToId = new Map<string, string>();
    classrooms.forEach((c) => {
      if (c.nombreSalon) {
        classroomNameToId.set(c.nombreSalon.toLowerCase(), c.id);
      }
    });

    // Agrupar estudiantes por salón (intentar por ID primero, luego por nombre)
    const studentsByClassroom = new Map<string, StudentData[]>();
    let studentsWithClassroom = 0;
    students.forEach((student) => {
      let classroomId = student.classroomId;

      // Fallback: buscar por nombre si no hay ID
      if (!classroomId && student.classRoom) {
        classroomId = classroomNameToId.get(student.classRoom.toLowerCase()) || '';
      }

      if (!classroomId) return;
      studentsWithClassroom++;
      const list = studentsByClassroom.get(classroomId) || [];
      list.push(student);
      studentsByClassroom.set(classroomId, list);
    });

    console.log('[Statistics] Students with classroom (ID or name):', studentsWithClassroom);

    // Calcular estadísticas por salón
    const statsPromises = classrooms.map(async (classroom) => {
      const classroomStudents = studentsByClassroom.get(classroom.id) || [];

      if (classroomStudents.length === 0) {
        return {
          classroomId: classroom.id,
          classroomName: classroom.nombreSalon,
          nivel: classroom.nivel,
          average: 0,
          studentCount: 0,
          lowPerformanceCount: 0,
          totalAbsences: 0,
          previousYearAverage: undefined,
          yearOverYearChange: undefined,
        };
      }

      // Obtener historiales de todos los estudiantes del salón
      const histories = await Promise.all(
        classroomStudents.map((s) => fetchStudentHistory(s.id))
      );

      const averages: number[] = [];
      let lowCount = 0;
      let totalAbsences = 0;
      const previousAverages: number[] = [];

      histories.forEach((history, index) => {
        // Año actual
        const currentStats = calculateStudentYearAverage(history, year, areas);
        if (currentStats.average > 0) {
          averages.push(currentStats.average);
          if (currentStats.average < LOW_AVERAGE_THRESHOLD) {
            lowCount++;
          }
          totalAbsences += currentStats.totalAbsences;
        }

        // Año anterior (si se solicita comparativo)
        if (previousYear) {
          const prevStats = calculateStudentYearAverage(history, previousYear, areas);
          if (prevStats.average > 0) {
            previousAverages.push(prevStats.average);
          }
        }
      });

      const currentAvg = calculateAverage(averages);
      const prevAvg = previousYear ? calculateAverage(previousAverages) : undefined;

      return {
        classroomId: classroom.id,
        classroomName: classroom.nombreSalon,
        nivel: classroom.nivel,
        average: currentAvg,
        studentCount: classroomStudents.length,
        lowPerformanceCount: lowCount,
        totalAbsences,
        previousYearAverage: prevAvg,
        yearOverYearChange: prevAvg ? Number((currentAvg - prevAvg).toFixed(2)) : undefined,
      };
    });

    const stats = await Promise.all(statsPromises);

    // Ordenar por promedio descendente
    return stats
      .filter((s) => s.studentCount > 0)
      .sort((a, b) => b.average - a.average);
  } catch (error) {
    console.error('Error fetching classroom statistics:', error);
    throw error;
  }
};

/**
 * Obtiene estudiantes con bajo rendimiento
 */
export const fetchLowPerformanceStudents = async (
  year: string,
  previousYear?: string
): Promise<AlertsSummary> => {
  try {
    const [students, classrooms, areas] = await Promise.all([
      fetchAllStudents(),
      fetchAllClassrooms(),
      fetchAllAreas(),
    ]);

    // Crear mapa de salones para lookup rápido
    const classroomMap = new Map(classrooms.map((c) => [c.id, c]));

    const lowPerformanceStudents: LowPerformanceStudent[] = [];

    // Procesar cada estudiante
    await Promise.all(
      students.map(async (student) => {
        const history = await fetchStudentHistory(student.id);
        const currentStats = calculateStudentYearAverage(history, year, areas);

        // Solo incluir si tiene promedio bajo
        if (currentStats.average > 0 && currentStats.average < LOW_AVERAGE_THRESHOLD) {
          let previousAvg: number | undefined;
          if (previousYear) {
            const prevStats = calculateStudentYearAverage(history, previousYear, areas);
            previousAvg = prevStats.average > 0 ? prevStats.average : undefined;
          }

          const classroom = classroomMap.get(student.classroomId);

          lowPerformanceStudents.push({
            studentId: student.id,
            fullName: `${student.name} ${student.lastName}`,
            document: student.document,
            classroomId: student.classroomId,
            classroomName: classroom?.nombreSalon || student.classRoom || 'Sin asignar',
            currentAverage: currentStats.average,
            previousPeriodAverage: previousAvg,
            severity: getAlertSeverity(currentStats.average),
            trend: getPerformanceTrend(currentStats.average, previousAvg),
            problemSubjects: currentStats.problemSubjects.slice(0, 3),
            totalAbsences: currentStats.totalAbsences,
          });
        }
      })
    );

    // Ordenar por promedio ascendente (los peores primero)
    lowPerformanceStudents.sort((a, b) => a.currentAverage - b.currentAverage);

    // Contar por severidad
    const criticalCount = lowPerformanceStudents.filter((s) => s.severity === 'critical').length;
    const warningCount = lowPerformanceStudents.filter((s) => s.severity === 'warning').length;
    const watchCount = lowPerformanceStudents.filter((s) => s.severity === 'watch').length;

    return {
      totalAlerts: lowPerformanceStudents.length,
      criticalCount,
      warningCount,
      watchCount,
      students: lowPerformanceStudents,
    };
  } catch (error) {
    console.error('Error fetching low performance students:', error);
    throw error;
  }
};

/**
 * Obtiene los estudiantes con más inasistencias
 */
export const fetchTopAbsences = async (
  year: string,
  limit: number = 10
): Promise<StudentAbsences[]> => {
  try {
    const [students, classrooms, areas] = await Promise.all([
      fetchAllStudents(),
      fetchAllClassrooms(),
      fetchAllAreas(),
    ]);

    const classroomMap = new Map(classrooms.map((c) => [c.id, c]));

    // Calcular días totales de clase (estimado: 40 días por periodo * 4 periodos)
    const totalSchoolDays = 40 * ACADEMIC_PERIODS;

    const studentAbsences: StudentAbsences[] = [];

    await Promise.all(
      students.map(async (student) => {
        const history = await fetchStudentHistory(student.id);
        if (!history) return;

        let totalAbsences = 0;
        let justifiedAbsences = 0;

        // Sumar fallas de todos los periodos y áreas
        for (let period = 1; period <= ACADEMIC_PERIODS; period++) {
          for (const area of areas) {
            const grades = extractGradesFromHistory(history, year, period, area.id);
            if (grades) {
              const fallas = grades.fallas || 0;
              const verificadas = grades.fallasVerificadas || 0;
              totalAbsences += fallas;
              justifiedAbsences += verificadas;
            }
          }
        }

        if (totalAbsences > 0) {
          const classroom = classroomMap.get(student.classroomId);
          const unjustified = Math.max(0, totalAbsences - justifiedAbsences);
          const attendanceRate = Math.max(0, ((totalSchoolDays - unjustified) / totalSchoolDays) * 100);

          studentAbsences.push({
            studentId: student.id,
            fullName: `${student.name} ${student.lastName}`,
            classroomName: classroom?.nombreSalon || student.classRoom || 'Sin asignar',
            totalAbsences,
            justifiedAbsences,
            unjustifiedAbsences: unjustified,
            attendanceRate: Number(attendanceRate.toFixed(1)),
            atRisk: attendanceRate < 75, // Riesgo si asistencia < 75%
          });
        }
      })
    );

    // Ordenar por fallas injustificadas descendente
    return studentAbsences
      .sort((a, b) => b.unjustifiedAbsences - a.unjustifiedAbsences)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching top absences:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas por asignatura
 */
export const fetchSubjectStatistics = async (
  year: string,
  previousYear?: string
): Promise<SubjectStatistics[]> => {
  try {
    const [students, areas] = await Promise.all([
      fetchAllStudents(),
      fetchAllAreas(),
    ]);

    // Calcular promedios por asignatura
    const subjectStats: SubjectStatistics[] = [];

    for (const area of areas) {
      const currentAverages: number[] = [];
      const previousAverages: number[] = [];
      let passingCount = 0;

      await Promise.all(
        students.map(async (student) => {
          const history = await fetchStudentHistory(student.id);
          if (!history) return;

          // Promediar todos los periodos para esta área
          const periodAverages: number[] = [];
          const prevPeriodAverages: number[] = [];

          for (let period = 1; period <= ACADEMIC_PERIODS; period++) {
            // Año actual
            const grades = extractGradesFromHistory(history, year, period, area.id);
            if (grades) {
              const avg = calculateStudentAverage(grades);
              if (avg > 0) periodAverages.push(avg);
            }

            // Año anterior
            if (previousYear) {
              const prevGrades = extractGradesFromHistory(history, previousYear, period, area.id);
              if (prevGrades) {
                const avg = calculateStudentAverage(prevGrades);
                if (avg > 0) prevPeriodAverages.push(avg);
              }
            }
          }

          if (periodAverages.length > 0) {
            const studentAreaAvg = calculateAverage(periodAverages);
            currentAverages.push(studentAreaAvg);
            if (studentAreaAvg >= 3.0) passingCount++;
          }

          if (prevPeriodAverages.length > 0) {
            previousAverages.push(calculateAverage(prevPeriodAverages));
          }
        })
      );

      const currentAvg = calculateAverage(currentAverages);
      const prevAvg = calculateAverage(previousAverages);
      const passingRate = currentAverages.length > 0
        ? Number(((passingCount / currentAverages.length) * 100).toFixed(1))
        : 0;

      subjectStats.push({
        areaId: area.id,
        subjectName: area.asignatura,
        academicArea: area.area,
        nivel: area.nivel,
        average: currentAvg,
        previousYearAverage: prevAvg > 0 ? prevAvg : undefined,
        yearOverYearChange: prevAvg > 0 ? Number((currentAvg - prevAvg).toFixed(2)) : undefined,
        studentCount: currentAverages.length,
        passingRate,
        isCritical: currentAvg > 0 && currentAvg < LOW_AVERAGE_THRESHOLD,
      });
    }

    // Ordenar por promedio ascendente (las peores primero)
    return subjectStats
      .filter((s) => s.studentCount > 0)
      .sort((a, b) => a.average - b.average);
  } catch (error) {
    console.error('Error fetching subject statistics:', error);
    throw error;
  }
};

/**
 * Obtiene todas las estadísticas del dashboard
 */
export const fetchDashboardStatistics = async (
  currentPeriod: number = 1
): Promise<DashboardStatistics> => {
  // Usar 2025 como año escolar actual ya que probablemente no hay datos de 2026 aún
  // TODO: Hacer esto configurable o detectar dinámicamente el año escolar activo
  const currentYear = '2025';
  const previousYear = '2024';

  console.log('[Statistics] Fetching dashboard data for year:', currentYear);

  try {
    // Primero obtener estudiantes para verificar que hay datos
    const students = await fetchAllStudents();
    console.log('[Statistics] Total students found:', students.length);

    if (students.length === 0) {
      console.warn('[Statistics] No students found in database');
    }

    const [classroomStats, alerts, topAbsences, subjectStats] = await Promise.all([
      fetchClassroomStatistics(currentYear, previousYear),
      fetchLowPerformanceStudents(currentYear, previousYear),
      fetchTopAbsences(currentYear, 10),
      fetchSubjectStatistics(currentYear, previousYear),
    ]);

    console.log('[Statistics] Results:', {
      classrooms: classroomStats.length,
      alerts: alerts.totalAlerts,
      absences: topAbsences.length,
      subjects: subjectStats.length,
    });

    // Calcular promedio institucional
    const institutionalAvg = calculateAverage(
      classroomStats.map((c) => c.average).filter((a) => a > 0)
    );
    const prevInstitutionalAvg = calculateAverage(
      classroomStats.map((c) => c.previousYearAverage).filter((a): a is number => a !== undefined && a > 0)
    );

    return {
      currentYear,
      previousYear,
      currentPeriod,
      totalStudents: students.length,
      institutionalAverage: institutionalAvg,
      previousYearInstitutionalAverage: prevInstitutionalAvg > 0 ? prevInstitutionalAvg : undefined,
      classroomStats,
      alerts,
      topAbsences,
      subjectStats,
      lastUpdated: new Date(),
      isLoading: false,
      error: null,
    };
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    throw error;
  }
};
