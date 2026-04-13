import { useCallback } from 'react';
import { useAppSelector } from '../../../app/store/store';
import { bulkSaveStudents } from '../../../infrastructure/student.service';
import { getAchievement } from '../../../infrastructure/achievement.service';
import { Student, MapaNotas } from './types';

export const useConstruirYEnviarLote = ({
  students,
  grades,
  contexto,
  validarNotaNumerica,
  validarCantidadFallas,
  setShowErrors
}: {
  students: Student[];
  grades: MapaNotas;
  contexto: { classroomId?: string; periodId?: string; areaId?: string; anioActual: string };
  validarNotaNumerica: (v: string) => boolean;
  validarCantidadFallas: (v: string) => boolean;
  setShowErrors: (v: boolean) => void;
}) => {
  // Obtener usuario autenticado desde Redux
  const user = useAppSelector((state) => state.user) as any;

  const calcularPromedio = useCallback((l1: string, l2: string, l3: string): string => {
    const n1 = parseFloat(l1);
    const n2 = parseFloat(l2);
    const n3 = parseFloat(l3);
    if ([n1, n2, n3].some(isNaN)) return 'N/A';
    return ((n1 + n2 + n3) / 3).toFixed(2);
  }, []);

  /**
   * Valida todos los datos antes de enviar.
   * Retorna un objeto { ok, errores } en lugar de lanzar alerts.
   */
  const validarTodoAntesDeEnviar = useCallback(async (): Promise<{ ok: boolean; errores: string[] }> => {
    setShowErrors(true);

    if (!contexto.classroomId || !contexto.areaId || !contexto.periodId) {
      return { ok: false, errores: ['Falta información del salón, área o período.'] };
    }

    const errores: string[] = [];

    students.forEach((student) => {
      const g = grades[student.id] || { l1: '', l2: '', l3: '', fallas: '', fallasVerificadas: '' };
      const nombre = `${student.lastName} ${student.name}`;

      if (!g.l1 || !g.l2 || !g.l3) {
        errores.push(`${nombre}: Faltan notas (L1, L2 o L3)`);
        return;
      }
      if (!validarNotaNumerica(g.l1)) errores.push(`${nombre}: L1 inválida (1.0 – 5.0)`);
      if (!validarNotaNumerica(g.l2)) errores.push(`${nombre}: L2 inválida (1.0 – 5.0)`);
      if (!validarNotaNumerica(g.l3)) errores.push(`${nombre}: L3 inválida (1.0 – 5.0)`);
      if (g.fallas !== '' && !validarCantidadFallas(g.fallas))
        errores.push(`${nombre}: Fallas inválidas (0 – 99)`);
      if (g.fallasVerificadas && g.fallasVerificadas !== '' && !validarCantidadFallas(g.fallasVerificadas))
        errores.push(`${nombre}: Fallas injustificadas inválidas (0 – 99)`);
    });

    if (errores.length > 0) return { ok: false, errores };

    const currentPeriod = parseInt(contexto.periodId);
    const achievementDoc = await getAchievement(contexto.classroomId!, contexto.areaId!, currentPeriod);
    if (!achievementDoc) {
      return { ok: false, errores: ['Primero debes registrar los logros para este período.'] };
    }

    return { ok: true, errores: [] };
  }, [students, grades, validarNotaNumerica, validarCantidadFallas, contexto, setShowErrors]);

  /**
   * Envía el lote a Firebase. Lanza un Error si algo falla (sin alerts).
   */
  const enviarLote = useCallback(async () => {
    if (!user || !user.uid) {
      throw new Error('No se pudo identificar al usuario. Vuelve a iniciar sesión.');
    }

    const achievementPeriod = parseInt(contexto.periodId!);
    const achievementDoc = await getAchievement(contexto.classroomId!, contexto.areaId!, achievementPeriod);
    if (!achievementDoc) {
      throw new Error('Primero debes registrar los logros para este período.');
    }

    const payload = students.map(student => {
      const g = grades[student.id] || { l1: '', l2: '', l3: '', fallas: '', fallasVerificadas: '' };
      return {
        studentId: student.id,
        year: contexto.anioActual,
        period: contexto.periodId!,
        areaId: contexto.areaId!,
        grades: {
          l1: parseFloat(g.l1),
          l2: parseFloat(g.l2),
          l3: parseFloat(g.l3),
          fallas: g.fallas !== '' ? parseInt(g.fallas) : 0,
          fallasVerificadas: g.fallasVerificadas && g.fallasVerificadas !== '' ? parseInt(g.fallasVerificadas) : 0,
        },
        classroomId: contexto.classroomId!,
        teacherId: user.uid,
        achievementId: achievementDoc.id,
      };
    });

    await bulkSaveStudents(payload);
  }, [students, grades, contexto, user]);

  return { calcularPromedio, validarTodoAntesDeEnviar, enviarLote };
};
