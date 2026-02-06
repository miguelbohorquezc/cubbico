/**
 * @fileoverview Entidades del sistema de horarios docente
 * @module domain/entities/schedule
 */

// ============================================
// Bloques horarios disponibles en la semana
// ============================================

export const TIME_SLOTS: readonly string[] = [
  '7:30',
  '8:20',
  '9:10',
  '10:30',
  '11:20',
  '12:10',
  '13:40',
  '14:30',
  '15:20',
] as const;

export const DAYS_OF_WEEK: readonly string[] = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
] as const;

// ============================================
// Tipos
// ============================================

/** Un bloque de clase en el horario semanal */
export interface ScheduleSlot {
  profesorId: string;
  profesorNombre: string;
  salonId: string;
  salonNombre: string;
  areaId: string;
  areaNombre: string;
  dia: number;   // 0 = Lunes … 4 = Viernes
  hora: string;  // uno de los valores de TIME_SLOTS
}

/** Documento completo del horario para un año académico */
export interface ScheduleDocument {
  year: string;
  slots: ScheduleSlot[];
  updatedAt?: string;
}

/** Parámetros para validar conflictos al agregar un slot */
export interface SlotConflictCheck {
  profesorId: string;
  salonId: string;
  dia: number;
  hora: string;
  excludeIndex?: number; // para excluir el slot propio al mover
}

// ============================================
// Utilidades de dominio
// ============================================

/**
 * Detecta si un nuevo slot genera conflicto de profesor o salón
 * contra la lista actual de slots.
 * Retorna null si no hay conflicto, o un mensaje descriptivo.
 */
export function detectSlotConflict(
  slots: ScheduleSlot[],
  check: SlotConflictCheck
): string | null {
  for (let i = 0; i < slots.length; i++) {
    if (i === check.excludeIndex) continue;

    const s = slots[i];
    if (s.dia !== check.dia || s.hora !== check.hora) continue;

    if (s.profesorId === check.profesorId) {
      return `El profesor ya tiene clase en ${DAYS_OF_WEEK[check.dia]} a las ${check.hora}.`;
    }
    if (s.salonId === check.salonId) {
      return `El salón ya tiene clase en ${DAYS_OF_WEEK[check.dia]} a las ${check.hora}.`;
    }
  }
  return null;
}

// ============================================
// Extensión V2: Soporte para bloques horarios personalizables
// ============================================

/**
 * Versión extendida del documento de horario con soporte para bloques personalizables.
 * Compatible con ScheduleDocument legacy.
 */
export interface ScheduleDocumentV2 extends ScheduleDocument {
  timeBlockConfigId?: string;  // Referencia a la configuración de bloques
  version?: 'v1' | 'v2';       // Versión del formato (v1 = legacy, v2 = bloques configurables)
}

// ============================================
// V3: Sistema de Calendario Flexible
// ============================================

/**
 * Duraciones válidas para actividades en minutos.
 * Soporta desde 10 minutos hasta 2 horas (120 min).
 */
export const VALID_DURATIONS = [
  10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 100, 120
] as const;

export type DurationMinutes = typeof VALID_DURATIONS[number];

/**
 * Actividad flexible en el calendario semanal.
 * No está limitada a bloques fijos de 1 hora.
 */
export interface FlexibleScheduleActivity {
  id: string;
  dayOfWeek: number;        // 0 = Lunes … 4 = Viernes
  startTime: string;        // HH:mm formato 24h (ej: "08:15")
  durationMinutes: number;  // Duración en minutos
  endTime: string;          // HH:mm calculado automáticamente

  // Datos del curso/clase
  courseId: string;         // ID del área/asignatura
  courseName: string;       // Nombre del área
  teacherId: string;        // ID del profesor
  teacherName: string;      // Nombre del profesor
  classroomId: string;      // ID del salón
  classroomName: string;    // Nombre del salón

  // Metadata opcional para integraciones
  metadata?: {
    attendanceRecords?: unknown[]; // Registros de asistencia (no modificar estructura)
    [key: string]: unknown;
  };
}

/**
 * Documento de horario flexible para un año académico.
 */
export interface FlexibleScheduleDocument {
  year: string;
  activities: FlexibleScheduleActivity[];
  version: 'v3';
  updatedAt?: string;
}

/**
 * Parámetros para detectar conflictos entre actividades flexibles.
 */
export interface ActivityConflictCheck {
  teacherId: string;
  classroomId: string;
  dayOfWeek: number;
  startTime: string;
  durationMinutes: number;
  excludeId?: string; // ID de la actividad a excluir (al editar)
}

// ============================================
// Utilidades para Calendario Flexible
// ============================================

/**
 * Convierte una hora en formato HH:mm a minutos desde medianoche.
 * @example timeToMinutes("08:15") => 495
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convierte minutos desde medianoche a formato HH:mm.
 * @example minutesToTime(495) => "08:15"
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Calcula la hora de fin dada una hora de inicio y duración.
 * @example calculateEndTime("08:15", 45) => "09:00"
 */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = startMinutes + durationMinutes;
  return minutesToTime(endMinutes);
}

/**
 * Valida que una actividad esté dentro del rango horario permitido (07:00 - 15:00).
 * Retorna null si es válida, o un mensaje de error descriptivo.
 */
export function validateActivityTime(activity: {
  startTime: string;
  durationMinutes: number;
}): string | null {
  const MIN_TIME = timeToMinutes('07:00');
  const MAX_TIME = timeToMinutes('15:00');

  const startMinutes = timeToMinutes(activity.startTime);
  const endTime = calculateEndTime(activity.startTime, activity.durationMinutes);
  const endMinutes = timeToMinutes(endTime);

  if (startMinutes < MIN_TIME) {
    return 'La actividad no puede comenzar antes de las 07:00.';
  }

  if (endMinutes > MAX_TIME) {
    return 'La actividad no puede terminar después de las 15:00.';
  }

  if (activity.durationMinutes < 10) {
    return 'La duración mínima es de 10 minutos.';
  }

  return null;
}

/**
 * Detecta si dos actividades se solapan en el tiempo.
 */
function activitiesOverlap(
  a1: { startTime: string; durationMinutes: number },
  a2: { startTime: string; durationMinutes: number }
): boolean {
  const a1Start = timeToMinutes(a1.startTime);
  const a1End = a1Start + a1.durationMinutes;
  const a2Start = timeToMinutes(a2.startTime);
  const a2End = a2Start + a2.durationMinutes;

  // Dos rangos se solapan si: a1Start < a2End && a2Start < a1End
  return a1Start < a2End && a2Start < a1End;
}

/**
 * Detecta conflictos de una nueva actividad contra la lista existente.
 * Retorna null si no hay conflicto, o un mensaje descriptivo.
 */
export function detectActivityOverlap(
  activities: FlexibleScheduleActivity[],
  check: ActivityConflictCheck
): string | null {
  for (const activity of activities) {
    // Excluir la actividad misma si estamos editando
    if (activity.id === check.excludeId) continue;

    // Solo verificar actividades del mismo día
    if (activity.dayOfWeek !== check.dayOfWeek) continue;

    // Verificar si hay solapamiento temporal
    if (!activitiesOverlap(activity, check)) continue;

    // Conflicto de profesor
    if (activity.teacherId === check.teacherId) {
      const dayName = DAYS_OF_WEEK[check.dayOfWeek];
      return `El profesor ya tiene clase en ${dayName} a las ${check.startTime}.`;
    }

    // Conflicto de salón
    if (activity.classroomId === check.classroomId) {
      const dayName = DAYS_OF_WEEK[check.dayOfWeek];
      return `El salón ya tiene clase en ${dayName} a las ${check.startTime}.`;
    }
  }

  return null;
}
