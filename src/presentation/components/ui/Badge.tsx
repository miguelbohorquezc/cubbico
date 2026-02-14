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
    rounded-lg
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
      bg-tosca/10
      text-tosca-ds
      border
      border-tosca/30
    `.replace(/\s+/g, ' ').trim(),

    warning: `
      bg-yellow/10
      text-yellow-cc
      border
      border-yellow/30
    `.replace(/\s+/g, ' ').trim(),

    error: `
      bg-magenta/10
      text-magenta-cc
      border
      border-magenta/30
    `.replace(/\s+/g, ' ').trim(),

    info: `
      bg-orchid-blue-5
      text-orchid-blue-70
      border
      border-orchid-blue-20
    `.replace(/\s+/g, ' ').trim(),

    purple: `
      bg-orchid-blue-10
      text-orchid-blue-60
      border
      border-orchid-blue-30
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
    success: 'bg-tosca-ds',
    warning: 'bg-yellow',
    error: 'bg-magenta',
    info: 'bg-orchid-blue-50',
    purple: 'bg-orchid-blue-60',
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
