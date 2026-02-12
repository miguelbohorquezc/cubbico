// useCargarEstudiantesYNotas.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchActiveStudentsByClassroom, fetchStudentGrades } from '../../../infrastructure/student.service';
import { Student, MapaNotas, CampoCalificacion } from './types';

type RawGrades = any;

// Convierte a string seguro para inputs
const toStr = (v: unknown): string => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'string') return v;
  return '';
};

// Acceso defensivo a rutas anidadas
const pick = (obj: any, path: Array<string | number>) =>
  path.reduce((acc, key) => (acc != null && acc[key] !== undefined ? acc[key] : undefined), obj);

// Helper: intenta con clave numérica y de texto para period
const tryPeriodKeys = (raw: any, anio: string, periodId?: string, areaId?: string, field?: string) => {
  if (!periodId || !areaId || !field) return undefined;
  const asText = pick(raw, [anio, 'periods', String(periodId), 'areas', areaId, 'grades', field]);
  if (asText !== undefined) return asText;
  const asNumber = pick(raw, [anio, 'periods', Number(periodId), 'areas', areaId, 'grades', field]);
  return asNumber;
};

export const useCargarEstudiantesYNotas = ({
  classroomId,
  periodId,
  areaId
}: {
  classroomId?: string;
  periodId?: string;
  areaId?: string;
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<MapaNotas>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  const anioActual = useMemo(() => new Date().getFullYear().toString(), []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!classroomId || !periodId || !areaId) {
          throw new Error('Faltan parámetros requeridos');
        }

        // Solo cargar estudiantes activos (excluye retirados, expulsados, etc.)
        const studentsData = await fetchActiveStudentsByClassroom(classroomId);
        setStudents(studentsData);

        const gradesPromises = studentsData.map(async (student) => {
          const raw: RawGrades = await fetchStudentGrades(student.id, anioActual, periodId, areaId);

          // Notas: aceptamos plano (raw.l1) o anidado (raw[anio].periods[periodId].areas[areaId].grades.l1)
          const l1 =
            toStr(raw?.l1) ??
            toStr(pick(raw, [anioActual, 'periods', String(periodId), 'areas', areaId, 'grades', 'l1'])) ??
            toStr(pick(raw, [anioActual, 'periods', Number(periodId), 'areas', areaId, 'grades', 'l1']));
          const l2 =
            toStr(raw?.l2) ??
            toStr(pick(raw, [anioActual, 'periods', String(periodId), 'areas', areaId, 'grades', 'l2'])) ??
            toStr(pick(raw, [anioActual, 'periods', Number(periodId), 'areas', areaId, 'grades', 'l2']));
          const l3 =
            toStr(raw?.l3) ??
            toStr(pick(raw, [anioActual, 'periods', String(periodId), 'areas', areaId, 'grades', 'l3'])) ??
            toStr(pick(raw, [anioActual, 'periods', Number(periodId), 'areas', areaId, 'grades', 'l3']));
          const fallas =
            toStr(raw?.fallas) ??
            toStr(pick(raw, [anioActual, 'periods', String(periodId), 'areas', areaId, 'grades', 'fallas'])) ??
            toStr(pick(raw, [anioActual, 'periods', Number(periodId), 'areas', areaId, 'grades', 'fallas']));

          // Fallas verificadas según tu captura:
          // history/{studentId}/{anio}/periods/{periodId}/areas/{areaId}/grades/fallasVerificadas
          let fv =
            tryPeriodKeys(raw, anioActual, periodId, areaId, 'fallasVerificadas') ??
            tryPeriodKeys(raw, anioActual, periodId, areaId, 'fallas_verificadas') ?? // por si acaso
            raw?.fallasVerificadas ??
            raw?.fallas_verificadas ??
            raw?.grades?.fallasVerificadas ??
            raw?.grades?.fallas_verificadas;

          const fallasVerificadas = toStr(fv);

          return {
            studentId: student.id,
            l1,
            l2,
            l3,
            fallas,
            fallasVerificadas
          };
        });

        const gradesResults = await Promise.all(gradesPromises);

        const initialGrades = gradesResults.reduce((acc, curr) => {
          acc[curr.studentId] = {
            l1: curr.l1,
            l2: curr.l2,
            l3: curr.l3,
            fallas: curr.fallas,
            fallasVerificadas: curr.fallasVerificadas
          };
          return acc;
        }, {} as MapaNotas);

        setGrades(initialGrades);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [classroomId, periodId, areaId, anioActual]);

  const setCampoNota = useCallback((studentId: string, campo: CampoCalificacion, valor: string) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [campo]: valor
      }
    }));
  }, []);

  return {
    students,
    grades,
    setGrades,
    setCampoNota,
    loading,
    error,
    showErrors,
    setShowErrors
  };
};
