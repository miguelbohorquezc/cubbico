import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where
} from "firebase/firestore";
import { db } from "./firebase/firebase";
import { PeriodConfig, PeriodConfigInput } from "../domain/entities/periodConfig";

const COLLECTION_NAME = "periodConfigs";

/**
 * Obtiene todas las configuraciones de períodos
 */
export const fetchPeriodConfigs = async (): Promise<PeriodConfig[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      periodId: docSnap.data().periodId,
      year: docSnap.data().year,
      fechaEntrega: docSnap.data().fechaEntrega,
      fechaInicio: docSnap.data().fechaInicio,
      fechaFin: docSnap.data().fechaFin,
      activo: docSnap.data().activo ?? true,
      createdAt: docSnap.data().createdAt,
      updatedAt: docSnap.data().updatedAt
    }));
  } catch (error) {
    console.error("Error al cargar configuraciones de períodos:", error);
    throw new Error("Error al cargar configuraciones de períodos");
  }
};

/**
 * Obtiene las configuraciones de períodos para un año específico
 */
export const fetchPeriodConfigsByYear = async (year: string): Promise<PeriodConfig[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("year", "==", year)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      periodId: docSnap.data().periodId,
      year: docSnap.data().year,
      fechaEntrega: docSnap.data().fechaEntrega,
      fechaInicio: docSnap.data().fechaInicio,
      fechaFin: docSnap.data().fechaFin,
      activo: docSnap.data().activo ?? true,
      createdAt: docSnap.data().createdAt,
      updatedAt: docSnap.data().updatedAt
    }));
  } catch (error) {
    console.error("Error al cargar configuraciones por año:", error);
    throw new Error("Error al cargar configuraciones de períodos");
  }
};

/**
 * Obtiene la configuración de un período específico
 */
export const fetchPeriodConfig = async (
  periodId: string,
  year: string
): Promise<PeriodConfig | null> => {
  try {
    const docId = `${year}_${periodId}`;
    const docRef = doc(db, COLLECTION_NAME, docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      periodId: docSnap.data().periodId,
      year: docSnap.data().year,
      fechaEntrega: docSnap.data().fechaEntrega,
      fechaInicio: docSnap.data().fechaInicio,
      fechaFin: docSnap.data().fechaFin,
      activo: docSnap.data().activo ?? true,
      createdAt: docSnap.data().createdAt,
      updatedAt: docSnap.data().updatedAt
    };
  } catch (error) {
    console.error("Error al cargar configuración del período:", error);
    throw new Error("Error al cargar configuración del período");
  }
};

/**
 * Crea o actualiza la configuración de un período
 * Usa el ID compuesto: "{year}_{periodId}"
 */
export const savePeriodConfig = async (input: PeriodConfigInput): Promise<string> => {
  try {
    const docId = `${input.year}_${input.periodId}`;
    const docRef = doc(db, COLLECTION_NAME, docId);
    const existingDoc = await getDoc(docRef);

    const timestamp = new Date().toISOString();

    if (existingDoc.exists()) {
      await updateDoc(docRef, {
        ...input,
        activo: input.activo ?? true,
        updatedAt: timestamp
      });
    } else {
      await setDoc(docRef, {
        ...input,
        activo: input.activo ?? true,
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }

    return docId;
  } catch (error) {
    console.error("Error al guardar configuración del período:", error);
    throw new Error("Error al guardar configuración del período");
  }
};

/**
 * Formatea una fecha ISO a formato legible en español
 */
export const formatFechaEntrega = (fechaISO: string): string => {
  try {
    const date = new Date(fechaISO + "T00:00:00");
    return new Intl.DateTimeFormat("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  } catch {
    return fechaISO;
  }
};
