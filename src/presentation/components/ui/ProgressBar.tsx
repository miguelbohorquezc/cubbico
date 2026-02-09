import React from 'react';
import PropTypes from 'prop-types';

/**
 * ProgressBar variants
 */
export type ProgressBarVariant = 'default' | 'slim' | 'thick';

/**
 * Props for the ProgressBar component
 */
export interface ProgressBarProps {
  /**
   * Current progress value
   */
  value: number;

  /**
   * Maximum progress value
   * @default 100
   */
  max?: number;

  /**
   * Optional label to display above the progress bar
   */
  label?: string;

  /**
   * Whether to show percentage text
   * @default true
   */
  showPercentage?: boolean;

  /**
   * Visual style variant
   * @default 'default'
   */
  variant?: ProgressBarVariant;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Whether to use dynamic colors based on progress
   * @default true
   */
  dynamicColor?: boolean;
}

/**
 * ProgressBar Component
 *
 * A reusable progress bar with smooth animations and dynamic colors.
 * Colors change based on progress: red < 50%, yellow < 80%, green >= 80%.
 *
 * @example
 * ```tsx
 * // Default progress bar
 * <ProgressBar value={75} label="Progreso de configuración" />
 * ```
 *
 * @example
 * ```tsx
 * // Slim progress bar without percentage
 * <ProgressBar
 *   value={50}
 *   max={100}
 *   variant="slim"
 *   showPercentage={false}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Thick progress bar with custom max
 * <ProgressBar
 *   value={3}
 *   max={3}
 *   label="Propósitos completados"
 *   variant="thick"
 * />
 * ```
 */
const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercentage = true,
  variant = 'default',
  className = '',
  dynamicColor = true,
}) => {
  // Calculate percentage
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  // Determine color based on percentage
  const getColorClasses = (): string => {
    if (!dynamicColor) {
      return 'bg-deep-blue-600';
    }

    if (percentage < 50) {
      return 'bg-error-500';
    } else if (percentage < 80) {
      return 'bg-yellow-500';
    } else {
      return 'bg-green-500';
    }
  };

  // Height based on variant
  const heightClasses: Record<ProgressBarVariant, string> = {
    slim: 'h-1',
    default: 'h-2.5',
    thick: 'h-4',
  };

  // Container classes
  const containerClasses = `
    w-full
    ${className}
  `.replace(/\s+/g, ' ').trim();

  // Track classes
  const trackClasses = `
    w-full
    ${heightClasses[variant]}
    bg-light-gray-200
    rounded-full
    overflow-hidden
  `.replace(/\s+/g, ' ').trim();

  // Fill classes
  const fillClasses = `
    ${heightClasses[variant]}
    ${getColorClasses()}
    rounded-full
    transition-all
    duration-500
    ease-out
  `.replace(/\s+/g, ' ').trim();

  return (
    <div className={containerClasses}>
      {/* Label and Percentage */}
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-medium text-light-gray-700">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm font-medium text-light-gray-600">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      {/* Progress Track */}
      <div className={trackClasses} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        {/* Progress Fill */}
        <div
          className={fillClasses}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// PropTypes for runtime validation
ProgressBar.propTypes = {
  value: PropTypes.number.isRequired,
  max: PropTypes.number,
  label: PropTypes.string,
  showPercentage: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'slim', 'thick']),
  className: PropTypes.string,
  dynamicColor: PropTypes.bool,
};

export default ProgressBar;
