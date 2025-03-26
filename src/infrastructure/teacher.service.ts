// teacher.service.ts
import { getDocs, query, where, documentId, getDoc, doc, collection } from "firebase/firestore";
import { db } from "./firebase/firebase";
import { ClassRoom } from "../domain/entities/classRoom";
import { Area } from "../domain/entities/area";

export const fetchTeacherData = async (userId: string) => {
  try {
    // Obtener usuario desde Firestore
    const userDoc = await getDoc(doc(db, "users", userId));
    const userData = userDoc.data();
    
    // Obtener salones
    const classroomsQuery = query(
      collection(db, "classRooms"),
      where(documentId(), "in", Object.keys(userData?.salones || {}))
    );
    const classroomsSnapshot = await getDocs(classroomsQuery);
    
    // Obtener áreas
    const areasQuery = query(
      collection(db, "areas"),
      where(documentId(), "in", Object.keys(userData?.areas || {}))
    );
    const areasSnapshot = await getDocs(areasQuery);

    return {
      classrooms: classroomsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as ClassRoom),
      areas: areasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Area)
    };
  } catch (error) {
    throw new Error("Error fetching teacher data: " + (error as any).message);
  }
};