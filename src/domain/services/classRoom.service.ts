import { addDoc, collection } from 'firebase/firestore';
import { db } from './firebase/firebase';
import { ClassRoomDoc } from '../../shared/types/classRoomTypes';

export const addClassroom = async (classroom: ClassRoomDoc) => {
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