/**
 * @fileoverview Componente principal SidebarV2
 * @module presentation/components/sidebarV2/SidebarV2
 *
 * Sidebar completo del Dashboard que integra:
 * - SidebarBrand (logo y toggle)
 * - SidebarNavItem (items de navegación)
 * - SidebarSubmenu (submenús expandibles)
 * - SidebarActions (settings y logout)
 * - SidebarOverlay (modo móvil)
 *
 * Inspirado en el diseño Academix (ui/ui.webp)
 *
 * @author Cubbico SIA
 * @version 1.0.0
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarBrand } from './components/SidebarBrand';
import { SidebarNavItem } from './components/SidebarNavItem';
import { SidebarSubmenu } from './components/SidebarSubmenu';
import { SidebarActions } from './components/SidebarActions';
import { SidebarOverlay } from './components/SidebarOverlay';
import { SidebarTooltip } from './components/SidebarTooltip';
import { useSidebarV2 } from './hooks/useSidebarV2';
import { navItems, brandConfig } from './config/sidebarNavConfig';
import { MenuIcon } from '../icons/SidebarIcons';
import type { NavItem } from '../../../shared/types/dashboardTypes';

// ============================================
// Types
// ============================================

export interface SidebarV2Props {
  /** Clases CSS adicionales */
  className?: string;
}

// ============================================
// Constantes
// ============================================

const SIDEBAR_WIDTH_EXPANDED = 'w-[280px]';
const SIDEBAR_WIDTH_COLLAPSED = 'w-16';

// ============================================
// Componente Principal
// ============================================

/**
 * SidebarV2 - Sidebar completo del Dashboard
 *
 * @param props - Props del componente
 * @returns Componente React
 */
export const SidebarV2: React.FC<SidebarV2Props> = ({ className = '' }) => {
  const location = useLocation();
  const {
    state,
    toggleCollapse,
    toggleSubmenu,
    open,
    close,
  } = useSidebarV2({ persist: true });

  const { isOpen, isCollapsed, expandedSubmenus, mode } = state;
  const isMobile = mode === 'mobile';

  /**
   * Verifica si un item está activo basado en la ruta actual
   */
  const isItemActive = (item: NavItem): boolean => {
    const currentPath = location.pathname;

    // Verificar ruta directa
    if (item.path && currentPath === item.path) {
      return true;
    }

    // Verificar si la ruta comienza con el path del item
    if (item.path && currentPath.startsWith(item.path + '/')) {
      return true;
    }

    // Verificar submenús
    if (item.submenu) {
      return item.submenu.some(
        (sub) => currentPath === sub.path || currentPath.startsWith(sub.path + '/')
      );
    }

    return false;
  };

  /**
   * Verifica si un subitem está activo
   */
  const isSubItemActive = (path: string): boolean => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Clases del contenedor del sidebar
  const sidebarClasses = `
    fixed top-0 left-0 h-full
    bg-white
    border-r border-gray-200
    flex flex-col
    transition-all duration-300 ease-in-out
    z-50
    ${isMobile
      ? `${isOpen ? 'translate-x-0' : '-translate-x-full'} w-[280px]`
      : `${isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED}`
    }
    ${className}
  `;

  // Renderizar item de navegación
  const renderNavItem = (item: NavItem) => {
    const isActive = isItemActive(item);
    const isExpanded = expandedSubmenus.includes(item.id);
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isCollapsedDesktop = isCollapsed && !isMobile;

    // Componente del item de navegación
    const navItemComponent = (
      <SidebarNavItem
        item={item}
        isActive={isActive}
        isExpanded={isExpanded}
        isCollapsed={isCollapsedDesktop}
        onClick={() => {
          // Si es móvil y no tiene submenú, cerrar el drawer
          if (isMobile && !hasSubmenu) {
            close();
          }
        }}
        onToggleSubmenu={() => toggleSubmenu(item.id)}
      />
    );

    return (
      <div key={item.id}>
        {/* Item con tooltip si está colapsado */}
        {isCollapsedDesktop ? (
          <SidebarTooltip content={item.label} position="right">
            {navItemComponent}
          </SidebarTooltip>
        ) : (
          navItemComponent
        )}

        {/* Submenú (solo visible cuando no está colapsado) */}
        {hasSubmenu && item.submenu && !isCollapsedDesktop && (
          <SidebarSubmenu
            items={item.submenu}
            isExpanded={isExpanded}
            activeItemId={
              item.submenu.find((sub) => isSubItemActive(sub.path))?.id || null
            }
            onItemClick={() => {
              if (isMobile) close();
            }}
            isCollapsed={isCollapsedDesktop}
          />
        )}
      </div>
    );
  };

  return (
    <>
      {/* Overlay para móvil */}
      <SidebarOverlay isVisible={isMobile && isOpen} onClick={close} />

      {/* Sidebar */}
      <aside className={sidebarClasses} aria-label="Menú principal">
        {/* Brand / Header */}
        <SidebarBrand
          config={brandConfig}
          isCollapsed={isCollapsed && !isMobile}
          onToggleCollapse={toggleCollapse}
          showCollapseButton={!isMobile}
        />

        {/* Navegación principal */}
        <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Navegación">
          {/* Título de sección (solo expandido) */}
          {(!isCollapsed || isMobile) && (
            <h2 className="px-4 mb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Menú
            </h2>
          )}

          {/* Items de navegación */}
          <div className="space-y-1">
            {navItems.map(renderNavItem)}
          </div>
        </nav>

        {/* Acciones (Settings, Logout) */}
        <SidebarActions
          isCollapsed={isCollapsed && !isMobile}
          onLogout={() => {
            if (isMobile) close();
          }}
        />
      </aside>

      {/* Botón de menú para móvil */}
      {isMobile && !isOpen && (
        <button
          type="button"
          onClick={open}
          className="
            fixed top-4 left-4 z-40
            p-2 rounded-lg
            bg-white border border-gray-200
            text-gray-600 hover:text-gray-900
            shadow-md hover:shadow-lg
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-gold-500
          "
          aria-label="Abrir menú"
        >
          <MenuIcon size={24} />
        </button>
      )}

      {/* Spacer para el contenido principal (solo desktop) */}
      {!isMobile && (
        <div
          className={`
            flex-shrink-0 transition-all duration-300
            ${isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED}
          `}
          aria-hidden="true"
        />
      )}
    </>
  );
};

// ============================================
// Exports
// ============================================

export default SidebarV2;
