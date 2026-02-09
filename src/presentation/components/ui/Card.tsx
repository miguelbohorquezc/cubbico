import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';

/**
 * Card elevation levels
 */
export type CardElevation = 'none' | 'sm' | 'md' | 'lg';

/**
 * Props for the Card component
 */
export interface CardProps {
  /**
   * Card content (children)
   */
  children: ReactNode;

  /**
   * Shadow/elevation level
   * @default 'sm'
   */
  elevation?: CardElevation;

  /**
   * Additional CSS classes for the card
   */
  className?: string;

  /**
   * Whether the card should be hoverable with effect
   * @default false
   */
  hoverable?: boolean;
}

/**
 * Props for CardHeader component
 */
export interface CardHeaderProps {
  /**
   * Header content
   */
  children: ReactNode;

  /**
   * Optional icon to display before the title
   */
  icon?: ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Optional action element (e.g., button) on the right
   */
  action?: ReactNode;
}

/**
 * Props for CardBody component
 */
export interface CardBodyProps {
  /**
   * Body content
   */
  children: ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Whether to add extra padding
   * @default false
   */
  noPadding?: boolean;
}

/**
 * Props for CardFooter component
 */
export interface CardFooterProps {
  /**
   * Footer content
   */
  children: ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Whether to add border on top
   * @default true
   */
  withBorder?: boolean;
}

/**
 * CardHeader Component
 */
const CardHeader: React.FC<CardHeaderProps> = ({ children, icon, className = '', action }) => {
  const headerClasses = `
    flex
    items-center
    justify-between
    px-6
    py-4
    border-b
    border-light-gray-200
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <div className={headerClasses}>
      <div className="flex items-center gap-3">
        {icon && (
          <span className="w-5 h-5 text-deep-blue-600" aria-hidden="true">
            {icon}
          </span>
        )}
        <div className="text-base font-semibold text-deep-blue-800">{children}</div>
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
};

CardHeader.propTypes = {
  children: PropTypes.any.isRequired,
  icon: PropTypes.any,
  className: PropTypes.string,
  action: PropTypes.any,
};

/**
 * CardBody Component
 */
const CardBody: React.FC<CardBodyProps> = ({ children, className = '', noPadding = false }) => {
  const bodyClasses = `
    ${noPadding ? '' : 'px-6 py-4'}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return <div className={bodyClasses}>{children}</div>;
};

CardBody.propTypes = {
  children: PropTypes.any.isRequired,
  className: PropTypes.string,
  noPadding: PropTypes.bool,
};

/**
 * CardFooter Component
 */
const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
  withBorder = true,
}) => {
  const footerClasses = `
    px-6
    py-4
    ${withBorder ? 'border-t border-light-gray-200' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return <div className={footerClasses}>{children}</div>;
};

CardFooter.propTypes = {
  children: PropTypes.any.isRequired,
  className: PropTypes.string,
  withBorder: PropTypes.bool,
};

/**
 * Card Component
 *
 * A reusable card component with optional Header, Body, and Footer sections.
 * Supports multiple elevation levels and hover effects.
 * Inspired by modern design systems with clean spacing and subtle shadows.
 *
 * @example
 * ```tsx
 * // Simple card with header and body
 * <Card elevation="md">
 *   <Card.Header icon={<BookIcon />}>
 *     Título de la Card
 *   </Card.Header>
 *   <Card.Body>
 *     Contenido de la card...
 *   </Card.Body>
 * </Card>
 * ```
 *
 * @example
 * ```tsx
 * // Card with action in header
 * <Card hoverable>
 *   <Card.Header
 *     icon={<UserIcon />}
 *     action={<Button size="sm">Editar</Button>}
 *   >
 *     Usuario
 *   </Card.Header>
 *   <Card.Body>
 *     Información del usuario...
 *   </Card.Body>
 *   <Card.Footer>
 *     <Button variant="primary">Guardar</Button>
 *   </Card.Footer>
 * </Card>
 * ```
 */
const Card: React.FC<CardProps> & {
  Header: typeof CardHeader;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
} = ({ children, elevation = 'sm', className = '', hoverable = false }) => {
  // Base card classes
  const baseClasses = `
    bg-white
    rounded-lg
    border
    border-light-gray-200
    transition-all
    duration-200
  `.replace(/\s+/g, ' ').trim();

  // Elevation classes
  const elevationClasses: Record<CardElevation, string> = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };

  // Hoverable classes
  const hoverClasses = hoverable
    ? 'hover:shadow-lg hover:border-light-gray-300 cursor-pointer'
    : '';

  // Combine all classes
  const cardClasses = `${baseClasses} ${elevationClasses[elevation]} ${hoverClasses} ${className}`;

  return <div className={cardClasses}>{children}</div>;
};

// Attach sub-components
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

// PropTypes for runtime validation
Card.propTypes = {
  children: PropTypes.any.isRequired,
  elevation: PropTypes.oneOf(['none', 'sm', 'md', 'lg']),
  className: PropTypes.string,
  hoverable: PropTypes.bool,
};

export default Card;
