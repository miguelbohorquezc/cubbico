/**
 * @fileoverview Hook para cargar datos de informes académicos
 * @module presentation/features/reports/hooks/useReportData
 *
 * Hook reutilizable que encapsula la lógica de carga de datos académicos
 * para informes de primaria y secundaria. Maneja la carga de estudiantes,
 * historial, áreas, logros y asistencias.
 */

import { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../../../infrastructure/firebase/firebase';
import { fetchPeriodConfig, formatFechaEntrega } from '../../../../infrastructure/periodConfig.service';
import { fetchAttendanceByClassroom } from '../../../../infrastructure/attendance.service';
import { computeAttendanceSummary, AttendanceRecord } from '../../../../domain/entities/attendance';

// ============================================
// Tipos
// ============================================

export interface SubjectData {
  areaId: string;
  asignatura: string;
  ihs: string;
  grades: {
    l1: number;
    l2: number;
    l3: number;
    fallas: number;
    fallasVerificadas: number;
  };
  achievements: {
    logro1: string;
    logro2: string;
    logro3: string;
  };
}

export interface AreaGroup {
  nombreArea: string;
  subjects: SubjectData[];
}

export interface ProposedData {
  id: string;
  texto: string;
  referentes: string[];
  indicadores: { asignaturaId: string; texto: string }[];
}

export interface StudentData {
  name: string;
  lastName: string;
  className: string;
  classRoom: string;
  document: string;
  id: string;
  classroomId: string;
}

export interface PeriodInfo {
  periodo: string;
  curso: string;
}

export interface ReportData {
  primary: SubjectData[];
  secondary: AreaGroup[];
  preschool: ProposedData[];
  periodInfo?: PeriodInfo;
}

export interface UseReportDataParams {
  studentId: string | undefined;
  year: string | undefined;
  periodId: string | undefined;
  schoolLevel?: '1' | '2'; // 1 = primaria, 2 = secundaria
}

export interface UseReportDataReturn {
  reportData: ReportData;
  studentInfo: StudentData | null;
  fechaEntrega: string;
  director: string;
  loading: boolean;
  error: string;
}

// ============================================
// Hook
// ============================================

export function useReportData({
  studentId,
  year,
  periodId,
  schoolLevel,
}: UseReportDataParams): UseReportDataReturn {
  const [reportData, setReportData] = useState<ReportData>({ primary: [], secondary: [], preschool: [] });
  const [studentInfo, setStudentInfo] = useState<StudentData | null>(null);
  const [fechaEntrega, setFechaEntrega] = useState<string>('');
  const [director, setDirector] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!studentId || !year) throw new Error('Parámetros inválidos');

        const studentDoc = await getDoc(doc(db, 'student', studentId));
        if (!studentDoc.exists()) throw new Error('Estudiante no encontrado');

        const studentData = studentDoc.data() as StudentData;
        setStudentInfo({
          name: studentData.name || '',
          lastName: studentData.lastName || '',
          className: studentData.className || '',
          classRoom: studentData.classRoom || '',
          document: studentData.document,
          id: studentData.id,
          classroomId: studentData.classroomId
        });

        // Obtener director de grupo desde el classroom
        if (studentData.classroomId) {
          try {
            const classroomDoc = await getDoc(doc(db, 'classRooms', studentData.classroomId));
            if (classroomDoc.exists()) {
              const classroomData = classroomDoc.data();
              const directorValue = classroomData?.directorGrupo;

              if (directorValue) {
                // Intentar buscar como UID primero
                try {
                  const userDoc = await getDoc(doc(db, 'users', directorValue));
                  if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setDirector(userData?.displayName || userData?.email || 'Director(a) de Grupo');
                  } else {
                    // Si no existe como UID, asumir que es un nombre y usarlo directamente
                    setDirector(directorValue);
                  }
                } catch {
                  // Si falla la búsqueda, usar el valor directamente como nombre
                  setDirector(directorValue);
                }
              }
            }
          } catch (error) {
            console.error('Error cargando director de grupo:', error);
          }
        }

        const [historySnap, areasSnapshot] = await Promise.all([
          getDoc(doc(db, 'history', studentId)),
          getDocs(collection(db, 'areas'))
        ]);

        if (!historySnap.exists()) {
          throw new Error('Este informe aún no ha sido diligenciado');
        }

        const areasMap = areasSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = {
            ...doc.data(),
            orden: doc.data().orden ? String(doc.data().orden) : '9999'
          };
          return acc;
        }, {} as Record<string, any>);

        const yearData = historySnap.data()?.years[year];
        if (!yearData) {
          throw new Error('Este informe aún no ha sido diligenciado');
        }

        const primaryData: Array<SubjectData & { _orden?: string }> = [];
        const secondaryGroups: Record<string, AreaGroup & { _orden?: string }> = {};

        const sortByOrder = (a: { _orden?: string }, b: { _orden?: string }) => {
          const orderA = a._orden || '9999';
          const orderB = b._orden || '9999';

          if (!isNaN(Number(orderA)) && !isNaN(Number(orderB))) {
            return Number(orderA) - Number(orderB);
          }
          return orderA.localeCompare(orderB);
        };

        const periodData = (yearData.periods as Record<string, any>)[periodId!];
        if (!periodData) {
          throw new Error('Este informe aún no ha sido diligenciado');
        }

        // Verificar si es preescolar
        const isPreschool = periodData.preschool === true;

        // ============================================
        // CARGA DE DATOS PARA PREESCOLAR
        // ============================================
        let preschoolData: ProposedData[] = [];
        if (isPreschool && studentData.classroomId) {
          try {
            // Cargar configuración de propósitos e indicadores del salón
            const configDocId = `${studentData.classroomId}_${year}`;
            const [configSnap, indicatorsSnap] = await Promise.all([
              getDoc(doc(db, 'preschool_config', configDocId)),
              getDoc(doc(db, 'preschool_indicators', configDocId))
            ]);

            if (!configSnap.exists() || !indicatorsSnap.exists()) {
              return;
            }

            // Obtener propósitos
            const propositos = configSnap.data()?.propositos || [];

            // Obtener indicadores activos para este periodo
            const allIndicators = indicatorsSnap.data()?.indicadores || [];
            const activeIndicators = allIndicators.filter((ind: any) =>
              ind.activo && ind.periodos && ind.periodos.includes(parseInt(periodId!))
            );

            // Obtener selecciones del estudiante desde history
            const selecciones = periodData.selecciones || {};

            // Construir mapa de indicadores por ID
            const indicatorsMap = new Map();
            activeIndicators.forEach((ind: any) => {
              indicatorsMap.set(ind.id, ind);
            });

            // Para cada propósito, buscar los indicadores evaluados
            preschoolData = propositos.map((proposito: any) => {
              const indicadoresEvaluados: { asignaturaId: string; texto: string }[] = [];

              // Para cada asignatura del propósito, buscar si hay indicador seleccionado
              (proposito.asignaturas || []).forEach((asignaturaId: string) => {
                const selectedIndicatorId = selecciones[asignaturaId];

                if (selectedIndicatorId) {
                  const indicator = indicatorsMap.get(selectedIndicatorId);
                  if (indicator) {
                    indicadoresEvaluados.push({
                      asignaturaId: asignaturaId,
                      texto: indicator.texto || 'Sin texto'
                    });
                  }
                }
              });

              return {
                id: proposito.id || '',
                texto: proposito.texto || '',
                referentes: proposito.referentes || [],
                indicadores: indicadoresEvaluados
              };
            }).filter((p: ProposedData) => p.indicadores.length > 0);

          } catch (error) {
            console.error('Error cargando datos de preescolar:', error);
          }
        }

        // Obtener fecha de entrega y rango de fechas del período
        let periodConfig = null;
        try {
          periodConfig = await fetchPeriodConfig(periodId!, year);
          if (periodConfig?.fechaEntrega) {
            setFechaEntrega(formatFechaEntrega(periodConfig.fechaEntrega));
          }
        } catch {
          // Si no hay configuración, usar fecha actual
        }

        // Cargar registros de asistencia para calcular fallas
        let attendanceRecords: AttendanceRecord[] = [];
        if (periodConfig?.fechaInicio && periodConfig?.fechaFin && studentData.classroomId) {
          try {
            attendanceRecords = await fetchAttendanceByClassroom(
              studentData.classroomId,
              periodConfig.fechaInicio,
              periodConfig.fechaFin
            );
          } catch {
            // Si no hay datos de asistencia, usar fallas = 0
          }
        }

        // Helper para obtener logros
        const getAchievements = async (achievementId?: string) => {
          if (!achievementId) return null;
          try {
            const achievementSnap = await getDoc(doc(db, 'achievements', achievementId));
            return achievementSnap.exists() ? achievementSnap.data().logros : null;
          } catch {
            return null;
          }
        };

        for (const [areaId, areaData] of Object.entries(periodData.areas)) {
          const areaInfo = areasMap[areaId] || {};
          const achievements = await getAchievements((areaData as any).metadata?.achievementId);

          // Calcular fallas desde registros de asistencia
          const teacherId = (areaData as any).metadata?.teacherId;
          let fallasTotales = 0;
          let fallasInjustificadas = 0;
          if (teacherId && attendanceRecords.length > 0) {
            const areaRecords = attendanceRecords.filter(
              (r) => r.profesorId === teacherId && r.areaId === areaId
            );
            const summary = computeAttendanceSummary(areaRecords, studentId!);
            fallasTotales = summary.totalJustified + summary.totalUnjustified;
            fallasInjustificadas = summary.totalUnjustified;
          }

          const subject: SubjectData & { _orden?: string } = {
            areaId,
            asignatura: areaInfo.asignatura || areaId,
            ihs: areaInfo.ihs || 'N/A',
            grades: {
              ...((areaData as any).grades || { l1: 0, l2: 0, l3: 0 }),
              fallas: fallasTotales,
              fallasVerificadas: fallasInjustificadas,
            },
            achievements: achievements || { logro1: 'N/A', logro2: 'N/A', logro3: 'N/A' },
            _orden: areaInfo.orden
          };

          primaryData.push(subject);

          const areaKey = areaInfo.area || 'Otras';
          if (!secondaryGroups[areaKey]) {
            secondaryGroups[areaKey] = {
              nombreArea: areaKey,
              _orden: areaInfo.orden,
              subjects: []
            };
          }
          secondaryGroups[areaKey].subjects.push(subject);
        }

        const finalData = {
          primary: primaryData
            .sort(sortByOrder)
            .map(({ _orden, ...rest }) => rest),

          secondary: Object.values(secondaryGroups)
            .sort(sortByOrder)
            .map(({ _orden, subjects, ...groupRest }) => ({
              ...groupRest,
              subjects: subjects
                .sort(sortByOrder)
                .map(({ _orden, ...subjectRest }) => subjectRest)
            })),
          preschool: preschoolData,
          periodInfo: {
            periodo: yearData.periodo || '',
            curso: yearData.curso || ''
          }
        };

        setReportData(finalData);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, year, periodId]);

  return {
    reportData,
    studentInfo,
    fechaEntrega,
    director,
    loading,
    error
  };
}

export default useReportData;
