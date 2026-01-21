/**
 * Session Storage Service
 *
 * Servicio type-safe para almacenamiento de datos de sesión y persistencia local.
 *
 * IMPORTANTE - SEGURIDAD:
 * - NO almacenar tokens de autenticación (usa Firebase Auth)
 * - NO almacenar contraseñas o datos sensibles
 * - Solo para preferencias de UI, estados temporales, etc.
 *
 * CARACTERÍSTICAS:
 * - Type-safe con TypeScript
 * - Soporte para TTL (Time To Live)
 * - Serialización/deserialización automática
 * - Manejo de errores robusto
 * - Soporte para localStorage y sessionStorage
 * - Limpieza automática de datos expirados
 *
 * @module SessionStorage
 */

/**
 * Storage types disponibles
 */
export type StorageType = 'local' | 'session';

/**
 * Item almacenado con metadata
 */
interface StorageItem<T> {
  /**
   * Valor almacenado
   */
  value: T;

  /**
   * Timestamp de creación (ms)
   */
  createdAt: number;

  /**
   * Timestamp de expiración (ms), null si no expira
   */
  expiresAt: number | null;
}

/**
 * Opciones para almacenar un item
 */
interface SetItemOptions {
  /**
   * Tipo de storage a usar
   * @default 'local'
   */
  storageType?: StorageType;

  /**
   * Time to live en milisegundos
   * Si se provee, el item se eliminará automáticamente después de este tiempo
   */
  ttl?: number;
}

/**
 * Opciones para obtener un item
 */
interface GetItemOptions {
  /**
   * Tipo de storage a usar
   * @default 'local'
   */
  storageType?: StorageType;
}

/**
 * Session Storage Service
 *
 * Servicio centralizado para manejo de almacenamiento local y de sesión.
 *
 * @example
 * ```typescript
 * // Guardar preferencias de usuario
 * SessionStorage.setItem('userPreferences', {
 *   theme: 'dark',
 *   language: 'es'
 * }, { storageType: 'local' });
 *
 * // Recuperar preferencias
 * const prefs = SessionStorage.getItem<UserPreferences>('userPreferences');
 *
 * // Guardar estado temporal con expiración
 * SessionStorage.setItem('formDraft', formData, {
 *   storageType: 'session',
 *   ttl: 1000 * 60 * 30 // 30 minutos
 * });
 * ```
 */
export class SessionStorage {
  /**
   * Prefijo para todas las keys para evitar colisiones
   */
  private static readonly KEY_PREFIX = 'cubbico_';

  /**
   * Verifica si el storage está disponible
   *
   * @param type - Tipo de storage a verificar
   * @returns true si el storage está disponible
   */
  private static isStorageAvailable(type: StorageType): boolean {
    try {
      const storage = type === 'local' ? window.localStorage : window.sessionStorage;
      const testKey = '__storage_test__';
      storage.setItem(testKey, 'test');
      storage.removeItem(testKey);
      return true;
    } catch (error) {
      // Storage no disponible (modo privado, quota excedida, etc.)
      if (import.meta.env.DEV) {
        console.warn(`${type}Storage no disponible:`, error);
      }
      return false;
    }
  }

  /**
   * Obtiene la instancia de storage
   *
   * @param type - Tipo de storage
   * @returns Storage instance o null si no está disponible
   */
  private static getStorage(type: StorageType): Storage | null {
    if (!this.isStorageAvailable(type)) {
      return null;
    }
    return type === 'local' ? window.localStorage : window.sessionStorage;
  }

  /**
   * Genera la key con prefijo
   *
   * @param key - Key original
   * @returns Key con prefijo
   */
  private static getPrefixedKey(key: string): string {
    return `${this.KEY_PREFIX}${key}`;
  }

  /**
   * Almacena un item en el storage
   *
   * @param key - Clave de almacenamiento
   * @param value - Valor a almacenar (será serializado a JSON)
   * @param options - Opciones de almacenamiento
   * @returns true si se almacenó exitosamente
   *
   * @example
   * ```typescript
   * // Almacenar en localStorage
   * SessionStorage.setItem('theme', 'dark');
   *
   * // Almacenar en sessionStorage con TTL
   * SessionStorage.setItem('tempData', data, {
   *   storageType: 'session',
   *   ttl: 1000 * 60 * 5 // 5 minutos
   * });
   * ```
   */
  static setItem<T>(key: string, value: T, options: SetItemOptions = {}): boolean {
    const { storageType = 'local', ttl } = options;
    const storage = this.getStorage(storageType);

    if (!storage) {
      return false;
    }

    try {
      const now = Date.now();
      const item: StorageItem<T> = {
        value,
        createdAt: now,
        expiresAt: ttl ? now + ttl : null,
      };

      const serialized = JSON.stringify(item);
      storage.setItem(this.getPrefixedKey(key), serialized);
      return true;
    } catch (error) {
      // Error de serialización o quota excedida
      if (import.meta.env.DEV) {
        console.error(`Error al guardar en ${storageType}Storage:`, error);
      }
      return false;
    }
  }

  /**
   * Obtiene un item del storage
   *
   * @param key - Clave de almacenamiento
   * @param options - Opciones de recuperación
   * @returns El valor almacenado o null si no existe o expiró
   *
   * @example
   * ```typescript
   * const theme = SessionStorage.getItem<string>('theme');
   * const prefs = SessionStorage.getItem<UserPreferences>('userPreferences');
   * ```
   */
  static getItem<T>(key: string, options: GetItemOptions = {}): T | null {
    const { storageType = 'local' } = options;
    const storage = this.getStorage(storageType);

    if (!storage) {
      return null;
    }

    try {
      const serialized = storage.getItem(this.getPrefixedKey(key));

      if (!serialized) {
        return null;
      }

      const item: StorageItem<T> = JSON.parse(serialized);

      // Verificar expiración
      if (item.expiresAt && Date.now() > item.expiresAt) {
        // Item expirado, eliminarlo
        this.removeItem(key, { storageType });
        return null;
      }

      return item.value;
    } catch (error) {
      // Error de deserialización
      if (import.meta.env.DEV) {
        console.error(`Error al recuperar de ${storageType}Storage:`, error);
      }
      // Si hay error de parsing, limpiar el item corrupto
      this.removeItem(key, { storageType });
      return null;
    }
  }

  /**
   * Elimina un item del storage
   *
   * @param key - Clave de almacenamiento
   * @param options - Opciones de eliminación
   * @returns true si se eliminó exitosamente
   */
  static removeItem(key: string, options: GetItemOptions = {}): boolean {
    const { storageType = 'local' } = options;
    const storage = this.getStorage(storageType);

    if (!storage) {
      return false;
    }

    try {
      storage.removeItem(this.getPrefixedKey(key));
      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`Error al eliminar de ${storageType}Storage:`, error);
      }
      return false;
    }
  }

  /**
   * Limpia todos los items con el prefijo de la aplicación
   *
   * @param storageType - Tipo de storage a limpiar
   * @returns Número de items eliminados
   */
  static clear(storageType: StorageType = 'local'): number {
    const storage = this.getStorage(storageType);

    if (!storage) {
      return 0;
    }

    try {
      let count = 0;
      const keysToRemove: string[] = [];

      // Identificar keys con nuestro prefijo
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(this.KEY_PREFIX)) {
          keysToRemove.push(key);
        }
      }

      // Eliminar keys
      keysToRemove.forEach(key => {
        storage.removeItem(key);
        count++;
      });

      return count;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`Error al limpiar ${storageType}Storage:`, error);
      }
      return 0;
    }
  }

  /**
   * Limpia items expirados de todos los storages
   *
   * @returns Número de items eliminados
   */
  static cleanExpired(): number {
    let totalCleaned = 0;

    const storageTypes: StorageType[] = ['local', 'session'];

    storageTypes.forEach(type => {
      const storage = this.getStorage(type);
      if (!storage) return;

      try {
        const now = Date.now();
        const keysToRemove: string[] = [];

        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (!key || !key.startsWith(this.KEY_PREFIX)) continue;

          try {
            const serialized = storage.getItem(key);
            if (!serialized) continue;

            const item: StorageItem<unknown> = JSON.parse(serialized);

            // Verificar si expiró
            if (item.expiresAt && now > item.expiresAt) {
              keysToRemove.push(key);
            }
          } catch {
            // Item corrupto, marcarlo para eliminación
            keysToRemove.push(key);
          }
        }

        // Eliminar items expirados o corruptos
        keysToRemove.forEach(key => {
          storage.removeItem(key);
          totalCleaned++;
        });
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error(`Error al limpiar items expirados de ${type}Storage:`, error);
        }
      }
    });

    return totalCleaned;
  }

  /**
   * Verifica si existe un item en el storage
   *
   * @param key - Clave a verificar
   * @param options - Opciones de búsqueda
   * @returns true si el item existe y no ha expirado
   */
  static hasItem(key: string, options: GetItemOptions = {}): boolean {
    return this.getItem(key, options) !== null;
  }

  /**
   * Obtiene todas las keys almacenadas con el prefijo de la aplicación
   *
   * @param storageType - Tipo de storage
   * @returns Array de keys (sin el prefijo)
   */
  static keys(storageType: StorageType = 'local'): string[] {
    const storage = this.getStorage(storageType);

    if (!storage) {
      return [];
    }

    try {
      const keys: string[] = [];

      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(this.KEY_PREFIX)) {
          // Remover prefijo antes de devolver
          keys.push(key.substring(this.KEY_PREFIX.length));
        }
      }

      return keys;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`Error al obtener keys de ${storageType}Storage:`, error);
      }
      return [];
    }
  }
}

/**
 * Limpia items expirados al cargar el módulo
 */
if (typeof window !== 'undefined') {
  // Limpiar items expirados al cargar
  SessionStorage.cleanExpired();

  // Configurar limpieza periódica cada 5 minutos
  setInterval(() => {
    SessionStorage.cleanExpired();
  }, 1000 * 60 * 5);
}

export default SessionStorage;
