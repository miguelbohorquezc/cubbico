export type EstadoSeguimiento =
  | "en_espera"
  | "en_revision"
  | "admitido"
  | "no_admitido"
  | "matricular";

export interface PadreMadre {
  nombresApellidos?: string;
  numeroIdentificacion?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  barrio?: string;
  empresa?: string;
  profesion?: string;
}

export interface Recomendador {
  nombresApellidos?: string;
  parentesco?: string;
  telefono?: string;
}

export interface FilaAspirante {
  id: string;
  creadoEn?: any;
  nombres?: string;
  apellidos?: string;
  sexo?: "M" | "F";
  fechaNacimiento?: string;
  lugarNacimiento?: string;
  edadAnios?: number;
  edadMeses?: number;
  direccionResidencia?: string;
  barrioAspirante?: string;
  telefonoCasa?: string;
  religion?: string;
  colegioProcedencia?: string;
  ultimoGrado?: string;
  padre?: PadreMadre;
  madre?: PadreMadre;
  recomendador?: Recomendador;
  familiaresEnColegio?: string;
  grupoFamiliarId?: string | null;
  estadoSeguimiento?: EstadoSeguimiento | null;
  noAdmitidoMotivo?: string | null;
  [k: string]: any;
}
