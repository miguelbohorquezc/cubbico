/**
 * @fileoverview Utilidades para detección de solapamientos visuales en el calendario
 * @module presentation/features/schedule/utils/overlapDetection
 */

import type { FlexibleScheduleActivity } from '../../../../domain/entities/schedule';
import { timeToMinutes } from '../../../../domain/entities/schedule';

// ============================================
// Tipos
// ============================================

/**
 * Mapa de solapamientos: activityId → [ids de actividades con las que se solapa]
 */
export type OverlapMap = Map<string, string[]>;

/**
 * Información detallada de un solapamiento
 */
export interface OverlapInfo {
  activityId: string;
  conflictsWith: string[];
  reason: 'SAME_TEACHER' | 'SAME_CLASSROOM' | 'BOTH';
}

// ============================================
// Funciones privadas
// ============================================

/**
 * Verifica si dos actividades se solapan temporalmente
 */
function activitiesOverlapInTime(
  a1: FlexibleScheduleActivity,
  a2: FlexibleScheduleActivity
): boolean {
  // Deben estar en el mismo día
  if (a1.dayOfWeek !== a2.dayOfWeek) return false;

  const a1Start = timeToMinutes(a1.startTime);
  const a1End = a1Start + a1.durationMinutes;

  const a2Start = timeToMinutes(a2.startTime);
  const a2End = a2Start + a2.durationMinutes;

  // Dos rangos se solapan si: a1Start < a2End && a2Start < a1End
  return a1Start < a2End && a2Start < a1End;
}

/**
 * Verifica si dos actividades tienen conflicto de recursos (profesor o salón)
 */
function activitiesConflict(
  a1: FlexibleScheduleActivity,
  a2: FlexibleScheduleActivity
): { conflicts: boolean; reason: 'SAME_TEACHER' | 'SAME_CLASSROOM' | 'BOTH' | null } {
  if (!activitiesOverlapInTime(a1, a2)) {
    return { conflicts: false, reason: null };
  }

  const sameTeacher = a1.teacherId === a2.teacherId;
  const sameClassroom = a1.classroomId === a2.classroomId;

  if (sameTeacher && sameClassroom) {
    return { conflicts: true, reason: 'BOTH' };
  }

  if (sameTeacher) {
    return { conflicts: true, reason: 'SAME_TEACHER' };
  }

  if (sameClassroom) {
    return { conflicts: true, reason: 'SAME_CLASSROOM' };
  }

  return { conflicts: false, reason: null };
}

// ============================================
// Funciones públicas
// ============================================

/**
 * Detecta todos los solapamientos visuales entre actividades.
 *
 * Un solapamiento ocurre cuando:
 * - Dos actividades están en el mismo día
 * - Se solapan temporalmente
 * - Comparten el mismo profesor O el mismo salón
 *
 * @param activities - Lista de todas las actividades
 * @returns Mapa de activityId → array de IDs con los que se solapa
 *
 * @example
 * ```ts
 * const overlaps = detectVisualOverlaps(activities);
 * if (overlaps.has('activity-1')) {
 *   console.log('activity-1 se solapa con:', overlaps.get('activity-1'));
 * }
 * ```
 */
export function detectVisualOverlaps(
  activities: FlexibleScheduleActivity[]
): OverlapMap {
  const overlapMap: OverlapMap = new Map();

  // Comparar cada par de actividades
  for (let i = 0; i < activities.length; i++) {
    const a1 = activities[i];

    for (let j = i + 1; j < activities.length; j++) {
      const a2 = activities[j];

      const { conflicts } = activitiesConflict(a1, a2);

      if (conflicts) {
        // Agregar a2 a la lista de solapamientos de a1
        if (!overlapMap.has(a1.id)) {
          overlapMap.set(a1.id, []);
        }
        overlapMap.get(a1.id)!.push(a2.id);

        // Agregar a1 a la lista de solapamientos de a2
        if (!overlapMap.has(a2.id)) {
          overlapMap.set(a2.id, []);
        }
        overlapMap.get(a2.id)!.push(a1.id);
      }
    }
  }

  return overlapMap;
}

/**
 * Obtiene información detallada de los solapamientos de una actividad.
 *
 * @param activities - Lista de todas las actividades
 * @returns Array de información detallada de solapamientos
 */
export function getDetailedOverlaps(
  activities: FlexibleScheduleActivity[]
): OverlapInfo[] {
  const result: OverlapInfo[] = [];
  const processed = new Set<string>();

  for (let i = 0; i < activities.length; i++) {
    const a1 = activities[i];
    const conflictsWith: string[] = [];

    for (let j = 0; j < activities.length; j++) {
      if (i === j) continue;

      const a2 = activities[j];
      const { conflicts } = activitiesConflict(a1, a2);

      if (conflicts) {
        conflictsWith.push(a2.id);
      }
    }

    if (conflictsWith.length > 0) {
      const key = [a1.id, ...conflictsWith].sort().join(',');
      if (!processed.has(key)) {
        // Determinar razón predominante
        let reason: 'SAME_TEACHER' | 'SAME_CLASSROOM' | 'BOTH' = 'BOTH';
        const conflicts = conflictsWith.map((id) => {
          const a2 = activities.find((a) => a.id === id)!;
          return activitiesConflict(a1, a2).reason!;
        });

        if (conflicts.every((r) => r === 'SAME_TEACHER')) reason = 'SAME_TEACHER';
        else if (conflicts.every((r) => r === 'SAME_CLASSROOM')) reason = 'SAME_CLASSROOM';

        result.push({ activityId: a1.id, conflictsWith, reason });
        processed.add(key);
      }
    }
  }

  return result;
}

/**
 * Verifica si una actividad tiene solapamientos.
 *
 * @param activityId - ID de la actividad
 * @param overlapMap - Mapa de solapamientos (resultado de detectVisualOverlaps)
 * @returns true si la actividad se solapa con al menos otra
 */
export function hasOverlap(activityId: string, overlapMap: OverlapMap): boolean {
  return overlapMap.has(activityId) && overlapMap.get(activityId)!.length > 0;
}

/**
 * Cuenta el número total de solapamientos en el horario.
 *
 * @param overlapMap - Mapa de solapamientos
 * @returns Número total de conflictos únicos
 */
export function countOverlaps(overlapMap: OverlapMap): number {
  const uniquePairs = new Set<string>();

  for (const [id1, conflicts] of overlapMap.entries()) {
    for (const id2 of conflicts) {
      const key = [id1, id2].sort().join('|');
      uniquePairs.add(key);
    }
  }

  return uniquePairs.size;
}

/**
 * Filtra actividades que tienen solapamientos.
 *
 * @param activities - Lista de actividades
 * @param overlapMap - Mapa de solapamientos
 * @returns Array de actividades que se solapan con otras
 */
export function getConflictingActivities(
  activities: FlexibleScheduleActivity[],
  overlapMap: OverlapMap
): FlexibleScheduleActivity[] {
  return activities.filter((activity) => hasOverlap(activity.id, overlapMap));
}
