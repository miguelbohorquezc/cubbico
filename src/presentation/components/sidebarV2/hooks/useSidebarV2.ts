/**
 * @fileoverview Hook para gestión de estado del SidebarV2
 * @module presentation/components/sidebarV2/hooks/useSidebarV2
 *
 * Proporciona estado y acciones para el sidebar con:
 * - Detección de ruta activa
 * - Persistencia en localStorage
 * - Responsive (detecta breakpoints)
 * - Manejo de submenús
 *
 * @author Cubbico SIA
 * @version 1.0.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import type {
  UseSidebarOptions,
  UseSidebarReturn,
  SidebarStateExtended,
  LayoutMode,
} from '../../../../shared/types/layoutTypes';
import {
  getLayoutMode,
  getCurrentBreakpoint,
  BREAKPOINTS,
} from '../../../../shared/types/layoutTypes';

// ============================================
// Constantes
// ============================================

const STORAGE_KEY_DEFAULT = 'cubbico-sidebar-collapsed';
const DEBOUNCE_DELAY = 150;

// ============================================
// Utilidades
// ============================================

/**
 * Lee un valor booleano de localStorage de forma segura
 */
const getStoredCollapsed = (key: string): boolean | null => {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return null;
    return stored === 'true';
  } catch {
    // localStorage no disponible (SSR, privado, etc.)
    return null;
  }
};

/**
 * Guarda un valor booleano en localStorage de forma segura
 */
const setStoredCollapsed = (key: string, value: boolean): void => {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // Silenciar errores de localStorage
  }
};

/**
 * Encuentra el item activo basado en la ruta actual
 */
const findActiveItemFromPath = (
  pathname: string,
  navItems: Array<{ id: string; path: string | null; submenu?: Array<{ id: string; path: string }> }>
): string | null => {
  // Buscar coincidencia exacta primero
  for (const item of navItems) {
    if (item.path && pathname === item.path) {
      return item.id;
    }
    // Buscar en submenús
    if (item.submenu) {
      for (const subItem of item.submenu) {
        if (pathname === subItem.path || pathname.startsWith(subItem.path + '/')) {
          return item.id;
        }
      }
    }
  }

  // Buscar coincidencia parcial (ruta comienza con path del item)
  for (const item of navItems) {
    if (item.path && pathname.startsWith(item.path)) {
      return item.id;
    }
  }

  return null;
};

// ============================================
// Hook Principal
// ============================================

/**
 * Hook para gestionar el estado del SidebarV2
 *
 * @param options - Opciones de configuración
 * @returns Estado y acciones del sidebar
 *
 * @example
 * ```tsx
 * const { state, toggleCollapse, toggleSubmenu } = useSidebarV2({
 *   persist: true,
 *   initialCollapsed: false,
 * });
 * ```
 */
export const useSidebarV2 = (options: UseSidebarOptions = {}): UseSidebarReturn => {
  const {
    initialCollapsed = false,
    persist = true,
    storageKey = STORAGE_KEY_DEFAULT,
    onStateChange,
  } = options;

  const location = useLocation();

  // ============================================
  // Estado inicial
  // ============================================

  const getInitialState = useCallback((): SidebarStateExtended => {
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const mode = getLayoutMode(windowWidth);

    // En móvil, siempre cerrado inicialmente
    // En desktop, usar valor persistido o inicial
    let isCollapsed = initialCollapsed;
    if (persist && mode === 'desktop') {
      const stored = getStoredCollapsed(storageKey);
      if (stored !== null) {
        isCollapsed = stored;
      }
    }

    return {
      isOpen: false, // Drawer cerrado por defecto
      isCollapsed: mode === 'mobile' ? false : isCollapsed,
      activeItem: null,
      expandedSubmenus: [],
      mode,
      isTransitioning: false,
    };
  }, [initialCollapsed, persist, storageKey]);

  const [state, setState] = useState<SidebarStateExtended>(getInitialState);

  // ============================================
  // Efectos
  // ============================================

  // Detectar cambios de tamaño de ventana
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const windowWidth = window.innerWidth;
        const newMode = getLayoutMode(windowWidth);

        setState((prev) => {
          if (prev.mode === newMode) return prev;

          // Al cambiar a móvil, cerrar el drawer
          // Al cambiar a desktop, restaurar estado colapsado
          const newState: SidebarStateExtended = {
            ...prev,
            mode: newMode,
            isOpen: newMode === 'mobile' ? false : prev.isOpen,
            isCollapsed: newMode === 'mobile' ? false : prev.isCollapsed,
          };

          return newState;
        });
      }, DEBOUNCE_DELAY);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Notificar cambios de estado
  useEffect(() => {
    if (onStateChange) {
      onStateChange(state);
    }
  }, [state, onStateChange]);

  // Persistir estado colapsado
  useEffect(() => {
    if (persist && state.mode === 'desktop') {
      setStoredCollapsed(storageKey, state.isCollapsed);
    }
  }, [state.isCollapsed, state.mode, persist, storageKey]);

  // Cerrar drawer al cambiar de ruta (móvil)
  useEffect(() => {
    if (state.mode === 'mobile' && state.isOpen) {
      setState((prev) => ({ ...prev, isOpen: false }));
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================
  // Acciones
  // ============================================

  /**
   * Toggle del estado colapsado (desktop)
   */
  const toggleCollapse = useCallback(() => {
    setState((prev) => {
      if (prev.mode === 'mobile') return prev;

      const newCollapsed = !prev.isCollapsed;

      return {
        ...prev,
        isCollapsed: newCollapsed,
        isTransitioning: true,
        // Cerrar submenús al colapsar
        expandedSubmenus: newCollapsed ? [] : prev.expandedSubmenus,
      };
    });

    // Resetear transición después de la animación
    setTimeout(() => {
      setState((prev) => ({ ...prev, isTransitioning: false }));
    }, 300);
  }, []);

  /**
   * Toggle de un submenú específico
   * Al abrir uno, cierra los demás (comportamiento acordeón)
   */
  const toggleSubmenu = useCallback((itemId: string) => {
    setState((prev) => {
      // No permitir submenús en modo colapsado
      if (prev.isCollapsed) return prev;

      const isExpanded = prev.expandedSubmenus.includes(itemId);

      // Si está expandido, lo cerramos. Si no, lo abrimos y cerramos los demás
      const expandedSubmenus = isExpanded ? [] : [itemId];

      return {
        ...prev,
        expandedSubmenus,
      };
    });
  }, []);

  /**
   * Establecer item activo manualmente
   */
  const setActiveItem = useCallback((itemId: string | null) => {
    setState((prev) => ({
      ...prev,
      activeItem: itemId,
    }));
  }, []);

  /**
   * Abrir drawer (móvil)
   */
  const open = useCallback(() => {
    setState((prev) => {
      if (prev.mode !== 'mobile') return prev;
      return { ...prev, isOpen: true };
    });
  }, []);

  /**
   * Cerrar drawer (móvil)
   */
  const close = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  // ============================================
  // Return
  // ============================================

  return useMemo(
    () => ({
      state,
      toggleCollapse,
      toggleSubmenu,
      setActiveItem,
      open,
      close,
    }),
    [state, toggleCollapse, toggleSubmenu, setActiveItem, open, close]
  );
};

// ============================================
// Exports
// ============================================

export default useSidebarV2;

/**
 * Hook auxiliar para detectar el item activo basado en la ruta
 * Útil cuando se tiene la configuración de navegación disponible
 */
export const useActiveNavItem = (
  navItems: Array<{ id: string; path: string | null; submenu?: Array<{ id: string; path: string }> }>
): string | null => {
  const location = useLocation();

  return useMemo(
    () => findActiveItemFromPath(location.pathname, navItems),
    [location.pathname, navItems]
  );
};

/**
 * Hook para detectar el modo de layout actual
 */
export const useLayoutMode = (): LayoutMode => {
  const [mode, setMode] = useState<LayoutMode>(() => {
    if (typeof window === 'undefined') return 'desktop';
    return getLayoutMode(window.innerWidth);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setMode(getLayoutMode(window.innerWidth));
      }, DEBOUNCE_DELAY);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return mode;
};
