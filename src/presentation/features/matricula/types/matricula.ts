export type GradoAspirado =
  | 'walkers' | 'nursery' | 'prekinder' | 'kinder' | 'transition'
  | 'primero' | 'segundo' | 'tercero' | 'cuarto' | 'quinto' | 'sexto' | 'septimo';

export type TipoIdentificacion = 'registro_civil' | 'tarjeta_identidad';

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
  primerApellido: string;
  segundoApellido: string;
  nombres: string;

  tipoIdentificacion: TipoIdentificacion;
  numeroIdentificacion: string;

  fechaNacimiento: string;      // yyyy-mm-dd
  edadAnos: string;
  lugarNacimiento: string;
  direccion: string;
  telefono: string;
  colegioAnterior: string;
}

export interface Matricula {
  id: string;
  creadoEn: number | any;
  actualizadoEn: number | any;

  grado: GradoAspirado;

  estudiante: DatosEstudiante;

  madre: DatosAcudiente;
  padre: DatosAcudiente;

  responsableCostos: string;
  compromisoPagoPrimerosDiezDias: 'si' | 'no';

  aceptaTerminos: boolean;
}
