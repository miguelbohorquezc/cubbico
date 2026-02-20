import React, { LabelHTMLAttributes, ReactNode } from 'react';
import PropTypes from 'prop-types';

/**
 * Label size variants
 */
export type LabelSize = 'sm' | 'md' | 'lg';

/**
 * Props for the Label component
 */
export interface LabelProps extends Omit<LabelHTMLAttributes<HTMLLabelElement>, 'className'> {
  /**
   * Label text content
   */
  children: ReactNode;

  /**
   * The id of the form element this label is for
   */
  htmlFor?: string;

  /**
   * Whether to show the required asterisk indicator
   * @default false
   */
  required?: boolean;

  /**
   * Size variant of the label
   * @default 'md'
   */
  size?: LabelSize;

  /**
   * Additional description text below the label
   */
  description?: string;

  /**
   * Icon to display before the label text
   */
  icon?: ReactNode;

  /**
   * Additional CSS classes for the label container
   */
  containerClassName?: string;

  /**
   * Whether the label is for a disabled field
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether to show the optional indicator instead of required
   * @default false
   */
  showOptional?: boolean;
}

/**
 * Label Component
 *
 * A reusable label component with Tailwind CSS styling for form fields.
 * Supports required indicators, descriptions, icons, and multiple sizes.
 *
 * @example
 * ```tsx
 * <Label htmlFor="email" required>
 *   Correo Electrónico
 * </Label>
 * ```
 *
 * @example
 * ```tsx
 * <Label
 *   htmlFor="password"
 *   required
 *   description="Mínimo 8 caracteres"
 *   icon={<LockIcon />}
 * >
 *   Contraseña
 * </Label>
 * ```
 *
 * @example
 * ```tsx
 * <Label htmlFor="notes" showOptional size="sm">
 *   Observaciones
 * </Label>
 * ```
 */
const Label: React.FC<LabelProps> = ({
  children,
  htmlFor,
  required = false,
  size = 'md',
  description,
  icon,
  containerClassName = '',
  disabled = false,
  showOptional = false,
  ...rest
}) => {
  // Size classes
  const sizeClasses: Record<LabelSize, string> = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  // Icon size classes
  const iconSizeClasses: Record<LabelSize, string> = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  // Description size classes
  const descriptionSizeClasses: Record<LabelSize, string> = {
    sm: 'text-xs',
    md: 'text-xs',
    lg: 'text-sm',
  };

  // Base label classes
  const labelClasses = `
    inline-flex
    items-center
    gap-1.5
    font-medium
    transition-colors
    duration-200
    ${sizeClasses[size]}
    ${disabled ? 'text-light-gray-400' : 'text-deep-blue-800'}
  `.replace(/\s+/g, ' ').trim();

  return (
    <div className={`flex flex-col gap-0.5 ${containerClassName}`}>
      <label
        htmlFor={htmlFor}
        className={labelClasses}
        {...rest}
      >
        {/* Icon */}
        {icon && (
          <span
            className={`${iconSizeClasses[size]} flex-shrink-0`}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}

        {/* Label Text */}
        <span>{children}</span>

        {/* Required Indicator */}
        {required && !showOptional && (
          <span
            className="text-error-500 ml-0.5"
            aria-label="campo requerido"
          >
            *
          </span>
        )}

        {/* Optional Indicator */}
        {showOptional && !required && (
          <span
            className={`
              font-normal
              text-light-gray-400
              ${size === 'sm' ? 'text-xs' : 'text-xs'}
            `.replace(/\s+/g, ' ').trim()}
          >
            (opcional)
          </span>
        )}
      </label>

      {/* Description */}
      {description && (
        <span
          className={`
            ${descriptionSizeClasses[size]}
            ${disabled ? 'text-light-gray-300' : 'text-light-gray-500'}
          `.replace(/\s+/g, ' ').trim()}
        >
          {description}
        </span>
      )}
    </div>
  );
};

// PropTypes for runtime validation
Label.propTypes = {
  children: PropTypes.node.isRequired,
  htmlFor: PropTypes.string,
  required: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  description: PropTypes.string,
  icon: PropTypes.any,
  containerClassName: PropTypes.string,
  disabled: PropTypes.bool,
  showOptional: PropTypes.bool,
} as any;

export default Label;
