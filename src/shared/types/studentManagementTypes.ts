/**
 * Tipos para el sistema de gestión de estudiantes mejorado
 * Incluye tipos para promoción, modos de evaluación y configuración
 */

import { studentInfo, StudentStatus } from '../../domain/entities/studentInfo';

// ============================================
// TIPOS BASE
// ============================================

/**
 * Modo de evaluación del estudiante
 * - normal: Evaluación estándar con logros del salón
 * - ajustes: Evaluación con logros adaptados/personalizados
 */
export type EvaluationMode = 'normal' | 'ajustes';

/**
 * Estado de promoción del estudiante
 * - promover: Será promovido al siguiente salón
 * - no_promover: Permanece en el mismo salón (repite)
 * - retirado: El estudiante se retiró de la institución
 * - nuevo: Estudiante nuevo agregado durante el proceso
 */
export type PromotionStatus = 'promover' | 'no_promover' | 'retirado' | 'nuevo';

/**
 * Tipo de documento de identidad
 */
export type DocumentType = 'RC' | 'TI';

/**
 * Niveles académicos disponibles
 */
export type AcademicLevel = 'Preescolar' | 'Primaria' | 'Básica Secundaria';

// ============================================
// INTERFACES DE FORMULARIO
// ============================================

/**
 * Datos del formulario de estudiante (crear/editar)
 */
export interface StudentFormData {
  /** Número de documento de identidad */
  id: string;
  /** Tipo de documento (RC, TI) */
  document: DocumentType | string;
  /** Nombres completos del estudiante */
  name: string;
  /** Apellidos completos del estudiante */
  lastName: string;
  /** Nivel académico (Preescolar, Primaria, Básica Secundaria) */
  classRoom: AcademicLevel | string;
  /** Nombre del salón específico (ej: "Primero A") */
  className: string;
  /** Modo de evaluación */
  caracter: EvaluationMode | string;
  /** ID del salón en Firestore */
  classroomId: string;
  /** Estado del estudiante */
  status?: StudentStatus;
}

/**
 * Errores de validación del formulario de estudiante
 */
export interface StudentFormErrors {
  id?: string;
  document?: string;
  name?: string;
  lastName?: string;
  classRoom?: string;
  className?: string;
  caracter?: string;
  classroomId?: string;
  general?: string;
}

/**
 * Estado de campos tocados en el formulario
 */
export interface StudentFormTouched {
  id: boolean;
  document: boolean;
  name: boolean;
  lastName: boolean;
  classRoom: boolean;
  className: boolean;
  caracter: boolean;
  status: boolean;
}

// ============================================
// INTERFACES DE PROMOCIÓN
// ============================================

/**
 * Datos de un estudiante en el contexto de promoción
 * Extiende studentInfo con campos adicionales para el proceso
 */
export interface StudentPromotionData extends studentInfo {
  /** Estado de promoción asignado */
  promotionStatus: PromotionStatus;
  /** Modo de evaluación para el próximo año */
  nextYearEvaluationMode: EvaluationMode;
  /** ID del salón destino (si es promovido) */
  destinationClassroomId?: string;
  /** Nombre del salón destino */
  destinationClassName?: string;
  /** Indica si fue seleccionado en la UI */
  isSelected: boolean;
  /** Observaciones adicionales */
  observations?: string;
}

/**
 * Registro histórico de una promoción
 */
export interface PromotionRecord {
  /** ID del salón de origen */
  fromClassroomId: string;
  /** Nombre del salón de origen */
  fromClassName: string;
  /** ID del salón de destino */
  toClassroomId: string;
  /** Nombre del salón de destino */
  toClassName: string;
  /** Año académico de la promoción */
  year: string;
  /** Fecha de la promoción (ISO string) */
  date: string;
  /** Modo de evaluación asignado */
  evaluationMode: EvaluationMode;
}

/**
 * Configuración del modal de promoción
 */
export interface PromotionConfig {
  /** ID del salón de origen */
  sourceClassroomId: string;
  /** Nombre del salón de origen */
  sourceClassName: string;
  /** Nivel académico del salón */
  sourceLevel: AcademicLevel | string;
  /** Año académico actual */
  currentYear: string;
  /** Año académico destino */
  targetYear: string;
}

/**
 * Resumen de la promoción antes de ejecutar
 */
export interface PromotionSummary {
  /** Total de estudiantes en el proceso */
  totalStudents: number;
  /** Cantidad a promover */
  toPromote: number;
  /** Cantidad que no promociona (repite) */
  toRetain: number;
  /** Cantidad de retirados */
  withdrawn: number;
  /** Cantidad de nuevos agregados */
  newStudents: number;
  /** Cantidad con evaluación normal */
  normalEvaluation: number;
  /** Cantidad con evaluación con ajustes */
  adjustedEvaluation: number;
}

/**
 * Payload para ejecutar la promoción masiva
 */
export interface ExecutePromotionPayload {
  /** Configuración de la promoción */
  config: PromotionConfig;
  /** Lista de estudiantes con sus datos de promoción */
  students: StudentPromotionData[];
  /** ID del usuario que ejecuta la promoción */
  executedBy: string;
  /** Timestamp de ejecución */
  executedAt: string;
}

/**
 * Resultado de la ejecución de promoción
 */
export interface PromotionResult {
  /** Indica si fue exitoso */
  success: boolean;
  /** Cantidad de estudiantes procesados */
  processed: number;
  /** Cantidad de errores */
  errors: number;
  /** Mensajes de error si los hay */
  errorMessages?: string[];
  /** ID del registro de promoción en Firestore */
  promotionLogId?: string;
}

// ============================================
// INTERFACES DE UI/COMPONENTES
// ============================================

/**
 * Props para el componente StudentPromotionRow
 */
export interface StudentPromotionRowProps {
  /** Datos del estudiante */
  student: StudentPromotionData;
  /** Callback al cambiar estado de promoción */
  onStatusChange: (studentId: string, status: PromotionStatus) => void;
  /** Callback al cambiar modo de evaluación */
  onEvaluationModeChange: (studentId: string, mode: EvaluationMode) => void;
  /** Callback al seleccionar/deseleccionar */
  onSelectionChange: (studentId: string, selected: boolean) => void;
  /** Indica si el row está deshabilitado */
  disabled?: boolean;
}

/**
 * Props para el modal de promoción
 */
export interface PromotionModalProps {
  /** Indica si el modal está abierto */
  isOpen: boolean;
  /** Callback para cerrar el modal */
  onClose: () => void;
  /** Configuración inicial de la promoción */
  config: PromotionConfig;
  /** Callback al completar la promoción */
  onPromotionComplete: (result: PromotionResult) => void;
}

/**
 * Props para el selector de salón destino
 */
export interface ClassroomDestinationSelectorProps {
  /** Nivel académico actual */
  currentLevel: AcademicLevel | string;
  /** Nombre del salón actual */
  currentClassName: string;
  /** Valor seleccionado */
  value: string;
  /** Callback al cambiar selección */
  onChange: (classroomId: string, className: string) => void;
  /** Indica si está deshabilitado */
  disabled?: boolean;
}

/**
 * Filtros para la lista de estudiantes en promoción
 */
export interface PromotionFilters {
  /** Filtrar por estado de promoción */
  status: PromotionStatus | 'all';
  /** Filtrar por modo de evaluación */
  evaluationMode: EvaluationMode | 'all';
  /** Búsqueda por nombre/apellido/ID */
  searchTerm: string;
}

// ============================================
// TIPOS PARA SERVICIOS
// ============================================

/**
 * Parámetros para actualizar el salón de un estudiante
 */
export interface UpdateStudentClassroomParams {
  studentId: string;
  newClassroomId: string;
  newClassName: string;
  newLevel?: AcademicLevel | string;
}

/**
 * Parámetros para actualizar el modo de evaluación
 */
export interface UpdateEvaluationModeParams {
  studentId: string;
  evaluationMode: EvaluationMode;
}

/**
 * Opciones para el mapeo de salones (promoción automática)
 */
export interface ClassroomPromotionMap {
  [currentClassName: string]: {
    nextClassName: string;
    nextLevel?: AcademicLevel;
  };
}

// ============================================
// CONSTANTES
// ============================================

/**
 * Mapa de promoción por defecto
 * Define a qué salón se promueve desde cada salón
 */
export const DEFAULT_PROMOTION_MAP: ClassroomPromotionMap = {
  // Preescolar
  'Nursery A': { nextClassName: 'Nursery B' },
  'Nursery B': { nextClassName: 'Prekinder A' },
  'Prekinder A': { nextClassName: 'Prekinder B' },
  'Prekinder B': { nextClassName: 'Kinder A' },
  'Kinder A': { nextClassName: 'Kinder B' },
  'Kinder B': { nextClassName: 'Transition A' },
  'Transition A': { nextClassName: 'Transition B' },
  'Transition B': { nextClassName: 'Primero', nextLevel: 'Primaria' },
  // Primaria
  'Primero': { nextClassName: 'Segundo' },
  'Segundo': { nextClassName: 'Tercero' },
  'Tercero': { nextClassName: 'Cuarto' },
  'Cuarto': { nextClassName: 'Quinto' },
  'Quinto': { nextClassName: 'Sexto', nextLevel: 'Básica Secundaria' },
  // Secundaria
  'Sexto': { nextClassName: 'Séptimo' },
  'Séptimo': { nextClassName: 'Octavo' },
  'Octavo': { nextClassName: 'Noveno' },
  'Noveno': { nextClassName: 'Décimo' },
  'Décimo': { nextClassName: 'Undécimo' },
  'Undécimo': { nextClassName: 'Graduado' },
};

/**
 * Estados de promoción con sus etiquetas para UI
 */
export const PROMOTION_STATUS_LABELS: Record<PromotionStatus, string> = {
  promover: 'Promover',
  no_promover: 'No Promover',
  retirado: 'Retirado',
  nuevo: 'Nuevo',
};

/**
 * Colores para badges de estado de promoción (Tailwind)
 */
export const PROMOTION_STATUS_COLORS: Record<PromotionStatus, string> = {
  promover: 'bg-green-100 text-green-800 border-green-200',
  no_promover: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  retirado: 'bg-red-100 text-red-800 border-red-200',
  nuevo: 'bg-blue-100 text-blue-800 border-blue-200',
};

/**
 * Modos de evaluación con sus etiquetas para UI
 */
export const EVALUATION_MODE_LABELS: Record<EvaluationMode, string> = {
  normal: 'Normal',
  ajustes: 'Con Ajustes',
};

/**
 * Colores para badges de modo de evaluación (Tailwind)
 */
export const EVALUATION_MODE_COLORS: Record<EvaluationMode, string> = {
  normal: 'bg-slate-100 text-slate-700 border-slate-200',
  ajustes: 'bg-amber-100 text-amber-800 border-amber-200',
};

/**
 * Etiquetas de estado de estudiante para UI
 */
export const STUDENT_STATUS_LABELS: Record<StudentStatus, string> = {
  activo: 'Activo',
  retirado: 'Retirado',
  expulsado: 'Expulsado',
  inactivo: 'Inactivo',
  suspendido: 'Suspendido',
  graduado: 'Graduado',
  transferido: 'Transferido',
};

/**
 * Colores para badges de estado (Tailwind)
 */
export const STUDENT_STATUS_COLORS: Record<StudentStatus, string> = {
  activo: 'bg-green-100 text-green-800 border-green-200',
  retirado: 'bg-gray-100 text-gray-800 border-gray-200',
  expulsado: 'bg-red-100 text-red-800 border-red-200',
  inactivo: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  suspendido: 'bg-orange-100 text-orange-800 border-orange-200',
  graduado: 'bg-blue-100 text-blue-800 border-blue-200',
  transferido: 'bg-purple-100 text-purple-800 border-purple-200',
};
