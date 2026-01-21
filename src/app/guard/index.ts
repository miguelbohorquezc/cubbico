/**
 * Auth Guards
 *
 * Barrel export for authentication guards.
 *
 * MT-010b: Migración al nuevo sistema de autenticación
 * - AuthGuardV2 (nuevo) con mejoras de UX y manejo de estados
 * - AuthGuard (legacy) mantenido temporalmente para compatibilidad
 *
 * @module guard
 */

// Nuevo AuthGuard mejorado (MT-009)
export { AuthGuardV2, default as AuthGuard } from './AuthGuard.v2';
export type { UserRole } from './AuthGuard.v2';

// Legacy (mantener temporalmente para compatibilidad)
// export { default as AuthGuardLegacy } from './auth.guard';
