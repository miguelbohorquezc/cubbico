import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { ClassRoom } from '../../../../domain/entities/classRoom';
import { studentInfo } from '../../../../domain/entities/studentInfo';
import { fetchClassrooms } from '../../../../infrastructure/classRoom.service';
import { fetchStudentsByClassroom } from '../../../../infrastructure/student.service';
import {
  promoteStudentsBatch,
  getNextClassroomSuggestion,
  validatePromotionData,
} from '../../../../infrastructure/promotion.service';
import {
  StudentPromotionData,
  PromotionConfig,
  PromotionStatus,
  EvaluationMode,
  PromotionSummary,
  PromotionResult,
  PromotionFilters,
} from '../../../../shared/types/studentManagementTypes';

/**
 * Props for usePromotion hook
 */
export interface UsePromotionProps {
  /** Source classroom ID */
  sourceClassroomId: string;
  /** Source classroom name */
  sourceClassName: string;
  /** Source level (Preescolar, Primaria, Básica Secundaria) */
  sourceLevel: string;
  /** Current academic year */
  currentYear?: string;
  /** Callback when promotion is completed */
  onComplete?: (result: PromotionResult) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

/**
 * Return type for usePromotion hook
 */
export interface UsePromotionReturn {
  /** List of students with promotion data */
  students: StudentPromotionData[];
  /** Whether students are loading */
  isLoading: boolean;
  /** Whether promotion is being executed */
  isExecuting: boolean;
  /** Current filters */
  filters: PromotionFilters;
  /** Filtered students based on current filters */
  filteredStudents: StudentPromotionData[];
  /** Promotion summary */
  summary: PromotionSummary;
  /** Available classrooms */
  classrooms: ClassRoom[];
  /** Suggested destination classroom */
  suggestedDestination: ClassRoom | null;
  /** Selected destination classroom ID */
  destinationClassroomId: string;
  /** Selected destination classroom name */
  destinationClassName: string;
  /** Validation issues */
  validationIssues: string[];
  /** Whether promotion data is valid */
  isValid: boolean;
  /** Set promotion status for a student */
  setStudentStatus: (studentId: string, status: PromotionStatus) => void;
  /** Set evaluation mode for a student */
  setStudentEvaluationMode: (studentId: string, mode: EvaluationMode) => void;
  /** Toggle student selection */
  toggleStudentSelection: (studentId: string) => void;
  /** Select all students */
  selectAll: () => void;
  /** Deselect all students */
  deselectAll: () => void;
  /** Set status for all selected students */
  setSelectedStudentsStatus: (status: PromotionStatus) => void;
  /** Set evaluation mode for all selected students */
  setSelectedStudentsEvaluationMode: (mode: EvaluationMode) => void;
  /** Set destination classroom */
  setDestination: (classroomId: string, className: string) => void;
  /** Update filters */
  setFilters: (filters: Partial<PromotionFilters>) => void;
  /** Add a new student to the promotion list */
  addNewStudent: (student: studentInfo) => void;
  /** Remove a student from the list */
  removeStudent: (studentId: string) => void;
  /** Execute the promotion */
  executePromotion: () => Promise<PromotionResult>;
  /** Refresh students from server */
  refreshStudents: () => Promise<void>;
}

/**
 * Get previous academic year (year that's ending)
 * Promotions happen at start of calendar year for the previous school year
 */
const getPreviousYear = (): string => {
  return (new Date().getFullYear() - 1).toString();
};

/**
 * Get current academic year (year that's starting)
 */
const getCurrentYear = (): string => {
  return new Date().getFullYear().toString();
};

/**
 * Convert studentInfo to StudentPromotionData
 */
const toPromotionData = (
  student: studentInfo,
  destinationClassroomId?: string,
  destinationClassName?: string
): StudentPromotionData => ({
  ...student,
  promotionStatus: 'promover',
  nextYearEvaluationMode: (student.caracter as EvaluationMode) || 'normal',
  destinationClassroomId,
  destinationClassName,
  isSelected: false,
});

/**
 * usePromotion
 *
 * Hook for managing student promotion workflow including:
 * - Loading students from a classroom
 * - Managing promotion status and evaluation modes
 * - Batch selection and operations
 * - Executing the promotion
 *
 * @example
 * ```tsx
 * const {
 *   students,
 *   summary,
 *   setStudentStatus,
 *   executePromotion
 * } = usePromotion({
 *   sourceClassroomId: 'classroom-1',
 *   sourceClassName: 'Primero',
 *   sourceLevel: 'Primaria',
 *   onComplete: (result) => console.log('Done!', result)
 * });
 * ```
 */
export const usePromotion = ({
  sourceClassroomId,
  sourceClassName,
  sourceLevel,
  currentYear = getPreviousYear(),
  onComplete,
  onError,
}: UsePromotionProps): UsePromotionReturn => {
  // State
  const [students, setStudents] = useState<StudentPromotionData[]>([]);
  const [classrooms, setClassrooms] = useState<ClassRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [destinationClassroomId, setDestinationClassroomId] = useState('');
  const [destinationClassName, setDestinationClassName] = useState('');
  const [filters, setFiltersState] = useState<PromotionFilters>({
    status: 'all',
    evaluationMode: 'all',
    searchTerm: '',
  });

  // Use refs for callbacks to avoid useEffect re-runs
  const onErrorRef = useRef(onError);
  const onCompleteRef = useRef(onComplete);

  // Keep refs updated
  useEffect(() => {
    onErrorRef.current = onError;
    onCompleteRef.current = onComplete;
  }, [onError, onComplete]);

  // Load classrooms and students on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load classrooms and students in parallel
        const [loadedClassrooms, loadedStudents] = await Promise.all([
          fetchClassrooms(),
          fetchStudentsByClassroom(sourceClassroomId),
        ]);

        setClassrooms(loadedClassrooms);

        // Get suggested destination
        const suggestion = getNextClassroomSuggestion(sourceClassName, loadedClassrooms);

        if (suggestion) {
          setDestinationClassroomId(suggestion.id);
          setDestinationClassName(suggestion.nombreSalon);
        }

        // Convert students to promotion data
        const promotionData = loadedStudents.map((s) =>
          toPromotionData(
            s as studentInfo,
            suggestion?.id,
            suggestion?.nombreSalon
          )
        );

        setStudents(promotionData);
      } catch (error) {
        console.error('Error loading promotion data:', error);
        onErrorRef.current?.(error instanceof Error ? error : new Error('Error al cargar datos'));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [sourceClassroomId, sourceClassName]);

  // Suggested destination classroom
  const suggestedDestination = useMemo(() => {
    return getNextClassroomSuggestion(sourceClassName, classrooms);
  }, [sourceClassName, classrooms]);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Filter by status
      if (filters.status !== 'all' && student.promotionStatus !== filters.status) {
        return false;
      }

      // Filter by evaluation mode
      if (
        filters.evaluationMode !== 'all' &&
        student.nextYearEvaluationMode !== filters.evaluationMode
      ) {
        return false;
      }

      // Filter by search term
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const fullName = `${student.name} ${student.lastName}`.toLowerCase();
        const id = student.id.toLowerCase();

        if (!fullName.includes(searchLower) && !id.includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }, [students, filters]);

  // Promotion summary
  const summary = useMemo((): PromotionSummary => {
    const toPromote = students.filter((s) => s.promotionStatus === 'promover').length;
    const toRetain = students.filter((s) => s.promotionStatus === 'no_promover').length;
    const withdrawn = students.filter((s) => s.promotionStatus === 'retirado').length;
    const newStudents = students.filter((s) => s.promotionStatus === 'nuevo').length;
    const normalEval = students.filter((s) => s.nextYearEvaluationMode === 'normal').length;
    const adjustedEval = students.filter((s) => s.nextYearEvaluationMode === 'ajustes').length;

    return {
      totalStudents: students.length,
      toPromote,
      toRetain,
      withdrawn,
      newStudents,
      normalEvaluation: normalEval,
      adjustedEvaluation: adjustedEval,
    };
  }, [students]);

  // Validation
  const validationResult = useMemo(() => {
    return validatePromotionData(students);
  }, [students]);

  // Set student status
  const setStudentStatus = useCallback((studentId: string, status: PromotionStatus) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId ? { ...s, promotionStatus: status } : s
      )
    );
  }, []);

  // Set student evaluation mode
  const setStudentEvaluationMode = useCallback((studentId: string, mode: EvaluationMode) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId ? { ...s, nextYearEvaluationMode: mode } : s
      )
    );
  }, []);

  // Toggle student selection
  const toggleStudentSelection = useCallback((studentId: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId ? { ...s, isSelected: !s.isSelected } : s
      )
    );
  }, []);

  // Select all
  const selectAll = useCallback(() => {
    setStudents((prev) => prev.map((s) => ({ ...s, isSelected: true })));
  }, []);

  // Deselect all
  const deselectAll = useCallback(() => {
    setStudents((prev) => prev.map((s) => ({ ...s, isSelected: false })));
  }, []);

  // Set status for selected students
  const setSelectedStudentsStatus = useCallback((status: PromotionStatus) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.isSelected ? { ...s, promotionStatus: status } : s
      )
    );
  }, []);

  // Set evaluation mode for selected students
  const setSelectedStudentsEvaluationMode = useCallback((mode: EvaluationMode) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.isSelected ? { ...s, nextYearEvaluationMode: mode } : s
      )
    );
  }, []);

  // Set destination
  const setDestination = useCallback((classroomId: string, className: string) => {
    setDestinationClassroomId(classroomId);
    setDestinationClassName(className);

    // Update all students marked for promotion
    setStudents((prev) =>
      prev.map((s) =>
        s.promotionStatus === 'promover'
          ? { ...s, destinationClassroomId: classroomId, destinationClassName: className }
          : s
      )
    );
  }, []);

  // Update filters
  const setFilters = useCallback((newFilters: Partial<PromotionFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Add new student
  const addNewStudent = useCallback(
    (student: studentInfo) => {
      const promotionData = toPromotionData(
        student,
        destinationClassroomId,
        destinationClassName
      );
      promotionData.promotionStatus = 'nuevo';

      setStudents((prev) => [...prev, promotionData]);
    },
    [destinationClassroomId, destinationClassName]
  );

  // Remove student
  const removeStudent = useCallback((studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
  }, []);

  // Refresh students
  const refreshStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const loadedStudents = await fetchStudentsByClassroom(sourceClassroomId);

      const promotionData = loadedStudents.map((s) =>
        toPromotionData(
          s as studentInfo,
          destinationClassroomId,
          destinationClassName
        )
      );

      setStudents(promotionData);
    } catch (error) {
      console.error('Error refreshing students:', error);
      onErrorRef.current?.(error instanceof Error ? error : new Error('Error al refrescar'));
    } finally {
      setIsLoading(false);
    }
  }, [sourceClassroomId, destinationClassroomId, destinationClassName]);

  // Execute promotion
  const executePromotion = useCallback(async (): Promise<PromotionResult> => {
    // Validate before execution
    const validation = validatePromotionData(students);
    if (!validation.valid) {
      const error = new Error(validation.issues.join(', '));
      onErrorRef.current?.(error);
      return {
        success: false,
        processed: 0,
        errors: 1,
        errorMessages: validation.issues,
      };
    }

    setIsExecuting(true);

    try {
      const config: PromotionConfig = {
        sourceClassroomId,
        sourceClassName,
        sourceLevel,
        currentYear,
        targetYear: getCurrentYear(),
      };

      const result = await promoteStudentsBatch({
        config,
        students,
        executedBy: 'current-user', // TODO: Get from auth context
        executedAt: new Date().toISOString(),
      });

      onCompleteRef.current?.(result);
      return result;
    } catch (error) {
      console.error('Error executing promotion:', error);
      const err = error instanceof Error ? error : new Error('Error en promoción');
      onErrorRef.current?.(err);

      return {
        success: false,
        processed: 0,
        errors: 1,
        errorMessages: [err.message],
      };
    } finally {
      setIsExecuting(false);
    }
  }, [
    students,
    sourceClassroomId,
    sourceClassName,
    sourceLevel,
    currentYear,
  ]);

  return {
    students,
    isLoading,
    isExecuting,
    filters,
    filteredStudents,
    summary,
    classrooms,
    suggestedDestination,
    destinationClassroomId,
    destinationClassName,
    validationIssues: validationResult.issues,
    isValid: validationResult.valid,
    setStudentStatus,
    setStudentEvaluationMode,
    toggleStudentSelection,
    selectAll,
    deselectAll,
    setSelectedStudentsStatus,
    setSelectedStudentsEvaluationMode,
    setDestination,
    setFilters,
    addNewStudent,
    removeStudent,
    executePromotion,
    refreshStudents,
  };
};

export default usePromotion;
