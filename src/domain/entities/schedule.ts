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
