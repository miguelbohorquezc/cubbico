/**
 * @fileoverview Hook para manejar drag & drop de actividades en el calendario
 * @module presentation/features/schedule/hooks/useCalendarDragDrop
 */

import { useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../app/store/store';
import { moveActivity, selectAllActivities } from '../../../../app/store/states/flexibleSchedule.slice';
import type { FlexibleScheduleActivity } from '../../../../domain/entities/schedule';
import {
  minutesToTime,
  validateActivityTime,
  detectActivityOverlap,
} from '../../../../domain/entities/schedule';

// ============================================
// Tipos
// ============================================

export interface DragDropState {
  draggingActivity: FlexibleScheduleActivity | null;
  isDragging: boolean;
  dragStartY: number;
  dragStartTime: string;
}

export interface UseDragDropOptions {
  /** Año académico activo */
  year: string;
  /** Snap en minutos (5, 10, 15, 30) */
  snapMinutes?: number;
  /** Hora mínima permitida (en minutos desde medianoche) */
  minTime?: number;
  /** Hora máxima permitida (en minutos desde medianoche) */
  maxTime?: number;
  /** Pixels por minuto */
  pixelsPerMinute?: number;
  /** Callback cuando se detecta solapamiento */
  onOverlapDetected?: (message: string) => void;
}

export interface UseDragDropReturn {
  handleDragStart: (
    e: React.DragEvent<HTMLDivElement>,
    activity: FlexibleScheduleActivity
  ) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>, targetDayOfWeek: number) => void;
  handleDragEnd: () => void;
  draggingActivity: FlexibleScheduleActivity | null;
  isDragging: boolean;
}

// ============================================
// Hook
// ============================================

export const useCalendarDragDrop = (options: UseDragDropOptions): UseDragDropReturn => {
  const {
    year,
    snapMinutes = 5,
    minTime = 420, // 07:00
    maxTime = 900, // 15:00
    pixelsPerMinute = 2,
    onOverlapDetected,
  } = options;

  const dispatch = useAppDispatch();
  const allActivities = useAppSelector(selectAllActivities);

  const [dragState, setDragState] = useState<DragDropState>({
    draggingActivity: null,
    isDragging: false,
    dragStartY: 0,
    dragStartTime: '',
  });

  /**
   * Redondea minutos al snap más cercano
   */
  const snapToGrid = useCallback(
    (minutes: number): number => {
      return Math.round(minutes / snapMinutes) * snapMinutes;
    },
    [snapMinutes]
  );

  /**
   * Inicia el drag
   */
  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, activity: FlexibleScheduleActivity) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('activityId', activity.id);

      setDragState({
        draggingActivity: activity,
        isDragging: true,
        dragStartY: e.clientY,
        dragStartTime: activity.startTime,
      });
    },
    []
  );

  /**
   * Permite el drop
   */
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  /**
   * Procesa el drop
   */
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, targetDayOfWeek: number) => {
      e.preventDefault();

      if (!dragState.draggingActivity) return;

      // Calcular offset vertical del drop
      const dropTarget = e.currentTarget.getBoundingClientRect();
      const offsetY = e.clientY - dropTarget.top;

      // Convertir offset a minutos
      const offsetMinutes = Math.floor(offsetY / pixelsPerMinute);
      const snappedMinutes = snapToGrid(offsetMinutes + minTime);

      // Validar que esté dentro del rango
      if (snappedMinutes < minTime || snappedMinutes > maxTime) {
        console.warn('Drop fuera del rango permitido');
        setDragState({
          draggingActivity: null,
          isDragging: false,
          dragStartY: 0,
          dragStartTime: '',
        });
        return;
      }

      const newStartTime = minutesToTime(snappedMinutes);

      // Validar que la actividad no termine después del maxTime
      const validationError = validateActivityTime({
        startTime: newStartTime,
        durationMinutes: dragState.draggingActivity.durationMinutes,
      });

      if (validationError) {
        console.warn('Validación falló:', validationError);
        if (onOverlapDetected) {
          onOverlapDetected(validationError);
        }
        setDragState({
          draggingActivity: null,
          isDragging: false,
          dragStartY: 0,
          dragStartTime: '',
        });
        return;
      }

      // Detectar solapamientos (solo log, no notificar al usuario al mover)
      const overlapError = detectActivityOverlap(allActivities, {
        teacherId: dragState.draggingActivity.teacherId,
        classroomId: dragState.draggingActivity.classroomId,
        dayOfWeek: targetDayOfWeek,
        startTime: newStartTime,
        durationMinutes: dragState.draggingActivity.durationMinutes,
        excludeId: dragState.draggingActivity.id,
      });

      if (overlapError) {
        console.warn('Solapamiento detectado al mover:', overlapError);
        // No notificar al usuario al mover actividades existentes
        // Solo permitir el movimiento silenciosamente
      }

      // Dispatch de movimiento
      dispatch(
        moveActivity({
          year,
          activityId: dragState.draggingActivity.id,
          newStartTime,
          newDayOfWeek: targetDayOfWeek,
        })
      );

      // Reset estado
      setDragState({
        draggingActivity: null,
        isDragging: false,
        dragStartY: 0,
        dragStartTime: '',
      });
    },
    [
      dragState,
      dispatch,
      year,
      pixelsPerMinute,
      snapToGrid,
      minTime,
      maxTime,
      allActivities,
      onOverlapDetected,
    ]
  );

  /**
   * Cancela el drag
   */
  const handleDragEnd = useCallback(() => {
    setDragState({
      draggingActivity: null,
      isDragging: false,
      dragStartY: 0,
      dragStartTime: '',
    });
  }, []);

  return {
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    draggingActivity: dragState.draggingActivity,
    isDragging: dragState.isDragging,
  };
};

export default useCalendarDragDrop;
