import { StudentStatus, StudentPromotionRecord } from '../../domain/entities/studentInfo';

/**
 * Form state for student creation/editing
 */
export interface StudentFormState {
  id: string;
  document: string;
  name: string;
  lastName: string;
  classRoom: string;
  className: string;
  caracter: string;
  classroomId: string;
}

/**
 * Extended student data including promotion fields
 */
export interface StudentWithPromotion extends StudentFormState {
  /** Year of enrollment */
  enrollmentYear?: string;
  /** Last year the student was promoted */
  lastPromotionYear?: string;
  /** Current student status */
  status?: StudentStatus;
  /** Year when student was withdrawn */
  withdrawnYear?: string;
  /** Promotion history records */
  promotionHistory?: StudentPromotionRecord[];
}

/**
 * Generic option for select fields
 */
export interface Option {
  value: string;
  label: string;
}

/**
 * Student list item for display in tables
 */
export interface StudentListItem {
  id: string;
  document: string;
  name: string;
  lastName: string;
  fullName: string;
  classRoom: string;
  className: string;
  caracter: string;
  classroomId?: string;
  status?: StudentStatus;
}