export interface Grades {
  l1: number;
  l2: number;
  l3: number;
  fallas: number;
}

export interface Achievement {
  logro1: string;
  logro2: string;
  logro3: string;
}

export interface SubjectData {
  areaId: string;
  asignatura: string;
  ihs: string;
  grades: Grades;
  achievements: Achievement;
  _orden?: string;
}

export interface AreaGroup {
  nombreArea: string;
  _orden?: string;
  subjects: SubjectData[];
}

export interface StudentData {
  name: string;
  lastName: string;
  className: string;
  classRoom: string;
  document?: string;
  id: string;
  classroomId?: string;
}

export interface PeriodInfo {
  periodo: string;
  curso: string;
}