import { collection, doc, getDocs, getDoc, query, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../../infrastructure/firebase/firebase"; // ajusta ruta
import { Aspirante } from "../types/aspirantes";

const COLECCION = "applicants";

export async function crearAspirante(datos: Aspirante) {
  try {
    await setDoc(doc(db, COLECCION, datos.id), datos, { merge: true });
    return datos.id;
  } catch (e: any) {
    console.error("Firestore create error:", e?.code, e?.message);
    alert(`No se pudo enviar: ${e?.code ?? ''} ${e?.message ?? ''}`);
    throw e;
  }
}

export async function obtenerAspirante(id: string) {
  const snap = await getDoc(doc(db, COLECCION, id));
  return snap.exists() ? (snap.data() as Aspirante) : null;
}

export async function listarAspirantes() {
  const qs = await getDocs(query(collection(db, COLECCION)));
  return qs.docs.map(d => d.data() as Aspirante);
}

export async function actualizarAspirante(id: string, parcial: Partial<Aspirante>) {
  await setDoc(doc(db, COLECCION, id), { ...parcial, actualizadoEn: Date.now() }, { merge: true });
}

export async function eliminarAspirante(id: string) {
  await deleteDoc(doc(db, COLECCION, id));
}
