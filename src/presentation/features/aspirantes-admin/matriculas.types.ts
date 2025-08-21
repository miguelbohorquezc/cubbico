export type GradoAspirado =
  | "walkers" | "nursery" | "prekinder" | "kinder" | "transition"
  | "primero" | "segundo" | "tercero" | "cuarto" | "quinto" | "sexto" | "septimo";

export type TipoIdentificacion = "registro_civil" | "tarjeta_identidad";

/* ========================== Datos base ========================== */
export interface DatosAcudiente {
  nombreCompleto: string;
  fechaNacimiento: string;      // yyyy-mm-dd
  empresa: string;
  ciudad: string;
  cargoActual: string;
  email: string;
  celular: string;
  cedula: string;
}

export interface DatosEstudiante {
  // Identificación
  tipoIdentificacion: TipoIdentificacion;
  numeroIdentificacion: string;

  // Nombres
  primerApellido: string;
  segundoApellido: string;
  nombres: string;

  // Nacimiento
  fechaNacimiento: string;      // yyyy-mm-dd
  lugarNacimiento: string;
  edadAnos: string | number;

  // Contacto / residencia
  direccion: string;
  telefono: string;

  // Antecedentes
  colegioAnterior: string;
}

/* ========================== Revisión admin ========================== */
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
  contratosPagare?: boolean;
  pagoMatriculaYCupo?: boolean; // opcional
}

/* ========================== Auditoría ========================== */
export type AuditAction =
  | "activate"
  | "revoke"
  | "update_docs"
  | "print";

export interface AuditActor {
  uid?: string;
  email?: string | null;
}

export interface AuditEvent {
  id: string;
  action: AuditAction;
  ts: any; // Firestore Timestamp
  actor?: AuditActor | null;
  reason?: string;
  payload?: any;
}

/* ========================== Fila principal ========================== */
export interface MatriculaRow {
  /** ID del documento en Firestore (enrollments/{id}) */
  id: string;

  /** Timestamps (serverTimestamp o epoch) */
  creadoEn?: any;
  actualizadoEn?: any;

  /** Datos núcleo */
  grado: GradoAspirado;
  estudiante: DatosEstudiante;
  madre: DatosAcudiente;
  padre: DatosAcudiente;

  /** Formulario */
  responsableCostos?: string;
  compromisoPagoPrimerosDiezDias?: "si" | "no";
  aceptaTerminos?: boolean;

  /** Admin (revisión documental y contable) */
  docs?: DocsFisicos;
  cuenta?: Contabilidad;

  /** Activación de matrícula por administración */
  matriculaActiva?: boolean;
  matriculadoEn?: any;

  /** Datos de revocación (si aplica) */
  revocadaEn?: any;
  revocadaPor?: AuditActor;
  motivoRevocacion?: string;
}
