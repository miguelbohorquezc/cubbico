export interface Student {
  id: string;
  name: string;
  lastName: string;
  document: string;
  classroomId: string;
}

export interface SimplifiedGrade {
  l1: string;
  l2: string;
  l3: string;
  fallas: string;
}

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
  classroomId: string;
  teacherId: string;
}