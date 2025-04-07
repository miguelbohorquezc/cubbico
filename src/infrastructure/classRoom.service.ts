import { addDoc, collection, getDocs } from 'firebase/firestore';
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