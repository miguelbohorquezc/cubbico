import {
  collection, doc, getDoc, getDocs, query, where, limit
} from "firebase/firestore";
import { db } from "../../../../infrastructure/firebase/firebase";

/** Busca en /student por ID (documentId = número de identificación). */
export async function findStudentById(documentId: string): Promise<any | null> {
  const snap = await getDoc(doc(db, "student", documentId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Búsqueda case-insensitive en /applicants.
 * Primero intenta por campos normalizados (nombresUpper/apellidosUpper).
 * Si no existen (registros antiguos), hace un barrido acotado en cliente.
 */
export async function findApplicantByNameInsensitive(
  nombres: string,
  apellidos: string
): Promise<any | null> {
  const nu = (nombres || "").trim().toUpperCase();
  const au = (apellidos || "").trim().toUpperCase();

  // 1) Intento rápido por campos normalizados
  const q1 = query(
    collection(db, "applicants"),
    where("nombresUpper", "==", nu),
    where("apellidosUpper", "==", au),
    limit(1)
  );
  const qs1 = await getDocs(q1);
  if (!qs1.empty) {
    const d = qs1.docs[0];
    return { id: d.id, ...d.data() };
  }

  // 2) Fallback: barrido acotado (si tienes pocos docs ahora). Ajusta el limit si es necesario.
  const qs2 = await getDocs(query(collection(db, "applicants"), limit(100)));
  for (const d of qs2.docs) {
    const data = d.data() as any;
    const n = String(data.nombres || "").toUpperCase();
    const a = String(data.apellidos || "").toUpperCase();
    if (n === nu && a === au) {
      return { id: d.id, ...data };
    }
  }
  return null;
}
