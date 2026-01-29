/**
 * @fileoverview Servicio de permisos para control de acceso
 * @module infrastructure/permission.service
 *
 * Centraliza la lógica de verificación de permisos basada en roles.
 * Los coordinadores tienen acceso completo a todos los reportes.
 * Los docentes solo pueden ver reportes de sus estudiantes asignados.
 */

import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase/firebase";

// ============================================
// Tipos
// ============================================

export type UserRole = 'Coordinador' | 'Docente';

export interface UserPermissions {
  role: UserRole;
  isCoordinator: boolean;
  canViewAllReports: boolean;
  canEditAllReports: boolean;
  canManageUsers: boolean;
  canManageClassrooms: boolean;
  canManageAreas: boolean;
  assignedClassrooms: string[];
  assignedAreas: string[];
}

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}

// ============================================
// Constantes de Permisos por Rol
// ============================================

const COORDINATOR_PERMISSIONS: Omit<UserPermissions, 'role' | 'assignedClassrooms' | 'assignedAreas'> = {
  isCoordinator: true,
  canViewAllReports: true,
  canEditAllReports: true,
  canManageUsers: true,
  canManageClassrooms: true,
  canManageAreas: true,
};

const TEACHER_PERMISSIONS: Omit<UserPermissions, 'role' | 'assignedClassrooms' | 'assignedAreas'> = {
  isCoordinator: false,
  canViewAllReports: false,
  canEditAllReports: false,
  canManageUsers: false,
  canManageClassrooms: false,
  canManageAreas: false,
};

// ============================================
// Funciones del Servicio
// ============================================

/**
 * Obtiene los permisos completos de un usuario por su UID
 *
 * @param uid - UID del usuario (Firebase Auth)
 * @returns Promise<UserPermissions | null> - Permisos del usuario o null si no existe
 */
export const getUserPermissions = async (uid: string): Promise<UserPermissions | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));

    if (!userDoc.exists()) {
      return null;
    }

    const data = userDoc.data();
    const role = (data.role as UserRole) || 'Docente';
    const isCoordinator = role === 'Coordinador';

    // Obtener salones y áreas asignadas
    const assignedClassrooms = data.salones
      ? Object.keys(data.salones).filter(key => data.salones[key] === true)
      : [];

    const assignedAreas = data.areas
      ? Object.keys(data.areas).filter(key => data.areas[key] === true)
      : [];

    // Combinar permisos base con asignaciones
    const basePermissions = isCoordinator ? COORDINATOR_PERMISSIONS : TEACHER_PERMISSIONS;

    return {
      role,
      ...basePermissions,
      assignedClassrooms,
      assignedAreas,
    };
  } catch (error) {
    console.error("Error al obtener permisos del usuario:", error);
    return null;
  }
};

/**
 * Verifica si un usuario puede ver el reporte de un estudiante específico
 *
 * @param userUid - UID del usuario que intenta ver el reporte
 * @param studentClassroomId - ID del salón del estudiante
 * @returns Promise<PermissionCheckResult>
 */
export const canViewStudentReport = async (
  userUid: string,
  studentClassroomId: string
): Promise<PermissionCheckResult> => {
  const permissions = await getUserPermissions(userUid);

  if (!permissions) {
    return {
      allowed: false,
      reason: 'Usuario no encontrado en el sistema',
    };
  }

  // Los coordinadores pueden ver todos los reportes
  if (permissions.canViewAllReports) {
    return { allowed: true };
  }

  // Los docentes solo pueden ver reportes de sus salones asignados
  if (permissions.assignedClassrooms.includes(studentClassroomId)) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: 'No tienes permiso para ver este reporte. Contacta al coordinador.',
  };
};

/**
 * Verifica si un usuario es coordinador
 *
 * @param uid - UID del usuario
 * @returns Promise<boolean>
 */
export const isUserCoordinator = async (uid: string): Promise<boolean> => {
  const permissions = await getUserPermissions(uid);
  return permissions?.isCoordinator ?? false;
};

/**
 * Verifica si un usuario puede acceder a una ruta específica
 *
 * @param userUid - UID del usuario
 * @param requiredRole - Rol requerido para la ruta
 * @returns Promise<PermissionCheckResult>
 */
export const canAccessRoute = async (
  userUid: string,
  requiredRole: UserRole | UserRole[]
): Promise<PermissionCheckResult> => {
  const permissions = await getUserPermissions(userUid);

  if (!permissions) {
    return {
      allowed: false,
      reason: 'Usuario no autenticado',
    };
  }

  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  if (allowedRoles.includes(permissions.role)) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `Se requiere rol de ${allowedRoles.join(' o ')} para acceder`,
  };
};

/**
 * Verifica rápidamente el rol del usuario desde el store de Redux
 * (Para uso sincrónico cuando ya tenemos los datos del usuario)
 *
 * @param userRole - Rol del usuario desde el store
 * @returns boolean
 */
export const isCoordinatorRole = (userRole: string | undefined): boolean => {
  return userRole === 'Coordinador';
};

/**
 * Verifica si un rol tiene permisos para una acción específica
 *
 * @param userRole - Rol del usuario
 * @param action - Acción a verificar
 * @returns boolean
 */
export const hasPermissionForAction = (
  userRole: string | undefined,
  action: 'viewAllReports' | 'editAllReports' | 'manageUsers' | 'manageClassrooms' | 'manageAreas'
): boolean => {
  if (!userRole) return false;

  const isCoordinator = userRole === 'Coordinador';

  switch (action) {
    case 'viewAllReports':
    case 'editAllReports':
    case 'manageUsers':
    case 'manageClassrooms':
    case 'manageAreas':
      return isCoordinator;
    default:
      return false;
  }
};
