/**
 * @fileoverview Servicio de infraestructura para Asignaciones de Activos Tecnológicos
 * @module infrastructure/assetAssignment.service
 *
 * Implementa operaciones CRUD para asignaciones de activos a usuarios en Firestore
 */

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  Timestamp,
  writeBatch,
  addDoc,
  orderBy
} from "firebase/firestore";
import { db } from "./firebase/firebase";
import {
  AssetAssignment,
  CreateAssetAssignmentInput,
  ReturnAssetInput
} from "../domain/entities/assetAssignment";

/**
 * Nombre de la colección en Firestore
 */
const COLLECTION_NAME = "assetAssignments";

/**
 * Convierte un documento de Firestore a AssetAssignment
 * @param docData - Datos del documento de Firestore
 * @param docId - ID del documento
 * @returns AssetAssignment
 */
const convertToAssetAssignment = (docData: any, docId: string): AssetAssignment => {
  return {
    id: docId,
    assetId: docData.assetId,
    assetSerial: docData.assetSerial,
    assetTipo: docData.assetTipo,
    assetMarca: docData.assetMarca,
    assetModelo: docData.assetModelo,
    userId: docData.userId,
    userName: docData.userName,
    userType: docData.userType,
    fechaEntrega: docData.fechaEntrega instanceof Timestamp
      ? docData.fechaEntrega.toDate()
      : new Date(),
    quienEntrega: docData.quienEntrega,
    estado: docData.estado,
    fechaDevolucion: docData.fechaDevolucion instanceof Timestamp
      ? docData.fechaDevolucion.toDate()
      : undefined,
    observaciones: docData.observaciones || '',
    descripcionDanios: docData.descripcionDanios || undefined
  };
};

/**
 * Crea una nueva asignación de activo a usuario
 * @param assignmentData - Datos de la asignación
 * @returns ID de la asignación creada
 */
export const createAssignment = async (
  assignmentData: CreateAssetAssignmentInput
): Promise<string> => {
  try {
    // Crear la asignación en Firestore
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      assetId: assignmentData.assetId,
      assetSerial: assignmentData.assetSerial,
      assetTipo: assignmentData.assetTipo,
      assetMarca: assignmentData.assetMarca,
      assetModelo: assignmentData.assetModelo,
      userId: assignmentData.userId,
      userName: assignmentData.userName,
      userType: assignmentData.userType,
      fechaEntrega: assignmentData.fechaEntrega,
      quienEntrega: assignmentData.quienEntrega,
      estado: assignmentData.estado,
      observaciones: assignmentData.observaciones || ''
    });

    console.log('✅ Asignación creada con ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error al crear asignación:', error);
    throw new Error("Error al crear la asignación de activo");
  }
};

/**
 * Obtiene todas las asignaciones de activos
 * @returns Array de asignaciones
 */
export const fetchAssignments = async (): Promise<AssetAssignment[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy("fechaEntrega", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc =>
      convertToAssetAssignment(doc.data(), doc.id)
    );
  } catch (error) {
    console.error('❌ Error al cargar asignaciones:', error);
    throw new Error("Error al cargar las asignaciones de activos");
  }
};

/**
 * Obtiene asignaciones filtradas por usuario
 * @param userId - ID del usuario
 * @returns Array de asignaciones del usuario
 */
export const fetchAssignmentsByUser = async (userId: string): Promise<AssetAssignment[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", userId),
      orderBy("fechaEntrega", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc =>
      convertToAssetAssignment(doc.data(), doc.id)
    );
  } catch (error) {
    console.error('❌ Error al cargar asignaciones por usuario:', error);
    throw new Error("Error al cargar asignaciones por usuario");
  }
};

/**
 * Obtiene asignaciones filtradas por activo
 * @param assetId - ID del activo
 * @returns Array de asignaciones del activo (historial)
 */
export const fetchAssignmentsByAsset = async (assetId: string): Promise<AssetAssignment[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("assetId", "==", assetId),
      orderBy("fechaEntrega", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc =>
      convertToAssetAssignment(doc.data(), doc.id)
    );
  } catch (error) {
    console.error('❌ Error al cargar asignaciones por activo:', error);
    throw new Error("Error al cargar asignaciones por activo");
  }
};

/**
 * Obtiene solo las asignaciones activas (vigentes)
 * @returns Array de asignaciones activas
 */
export const fetchActiveAssignments = async (): Promise<AssetAssignment[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("estado", "==", "activa"),
      orderBy("fechaEntrega", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc =>
      convertToAssetAssignment(doc.data(), doc.id)
    );
  } catch (error) {
    console.error('❌ Error al cargar asignaciones activas:', error);
    throw new Error("Error al cargar asignaciones activas");
  }
};

/**
 * Verifica si un activo tiene una asignación activa
 * @param assetId - ID del activo
 * @returns true si tiene asignación activa, false si está disponible
 */
export const checkActiveAssignment = async (assetId: string): Promise<boolean> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("assetId", "==", assetId),
      where("estado", "==", "activa")
    );
    const querySnapshot = await getDocs(q);

    return !querySnapshot.empty;
  } catch (error) {
    console.error('❌ Error al verificar asignación activa:', error);
    throw new Error("Error al verificar asignación activa");
  }
};

/**
 * Obtiene la asignación activa de un activo
 * @param assetId - ID del activo
 * @returns Asignación activa o null si no existe
 */
export const getActiveAssignmentByAsset = async (
  assetId: string
): Promise<AssetAssignment | null> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("assetId", "==", assetId),
      where("estado", "==", "activa")
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return convertToAssetAssignment(doc.data(), doc.id);
  } catch (error) {
    console.error('❌ Error al obtener asignación activa:', error);
    throw new Error("Error al obtener asignación activa");
  }
};

/**
 * Actualiza una asignación existente
 * @param assignmentId - ID de la asignación
 * @param updatedData - Datos a actualizar (parciales)
 * @returns true si se actualizó correctamente
 */
export const updateAssignment = async (
  assignmentId: string,
  updatedData: Partial<Omit<AssetAssignment, 'id'>>
): Promise<boolean> => {
  try {
    await setDoc(doc(db, COLLECTION_NAME, assignmentId), updatedData, { merge: true });
    console.log('✅ Asignación actualizada:', assignmentId);
    return true;
  } catch (error) {
    console.error('❌ Error al actualizar asignación:', error);
    throw new Error("Error al actualizar la asignación");
  }
};

/**
 * Elimina una asignación
 * @param assignmentId - ID de la asignación a eliminar
 * @returns true si se eliminó correctamente
 */
export const deleteAssignment = async (assignmentId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, assignmentId));
    console.log('✅ Asignación eliminada:', assignmentId);
    return true;
  } catch (error) {
    console.error('❌ Error al eliminar asignación:', error);
    throw new Error("Error al eliminar la asignación");
  }
};

/**
 * Marca una asignación como devuelta y actualiza el estado del activo
 * Operación atómica usando writeBatch
 * @param returnData - Datos de la devolución
 * @returns true si se procesó correctamente
 */
export const returnAsset = async (returnData: ReturnAssetInput): Promise<boolean> => {
  try {
    const batch = writeBatch(db);

    // Actualizar la asignación
    const assignmentRef = doc(db, COLLECTION_NAME, returnData.assignmentId);
    batch.update(assignmentRef, {
      estado: returnData.estado,
      fechaDevolucion: returnData.fechaDevolucion,
      observaciones: returnData.observaciones || '',
      descripcionDanios: returnData.descripcionDanios || ''
    });

    // Commit de la transacción
    await batch.commit();
    console.log('✅ Activo devuelto exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error al devolver activo:', error);
    throw new Error("Error al procesar la devolución del activo");
  }
};

/**
 * Obtiene asignaciones filtradas por tipo de usuario
 * @param userType - Tipo de usuario ('estudiante' o 'profesor')
 * @returns Array de asignaciones del tipo de usuario especificado
 */
export const fetchAssignmentsByUserType = async (
  userType: 'estudiante' | 'profesor'
): Promise<AssetAssignment[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("userType", "==", userType),
      orderBy("fechaEntrega", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc =>
      convertToAssetAssignment(doc.data(), doc.id)
    );
  } catch (error) {
    console.error('❌ Error al cargar asignaciones por tipo de usuario:', error);
    throw new Error("Error al cargar asignaciones por tipo de usuario");
  }
};

/**
 * Obtiene asignaciones filtradas por estado
 * @param estado - Estado de la asignación
 * @returns Array de asignaciones con el estado especificado
 */
export const fetchAssignmentsByStatus = async (
  estado: 'activa' | 'devuelta' | 'perdida' | 'dañada'
): Promise<AssetAssignment[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("estado", "==", estado),
      orderBy("fechaEntrega", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc =>
      convertToAssetAssignment(doc.data(), doc.id)
    );
  } catch (error) {
    console.error('❌ Error al cargar asignaciones por estado:', error);
    throw new Error("Error al cargar asignaciones por estado");
  }
};
