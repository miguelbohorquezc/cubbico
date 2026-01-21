/**
 * Tipos y interfaces centralizadas para el módulo de autenticación
 * 
 * Este archivo contiene definiciones de tipos limpias y específicas para el flujo de autenticación,
 * separando las responsabilidades entre formularios, errores, usuario autenticado y estado de Redux.
 * 
 * @module auth.types
 */

/**
 * Datos del formulario de inicio de sesión
 * 
 * @interface AuthFormData
 * @property {string} email - Correo electrónico del usuario
 * @property {string} password - Contraseña del usuario
 */
export interface AuthFormData {
  email: string;
  password: string;
}

/**
 * Errores de validación del formulario de autenticación
 * 
 * @interface AuthErrors
 * @property {string} [email] - Error de validación del campo email
 * @property {string} [password] - Error de validación del campo password
 * @property {string} [general] - Error general de autenticación (ej: credenciales inválidas)
 */
export interface AuthErrors {
  email?: string;
  password?: string;
  general?: string;
}

/**
 * Códigos de error de Firebase Authentication
 * 
 * @typedef {string} AuthErrorCode
 * 
 * Códigos comunes:
 * - `auth/invalid-email` - Email mal formateado
 * - `auth/user-disabled` - Usuario deshabilitado
 * - `auth/user-not-found` - Usuario no existe
 * - `auth/wrong-password` - Contraseña incorrecta
 * - `auth/email-already-in-use` - Email ya registrado
 * - `auth/weak-password` - Contraseña débil
 * - `auth/network-request-failed` - Error de red
 * - `auth/too-many-requests` - Demasiados intentos
 * - `auth/operation-not-allowed` - Operación no permitida
 * - `auth/requires-recent-login` - Requiere login reciente
 * - `auth/invalid-login-credentials` - Credenciales de login inválidas
 * - `auth/missing-password` - Contraseña faltante
 */
export type AuthErrorCode =
  | 'auth/invalid-email'
  | 'auth/user-disabled'
  | 'auth/user-not-found'
  | 'auth/wrong-password'
  | 'auth/email-already-in-use'
  | 'auth/weak-password'
  | 'auth/network-request-failed'
  | 'auth/too-many-requests'
  | 'auth/operation-not-allowed'
  | 'auth/requires-recent-login'
  | 'auth/invalid-login-credentials'
  | 'auth/missing-password'
  | 'auth/invalid-credential'
  | 'auth/expired-action-code'
  | 'auth/invalid-action-code'
  | 'auth/popup-closed-by-user'
  | 'auth/cancelled-popup-request'
  | 'auth/unauthorized-domain';

/**
 * Mapa de códigos de error de Firebase a mensajes en español
 *
 * Proporciona mensajes de error amigables en español para mostrar a los usuarios
 * cuando ocurre un error de autenticación.
 *
 * @constant
 * @type {Record<AuthErrorCode, string>}
 *
 * @example
 * const errorMessage = AUTH_ERROR_MESSAGES['auth/user-not-found'];
 * // "No existe un usuario con este email"
 */
export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  'auth/invalid-email': 'El formato del email es inválido',
  'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
  'auth/user-not-found': 'No existe un usuario con este email',
  'auth/wrong-password': 'La contraseña es incorrecta',
  'auth/email-already-in-use': 'Este email ya está registrado',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
  'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
  'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde',
  'auth/operation-not-allowed': 'Esta operación no está permitida',
  'auth/requires-recent-login': 'Por seguridad, debes iniciar sesión nuevamente',
  'auth/invalid-login-credentials': 'Las credenciales de acceso son incorrectas',
  'auth/missing-password': 'Debes proporcionar una contraseña',
  'auth/invalid-credential': 'Las credenciales son inválidas',
  'auth/expired-action-code': 'El código de verificación ha expirado',
  'auth/invalid-action-code': 'El código de verificación es inválido',
  'auth/popup-closed-by-user': 'Ventana de autenticación cerrada',
  'auth/cancelled-popup-request': 'Solicitud de autenticación cancelada',
  'auth/unauthorized-domain': 'Dominio no autorizado para autenticación',
};

/**
 * Usuario autenticado simplificado
 * 
 * Contiene solo la información esencial del usuario autenticado,
 * sin exponer detalles internos de Firebase o tokens de seguridad.
 * 
 * @interface AuthUser
 * @property {string} uid - ID único del usuario
 * @property {string | null} email - Correo electrónico del usuario
 * @property {string | null} displayName - Nombre para mostrar del usuario
 * @property {boolean} emailVerified - Indica si el email está verificado
 * @property {string | null} photoURL - URL de la foto de perfil
 * @property {Object} [metadata] - Metadatos del usuario (opcional)
 * @property {string} [metadata.creationTime] - Fecha de creación de la cuenta
 * @property {string} [metadata.lastSignInTime] - Fecha del último inicio de sesión
 */
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  photoURL: string | null;
  metadata?: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

/**
 * Estado de autenticación para Redux
 * 
 * Representa el estado completo del módulo de autenticación en el store de Redux,
 * incluyendo el usuario actual, estado de carga y errores.
 * 
 * @interface AuthState
 * @property {AuthUser | null} user - Usuario autenticado actual (null si no hay sesión)
 * @property {boolean} loading - Indica si hay una operación de autenticación en curso
 * @property {string | null} error - Mensaje de error actual (null si no hay errores)
 * @property {boolean} isAuthenticated - Indica si existe una sesión activa
 */
export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// ========================================
// RESPUESTAS DE AUTENTICACIÓN
// ========================================

/**
 * Respuesta exitosa de operación de autenticación
 *
 * @interface AuthSuccessResponse
 * @property {AuthUser} user - Usuario autenticado
 * @property {string} message - Mensaje de éxito para mostrar al usuario
 *
 * @example
 * const response: AuthSuccessResponse = {
 *   user: { uid: '123', email: 'user@example.com', ... },
 *   message: 'Sesión iniciada correctamente'
 * };
 */
export interface AuthSuccessResponse {
  user: AuthUser;
  message: string;
}

/**
 * Respuesta de error de autenticación
 *
 * @interface AuthErrorResponse
 * @property {AuthErrorCode} code - Código de error de Firebase
 * @property {string} message - Mensaje de error en español para mostrar al usuario
 *
 * @example
 * const error: AuthErrorResponse = {
 *   code: 'auth/user-not-found',
 *   message: 'No existe un usuario con este email'
 * };
 */
export interface AuthErrorResponse {
  code: AuthErrorCode;
  message: string;
}

// ========================================
// UTILIDADES DE VALIDACIÓN
// ========================================

/**
 * Resultado de validación de formulario de autenticación
 *
 * @interface ValidationResult
 * @property {boolean} isValid - Indica si todos los campos del formulario son válidos
 * @property {AuthErrors} errors - Objeto con los errores de validación por campo
 *
 * @example
 * const result: ValidationResult = {
 *   isValid: false,
 *   errors: {
 *     email: 'El email es requerido',
 *     password: 'La contraseña debe tener al menos 6 caracteres'
 *   }
 * };
 */
export interface ValidationResult {
  isValid: boolean;
  errors: AuthErrors;
}

/**
 * Opciones de configuración para operaciones de autenticación
 *
 * @interface AuthOptions
 * @property {boolean} [rememberMe] - Si se debe mantener la sesión activa (persistencia)
 * @property {boolean} [redirect] - Si se debe redirigir después de autenticarse
 * @property {string} [redirectUrl] - URL específica a la que redirigir (por defecto: dashboard)
 *
 * @example
 * const options: AuthOptions = {
 *   rememberMe: true,
 *   redirect: true,
 *   redirectUrl: '/private/dashboard/history'
 * };
 */
export interface AuthOptions {
  rememberMe?: boolean;
  redirect?: boolean;
  redirectUrl?: string;
}
