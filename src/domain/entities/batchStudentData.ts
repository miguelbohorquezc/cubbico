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
    };
    logros: Array<{
      id: string;
      numero: number;
      descripcion: string;
    }>;
    teacherId: string;
    classroomId: string;
  }