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

// ============================================
// Tipos para Selector de Director de Grupo
// ============================================

/**
 * Opción de docente para el selector de director de grupo.
 * Contiene solo los campos necesarios para mostrar en el dropdown.
 */
export interface DocenteOption {
  /** ID único del usuario (uid de Firebase) */
  id: string;
  /** Correo electrónico del docente */
  email: string;
  /** Nombre para mostrar (puede ser null si no está configurado) */
  displayName?: string | null;
  /** Rol del usuario (debería ser 'Docente') */
  role: string;
}

/**
 * Props para el componente DirectorSelector
 */
export interface DirectorSelectorProps {
  /** ID del docente seleccionado actualmente */
  value: string;
  /** Callback cuando cambia la selección */
  onChange: (docenteId: string) => void;
  /** Callback cuando el campo pierde foco */
  onBlur?: () => void;
  /** Mensaje de error a mostrar */
  error?: string;
  /** Deshabilitar el selector */
  disabled?: boolean;
  /** Nivel del salón (para filtrar docentes si es necesario) */
  nivel?: string;
}

/**
 * Niveles educativos válidos para salones (excluye Preescolar para selector de director)
 */
export type NivelSalon = 'Primaria' | 'Secundaria' | 'Preescolar';

/**
 * Mapa de docentes por ID para búsqueda rápida
 */
export type DocentesMap = Record<string, DocenteOption>;