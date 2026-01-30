/**
 * @fileoverview Componente SidebarNavItem para items de navegación
 * @module presentation/components/sidebarV2/components/SidebarNavItem
 *
 * Item individual del sidebar con soporte para:
 * - Estados: normal, hover, activo
 * - Submenús expandibles
 * - Badges de notificación
 * - Modo colapsado
 *
 * Inspirado en el diseño Academix.
 *
 * @author Cubbico SIA
 * @version 1.0.0
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDownIcon, ChevronRightIcon } from '../../icons/SidebarIcons';
import type { SidebarItemProps } from '../../../../shared/types/layoutTypes';
import type { NavItem, NavBadge } from '../../../../shared/types/dashboardTypes';

// ============================================
// Types
// ============================================

export interface SidebarNavItemProps extends Omit<SidebarItemProps, 'item'> {
  /** Datos del item de navegación */
  item: NavItem;
  /** Tooltip para modo colapsado */
  tooltip?: React.ReactNode;
}

// ============================================
// Subcomponentes
// ============================================

/**
 * Badge de notificación
 */
const ItemBadge: React.FC<{ badge: NavBadge }> = ({ badge }) => {
  const colorClasses: Record<string, string> = {
    primary: 'bg-deep-blue-500 text-white',
    secondary: 'bg-medium-blue-500 text-white',
    accent: 'bg-gold-500 text-deep-blue-900',
    success: 'bg-green-500 text-white',
    warning: 'bg-orange-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-sky-500 text-white',
    neutral: 'bg-gray-500 text-white',
  };

  const bgClass = colorClasses[badge.color || 'accent'] || colorClasses.accent;

  return (
    <span
      className={`
        inline-flex items-center justify-center
        min-w-[20px] h-5 px-1.5
        text-xs font-semibold
        rounded-full
        ${bgClass}
      `}
    >
      {badge.value}
    </span>
  );
};

/**
 * Icono del item
 */
const ItemIcon: React.FC<{
  icon: NavItem['icon'];
  isActive: boolean;
  isCollapsed: boolean;
}> = ({ icon: Icon, isActive, isCollapsed }) => {
  if (!Icon) return null;

  return (
    <span
      className={`
        flex-shrink-0 flex items-center justify-center
        transition-colors duration-200
        ${isActive ? 'text-amber-500' : 'text-gray-600 group-hover:text-gray-700'}
        ${isCollapsed ? '' : 'mr-3'}
      `}
    >
      <Icon size={22} />
    </span>
  );
};

// ============================================
// Componente Principal
// ============================================

/**
 * SidebarNavItem - Item de navegación del sidebar
 *
 * @param props - Props del componente
 * @returns Componente React
 */
export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  item,
  isActive,
  isExpanded = false,
  isCollapsed,
  onClick,
  onToggleSubmenu,
  level = 0,
}) => {
  const { id, label, path, icon, badge, submenu, disabled } = item;
  const hasSubmenu = submenu && submenu.length > 0;

  // Clases base del item
  const baseClasses = `
    group flex items-center
    h-11 px-4
    rounded-lg
    text-sm font-medium
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1
  `;

  // Clases según estado
  const stateClasses = isActive
    ? 'bg-amber-50 text-amber-600'
    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900';

  // Clases para modo colapsado
  const collapsedClasses = isCollapsed
    ? 'justify-center w-10 h-10 px-0 mx-auto'
    : 'w-full';

  // Clases para disabled
  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed pointer-events-none'
    : 'cursor-pointer';

  // Clases combinadas
  const itemClasses = `
    ${baseClasses}
    ${stateClasses}
    ${collapsedClasses}
    ${disabledClasses}
  `;

  // Handler de click
  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }

    if (hasSubmenu && onToggleSubmenu) {
      e.preventDefault();
      onToggleSubmenu();
    } else {
      onClick();
    }
  };

  // Contenido del item
  const itemContent = (
    <>
      {/* Icono */}
      <ItemIcon icon={icon} isActive={isActive} isCollapsed={isCollapsed} />

      {/* Label (oculto en modo colapsado) */}
      {!isCollapsed && (
        <span className="flex-1 text-left truncate">{label}</span>
      )}

      {/* Badge (oculto en modo colapsado) */}
      {!isCollapsed && badge && (
        <ItemBadge badge={badge} />
      )}

      {/* Chevron para submenú (oculto en modo colapsado) */}
      {!isCollapsed && hasSubmenu && (
        <span
          className={`
            flex-shrink-0 transition-transform duration-300 ease-out
            ${isExpanded ? 'rotate-180' : 'rotate-0'}
            ${isActive ? 'text-amber-500' : 'text-gray-400 group-hover:text-gray-600'}
          `}
        >
          <ChevronDownIcon size={18} />
        </span>
      )}

      {/* Flecha indicadora de activo (estilo Cubbico) */}
      {!isCollapsed && isActive && !hasSubmenu && (
        <span className="flex-shrink-0 text-amber-500">
          <ChevronRightIcon size={18} />
        </span>
      )}
    </>
  );

  // Si tiene path y no tiene submenú, usar NavLink
  if (path && !hasSubmenu) {
    return (
      <NavLink
        to={path}
        onClick={handleClick}
        className={itemClasses}
        aria-current={isActive ? 'page' : undefined}
        aria-disabled={disabled}
        title={isCollapsed ? label : undefined}
      >
        {itemContent}
      </NavLink>
    );
  }

  // Si tiene submenú o no tiene path, usar button
  return (
    <button
      type="button"
      onClick={handleClick}
      className={itemClasses}
      aria-expanded={hasSubmenu ? isExpanded : undefined}
      aria-haspopup={hasSubmenu ? 'menu' : undefined}
      aria-disabled={disabled}
      title={isCollapsed ? label : undefined}
    >
      {itemContent}
    </button>
  );
};

// ============================================
// Exports
// ============================================

export default SidebarNavItem;
