import { useState, useCallback, useEffect, useMemo } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../infrastructure/firebase/firebase';
import { ClassRoom } from '../../../../domain/entities/classRoom';
import { fetchClassrooms } from '../../../../infrastructure/classRoom.service';
import { addStudent, updateStudent } from '../../../../infrastructure/student.service';
import {
  StudentFormData,
  StudentFormErrors,
  StudentFormTouched,
  EvaluationMode,
} from '../../../../shared/types/studentManagementTypes';
import { SelectOption } from '../../ui/Select';

/**
 * Initial state for the student form
 */
const INITIAL_FORM_STATE: StudentFormData = {
  id: '',
  document: '',
  name: '',
  lastName: '',
  classRoom: '',
  className: '',
  caracter: '',
  classroomId: '',
  status: 'activo',
};

/**
 * Initial state for touched fields
 */
const INITIAL_TOUCHED_STATE: StudentFormTouched = {
  id: false,
  document: false,
  name: false,
  lastName: false,
  classRoom: false,
  className: false,
  caracter: false,
  status: false,
};

/**
 * Configuration options for select fields
 */
export const FORM_SELECT_OPTIONS = {
  document: [
    { value: 'RC', label: 'Registro Civil' },
    { value: 'TI', label: 'Tarjeta de Identidad' },
  ] as SelectOption[],
  classRoom: [
    { value: 'Preescolar', label: 'Preescolar' },
    { value: 'Primaria', label: 'Primaria' },
    { value: 'Básica Secundaria', label: 'Básica Secundaria' },
  ] as SelectOption[],
  caracter: [
    { value: 'normal', label: 'Normal' },
    { value: 'ajustes', label: 'Con Ajustes' },
  ] as SelectOption[],
};

/**
 * Text field configuration
 */
export const TEXT_FIELD_CONFIG = [
  { name: 'id' as const, label: 'Número de Identificación', placeholder: 'Ej: 1234567890', type: 'text' },
  { name: 'name' as const, label: 'Nombres', placeholder: 'Nombres completos', type: 'text' },
  { name: 'lastName' as const, label: 'Apellidos', placeholder: 'Apellidos completos', type: 'text' },
];

/**
 * Validation messages
 */
const VALIDATION_MESSAGES = {
  required: 'Este campo es requerido',
  selectDocument: 'Seleccione un tipo de documento',
  selectLevel: 'Seleccione un nivel académico',
  selectClassroom: 'Seleccione un salón',
  selectEvaluation: 'Seleccione el modo de evaluación',
  invalidId: 'El número de identificación no es válido',
};

/**
 * Validates a single field
 */
const validateField = (name: keyof StudentFormData, value: string): string => {
  const trimmedValue = value.trim();

  switch (name) {
    case 'id':
      if (!trimmedValue) return VALIDATION_MESSAGES.required;
      if (!/^\d+$/.test(trimmedValue)) return VALIDATION_MESSAGES.invalidId;
      return '';

    case 'document':
      if (!trimmedValue) return VALIDATION_MESSAGES.selectDocument;
      return '';

    case 'name':
    case 'lastName':
      if (!trimmedValue) return VALIDATION_MESSAGES.required;
      return '';

    case 'classRoom':
      if (!trimmedValue) return VALIDATION_MESSAGES.selectLevel;
      return '';

    case 'className':
      if (!trimmedValue) return VALIDATION_MESSAGES.selectClassroom;
      return '';

    case 'caracter':
      if (!trimmedValue) return VALIDATION_MESSAGES.selectEvaluation;
      return '';

    default:
      return '';
  }
};

/**
 * Validates the entire form
 */
const validateForm = (form: StudentFormData): StudentFormErrors => {
  const errors: StudentFormErrors = {};
  const fields: (keyof StudentFormData)[] = [
    'id', 'document', 'name', 'lastName', 'classRoom', 'className', 'caracter'
  ];

  fields.forEach((field) => {
    // @ts-ignore - TODO: Add 'status' field to StudentFormData and StudentFormErrors types
    const error = validateField(field, form[field]);
    if (error) {
      // @ts-ignore - TODO: Add 'status' field to StudentFormErrors type
      errors[field] = error;
    }
  });

  return errors;
};

/**
 * Props for useStudentFormV2 hook
 */
export interface UseStudentFormV2Props {
  /** Initial data for editing an existing student */
  initialData?: Partial<StudentFormData>;
  /** Callback when form is submitted successfully */
  onSuccess?: () => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
  /** Mode: 'create' or 'edit' */
  mode?: 'create' | 'edit';
}

/**
 * Return type for useStudentFormV2 hook
 */
export interface UseStudentFormV2Return {
  /** Current form data */
  formData: StudentFormData;
  /** Validation errors */
  errors: StudentFormErrors;
  /** Touched field states */
  touched: StudentFormTouched;
  /** Whether form is being submitted */
  isSubmitting: boolean;
  /** Whether classrooms are loading */
  isLoadingClassrooms: boolean;
  /** All available classrooms */
  classrooms: ClassRoom[];
  /** Filtered classrooms based on selected level */
  filteredClassrooms: SelectOption[];
  /** Whether the form has been modified */
  isDirty: boolean;
  /** Whether the form is valid */
  isValid: boolean;
  /** Handle field change */
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  /** Handle field blur */
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
  /** Handle form submission - returns true if valid */
  handleSubmit: (e: React.FormEvent) => Promise<boolean>;
  /** Validate if document already exists */
  validateDuplicate: () => Promise<{ok: boolean; msg?: string}>;
  /** Submit the form (called from modal after validation) */
  submitForm: () => Promise<void>;
  /** Set a specific field value programmatically */
  setFieldValue: (name: keyof StudentFormData, value: string) => void;
  /** Set evaluation mode specifically */
  setEvaluationMode: (mode: EvaluationMode) => void;
  /** Reset the form to initial state */
  resetForm: () => void;
  /** Set all form data at once */
  setFormData: (data: Partial<StudentFormData>) => void;
}

/**
 * useStudentFormV2
 *
 * An improved hook for managing student form state with better typing,
 * validation, and separation of concerns.
 *
 * @example
 * ```tsx
 * // Create mode
 * const { formData, errors, handleChange, handleSubmit } = useStudentFormV2({
 *   onSuccess: () => closeModal(),
 * });
 *
 * // Edit mode
 * const { formData, errors, handleChange, handleSubmit } = useStudentFormV2({
 *   mode: 'edit',
 *   initialData: existingStudent,
 *   onSuccess: () => refreshList(),
 * });
 * ```
 */
export const useStudentFormV2 = ({
  initialData,
  onSuccess,
  onError,
  mode = 'create',
}: UseStudentFormV2Props = {}): UseStudentFormV2Return => {
  // Form state
  const [formData, setFormDataState] = useState<StudentFormData>(() => ({
    ...INITIAL_FORM_STATE,
    ...initialData,
  }));

  // Validation and UI state
  const [errors, setErrors] = useState<StudentFormErrors>({});
  const [touched, setTouched] = useState<StudentFormTouched>(INITIAL_TOUCHED_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Classrooms state
  const [classrooms, setClassrooms] = useState<ClassRoom[]>([]);
  const [isLoadingClassrooms, setIsLoadingClassrooms] = useState(true);

  // Track if form has been modified
  const [initialFormData] = useState<StudentFormData>(() => ({
    ...INITIAL_FORM_STATE,
    ...initialData,
  }));

  // Load classrooms on mount
  useEffect(() => {
    const loadClassrooms = async () => {
      setIsLoadingClassrooms(true);
      try {
        const loadedClassrooms = await fetchClassrooms();
        setClassrooms(loadedClassrooms);
      } catch (error) {
        console.error('Error loading classrooms:', error);
        onError?.(error instanceof Error ? error : new Error('Error al cargar salones'));
      } finally {
        setIsLoadingClassrooms(false);
      }
    };

    loadClassrooms();
  }, [onError]);

  // Filter classrooms based on selected level
  const filteredClassrooms = useMemo((): SelectOption[] => {
    if (!formData.classRoom) return [];

    // Map nivel values to classRoom values
    const levelMapping: Record<string, string> = {
      'Preescolar': 'preescolar',
      'Primaria': 'primaria',
      'Básica Secundaria': 'secundaria',
    };

    const mappedLevel = levelMapping[formData.classRoom] || formData.classRoom.toLowerCase();

    return classrooms
      .filter((classroom) => classroom.nivel.toLowerCase().trim() === mappedLevel)
      .map((classroom) => ({
        value: classroom.nombreSalon,
        label: classroom.nombreSalon,
      }));
  }, [classrooms, formData.classRoom]);

  // Check if form is dirty (has been modified)
  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  }, [formData, initialFormData]);

  // Check if form is valid
  const isValid = useMemo(() => {
    const validationErrors = validateForm(formData);
    return Object.keys(validationErrors).length === 0;
  }, [formData]);

  // Handle field change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      const fieldName = name as keyof StudentFormData;

      setFormDataState((prev) => {
        const newData = { ...prev, [fieldName]: value };

        // Reset className and classroomId when level changes
        if (fieldName === 'classRoom') {
          newData.className = '';
          newData.classroomId = '';
        }

        // Auto-set classroomId when className is selected
        if (fieldName === 'className') {
          const selectedClassroom = classrooms.find((c) => c.nombreSalon === value);
          if (selectedClassroom) {
            newData.classroomId = selectedClassroom.id;
          }
        }

        return newData;
      });

      // Clear error for this field
      setErrors((prev) => ({ ...prev, [fieldName]: '' }));
    },
    [classrooms]
  );

  // Handle field blur (validate on blur)
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name } = e.target;
      const fieldName = name as keyof StudentFormData;

      // Mark field as touched
      setTouched((prev) => ({ ...prev, [fieldName]: true }));

      // Validate field
      // @ts-ignore - TODO: Add 'status' field to StudentFormData type
      const error = validateField(fieldName, formData[fieldName]);
      setErrors((prev) => ({ ...prev, [fieldName]: error }));
    },
    [formData]
  );

  // Set a specific field value
  const setFieldValue = useCallback(
    (name: keyof StudentFormData, value: string) => {
      setFormDataState((prev) => {
        const newData = { ...prev, [name]: value };

        // Auto-set classroomId when className is set
        if (name === 'className') {
          const selectedClassroom = classrooms.find((c) => c.nombreSalon === value);
          if (selectedClassroom) {
            newData.classroomId = selectedClassroom.id;
          }
        }

        return newData;
      });
    },
    [classrooms]
  );

  // Set evaluation mode
  const setEvaluationMode = useCallback((evalMode: EvaluationMode) => {
    setFormDataState((prev) => ({ ...prev, caracter: evalMode }));
  }, []);

  // Set all form data at once
  const setFormData = useCallback((data: Partial<StudentFormData>) => {
    setFormDataState((prev) => ({ ...prev, ...data }));
  }, []);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormDataState({ ...INITIAL_FORM_STATE, ...initialData });
    setErrors({});
    setTouched(INITIAL_TOUCHED_STATE);
  }, [initialData]);

  // Validate if document already exists
  const validateDuplicate = useCallback(async (): Promise<{ok: boolean; msg?: string}> => {
    const numeroDoc = formData.id.trim();
    if (!numeroDoc) {
      return { ok: false, msg: "Número de identificación es obligatorio." };
    }

    try {
      // Check if a student with this ID already exists in Firestore
      // The document ID in Firestore is the student's identification number
      const docRef = doc(db, "student", numeroDoc);
      const docSnap = await getDoc(docRef);

      console.log('🔍 Validando duplicado para ID:', numeroDoc);
      console.log('📊 Existe en Firestore:', docSnap.exists());

      if (docSnap.exists()) {
        const studentData = docSnap.data();
        console.log('📄 Estudiante encontrado:', studentData);
        return {
          ok: false,
          msg: `Ya existe un estudiante registrado con el número de identificación ${numeroDoc}. Estudiante: ${studentData.name} ${studentData.lastName} - ${studentData.className}`
        };
      }
      return { ok: true };
    } catch (error) {
      console.error("❌ Error al validar documento:", error);
      return {
        ok: false,
        msg: "Error al verificar el número de identificación. Intenta nuevamente."
      };
    }
  }, [formData.id]);

  // Submit the form (called from modal after validation)
  const submitForm = useCallback(async () => {
    setIsSubmitting(true);

    try {
      if (mode === 'edit') {
        await updateStudent(formData.id, {
          document: formData.document,
          name: formData.name,
          lastName: formData.lastName,
          classRoom: formData.classRoom,
          className: formData.className,
          caracter: formData.caracter,
          classroomId: formData.classroomId,
          status: formData.status || 'activo',
        });
      } else {
        await addStudent({
          id: formData.id,
          document: formData.document,
          name: formData.name,
          lastName: formData.lastName,
          classRoom: formData.classRoom,
          className: formData.className,
          caracter: formData.caracter,
          classroomId: formData.classroomId,
          status: formData.status || 'activo',
        });
      }

      // Reset form only in create mode
      if (mode === 'create') {
        resetForm();
      }

      onSuccess?.();
    } catch (error) {
      console.error('Error submitting student form:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setErrors((prev) => ({ ...prev, general: errorMessage }));
      onError?.(error instanceof Error ? error : new Error(errorMessage));
      throw error; // Re-throw to be handled by modal
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, mode, resetForm, onSuccess, onError]);

  // Handle form submission (validates and returns true if valid)
  const handleSubmit = useCallback(
    async (e: React.FormEvent): Promise<boolean> => {
      e.preventDefault();

      // Validate all fields
      const validationErrors = validateForm(formData);

      // Mark all fields as touched
      setTouched({
        id: true,
        document: true,
        name: true,
        lastName: true,
        classRoom: true,
        className: true,
        caracter: true,
        status: true,
      });

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return false;
      }

      // Verify classroom selection
      if (!formData.classroomId) {
        const selectedClassroom = classrooms.find((c) => c.nombreSalon === formData.className);
        if (!selectedClassroom) {
          setErrors((prev) => ({
            ...prev,
            className: 'Salón no válido',
            general: 'No se pudo determinar el salón',
          }));
          return false;
        }
        formData.classroomId = selectedClassroom.id;
      }

      // Clear any previous errors
      setErrors({});

      // Form is valid
      return true;
    },
    [formData, classrooms]
  );

  return {
    formData,
    errors,
    touched,
    isSubmitting,
    isLoadingClassrooms,
    classrooms,
    filteredClassrooms,
    isDirty,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    validateDuplicate,
    submitForm,
    setFieldValue,
    setEvaluationMode,
    resetForm,
    setFormData,
  };
};

export default useStudentFormV2;
