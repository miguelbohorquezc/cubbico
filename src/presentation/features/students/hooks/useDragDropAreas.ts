import { useState, useCallback, useMemo } from 'react';
import { updateAreasOrder } from '../../../../infrastructure/area.service';
import {
  AreaServiceData,
  AreaWithDragProps,
  DragDropState,
  DragDropHandlers,
  NivelDragDrop
} from '../../../../shared/types/areaTypes';

interface UseDragDropAreasProps {
  areas: AreaServiceData[];
  nivel: NivelDragDrop;
  onReorderSuccess?: () => void;
  onReorderError?: (error: Error) => void;
}

interface UseDragDropAreasReturn {
  /** Áreas ordenadas con propiedades de drag */
  orderedAreas: AreaWithDragProps[];
  /** Estado actual del drag & drop */
  dragState: DragDropState;
  /** Handlers para eventos de drag */
  handlers: DragDropHandlers;
  /** Indica si se está guardando el nuevo orden */
  isSaving: boolean;
  /** Indica si hay cambios pendientes por guardar */
  hasChanges: boolean;
  /** Guarda el orden actual en Firestore */
  saveOrder: () => Promise<void>;
  /** Descarta los cambios y restaura el orden original */
  discardChanges: () => void;
}

/**
 * Hook para manejar drag & drop de áreas con persistencia en Firestore.
 * Filtra las áreas por nivel y permite reordenarlas visualmente.
 *
 * @param props - Configuración del hook
 * @returns Estado y handlers para el drag & drop
 *
 * @example
 * const { orderedAreas, handlers, isSaving, saveOrder } = useDragDropAreas({
 *   areas: allAreas,
 *   nivel: 'Primaria',
 *   onReorderSuccess: () => alert('Orden guardado')
 * });
 */
export const useDragDropAreas = ({
  areas,
  nivel,
  onReorderSuccess,
  onReorderError
}: UseDragDropAreasProps): UseDragDropAreasReturn => {
  // Estado del drag & drop
  const [dragState, setDragState] = useState<DragDropState>({
    isDragging: false,
    draggedId: null,
    targetId: null
  });

  // Estado de guardado
  const [isSaving, setIsSaving] = useState(false);

  // Áreas filtradas por nivel y ordenadas
  const filteredAreas = useMemo(() => {
    return areas
      .filter(area => area.nivel === nivel && area.id)
      .sort((a, b) => a.orden - b.orden);
  }, [areas, nivel]);

  // Estado local del orden (para drag & drop)
  const [localOrder, setLocalOrder] = useState<string[]>([]);

  // Inicializar orden local cuando cambian las áreas filtradas
  useMemo(() => {
    const ids = filteredAreas.map(area => area.id as string);
    setLocalOrder(ids);
  }, [filteredAreas]);

  // Detectar si hay cambios
  const hasChanges = useMemo(() => {
    const originalIds = filteredAreas.map(area => area.id as string);
    return JSON.stringify(localOrder) !== JSON.stringify(originalIds);
  }, [localOrder, filteredAreas]);

  // Áreas ordenadas según el estado local con props de drag
  const orderedAreas: AreaWithDragProps[] = useMemo(() => {
    return localOrder
      .map(id => filteredAreas.find(area => area.id === id))
      .filter((area): area is AreaServiceData & { id: string } => !!area && !!area.id)
      .map(area => ({
        ...area,
        isDragging: dragState.draggedId === area.id,
        isDropTarget: dragState.targetId === area.id
      }));
  }, [localOrder, filteredAreas, dragState]);

  // Handler: Inicio del drag
  const handleDragStart = useCallback((id: string) => {
    setDragState({
      isDragging: true,
      draggedId: id,
      targetId: null
    });
  }, []);

  // Handler: Drag sobre un elemento
  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragState(prev => ({
      ...prev,
      targetId: id
    }));
  }, []);

  // Handler: Fin del drag (cancelado)
  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedId: null,
      targetId: null
    });
  }, []);

  // Handler: Drop en un elemento
  const handleDrop = useCallback((targetId: string) => {
    const { draggedId } = dragState;

    if (!draggedId || draggedId === targetId) {
      handleDragEnd();
      return;
    }

    // Reordenar el array
    setLocalOrder(prev => {
      const newOrder = [...prev];
      const draggedIndex = newOrder.indexOf(draggedId);
      const targetIndex = newOrder.indexOf(targetId);

      if (draggedIndex === -1 || targetIndex === -1) {
        return prev;
      }

      // Remover el elemento arrastrado
      newOrder.splice(draggedIndex, 1);
      // Insertar en la nueva posición
      newOrder.splice(targetIndex, 0, draggedId);

      return newOrder;
    });

    handleDragEnd();
  }, [dragState, handleDragEnd]);

  // Guardar el orden en Firestore
  const saveOrder = useCallback(async () => {
    if (!hasChanges) return;

    setIsSaving(true);

    try {
      const areasToUpdate = localOrder.map((id, index) => ({
        id,
        orden: index + 1
      }));

      await updateAreasOrder({
        nivel,
        areas: areasToUpdate
      });

      onReorderSuccess?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error desconocido');
      onReorderError?.(err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [localOrder, nivel, hasChanges, onReorderSuccess, onReorderError]);

  // Descartar cambios
  const discardChanges = useCallback(() => {
    const originalIds = filteredAreas.map(area => area.id as string);
    setLocalOrder(originalIds);
    handleDragEnd();
  }, [filteredAreas, handleDragEnd]);

  return {
    orderedAreas,
    dragState,
    handlers: {
      onDragStart: handleDragStart,
      onDragOver: handleDragOver,
      onDragEnd: handleDragEnd,
      onDrop: handleDrop
    },
    isSaving,
    hasChanges,
    saveOrder,
    discardChanges
  };
};

export default useDragDropAreas;
