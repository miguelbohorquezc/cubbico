import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { db } from "./firebase/firebase";
import { studentInfo } from "../../domain/entities/user.student";


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

// Nueva función para obtener estudiantes
export const getStudents = async (): Promise<studentInfo[]> => {
    const querySnapshot = await getDocs(collection(db, "student"));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }) as studentInfo);
  };



