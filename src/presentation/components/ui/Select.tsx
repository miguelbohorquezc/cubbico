import React, { SelectHTMLAttributes, ReactNode } from 'react';
import PropTypes from 'prop-types';

/**
 * Option for select dropdown
 */
export interface SelectOption {
  /**
   * Value to be submitted
   */
  value: string;
  /**
   * Display label for the option
   */
  label: string;
  /**
   * Whether the option is disabled
   */
  disabled?: boolean;
}

/**
 * Props for the Select component
 */
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  /**
   * Select name attribute (required for form handling)
   */
  name: string;

  /**
   * Array of options for the select
   */
  options: SelectOption[];

  /**
   * Label text displayed above the select
   */
  label?: string;

  /**
   * Placeholder text when no option is selected
   */
  placeholder?: string;

  /**
   * Error message to display below the select
   */
  error?: string;

  /**
   * Icon to display on the left side of the select
   */
  leftIcon?: ReactNode;

  /**
   * Additional CSS classes for the container
   */
  containerClassName?: string;

  /**
   * Whether to show the required asterisk in the label
   * @default true
   */
  showRequiredIndicator?: boolean;
}

/**
 * Select Component
 *
 * A reusable select/dropdown component with Tailwind CSS styling, error handling,
 * and accessibility features.
 *
 * @example
 * ```tsx
 * <Select
 *   name="classroom"
 *   label="Salón"
 *   placeholder="Seleccione un salón"
 *   options={[
 *     { value: '1', label: 'Primero A' },
 *     { value: '2', label: 'Segundo B' },
 *   ]}
 *   error={errors.classroom}
 *   required
 * />
 * ```
 *
 * @example
 * ```tsx
 * <Select
 *   name="evaluationMode"
 *   label="Modo de Evaluación"
 *   options={evaluationOptions}
 *   value={form.evaluationMode}
 *   onChange={handleChange}
 *   leftIcon={<EvaluationIcon />}
 * />
 * ```
 */
const Select: React.FC<SelectProps> = ({
  name,
  options,
  label,
  placeholder = 'Seleccione una opción',
  error,
  leftIcon,
  containerClassName = '',
  showRequiredIndicator = true,
  required = false,
  disabled = false,
  id,
  value,
  'aria-describedby': ariaDescribedBy,
  ...rest
}) => {
  // Generate IDs for accessibility
  const selectId = id || `select-${name}`;
  const errorId = `${selectId}-error`;
  const describedBy = error ? errorId : ariaDescribedBy;

  // Determine select classes based on state
  const selectClasses = `
    w-full
    px-4
    py-3
    ${leftIcon ? 'pl-12' : ''}
    pr-10
    text-base
    bg-white
    border
    rounded-lg
    transition-all
    duration-200
    cursor-pointer
    appearance-none
    focus:outline-none
    focus:ring-2
    disabled:bg-light-gray-50
    disabled:text-light-gray-400
    disabled:cursor-not-allowed
    disabled:border-light-gray-200
    ${
      error
        ? 'border-error-500 text-deep-blue-900 focus:border-error-500 focus:ring-error-200'
        : 'border-light-gray-300 text-deep-blue-900 focus:border-medium-blue-500 focus:ring-medium-blue-200'
    }
    ${!value ? 'text-light-gray-400' : 'text-deep-blue-900'}
  `.replace(/\s+/g, ' ').trim();

  const iconClasses = `
    absolute
    top-1/2
    -translate-y-1/2
    pointer-events-none
    text-light-gray-400
    transition-colors
    duration-200
  `.replace(/\s+/g, ' ').trim();

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-deep-blue-800"
        >
          {label}
          {required && showRequiredIndicator && (
            <span className="text-error-500 ml-1" aria-label="campo requerido">
              *
            </span>
          )}
        </label>
      )}

      {/* Select Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className={`${iconClasses} left-4`}>
            {leftIcon}
          </div>
        )}

        {/* Select Field */}
        <select
          id={selectId}
          name={name}
          required={required}
          disabled={disabled}
          value={value}
          className={selectClasses}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          aria-required={required}
          {...rest}
        >
          {/* Placeholder option */}
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {/* Options */}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Dropdown Arrow Icon */}
        <div className={`${iconClasses} right-4`}>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          id={errorId}
          className="flex items-start gap-1.5 text-sm text-error-600"
          role="alert"
          aria-live="polite"
        >
          <svg
            className="w-4 h-4 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

// PropTypes for runtime validation
Select.propTypes = {
  name: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      disabled: PropTypes.bool,
    }).isRequired
  ).isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  leftIcon: PropTypes.any,
  containerClassName: PropTypes.string,
  showRequiredIndicator: PropTypes.bool,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
} as any;

export default Select;
