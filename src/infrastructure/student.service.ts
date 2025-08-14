import { collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where, writeBatch } from "firebase/firestore";
import { db } from "./firebase/firebase";
import { studentInfo } from "../domain/entities/studentInfo";
import {  Student } from "../presentation/components/notes/types";
import { BatchStudentData } from "../domain/entities/batchStudentData";


export const addStudent = async (student: studentInfo ) =>{

    await setDoc(doc(db, "student", student.id), {
        id: student.id,
        document: student.document,
        name: student.name,
        lastName: student.lastName,
        classRoom: student.classRoom,
        className: student.className,
        caracter: student.caracter,
        classroomId: student.classroomId
    },{merge: true});
    
    alert(`El estudiante: ${student.name} ${student.lastName} Ha sido matriculado en el salón ${student.classRoom}.`);
}

export const fetchStudentsByClassroom = async (classroomId: string): Promise<Student[]> => {
  try {
    const q = query(
      collection(db, "student"),
      where("classroomId", "==", classroomId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      lastName: doc.data().lastName,
      document: doc.data().document,
      classroomId: doc.data().classroomId,
      caracter: doc.data().caracter,
      className: doc.data().className,
      classRoom: doc.data().classRoom
    }));
    
  } catch (error) {
    throw new Error("Error al cargar estudiantes");
  }
};

export const fetchStudents = async (): Promise<Student[]> => {
  try {
    const q = query(
      collection(db, "student")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      lastName: doc.data().lastName,
      document: doc.data().document,
      classroomId: doc.data().classroomId,
      caracter: doc.data().caracter,
      className: doc.data().className,
      classRoom: doc.data().classRoom
    }));
    
  } catch (error) {
    throw new Error("Error al cargar estudiantes");
  }
};

/* export const fetchStudentGrades = async (
  studentId: string,
  year: string,
  period: string,
  areaId: string
) => {
  try {
    const docRef = doc(db, "history", studentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const yearsData = docSnap.data()?.years || {};
    const periodData = yearsData[year]?.periods?.[period] || {};
    const areaData = periodData.areas?.[areaId] || {};

    return {
      l1: areaData.grades?.l1?.toString() || '',
      l2: areaData.grades?.l2?.toString() || '',
      l3: areaData.grades?.l3?.toString() || '',
      fallas: areaData.grades?.fallas?.toString() || ''
    };
    
  } catch (error) {
    throw new Error("Error al cargar calificaciones");
  }
}; */

export const fetchStudentGrades = async (
  studentId: string,
  year: string,
  period: string,
  areaId: string
) => {
  try {
    const docRef = doc(db, "history", studentId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;

    const data = docSnap.data() ?? {};

    // helpers: accede al nodo de período probando "years[year]" y "[year]" (raíz),
    // y periodId como "2" y 2.
    const getPeriodNode = (root: any) =>
      root?.periods?.[period] ??
      root?.periods?.[Number(period)] ??
      undefined;

    // esquema A: years[year]...
    const nodeA = getPeriodNode(data?.years?.[year]);
    // esquema B: year en la raíz (como en tu screenshot)
    const nodeB = getPeriodNode(data?.[year]);

    const periodNode = nodeA ?? nodeB;
    const areaNode = periodNode?.areas?.[areaId];
    const gradesNode = areaNode?.grades ?? {};

    // devuelve TODO como string para que el <input> lo renderice
    const l1  = gradesNode.l1 ?? '';
    const l2  = gradesNode.l2 ?? '';
    const l3  = gradesNode.l3 ?? '';
    const fallas = gradesNode.fallas ?? '';

    // soporta camelCase y snake_case por si acaso
    const fallasVerificadas =
      gradesNode.fallasVerificadas ??
      gradesNode.fallas_verificadas ??
      '';

    return {
      l1: String(l1),
      l2: String(l2),
      l3: String(l3),
      fallas: String(fallas),
      fallasVerificadas: String(fallasVerificadas),
    };
  } catch (error) {
    throw new Error("Error al cargar calificaciones");
  }
};


export const bulkSaveStudents = async (studentsData: BatchStudentData[]) => {
  const batch = writeBatch(db);
  const timestamp = serverTimestamp();

  try {
    studentsData.forEach((studentData) => {
      const studentRef = doc(db, "history", studentData.studentId);
      
      const updateData = {
        years: {
          [studentData.year]: {
            periods: {
              [studentData.period]: {
                areas: {
                  [studentData.areaId]: {
                    grades: studentData.grades,
                    metadata: {
                      teacherId: studentData.teacherId,
                      classroomId: studentData.classroomId,
                      achievementId: studentData.achievementId, // Nuevo campo
                      lastUpdate: timestamp
                    }
                  }
                }
              }
            }
          }
        }
      };

      batch.set(studentRef, updateData, { merge: true });
    });

    await batch.commit();
    return { success: true, count: studentsData.length };
  } catch (error) {
    throw new Error(`Error al guardar: ${error instanceof Error ? error.message : error}`);
  }
}

export const updateStudent = async (studentId: string, updatedData: Partial<Student>) => {
  try {
    await setDoc(doc(db, "student", studentId), updatedData, { merge: true });
    return true;
  } catch (error) {
    throw new Error("Error al actualizar estudiante");
  }
};

export const deleteStudent = async (studentId: string) => {
  try {
    await deleteDoc(doc(db, "student", studentId));
    return true;
  } catch (error) {
    throw new Error("Error al eliminar estudiante");
  }
};