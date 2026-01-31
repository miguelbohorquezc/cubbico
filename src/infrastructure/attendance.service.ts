/**
 * @fileoverview Servicio de persistencia para asistencias
 * @module infrastructure/attendance.service
 *
 * Colección Firestore: `asistencias`
 * Cada documento representa una clase-sesión específica.
 * ID del documento: {salonId}_{profesorId}_{areaId}_{fecha}_{hora}
 */

import {
  doc,
  getDoc,
  setDoc,
  query,
  collection,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase/firebase';
import type { AttendanceRecord } from '../domain/entities/attendance';
import { buildAttendanceId } from '../domain/entities/attendance';

const COLLECTION = 'asistencias';

// ============================================
// Leer una sesión específica
// ============================================

export const fetchAttendance = async (
  salonId: string,
  profesorId: string,
  areaId: string,
  fecha: string,
  hora: string
): Promise<AttendanceRecord | null> => {
  try {
    const id = buildAttendanceId(salonId, profesorId, areaId, fecha, hora);
    const snapshot = await getDoc(doc(db, COLLECTION, id));
    if (!snapshot.exists()) return null;
    return snapshot.data() as AttendanceRecord;
  } catch (error) {
    console.error('Error al cargar asistencia:', error);
    throw new Error('Error al cargar asistencia');
  }
};

// ============================================
// Guardar / actualizar una sesión
// ============================================

export const saveAttendance = async (record: AttendanceRecord): Promise<void> => {
  try {
    const id = buildAttendanceId(
      record.salonId,
      record.profesorId,
      record.areaId,
      record.fecha,
      record.hora
    );
    await setDoc(doc(db, COLLECTION, id), record);
  } catch (error) {
    console.error('Error al guardar asistencia:', error);
    throw new Error('Error al guardar asistencia');
  }
};

// ============================================
// Leer todas las asistencias de un salón en un rango de fechas
// ============================================

export const fetchAttendanceByClassroom = async (
  salonId: string,
  fechaDesde: string,
  fechaHasta: string
): Promise<AttendanceRecord[]> => {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('salonId', '==', salonId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((d) => d.data() as AttendanceRecord)
      .filter((r) => r.fecha >= fechaDesde && r.fecha <= fechaHasta);
  } catch (error) {
    console.error('Error al cargar asistencias del salón:', error);
    throw new Error('Error al cargar asistencias del salón');
  }
};

// ============================================
// Leer asistencias de un profesor en un salón/área/mes
// ============================================

export const fetchAttendanceByProfessorAndClassroom = async (
  salonId: string,
  profesorId: string,
  areaId: string,
  fechaDesde: string,
  fechaHasta: string
): Promise<AttendanceRecord[]> => {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('salonId', '==', salonId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((d) => d.data() as AttendanceRecord)
      .filter((r) =>
        r.profesorId === profesorId &&
        r.areaId === areaId &&
        r.fecha >= fechaDesde &&
        r.fecha <= fechaHasta
      );
  } catch (error) {
    console.error('Error al cargar asistencias:', error);
    throw new Error('Error al cargar asistencias');
  }
};
