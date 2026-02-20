/**
 * Promotion Service
 *
 * Handles student promotion operations including batch promotions,
 * classroom transfers, and evaluation mode changes.
 */

import {
  collection,
  doc,
  writeBatch,
  serverTimestamp,
  setDoc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase/firebase';
import {
  StudentPromotionData,
  PromotionResult,
  ExecutePromotionPayload,
  UpdateStudentClassroomParams,
  UpdateEvaluationModeParams,
} from '../shared/types/studentManagementTypes';

/**
 * Collection names
 */
const COLLECTIONS = {
  STUDENTS: 'student',
  PROMOTIONS_LOG: 'promotionLogs',
  PROMOTION_HISTORY: 'promotionHistory',
} as const;

/**
 * Updates a single student's classroom assignment
 *
 * @param params - Parameters including studentId, new classroom info
 * @returns Promise<boolean> - Success status
 *
 * @example
 * ```ts
 * await updateStudentClassroom({
 *   studentId: '123456',
 *   newClassroomId: 'classroom-abc',
 *   newClassName: 'Segundo',
 *   newLevel: 'Primaria'
 * });
 * ```
 */
export const updateStudentClassroom = async (
  params: UpdateStudentClassroomParams
): Promise<boolean> => {
  const { studentId, newClassroomId, newClassName, newLevel } = params;

  try {
    const studentRef = doc(db, COLLECTIONS.STUDENTS, studentId);

    const updateData: Record<string, string> = {
      classroomId: newClassroomId,
      className: newClassName,
    };

    if (newLevel) {
      updateData.classRoom = newLevel;
    }

    await setDoc(studentRef, updateData, { merge: true });

    return true;
  } catch (error) {
    console.error('Error updating student classroom:', error);
    throw new Error(
      `Error al actualizar salón del estudiante: ${
        error instanceof Error ? error.message : 'Error desconocido'
      }`
    );
  }
};

/**
 * Updates a student's evaluation mode
 *
 * @param params - Parameters including studentId and evaluation mode
 * @returns Promise<boolean> - Success status
 *
 * @example
 * ```ts
 * await updateStudentEvaluationMode({
 *   studentId: '123456',
 *   evaluationMode: 'ajustes'
 * });
 * ```
 */
export const updateStudentEvaluationMode = async (
  params: UpdateEvaluationModeParams
): Promise<boolean> => {
  const { studentId, evaluationMode } = params;

  try {
    const studentRef = doc(db, COLLECTIONS.STUDENTS, studentId);

    await setDoc(
      studentRef,
      { caracter: evaluationMode },
      { merge: true }
    );

    return true;
  } catch (error) {
    console.error('Error updating evaluation mode:', error);
    throw new Error(
      `Error al actualizar modo de evaluación: ${
        error instanceof Error ? error.message : 'Error desconocido'
      }`
    );
  }
};

/**
 * Promotes multiple students in a batch operation
 *
 * This function handles the complete promotion workflow:
 * 1. Updates each student's classroom and evaluation mode
 * 2. Creates a promotion log record
 * 3. Adds promotion history to each student
 *
 * @param payload - The promotion payload with config and students
 * @returns Promise<PromotionResult> - Result with success status and counts
 *
 * @example
 * ```ts
 * const result = await promoteStudentsBatch({
 *   config: {
 *     sourceClassroomId: 'classroom-1',
 *     sourceClassName: 'Primero',
 *     sourceLevel: 'Primaria',
 *     currentYear: '2025',
 *     targetYear: '2026'
 *   },
 *   students: promotionDataArray,
 *   executedBy: 'user-123',
 *   executedAt: new Date().toISOString()
 * });
 * ```
 */
export const promoteStudentsBatch = async (
  payload: ExecutePromotionPayload
): Promise<PromotionResult> => {
  const { config, students, executedBy, executedAt } = payload;
  const batch = writeBatch(db);

  let processed = 0;
  let errors = 0;
  const errorMessages: string[] = [];

  try {
    // Filter students that should be promoted
    const studentsToPromote = students.filter(
      (s) => s.promotionStatus === 'promover' && s.destinationClassroomId
    );

    // Filter students that should be retained (not promoted)
    const studentsToRetain = students.filter(
      (s) => s.promotionStatus === 'no_promover'
    );

    // Filter withdrawn students
    const withdrawnStudents = students.filter(
      (s) => s.promotionStatus === 'retirado'
    );

    // Process promotions
    for (const student of studentsToPromote) {
      try {
        const studentRef = doc(db, COLLECTIONS.STUDENTS, student.id);

        // Update student data
        batch.set(
          studentRef,
          {
            classroomId: student.destinationClassroomId,
            className: student.destinationClassName,
            caracter: student.nextYearEvaluationMode,
            lastPromotionYear: config.targetYear,
          },
          { merge: true }
        );

        processed++;
      } catch (error) {
        errors++;
        errorMessages.push(
          `Error con estudiante ${student.name} ${student.lastName}: ${
            error instanceof Error ? error.message : 'Error desconocido'
          }`
        );
      }
    }

    // Process retained students (only update evaluation mode if changed)
    for (const student of studentsToRetain) {
      try {
        const studentRef = doc(db, COLLECTIONS.STUDENTS, student.id);

        batch.set(
          studentRef,
          {
            caracter: student.nextYearEvaluationMode,
          },
          { merge: true }
        );

        processed++;
      } catch (error) {
        errors++;
        errorMessages.push(
          `Error con estudiante ${student.name} ${student.lastName}: ${
            error instanceof Error ? error.message : 'Error desconocido'
          }`
        );
      }
    }

    // Mark withdrawn students (optional: could add a status field)
    for (const student of withdrawnStudents) {
      try {
        const studentRef = doc(db, COLLECTIONS.STUDENTS, student.id);

        batch.set(
          studentRef,
          {
            status: 'retirado',
            withdrawnYear: config.currentYear,
          },
          { merge: true }
        );

        processed++;
      } catch (error) {
        errors++;
        errorMessages.push(
          `Error con estudiante retirado ${student.name} ${student.lastName}`
        );
      }
    }

    // Commit all student updates
    await batch.commit();

    // Create promotion log
    const promotionLog = {
      config,
      summary: {
        totalStudents: students.length,
        promoted: studentsToPromote.length,
        retained: studentsToRetain.length,
        withdrawn: withdrawnStudents.length,
        newStudents: students.filter((s) => s.promotionStatus === 'nuevo').length,
      },
      executedBy,
      executedAt,
      createdAt: serverTimestamp(),
    };

    const logRef = await addDoc(
      collection(db, COLLECTIONS.PROMOTIONS_LOG),
      promotionLog
    );

    return {
      success: errors === 0,
      processed,
      errors,
      errorMessages: errorMessages.length > 0 ? errorMessages : undefined,
      promotionLogId: logRef.id,
    };
  } catch (error) {
    console.error('Error in batch promotion:', error);
    return {
      success: false,
      processed,
      errors: errors + 1,
      errorMessages: [
        ...errorMessages,
        `Error general: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      ],
    };
  }
};

/**
 * Gets the promotion history for a specific year
 *
 * @param year - The academic year to query
 * @returns Promise<PromotionLog[]> - Array of promotion logs
 */
export const getPromotionHistory = async (year: string) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.PROMOTIONS_LOG),
      where('config.currentYear', '==', year),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching promotion history:', error);
    throw new Error('Error al obtener historial de promociones');
  }
};

/**
 * Gets the next classroom suggestion based on current classroom
 *
 * @param currentClassName - The current classroom name
 * @param classrooms - Available classrooms
 * @returns The suggested next classroom or null
 */
export const getNextClassroomSuggestion = (
  currentClassName: string,
  classrooms: Array<{ id: string; nombreSalon: string; nivel: string }>
): { id: string; nombreSalon: string; nivel: string } | null => {
  // Mapping of current classroom to next classroom
  const promotionSequence: Record<string, string> = {
    // Preescolar
    'Nursery A': 'Nursery B',
    'Nursery B': 'Prekinder A',
    'Prekinder A': 'Prekinder B',
    'Prekinder B': 'Kinder A',
    'Kinder A': 'Kinder B',
    'Kinder B': 'Transition A',
    'Transition A': 'Transition B',
    'Transition B': 'Primero',
    // Primaria
    'Primero': 'Segundo',
    'Primero A': 'Segundo',
    'Primero B': 'Segundo',
    'Segundo': 'Tercero',
    'Tercero': 'Cuarto',
    'Cuarto': 'Quinto',
    'Quinto': 'Sexto',
    // Secundaria
    'Sexto': 'Séptimo',
    'Séptimo': 'Octavo',
    'Octavo': 'Noveno',
    'Noveno': 'Décimo',
    'Décimo': 'Undécimo',
  };

  const nextClassName = promotionSequence[currentClassName];

  if (!nextClassName) {
    return null;
  }

  // Find the classroom in the available classrooms
  const nextClassroom = classrooms.find(
    (c) => c.nombreSalon.toLowerCase() === nextClassName.toLowerCase()
  );

  return nextClassroom || null;
};

/**
 * Validates promotion data before execution
 *
 * @param students - Array of students to validate
 * @returns Validation result with any issues found
 */
export const validatePromotionData = (
  students: StudentPromotionData[]
): { valid: boolean; issues: string[] } => {
  const issues: string[] = [];

  // Check for students marked to promote without destination
  const missingDestination = students.filter(
    (s) => s.promotionStatus === 'promover' && !s.destinationClassroomId
  );

  if (missingDestination.length > 0) {
    issues.push(
      `${missingDestination.length} estudiante(s) marcado(s) para promover sin salón destino`
    );
  }

  // Check for duplicate student IDs
  const ids = students.map((s) => s.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);

  if (duplicates.length > 0) {
    issues.push(`Estudiantes duplicados encontrados: ${duplicates.join(', ')}`);
  }

  // Check that all students have required fields
  const missingFields = students.filter(
    (s) => !s.id || !s.name || !s.lastName
  );

  if (missingFields.length > 0) {
    issues.push(
      `${missingFields.length} estudiante(s) con datos incompletos`
    );
  }

  return {
    valid: issues.length === 0,
    issues,
  };
};
