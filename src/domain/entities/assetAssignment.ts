/**
 * @fileoverview Entidad de dominio para Asignaciones de Activos Tecnológicos
 * @module domain/entities/assetAssignment
 *
 * Define la estructura de datos para el seguimiento de asignaciones
 * de activos tecnológicos a usuarios (estudiantes/profesores).
 */

import { AssetType } from './techAsset';

/**
 * Estados posibles de una asignación de activo
 */
export type AssignmentStatus =
  | 'activa'      // Asignación vigente, usuario tiene el activo
  | 'devuelta'    // Activo devuelto en buenas condiciones
  | 'perdida'     // Activo reportado como perdido
  | 'dañada';     // Activo devuelto con daños

/**
 * Interfaz principal de Asignación de Activo
 *
 * Representa la asignación de un activo tecnológico a un usuario específico.
 * Incluye campos denormalizados para optimizar consultas y búsquedas.
 */
export interface AssetAssignment {
  /**
   * Identificador único de la asignación
   * Generado automáticamente por Firestore
   * @example "assignment-abc123"
   */
  id: string;

  /**
   * ID del activo asignado
   * Referencia a TechAsset.id
   * @example "LAPTOP-2024-001"
   */
  assetId: string;

  /**
   * Número de serie del activo (denormalizado)
   * Se duplica desde TechAsset.serial para facilitar búsquedas
   * sin hacer joins
   * @example "SN123456789"
   */
  assetSerial: string;

  /**
   * Tipo de activo (denormalizado)
   * Se duplica desde TechAsset.tipo para facilitar filtros
   * @see AssetType
   * @example "Laptop"
   */
  assetTipo: AssetType;

  /**
   * Marca del activo (denormalizado)
   * Se duplica desde TechAsset.marca para mostrar en listados
   * @example "Dell"
   */
  assetMarca: string;

  /**
   * Modelo del activo (denormalizado)
   * Se duplica desde TechAsset.modelo para mostrar en listados
   * @example "Latitude 3420"
   */
  assetModelo: string;

  /**
   * ID del usuario que recibe el activo
   * Puede ser ID de estudiante o profesor
   * @example "1234567890" (documento del estudiante)
   */
  userId: string;

  /**
   * Nombre completo del usuario (denormalizado)
   * Se duplica para facilitar búsquedas y listados sin joins
   * @example "Juan Pérez García"
   */
  userName: string;

  /**
   * Tipo de usuario que recibe el activo
   * Permite diferenciar entre estudiantes y profesores
   */
  userType: 'estudiante' | 'profesor';

  /**
   * Fecha en que se entregó el activo al usuario
   * @example new Date('2024-02-15')
   */
  fechaEntrega: Date;

  /**
   * Nombre completo de la persona que entrega el activo
   * Generalmente un coordinador o administrador
   * @example "María López (Coordinadora)"
   */
  quienEntrega: string;

  /**
   * Estado actual de la asignación
   * @see AssignmentStatus
   */
  estado: AssignmentStatus;

  /**
   * Fecha en que se devolvió el activo (si aplica)
   * Solo se llena cuando estado cambia a 'devuelta', 'perdida' o 'dañada'
   * @optional
   * @example new Date('2024-06-20')
   */
  fechaDevolucion?: Date;

  /**
   * Observaciones sobre la asignación o devolución
   * Puede incluir: condición del activo al entregar/devolver,
   * accesorios incluidos, daños reportados, etc.
   * @optional
   * @example "Activo entregado con cargador y mouse. Usuario firmó acta de responsabilidad."
   */
  observaciones?: string;

  /**
   * Descripción de daños (si aplica)
   * Solo relevante cuando estado es 'dañada'
   * @optional
   * @example "Pantalla quebrada en esquina superior derecha. Batería no carga."
   */
  descripcionDanios?: string;
}

/**
 * Tipo para crear una nueva asignación (sin ID ni fecha de devolución)
 */
export type CreateAssetAssignmentInput = Omit<
  AssetAssignment,
  'id' | 'fechaDevolucion' | 'descripcionDanios'
> & {
  observaciones?: string;
};

/**
 * Tipo para actualizar una asignación existente
 */
export type UpdateAssetAssignmentInput = Partial<Omit<AssetAssignment, 'id'>> & {
  id: string;
};

/**
 * Tipo para marcar una asignación como devuelta
 */
export type ReturnAssetInput = {
  assignmentId: string;
  fechaDevolucion: Date;
  estado: 'devuelta' | 'perdida' | 'dañada';
  observaciones?: string;
  descripcionDanios?: string;
};

/**
 * Tipo para filtros de búsqueda de asignaciones
 */
export type AssetAssignmentFilters = {
  userId?: string;
  assetId?: string;
  estado?: AssignmentStatus;
  userType?: 'estudiante' | 'profesor';
  assetTipo?: AssetType;
  fechaDesde?: Date;
  fechaHasta?: Date;
};
