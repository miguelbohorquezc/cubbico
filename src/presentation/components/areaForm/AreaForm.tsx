import { useState } from 'react';
import { IconBooks, IconAlertCircle, IconX } from '@tabler/icons-react';
import { useAreaForm } from './useAreaForm';
import { SELECT_OPTIONS } from './formConfig';
import { AreaFormState, AreaServiceData } from '../../../shared/types/areaTypes';
import Button from '../ui/Button';
import Toast from '../common/Toast';

interface AreaFormProps {
  initialData?: AreaFormState;
  onSubmit?: (formData: AreaServiceData) => Promise<boolean> | void;
  existingAreas?: AreaServiceData[];
}

/**
 * Componente de input con Tailwind
 */
interface InputFieldProps {
  label: string;
  name: string;
  type: 'text' | 'number';
  value: string;
  placeholder: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const InputField = ({ label, name, type, value, placeholder, error, onChange, onBlur }: InputFieldProps) => (
  <div className="space-y-1.5">
    <label htmlFor={name} className="block text-sm font-medium text-deep-blue-800">
      {label} <span className="text-error-500">*</span>
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      onBlur={onBlur}
      className={`
        w-full px-4 py-3
        text-base text-deep-blue-900
        bg-white border rounded-lg
        transition-all duration-200
        placeholder:text-light-gray-400
        focus:outline-none focus:ring-2
        ${error
          ? 'border-error-500 focus:ring-error-200 focus:border-error-500'
          : 'border-light-gray-300 hover:border-gray-300 focus:ring-orchid-blue-20 focus:border-orchid-blue-60'
        }
      `}
    />
    {error && (
      <div className="flex items-start gap-1.5 text-sm text-error-600" role="alert">
        <IconAlertCircle size={16} className="mt-0.5 flex-shrink-0" />
        <span>{error}</span>
      </div>
    )}
  </div>
);

/**
 * Componente de select con Tailwind
 */
interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  options: { value: string; label: string }[];
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLSelectElement>) => void;
}

const SelectField = ({ label, name, value, options, error, onChange, onBlur }: SelectFieldProps) => (
  <div className="space-y-1.5">
    <label htmlFor={name} className="block text-sm font-medium text-deep-blue-800">
      {label} <span className="text-error-500">*</span>
    </label>
    <div className="relative">
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`
          w-full px-4 py-3 pr-10
          text-base text-deep-blue-900
          bg-white border rounded-lg
          transition-all duration-200
          appearance-none cursor-pointer
          focus:outline-none focus:ring-2
          ${error
            ? 'border-error-500 focus:ring-error-200 focus:border-error-500'
            : 'border-light-gray-300 hover:border-gray-300 focus:ring-orchid-blue-20 focus:border-orchid-blue-60'
          }
        `}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-5 h-5 text-light-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
    {error && (
      <div className="flex items-start gap-1.5 text-sm text-error-600" role="alert">
        <IconAlertCircle size={16} className="mt-0.5 flex-shrink-0" />
        <span>{error}</span>
      </div>
    )}
  </div>
);

const AreaForm = ({ initialData, onSubmit, existingAreas }: AreaFormProps) => {
  const { form, error, handleChange, handleBlur, handleSubmit, submitForm, isSubmitting } = useAreaForm({
    initialData,
    onSubmit,
    existingAreas
  });

  // Modal de confirmación
  const [modalConfirmOpen, setModalConfirmOpen] = useState(false);

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

  // Handle form submission (validates and opens modal)
  const onFormSubmit = async (e: React.FormEvent) => {
    const isValid = handleSubmit(e);

    // If validation passed, open modal
    if (isValid) {
      setModalConfirmOpen(true);
    }
  };

  // Handle modal confirmation
  const handleModalConfirm = async () => {
    try {
      await submitForm();
      setModalConfirmOpen(false);

      // Show success toast
      showToast(
        initialData?.id
          ? `Asignatura ${form.asignatura} actualizada exitosamente`
          : `Asignatura ${form.asignatura} creada exitosamente`,
        'success'
      );

      // Call parent onSubmit callback if exists
      if (onSubmit) {
        const areaData = {
          orden: Number(form.orden) || 0,
          asignatura: form.asignatura.trim(),
          ihs: Number(form.ihs) || 0,
          area: form.area.trim(),
          nivel: form.nivel
        };
        if (form.id) {
          await onSubmit({ ...areaData, id: form.id });
        }
      }
    } catch (error) {
      console.error('Error submitting:', error);
      showToast('Error al guardar la asignatura. Por favor, intenta de nuevo.', 'error');
    }
  };

  return (
    <>
      <div className="w-full max-w-2xl mx-auto">
        <form onSubmit={onFormSubmit} className="space-y-5">
        {/* Grid de campos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nivel */}
          <SelectField
            label="Nivel académico"
            name="nivel"
            value={form.nivel}
            options={SELECT_OPTIONS.nivel}
            error={error.nivel}
            onChange={handleChange}
            onBlur={handleBlur}
          />

          {/* Área */}
          <SelectField
            label="Área de conocimiento"
            name="area"
            value={form.area}
            options={SELECT_OPTIONS.area}
            error={error.area}
            onChange={handleChange}
            onBlur={handleBlur}
          />

          {/* Asignatura */}
          <InputField
            label="Nombre de la asignatura"
            name="asignatura"
            type="text"
            value={form.asignatura}
            placeholder="Ej: Matemáticas, Español"
            error={error.asignatura}
            onChange={handleChange}
            onBlur={handleBlur}
          />

          {/* IHS */}
          <InputField
            label="Intensidad horaria semanal"
            name="ihs"
            type="number"
            value={form.ihs}
            placeholder="Ej: 4"
            error={error.ihs}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </div>

        {/* Botón submit */}
        <div className="pt-4 mt-4 border-t border-light-gray-200">
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isSubmitting}
            disabled={isSubmitting}
            fullWidth
            leftIcon={!isSubmitting ? <IconBooks size={18} /> : undefined}
          >
            {isSubmitting
              ? (initialData?.id ? 'Actualizando...' : 'Guardando...')
              : (initialData?.id ? 'Actualizar Asignatura' : 'Guardar Asignatura')
            }
          </Button>
        </div>
      </form>
    </div>

    {/* Modal de confirmación */}
    {modalConfirmOpen && (
      <div className="fixed inset-0 z-[60] overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
          <div className="relative w-full max-w-xl bg-white rounded-lg shadow-2xl transform transition-all overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-orchid-blue-60 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <IconBooks size={20} className="text-white" />
                </div>
                <h2 className="text-lg font-semibold text-white">
                  {initialData?.id ? 'Confirmar actualización' : 'Confirmar creación'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => !isSubmitting && setModalConfirmOpen(false)}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-all"
                disabled={isSubmitting}
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <div className="space-y-3">
                {/* Card de información */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {/* Header */}
                  <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
                    <h3 className="text-base font-semibold text-gray-900">
                      {form.asignatura}
                    </h3>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {form.area} · {form.nivel}
                    </p>
                  </div>

                  {/* Detalles */}
                  <div className="p-4 space-y-2.5">
                    {/* Área y Nivel */}
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-orchid-blue-10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-orchid-blue-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Información académica</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-gray-500">Área</p>
                            <p className="text-sm font-medium text-gray-900">{form.area}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Nivel</p>
                            <p className="text-sm font-medium text-gray-900">{form.nivel}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-100"></div>

                    {/* IHS */}
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-tosca-ds/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-tosca-cc" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Intensidad horaria</p>
                        <p className="text-sm font-medium text-gray-900">{form.ihs} horas semanales</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-2.5 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalConfirmOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleModalConfirm}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    leftIcon={!isSubmitting ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : undefined}
                  >
                    {isSubmitting ? 'Guardando...' : 'Confirmar'}
                  </Button>
                </div>
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

export default AreaForm;
