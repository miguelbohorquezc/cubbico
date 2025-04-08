import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from './firebase/firebase';
import { ClassRoom } from '../domain/entities/classRoom';

export const addClassroom = async (classroom: ClassRoom) => {
  try {
    const docRef = await addDoc(collection(db, 'classRooms'), {
      ...classroom,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding classroom:', error);
    throw error;
  }
};

export const fetchClassrooms = async (): Promise<ClassRoom[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "classRooms"));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      nombreSalon: doc.data().nombreSalon,
      nivel: doc.data().nivel,
      directorGrupo: doc.data().directorGrupo,
      identificador: doc.data().identificador
    }));
  } catch (error) {
    console.error("Error al cargar salones:", error);
    throw new Error("Error al cargar salones");
  }
};

export const updateClassroom = async (classroomId: string, updatedData: Partial<ClassRoom>) => {
  try {
    await updateDoc(doc(db, "classRooms", classroomId), updatedData);
    return true;
  } catch (error) {
    console.error("Error updating classroom:", error);
    throw new Error("Error al actualizar salón");
  }
};

export const deleteClassroom = async (classroomId: string) => {
  try {
    await deleteDoc(doc(db, "classRooms", classroomId));
    return true;
  } catch (error) {
    console.error("Error deleting classroom:", error);
    throw new Error("Error al eliminar salón");
  }
};