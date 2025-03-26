import { addDoc, collection } from 'firebase/firestore';
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