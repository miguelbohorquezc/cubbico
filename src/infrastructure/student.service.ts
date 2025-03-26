import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where, writeBatch } from "firebase/firestore";
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
        caracter: student.caracter
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