import { EvaluationMode } from '../../shared/types/studentManagementTypes';

/**
 * Student status in the system
 */
export type StudentStatus = 'activo' | 'retirado' | 'graduado' | 'transferido';

/**
 * Record of a student's promotion history
 */
export interface StudentPromotionRecord {
  /** Source classroom ID */
  fromClassroomId: string;
  /** Source classroom name */
  fromClassName: string;
  /** Destination classroom ID */
  toClassroomId: string;
  /** Destination classroom name */
  toClassName: string;
  /** Academic year of promotion */
  year: string;
  /** Date of promotion (ISO string) */
  date: string;
  /** Evaluation mode assigned after promotion */
  evaluationMode: EvaluationMode;
}

/**
 * Core student information entity
 */
export interface studentInfo {
  /** Student's document number (unique identifier) */
  id: string;
  /** Document type (RC, TI) */
  document: string;
  /** First and middle names */
  name: string;
  /** Last names */
  lastName: string;
  /** Academic level (Preescolar, Primaria, Básica Secundaria) */
  classRoom: string;
  /** Classroom name */
  className: string;
  /** Evaluation mode (normal, ajustes) */
  caracter: string;
  /** Classroom ID reference */
  classroomId?: string;

  // ===== Promotion-related fields (optional for backwards compatibility) =====

  /** Year of enrollment */
  enrollmentYear?: string;
  /** Last year the student was promoted */
  lastPromotionYear?: string;
  /** Current student status */
  status?: StudentStatus;
  /** Year when student was withdrawn (if status is 'retirado') */
  withdrawnYear?: string;
  /** Promotion history records */
  promotionHistory?: StudentPromotionRecord[];
}