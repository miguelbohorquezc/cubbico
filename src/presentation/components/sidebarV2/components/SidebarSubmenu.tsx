/**
 * @fileoverview Componente SidebarSubmenu para submenús expandibles
 * @module presentation/components/sidebarV2/components/SidebarSubmenu
 *
 * Submenú animado del sidebar con:
 * - Animación de expansión/colapso
 * - Items con estados activo/hover
 * - Indentación visual
 *
 * @author Cubbico SIA
 * @version 1.0.0
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { PointIcon } from '../../icons/SidebarIcons';
import type { SidebarSubmenuProps } from '../../../../shared/types/layoutTypes';
import type { SubMenuItem } from '../../../../shared/types/dashboardTypes';

// ============================================
// Types
// ============================================

export interface SubmenuItemProps {
  /** Datos del item */
  item: SubMenuItem;
  /** Indica si está activo */
  isActive: boolean;
  /** Handler de click */
  onClick: () => void;
}

// ============================================
// Subcomponentes
// ============================================

/**
 * Item individual del submenú
 */
const SubmenuItem: React.FC<SubmenuItemProps> = ({ item, isActive, onClick }) => {
  const { label, path, description, badge } = item;

  // Clases base
  const baseClasses = `
    group flex items-center w-full
    pl-11 pr-3 py-2
    text-sm
    rounded-lg mx-2
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-yellow/30 focus:ring-offset-1
  `;

  // Clases según estado
  const stateClasses = isActive
    ? 'text-yellow-cc font-medium'
    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50';

  return (
    <NavLink
      to={path}
      onClick={onClick}
      className={`${baseClasses} ${stateClasses}`}
      role="menuitem"
      aria-current={isActive ? 'page' : undefined}
    >
      {/* Indicador de punto */}
      <span
        className={`
          mr-3 transition-colors duration-200
          ${isActive ? 'text-yellow' : 'text-gray-300 group-hover:text-gray-400'}
        `}
      >
        <PointIcon size={8} fill="currentColor" />
      </span>

      {/* Label */}
      <span className="flex-1 truncate">{label}</span>

      {/* Badge opcional */}
      {badge && (
        <span
          className={`
            ml-2 px-1.5 py-0.5
            text-xs font-medium rounded
            ${isActive ? 'bg-yellow/20 text-black' : 'bg-gray-100 text-gray-600'}
          `}
        >
          {badge.value}
        </span>
      )}
    </NavLink>
  );
};

// ============================================
// Componente Principal
// ============================================

/**
 * SidebarSubmenu - Submenú expandible del sidebar
 *
 * @param props - Props del componente
 * @returns Componente React
 */
export const SidebarSubmenu: React.FC<SidebarSubmenuProps> = ({
  items,
  isExpanded,
  activeItemId,
  onItemClick,
  isCollapsed,
}) => {
  // No renderizar si está colapsado o no hay items
  if (isCollapsed || !items || items.length === 0) {
    return null;
  }

  return (
    <div
      className={`
        overflow-hidden
        transition-all duration-300 ease-in-out
        ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
      `}
      role="menu"
      aria-hidden={!isExpanded}
    >
      <div className="py-1">
        {items.map((item) => (
          <SubmenuItem
            key={item.id}
            item={item}
            isActive={activeItemId === item.id}
            onClick={() => onItemClick(item.id)}
          />
        ))}
      </div>
    </div>
  );
};

// ============================================
// Exports
// ============================================

export default SidebarSubmenu;
