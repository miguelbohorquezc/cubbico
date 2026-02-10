import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase/firebase';

/**
 * Guarda o actualiza el historial de preescolar para un estudiante
 *
 * @param studentId - ID del estudiante
 * @param year - Año académico
 * @param periodo - Número del periodo (1-4)
 * @param classRoomId - ID del salón
 * @param selecciones - Objeto con las selecciones de indicadores {asignaturaId: indicadorId}
 * @param metadata - Metadatos opcionales (nombre del estudiante, salón, etc.)
 */
export async function savePreschoolToHistory(
  studentId: string,
  year: string,
  periodo: number,
  classRoomId: string,
  selecciones: Record<string, string>,
  metadata?: {
    studentName?: string;
    classroomName?: string;
    nivel?: string;
  }
): Promise<void> {
  try {
    const historyRef = doc(db, 'history', studentId);
    const historySnap = await getDoc(historyRef);

    let historyData: any = {};

    if (historySnap.exists()) {
      historyData = historySnap.data();
    }

    // Asegurar estructura years
    if (!historyData.years) {
      historyData.years = {};
    }

    // Asegurar estructura del año
    if (!historyData.years[year]) {
      historyData.years[year] = {
        periods: {},
        metadata: {
          nivel: metadata?.nivel || 'preescolar',
          nombreGrado: metadata?.classroomName || '',
          classroomId: classRoomId,
          lastUpdated: new Date().toISOString(),
        },
      };
    }

    // Asegurar estructura del periodo
    if (!historyData.years[year].periods) {
      historyData.years[year].periods = {};
    }

    // Guardar las selecciones en el periodo como "areas" para mantener consistencia
    // Cada asignatura será un "área" con su indicador seleccionado
    const periodData: any = {
      preschool: true, // Flag para identificar que es preescolar
      selecciones: selecciones,
      metadata: {
        studentName: metadata?.studentName || '',
        classroomName: metadata?.classroomName || '',
        classroomId: classRoomId,
        nivel: 'preescolar',
        periodo: periodo,
        year: year,
        lastUpdated: new Date().toISOString(),
      },
    };

    // Para compatibilidad con la estructura existente, también guardamos como "areas"
    periodData.areas = {};
    Object.keys(selecciones).forEach((asignaturaId) => {
      periodData.areas[asignaturaId] = {
        indicadorSeleccionado: selecciones[asignaturaId],
        metadata: {
          nivel: 'preescolar',
          classroomId: classRoomId,
        },
      };
    });

    historyData.years[year].periods[periodo.toString()] = periodData;

    // Actualizar metadata del año si es necesario
    if (metadata?.classroomName) {
      historyData.years[year].metadata = {
        ...historyData.years[year].metadata,
        nombreGrado: metadata.classroomName,
        classroomId: classRoomId,
        nivel: 'preescolar',
      };
    }

    // Guardar en Firestore
    await setDoc(historyRef, historyData, { merge: true });

    console.log(`Historial de preescolar guardado: ${studentId}, ${year}, P${periodo}`);
  } catch (error) {
    console.error('Error guardando historial de preescolar:', error);
    throw new Error('Error al guardar en el historial');
  }
}

/**
 * Obtiene el historial de preescolar de un estudiante para un año específico
 */
export async function getPreschoolHistory(
  studentId: string,
  year: string
): Promise<Record<string, any> | null> {
  try {
    const historyRef = doc(db, 'history', studentId);
    const historySnap = await getDoc(historyRef);

    if (!historySnap.exists()) {
      return null;
    }

    const historyData = historySnap.data();
    return historyData?.years?.[year] || null;
  } catch (error) {
    console.error('Error obteniendo historial de preescolar:', error);
    return null;
  }
}
