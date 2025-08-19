import type { EstadoSeguimiento } from "./types";

export const LABELS: Record<EstadoSeguimiento | "en_espera", string> = {
  en_espera: "En espera para revisión",
  en_revision: "En proceso de revisión",
  admitido: "Admitido",
  no_admitido: "No admitido",
  matricular: "Matricular",
};

export const ORDEN_ESTADOS: EstadoSeguimiento[] = [
  "en_espera",
  "en_revision",
  "admitido",
  "no_admitido",
  "matricular",
];

export const DEFAULT_CC = "57"; // indicativo por defecto (🇨🇴)
