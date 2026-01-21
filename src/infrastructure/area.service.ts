import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "./firebase/firebase";
import { AreaServiceData, ReorderAreasPayload } from "../shared/types/areaTypes";


export const addArea = async (area: Omit<AreaServiceData, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'areas'), {
        ...area,
        createdAt: new Date().toISOString()
      });
      return docRef.id; // Retorna el ID generado por Firestore
    } catch (error) {
      console.error('Error adding area:', error);
      throw error;
    }
  };
  
export const fetchAreas = async (): Promise<AreaServiceData[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, "areas"));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        orden: doc.data().orden,
        asignatura: doc.data().asignatura,
        ihs: doc.data().ihs,
        area: doc.data().area,
        nivel: doc.data().nivel
      }));
    } catch (error) {
      console.error("Error al cargar áreas:", error);
      throw new Error("Error al cargar áreas");
    }
};
  
export const updateArea = async (areaId: string, updatedData: Partial<AreaServiceData>) => {
    try {
      await updateDoc(doc(db, "areas", areaId), updatedData);
      return true;
    } catch (error) {
      console.error("Error updating area:", error);
      throw error;
    }
  };
  
export const deleteArea = async (areaId: string) => {
    try {
      await deleteDoc(doc(db, "areas", areaId));
      return true;
    } catch (error) {
      console.error("Error deleting area:", error);
      throw new Error("Error al eliminar área");
    }
};

/**
 * Actualiza el orden de múltiples áreas en una transacción atómica.
 * Usa writeBatch de Firestore para garantizar que todas las actualizaciones
 * se apliquen o ninguna.
 *
 * @param payload - Objeto con el nivel y la lista de áreas con su nuevo orden
 * @returns Promise<void>
 * @throws Error si la operación falla
 *
 * @example
 * await updateAreasOrder({
 *   nivel: 'Primaria',
 *   areas: [
 *     { id: 'abc123', orden: 1 },
 *     { id: 'def456', orden: 2 }
 *   ]
 * });
 */
export const updateAreasOrder = async (payload: ReorderAreasPayload): Promise<void> => {
  const { areas } = payload;

  if (!areas || areas.length === 0) {
    return;
  }

  try {
    const batch = writeBatch(db);

    for (const area of areas) {
      if (!area.id) {
        console.warn('Área sin ID encontrada, saltando:', area);
        continue;
      }

      const areaRef = doc(db, "areas", area.id);
      batch.update(areaRef, { orden: area.orden });
    }

    await batch.commit();
  } catch (error) {
    console.error("Error al actualizar orden de áreas:", error);
    throw new Error("Error al guardar el nuevo orden de las asignaturas");
  }
};



