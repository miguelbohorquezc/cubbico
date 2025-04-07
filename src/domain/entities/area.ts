export interface Area {
    id: string;
    orden: string;
    asignatura: string;
    ihs: string;
    area: string;
    nivel: string;
  }

  export interface AreaIhsInfo {
    id?: string;
    asignatura: string;
    ihs: number;
    area: string;
    orden: number;
    nivel: string;
}