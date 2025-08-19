import {
  collection, query, orderBy, onSnapshot, limit,
  doc, updateDoc, getDoc, setDoc, serverTimestamp
} from "firebase/firestore";
import { db } from "../../../../infrastructure/firebase/firebase";
import { ENROLLMENTS_COLLECTION, FLAG_MATRICULAS_DOC } from "../matriculas.constants";
import type { Contabilidad, DocsFisicos } from "../matriculas.types";

/** Lista en tiempo real las matrículas */
export function escucharMatriculas(
  onChange: (rows:any[]) => void,
  onError?: (e:any)=>void,
  pageSize = 100
){
  const q = query(collection(db, ENROLLMENTS_COLLECTION), orderBy("creadoEn", "desc"), limit(pageSize));
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map(d => ({ id:d.id, ...d.data() })));
  }, (err) => onError?.(err));
}

/** Guarda revisión (documentos y contabilidad) */
export async function actualizarRevisionMatricula(
  id: string,
  docs: DocsFisicos,
  cuenta: Contabilidad
){
  const ref = doc(db, ENROLLMENTS_COLLECTION, id);
  const payload:any = { docs: docs ?? {}, cuenta: cuenta ?? {}, actualizadoEn: serverTimestamp() };
  await updateDoc(ref, payload);
}

/** Flag de habilitación del formulario de matrícula */
export async function obtenerFlagMatriculasHabilitado(): Promise<boolean> {
  const s = await getDoc(doc(db, FLAG_MATRICULAS_DOC));
  return Boolean(s.data()?.enabled ?? false);
}

export async function setFlagMatriculasHabilitado(enabled:boolean){
  await setDoc(doc(db, FLAG_MATRICULAS_DOC), { enabled, actualizadoEn: serverTimestamp() }, { merge:true });
}

export async function obtenerMatriculaPorId(id: string): Promise<any | null> {
  const s = await getDoc(doc(db, ENROLLMENTS_COLLECTION, id));
  return s.exists() ? { id: s.id, ...s.data() } : null;
}