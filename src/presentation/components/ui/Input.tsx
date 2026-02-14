import React, { InputHTMLAttributes, ReactNode } from 'react';
import PropTypes from 'prop-types';

/**
 * Props for the Input component
 */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  /**
   * Input name attribute (required for form handling)
   */
  name: string;

  /**
   * Label text displayed above the input
   */
  label?: string;

  /**
   * Error message to display below the input
   */
  error?: string;

  /**
   * Icon to display on the left side of the input
   */
  leftIcon?: ReactNode;

  /**
   * Icon to display on the right side of the input
   */
  rightIcon?: ReactNode;

  /**
   * Additional CSS classes for the container
   */
  containerClassName?: string;

  /**
   * Whether to show the required asterisk in the label
   */
  showRequiredIndicator?: boolean;
}

/**
 * Input Component
 *
 * A reusable input field component with Tailwind CSS styling, error handling,
 * and accessibility features.
 *
 * @example
 * ```tsx
 * <Input
 *   name="email"
 *   type="email"
 *   label="Correo Electrónico"
 *   placeholder="ejemplo@correo.com"
 *   error={errors.email}
 *   leftIcon={<EmailIcon />}
 *   required
 * />
 * ```
 *
 * @example
 * ```tsx
 * <Input
 *   name="password"
 *   type="password"
 *   label="Contraseña"
 *   error={errors.password}
 *   rightIcon={<TogglePasswordIcon />}
 *   disabled={isLoading}
 * />
 * ```
 */
const Input: React.FC<InputProps> = ({
  name,
  label,
  error,
  leftIcon,
  rightIcon,
  containerClassName = '',
  showRequiredIndicator = true,
  required = false,
  disabled = false,
  type = 'text',
  id,
  'aria-describedby': ariaDescribedBy,
  ...rest
}) => {
  // Generate IDs for accessibility
  const inputId = id || `input-${name}`;
  const errorId = `${inputId}-error`;
  const describedBy = error ? errorId : ariaDescribedBy;

  // Determine input classes based on state
  const inputClasses = `
    w-full
    px-4
    py-3
    ${leftIcon ? 'pl-12' : ''}
    ${rightIcon ? 'pr-12' : ''}
    text-base
    text-deep-blue-900
    bg-white
    border
    rounded-lg
    transition-all
    duration-200
    placeholder:text-light-gray-400
    focus:outline-none
    focus:ring-2
    disabled:bg-light-gray-50
    disabled:text-light-gray-400
    disabled:cursor-not-allowed
    disabled:border-light-gray-200
    ${
      error
        ? 'border-error-500 focus:border-error-500 focus:ring-error-200'
        : 'border-light-gray-300 focus:border-orchid-blue-60 focus:ring-orchid-blue-20'
    }
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
          htmlFor={inputId}
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

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className={`${iconClasses} left-4`}>
            {leftIcon}
          </div>
        )}

        {/* Input Field */}
        <input
          id={inputId}
          name={name}
          type={type}
          required={required}
          disabled={disabled}
          className={inputClasses}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          aria-required={required}
          {...rest}
        />

        {/* Right Icon */}
        {rightIcon && (
          <div className={`${iconClasses} right-4 pointer-events-auto`}>
            {rightIcon}
          </div>
        )}
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
Input.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  error: PropTypes.string,
  leftIcon: PropTypes.any, // ReactNode type compatibility
  rightIcon: PropTypes.any, // ReactNode type compatibility
  containerClassName: PropTypes.string,
  showRequiredIndicator: PropTypes.bool,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  type: PropTypes.string,
};

export default Input;
