/**
 * @fileoverview Servicio de infraestructura para Activos Tecnológicos
 * @module infrastructure/techAsset.service
 *
 * Implementa operaciones CRUD para activos tecnológicos en Firestore
 */

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  Timestamp
} from "firebase/firestore";
import { db } from "./firebase/firebase";
import { TechAsset, CreateTechAssetInput } from "../domain/entities/techAsset";

/**
 * Nombre de la colección en Firestore
 */
const COLLECTION_NAME = "techAssets";

/**
 * Verifica si ya existe un activo con el mismo número de serie
 * @param serial - Número de serie a verificar
 * @returns true si el serial ya existe, false si no existe
 */
export const checkSerialExists = async (serial: string): Promise<boolean> => {
  try {
    console.log('🔍 Verificando serial:', serial);
    const q = query(
      collection(db, COLLECTION_NAME),
      where("serial", "==", serial)
    );
    const querySnapshot = await getDocs(q);
    console.log('📊 Resultados encontrados:', querySnapshot.size);

    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        console.log('📄 Activo encontrado:', doc.id, doc.data());
      });
    }

    return !querySnapshot.empty;
  } catch (error) {
    console.error('❌ Error al verificar serial:', error);
    throw new Error("Error al verificar el número de serie");
  }
};

/**
 * Agrega un nuevo activo tecnológico a Firestore
 * @param assetData - Datos del activo sin ID ni fecha (se generan automáticamente)
 * @returns ID del activo creado
 */
export const addTechAsset = async (assetData: CreateTechAssetInput): Promise<string> => {
  try {
    // Verificar si el serial ya existe
    const serialExists = await checkSerialExists(assetData.serial);
    if (serialExists) {
      throw new Error(`Ya existe un activo con el serial: ${assetData.serial}`);
    }

    // Generar ID único usando el serial como base
    const assetId = `ASSET-${assetData.serial.toUpperCase()}`;

    // Crear el activo con timestamp de servidor
    await setDoc(doc(db, COLLECTION_NAME, assetId), {
      id: assetId,
      tipo: assetData.tipo,
      marca: assetData.marca,
      modelo: assetData.modelo,
      serial: assetData.serial,
      estado: assetData.estado,
      observaciones: assetData.observaciones || '',
      fechaRegistro: serverTimestamp()
    }, { merge: true });

    console.log('✅ Activo creado con ID:', assetId);
    return assetId;
  } catch (error) {
    console.error('❌ Error al agregar activo:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error al agregar el activo tecnológico");
  }
};

/**
 * Obtiene todos los activos tecnológicos de Firestore
 * @returns Array de activos tecnológicos
 */
export const fetchTechAssets = async (): Promise<TechAsset[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        tipo: data.tipo,
        marca: data.marca,
        modelo: data.modelo,
        serial: data.serial,
        estado: data.estado,
        observaciones: data.observaciones || '',
        fechaRegistro: data.fechaRegistro instanceof Timestamp
          ? data.fechaRegistro.toDate()
          : new Date()
      };
    });
  } catch (error) {
    console.error('❌ Error al cargar activos:', error);
    throw new Error("Error al cargar los activos tecnológicos");
  }
};

/**
 * Obtiene activos tecnológicos filtrados por estado
 * @param estado - Estado del activo a filtrar
 * @returns Array de activos tecnológicos con el estado especificado
 */
export const fetchTechAssetsByStatus = async (
  estado: 'disponible' | 'asignado' | 'mantenimiento' | 'dado_de_baja'
): Promise<TechAsset[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("estado", "==", estado)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        tipo: data.tipo,
        marca: data.marca,
        modelo: data.modelo,
        serial: data.serial,
        estado: data.estado,
        observaciones: data.observaciones || '',
        fechaRegistro: data.fechaRegistro instanceof Timestamp
          ? data.fechaRegistro.toDate()
          : new Date()
      };
    });
  } catch (error) {
    console.error('❌ Error al cargar activos por estado:', error);
    throw new Error("Error al cargar los activos por estado");
  }
};

/**
 * Obtiene activos tecnológicos disponibles (no asignados)
 * @returns Array de activos tecnológicos disponibles
 */
export const fetchAvailableAssets = async (): Promise<TechAsset[]> => {
  return fetchTechAssetsByStatus('disponible');
};

/**
 * Actualiza un activo tecnológico existente
 * @param assetId - ID del activo a actualizar
 * @param updatedData - Datos a actualizar (parciales)
 * @returns true si se actualizó correctamente
 */
export const updateTechAsset = async (
  assetId: string,
  updatedData: Partial<Omit<TechAsset, 'id' | 'fechaRegistro'>>
): Promise<boolean> => {
  try {
    // Si se está actualizando el serial, verificar que no exista
    if (updatedData.serial) {
      const serialExists = await checkSerialExists(updatedData.serial);
      if (serialExists) {
        // Verificar que no sea el mismo activo
        const q = query(
          collection(db, COLLECTION_NAME),
          where("serial", "==", updatedData.serial)
        );
        const querySnapshot = await getDocs(q);
        const existingDoc = querySnapshot.docs[0];

        if (existingDoc && existingDoc.id !== assetId) {
          throw new Error(`Ya existe otro activo con el serial: ${updatedData.serial}`);
        }
      }
    }

    await setDoc(doc(db, COLLECTION_NAME, assetId), updatedData, { merge: true });
    console.log('✅ Activo actualizado:', assetId);
    return true;
  } catch (error) {
    console.error('❌ Error al actualizar activo:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error al actualizar el activo tecnológico");
  }
};

/**
 * Elimina un activo tecnológico de Firestore
 * @param assetId - ID del activo a eliminar
 * @returns true si se eliminó correctamente
 */
export const deleteTechAsset = async (assetId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, assetId));
    console.log('✅ Activo eliminado:', assetId);
    return true;
  } catch (error) {
    console.error('❌ Error al eliminar activo:', error);
    throw new Error("Error al eliminar el activo tecnológico");
  }
};

/**
 * Obtiene un activo tecnológico por su ID
 * @param assetId - ID del activo
 * @returns Activo tecnológico o null si no existe
 */
export const getTechAssetById = async (assetId: string): Promise<TechAsset | null> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("id", "==", assetId)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();

    return {
      id: doc.id,
      tipo: data.tipo,
      marca: data.marca,
      modelo: data.modelo,
      serial: data.serial,
      estado: data.estado,
      observaciones: data.observaciones || '',
      fechaRegistro: data.fechaRegistro instanceof Timestamp
        ? data.fechaRegistro.toDate()
        : new Date()
    };
  } catch (error) {
    console.error('❌ Error al obtener activo por ID:', error);
    throw new Error("Error al obtener el activo tecnológico");
  }
};
