// src/services/user.service.ts
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "./firebase/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Area } from "../domain/entities/area";
import { ClassRoom } from "../domain/entities/classRoom";
import { UserFormData } from "../domain/entities/userFormData";


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