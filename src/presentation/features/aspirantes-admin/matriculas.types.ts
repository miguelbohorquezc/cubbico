export type GradoAspirado =
  | "walkers" | "nursery" | "prekinder" | "kinder" | "transition"
  | "primero" | "segundo" | "tercero" | "cuarto" | "quinto" | "sexto" | "septimo";

export interface DatosAcudiente {
  nombreCompleto: string;
  fechaNacimiento: string;
  empresa: string;
  ciudad: string;
  cargoActual: string;
  email: string;
  celular: string;
  cedula: string;
}

export interface DatosEstudiante {
  primerApellido: string;
  segundoApellido: string;
  nombres: string;
  tipoIdentificacion: "registro_civil" | "tarjeta_identidad";
  numeroIdentificacion: string;
  fechaNacimiento: string;
  edadAnos: string;
  lugarNacimiento: string;
  direccion: string;
  telefono: string;
  colegioAnterior: string;
}

export interface DocsFisicos {
  copiaReg?: boolean;
  certMedico?: boolean;
  certEstudios?: boolean;
  carnetVacunas?: boolean;
  fotos3?: boolean;
  certEPS?: boolean;
  certLaboral?: boolean;
  retiroSimat?: boolean;
  fotoFamiliarPre?: boolean;
}

export interface Contabilidad {
  contratosPagare?: boolean;      // requerido
  pagoMatriculaYCupo?: boolean;   // opcional
}

export interface MatriculaRow {
  id: string;
  creadoEn?: any;
  grado: GradoAspirado;
  estudiante: DatosEstudiante;
  madre: DatosAcudiente;
  padre: DatosAcudiente;
  responsableCostos?: string;
  compromisoPagoPrimerosDiezDias?: "si" | "no";
  aceptaTerminos?: boolean;

  // Admin:
  docs?: DocsFisicos;
  cuenta?: Contabilidad;
}
