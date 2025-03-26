export interface UserFormData {
    email: string;
    password: string;
    confirmPassword: string;
    role: string;
    areas: Record<string, boolean>;
    salones: Record<string, boolean>;
    directorGrupo: string;
  }