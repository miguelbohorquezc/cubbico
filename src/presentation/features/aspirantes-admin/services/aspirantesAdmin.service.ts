import {
  //@ts-ignore
  collection, query, orderBy, onSnapshot, limit, startAfter,
  //@ts-ignore
  getDocs, doc, updateDoc, getDoc, setDoc, serverTimestamp
} from "firebase/firestore";
// Ajusta la importación según tu proyecto:
import { db } from "../../../../infrastructure/firebase/firebase";
import type { EstadoSeguimiento } from "../../apirantes/types/aspirantes";

const APPLICANTS = "applicants";
const FLAGS_DOC = "featureFlags/aspirantesPublic";

export interface ListarOpciones {
  pageSize?: number;
  startAfterId?: string | null;
}

export function escucharAspirantes(
  onChange: (rows: any[]) => void,
  onError?: (e: any) => void,
  opciones?: ListarOpciones
) {
  const pageSize = opciones?.pageSize ?? 100;
  const colRef = collection(db, APPLICANTS);
  const q = query(colRef, orderBy("creadoEn", "desc"), limit(pageSize));
  const stop = onSnapshot(q, (snap) => {
    const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    onChange(rows);
  }, (err) => onError?.(err));
  return stop; // unsubscribe
}

export async function actualizarEstadoSeguimiento(
  id: string,
  estado: EstadoSeguimiento,
  motivo?: string
) {
  const ref = doc(db, APPLICANTS, id);

  // Si es "no_admitido", motivo es obligatorio
  const payload: any = {
    estadoSeguimiento: estado,
    actualizadoEn: serverTimestamp()
  };

  if (estado === "no_admitido") {
    payload.noAdmitidoMotivo = (motivo ?? "").trim();
    if (!payload.noAdmitidoMotivo) {
      throw new Error("Debes especificar un motivo para 'No admitido'.");
    }
  } else {
    payload.noAdmitidoMotivo = null; // limpia motivo al cambiar a otro estado
  }

  await updateDoc(ref, payload);
}

export async function obtenerFlagAspirantesHabilitado(): Promise<boolean> {
  const ref = doc(db, FLAGS_DOC);
  const s = await getDoc(ref);
  return Boolean(s.data()?.enabled ?? false);
}

export async function setFlagAspirantesHabilitado(enabled: boolean) {
  const ref = doc(db, FLAGS_DOC);
  await setDoc(ref, { enabled, actualizadoEn: serverTimestamp() }, { merge: true });
}
