import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "./firebase/firebase";
import { AreaServiceData } from "../shared/types/areaTypes";


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



