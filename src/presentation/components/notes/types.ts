import { DocumentData } from "firebase/firestore";

export interface Student extends DocumentData {
  id: string;
  name: string;
  lastName: string;
  classroomId: string;
  document: string;
  caracter: string;
  className: string;
  classRoom: string;
}

export interface Grade {
  l1: string;
  l2: string;
  l3: string;
  fallas: string;
  promedio: number;
  logros: Record<string, {
    id: string;
    numero: number;
    descripcion: string;
  }>;
  areaId?: string;
  classroomId?: string;
  studentId?: string;
  timestamp?: Date;
}

export interface AcademicRecord {
  [year: string]: {
    periods: {
      [period: string]: {
        areas: {
          [areaId: string]: {
            grades: {
              l1: string;
              l2: string;
              l3: string;
              fallas: string;
              promedio?: number;
            };
            logros: Record<string, {
              id: string;
              numero: number;
              descripcion: string;
              cumplido?: boolean;
            }>;
            metadata: {
              classroomId: string;
              lastUpdate: string;
            };
          };
        };
      };
    };
  };
}

export type GradeField = 'l1' | 'l2' | 'l3' | 'fallas';