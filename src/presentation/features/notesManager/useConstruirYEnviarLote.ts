import { useCallback } from 'react';
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

  const calcularPromedio = useCallback((l1: string, l2: string, l3: string): string => {
    const n1 = parseFloat(l1);
    const n2 = parseFloat(l2);
    const n3 = parseFloat(l3);
    if ([n1, n2, n3].some(isNaN)) return 'N/A';
    return ((n1 + n2 + n3) / 3).toFixed(2);
  }, []);

  const validarTodoAntesDeEnviar = useCallback(async () => {
    setShowErrors(true);

    const allValid = students.every(student => {
      const g = grades[student.id] || { l1: '', l2: '', l3: '', fallas: '', fallasVerificadas: '' };
      return (
        validarNotaNumerica(g.l1) &&
        validarNotaNumerica(g.l2) &&
        validarNotaNumerica(g.l3) &&
        validarCantidadFallas(g.fallas) &&
        validarCantidadFallas(g.fallasVerificadas ?? '')
      );
    });

    if (!allValid || !contexto.classroomId || !contexto.areaId || !contexto.periodId) {
      alert('¡Corrige los errores antes de enviar!');
      return false;
    }

    // Verifica existencia de logros (misma lógica que tu componente original)
    const currentPeriod = parseInt(contexto.periodId);
    const achievementDoc = await getAchievement(contexto.classroomId!, contexto.areaId!, currentPeriod);
    if (!achievementDoc) {
      alert('Primero debes registrar los logros para este periodo');
      return false;
    }

    return true;
  }, [students, grades, validarNotaNumerica, validarCantidadFallas, contexto, setShowErrors]);

  const enviarLote = useCallback(async () => {
    // Asumimos que validarTodoAntesDeEnviar ya se llamó y regresó true
    try {
      const achievementPeriod = parseInt(contexto.periodId!);
      const achievementDoc = await getAchievement(contexto.classroomId!, contexto.areaId!, achievementPeriod);
      if (!achievementDoc) {
        alert('Primero debes registrar los logros para este periodo');
        return;
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
            fallas: parseInt(g.fallas),
            fallasVerificadas: parseInt(g.fallasVerificadas ?? '0') // NUEVO
          },
          classroomId: contexto.classroomId!,
          teacherId: "current_user_id",
          achievementId: achievementDoc.id
        };
      });

      await bulkSaveStudents(payload);
      alert('Calificaciones guardadas correctamente!');
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al guardar");
    }
  }, [students, grades, contexto]);

  return { calcularPromedio, validarTodoAntesDeEnviar, enviarLote };
};
