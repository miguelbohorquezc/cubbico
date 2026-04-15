import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase/firebase';
import type {
  CatedraSocioemocional,
  ProyectosTransversales,
} from '../domain/entities/catedraSocioemocional';
import {
  buildCatedraId,
  buildProyectosId,
} from '../domain/entities/catedraSocioemocional';

const CATEDRA_COLLECTION = 'catedra_socioemocional';
const PROYECTOS_COLLECTION = 'proyectos_transversales';

const emptyPeriods = () => ({
  periodo1: '',
  periodo2: '',
  periodo3: '',
  periodo4: '',
});

/**
 * Lee el documento de cátedra socio emocional para un nivel, grado y año.
 * El `grado` debe coincidir con el `nombreSalon` del salón en Firestore.
 */
export const getCatedraBySalonYear = async (
  nivel: string,
  grado: string,
  year: string
): Promise<CatedraSocioemocional | null> => {
  const id = buildCatedraId(nivel, grado, year);
  const ref = doc(db, CATEDRA_COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as CatedraSocioemocional;
};

/**
 * Lee todos los documentos de cátedra para un nivel y año dado.
 * Retorna un mapa grado → CatedraSocioemocional.
 */
export const getCatedraByNivelYear = async (
  nivel: string,
  grados: string[],
  year: string
): Promise<Record<string, CatedraSocioemocional>> => {
  const result: Record<string, CatedraSocioemocional> = {};
  await Promise.all(
    grados.map(async (grado) => {
      const id = buildCatedraId(nivel, grado, year);
      const ref = doc(db, CATEDRA_COLLECTION, id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        result[grado] = snap.data() as CatedraSocioemocional;
      } else {
        result[grado] = { id, nivel, grado, year, ...emptyPeriods() };
      }
    })
  );
  return result;
};

/**
 * Guarda (upsert) un documento de cátedra socio emocional.
 */
export const saveCatedra = async (data: CatedraSocioemocional): Promise<void> => {
  const id = buildCatedraId(data.nivel, data.grado, data.year);
  const ref = doc(db, CATEDRA_COLLECTION, id);
  await setDoc(ref, { ...data, id }, { merge: true });
};

/**
 * Lee el documento de proyectos transversales para un año.
 */
export const getProyectosTransversales = async (
  year: string
): Promise<ProyectosTransversales | null> => {
  const id = buildProyectosId(year);
  const ref = doc(db, PROYECTOS_COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as ProyectosTransversales;
};

/**
 * Guarda (upsert) el documento de proyectos transversales.
 */
export const saveProyectosTransversales = async (
  data: ProyectosTransversales
): Promise<void> => {
  const id = buildProyectosId(data.year);
  const ref = doc(db, PROYECTOS_COLLECTION, id);
  await setDoc(ref, { ...data, id }, { merge: true });
};
