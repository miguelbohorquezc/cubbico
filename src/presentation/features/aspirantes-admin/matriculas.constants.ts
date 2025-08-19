import type { DocsFisicos, Contabilidad } from "./matriculas.types";

export const ENROLLMENTS_COLLECTION = "enrollments";
export const FLAG_MATRICULAS_DOC = "featureFlags/matriculasPublic";

export const DOCS_LABELS: Record<keyof DocsFisicos, string> = {
  copiaReg: "Copia registro civil o TI",
  certMedico: "Certificado médico",
  certEstudios: "Certificado de estudios",
  carnetVacunas: "Copia carnet de vacunas",
  fotos3: "3 fotografías",
  certEPS: "Certificado de EPS",
  certLaboral: "Certificado laboral",
  retiroSimat: "Retiro SIMAT",
  fotoFamiliarPre: "Fotografía familiar (Preescolar)",
};

export const CUENTA_LABELS: Record<keyof Contabilidad, string> = {
  contratosPagare: "Contratos y pagaré",
  pagoMatriculaYCupo: "Pago de matrícula y cupo (opcional)",
};
