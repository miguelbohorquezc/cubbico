import {
  collection,
  query,
  orderBy,
  onSnapshot,
  limit,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  serverTimestamp,
  writeBatch,
  getDocs,
  where,
  startAfter
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../../../infrastructure/firebase/firebase";
import { ENROLLMENTS_COLLECTION, FLAG_MATRICULAS_DOC } from "../matriculas.constants";
import type {
  Contabilidad,
  DocsFisicos,
  MatriculaRow,
  AuditEvent,
  AuditAction,
  AuditActor,
  GradoAspirado
} from "../matriculas.types";

/* ========================= Lectura (listado en tiempo real) ========================= */
export function escucharMatriculas(
  onChange: (rows: MatriculaRow[]) => void,
  onError?: (e: any) => void,
  pageSize = 100
) {
  const ql = query(
    collection(db, ENROLLMENTS_COLLECTION),
    orderBy("creadoEn", "desc"),
    limit(pageSize)
  );
  return onSnapshot(
    ql,
    (snap) => {
      const rows: MatriculaRow[] = [];
      snap.forEach((d) => rows.push({ id: d.id, ...((d.data() as any) || {}) } as MatriculaRow));
      onChange(rows);
    },
    onError
  );
}

/* ========================= Escrituras ========================= */
export async function actualizarRevisionMatricula(
  id: string,
  docs: DocsFisicos,
  cuenta: Contabilidad
): Promise<void> {
  const ref = doc(db, ENROLLMENTS_COLLECTION, id);
  await updateDoc(ref, {
    docs: { ...(docs || {}) },
    cuenta: { ...(cuenta || {}) },
    actualizadoEn: serverTimestamp(),
  });

  await crearEventoAuditoria(id, "update_docs", {
    payload: { docs, cuenta }
  });
}

export async function activarMatricula(id: string): Promise<void> {
  const batch = writeBatch(db);
  const ref = doc(db, ENROLLMENTS_COLLECTION, id);

  batch.update(ref, {
    matriculaActiva: true,
    matriculadoEn: serverTimestamp(),
    revocadaEn: null,
    revocadaPor: null,
    motivoRevocacion: null,
    actualizadoEn: serverTimestamp(),
  });

  const auditRef = doc(collection(db, ENROLLMENTS_COLLECTION, id, "audit"));
  batch.set(auditRef, {
    action: "activate",
    ts: serverTimestamp(),
    actor: obtenerActorActual(),
    payload: null,
  });

  await batch.commit();
}

export async function revocarMatricula(id: string, reason: string): Promise<void> {
  const batch = writeBatch(db);
  const ref = doc(db, ENROLLMENTS_COLLECTION, id);

  batch.update(ref, {
    matriculaActiva: false,
    revocadaEn: serverTimestamp(),
    revocadaPor: obtenerActorActual(),
    motivoRevocacion: reason,
    actualizadoEn: serverTimestamp(),
  });

  const auditRef = doc(collection(db, ENROLLMENTS_COLLECTION, id, "audit"));
  batch.set(auditRef, {
    action: "revoke",
    ts: serverTimestamp(),
    actor: obtenerActorActual(),
    reason,
    payload: null,
  });

  await batch.commit();
}

/* ========================= Auditoría ========================= */
export function escucharAuditoria(
  enrollmentId: string,
  onChange: (events: AuditEvent[]) => void,
  onError?: (e: any) => void,
  maxItems = 20
) {
  const ql = query(
    collection(db, ENROLLMENTS_COLLECTION, enrollmentId, "audit"),
    orderBy("ts", "desc"),
    limit(maxItems)
  );
  return onSnapshot(
    ql,
    (snap) => {
      const items: AuditEvent[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...((d.data() as any) || {}) } as AuditEvent));
      onChange(items);
    },
    onError
  );
}

export async function crearEventoAuditoria(
  enrollmentId: string,
  action: AuditAction,
  extra?: Partial<AuditEvent>
): Promise<void> {
  const auditRef = doc(collection(db, ENROLLMENTS_COLLECTION, enrollmentId, "audit"));
  const actor = obtenerActorActual();
  await setDoc(auditRef, {
    action,
    ts: serverTimestamp(),
    actor,
    ...extra,
  } as any);
}

/* ========================= Flags de habilitación pública ========================= */
export async function obtenerFlagMatriculasHabilitado(): Promise<boolean> {
  const s = await getDoc(doc(db, FLAG_MATRICULAS_DOC));
  return Boolean(s.data()?.enabled ?? false);
}

export async function setFlagMatriculasHabilitado(enabled: boolean) {
  await setDoc(
    doc(db, FLAG_MATRICULAS_DOC),
    { enabled, actualizadoEn: serverTimestamp() },
    { merge: true }
  );
}

/* ========================= Utilidades ========================= */
export async function obtenerMatriculaPorId(id: string): Promise<MatriculaRow | null> {
  const s = await getDoc(doc(db, ENROLLMENTS_COLLECTION, id));
  return s.exists() ? ({ id: s.id, ...(s.data() as any) } as MatriculaRow) : null;
}

function obtenerActorActual(): AuditActor | null {
  try {
    const u = getAuth().currentUser;
    if (!u) return null;
    return { uid: u.uid, email: u.email ?? null };
  } catch {
    return null;
  }
}

/* ========================= NUEVO: Consulta por grado (sin índices compuestos) ========================= */
/**
 * Trae TODAS las matrículas de un grado (paginando por ID de documento) sin orderBy extra ni filtros múltiples
 * para minimizar requisitos de índices. El filtrado a "matriculados" y por fechas se hace en cliente.
 */
export async function obtenerPorGradoSinIndices(
  grado: GradoAspirado,
  opts: { pageSize?: number; max?: number } = {}
): Promise<MatriculaRow[]> {
  const pageSize = Math.max(1, opts.pageSize ?? 500);
  const max = Math.max(pageSize, opts.max ?? 20000);

  let base = query(collection(db, ENROLLMENTS_COLLECTION), where("grado", "==", grado));
  const out: MatriculaRow[] = [];
  let last: any | null = null;

  while (out.length < max) {
    const pageQ = last ? query(base, startAfter(last), limit(pageSize)) : query(base, limit(pageSize));
    const snap = await getDocs(pageQ);
    if (snap.empty) break;

    snap.forEach((d) => out.push({ id: d.id, ...((d.data() as any) || {}) } as MatriculaRow));
    last = snap.docs[snap.docs.length - 1];
    if (snap.size < pageSize) break;
  }

  return out.slice(0, max);
}
