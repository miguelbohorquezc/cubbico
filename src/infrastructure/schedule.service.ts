/**
 * @fileoverview Servicio de persistencia para horarios docente
 * @module infrastructure/schedule.service
 *
 * Colección Firestore: `horarios`
 * Estructura: un documento por año académico con array de slots.
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase/firebase';
import type { ScheduleDocument, ScheduleSlot } from '../domain/entities/schedule';

const COLLECTION = 'horarios';

// ============================================
// Leer horario completo de un año
// ============================================

export const fetchSchedule = async (year: string): Promise<ScheduleDocument> => {
  try {
    const snapshot = await getDoc(doc(db, COLLECTION, year));
    if (!snapshot.exists()) {
      return { year, slots: [] };
    }
    const data = snapshot.data();
    return {
      year,
      slots: (data.slots as ScheduleSlot[]) || [],
      updatedAt: data.updatedAt,
    };
  } catch (error) {
    console.error('Error al cargar horario:', error);
    throw new Error('Error al cargar horario');
  }
};

// ============================================
// Guardar horario completo (replace)
// ============================================

export const saveSchedule = async (year: string, slots: ScheduleSlot[]): Promise<void> => {
  try {
    await setDoc(doc(db, COLLECTION, year), {
      year,
      slots,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error al guardar horario:', error);
    throw new Error('Error al guardar horario');
  }
};

// ============================================
// Eliminar horario de un año
// ============================================

export const deleteSchedule = async (year: string): Promise<void> => {
  try {
    await setDoc(doc(db, COLLECTION, year), {
      year,
      slots: [],
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error al eliminar horario:', error);
    throw new Error('Error al eliminar horario');
  }
};

// ============================================
// Obtener horario filtrado por profesor
// ============================================

export const fetchScheduleByProfessor = async (
  year: string,
  professorId: string
): Promise<ScheduleSlot[]> => {
  const schedule = await fetchSchedule(year);
  return schedule.slots.filter((slot) => slot.profesorId === professorId);
};

// ============================================
// Utilidades para bloques horarios
// ============================================

/**
 * Extrae las horas únicas de un array de slots, ordenadas.
 * Útil para generar la lista de horas dinámicamente desde los datos reales.
 * @param slots - Array de slots de horario
 * @returns Array de strings hora únicos, ordenados
 */
export const extractUniqueTimeSlots = (slots: ScheduleSlot[]): string[] => {
  const uniqueHoras = new Set<string>();
  slots.forEach(slot => uniqueHoras.add(slot.hora));
  return Array.from(uniqueHoras).sort((a, b) => {
    // Ordenar por hora numérica
    const [hoursA, minutesA] = a.split(':').map(Number);
    const [hoursB, minutesB] = b.split(':').map(Number);
    const minutesFromMidnightA = hoursA * 60 + minutesA;
    const minutesFromMidnightB = hoursB * 60 + minutesB;
    return minutesFromMidnightA - minutesFromMidnightB;
  });
};

// ============================================
// V3: Servicio de Calendario Flexible
// ============================================

import type {
  FlexibleScheduleDocument,
  FlexibleScheduleActivity,
} from '../domain/entities/schedule';

/**
 * Colección Firestore para horarios flexibles.
 * Estructura: un documento por año académico con array de actividades.
 */
const FLEXIBLE_COLLECTION = 'flexible-schedules';

/**
 * Convierte slots legacy a actividades flexibles
 */
const convertLegacyToFlexible = (slots: ScheduleSlot[]): FlexibleScheduleActivity[] => {
  return slots.map((slot) => {
    const id = `activity-${slot.dia}-${slot.hora}-${slot.profesorId}-${slot.areaId}`.replace(/[^a-zA-Z0-9-]/g, '-');
    const durationMinutes = 45; // Duración por defecto
    const [hours, minutes] = slot.hora.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + durationMinutes;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

    return {
      id,
      dayOfWeek: slot.dia,
      startTime: slot.hora,
      durationMinutes,
      endTime,
      courseId: slot.areaId,
      courseName: slot.areaNombre,
      teacherId: slot.profesorId,
      teacherName: slot.profesorNombre,
      classroomId: slot.salonId,
      classroomName: slot.salonNombre,
    };
  });
};

/**
 * Obtiene el documento de horario flexible para un año académico.
 * Si no existe en flexible-schedules, intenta cargar datos legacy y convertirlos.
 *
 * @param year - Año académico (ej: "2025")
 * @returns Documento con actividades flexibles
 * @throws Error si falla la conexión con Firestore
 */
export const fetchFlexibleSchedule = async (
  year: string
): Promise<FlexibleScheduleDocument> => {
  try {
    // Intentar cargar desde flexible-schedules
    const snapshot = await getDoc(doc(db, FLEXIBLE_COLLECTION, year));

    if (snapshot.exists()) {
      const data = snapshot.data();
      return {
        year,
        activities: (data.activities as FlexibleScheduleActivity[]) || [],
        version: 'v3',
        updatedAt: data.updatedAt,
      };
    }

    // Si no existe, intentar cargar datos legacy y convertir
    console.log(`No hay datos en ${FLEXIBLE_COLLECTION}/${year}, intentando cargar datos legacy...`);

    try {
      const legacySchedule = await fetchSchedule(year);

      if (legacySchedule.slots.length > 0) {
        console.log(`Encontrados ${legacySchedule.slots.length} slots legacy, convirtiendo a formato flexible...`);
        const activities = convertLegacyToFlexible(legacySchedule.slots);

        // Opcionalmente, guardar los datos convertidos en flexible-schedules
        // (descomentado para que la migración sea automática)
        await saveFlexibleSchedule(year, activities);
        console.log(`✅ Datos migrados automáticamente a ${FLEXIBLE_COLLECTION}/${year}`);

        return {
          year,
          activities,
          version: 'v3',
          updatedAt: new Date().toISOString(),
        };
      }
    } catch (legacyError) {
      console.warn('No se pudieron cargar datos legacy:', legacyError);
    }

    // Si no hay datos legacy tampoco, retornar vacío
    return {
      year,
      activities: [],
      version: 'v3',
    };
  } catch (error) {
    console.error('Error al cargar horario flexible:', error);
    throw new Error('Error al cargar horario flexible');
  }
};

/**
 * Guarda el documento completo de horario flexible (operación de reemplazo total).
 *
 * @param year - Año académico
 * @param activities - Array completo de actividades
 * @throws Error si falla la escritura en Firestore
 */
export const saveFlexibleSchedule = async (
  year: string,
  activities: FlexibleScheduleActivity[]
): Promise<void> => {
  try {
    await setDoc(doc(db, FLEXIBLE_COLLECTION, year), {
      year,
      activities,
      version: 'v3',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error al guardar horario flexible:', error);
    throw new Error('Error al guardar horario flexible');
  }
};

/**
 * Agrega una nueva actividad al horario flexible.
 *
 * @param year - Año académico
 * @param activity - Actividad a agregar
 * @throws Error si falla la operación
 */
export const addFlexibleActivity = async (
  year: string,
  activity: FlexibleScheduleActivity
): Promise<void> => {
  try {
    const schedule = await fetchFlexibleSchedule(year);
    schedule.activities.push(activity);
    await saveFlexibleSchedule(year, schedule.activities);
  } catch (error) {
    console.error('Error al agregar actividad:', error);
    throw new Error('Error al agregar actividad');
  }
};

/**
 * Actualiza una actividad existente en el horario flexible.
 *
 * @param year - Año académico
 * @param activity - Actividad con cambios (debe tener el mismo id)
 * @throws Error si no se encuentra la actividad o falla la operación
 */
export const updateFlexibleActivity = async (
  year: string,
  activity: FlexibleScheduleActivity
): Promise<void> => {
  try {
    const schedule = await fetchFlexibleSchedule(year);
    const index = schedule.activities.findIndex((a) => a.id === activity.id);

    if (index === -1) {
      throw new Error(`Actividad con id ${activity.id} no encontrada`);
    }

    schedule.activities[index] = activity;
    await saveFlexibleSchedule(year, schedule.activities);
  } catch (error) {
    console.error('Error al actualizar actividad:', error);
    throw new Error('Error al actualizar actividad');
  }
};

/**
 * Elimina una actividad del horario flexible.
 *
 * @param year - Año académico
 * @param activityId - ID de la actividad a eliminar
 * @throws Error si falla la operación
 */
export const deleteFlexibleActivity = async (
  year: string,
  activityId: string
): Promise<void> => {
  try {
    const schedule = await fetchFlexibleSchedule(year);
    schedule.activities = schedule.activities.filter((a) => a.id !== activityId);
    await saveFlexibleSchedule(year, schedule.activities);
  } catch (error) {
    console.error('Error al eliminar actividad:', error);
    throw new Error('Error al eliminar actividad');
  }
};

/**
 * Obtiene las actividades de un profesor específico.
 *
 * @param year - Año académico
 * @param teacherId - ID del profesor
 * @returns Array de actividades filtradas
 */
export const fetchFlexibleScheduleByTeacher = async (
  year: string,
  teacherId: string
): Promise<FlexibleScheduleActivity[]> => {
  const schedule = await fetchFlexibleSchedule(year);
  return schedule.activities.filter((activity) => activity.teacherId === teacherId);
};

/**
 * Obtiene las actividades de un salón específico.
 *
 * @param year - Año académico
 * @param classroomId - ID del salón
 * @returns Array de actividades filtradas
 */
export const fetchFlexibleScheduleByClassroom = async (
  year: string,
  classroomId: string
): Promise<FlexibleScheduleActivity[]> => {
  const schedule = await fetchFlexibleSchedule(year);
  return schedule.activities.filter((activity) => activity.classroomId === classroomId);
};

// ============================================
// Migración de Legacy a Flexible
// ============================================

import { calculateEndTime } from '../domain/entities/schedule';

/**
 * Convierte un slot legacy a una actividad flexible.
 * Asume duración por defecto de 45 minutos si no se especifica otra.
 *
 * @param slot - Slot del sistema legacy
 * @param defaultDuration - Duración por defecto en minutos
 * @returns Actividad flexible equivalente
 */
function convertSlotToActivity(
  slot: ScheduleSlot,
  defaultDuration: number = 45
): FlexibleScheduleActivity {
  // Normalizar hora a formato HH:mm
  const [hours, minutes] = slot.hora.split(':');
  const startTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;

  // Generar ID único basado en los datos del slot
  const id = `migrated-${slot.dia}-${slot.hora}-${slot.profesorId}-${slot.areaId}`.replace(
    /[^a-zA-Z0-9-]/g,
    '-'
  );

  return {
    id,
    dayOfWeek: slot.dia,
    startTime,
    durationMinutes: defaultDuration,
    endTime: calculateEndTime(startTime, defaultDuration),
    courseId: slot.areaId,
    courseName: slot.areaNombre,
    teacherId: slot.profesorId,
    teacherName: slot.profesorNombre,
    classroomId: slot.salonId,
    classroomName: slot.salonNombre,
    metadata: {
      migratedFrom: 'legacy',
      originalHora: slot.hora,
    },
  };
}

/**
 * Migra un horario legacy completo al formato flexible.
 * Esta operación:
 * - Lee el horario legacy del año especificado
 * - Convierte cada slot a una actividad flexible
 * - Guarda el resultado en la colección flexible-schedules
 * - NO elimina el horario legacy (se mantiene como respaldo)
 *
 * @param year - Año académico a migrar
 * @param defaultDuration - Duración por defecto para actividades (45 min por defecto)
 * @returns Cantidad de actividades migradas
 * @throws Error si falla la migración
 */
export const migrateFromLegacySchedule = async (
  year: string,
  defaultDuration: number = 45
): Promise<number> => {
  try {
    console.log(`[Migración] Iniciando migración del año ${year}...`);

    // 1. Verificar si ya existe horario flexible
    const existingFlexible = await fetchFlexibleSchedule(year);
    if (existingFlexible.activities.length > 0) {
      console.warn(
        `[Migración] Ya existe horario flexible para ${year} con ${existingFlexible.activities.length} actividades.`
      );
      console.warn('[Migración] Se sobrescribirá con los datos legacy.');
    }

    // 2. Cargar horario legacy
    const legacySchedule = await fetchSchedule(year);
    if (legacySchedule.slots.length === 0) {
      console.log('[Migración] No hay datos legacy para migrar.');
      return 0;
    }

    console.log(`[Migración] Se encontraron ${legacySchedule.slots.length} slots legacy.`);

    // 3. Convertir cada slot a actividad flexible
    const activities: FlexibleScheduleActivity[] = legacySchedule.slots.map((slot) =>
      convertSlotToActivity(slot, defaultDuration)
    );

    // 4. Guardar en colección flexible
    await saveFlexibleSchedule(year, activities);

    console.log(`[Migración] ✅ Migración completada. ${activities.length} actividades creadas.`);
    console.log('[Migración] El horario legacy se mantiene intacto como respaldo.');

    return activities.length;
  } catch (error) {
    console.error('[Migración] ❌ Error durante la migración:', error);
    throw new Error('Error al migrar horario legacy');
  }
};

/**
 * Verifica si existe horario legacy para un año sin horario flexible.
 * Útil para determinar si se debe mostrar opción de migración en la UI.
 *
 * @param year - Año académico
 * @returns true si hay legacy pero no flexible
 */
export const needsMigration = async (year: string): Promise<boolean> => {
  try {
    const [legacy, flexible] = await Promise.all([
      fetchSchedule(year),
      fetchFlexibleSchedule(year),
    ]);

    return legacy.slots.length > 0 && flexible.activities.length === 0;
  } catch (error) {
    console.error('Error al verificar necesidad de migración:', error);
    return false;
  }
};
