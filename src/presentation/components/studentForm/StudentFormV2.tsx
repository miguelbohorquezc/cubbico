import React from 'react';
import { Input, Select, Button } from '../ui';
import {
  useStudentFormV2,
  UseStudentFormV2Props,
  FORM_SELECT_OPTIONS,
  TEXT_FIELD_CONFIG,
} from './hooks/useStudentFormV2';
import { StudentFormData } from '../../../shared/types/studentManagementTypes';

/**
 * Props for StudentFormV2 component
 */
export interface StudentFormV2Props {
  /** Initial data for editing (optional) */
  initialData?: Partial<StudentFormData>;
  /** Form mode: create or edit */
  mode?: 'create' | 'edit';
  /** Callback when form is submitted successfully */
  onSuccess?: () => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
  /** Callback to cancel/close the form */
  onCancel?: () => void;
  /** Whether to show cancel button */
  showCancelButton?: boolean;
  /** Custom submit button text */
  submitButtonText?: string;
  /** Whether to show the form header (hide when inside a modal) */
  showHeader?: boolean;
}

/**
 * StudentFormV2
 *
 * A redesigned student registration/edit form using Tailwind CSS
 * and the institutional design system components.
 *
 * @example
 * ```tsx
 * // Create mode
 * <StudentFormV2
 *   onSuccess={() => closeModal()}
 *   onCancel={() => closeModal()}
 * />
 *
 * // Edit mode
 * <StudentFormV2
 *   mode="edit"
 *   initialData={studentToEdit}
 *   onSuccess={() => refreshList()}
 * />
 * ```
 */
const StudentFormV2: React.FC<StudentFormV2Props> = ({
  initialData,
  mode = 'create',
  onSuccess,
  onError,
  onCancel,
  showCancelButton = true,
  submitButtonText,
  showHeader = false, // Default to false since it's usually inside a modal
}) => {
  const {
    formData,
    errors,
    touched,
    isSubmitting,
    isLoadingClassrooms,
    filteredClassrooms,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useStudentFormV2({
    initialData,
    mode,
    onSuccess,
    onError,
  });

  // Determine submit button text
  const buttonText = submitButtonText || (mode === 'edit' ? 'Guardar Cambios' : 'Registrar Estudiante');

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      {/* Form Header - only shown when not inside a modal */}
      {showHeader && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-deep-blue-800">
            {mode === 'edit' ? 'Editar Estudiante' : 'Nuevo Estudiante'}
          </h2>
          <p className="text-sm text-light-gray-500 mt-1">
            {mode === 'edit'
              ? 'Modifique los datos del estudiante'
              : 'Complete los datos para registrar un nuevo estudiante'}
          </p>
        </div>
      )}

      {/* General Error */}
      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors.general}</p>
        </div>
      )}

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Document Type */}
        <Select
          name="document"
          label="Tipo de Documento"
          placeholder="Seleccione tipo de documento"
          options={FORM_SELECT_OPTIONS.document}
          value={formData.document}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.document ? errors.document : undefined}
          required
        />

        {/* Document Number (ID) */}
        <Input
          name="id"
          label="Número de Identificación"
          placeholder="Ej: 1234567890"
          type="text"
          value={formData.id}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.id ? errors.id : undefined}
          required
          disabled={mode === 'edit'}
        />

        {/* First Name */}
        <Input
          name="name"
          label="Nombres"
          placeholder="Nombres completos"
          type="text"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.name ? errors.name : undefined}
          required
        />

        {/* Last Name */}
        <Input
          name="lastName"
          label="Apellidos"
          placeholder="Apellidos completos"
          type="text"
          value={formData.lastName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.lastName ? errors.lastName : undefined}
          required
        />

        {/* Academic Level */}
        <Select
          name="classRoom"
          label="Nivel Académico"
          placeholder="Seleccione nivel académico"
          options={FORM_SELECT_OPTIONS.classRoom}
          value={formData.classRoom}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.classRoom ? errors.classRoom : undefined}
          required
        />

        {/* Classroom (filtered by level) */}
        <Select
          name="className"
          label="Salón"
          placeholder={
            isLoadingClassrooms
              ? 'Cargando salones...'
              : !formData.classRoom
              ? 'Primero seleccione un nivel'
              : filteredClassrooms.length === 0
              ? 'No hay salones disponibles'
              : 'Seleccione un salón'
          }
          options={filteredClassrooms}
          value={formData.className}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.className ? errors.className : undefined}
          required
          disabled={!formData.classRoom || isLoadingClassrooms || filteredClassrooms.length === 0}
        />

        {/* Evaluation Mode - Full width */}
        <div className="md:col-span-2">
          <Select
            name="caracter"
            label="Modo de Evaluación"
            placeholder="Seleccione modo de evaluación"
            options={FORM_SELECT_OPTIONS.caracter}
            value={formData.caracter}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.caracter ? errors.caracter : undefined}
            required
          />
          <p className="mt-1.5 text-xs text-light-gray-500">
            <span className="font-medium">Normal:</span> Evaluación estándar con logros del salón.{' '}
            <span className="font-medium">Con Ajustes:</span> Evaluación con logros adaptados.
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8 pt-6 border-t border-light-gray-200">
        {showCancelButton && onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        )}

        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Guardando...' : buttonText}
        </Button>
      </div>
    </form>
  );
};

export default StudentFormV2;
