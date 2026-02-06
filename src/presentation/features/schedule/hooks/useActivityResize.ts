/**
 * @fileoverview Hook para manejar resize de actividades en el calendario
 * @module presentation/features/schedule/hooks/useActivityResize
 */

import { useState, useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../app/store/store';
import { resizeActivity, selectAllActivities } from '../../../../app/store/states/flexibleSchedule.slice';
import type { FlexibleScheduleActivity } from '../../../../domain/entities/schedule';
import {
  VALID_DURATIONS,
  timeToMinutes,
  validateActivityTime,
  detectActivityOverlap,
} from '../../../../domain/entities/schedule';

// ============================================
// Tipos
// ============================================

export interface ResizeState {
  resizingActivity: FlexibleScheduleActivity | null;
  isResizing: boolean;
  originalDuration: number;
  startY: number;
  previewDuration: number; // Duración temporal durante el resize
}

export interface UseActivityResizeOptions {
  /** Año académico activo */
  year: string;
  /** Pixels por minuto */
  pixelsPerMinute?: number;
  /** Hora máxima permitida (en minutos desde medianoche) */
  maxTime?: number;
  /** Callback cuando se detecta error */
  onResizeError?: (message: string) => void;
}

export interface UseActivityResizeReturn {
  handleResizeStart: (
    e: React.MouseEvent<HTMLDivElement>,
    activity: FlexibleScheduleActivity
  ) => void;
  isResizing: boolean;
  resizingActivity: FlexibleScheduleActivity | null;
  previewDuration: number; // Duración en tiempo real durante el resize
}

// ============================================
// Hook
// ============================================

export const useActivityResize = (options: UseActivityResizeOptions): UseActivityResizeReturn => {
  const {
    year,
    pixelsPerMinute = 2,
    maxTime = 900, // 15:00
    onResizeError,
  } = options;

  const dispatch = useAppDispatch();
  const allActivities = useAppSelector(selectAllActivities);

  const [resizeState, setResizeState] = useState<ResizeState>({
    resizingActivity: null,
    isResizing: false,
    originalDuration: 0,
    startY: 0,
    previewDuration: 0,
  });

  /**
   * Encuentra la duración válida más cercana
   */
  const findClosestValidDuration = useCallback((duration: number): number => {
    const validDurations = [...VALID_DURATIONS];
    let closest = validDurations[0];
    let minDiff = Math.abs(duration - closest);

    for (const validDuration of validDurations) {
      const diff = Math.abs(duration - validDuration);
      if (diff < minDiff) {
        minDiff = diff;
        closest = validDuration;
      }
    }

    return closest;
  }, []);

  /**
   * Inicia el resize
   */
  const handleResizeStart = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, activity: FlexibleScheduleActivity) => {
      e.stopPropagation();
      e.preventDefault();

      setResizeState({
        resizingActivity: activity,
        isResizing: true,
        originalDuration: activity.durationMinutes,
        startY: e.clientY,
        previewDuration: activity.durationMinutes,
      });
    },
    []
  );

  /**
   * Maneja el movimiento durante resize
   */
  const handleResizing = useCallback(
    (e: MouseEvent) => {
      if (!resizeState.isResizing || !resizeState.resizingActivity) return;

      const deltaY = e.clientY - resizeState.startY;
      const deltaMinutes = Math.round(deltaY / pixelsPerMinute);
      const rawNewDuration = resizeState.originalDuration + deltaMinutes;

      // Snap a duración válida más cercana
      const newDuration = findClosestValidDuration(rawNewDuration);

      // Validar duración mínima
      if (newDuration < 10) {
        return;
      }

      // Validar que no termine después del maxTime
      const activityStartMinutes = timeToMinutes(resizeState.resizingActivity.startTime);
      const activityEndMinutes = activityStartMinutes + newDuration;

      if (activityEndMinutes > maxTime) {
        return;
      }

      // Actualizar preview instantáneamente
      setResizeState((prev) => ({
        ...prev,
        previewDuration: newDuration,
      }));
    },
    [resizeState, pixelsPerMinute, findClosestValidDuration, maxTime]
  );

  /**
   * Finaliza el resize
   */
  const handleResizeEnd = useCallback(
    (e: MouseEvent) => {
      if (!resizeState.isResizing || !resizeState.resizingActivity) return;

      const deltaY = e.clientY - resizeState.startY;
      const deltaMinutes = Math.round(deltaY / pixelsPerMinute);
      const rawNewDuration = resizeState.originalDuration + deltaMinutes;
      const newDuration = findClosestValidDuration(rawNewDuration);

      // Validar duración
      const validationError = validateActivityTime({
        startTime: resizeState.resizingActivity.startTime,
        durationMinutes: newDuration,
      });

      if (validationError) {
        console.warn('Resize falló:', validationError);
        if (onResizeError) {
          onResizeError(validationError);
        }
        setResizeState({
          resizingActivity: null,
          isResizing: false,
          originalDuration: 0,
          startY: 0,
          previewDuration: 0,
        });
        return;
      }

      // Detectar solapamientos
      const overlapError = detectActivityOverlap(allActivities, {
        teacherId: resizeState.resizingActivity.teacherId,
        classroomId: resizeState.resizingActivity.classroomId,
        dayOfWeek: resizeState.resizingActivity.dayOfWeek,
        startTime: resizeState.resizingActivity.startTime,
        durationMinutes: newDuration,
        excludeId: resizeState.resizingActivity.id,
      });

      if (overlapError) {
        console.warn('Solapamiento al redimensionar:', overlapError);
        if (onResizeError) {
          onResizeError(overlapError);
        }
        // Permitir el resize pero notificar
      }

      // Dispatch de resize
      dispatch(
        resizeActivity({
          year,
          activityId: resizeState.resizingActivity.id,
          newDuration,
        })
      );

      // Reset estado
      setResizeState({
        resizingActivity: null,
        isResizing: false,
        originalDuration: 0,
        startY: 0,
        previewDuration: 0,
      });
    },
    [
      resizeState,
      dispatch,
      year,
      pixelsPerMinute,
      findClosestValidDuration,
      allActivities,
      onResizeError,
    ]
  );

  /**
   * Attach event listeners para mouse move y up
   */
  useEffect(() => {
    if (resizeState.isResizing) {
      window.addEventListener('mousemove', handleResizing);
      window.addEventListener('mouseup', handleResizeEnd);

      return () => {
        window.removeEventListener('mousemove', handleResizing);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizeState.isResizing, handleResizing, handleResizeEnd]);

  return {
    handleResizeStart,
    isResizing: resizeState.isResizing,
    resizingActivity: resizeState.resizingActivity,
    previewDuration: resizeState.previewDuration,
  };
};

export default useActivityResize;
