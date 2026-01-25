import { ChangeEvent, FocusEvent } from 'react';
import { IconAlertCircle } from '@tabler/icons-react';
import { Option } from '../../shared/types/studentTypes';

type FormFieldProps = {
  type: 'text' | 'number' | 'select' | 'password' | 'email';
  name: string;
  value: string;
  placeholder?: string;
  options?: Option[];
  error?: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onBlur: (e: FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
  disabled?: boolean;
};

/**
 * Componente de campo de formulario reutilizable con Tailwind CSS
 */
export const FormField = ({
  type,
  name,
  value,
  placeholder,
  options,
  error,
  onChange,
  onBlur,
  disabled = false,
}: FormFieldProps) => {
  // Clases base compartidas entre input y select
  const baseClasses = `
    w-full px-3 py-2.5
    text-sm text-gray-700
    bg-white border rounded-lg
    transition-all duration-200
    ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}
    ${error
      ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
      : 'border-gray-200 hover:border-gray-300 focus:ring-emerald-200 focus:border-emerald-400'
    }
    focus:outline-none focus:ring-2
    placeholder:text-gray-400
  `;

  return (
    <div className="w-full">
      {type === 'select' ? (
        <div className="relative">
          <select
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            className={`${baseClasses} appearance-none cursor-pointer pr-10`}
            aria-invalid={!!error}
          >
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {/* Flecha del select */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={baseClasses}
          aria-invalid={!!error}
        />
      )}

      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
          <IconAlertCircle size={14} />
          {error}
        </p>
      )}
    </div>
  );
};
