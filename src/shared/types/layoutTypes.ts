/**
 * @fileoverview Tipos e interfaces para el sistema de Layout del Dashboard
 * @module shared/types/layoutTypes
 *
 * Este archivo centraliza los tipos TypeScript para:
 * - Configuración del DashboardLayout
 * - Estado y configuración del Sidebar
 * - Configuración del Header
 * - Breadcrumbs y navegación
 * - Responsive breakpoints
 *
 * @security
 * - No almacenar datos sensibles en el estado del layout
 * - Los items de navegación deben respetar permisos de rol
 * - Validar rutas antes de navegar
 *
 * @author Cubbico SIA
 * @version 1.0.0
 */

import { ReactNode } from 'react';

// Re-exportar tipos relacionados de dashboardTypes para conveniencia
export type {
  DashboardLayoutProps,
  SidebarState,
  SidebarConfig,
  BreadcrumbItem,
  PageTitle,
  HeaderConfig,
  HeaderAction,
  NavItem,
  SubMenuItem,
  NavBadge,
} from './dashboardTypes';

// ============================================
// Tipos Base del Layout
// ============================================

/**
 * Breakpoints responsivos del layout
 * Basados en la configuración de Tailwind CSS
 */
export type LayoutBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

/**
 * Modos de visualización del layout
 */
export type LayoutMode = 'desktop' | 'tablet' | 'mobile';

/**
 * Variantes de ancho para paneles
 */
export type PanelWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

// ============================================
// Configuración del Sidebar
// ============================================

/**
 * Configuración de ancho del Sidebar
 */
export interface SidebarWidthConfig {
  /** Ancho expandido (ej: '280px', '16rem') */
  expanded: string;
  /** Ancho colapsado (ej: '64px', '4rem') */
  collapsed: string;
  /** Ancho en móvil (drawer) */
  mobile: string;
}

/**
 * Configuración de animación del Sidebar
 */
export interface SidebarAnimationConfig {
  /** Duración de la transición en ms */
  duration: number;
  /** Función de easing */
  easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

/**
 * Props para el componente SidebarV2
 */
export interface SidebarV2Props {
  /** Estado actual del sidebar */
  state: SidebarStateExtended;
  /** Handler para toggle de colapso */
  onToggleCollapse: () => void;
  /** Handler para toggle de submenú */
  onToggleSubmenu: (itemId: string) => void;
  /** Handler para seleccionar item */
  onSelectItem: (itemId: string) => void;
  /** Handler para cerrar (móvil) */
  onClose?: () => void;
  /** Configuración de navegación */
  navItems: import('./dashboardTypes').NavItem[];
  /** Items de acciones (settings, logout) */
  actionItems?: import('./dashboardTypes').NavItem[];
  /** Configuración de marca */
  brand?: SidebarBrandConfig;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Estado extendido del Sidebar con información adicional
 */
export interface SidebarStateExtended {
  /** Indica si el sidebar está abierto (móvil) */
  isOpen: boolean;
  /** Indica si el sidebar está colapsado (desktop) */
  isCollapsed: boolean;
  /** ID del item activo */
  activeItem: string | null;
  /** IDs de submenús expandidos */
  expandedSubmenus: string[];
  /** Modo de visualización actual */
  mode: LayoutMode;
  /** Indica si está en transición */
  isTransitioning: boolean;
}

/**
 * Configuración de marca/logo del Sidebar
 */
export interface SidebarBrandConfig {
  /** Nombre de la aplicación */
  name: string;
  /** URL del logo (modo expandido) */
  logo?: string;
  /** URL del logo (modo colapsado) */
  logoCollapsed?: string;
  /** Alt text para el logo */
  logoAlt?: string;
  /** Handler de click en el logo */
  onLogoClick?: () => void;
}

/**
 * Props para items individuales del Sidebar
 */
export interface SidebarItemProps {
  /** Datos del item */
  item: import('./dashboardTypes').NavItem;
  /** Indica si está activo */
  isActive: boolean;
  /** Indica si el submenú está expandido */
  isExpanded?: boolean;
  /** Indica si el sidebar está colapsado */
  isCollapsed: boolean;
  /** Handler de click */
  onClick: () => void;
  /** Handler de toggle submenú */
  onToggleSubmenu?: () => void;
  /** Nivel de anidación (para submenús) */
  level?: number;
}

/**
 * Props para el submenú del Sidebar
 */
export interface SidebarSubmenuProps {
  /** Items del submenú */
  items: import('./dashboardTypes').SubMenuItem[];
  /** Indica si está expandido */
  isExpanded: boolean;
  /** ID del item activo */
  activeItemId: string | null;
  /** Handler de click en item */
  onItemClick: (itemId: string) => void;
  /** Indica si el sidebar está colapsado */
  isCollapsed: boolean;
}

// ============================================
// Configuración del Header
// ============================================

/**
 * Props para el componente HeaderV2
 */
export interface HeaderV2Props {
  /** Título de la página */
  title: string;
  /** Subtítulo opcional */
  subtitle?: string;
  /** Mostrar fecha actual */
  showDate?: boolean;
  /** Breadcrumbs de navegación */
  breadcrumbs?: import('./dashboardTypes').BreadcrumbItem[];
  /** Mostrar barra de búsqueda */
  showSearch?: boolean;
  /** Placeholder de búsqueda */
  searchPlaceholder?: string;
  /** Handler de búsqueda */
  onSearch?: (query: string) => void;
  /** Acciones del header (botones, iconos) */
  actions?: import('./dashboardTypes').HeaderAction[];
  /** Datos del usuario actual */
  user?: HeaderUserInfo;
  /** Handler de logout */
  onLogout?: () => void;
  /** Indica si el sidebar está colapsado (para ajustar posición) */
  isSidebarCollapsed?: boolean;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Información del usuario para el Header
 * @security No incluir datos sensibles como tokens o contraseñas
 */
export interface HeaderUserInfo {
  /** Nombre para mostrar */
  displayName: string;
  /** Email del usuario */
  email: string;
  /** URL del avatar (opcional) */
  avatarUrl?: string;
  /** Rol del usuario */
  role?: string;
}

/**
 * Props para la barra de búsqueda
 */
export interface SearchBarProps {
  /** Placeholder del input */
  placeholder?: string;
  /** Valor actual */
  value?: string;
  /** Handler de cambio */
  onChange?: (value: string) => void;
  /** Handler de submit */
  onSubmit?: (value: string) => void;
  /** Handler de limpiar */
  onClear?: () => void;
  /** Indica si está cargando */
  isLoading?: boolean;
  /** Clases CSS adicionales */
  className?: string;
  /** Tamaño del componente */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Props para el menú de usuario
 */
export interface UserMenuProps {
  /** Información del usuario */
  user: HeaderUserInfo;
  /** Indica si el menú está abierto */
  isOpen: boolean;
  /** Handler de toggle */
  onToggle: () => void;
  /** Handler de logout */
  onLogout: () => void;
  /** Items adicionales del menú */
  menuItems?: UserMenuItem[];
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Item del menú de usuario
 */
export interface UserMenuItem {
  /** ID único */
  id: string;
  /** Texto a mostrar */
  label: string;
  /** Icono opcional */
  icon?: ReactNode;
  /** Handler de click */
  onClick: () => void;
  /** Indica si es un separador */
  divider?: boolean;
  /** Indica si está deshabilitado */
  disabled?: boolean;
  /** Variante de estilo */
  variant?: 'default' | 'danger';
}

// ============================================
// Configuración del Layout Principal
// ============================================

/**
 * Configuración completa del DashboardLayout
 */
export interface DashboardLayoutConfig {
  /** Configuración del sidebar */
  sidebar: {
    /** Ancho del sidebar */
    width: SidebarWidthConfig;
    /** Animación */
    animation: SidebarAnimationConfig;
    /** Breakpoint para colapsar automáticamente */
    collapseBreakpoint: LayoutBreakpoint;
    /** Breakpoint para modo drawer (móvil) */
    drawerBreakpoint: LayoutBreakpoint;
  };
  /** Configuración del header */
  header: {
    /** Altura del header */
    height: string;
    /** Fijo en la parte superior */
    sticky: boolean;
  };
  /** Configuración del panel derecho */
  rightPanel: {
    /** Ancho por defecto */
    defaultWidth: PanelWidth;
    /** Breakpoint para ocultar */
    hideBreakpoint: LayoutBreakpoint;
  };
  /** Padding del contenido principal */
  contentPadding: {
    x: string;
    y: string;
  };
}

/**
 * Props extendidas para DashboardLayout
 */
export interface DashboardLayoutPropsExtended {
  /** Contenido principal de la página */
  children: ReactNode;
  /** Título de la página */
  title?: string;
  /** Subtítulo de la página */
  subtitle?: string;
  /** Mostrar panel lateral derecho */
  showRightPanel?: boolean;
  /** Contenido del panel derecho */
  rightPanelContent?: ReactNode;
  /** Ancho del panel derecho */
  rightPanelWidth?: PanelWidth;
  /** Breadcrumbs personalizados */
  breadcrumbs?: import('./dashboardTypes').BreadcrumbItem[];
  /** Acciones del header */
  headerActions?: import('./dashboardTypes').HeaderAction[];
  /** Clases CSS adicionales para el contenido */
  contentClassName?: string;
  /** Indica si la página está cargando */
  isLoading?: boolean;
  /** Contenido a mostrar mientras carga */
  loadingContent?: ReactNode;
  /** Configuración personalizada del layout */
  config?: Partial<DashboardLayoutConfig>;
  /** Callback cuando cambia el estado del sidebar */
  onSidebarStateChange?: (state: SidebarStateExtended) => void;
}

// ============================================
// Estado y Hooks del Layout
// ============================================

/**
 * Estado del hook useLayoutState
 */
export interface LayoutState {
  /** Estado del sidebar */
  sidebar: SidebarStateExtended;
  /** Modo actual del layout */
  mode: LayoutMode;
  /** Breakpoint actual */
  currentBreakpoint: LayoutBreakpoint;
  /** Indica si el layout está inicializado */
  isInitialized: boolean;
}

/**
 * Acciones del hook useLayoutState
 */
export interface LayoutActions {
  /** Toggle colapso del sidebar */
  toggleSidebarCollapse: () => void;
  /** Abrir/cerrar sidebar (móvil) */
  toggleSidebarOpen: () => void;
  /** Toggle submenú */
  toggleSubmenu: (itemId: string) => void;
  /** Establecer item activo */
  setActiveItem: (itemId: string | null) => void;
  /** Restablecer estado del layout */
  resetLayout: () => void;
}

/**
 * Retorno del hook useLayoutState
 */
export interface UseLayoutStateReturn {
  /** Estado actual */
  state: LayoutState;
  /** Acciones disponibles */
  actions: LayoutActions;
}

/**
 * Opciones para el hook useSidebarV2
 */
export interface UseSidebarOptions {
  /** Estado inicial colapsado */
  initialCollapsed?: boolean;
  /** Persistir estado en localStorage */
  persist?: boolean;
  /** Key para localStorage */
  storageKey?: string;
  /** Callback cuando cambia el estado */
  onStateChange?: (state: SidebarStateExtended) => void;
}

/**
 * Retorno del hook useSidebarV2
 */
export interface UseSidebarReturn {
  /** Estado actual */
  state: SidebarStateExtended;
  /** Toggle colapso */
  toggleCollapse: () => void;
  /** Toggle submenú */
  toggleSubmenu: (itemId: string) => void;
  /** Establecer item activo */
  setActiveItem: (itemId: string | null) => void;
  /** Abrir sidebar (móvil) */
  open: () => void;
  /** Cerrar sidebar (móvil) */
  close: () => void;
}

// ============================================
// Utilidades de Layout
// ============================================

/**
 * Mapa de breakpoints a píxeles
 * Basado en configuración de Tailwind CSS
 */
export const BREAKPOINTS: Record<LayoutBreakpoint, number> = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  '3xl': 1920,
};

/**
 * Configuración por defecto del layout
 */
export const DEFAULT_LAYOUT_CONFIG: DashboardLayoutConfig = {
  sidebar: {
    width: {
      expanded: '280px',
      collapsed: '64px',
      mobile: '280px',
    },
    animation: {
      duration: 300,
      easing: 'ease-in-out',
    },
    collapseBreakpoint: 'lg',
    drawerBreakpoint: 'md',
  },
  header: {
    height: '64px',
    sticky: true,
  },
  rightPanel: {
    defaultWidth: 'md',
    hideBreakpoint: 'xl',
  },
  contentPadding: {
    x: '1.5rem',
    y: '1.5rem',
  },
};

/**
 * Obtiene el modo de layout basado en el ancho de ventana
 * @param windowWidth - Ancho de la ventana en píxeles
 * @returns Modo de layout correspondiente
 */
export const getLayoutMode = (windowWidth: number): LayoutMode => {
  if (windowWidth < BREAKPOINTS.md) {
    return 'mobile';
  }
  if (windowWidth < BREAKPOINTS.lg) {
    return 'tablet';
  }
  return 'desktop';
};

/**
 * Obtiene el breakpoint actual basado en el ancho de ventana
 * @param windowWidth - Ancho de la ventana en píxeles
 * @returns Breakpoint correspondiente
 */
export const getCurrentBreakpoint = (windowWidth: number): LayoutBreakpoint => {
  if (windowWidth >= BREAKPOINTS['3xl']) return '3xl';
  if (windowWidth >= BREAKPOINTS['2xl']) return '2xl';
  if (windowWidth >= BREAKPOINTS.xl) return 'xl';
  if (windowWidth >= BREAKPOINTS.lg) return 'lg';
  if (windowWidth >= BREAKPOINTS.md) return 'md';
  if (windowWidth >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
};

/**
 * Verifica si el sidebar debe estar colapsado según el breakpoint
 * @param breakpoint - Breakpoint actual
 * @param config - Configuración del layout
 * @returns true si debe estar colapsado
 */
export const shouldCollapseAtBreakpoint = (
  breakpoint: LayoutBreakpoint,
  config: DashboardLayoutConfig = DEFAULT_LAYOUT_CONFIG
): boolean => {
  const breakpointOrder: LayoutBreakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
  const currentIndex = breakpointOrder.indexOf(breakpoint);
  const collapseIndex = breakpointOrder.indexOf(config.sidebar.collapseBreakpoint);
  return currentIndex < collapseIndex;
};

/**
 * Verifica si debe mostrar el sidebar como drawer (móvil)
 * @param breakpoint - Breakpoint actual
 * @param config - Configuración del layout
 * @returns true si debe ser drawer
 */
export const shouldUseDrawer = (
  breakpoint: LayoutBreakpoint,
  config: DashboardLayoutConfig = DEFAULT_LAYOUT_CONFIG
): boolean => {
  const breakpointOrder: LayoutBreakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
  const currentIndex = breakpointOrder.indexOf(breakpoint);
  const drawerIndex = breakpointOrder.indexOf(config.sidebar.drawerBreakpoint);
  return currentIndex < drawerIndex;
};
