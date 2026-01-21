/**
 * Servicio de Autenticación - Capa de Infraestructura
 *
 * Este servicio centraliza toda la lógica de autenticación con Firebase,
 * siguiendo los principios de Clean Architecture:
 * - Aísla los detalles de implementación de Firebase
 * - Mapea tipos de Firebase a tipos del dominio
 * - Maneja errores de Firebase y los traduce a español
 * - Proporciona una API limpia para la capa de presentación
 *
 * VENTAJAS:
 * - Testing: Fácil de mockear para tests unitarios
 * - Mantenibilidad: Cambios en Firebase solo afectan este archivo
 * - Reutilización: Funciones usables desde cualquier parte de la app
 * - Tipado: Conversión segura entre tipos de Firebase y tipos del dominio
 *
 * @module AuthService
 */

import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updatePassword,
  User as FirebaseAuthUser,
  UserCredential,
  onAuthStateChanged,
  Unsubscribe,
} from 'firebase/auth';
import { auth } from './firebase';
import {
  AuthFormData,
  AuthUser,
  AuthSuccessResponse,
  AuthErrorResponse,
  AuthErrorCode,
  AUTH_ERROR_MESSAGES,
} from '../../domain/entities/auth.types';

// ========================================
// MAPEO DE TIPOS
// ========================================

/**
 * Convierte un usuario de Firebase Auth a nuestro tipo de dominio AuthUser
 *
 * Esta función extrae solo la información necesaria del objeto User de Firebase,
 * evitando exponer detalles internos de Firebase a la capa de presentación.
 *
 * @param {FirebaseAuthUser} firebaseUser - Usuario de Firebase Auth
 * @returns {AuthUser} Usuario en formato de dominio
 *
 * @example
 * const authUser = mapFirebaseUserToAuthUser(userCredential.user);
 * dispatch(setUser(authUser));
 */
export const mapFirebaseUserToAuthUser = (
  firebaseUser: FirebaseAuthUser
): AuthUser => {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    emailVerified: firebaseUser.emailVerified,
    photoURL: firebaseUser.photoURL,
    metadata: {
      creationTime: firebaseUser.metadata.creationTime,
      lastSignInTime: firebaseUser.metadata.lastSignInTime,
    },
  };
};

// ========================================
// MANEJO DE ERRORES
// ========================================

/**
 * Convierte un error de Firebase en un objeto AuthErrorResponse
 *
 * SEGURIDAD: Para prevenir account enumeration, los errores de autenticación
 * específicos (user-not-found, wrong-password, invalid-credentials) se mapean
 * a un mensaje genérico que no revela si el email existe o no.
 *
 * Otros errores (red, demasiados intentos, etc.) sí muestran mensajes específicos
 * ya que no representan un riesgo de enumeración de cuentas.
 *
 * @param {any} error - Error lanzado por Firebase
 * @returns {AuthErrorResponse} Respuesta de error estructurada
 *
 * @example
 * try {
 *   await signInWithEmailAndPassword(auth, email, password);
 * } catch (error) {
 *   const authError = handleAuthError(error);
 *   console.log(authError.message); // "Email o contraseña incorrectos..."
 * }
 */
export const handleAuthError = (error: any): AuthErrorResponse => {
  const errorCode = error.code as AuthErrorCode;

  // SEGURIDAD: Códigos de error que permiten account enumeration
  // Estos se mapean a un mensaje genérico para no revelar si el usuario existe
  const loginEnumerationErrors = [
    'auth/user-not-found',
    'auth/wrong-password',
    'auth/invalid-login-credentials',
    'auth/invalid-credential',
    'auth/invalid-email', // También genérico para prevenir validación de emails
  ];

  if (loginEnumerationErrors.includes(errorCode)) {
    return {
      code: errorCode,
      message: 'Email o contraseña incorrectos. Por favor, verifica tus credenciales.',
    };
  }

  // Para otros errores, mostrar mensajes específicos (no hay riesgo de enumeration)
  const message = errorCode in AUTH_ERROR_MESSAGES
    ? AUTH_ERROR_MESSAGES[errorCode]
    : 'Ocurrió un error inesperado. Por favor, intenta nuevamente';

  return {
    code: errorCode,
    message,
  };
};

// ========================================
// FUNCIONES DE AUTENTICACIÓN
// ========================================

/**
 * Inicia sesión con email y contraseña
 *
 * Esta función:
 * 1. Autentica al usuario con Firebase
 * 2. Convierte el usuario de Firebase a nuestro tipo AuthUser
 * 3. Retorna una respuesta de éxito con el usuario y mensaje
 *
 * SEGURIDAD:
 * - Las credenciales se transmiten encriptadas (HTTPS/TLS)
 * - Firebase maneja el hashing de contraseñas server-side
 * - No se almacenan contraseñas localmente
 *
 * @param {AuthFormData} credentials - Email y contraseña del usuario
 * @returns {Promise<AuthSuccessResponse>} Usuario autenticado y mensaje de éxito
 * @throws {AuthErrorResponse} Error estructurado con código y mensaje en español
 *
 * @example
 * try {
 *   const { user, message } = await signIn({
 *     email: 'docente@colina.edu',
 *     password: 'contraseña123'
 *   });
 *   console.log(message); // "Sesión iniciada correctamente"
 *   dispatch(setUser(user));
 * } catch (error) {
 *   console.error(error.message); // "La contraseña es incorrecta"
 * }
 */
export const signIn = async (
  credentials: AuthFormData
): Promise<AuthSuccessResponse> => {
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );

    const user = mapFirebaseUserToAuthUser(userCredential.user);

    return {
      user,
      message: 'Sesión iniciada correctamente',
    };
  } catch (error: any) {
    throw handleAuthError(error);
  }
};

/**
 * Cierra la sesión del usuario actual
 *
 * Esta función:
 * 1. Cierra la sesión en Firebase
 * 2. Limpia los tokens de autenticación
 * 3. Dispara el listener onAuthStateChanged
 *
 * NOTA: El estado de Redux debe limpiarse en el listener de onAuthStateChanged,
 * no directamente en esta función.
 *
 * @returns {Promise<void>}
 * @throws {AuthErrorResponse} Error estructurado si falla el logout
 *
 * @example
 * try {
 *   await signOut();
 *   navigate('/login');
 * } catch (error) {
 *   console.error(error.message);
 * }
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    throw handleAuthError(error);
  }
};

/**
 * Obtiene el usuario actualmente autenticado
 *
 * Esta es una función síncrona que retorna el usuario actual de Firebase.
 * Retorna null si no hay sesión activa.
 *
 * @returns {AuthUser | null} Usuario actual o null si no hay sesión
 *
 * @example
 * const currentUser = getCurrentUser();
 * if (currentUser) {
 *   console.log(`Bienvenido ${currentUser.displayName}`);
 * } else {
 *   navigate('/login');
 * }
 */
export const getCurrentUser = (): AuthUser | null => {
  const firebaseUser = auth.currentUser;

  if (!firebaseUser) {
    return null;
  }

  return mapFirebaseUserToAuthUser(firebaseUser);
};

/**
 * Suscribe un listener a cambios en el estado de autenticación
 *
 * Este listener se ejecuta cuando:
 * - El usuario inicia sesión
 * - El usuario cierra sesión
 * - El token de autenticación se renueva
 * - La aplicación se carga y hay una sesión activa
 *
 * IMPORTANTE: Debes llamar a la función de limpieza retornada cuando
 * el componente se desmonte para evitar memory leaks.
 *
 * @param {Function} callback - Función que recibe el usuario actual (o null)
 * @returns {Unsubscribe} Función para cancelar la suscripción
 *
 * @example
 * // En un componente React
 * useEffect(() => {
 *   const unsubscribe = onAuthStateChange((user) => {
 *     if (user) {
 *       dispatch(setUser(user));
 *     } else {
 *       dispatch(clearUser());
 *     }
 *   });
 *
 *   return () => unsubscribe(); // Limpiar al desmontar
 * }, [dispatch]);
 */
export const onAuthStateChange = (
  callback: (user: AuthUser | null) => void
): Unsubscribe => {
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      const user = mapFirebaseUserToAuthUser(firebaseUser);
      callback(user);
    } else {
      callback(null);
    }
  });
};

/**
 * Envía un email de recuperación de contraseña
 *
 * Firebase enviará un email al usuario con un enlace para restablecer
 * su contraseña. El enlace expira después de 1 hora por defecto.
 *
 * @param {string} email - Email del usuario que olvidó su contraseña
 * @returns {Promise<void>}
 * @throws {AuthErrorResponse} Error si el email no existe o hay problemas de red
 *
 * @example
 * try {
 *   await sendPasswordReset('docente@colina.edu');
 *   alert('Revisa tu email para restablecer tu contraseña');
 * } catch (error) {
 *   console.error(error.message); // "No existe un usuario con este email"
 * }
 */
export const sendPasswordReset = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw handleAuthError(error);
  }
};

/**
 * Actualiza la contraseña del usuario actual
 *
 * IMPORTANTE:
 * - El usuario debe haber iniciado sesión recientemente
 * - Si la sesión es antigua, Firebase lanzará error 'auth/requires-recent-login'
 * - En ese caso, el usuario debe cerrar sesión y volver a autenticarse
 *
 * @param {string} newPassword - Nueva contraseña (mínimo 6 caracteres)
 * @returns {Promise<void>}
 * @throws {AuthErrorResponse} Error si no hay usuario o la sesión es antigua
 *
 * @example
 * try {
 *   await updateUserPassword('nuevaContraseña123');
 *   alert('Contraseña actualizada correctamente');
 * } catch (error) {
 *   if (error.code === 'auth/requires-recent-login') {
 *     alert('Por seguridad, debes iniciar sesión nuevamente');
 *   }
 * }
 */
export const updateUserPassword = async (newPassword: string): Promise<void> => {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw {
        code: 'auth/user-not-found',
        message: 'No hay un usuario autenticado',
      };
    }

    await updatePassword(user, newPassword);
  } catch (error: any) {
    throw handleAuthError(error);
  }
};

// ========================================
// UTILIDADES
// ========================================

/**
 * Verifica si hay un usuario autenticado actualmente
 *
 * Función de utilidad para verificaciones rápidas de autenticación.
 *
 * @returns {boolean} true si hay un usuario autenticado, false si no
 *
 * @example
 * if (!isAuthenticated()) {
 *   navigate('/login');
 * }
 */
export const isAuthenticated = (): boolean => {
  return auth.currentUser !== null;
};

/**
 * Verifica si el email del usuario actual está verificado
 *
 * @returns {boolean} true si el email está verificado, false si no o si no hay usuario
 *
 * @example
 * if (!isEmailVerified()) {
 *   showBanner('Por favor verifica tu email');
 * }
 */
export const isEmailVerified = (): boolean => {
  return auth.currentUser?.emailVerified ?? false;
};

// ========================================
// EXPORTS
// ========================================

/**
 * Servicio de autenticación completo
 *
 * Exporta todas las funciones como un objeto para facilitar
 * el mocking en tests y la importación organizada.
 *
 * @example
 * import { AuthService } from '@/infrastructure/firebase/auth.service';
 *
 * // Uso
 * const user = await AuthService.signIn({ email, password });
 * await AuthService.signOut();
 */
export const AuthService = {
  signIn,
  signOut,
  getCurrentUser,
  onAuthStateChange,
  sendPasswordReset,
  updateUserPassword,
  isAuthenticated,
  isEmailVerified,
  mapFirebaseUserToAuthUser,
  handleAuthError,
};

// Exports nombrados para importación individual
export default AuthService;
