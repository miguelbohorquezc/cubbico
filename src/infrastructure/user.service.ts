import { collection, getDocs, doc, setDoc, deleteDoc, query, where } from "firebase/firestore";
import { auth, db } from "./firebase/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Area } from "../domain/entities/area";
import { ClassRoom } from "../domain/entities/classRoom";
import { UserFormData } from "../domain/entities/userFormData";
import { DocenteOption } from "../shared/types/classRoomTypes";


export const createUser = async (userData: UserFormData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );
    
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: userData.email,
      role: userData.role,
      areas: userData.areas,
      salones: userData.salones,
      directorGrupo: userData.directorGrupo,
      createdAt: new Date()
    });

    return userCredential.user.uid;
  } catch (error) {
    throw new Error("Error creating user: " + error);
  }
};

export const getAreas = async (): Promise<Area[]> => {
  const snapshot = await getDocs(collection(db, "areas"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Area));
};

export const getClassRooms = async (): Promise<ClassRoom[]> => {
  const snapshot = await getDocs(collection(db, "classRooms"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClassRoom));
};

export const assignRoles = async (userId: string, roleData: {
  role: string;
  areas: Record<string, boolean>;
  salones: Record<string, boolean>;
  directorGrupo: string;
}) => {
  await setDoc(doc(db, "users", userId), roleData, { merge: true });
};

export const deleteUser = async (userId: string) => {
  try {
    await deleteDoc(doc(db, "users", userId));
    // También podrías eliminar el usuario de autenticación si es necesario
  } catch (error) {
    throw new Error("Error deleting user: " + error);
  }
};

export const updateUser = async (userId: string, userData: Partial<UserFormData>) => {
  try {
    await setDoc(doc(db, "users", userId), userData, { merge: true });
  } catch (error) {
    throw new Error("Error updating user: " + error);
  }
};

export const getUsers = async (): Promise<any[]> => {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Obtiene la lista de docentes activos para el selector de director de grupo.
 * Filtra solo usuarios con rol "Docente" y los ordena alfabéticamente por email.
 *
 * @returns Promise<DocenteOption[]> Lista de docentes
 * @throws Error si falla la consulta a Firestore
 *
 * @example
 * const docentes = await fetchDocentes();
 * // [{ id: 'abc123', email: 'profesor@school.com', role: 'Docente' }, ...]
 */
export const fetchDocentes = async (): Promise<DocenteOption[]> => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("role", "==", "Docente"));
    const snapshot = await getDocs(q);

    const docentes: DocenteOption[] = snapshot.docs.map(doc => ({
      id: doc.id,
      email: doc.data().email || '',
      displayName: doc.data().displayName || null,
      role: doc.data().role || 'Docente'
    }));

    // Ordenar alfabéticamente por email
    return docentes.sort((a, b) => a.email.localeCompare(b.email));
  } catch (error) {
    console.error("Error al obtener docentes:", error);
    throw new Error("Error al cargar la lista de docentes");
  }
};