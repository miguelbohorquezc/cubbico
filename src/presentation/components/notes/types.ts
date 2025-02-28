export interface Student {
    id: number;
    fullName: string;
  }
  
  export interface Grade {
    l1: string;
    l2: string;
    l3: string;
    fallas: string;
    promedio: number;
  }
  
  export type GradeField = keyof Omit<Grade, 'promedio'>;