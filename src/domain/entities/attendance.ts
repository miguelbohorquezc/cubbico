/**
 * @fileoverview Entidades del sistema de asistencias
 * @module domain/entities/attendance
 */

// ============================================
// Tipos de estado de asistencia
// ============================================

export type AttendanceStatus = 'present' | 'justified' | 'unjustified';

// ============================================
// Registro individual de un estudiante
// ============================================

export interface StudentAttendance {
  status: AttendanceStatus;
  motivo?: string;      // obligatorio si status = unjustified
  conExcusa?: boolean;  // relevante cuando status = justified
}

// ============================================
// Documento de asistencia (una clase-sesión)
// ============================================

export interface AttendanceRecord {
  salonId: string;
  profesorId: string;
  areaId: string;
  fecha: string;           // ISO "2025-01-30"
  hora: string;            // ej "7:30"
  año: string;
  estudiantes: Record<string, StudentAttendance>;
}

// ============================================
// ID canónico del documento
// ============================================

export function buildAttendanceId(
  salonId: string,
  profesorId: string,
  areaId: string,
  fecha: string,
  hora: string
): string {
  return `${salonId}_${profesorId}_${areaId}_${fecha}_${hora}`;
}

// ============================================
// Utilidades de dominio
// ============================================

/** Ciclo de estados al hacer clic: present → unjustified → justified → present */
export function cycleAttendanceStatus(current: AttendanceStatus): AttendanceStatus {
  const cycle: Record<AttendanceStatus, AttendanceStatus> = {
    present: 'unjustified',
    unjustified: 'justified',
    justified: 'present',
  };
  return cycle[current];
}

/** Resumen de asistencia para un array de registros (por salón) */
export interface AttendanceSummary {
  totalPresent: number;
  totalJustified: number;
  totalUnjustified: number;
  totalDays: number;
}

export function computeAttendanceSummary(
  records: AttendanceRecord[],
  studentId: string
): AttendanceSummary {
  let totalPresent = 0;
  let totalJustified = 0;
  let totalUnjustified = 0;

  for (const record of records) {
    const entry = record.estudiantes[studentId];
    if (!entry) continue;

    switch (entry.status) {
      case 'present':
        totalPresent++;
        break;
      case 'justified':
        totalJustified++;
        break;
      case 'unjustified':
        totalUnjustified++;
        break;
    }
  }

  return {
    totalPresent,
    totalJustified,
    totalUnjustified,
    totalDays: totalPresent + totalJustified + totalUnjustified,
  };
}
