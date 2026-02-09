import { collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where, writeBatch } from "firebase/firestore";
import { db } from "./firebase/firebase";
import { studentInfo } from "../domain/entities/studentInfo";
import {  Student } from "../presentation/components/notes/types";
import { BatchStudentData } from "../domain/entities/batchStudentData";
import { ClassRoom } from "../domain/entities/classRoom";
import { FirebaseUser } from "../domain/entities/firebaseUser";

/**
 * Verifica si ya existe un estudiante con el mismo número de documento
 * @param document - Número de documento a verificar
 * @returns true si el documento ya existe, false si no existe
 */
export const checkDocumentExists = async (document: string): Promise<boolean> => {
  try {
    console.log('🔍 Buscando documento:', document);
    const q = query(
      collection(db, "student"),
      where("document", "==", document)
    );
    const querySnapshot = await getDocs(q);
    console.log('📊 Resultados encontrados:', querySnapshot.size);
    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        console.log('📄 Documento encontrado:', doc.id, doc.data());
      });
    }
    return !querySnapshot.empty;
  } catch (error) {
    console.error('❌ Error al verificar documento:', error);
    throw new Error("Error al verificar el documento");
  }
};

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

    // Alert removed - now handled by Toast notification in the UI
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

/**
 * Obtiene los metadatos históricos del salón para guardar en el historial académico
 * @param classroomId - ID del salón
 * @returns Metadatos del salón (nivel, nombreGrado, nombreDirector)
 */
const getClassroomHistoricalMetadata = async (
  classroomId: string
): Promise<{ nivel: string; nombreGrado: string; nombreDirector: string }> => {
  try {
    // Obtener datos del salón
    const classroomDoc = await getDoc(doc(db, "classRooms", classroomId));

    if (!classroomDoc.exists()) {
      console.warn(`⚠️ Salón ${classroomId} no encontrado, usando valores por defecto`);
      return {
        nivel: 'Primaria',
        nombreGrado: 'Sin especificar',
        nombreDirector: 'Sin asignar'
      };
    }

    const classroomData = classroomDoc.data() as ClassRoom;
    const nivel = classroomData.nivel || 'Primaria';
    const nombreGrado = classroomData.nombreSalon || 'Sin especificar';
    const directorGrupoUid = classroomData.directorGrupo;

    // Obtener nombre del director si existe
    let nombreDirector = 'Sin asignar';
    if (directorGrupoUid) {
      try {
        const userDoc = await getDoc(doc(db, "users", directorGrupoUid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as FirebaseUser;
          nombreDirector = userData.displayName || userData.email || 'Sin nombre';
        }
      } catch (error) {
        console.warn(`⚠️ No se pudo obtener el nombre del director ${directorGrupoUid}:`, error);
      }
    }

    return { nivel, nombreGrado, nombreDirector };
  } catch (error) {
    console.error('❌ Error al obtener metadatos del salón:', error);
    // Retornar valores por defecto en caso de error
    return {
      nivel: 'Primaria',
      nombreGrado: 'Sin especificar',
      nombreDirector: 'Sin asignar'
    };
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
    // Validar que hay datos para guardar
    if (!studentsData || studentsData.length === 0) {
      throw new Error('No hay datos de estudiantes para guardar');
    }

    // Validar que todos los datos necesarios están presentes
    studentsData.forEach((studentData, index) => {
      if (!studentData.studentId || !studentData.year || !studentData.period || !studentData.areaId) {
        throw new Error(`Datos incompletos en el estudiante ${index + 1}`);
      }
      if (!studentData.teacherId) {
        throw new Error('teacherId es requerido para guardar las calificaciones');
      }
    });

    // Obtener metadatos históricos de todos los salones únicos
    const uniqueClassroomIds = [...new Set(studentsData.map(s => s.classroomId).filter(Boolean))];
    const classroomMetadataCache = new Map<string, { nivel: string; nombreGrado: string; nombreDirector: string }>();

    // Cachear metadatos de salones para evitar consultas duplicadas
    await Promise.all(
      uniqueClassroomIds.map(async (classroomId) => {
        if (classroomId) {
          const metadata = await getClassroomHistoricalMetadata(classroomId);
          classroomMetadataCache.set(classroomId, metadata);
        }
      })
    );

    studentsData.forEach((studentData) => {
      const studentRef = doc(db, "history", studentData.studentId);

      // Obtener metadatos del salón del caché
      const classroomMetadata = studentData.classroomId
        ? classroomMetadataCache.get(studentData.classroomId)
        : null;

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
                      achievementId: studentData.achievementId,
                      lastUpdate: timestamp,
                      // Metadatos históricos del salón
                      ...(classroomMetadata && {
                        nivel: classroomMetadata.nivel,
                        nombreGrado: classroomMetadata.nombreGrado,
                        nombreDirector: classroomMetadata.nombreDirector
                      })
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
    console.log(`✅ Calificaciones guardadas exitosamente: ${studentsData.length} estudiantes`);
    return { success: true, count: studentsData.length };
  } catch (error) {
    console.error('❌ Error en bulkSaveStudents:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al guardar';
    throw new Error(`Error al guardar calificaciones: ${errorMessage}`);
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