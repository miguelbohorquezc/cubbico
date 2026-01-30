/**
 * @fileoverview Componente SidebarTooltip para modo colapsado
 * @module presentation/components/sidebarV2/components/SidebarTooltip
 *
 * Tooltip ligero que muestra el label del item cuando
 * el sidebar está colapsado. Usa position: fixed para
 * evitar problemas con overflow de contenedores padres.
 *
 * @author Cubbico SIA
 * @version 1.1.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

// ============================================
// Types
// ============================================

export interface SidebarTooltipProps {
  /** Contenido del tooltip */
  content: string;
  /** Elemento hijo que activa el tooltip */
  children: React.ReactNode;
  /** Desactivar el tooltip */
  disabled?: boolean;
  /** Posición del tooltip */
  position?: 'right' | 'bottom';
  /** Delay antes de mostrar (ms) */
  delay?: number;
  /** Clases CSS adicionales */
  className?: string;
}

interface TooltipPosition {
  top: number;
  left: number;
}

// ============================================
// Componente Principal
// ============================================

/**
 * SidebarTooltip - Tooltip para items del sidebar en modo colapsado
 *
 * @param props - Props del componente
 * @returns Componente React
 */
export const SidebarTooltip: React.FC<SidebarTooltipProps> = ({
  content,
  children,
  disabled = false,
  position = 'right',
  delay = 200,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ top: 0, left: 0 });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calcular posición del tooltip basado en el elemento contenedor
  const calculatePosition = useCallback(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const gap = 8; // Espacio entre el elemento y el tooltip

    if (position === 'right') {
      setTooltipPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + gap,
      });
    } else {
      setTooltipPosition({
        top: rect.bottom + gap,
        left: rect.left + rect.width / 2,
      });
    }
  }, [position]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Handlers
  const handleMouseEnter = () => {
    if (disabled) return;

    timeoutRef.current = setTimeout(() => {
      calculatePosition();
      setShouldRender(true);
      // Pequeño delay para permitir animación
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
    // Esperar a que termine la animación antes de desmontar
    setTimeout(() => {
      setShouldRender(false);
    }, 150);
  };

  // Estilos de transformación según posición
  const transformStyles = {
    right: 'translateY(-50%)',
    bottom: 'translateX(-50%)',
  };

  // Tooltip element
  const tooltipElement = shouldRender ? (
    <div
      role="tooltip"
      style={{
        position: 'fixed',
        top: tooltipPosition.top,
        left: tooltipPosition.left,
        transform: transformStyles[position],
        zIndex: 9999,
      }}
      className={`
        px-3 py-2
        text-sm font-medium text-white
        bg-gray-800 rounded-lg
        shadow-xl
        whitespace-nowrap
        pointer-events-none
        transition-opacity duration-150
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}
    >
      {/* Flecha */}
      <span
        className={`
          absolute w-0 h-0 border-[6px]
          ${position === 'right'
            ? 'right-full top-1/2 -translate-y-1/2 border-r-gray-800 border-y-transparent border-l-transparent'
            : 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 border-x-transparent border-t-transparent'
          }
        `}
        aria-hidden="true"
      />

      {/* Contenido */}
      {content}
    </div>
  ) : null;

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Elemento hijo */}
      {children}

      {/* Tooltip renderizado con portal para evitar overflow issues */}
      {tooltipElement && createPortal(tooltipElement, document.body)}
    </div>
  );
};

// ============================================
// Exports
// ============================================

export default SidebarTooltip;
