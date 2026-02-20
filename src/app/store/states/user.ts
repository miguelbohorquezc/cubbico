/**
 * User Redux Slice - VERSIÓN SEGURA CON SESSION STORAGE
 *
 * CAMBIOS DE SEGURIDAD APLICADOS:
 * ✅ Autenticación delegada a Firebase Auth (tokens seguros en IndexedDB)
 * ✅ SessionStorage solo para datos NO sensibles (preferencias, UI state)
 * ✅ Sin exposición de tokens o contraseñas
 *
 * ARQUITECTURA:
 * 1. Firebase Auth maneja autenticación y tokens
 * 2. SessionStorage maneja preferencias y UI state (NO datos sensibles)
 * 3. Redux mantiene el estado en memoria durante la sesión
 * 4. Al recargar, Firebase restaura sesión y SessionStorage restaura preferencias
 *
 * DATOS QUE SE PUEDEN PERSISTIR EN SESSION STORAGE:
 * ✅ Preferencias de usuario (tema, idioma, etc.)
 * ✅ Estados de UI (sidebar collapsed, view mode, etc.)
 * ✅ Datos de navegación (última página visitada)
 * ❌ Tokens de autenticación (maneja Firebase Auth)
 * ❌ Contraseñas o datos sensibles
 *
 * @module UserSlice
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FirebaseUser } from "../../../domain/entities/firebaseUser";
import { SessionStorage } from "../../../infrastructure/storage/session.storage";

/**
 * Keys para SessionStorage
 */
const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  LAST_VISIT: 'last_visit',
} as const;

/**
 * Estado inicial del usuario: null
 *
 * IMPORTANTE: El estado inicial es siempre null.
 * El estado real del usuario se carga a través del listener onAuthStateChanged
 * cuando la aplicación se inicializa o cuando cambia la sesión de autenticación.
 */
const initialState: FirebaseUser | null = null;

/**
 * Slice de Redux para manejo de usuario autenticado
 *
 * Este slice NO persiste datos manualmente. La persistencia es manejada
 * completamente por Firebase Auth.
 */
export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    /**
     * Establece el usuario autenticado en el store
     *
     * Esta acción debe ser despachada únicamente desde:
     * 1. El listener onAuthStateChanged cuando Firebase detecta una sesión
     * 2. Después de un login exitoso
     *
     * @param _ - Estado previo (ignorado, siempre se reemplaza)
     * @param action - Usuario autenticado
     */
    // @ts-ignore - TODO: Fix Redux Toolkit CaseReducer type inference
    createUser: (_, action: PayloadAction<FirebaseUser>) => {
      return action.payload;
    },

    /**
     * Actualiza parcialmente los datos del usuario
     *
     * Útil para actualizar campos específicos sin reemplazar todo el objeto.
     *
     * @param state - Estado actual del usuario
     * @param action - Campos a actualizar
     */
    // @ts-ignore - TODO: Fix Redux Toolkit CaseReducer type inference and spread operator on nullable types
    updateUser: (state, action: PayloadAction<Partial<FirebaseUser>>) => {
      if (!state) return state;
      // @ts-ignore - Spread types may only be created from object types
      return { ...state, ...action.payload };
    },

    /**
     * Limpia el usuario del store
     *
     * Esta acción debe ser despachada cuando:
     * 1. El usuario cierra sesión (signOut)
     * 2. Firebase detecta que la sesión expiró
     * 3. El token de autenticación es inválido
     */
    resetUser: () => {
      return null;
    }
  }
});

export const { createUser, updateUser, resetUser } = userSlice.actions;
export default userSlice.reducer;

/**
 * Funciones auxiliares para persistencia de datos NO sensibles
 */

/**
 * Tipo para preferencias de usuario
 */
export interface UserPreferences {
  theme?: 'light' | 'dark';
  language?: 'es' | 'en';
  sidebarCollapsed?: boolean;
  [key: string]: unknown;
}

/**
 * Guarda preferencias de usuario en SessionStorage
 *
 * SEGURIDAD: Solo para datos NO sensibles (UI preferences)
 *
 * @param preferences - Preferencias a guardar
 * @returns true si se guardó exitosamente
 *
 * @example
 * ```typescript
 * saveUserPreferences({
 *   theme: 'dark',
 *   sidebarCollapsed: false
 * });
 * ```
 */
export const saveUserPreferences = (preferences: UserPreferences): boolean => {
  return SessionStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, preferences, {
    storageType: 'local', // localStorage para que persista entre sesiones
  });
};

/**
 * Obtiene preferencias de usuario desde SessionStorage
 *
 * @returns Preferencias guardadas o null si no existen
 */
export const getUserPreferences = (): UserPreferences | null => {
  return SessionStorage.getItem<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES, {
    storageType: 'local',
  });
};

/**
 * Actualiza preferencias de usuario (merge con existentes)
 *
 * @param updates - Preferencias a actualizar
 * @returns true si se actualizó exitosamente
 */
export const updateUserPreferences = (updates: Partial<UserPreferences>): boolean => {
  const current = getUserPreferences() || {};
  const merged = { ...current, ...updates };
  return saveUserPreferences(merged);
};

/**
 * Elimina preferencias de usuario
 *
 * @returns true si se eliminó exitosamente
 */
export const clearUserPreferences = (): boolean => {
  return SessionStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES, {
    storageType: 'local',
  });
};

/**
 * Registra la última visita del usuario
 *
 * Útil para analytics o para restaurar la última página visitada
 *
 * @param page - Ruta de la página visitada
 * @returns true si se guardó exitosamente
 */
export const saveLastVisit = (page: string): boolean => {
  return SessionStorage.setItem(
    STORAGE_KEYS.LAST_VISIT,
    {
      page,
      timestamp: Date.now(),
    },
    {
      storageType: 'session', // sessionStorage porque es temporal
      ttl: 1000 * 60 * 60 * 24, // 24 horas
    }
  );
};

/**
 * Obtiene la última página visitada
 *
 * @returns Objeto con página y timestamp, o null si no existe
 */
export const getLastVisit = (): { page: string; timestamp: number } | null => {
  return SessionStorage.getItem<{ page: string; timestamp: number }>(
    STORAGE_KEYS.LAST_VISIT,
    {
      storageType: 'session',
    }
  );
};

/**
 * Limpia todos los datos de sesión del usuario
 *
 * NOTA: Esto NO cierra la sesión de Firebase Auth.
 * Solo limpia datos complementarios almacenados localmente.
 */
export const clearAllUserData = (): void => {
  clearUserPreferences();
  SessionStorage.removeItem(STORAGE_KEYS.LAST_VISIT, { storageType: 'session' });
};