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
