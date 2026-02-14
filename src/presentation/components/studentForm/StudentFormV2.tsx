import React, { useState } from 'react';
import { Input, Select, Button } from '../ui';
import {
  useStudentFormV2,
  FORM_SELECT_OPTIONS,
} from './hooks/useStudentFormV2';
import { StudentFormData } from '../../../shared/types/studentManagementTypes';
import Toast from '../common/Toast';

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
    validateDuplicate,
    submitForm,
  } = useStudentFormV2({
    initialData,
    mode,
    onSuccess,
    onError,
  });

  // Modal state
  const [modalConfirmOpen, setModalConfirmOpen] = useState(false);
  const [errorDuplicado, setErrorDuplicado] = useState<string | null>(null);

  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // Determine submit button text
  const buttonText = submitButtonText || (mode === 'edit' ? 'Guardar Cambios' : 'Registrar Estudiante');

  // Handle form submission (validates and opens modal)
  const onFormSubmit = async (e: React.FormEvent) => {
    const isValid = await handleSubmit(e);

    // If validation passed, open modal
    if (isValid) {
      setErrorDuplicado(null);
      setModalConfirmOpen(true);
    }
  };

  // Handle modal confirmation
  const handleModalConfirm = async () => {
    // Only validate duplicates in create mode
    if (mode === 'create') {
      const validacion = await validateDuplicate();
      if (!validacion.ok) {
        setErrorDuplicado(validacion.msg || "Error de validación");
        return;
      }
    }

    // If validation passes, submit the form
    try {
      await submitForm();
      setModalConfirmOpen(false);
      setErrorDuplicado(null);

      // Show success toast
      showToast(
        mode === 'edit'
          ? `Estudiante ${formData.name} ${formData.lastName} actualizado exitosamente`
          : `Estudiante ${formData.name} ${formData.lastName} registrado en ${formData.className}`,
        'success'
      );
    } catch (error) {
      console.error('Error submitting:', error);
      showToast('Error al guardar el estudiante. Por favor, intenta de nuevo.', 'error');
    }
  };

  return (
    <>
      <form onSubmit={onFormSubmit} className="w-full max-w-2xl mx-auto">
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

        {/* Estado del Estudiante - Solo en modo edición */}
        {mode === 'edit' && (
          <div className="md:col-span-2">
            <Select
              name="status"
              label="Estado del Estudiante"
              placeholder="Seleccione estado"
              options={[
                { value: 'activo', label: 'Activo' },
                { value: 'retirado', label: 'Retirado' },
                { value: 'expulsado', label: 'Expulsado' },
                { value: 'inactivo', label: 'Inactivo' },
                { value: 'suspendido', label: 'Suspendido' },
                { value: 'graduado', label: 'Graduado' },
                { value: 'transferido', label: 'Transferido' },
              ]}
              value={formData.status || 'activo'}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.status ? errors.status : undefined}
            />
            <p className="mt-1.5 text-xs text-light-gray-500">
              Los estudiantes con estado diferente a <strong>Activo</strong> no aparecerán en las vistas operativas.
            </p>
          </div>
        )}
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

    {/* Modal de confirmación - Portal independiente con z-index alto */}
    {modalConfirmOpen && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ margin: 0 }}>
        {/* Backdrop - sin blur para evitar doble blur con el modal padre */}
        <div
          className="fixed inset-0 bg-black/60"
          onClick={() => !isSubmitting && setModalConfirmOpen(false)}
        />

        {/* Modal Container */}
        <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              {mode === 'edit' ? 'Confirmar edición' : 'Confirmar registro'}
            </h2>
            <button
              type="button"
              onClick={() => !isSubmitting && setModalConfirmOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              disabled={isSubmitting}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <div className="space-y-3">
        {/* Alerta de error de duplicado - Diseño limpio */}
        {errorDuplicado && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3" role="alert">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 mb-0.5">Identificación duplicada</h3>
                <p className="text-sm text-red-700 leading-relaxed">{errorDuplicado}</p>
              </div>
            </div>
          </div>
        )}

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 py-1">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">Formulario</span>
          </div>
          <div className="w-16 h-0.5 bg-gray-300"></div>
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-white">2</span>
            </div>
            <span className="text-sm font-medium text-blue-600">Confirmar</span>
          </div>
        </div>

        {/* Card de información */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">
              {formData.name} {formData.lastName}
            </h3>
            <p className="text-sm text-gray-600 mt-0.5">
              {formData.document === 'RC' ? 'Registro Civil' : 'Tarjeta de Identidad'} · {formData.id}
            </p>
          </div>

          {/* Detalles */}
          <div className="p-4 space-y-2.5">
            {/* Datos personales */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Datos personales</p>
                <p className="text-sm text-gray-900"><span className="font-medium">Nombres:</span> {formData.name}</p>
                <p className="text-sm text-gray-900"><span className="font-medium">Apellidos:</span> {formData.lastName}</p>
              </div>
            </div>

            <div className="border-t border-gray-100"></div>

            {/* Información académica */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Información académica</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Nivel</p>
                    <p className="text-sm font-medium text-gray-900">{formData.classRoom}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Salón</p>
                    <p className="text-sm font-medium text-gray-900">{formData.className}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100"></div>

            {/* Modo de evaluación */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Modo de evaluación</p>
                <p className="text-sm font-medium text-gray-900">
                  {formData.caracter === 'normal' ? 'Evaluación Normal' : 'Evaluación con Ajustes'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => {
              setModalConfirmOpen(false);
              setErrorDuplicado(null);
            }}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 transition-all"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleModalConfirm}
            disabled={isSubmitting || !!errorDuplicado}
            className="px-6 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Guardando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Confirmar
              </>
            )}
          </button>
            </div>
            </div>
          </div>
        </div>
      </div>
    )}


    {/* Toast notification */}
    <Toast
      message={toast.message}
      type={toast.type}
      isVisible={toast.isVisible}
      onClose={hideToast}
    />
  </>
  );
};

export default StudentFormV2;
