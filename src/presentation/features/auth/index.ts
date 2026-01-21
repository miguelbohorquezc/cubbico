/**
 * Auth Module Exports
 *
 * MT-010a: Migración al nuevo sistema de autenticación
 * - LoginFormTailwind (nuevo) reemplaza a LoginForm (legacy)
 * - useAuth (nuevo) reemplaza a useUserForm (legacy)
 */

// Nuevo sistema de autenticación (MT-006)
export { default as LoginFormTailwind } from './components/LoginFormTailwind';
export { default as Login } from './components/LoginFormTailwind'; // Alias para compatibilidad

// Nuevo hook de autenticación (MT-004)
export { default as useAuth } from './hooks/useAuth';

// Legacy (mantener temporalmente para compatibilidad)
// export { default as LoginForm } from './LoginForm';
// export { default as useUserForm } from './user-form.hook';
