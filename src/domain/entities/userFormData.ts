export interface UserFormData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: 'Coordinador' | 'Docente';
    willTeach: boolean;
    areas: Record<string, boolean>;
    salones: Record<string, boolean>;
    directorGrupo: string;
    nivelesEducativos: ('Preescolar' | 'Primaria' | 'Secundaria')[];
    isActive: boolean;
  }

/** Datos almacenados en Firestore para un usuario */
export interface UserProfile {
    id: string;
    firstName: string;
    lastName: string;
    displayName: string;
    email: string;
    role: 'Coordinador' | 'Docente';
    willTeach: boolean;
    areas: Record<string, boolean>;
    salones: Record<string, boolean>;
    directorGrupo: string;
    nivelesEducativos: ('Preescolar' | 'Primaria' | 'Secundaria')[];
    isActive: boolean;
    createdAt: Date;
    updatedAt?: Date;
  }