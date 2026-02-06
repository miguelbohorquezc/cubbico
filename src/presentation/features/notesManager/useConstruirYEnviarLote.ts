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
  const user = useAppSelector((state) => state.user);

  const calcularPromedio = useCallback((l1: string, l2: string, l3: string): string => {
    const n1 = parseFloat(l1);
    const n2 = parseFloat(l2);
    const n3 = parseFloat(l3);
    if ([n1, n2, n3].some(isNaN)) return 'N/A';
    return ((n1 + n2 + n3) / 3).toFixed(2);
  }, []);

  const validarTodoAntesDeEnviar = useCallback(async () => {
    setShowErrors(true);

    // Validar contexto primero
    if (!contexto.classroomId || !contexto.areaId || !contexto.periodId) {
      alert('Error: Falta información del salón, área o periodo');
      return false;
    }

    // Validar cada estudiante y recopilar errores
    const errores: string[] = [];

    students.forEach((student, index) => {
      const g = grades[student.id] || { l1: '', l2: '', l3: '', fallas: '', fallasVerificadas: '' };

      // Validar que las notas no estén vacías
      if (!g.l1 || !g.l2 || !g.l3) {
        errores.push(`${student.name} ${student.lastName}: Faltan notas (L1, L2 o L3)`);
        return;
      }

      // Validar notas numéricas
      if (!validarNotaNumerica(g.l1)) {
        errores.push(`${student.name} ${student.lastName}: L1 inválida (debe estar entre 1.0 y 5.0)`);
      }
      if (!validarNotaNumerica(g.l2)) {
        errores.push(`${student.name} ${student.lastName}: L2 inválida (debe estar entre 1.0 y 5.0)`);
      }
      if (!validarNotaNumerica(g.l3)) {
        errores.push(`${student.name} ${student.lastName}: L3 inválida (debe estar entre 1.0 y 5.0)`);
      }

      // NOTA: Las fallas ya NO se manejan aquí, se gestionan desde el módulo de asistencia
      // Por lo tanto, NO validamos fallas ni fallasVerificadas
    });

    if (errores.length > 0) {
      console.error('Errores de validación:', errores);
      alert(`¡Corrige los siguientes errores antes de enviar:\n\n${errores.slice(0, 5).join('\n')}${errores.length > 5 ? `\n\n...y ${errores.length - 5} más` : ''}`);
      return false;
    }

    // Verifica existencia de logros
    const currentPeriod = parseInt(contexto.periodId);
    const achievementDoc = await getAchievement(contexto.classroomId!, contexto.areaId!, currentPeriod);
    if (!achievementDoc) {
      alert('Primero debes registrar los logros para este periodo');
      return false;
    }

    return true;
  }, [students, grades, validarNotaNumerica, validarCantidadFallas, contexto, setShowErrors]);

  const enviarLote = useCallback(async () => {
    // Validar que el usuario está autenticado
    if (!user || !user.uid) {
      alert('Error: No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.');
      return;
    }

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
            // Las fallas vienen del módulo de asistencia, si están vacías usar 0
            fallas: g.fallas && g.fallas !== '' ? parseInt(g.fallas) : 0,
            fallasVerificadas: g.fallasVerificadas && g.fallasVerificadas !== '' ? parseInt(g.fallasVerificadas) : 0
          },
          classroomId: contexto.classroomId!,
          teacherId: user.uid, // ✅ Usar UID real del usuario autenticado
          achievementId: achievementDoc.id
        };
      });

      await bulkSaveStudents(payload);
      alert('Calificaciones guardadas correctamente!');
    } catch (err) {
      console.error('Error al guardar calificaciones:', err);
      alert(err instanceof Error ? err.message : "Error al guardar");
    }
  }, [students, grades, contexto, user]);

  return { calcularPromedio, validarTodoAntesDeEnviar, enviarLote };
};
