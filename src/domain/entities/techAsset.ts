/**
 * @fileoverview Entidad de dominio para Activos Tecnológicos
 * @module domain/entities/techAsset
 *
 * Define la estructura de datos para los activos tecnológicos
 * de la institución (laptops, tablets, proyectores, etc.)
 */

/**
 * Tipos de activos tecnológicos disponibles en el sistema
 */
export type AssetType =
  | 'Laptop'
  | 'Tablet'
  | 'Proyector'
  | 'Cargador'
  | 'Mouse'
  | 'Teclado'
  | 'Audífonos'
  | 'Cámara Web'
  | 'Parlante'
  | 'Otro';

/**
 * Estados posibles de un activo tecnológico
 */
export type AssetStatus =
  | 'disponible'      // Activo disponible para asignar
  | 'asignado'        // Activo asignado a un usuario
  | 'mantenimiento'   // Activo en mantenimiento técnico
  | 'dado_de_baja';   // Activo dado de baja (dañado irreparablemente, obsoleto, etc.)

/**
 * Interfaz principal de Activo Tecnológico
 *
 * Representa un activo tecnológico de la institución educativa
 * que puede ser asignado a estudiantes o profesores.
 */
export interface TechAsset {
  /**
   * Identificador único del activo (puede ser serial o ID generado)
   * @example "LAPTOP-2024-001"
   */
  id: string;

  /**
   * Tipo de activo tecnológico
   * @see AssetType
   */
  tipo: AssetType;

  /**
   * Marca del activo
   * @example "Dell", "HP", "Lenovo", "Samsung"
   */
  marca: string;

  /**
   * Modelo específico del activo
   * @example "Latitude 3420", "iPad Air", "Epson S41+"
   */
  modelo: string;

  /**
   * Número de serie del activo (único por fabricante)
   * Este campo es crítico para identificación y garantías
   * @example "SN123456789"
   */
  serial: string;

  /**
   * Estado actual del activo
   * @see AssetStatus
   */
  estado: AssetStatus;

  /**
   * Observaciones adicionales sobre el activo
   * Puede incluir: condición física, accesorios incluidos,
   * historial de reparaciones, etc.
   * @optional
   * @example "Incluye cargador original. Batería reemplazada en 2023."
   */
  observaciones?: string;

  /**
   * Fecha de registro del activo en el sistema
   * @example new Date('2024-01-15')
   */
  fechaRegistro: Date;
}

/**
 * Tipo para crear un nuevo activo (sin ID ni fecha, generados automáticamente)
 */
export type CreateTechAssetInput = Omit<TechAsset, 'id' | 'fechaRegistro'>;

/**
 * Tipo para actualizar un activo existente (todos los campos opcionales excepto ID)
 */
export type UpdateTechAssetInput = Partial<Omit<TechAsset, 'id'>> & { id: string };
