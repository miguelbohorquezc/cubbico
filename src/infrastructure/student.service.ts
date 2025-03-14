import { collection, doc, getDocs, query, serverTimestamp, setDoc, where, writeBatch } from "firebase/firestore";
import { db } from "./firebase/firebase";
import { studentInfo } from "../domain/entities/user.student";
import { Grade, Student } from "../presentation/components/notes/types";
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
      ...doc.data()
    } as Student));
    
    
    } catch (error) {
      throw new Error("Error al cargar los estudiantes");
    }
};

export const bulkSaveStudents = async (studentsData: BatchStudentData[]) => {
  const batch = writeBatch(db);
  const timestamp = serverTimestamp();
  
  try {
    studentsData.forEach(({
      studentId,
      year,
      period,
      areaId,
      grades,
      logros,
      teacherId,
      classroomId
    }) => {
      const studentRef = doc(db, "history", studentId);
      
      // Estructura de actualización con merge
      const updateData = {
        currentYear: year,
        [`years.${year}.periods.${period}.areas.${areaId}`]: {
          grades,
          logros,
          metadata: {
            teacherId,
            classroomId,
            lastUpdate: timestamp,
            evaluators: { [teacherId]: timestamp }  // Registro de profesores
          }
        },
        [`years.${year}.periods.${period}.lastModified`]: timestamp
      };

      batch.set(studentRef, updateData, { merge: true });
    });

    await batch.commit();
    return { success: true, count: studentsData.length };
  } catch (error) {
    console.error("Error en guardado masivo:", error);
    throw new Error(`Error al guardar lote: ${error instanceof Error ? error.message : error}`);
  }
};