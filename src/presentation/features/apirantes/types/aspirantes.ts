export type Sexo = 'M' | 'F';

export interface DatosPadreOMadre {
  nombresApellidos: string;
  numeroIdentificacion: string;
  direccion: string;
  barrio: string;
  telefono: string;
  email: string;
  empresa: string;
  profesion: string;
}

export interface DatosRecomendador {
  nombresApellidos: string;
  telefono: string;
  parentesco: string;
}

export interface Aspirante {
  id: string;
  creadoEn: number | any;      // puedes usar serverTimestamp
  actualizadoEn: number | any;

  // Aspirante
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;     // yyyy-mm-dd
  lugarNacimiento: string;
  sexo: Sexo;
  edadAnios: string;
  edadMeses: string;
  direccionResidencia: string;
  barrioAspirante: string;
  telefonoCasa: string;
  religion: string;
  colegioProcedencia: string;
  ultimoGrado: string;

  // Padres
  padre: DatosPadreOMadre;
  madre: DatosPadreOMadre;

  // Recomendador
  recomendador: DatosRecomendador;

  // Anexar
  familiaresEnColegio: string;

  // Términos y condiciones
  aceptaTerminos: boolean;

  // Agrupar hermanos (opcional)
  grupoFamiliarId?: string | null;

  estado: 'enviado';
}
