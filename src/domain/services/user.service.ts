// src/services/user.service.ts
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

export interface Area {
  id: string;
  orden: string;
  asignatura: string;
  ihs: string;
  area: string;
  nivel: string;
}

export interface ClassRoom {
  id: string;
  nombreSalon: string;
  nivel: string;
  directorGrupo: string;
  identificador: string;
}

export interface UserFormData {
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  areas: Record<string, boolean>;
  salones: Record<string, boolean>;
  directorGrupo: string;
}

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