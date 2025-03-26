// classRoomTypes.ts
export interface SalonFormState {
    id: string;
    identificador: string;
    directorGrupo: string;
    nombreSalon: string;
    nivel: string;
  }
  
  export interface ClassRoomDoc extends SalonFormState {
    id: string;
    createdAt: string;
  }