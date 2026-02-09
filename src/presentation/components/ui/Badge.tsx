import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';

/**
 * Badge variants following institutional design system
 */
export type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'purple'
  | 'blue';

/**
 * Badge sizes
 */
export type BadgeSize = 'sm' | 'md' | 'lg';

/**
 * Props for the Badge component
 */
export interface BadgeProps {
  /**
   * Visual style variant of the badge
   * @default 'default'
   */
  variant?: BadgeVariant;

  /**
   * Size of the badge
   * @default 'md'
   */
  size?: BadgeSize;

  /**
   * Optional icon to display on the left
   */
  icon?: ReactNode;

  /**
   * Badge content (children)
   */
  children: ReactNode;

  /**
   * Additional CSS classes for the badge
   */
  className?: string;

  /**
   * Whether to show a dot indicator
   * @default false
   */
  showDot?: boolean;
}

/**
 * Badge Component
 *
 * A reusable badge component for displaying status, categories, or counts.
 * Inspired by modern project management tools with subtle colors and good contrast.
 *
 * @example
 * ```tsx
 * // Default badge
 * <Badge>Normal</Badge>
 * ```
 *
 * @example
 * ```tsx
 * // Success badge with icon
 * <Badge variant="success" icon={<CheckIcon />}>
 *   Completado
 * </Badge>
 * ```
 *
 * @example
 * ```tsx
 * // Small badge with dot
 * <Badge variant="info" size="sm" showDot>
 *   Nuevo
 * </Badge>
 * ```
 */
const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  icon,
  children,
  className = '',
  showDot = false,
}) => {
  // Base badge classes
  const baseClasses = `
    inline-flex
    items-center
    gap-1.5
    font-medium
    rounded-md
    transition-colors
    duration-150
    whitespace-nowrap
  `.replace(/\s+/g, ' ').trim();

  // Size classes
  const sizeClasses: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  // Variant classes - inspired by Linear/pd.jpg design
  const variantClasses: Record<BadgeVariant, string> = {
    default: `
      bg-light-gray-100
      text-light-gray-700
      border
      border-light-gray-200
    `.replace(/\s+/g, ' ').trim(),

    success: `
      bg-green-50
      text-green-700
      border
      border-green-200
    `.replace(/\s+/g, ' ').trim(),

    warning: `
      bg-yellow-50
      text-yellow-700
      border
      border-yellow-200
    `.replace(/\s+/g, ' ').trim(),

    error: `
      bg-red-50
      text-red-700
      border
      border-red-200
    `.replace(/\s+/g, ' ').trim(),

    info: `
      bg-blue-50
      text-blue-700
      border
      border-blue-200
    `.replace(/\s+/g, ' ').trim(),

    purple: `
      bg-purple-50
      text-purple-700
      border
      border-purple-200
    `.replace(/\s+/g, ' ').trim(),

    blue: `
      bg-medium-blue-50
      text-medium-blue-700
      border
      border-medium-blue-200
    `.replace(/\s+/g, ' ').trim(),
  };

  // Dot color classes
  const dotColorClasses: Record<BadgeVariant, string> = {
    default: 'bg-light-gray-400',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    purple: 'bg-purple-500',
    blue: 'bg-medium-blue-500',
  };

  // Icon size based on badge size
  const iconSize: Record<BadgeSize, string> = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  // Dot size based on badge size
  const dotSize: Record<BadgeSize, string> = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  // Combine all classes
  const badgeClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  return (
    <span className={badgeClasses}>
      {/* Dot indicator */}
      {showDot && (
        <span
          className={`${dotSize[size]} ${dotColorClasses[variant]} rounded-full`}
          aria-hidden="true"
        />
      )}

      {/* Icon */}
      {icon && !showDot && (
        <span className={iconSize[size]} aria-hidden="true">
          {icon}
        </span>
      )}

      {/* Content */}
      <span>{children}</span>
    </span>
  );
};

// PropTypes for runtime validation
Badge.propTypes = {
  variant: PropTypes.oneOf([
    'default',
    'success',
    'warning',
    'error',
    'info',
    'purple',
    'blue',
  ]),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  icon: PropTypes.any, // ReactNode type compatibility
  children: PropTypes.any.isRequired, // ReactNode type compatibility
  className: PropTypes.string,
  showDot: PropTypes.bool,
};

export default Badge;
