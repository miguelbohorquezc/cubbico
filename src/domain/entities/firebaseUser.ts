/**
 * @deprecated Este archivo está en proceso de deprecación.
 * 
 * Para nuevos desarrollos, se recomienda usar las interfaces definidas en:
 * - `auth.types.ts` para autenticación (AuthUser, AuthFormData, AuthErrors, etc.)
 * 
 * Esta interface se mantiene por compatibilidad con código legacy, pero contiene
 * información duplicada y campos innecesariamente opcionales que dificultan el desarrollo.
 * 
 * Plan de migración:
 * 1. Usar AuthUser de auth.types.ts para flujos de autenticación
 * 2. Actualizar gradualmente los slices de Redux
 * 3. Eliminar campos sensibles como passwordHash
 * 4. Consolidar información duplicada (uid, email, etc.)
 */

/**
 * Interface de usuario de Firebase (Legacy)
 * 
 * NOTA: Muchos campos están duplicados o son innecesarios.
 * Esta estructura refleja el objeto User de Firebase, pero no todos
 * los campos son necesarios para el funcionamiento de la aplicación.
 * 
 * @interface FirebaseUser
 */
export interface FirebaseUser {
  /** ID del documento (usado en Firestore) */
  id?: string;
  
  /** Token de acceso de Firebase */
  accessToken?: string;
  
  /** ID único del usuario (Firebase Auth) */
  uid?: string;
  
  /** Correo electrónico del usuario */
  email?: string;
  
  /** Nombre para mostrar del usuario */
  displayName?: string | null;
  
  /** Indica si el email está verificado */
  emailVerified?: boolean;
  
  /** Número de teléfono del usuario */
  phoneNumber?: string | null;
  
  /** URL de la foto de perfil */
  photoURL?: string | null;
  
  /** Indica si el usuario es anónimo */
  isAnonymous?: boolean;
  
  /** ID del proveedor de autenticación */
  providerId?: string;
  
  /** ID del tenant (multi-tenancy) */
  tenantId?: string | null;
  
  /** Metadatos del usuario */
  metadata?: {
    /** Fecha de creación de la cuenta */
    createdAt?: string;
    /** Fecha del último login */
    lastLoginAt?: string;
    /** Fecha del último sign in (formato ISO) */
    lastSignInTime?: string;
    /** Fecha de creación (formato ISO) */
    creationTime?: string;
  };
  
  /** 
   * Objeto de autenticación completo de Firebase
   * @deprecated Contiene información sensible y duplicada
   */
  auth?: {
    providerId?: string;
    reloadUserInfo?: {
      localId?: string;
      email?: string;
      emailVerified?: boolean;
      passwordUpdatedAt?: number;
    };
    stsTokenManager?: {
      refreshToken?: string;
      accessToken?: string;
      expirationTime?: number;
    };
    tenantId?: string | null;
    uid?: string;
  };
  
  /**
   * Información de recarga del usuario
   * @deprecated Duplicado con auth.reloadUserInfo
   */
  reloadUserInfo?: {
    localId?: string;
    email?: string;
    emailVerified?: boolean;
    passwordUpdatedAt?: number;
  };
  
  /**
   * Gestor de tokens STS
   * @deprecated Duplicado con auth.stsTokenManager
   */
  stsTokenManager?: {
    refreshToken?: string;
    accessToken?: string;
    expirationTime?: number;
  };
  
  /**
   * Datos de proveedores de autenticación
   */
  providerData?: Array<{
    providerId?: string;
    uid?: string;
    displayName?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
    photoURL?: string | null;
  }>;
  
  /**
   * Configuración de recarga proactiva
   * @deprecated Detalles internos de Firebase, no necesario en la mayoría de casos
   */
  proactiveRefresh?: {
    user?: Record<string, unknown>;
    isRunning?: boolean;
    timerId?: number | null;
    errorBackoff?: number;
  };
  
  /**
   * Listener de recarga
   * @deprecated Uso interno de Firebase
   */
  reloadListener?: null;
}
