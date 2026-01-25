import { IconBooks, IconLoader2, IconAlertCircle } from '@tabler/icons-react';
import { useAreaForm } from './useAreaForm';
import { SELECT_OPTIONS } from './formConfig';
import { AreaFormState, AreaServiceData } from '../../../shared/types/areaTypes';

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
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label} <span className="text-red-500">*</span>
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
        w-full px-3 py-2.5
        text-sm text-gray-700
        bg-white border rounded-lg
        transition-all duration-200
        placeholder:text-gray-400
        focus:outline-none focus:ring-2
        ${error
          ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
          : 'border-gray-200 hover:border-gray-300 focus:ring-violet-200 focus:border-violet-400'
        }
      `}
    />
    {error && (
      <p className="flex items-center gap-1 text-sm text-red-600">
        <IconAlertCircle size={14} />
        {error}
      </p>
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
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label} <span className="text-red-500">*</span>
    </label>
    <div className="relative">
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`
          w-full px-3 py-2.5 pr-10
          text-sm text-gray-700
          bg-white border rounded-lg
          transition-all duration-200
          appearance-none cursor-pointer
          focus:outline-none focus:ring-2
          ${error
            ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
            : 'border-gray-200 hover:border-gray-300 focus:ring-violet-200 focus:border-violet-400'
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
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
    {error && (
      <p className="flex items-center gap-1 text-sm text-red-600">
        <IconAlertCircle size={14} />
        {error}
      </p>
    )}
  </div>
);

const AreaForm = ({ initialData, onSubmit, existingAreas }: AreaFormProps) => {
  const { form, error, handleChange, handleBlur, handleSubmit, isSubmitting } = useAreaForm({
    initialData,
    onSubmit,
    existingAreas
  });

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
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
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              w-full flex items-center justify-center gap-2
              px-4 py-2.5
              text-sm font-semibold text-white
              rounded-xl
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2
              ${isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 focus:ring-violet-300 shadow-md hover:shadow-lg'
              }
            `}
          >
            {isSubmitting ? (
              <>
                <IconLoader2 size={18} className="animate-spin" />
                {initialData?.id ? 'Actualizando...' : 'Guardando...'}
              </>
            ) : (
              <>
                <IconBooks size={18} />
                {initialData?.id ? 'Actualizar Asignatura' : 'Guardar Asignatura'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AreaForm;
