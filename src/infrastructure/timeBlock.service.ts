/**
 * @fileoverview Servicio de persistencia para bloques horarios configurables
 * @module infrastructure/timeBlock.service
 *
 * Colección Firestore: `time-blocks`
 * Estructura: un documento por año académico con configuración de bloques
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase/firebase';
import type {
  TimeBlockConfiguration,
  TimeBlock,
} from '../domain/entities/timeBlock';
import {
  generateDefaultBlocksFromLegacy,
  getBlocksForDay,
  getAllUniqueBlocks,
} from '../domain/entities/timeBlock';
import { TIME_SLOTS } from '../domain/entities/schedule';

const COLLECTION = 'time-blocks';

// ============================================
// Leer configuración de bloques de un año
// ============================================

/**
 * Obtiene la configuración de bloques horarios para un año.
 * Si no existe, genera una configuración por defecto desde TIME_SLOTS legacy.
 * @param year - Año académico
 * @returns Configuración de bloques
 */
export const fetchTimeBlockConfig = async (
  year: string
): Promise<TimeBlockConfiguration> => {
  try {
    const snapshot = await getDoc(doc(db, COLLECTION, year));

    if (!snapshot.exists()) {
      // Generar configuración por defecto desde TIME_SLOTS legacy
      const defaultBlocks = generateDefaultBlocksFromLegacy(TIME_SLOTS);
      const config: TimeBlockConfiguration = {
        year,
        blocks: defaultBlocks,
        defaultBlocks: defaultBlocks,
        specialDayBlocks: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Guardar la configuración por defecto inmediatamente
      try {
        await saveTimeBlockConfig(config);
      } catch (saveError) {
        console.warn('No se pudo guardar la configuración por defecto:', saveError);
        // Continuar sin guardar - el usuario lo guardará cuando haga cambios
      }

      return config;
    }

    const data = snapshot.data() as TimeBlockConfiguration;
    return {
      year,
      blocks: data.blocks || [],
      defaultBlocks: data.defaultBlocks || [],
      specialDayBlocks: data.specialDayBlocks || {},
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error al cargar configuración de bloques:', error);
    throw new Error('Error al cargar configuración de bloques horarios');
  }
};

// ============================================
// Guardar configuración de bloques
// ============================================

/**
 * Guarda la configuración completa de bloques para un año.
 * @param config - Configuración a guardar
 */
export const saveTimeBlockConfig = async (
  config: TimeBlockConfiguration
): Promise<void> => {
  try {
    // Limpiar los datos para asegurar que sean serializables
    const cleanBlocks = config.blocks.map(block => ({
      id: block.id,
      startTime: block.startTime,
      duration: block.duration,
      label: block.label || null,
      isBreak: block.isBreak || false,
      daysOfWeek: block.daysOfWeek,
    }));

    const cleanDefaultBlocks = config.defaultBlocks.map(block => ({
      id: block.id,
      startTime: block.startTime,
      duration: block.duration,
      label: block.label || null,
      isBreak: block.isBreak || false,
      daysOfWeek: block.daysOfWeek,
    }));

    const cleanSpecialDayBlocks: Record<number, any[]> = {};
    Object.entries(config.specialDayBlocks).forEach(([day, blocks]) => {
      cleanSpecialDayBlocks[Number(day)] = blocks.map(block => ({
        id: block.id,
        startTime: block.startTime,
        duration: block.duration,
        label: block.label || null,
        isBreak: block.isBreak || false,
        daysOfWeek: block.daysOfWeek,
      }));
    });

    const dataToSave = {
      year: config.year,
      blocks: cleanBlocks,
      defaultBlocks: cleanDefaultBlocks,
      specialDayBlocks: cleanSpecialDayBlocks,
      createdAt: config.createdAt,
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, COLLECTION, config.year), dataToSave);
    console.log('✓ Configuración guardada exitosamente en Firestore');
  } catch (error: any) {
    console.error('❌ Error al guardar configuración de bloques:', {
      error,
      message: error?.message,
      code: error?.code,
      details: error?.details,
      year: config.year,
    });

    // Proporcionar mensaje más específico según el tipo de error
    if (error?.code === 'permission-denied') {
      throw new Error('No tiene permisos para guardar bloques horarios. Configure las reglas de Firestore.');
    } else if (error?.code === 'unavailable') {
      throw new Error('Firestore no está disponible. Verifique su conexión a internet.');
    } else {
      throw new Error(`Error al guardar: ${error?.message || 'Error desconocido'}`);
    }
  }
};

// ============================================
// Operaciones sobre bloques
// ============================================

/**
 * Agrega un nuevo bloque a la configuración.
 * Actualiza automáticamente defaultBlocks o specialDayBlocks según corresponda.
 * @param config - Configuración actual
 * @param newBlock - Nuevo bloque a agregar
 * @returns Configuración actualizada
 */
export const addBlockToConfig = (
  config: TimeBlockConfiguration,
  newBlock: TimeBlock
): TimeBlockConfiguration => {
  const updatedBlocks = [...config.blocks, newBlock];

  // Determinar si es bloque por defecto (L-J) o especial
  const isDefaultBlock =
    newBlock.daysOfWeek.length >= 4 &&
    newBlock.daysOfWeek.includes(0) &&
    newBlock.daysOfWeek.includes(1) &&
    newBlock.daysOfWeek.includes(2) &&
    newBlock.daysOfWeek.includes(3);

  let updatedDefaultBlocks = [...config.defaultBlocks];
  let updatedSpecialDayBlocks = { ...config.specialDayBlocks };

  if (isDefaultBlock) {
    updatedDefaultBlocks.push(newBlock);
  } else {
    // Agregar a días especiales
    newBlock.daysOfWeek.forEach(day => {
      if (!updatedSpecialDayBlocks[day]) {
        updatedSpecialDayBlocks[day] = [];
      }
      updatedSpecialDayBlocks[day] = [...updatedSpecialDayBlocks[day], newBlock];
    });
  }

  return {
    ...config,
    blocks: updatedBlocks,
    defaultBlocks: updatedDefaultBlocks,
    specialDayBlocks: updatedSpecialDayBlocks,
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Actualiza un bloque existente en la configuración.
 * @param config - Configuración actual
 * @param updatedBlock - Bloque actualizado
 * @returns Configuración actualizada
 */
export const updateBlockInConfig = (
  config: TimeBlockConfiguration,
  updatedBlock: TimeBlock
): TimeBlockConfiguration => {
  // Eliminar el bloque anterior
  const withoutOld = removeBlockFromConfig(config, updatedBlock.id);

  // Agregar el bloque actualizado
  return addBlockToConfig(withoutOld, updatedBlock);
};

/**
 * Elimina un bloque de la configuración.
 * @param config - Configuración actual
 * @param blockId - ID del bloque a eliminar
 * @returns Configuración actualizada
 */
export const removeBlockFromConfig = (
  config: TimeBlockConfiguration,
  blockId: string
): TimeBlockConfiguration => {
  const updatedBlocks = config.blocks.filter(b => b.id !== blockId);
  const updatedDefaultBlocks = config.defaultBlocks.filter(b => b.id !== blockId);

  const updatedSpecialDayBlocks: Record<number, TimeBlock[]> = {};
  Object.entries(config.specialDayBlocks).forEach(([day, blocks]) => {
    const filtered = blocks.filter(b => b.id !== blockId);
    if (filtered.length > 0) {
      updatedSpecialDayBlocks[Number(day)] = filtered;
    }
  });

  return {
    ...config,
    blocks: updatedBlocks,
    defaultBlocks: updatedDefaultBlocks,
    specialDayBlocks: updatedSpecialDayBlocks,
    updatedAt: new Date().toISOString(),
  };
};

// ============================================
// Utilidades de consulta
// ============================================

/**
 * Obtiene los bloques aplicables para un día específico.
 * Wrapper conveniente sobre la función de dominio.
 * @param config - Configuración de bloques
 * @param dayOfWeek - Día (0-4)
 * @returns Array de bloques ordenados por hora
 */
export const getBlocksForDayService = (
  config: TimeBlockConfiguration,
  dayOfWeek: number
): TimeBlock[] => {
  return getBlocksForDay(config, dayOfWeek);
};

/**
 * Obtiene todos los bloques únicos (sin repetir por día).
 * Wrapper conveniente sobre la función de dominio.
 * @param config - Configuración de bloques
 * @returns Array de bloques únicos ordenados
 */
export const getAllUniqueBlocksService = (
  config: TimeBlockConfiguration
): TimeBlock[] => {
  return getAllUniqueBlocks(config);
};

/**
 * Busca un bloque por su ID.
 * @param config - Configuración de bloques
 * @param blockId - ID del bloque
 * @returns TimeBlock encontrado o null
 */
export const findBlockById = (
  config: TimeBlockConfiguration,
  blockId: string
): TimeBlock | null => {
  return config.blocks.find(b => b.id === blockId) || null;
};

/**
 * Verifica si existe una configuración persistida para un año.
 * @param year - Año académico
 * @returns true si existe configuración, false si es legacy
 */
export const hasCustomTimeBlocks = async (year: string): Promise<boolean> => {
  try {
    const snapshot = await getDoc(doc(db, COLLECTION, year));
    return snapshot.exists();
  } catch (error) {
    console.error('Error verificando bloques personalizados:', error);
    return false;
  }
};
