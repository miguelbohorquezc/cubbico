/**
 * @fileoverview Componente SidebarOverlay para modo móvil
 * @module presentation/components/sidebarV2/components/SidebarOverlay
 *
 * Overlay oscuro que aparece detrás del sidebar en modo drawer (móvil).
 * Click en el overlay cierra el sidebar.
 *
 * @author Cubbico SIA
 * @version 1.0.0
 */

import React, { useEffect } from 'react';

// ============================================
// Types
// ============================================

export interface SidebarOverlayProps {
  /** Indica si el overlay es visible */
  isVisible: boolean;
  /** Handler de click para cerrar */
  onClick: () => void;
  /** Z-index del overlay */
  zIndex?: number;
  /** Clases CSS adicionales */
  className?: string;
}

// ============================================
// Componente Principal
// ============================================

/**
 * SidebarOverlay - Overlay para modo drawer del sidebar
 *
 * @param props - Props del componente
 * @returns Componente React
 */
export const SidebarOverlay: React.FC<SidebarOverlayProps> = ({
  isVisible,
  onClick,
  zIndex = 40,
  className = '',
}) => {
  // Bloquear scroll del body cuando el overlay está visible
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Cleanup al desmontar
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  // Handler de tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        onClick();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible, onClick]);

  // No renderizar si no es visible
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`
        fixed inset-0
        bg-black/50
        backdrop-blur-sm
        transition-opacity duration-300
        ${isVisible ? 'opacity-100' : 'opacity-0'}
        ${className}
      `}
      style={{ zIndex }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
      role="presentation"
      aria-hidden="true"
    />
  );
};

// ============================================
// Exports
// ============================================

export default SidebarOverlay;
