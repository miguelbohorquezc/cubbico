import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import Button, { ButtonProps } from './Button';

/**
 * EmptyState variants
 */
export type EmptyStateVariant = 'default' | 'search' | 'error';

/**
 * Props for the EmptyState component
 */
export interface EmptyStateProps {
  /**
   * Visual style variant
   * @default 'default'
   */
  variant?: EmptyStateVariant;

  /**
   * Icon to display
   */
  icon?: ReactNode;

  /**
   * Title/heading text
   */
  title: string;

  /**
   * Description/body text
   */
  description?: string;

  /**
   * Optional action button configuration
   */
  action?: {
    label: string;
    onClick: () => void;
    variant?: ButtonProps['variant'];
    icon?: ReactNode;
  };

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * EmptyState Component
 *
 * A reusable component to display when there's no data to show.
 * Provides clear feedback to users and optional actions to resolve the empty state.
 *
 * @example
 * ```tsx
 * // Default empty state
 * <EmptyState
 *   icon={<DocumentIcon />}
 *   title="No hay indicadores"
 *   description="Aún no se han creado indicadores para esta asignatura."
 *   action={{
 *     label: "Crear Indicador",
 *     onClick: handleCreate,
 *     icon: <PlusIcon />
 *   }}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Search empty state
 * <EmptyState
 *   variant="search"
 *   icon={<SearchIcon />}
 *   title="No se encontraron resultados"
 *   description="Intenta con otros términos de búsqueda."
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Error empty state
 * <EmptyState
 *   variant="error"
 *   icon={<AlertCircleIcon />}
 *   title="Error al cargar datos"
 *   description="No se pudieron cargar los datos. Por favor, intenta nuevamente."
 *   action={{
 *     label: "Reintentar",
 *     onClick: handleRetry,
 *     variant: "primary"
 *   }}
 * />
 * ```
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'default',
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  // Container classes
  const containerClasses = `
    flex
    flex-col
    items-center
    justify-center
    text-center
    py-12
    px-6
    ${className}
  `.replace(/\s+/g, ' ').trim();

  // Icon color based on variant
  const iconColorClasses: Record<EmptyStateVariant, string> = {
    default: 'text-light-gray-400',
    search: 'text-medium-blue-400',
    error: 'text-error-400',
  };

  // Title color based on variant
  const titleColorClasses: Record<EmptyStateVariant, string> = {
    default: 'text-light-gray-800',
    search: 'text-light-gray-800',
    error: 'text-error-700',
  };

  return (
    <div className={containerClasses}>
      {/* Icon */}
      {icon && (
        <div
          className={`w-16 h-16 mb-4 ${iconColorClasses[variant]}`}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}

      {/* Title */}
      <h3 className={`text-lg font-semibold mb-2 ${titleColorClasses[variant]}`}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-light-gray-600 max-w-md mb-6">
          {description}
        </p>
      )}

      {/* Action Button */}
      {action && (
        <Button
          variant={action.variant || 'primary'}
          leftIcon={action.icon}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

// PropTypes for runtime validation
EmptyState.propTypes = {
  variant: PropTypes.oneOf(['default', 'search', 'error']),
  icon: PropTypes.any,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  action: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    variant: PropTypes.oneOf(['primary', 'secondary', 'accent', 'outline', 'ghost', 'danger']),
    icon: PropTypes.any,
  }),
  className: PropTypes.string,
} as any;

export default EmptyState;
