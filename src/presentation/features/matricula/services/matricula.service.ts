import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../../infrastructure/firebase/firebase";
import type { Matricula } from "../types/matricula";

export const ENROLLMENTS_COLLECTION = "enrollments";
export function generarMatriculaId() { return `enr_${Date.now()}`; }

// helpers
const up = (v: any) => (typeof v === "string" ? v.toUpperCase() : v);
const lo = (v: any) => (typeof v === "string" ? v.toLowerCase() : v);

/** Normaliza el payload antes de persistir. */
function normalizeForStore(data: Matricula): Matricula & {
  // campos upper para facilitar futuros queries
  estudianteUpper: { primerApellido: string; segundoApellido: string; nombres: string; };
  madreUpper: { nombreCompleto: string; ciudad: string; empresa: string; cargoActual: string; };
  padreUpper: { nombreCompleto: string; ciudad: string; empresa: string; cargoActual: string; };
} {
  const norm: Matricula = {
    ...data,
    // estudiante
    estudiante: {
      ...data.estudiante,
      primerApellido: up(data.estudiante.primerApellido),
      segundoApellido: up(data.estudiante.segundoApellido),
      nombres: up(data.estudiante.nombres),
      // tipo/numero se mantienen
      tipoIdentificacion: data.estudiante.tipoIdentificacion,
      numeroIdentificacion: data.estudiante.numeroIdentificacion,
      fechaNacimiento: data.estudiante.fechaNacimiento,
      edadAnos: data.estudiante.edadAnos,
      lugarNacimiento: up(data.estudiante.lugarNacimiento),
      direccion: up(data.estudiante.direccion),
      telefono: data.estudiante.telefono,
      colegioAnterior: up(data.estudiante.colegioAnterior),
    },
    // madre/padre
    madre: {
      ...data.madre,
      nombreCompleto: up(data.madre.nombreCompleto),
      empresa: up(data.madre.empresa),
      ciudad: up(data.madre.ciudad),
      cargoActual: up(data.madre.cargoActual),
      email: lo(data.madre.email),
      celular: data.madre.celular,
      cedula: data.madre.cedula,
      fechaNacimiento: data.madre.fechaNacimiento,
    },
    padre: {
      ...data.padre,
      nombreCompleto: up(data.padre.nombreCompleto),
      empresa: up(data.padre.empresa),
      ciudad: up(data.padre.ciudad),
      cargoActual: up(data.padre.cargoActual),
      email: lo(data.padre.email),
      celular: data.padre.celular,
      cedula: data.padre.cedula,
      fechaNacimiento: data.padre.fechaNacimiento,
    },
    responsableCostos: up(data.responsableCostos),
    // lo demás igual
    grado: data.grado,
    compromisoPagoPrimerosDiezDias: data.compromisoPagoPrimerosDiezDias,
    aceptaTerminos: data.aceptaTerminos,
    id: data.id,
    creadoEn: data.creadoEn,
    actualizadoEn: data.actualizadoEn,
  };

  return {
    ...norm,
    estudianteUpper: {
      primerApellido: up(norm.estudiante.primerApellido),
      segundoApellido: up(norm.estudiante.segundoApellido),
      nombres: up(norm.estudiante.nombres),
    },
    madreUpper: {
      nombreCompleto: up(norm.madre.nombreCompleto),
      ciudad: up(norm.madre.ciudad),
      empresa: up(norm.madre.empresa),
      cargoActual: up(norm.madre.cargoActual),
    },
    padreUpper: {
      nombreCompleto: up(norm.padre.nombreCompleto),
      ciudad: up(norm.padre.ciudad),
      empresa: up(norm.padre.empresa),
      cargoActual: up(norm.padre.cargoActual),
    },
  };
}

export async function crearMatricula(
  data: Omit<Matricula,'creadoEn'|'actualizadoEn'>
): Promise<string> {
  const ref = doc(db, ENROLLMENTS_COLLECTION, data.id);
  const payload = normalizeForStore({
    ...data,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  } as Matricula);

  await setDoc(ref, payload, { merge: true });
  return data.id;
}
