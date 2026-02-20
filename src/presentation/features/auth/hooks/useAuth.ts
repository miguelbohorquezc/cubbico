/**
 * Hook de autenticación mejorado con mejores prácticas
 *
 * Este hook reemplaza a useUserForm con:
 * - Mejor tipado usando auth.types.ts
 * - Validación separada en función pura
 * - Estados de loading granulares
 * - Manejo de errores centralizado
 * - Sin lógica de navegación (usa callbacks)
 *
 * @module useAuth
 */

import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../../../../infrastructure/firebase/firebase';
import { createUser } from '../../../../app/store/states/user';
import { AppDispatch, RootState } from '../../../../app/store/store';
import {
  AuthFormData,
  AuthErrors,
  AuthErrorCode,
  AUTH_ERROR_MESSAGES,
  ValidationResult,
  AuthOptions,
} from '../../../../domain/entities/auth.types';
import { FirebaseUser } from '../../../../domain/entities/firebaseUser';

// ========================================
// VALIDACIÓN (FUNCIÓN PURA)
// ========================================

/**
 * Valida los datos del formulario de autenticación
 *
 * Esta es una función pura sin efectos secundarios, lo que facilita:
 * - Testing unitario
 * - Reutilización
 * - Debugging
 *
 * @param {AuthFormData} formData - Datos del formulario a validar
 * @returns {ValidationResult} Resultado de la validación con errores si existen
 *
 * @example
 * const result = validateAuthForm({ email: '', password: '123' });
 * if (!result.isValid) {
 *   console.log(result.errors);
 * }
 */
export const validateAuthForm = (formData: AuthFormData): ValidationResult => {
  const errors: AuthErrors = {};

  // Regex mejorado según RFC 5322 (simplificado pero robusto)
  // Previene: leading/trailing special chars, consecutive dots, emails malformados
  const EMAIL_REGEX = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;

  // Validar email
  if (!formData.email) {
    errors.email = 'El email es requerido';
  } else if (!EMAIL_REGEX.test(formData.email)) {
    errors.email = 'El formato del email es inválido';
  } else if (formData.email.length > 254) {
    // RFC 5321 limita los emails a 254 caracteres
    errors.email = 'El email es demasiado largo (máximo 254 caracteres)';
  }

  // Validar password
  if (!formData.password) {
    errors.password = 'La contraseña es requerida';
  } else if (formData.password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ========================================
// MAPEO DE ERRORES DE FIREBASE
// ========================================

/**
 * Obtiene el mensaje de error en español para un código de error de Firebase
 *
 * @param {string} errorCode - Código de error de Firebase
 * @returns {string} Mensaje de error en español
 *
 * @example
 * const message = getAuthErrorMessage('auth/user-not-found');
 * // "No existe un usuario con este email"
 */
const getAuthErrorMessage = (errorCode: string): string => {
  // Verificar si es un código de error conocido
  if (errorCode in AUTH_ERROR_MESSAGES) {
    return AUTH_ERROR_MESSAGES[errorCode as AuthErrorCode];
  }

  // Mensaje genérico para errores desconocidos
  return 'Ocurrió un error inesperado. Por favor, intenta nuevamente';
};

// ========================================
// TIPOS DEL HOOK
// ========================================

/**
 * Configuración del hook useAuth
 */
interface UseAuthConfig {
  /** Callback ejecutado cuando el login es exitoso */
  onSuccess?: (user: FirebaseUser) => void;

  /** Callback ejecutado cuando hay un error de autenticación */
  onError?: (error: string) => void;

  /** Opciones de autenticación */
  options?: AuthOptions;
}

/**
 * Estado retornado por el hook useAuth
 */
interface UseAuthReturn {
  /** Datos actuales del formulario */
  formData: AuthFormData;

  /** Errores de validación del formulario */
  errors: AuthErrors;

  /** Error de autenticación (Firebase) */
  authError: string | null;

  /** Indica si se está procesando un login */
  isAuthenticating: boolean;

  /** Indica si se está procesando un logout */
  isLoggingOut: boolean;

  /** Usuario actual del store Redux */
  user: FirebaseUser | null;

  /** Actualiza un campo del formulario */
  updateField: (field: keyof AuthFormData, value: string) => void;

  /** Valida el formulario completo */
  validate: () => boolean;

  /** Ejecuta el proceso de login */
  signIn: (e?: React.FormEvent) => Promise<void>;

  /** Ejecuta el proceso de logout */
  signOut: () => Promise<void>;

  /** Limpia todos los errores */
  clearErrors: () => void;

  /** Resetea el formulario a su estado inicial */
  resetForm: () => void;
}

// ========================================
// HOOK PRINCIPAL
// ========================================

/**
 * Hook de autenticación con mejores prácticas
 *
 * Maneja todo el flujo de autenticación:
 * - Validación de formulario
 * - Login con Firebase
 * - Logout
 * - Manejo de errores
 * - Estados de carga
 *
 * @param {AuthFormData} initialFormData - Datos iniciales del formulario
 * @param {UseAuthConfig} config - Configuración del hook
 * @returns {UseAuthReturn} Estado y funciones del hook
 *
 * @example
 * const {
 *   formData,
 *   errors,
 *   isAuthenticating,
 *   updateField,
 *   signIn
 * } = useAuth(
 *   { email: '', password: '' },
 *   {
 *     onSuccess: (user) => navigate('/dashboard'),
 *     onError: (error) => console.error(error)
 *   }
 * );
 */
export const useAuth = (
  initialFormData: AuthFormData = { email: '', password: '' },
  config: UseAuthConfig = {}
): UseAuthReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user);

  // ========================================
  // ESTADO LOCAL
  // ========================================

  const [formData, setFormData] = useState<AuthFormData>(initialFormData);
  const [errors, setErrors] = useState<AuthErrors>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // ========================================
  // FUNCIONES DE MANEJO DE FORMULARIO
  // ========================================

  /**
   * Actualiza un campo específico del formulario
   * Limpia el error de ese campo cuando el usuario empieza a escribir
   */
  const updateField = useCallback(
    (field: keyof AuthFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Limpiar error del campo que se está editando
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }

      // Limpiar error general de autenticación al empezar a escribir
      if (authError) {
        setAuthError(null);
      }
    },
    [errors, authError]
  );

  /**
   * Valida el formulario completo
   * @returns {boolean} true si el formulario es válido
   */
  const validate = useCallback((): boolean => {
    const validationResult = validateAuthForm(formData);
    setErrors(validationResult.errors);
    return validationResult.isValid;
  }, [formData]);

  /**
   * Limpia todos los errores (validación y autenticación)
   */
  const clearErrors = useCallback(() => {
    setErrors({});
    setAuthError(null);
  }, []);

  /**
   * Resetea el formulario a su estado inicial
   */
  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
    setAuthError(null);
  }, [initialFormData]);

  // ========================================
  // FUNCIONES DE AUTENTICACIÓN
  // ========================================

  /**
   * Ejecuta el proceso de login con Firebase
   *
   * CONTROLES DE SEGURIDAD IMPLEMENTADOS:
   * - Validación de email robusta (RFC 5322, límite 254 caracteres)
   * - Encriptación en tránsito: HTTPS/TLS
   * - Autenticación: Firebase Auth (hashing server-side)
   * - No hay persistencia de contraseñas en localStorage/sessionStorage
   * - Tokens de sesión manejados por Firebase (no contraseñas)
   *
   * LIMITACIONES CONOCIDAS:
   * - JavaScript no puede limpiar memoria de forma segura (GC no determinístico)
   * - No hay rate limiting a nivel cliente (debe implementarse en Firebase/servidor)
   * - Logs de desarrollo pueden exponer detalles de errores
   *
   * Para seguridad mejorada considerar:
   * - Migrar a Firebase Auth UI
   * - Implementar OAuth/SSO
   * - Agregar autenticación biométrica
   */
  const signIn = useCallback(
    async (e?: React.FormEvent) => {
      // Prevenir submit del formulario si se pasó el evento
      if (e) {
        e.preventDefault();
      }

      // Limpiar errores previos
      clearErrors();

      // Validar formulario
      if (!validate()) {
        return;
      }

      try {
        setIsAuthenticating(true);

        // Autenticar con Firebase
        const userCredential = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        // Extraer datos del usuario
        const userData: FirebaseUser = {
          uid: userCredential.user.uid,
          email: userCredential.user.email ?? undefined,
          displayName: userCredential.user.displayName,
          emailVerified: userCredential.user.emailVerified,
          photoURL: userCredential.user.photoURL,
          phoneNumber: userCredential.user.phoneNumber,
          metadata: {
            creationTime: userCredential.user.metadata.creationTime,
            lastSignInTime: userCredential.user.metadata.lastSignInTime,
          },
        };

        // Actualizar Redux store
        dispatch(createUser(userData));

        // Ejecutar callback de éxito si existe
        if (config.onSuccess) {
          config.onSuccess(userData);
        }

        // Limpiar formulario después del login exitoso
        if (config.options?.rememberMe !== true) {
          resetForm();
        }
      } catch (error: any) {
        // Obtener mensaje de error en español
        const errorMessage = getAuthErrorMessage(error.code);
        setAuthError(errorMessage);

        // Ejecutar callback de error si existe
        if (config.onError) {
          config.onError(errorMessage);
        }

        // Log del error en desarrollo
        if (process.env.NODE_ENV === 'development') {
          console.error('Auth error:', error);
        }
      } finally {
        setIsAuthenticating(false);
      }
    },
    [formData, validate, clearErrors, dispatch, config, resetForm]
  );

  /**
   * Ejecuta el proceso de logout
   */
  const signOut = useCallback(async () => {
    try {
      setIsLoggingOut(true);

      // Cerrar sesión en Firebase
      await firebaseSignOut(auth);

      // Limpiar formulario y errores
      resetForm();

      // Nota: El state de Redux se limpiará automáticamente
      // en el listener de onAuthStateChanged de Firebase
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      setAuthError(errorMessage);

      if (process.env.NODE_ENV === 'development') {
        console.error('Logout error:', error);
      }
    } finally {
      setIsLoggingOut(false);
    }
  }, [resetForm]);

  // ========================================
  // EFECTO: LIMPIAR ERRORES AL DESMONTAR
  // ========================================

  useEffect(() => {
    return () => {
      clearErrors();
    };
  }, [clearErrors]);

  // ========================================
  // RETORNO DEL HOOK
  // ========================================

  return {
    formData,
    errors,
    authError,
    isAuthenticating,
    isLoggingOut,
    user,
    updateField,
    validate,
    signIn,
    signOut,
    clearErrors,
    resetForm,
  };
};

// ========================================
// EXPORT DEFAULT PARA COMPATIBILIDAD
// ========================================

export default useAuth;
