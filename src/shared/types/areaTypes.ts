// Tipado completo con conversión automática de tipos
export interface AreaFormState {
  id?: string;
  orden: string;
  asignatura: string;
  ihs: string;
  area: string;
  nivel: string;
}

// Tipo para el servicio (con números)
export interface AreaServiceData {
  id?: string;
  orden: number;
  asignatura: string;
  ihs: number;
  area: string;
  nivel: string;
}

// Función de conversión segura en el submit
export const parseAreaData = (form: AreaFormState): AreaServiceData => ({
  id: form.id,
  orden: Number(form.orden) || 0,
  asignatura: form.asignatura.trim(),
  ihs: Number(form.ihs) || 0,
  area: form.area.trim(),
  nivel: form.nivel
});

// ============================================
// Tipos para Drag & Drop de Áreas
// ============================================

/**
 * Estado del drag & drop durante la interacción
 */
export interface DragDropState {
  /** Indica si hay un elemento siendo arrastrado */
  isDragging: boolean;
  /** ID del área que está siendo arrastrada */
  draggedId: string | null;
  /** ID del área sobre la cual se está posicionando */
  targetId: string | null;
}

/**
 * Payload para actualizar el orden de múltiples áreas en batch
 */
export interface ReorderAreasPayload {
  /** Nivel educativo (Primaria, Secundaria) */
  nivel: string;
  /** Lista de áreas con su nuevo orden */
  areas: Array<{
    id: string;
    orden: number;
  }>;
}

/**
 * Área extendida con propiedades de drag & drop para el componente
 */
export interface AreaWithDragProps extends AreaServiceData {
  /** ID requerido para drag & drop */
  id: string;
  /** Indica si este elemento está siendo arrastrado */
  isDragging?: boolean;
  /** Indica si este elemento es el destino del drop */
  isDropTarget?: boolean;
}

/**
 * Props para los handlers de drag & drop
 */
export interface DragDropHandlers {
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onDrop: (targetId: string) => void;
}

/**
 * Niveles educativos válidos para el drag & drop (excluye Preescolar)
 */
export type NivelDragDrop = 'primaria' | 'secundaria';