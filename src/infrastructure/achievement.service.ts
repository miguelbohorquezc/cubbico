// achievement.service.ts
import { addDoc, collection, doc, setDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase/firebase";

export interface AchievementData {
  id?: string;
  classroomId: string;
  areaId: string;
  period: number;
  logros: {
    logro1: string;
    logro2: string;
    logro3: string;
  };
}

export const getAchievement = async (classroomId: string, areaId: string, period: number) => {
  try {
    const q = query(
      collection(db, "achievements"),
      where("classroomId", "==", classroomId),
      where("areaId", "==", areaId),
      where("period", "==", period)
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    
    const docData = querySnapshot.docs[0].data();
    return {
      id: querySnapshot.docs[0].id,
      ...docData
    } as AchievementData;
  } catch (error) {
    console.error('Error fetching achievement:', error);
    throw error;
  }
};

export const addAchievement = async (achievement: Omit<AchievementData, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, "achievements"), {
      ...achievement,
      createdAt: new Date()
    });
    console.log('Document written with ID: ', docRef.id);
    updateAchievement(docRef.id, { id: docRef.id });
    return docRef.id;
  } catch (error) {
    console.error('Error saving achievements:', error);
    throw new Error('Error al guardar los logros');
  }
};

export const updateAchievement = async (docId: string, achievement: Partial<AchievementData>) => {
  try {
    await setDoc(doc(db, "achievements", docId), 
    achievement,
    { merge: true });
    return docId;
  } catch (error) {
    console.error('Error updating achievements:', error);
    throw error;
  }
};

export const fetchAllAchievements = async (teacherId: string) => {
  try {
    const q = query(
      collection(db, "achievements"),
      where("teacherId", "==", teacherId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AchievementData[];
  } catch (error) {
    console.error('Error fetching achievements:', error);
    throw error;
  }
};