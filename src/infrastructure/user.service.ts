import { collection, getDocs, doc, setDoc, deleteDoc, query, where, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Area } from "../domain/entities/area";
import { ClassRoom } from "../domain/entities/classRoom";
import { UserFormData, UserProfile } from "../domain/entities/userFormData";
import { DocenteOption } from "../shared/types/classRoomTypes";


export const createUser = async (userData: UserFormData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );

    const displayName = `${userData.firstName} ${userData.lastName}`.trim();

    await setDoc(doc(db, "users", userCredential.user.uid), {
      firstName: userData.firstName,
      lastName: userData.lastName,
      displayName: displayName,
      email: userData.email,
      role: userData.role,
      willTeach: userData.willTeach,
      areas: userData.areas,
      salones: userData.salones,
      directorGrupo: userData.directorGrupo,
      nivelesEducativos: userData.nivelesEducativos,
      isActive: true,
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

/**
 * Cambia el estado activo/inactivo de un usuario
 */
export const toggleUserStatus = async (userId: string, isActive: boolean): Promise<void> => {
  try {
    await setDoc(doc(db, "users", userId), {
      isActive: isActive,
      updatedAt: new Date()
    }, { merge: true });
  } catch (error) {
    throw new Error("Error al cambiar estado del usuario: " + error);
  }
};

/**
 * Cambia el rol de un usuario entre Coordinador y Docente
 */
export const updateUserRole = async (
  userId: string,
  newRole: 'Coordinador' | 'Docente',
  clearAssignments: boolean = false
): Promise<void> => {
  try {
    const updateData: Record<string, unknown> = {
      role: newRole,
      updatedAt: new Date()
    };

    // Si se solicita, limpiar asignaciones al cambiar de rol
    if (clearAssignments) {
      updateData.willTeach = false;
      updateData.areas = {};
      updateData.salones = {};
      updateData.directorGrupo = '';
      updateData.nivelesEducativos = [];
    }

    await setDoc(doc(db, "users", userId), updateData, { merge: true });
  } catch (error) {
    throw new Error("Error al cambiar rol del usuario: " + error);
  }
};

/**
 * Actualiza el nombre y apellido de un usuario
 */
export const updateUserNames = async (
  userId: string,
  firstName: string,
  lastName: string
): Promise<void> => {
  try {
    const displayName = `${firstName} ${lastName}`.trim();
    await setDoc(doc(db, "users", userId), {
      firstName,
      lastName,
      displayName,
      updatedAt: new Date()
    }, { merge: true });
  } catch (error) {
    throw new Error("Error al actualizar nombre del usuario: " + error);
  }
};

export const getUsers = async (): Promise<UserProfile[]> => {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
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

    const docentes: DocenteOption[] = snapshot.docs.map(doc => {
      const data = doc.data();
      const displayName = data.displayName ||
        `${data.firstName || ''} ${data.lastName || ''}`.trim() ||
        null;
      return {
        id: doc.id,
        email: data.email || '',
        displayName: displayName,
        role: data.role || 'Docente'
      };
    });

    // Ordenar alfabéticamente por email
    return docentes.sort((a, b) => a.email.localeCompare(b.email));
  } catch (error) {
    console.error("Error al obtener docentes:", error);
    throw new Error("Error al cargar la lista de docentes");
  }
};

/**
 * Obtiene todos los usuarios del sistema desde Firestore.
 * A diferencia de fetchDocentes, no filtra por rol.
 *
 * @returns Promise<DocenteOption[]> Lista de todos los usuarios
 * @throws Error si falla la consulta a Firestore
 *
 * @example
 * const usuarios = await fetchAllUsers();
 * // [{ id: 'abc123', email: 'admin@school.com', role: 'Administrativo' }, ...]
 */
export const fetchAllUsers = async (): Promise<DocenteOption[]> => {
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);

    const usuarios: DocenteOption[] = snapshot.docs.map(doc => {
      const data = doc.data();
      const displayName = data.displayName ||
        `${data.firstName || ''} ${data.lastName || ''}`.trim() ||
        null;
      return {
        id: doc.id,
        email: data.email || '',
        displayName: displayName,
        role: data.role || 'Usuario'
      };
    });

    // Ordenar alfabéticamente por email
    return usuarios.sort((a, b) => a.email.localeCompare(b.email));
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    throw new Error("Error al cargar la lista de usuarios");
  }
};

/**
 * Obtiene un usuario por su UID desde Firestore
 *
 * @param uid - UID del usuario (de Firebase Auth)
 * @returns Promise<UserProfile | null> - Datos del usuario o null si no existe
 */
export const getUserByUid = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));

    if (!userDoc.exists()) {
      return null;
    }

    const data = userDoc.data();
    return {
      id: userDoc.id,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      displayName: data.displayName || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      email: data.email || '',
      role: data.role || 'Docente',
      willTeach: data.willTeach || false,
      areas: data.areas || {},
      salones: data.salones || {},
      directorGrupo: data.directorGrupo || '',
      nivelesEducativos: data.nivelesEducativos || [],
      isActive: data.isActive !== false, // Por defecto true si no existe
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate()
    } as UserProfile;
  } catch (error) {
    console.error("Error al obtener usuario por UID:", error);
    throw new Error("Error al cargar datos del usuario");
  }
};