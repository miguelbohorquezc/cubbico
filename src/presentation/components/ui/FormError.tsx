import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';

/**
 * FormError variants
 */
export type FormErrorVariant = 'error' | 'warning' | 'info' | 'success';

/**
 * Props for the FormError component
 */
export interface FormErrorProps {
  /**
   * The message to display
   */
  message: string;

  /**
   * Visual style variant
   * @default 'error'
   */
  variant?: FormErrorVariant;

  /**
   * Whether the error can be dismissed
   * @default false
   */
  dismissible?: boolean;

  /**
   * Callback when the error is dismissed
   */
  onDismiss?: () => void;

  /**
   * Custom icon to display (overrides default variant icon)
   */
  icon?: ReactNode;

  /**
   * Additional CSS classes for the container
   */
  containerClassName?: string;
}

/**
 * FormError Component
 *
 * A reusable component for displaying form validation errors, warnings,
 * info messages, and success messages with consistent styling.
 *
 * @example
 * ```tsx
 * // Error message
 * <FormError
 *   variant="error"
 *   message="El correo electrónico es inválido"
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Dismissible warning
 * <FormError
 *   variant="warning"
 *   message="La contraseña debe tener al menos 8 caracteres"
 *   dismissible
 *   onDismiss={() => setWarning(null)}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Success message
 * <FormError
 *   variant="success"
 *   message="Formulario enviado correctamente"
 * />
 * ```
 */
const FormError: React.FC<FormErrorProps> = ({
  message,
  variant = 'error',
  dismissible = false,
  onDismiss,
  icon,
  containerClassName = '',
}) => {
  // Variant styles
  const variantStyles: Record<FormErrorVariant, {
    container: string;
    icon: string;
    text: string;
  }> = {
    error: {
      container: 'bg-error-50 border-error-300 border',
      icon: 'text-error-600',
      text: 'text-error-800',
    },
    warning: {
      container: 'bg-warning-50 border-warning-300 border',
      icon: 'text-warning-600',
      text: 'text-warning-800',
    },
    info: {
      container: 'bg-info-50 border-info-300 border',
      icon: 'text-info-600',
      text: 'text-info-800',
    },
    success: {
      container: 'bg-success-50 border-success-300 border',
      icon: 'text-success-600',
      text: 'text-success-800',
    },
  };

  const styles = variantStyles[variant];

  // Default icons for each variant
  const defaultIcons: Record<FormErrorVariant, ReactNode> = {
    error: (
      <svg
        className="w-5 h-5 flex-shrink-0"
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
    ),
    warning: (
      <svg
        className="w-5 h-5 flex-shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
    info: (
      <svg
        className="w-5 h-5 flex-shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
    ),
    success: (
      <svg
        className="w-5 h-5 flex-shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
  };

  // Role for accessibility
  const role = variant === 'error' ? 'alert' : variant === 'info' ? 'status' : 'status';

  // aria-live for accessibility
  const ariaLive = variant === 'error' ? 'assertive' : 'polite';

  return (
    <div
      className={`
        flex
        items-start
        gap-3
        p-4
        rounded-lg
        ${styles.container}
        ${containerClassName}
      `.replace(/\s+/g, ' ').trim()}
      role={role}
      aria-live={ariaLive}
    >
      {/* Icon */}
      <div className={styles.icon}>
        {icon || defaultIcons[variant]}
      </div>

      {/* Message */}
      <div className={`flex-1 ${styles.text} text-sm font-medium`}>
        {message}
      </div>

      {/* Dismiss Button */}
      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className={`
            flex-shrink-0
            p-1
            rounded
            transition-colors
            duration-150
            hover:bg-black/5
            focus:outline-none
            focus:ring-2
            focus:ring-offset-1
            ${styles.icon}
          `.replace(/\s+/g, ' ').trim()}
          aria-label="Cerrar mensaje"
        >
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

// PropTypes for runtime validation
FormError.propTypes = {
  message: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['error', 'warning', 'info', 'success']),
  dismissible: PropTypes.bool,
  onDismiss: PropTypes.func,
  icon: PropTypes.any, // ReactNode type compatibility
  containerClassName: PropTypes.string,
};

export default FormError;
