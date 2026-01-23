/**
 * @fileoverview Barrel export para SidebarV2
 * @module presentation/components/sidebarV2
 *
 * Exporta todos los componentes, hooks y configuración del SidebarV2.
 *
 * @example
 * ```tsx
 * import { SidebarV2, useSidebarV2, sidebarConfig } from '@/presentation/components/sidebarV2';
 * ```
 *
 * @author Cubbico SIA
 * @version 1.0.0
 */

// ============================================
// Componente Principal
// ============================================

export { SidebarV2, default } from './SidebarV2';
export type { SidebarV2Props } from './SidebarV2';

// ============================================
// Hooks
// ============================================

export {
  useSidebarV2,
  useActiveNavItem,
  useLayoutMode,
} from './hooks/useSidebarV2';

// ============================================
// Configuración
// ============================================

export {
  sidebarConfig,
  navItems,
  actionItems,
  brandConfig,
  findNavItemById,
  getAllNavPaths,
} from './config/sidebarNavConfig';

// ============================================
// Subcomponentes (para uso avanzado)
// ============================================

export { SidebarBrand } from './components/SidebarBrand';
export type { SidebarBrandProps } from './components/SidebarBrand';

export { SidebarNavItem } from './components/SidebarNavItem';
export type { SidebarNavItemProps } from './components/SidebarNavItem';

export { SidebarSubmenu } from './components/SidebarSubmenu';

export { SidebarActions } from './components/SidebarActions';
export type { SidebarActionsProps } from './components/SidebarActions';

export { SidebarOverlay } from './components/SidebarOverlay';
export type { SidebarOverlayProps } from './components/SidebarOverlay';

export { SidebarTooltip } from './components/SidebarTooltip';
export type { SidebarTooltipProps } from './components/SidebarTooltip';
