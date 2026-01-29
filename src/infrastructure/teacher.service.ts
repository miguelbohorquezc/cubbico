// teacher.service.ts
import { getDocs, query, where, documentId, getDoc, doc, collection } from "firebase/firestore";
import { db } from "./firebase/firebase";
import { ClassRoom } from "../domain/entities/classRoom";
import { Area } from "../domain/entities/area";
import { AchievementData } from "../domain/entities/achievementData";

export const fetchTeacherData = async (userId: string) => {
  try {
    // Obtener usuario desde Firestore
    const userDoc = await getDoc(doc(db, "users", userId));
    const userData = userDoc.data();

    const salonesKeys = Object.keys(userData?.salones || {});
    const areasKeys = Object.keys(userData?.areas || {});

    // Obtener salones (solo si hay salones asignados)
    let classroomsSnapshot: any = { docs: [] };
    if (salonesKeys.length > 0) {
      const classroomsQuery = query(
        collection(db, "classRooms"),
        where(documentId(), "in", salonesKeys)
      );
      classroomsSnapshot = await getDocs(classroomsQuery);
    }

    // Obtener áreas (solo si hay áreas asignadas)
    let areasSnapshot: any = { docs: [] };
    if (areasKeys.length > 0) {
      const areasQuery = query(
        collection(db, "areas"),
        where(documentId(), "in", areasKeys)
      );
      areasSnapshot = await getDocs(areasQuery);
    }

    // Obtener logros del docente
    const achievementsQuery = query(
      collection(db, "achievements"),
      where("teacherId", "==", userId)
    );
    const achievementsSnapshot = await getDocs(achievementsQuery);

    return {
      classrooms: classroomsSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }) as ClassRoom),
      areas: areasSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }) as Area),
      achievements: achievementsSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }) as AchievementData)
    };
  } catch (error) {
    throw new Error("Error fetching teacher data: " + (error as any).message);
  }
};