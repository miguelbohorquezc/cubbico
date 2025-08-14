// Mantengo tu archivo y lo amplío con el nuevo campo y utilidades locales

export interface Student {
  id: string;
  name: string;
  lastName: string;
  document: string;
  classroomId: string;
  // Nota: en otros lugares usas student.classRoom; no lo toco porque viene del backend.
}

export type CampoCalificacion = 'l1' | 'l2' | 'l3' | 'fallas' | 'fallasVerificadas';

// Notas simplificadas por estudiante (mapa en memoria del componente)
export interface SimplifiedGrade {
  l1: string;
  l2: string;
  l3: string;
  fallas: string;
  fallasVerificadas?: string; // NUEVO
}

// Estructura interna de estado: idEstudiante -> notas
export type MapaNotas = Record<string, SimplifiedGrade>;

export interface BatchStudentData {
  studentId: string;
  year: string;
  period: string;
  areaId: string;
  grades: {
    l1: number;
    l2: number;
    l3: number;
    fallas: number;
    fallasVerificadas?: number; // NUEVO
  };
  classroomId: string;
  teacherId: string;
  // achievementId lo arma el hook en tiempo de envío
}
