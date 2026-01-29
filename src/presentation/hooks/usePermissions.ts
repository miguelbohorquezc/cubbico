/**
 * @fileoverview Hook para verificación de permisos en componentes React
 * @module presentation/hooks/usePermissions
 *
 * Proporciona acceso fácil al sistema de permisos desde cualquier componente.
 * Utiliza el usuario del store de Redux para verificaciones sincrónicas.
 */

import { useMemo } from 'react';
import { useAppSelector } from '../../app/store/store';
import { isCoordinatorRole, hasPermissionForAction, UserRole } from '../../infrastructure/permission.service';

// ============================================
// Tipos
// ============================================

export interface UsePermissionsReturn {
  /** Rol actual del usuario */
  role: UserRole | undefined;
  /** Si el usuario es coordinador */
  isCoordinator: boolean;
  /** Si el usuario está autenticado */
  isAuthenticated: boolean;
  /** UID del usuario actual */
  userUid: string | undefined;
  /** Permisos específicos */
  permissions: {
    canViewAllReports: boolean;
    canEditAllReports: boolean;
    canManageUsers: boolean;
    canManageClassrooms: boolean;
    canManageAreas: boolean;
  };
  /** Función helper para verificar permisos */
  hasPermission: (action: 'viewAllReports' | 'editAllReports' | 'manageUsers' | 'manageClassrooms' | 'manageAreas') => boolean;
  /** Verifica si el usuario puede ver un item con roles específicos */
  canAccessWithRoles: (allowedRoles?: UserRole[]) => boolean;
}

// ============================================
// Hook
// ============================================

/**
 * Hook para acceder a los permisos del usuario actual
 *
 * @returns UsePermissionsReturn - Objeto con permisos y funciones helper
 *
 * @example
 * const { isCoordinator, permissions } = usePermissions();
 *
 * if (isCoordinator) {
 *   // Mostrar opciones de coordinador
 * }
 *
 * if (permissions.canViewAllReports) {
 *   // Mostrar todos los reportes
 * }
 */
export const usePermissions = (): UsePermissionsReturn => {
  // Obtener usuario del store
  const user = useAppSelector((state) => state.user);

  // Extraer datos relevantes
  const userUid = user?.uid || user?.id;
  const userRole = (user as { role?: string })?.role as UserRole | undefined;
  const isAuthenticated = Boolean(userUid);
  const isCoordinator = isCoordinatorRole(userRole);

  // Calcular permisos (memoizado para evitar recálculos innecesarios)
  const permissions = useMemo(() => ({
    canViewAllReports: hasPermissionForAction(userRole, 'viewAllReports'),
    canEditAllReports: hasPermissionForAction(userRole, 'editAllReports'),
    canManageUsers: hasPermissionForAction(userRole, 'manageUsers'),
    canManageClassrooms: hasPermissionForAction(userRole, 'manageClassrooms'),
    canManageAreas: hasPermissionForAction(userRole, 'manageAreas'),
  }), [userRole]);

  // Función helper para verificar permisos
  const hasPermission = (action: 'viewAllReports' | 'editAllReports' | 'manageUsers' | 'manageClassrooms' | 'manageAreas'): boolean => {
    return hasPermissionForAction(userRole, action);
  };

  // Función para verificar acceso basado en roles permitidos
  const canAccessWithRoles = (allowedRoles?: UserRole[]): boolean => {
    // Si no hay restricción de roles, permitir acceso
    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }

    // Verificar si el rol del usuario está en la lista de permitidos
    if (!userRole) return false;
    return allowedRoles.includes(userRole);
  };

  return {
    role: userRole,
    isCoordinator,
    isAuthenticated,
    userUid,
    permissions,
    hasPermission,
    canAccessWithRoles,
  };
};

export default usePermissions;
