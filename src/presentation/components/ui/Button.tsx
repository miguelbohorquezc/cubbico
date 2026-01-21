import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import PropTypes from 'prop-types';

/**
 * Button variants following institutional design system
 */
export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';

/**
 * Button sizes
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Props for the Button component
 */
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  /**
   * Visual style variant of the button
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Size of the button
   * @default 'md'
   */
  size?: ButtonSize;

  /**
   * Whether the button is in a loading state
   * Shows a spinner and disables interaction
   * @default false
   */
  loading?: boolean;

  /**
   * Icon to display on the left side of the button text
   */
  leftIcon?: ReactNode;

  /**
   * Icon to display on the right side of the button text
   */
  rightIcon?: ReactNode;

  /**
   * Whether the button should take full width of its container
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Additional CSS classes for the button container
   */
  containerClassName?: string;

  /**
   * Button content (children)
   */
  children?: ReactNode;
}

/**
 * Button Component
 *
 * A reusable button component with Tailwind CSS styling, multiple variants,
 * loading states, and accessibility features.
 *
 * @example
 * ```tsx
 * // Primary button
 * <Button variant="primary" onClick={handleSubmit}>
 *   Guardar
 * </Button>
 * ```
 *
 * @example
 * ```tsx
 * // Button with loading state
 * <Button variant="accent" loading={isSubmitting} disabled={isSubmitting}>
 *   Enviando...
 * </Button>
 * ```
 *
 * @example
 * ```tsx
 * // Button with icons
 * <Button
 *   variant="secondary"
 *   leftIcon={<PlusIcon />}
 *   rightIcon={<ArrowIcon />}
 * >
 *   Agregar Usuario
 * </Button>
 * ```
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  containerClassName = '',
  children,
  type = 'button',
  ...rest
}) => {
  // Base button classes
  const baseClasses = `
    inline-flex
    items-center
    justify-center
    gap-2
    font-medium
    rounded-lg
    transition-all
    duration-200
    focus:outline-none
    focus:ring-2
    focus:ring-offset-2
    disabled:cursor-not-allowed
    disabled:opacity-60
    ${fullWidth ? 'w-full' : ''}
  `.replace(/\s+/g, ' ').trim();

  // Size classes
  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  // Variant classes
  const variantClasses: Record<ButtonVariant, string> = {
    primary: `
      bg-deep-blue-700
      text-white
      border
      border-deep-blue-700
      hover:bg-deep-blue-800
      hover:border-deep-blue-800
      active:bg-deep-blue-900
      focus:ring-deep-blue-300
      disabled:bg-deep-blue-400
      disabled:border-deep-blue-400
    `.replace(/\s+/g, ' ').trim(),

    secondary: `
      bg-medium-blue-600
      text-white
      border
      border-medium-blue-600
      hover:bg-medium-blue-700
      hover:border-medium-blue-700
      active:bg-medium-blue-800
      focus:ring-medium-blue-300
      disabled:bg-medium-blue-300
      disabled:border-medium-blue-300
    `.replace(/\s+/g, ' ').trim(),

    accent: `
      bg-gold-500
      text-deep-blue-900
      border
      border-gold-500
      hover:bg-gold-600
      hover:border-gold-600
      active:bg-gold-700
      focus:ring-gold-300
      disabled:bg-gold-200
      disabled:border-gold-200
    `.replace(/\s+/g, ' ').trim(),

    outline: `
      bg-transparent
      text-deep-blue-700
      border-2
      border-deep-blue-700
      hover:bg-deep-blue-50
      hover:border-deep-blue-800
      active:bg-deep-blue-100
      focus:ring-deep-blue-300
      disabled:text-deep-blue-300
      disabled:border-deep-blue-300
      disabled:bg-transparent
    `.replace(/\s+/g, ' ').trim(),

    ghost: `
      bg-transparent
      text-deep-blue-700
      border
      border-transparent
      hover:bg-light-gray-100
      hover:text-deep-blue-800
      active:bg-light-gray-200
      focus:ring-light-gray-300
      disabled:text-light-gray-400
      disabled:bg-transparent
    `.replace(/\s+/g, ' ').trim(),

    danger: `
      bg-error-600
      text-white
      border
      border-error-600
      hover:bg-error-700
      hover:border-error-700
      active:bg-error-800
      focus:ring-error-300
      disabled:bg-error-300
      disabled:border-error-300
    `.replace(/\s+/g, ' ').trim(),
  };

  // Combine all classes
  const buttonClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`;

  // Icon size based on button size
  const iconSize: Record<ButtonSize, string> = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${buttonClasses} ${containerClassName}`}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      {...rest}
    >
      {/* Loading Spinner */}
      {loading && (
        <svg
          className={`animate-spin ${iconSize[size]}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {/* Left Icon */}
      {!loading && leftIcon && (
        <span className={iconSize[size]} aria-hidden="true">
          {leftIcon}
        </span>
      )}

      {/* Button Text */}
      {children && <span>{children}</span>}

      {/* Right Icon */}
      {!loading && rightIcon && (
        <span className={iconSize[size]} aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
};

// PropTypes for runtime validation
Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'accent', 'outline', 'ghost', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  leftIcon: PropTypes.any, // ReactNode type compatibility
  rightIcon: PropTypes.any, // ReactNode type compatibility
  fullWidth: PropTypes.bool,
  containerClassName: PropTypes.string,
  children: PropTypes.any, // ReactNode type compatibility
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
};

export default Button;
