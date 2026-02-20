/**
 * @fileoverview Componente SidebarBrand para el header del sidebar
 * @module presentation/components/sidebarV2/components/SidebarBrand
 *
 * Muestra el logo y nombre de la aplicación con botón de colapso.
 * Inspirado en el diseño Academix.
 *
 * @author Cubbico SIA
 * @version 1.0.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '../../icons/SidebarIcons';
import type { SidebarBrandConfig } from '../../../../shared/types/layoutTypes';
import Logo from '../../../../assets/logo/Logo.svg';

// ============================================
// Types
// ============================================

export interface SidebarBrandProps {
  /** Configuración de la marca */
  config: SidebarBrandConfig;
  /** Indica si el sidebar está colapsado */
  isCollapsed: boolean;
  /** Handler para toggle de colapso */
  onToggleCollapse: () => void;
  /** Mostrar botón de colapso */
  showCollapseButton?: boolean;
  /** Clases CSS adicionales */
  className?: string;
}

// ============================================
// Componente Principal
// ============================================

/**
 * SidebarBrand - Header del sidebar con logo y botón de colapso
 *
 * @param props - Props del componente
 * @returns Componente React
 */
export const SidebarBrand: React.FC<SidebarBrandProps> = ({
  config,
  isCollapsed,
  onToggleCollapse,
  showCollapseButton = true,
  className = '',
}) => {
  const { name, logo: _logo, logoCollapsed: _logoCollapsed, logoAlt, onLogoClick } = config;

  // Ruta por defecto al hacer click en el logo
  const homePath = '/private/dashboard/history';

  return (
    <div
      className={`
        relative flex items-center justify-between
        h-16 px-4
        border-b border-gray-100
        ${className}
      `}
    >
      {/* Logo y nombre */}
      <Link
        to={homePath}
        onClick={onLogoClick}
        className={`
          flex items-center gap-2.5
          transition-all duration-300
          hover:opacity-80
          focus:outline-none focus:ring-2 focus:ring-yellow/30 focus:ring-offset-2
          rounded-lg p-1 -ml-1
          ${isCollapsed ? 'justify-center w-full ml-0' : ''}
        `}
        aria-label={`${name} - Ir al inicio`}
      >
        {/* Logo */}
        <img
          src={Logo}
          alt={logoAlt || name || 'Cubbico Logo'}
          className={`object-contain transition-all duration-300 ${
            isCollapsed ? 'w-8 h-8' : 'w-10 h-10'
          }`}
        />

        {/* Nombre de la aplicación */}
        {!isCollapsed && (
          <span className="font-bold text-lg text-gray-800 tracking-tight">
            {"SIA"}
          </span>
        )}
      </Link>

      {/* Botón de colapso (solo en desktop) */}
      {showCollapseButton && !isCollapsed && (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="
            p-1.5 rounded-md
            text-gray-400 hover:text-gray-600
            hover:bg-gray-100
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-yellow/30
          "
          aria-label="Colapsar menú lateral"
          aria-expanded={true}
        >
          <ChevronLeftIcon size={18} stroke={1.5} />
        </button>
      )}

      {/* Botón de expandir cuando está colapsado */}
      {showCollapseButton && isCollapsed && (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="
            absolute -right-3 top-1/2 -translate-y-1/2
            p-1 rounded-full
            bg-white border border-gray-200
            text-gray-400 hover:text-gray-600
            shadow-sm hover:shadow
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-yellow/30
            z-10
          "
          aria-label="Expandir menú lateral"
          aria-expanded={false}
        >
          <ChevronRightIcon size={14} stroke={2} />
        </button>
      )}
    </div>
  );
};

// ============================================
// Exports
// ============================================

export default SidebarBrand;
