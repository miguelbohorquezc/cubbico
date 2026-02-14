/**
 * @fileoverview Componente principal del calendario flexible
 * @module presentation/features/schedule/FlexibleCalendar
 */

import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../../app/store/store';
import {
  loadFlexibleSchedule,
  selectAllActivities,
  selectLoading,
  selectError,
  selectYear,
} from '../../../app/store/states/flexibleSchedule.slice';
import { CalendarGrid } from './components/CalendarGrid';
import { CalendarActivity } from './components/CalendarActivity';
import { NowLine, useCurrentDayOfWeek } from './components/NowLine';
import { HourActivitiesModal } from './components/HourActivitiesModal';
import { useCalendarDragDrop } from './hooks/useCalendarDragDrop';
import { useActivityResize } from './hooks/useActivityResize';
import type { FlexibleScheduleActivity } from '../../../domain/entities/schedule';
import { timeToMinutes } from '../../../domain/entities/schedule';
import { IconCalendarOff } from '@tabler/icons-react';

// ============================================
// Tipos
// ============================================

export interface FlexibleCalendarProps {
  /** Año académico a mostrar (default: año actual) */
  year?: string;
  /** Callback al hacer click en una actividad */
  onActivityClick?: (activity: FlexibleScheduleActivity, position: { x: number; y: number }) => void;
  /** Callback para crear nueva actividad */
  onCreateActivity?: (dayOfWeek: number, startMinutes: number) => void;
  /** Callback para eliminar una actividad */
  onDelete?: (activityId: string) => void;
  /** Modo de solo lectura (sin drag & drop) */
  readOnly?: boolean;
  /** Filtro opcional (ej: 'all', 'prof:id', 'room:id') */
  filter?: string;
}

// ============================================
// Constantes
// ============================================

const START_TIME = '07:00';
const END_TIME = '18:00'; // Extendido hasta las 6 PM
const PIXELS_PER_MINUTE = 1.5; // Reducido para mejor ajuste sin scroll
const SNAP_MINUTES = 10; // Ajustado a 10 min para mejor UX

// ============================================
// Componente
// ============================================

export const FlexibleCalendar: React.FC<FlexibleCalendarProps> = ({
  year: yearProp,
  onActivityClick,
  onCreateActivity,
  onDelete,
  readOnly = false,
  filter = 'all',
}) => {
  const dispatch = useAppDispatch();
  const allActivities = useAppSelector(selectAllActivities);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const yearFromStore = useAppSelector(selectYear);
  const currentDayOfWeek = useCurrentDayOfWeek();

  const year = yearProp || yearFromStore;

  // Aplicar filtro a las actividades
  const activities = React.useMemo(() => {
    if (filter === 'all') return allActivities;

    if (filter.startsWith('prof:')) {
      const profId = filter.slice(5);
      return allActivities.filter(a => a.teacherId === profId);
    }

    if (filter.startsWith('room:')) {
      const roomId = filter.slice(5);
      return allActivities.filter(a => a.classroomId === roomId);
    }

    return allActivities;
  }, [allActivities, filter]);

  const [overlapMessage, setOverlapMessage] = useState<string | null>(null);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [dropPreview, setDropPreview] = useState<{ day: number; topPx: number; heightPx: number } | null>(null);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);

  // Hooks de interacción
  const {
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    draggingActivity,
    isDragging,
  } = useCalendarDragDrop({
    year,
    snapMinutes: SNAP_MINUTES,
    minTime: timeToMinutes(START_TIME),
    maxTime: timeToMinutes(END_TIME),
    pixelsPerMinute: PIXELS_PER_MINUTE,
    onOverlapDetected: (message) => {
      setOverlapMessage(message);
      setTimeout(() => setOverlapMessage(null), 5000);
    },
  });

  const { handleResizeStart, isResizing, resizingActivity, previewDuration } = useActivityResize({
    year,
    pixelsPerMinute: PIXELS_PER_MINUTE,
    maxTime: timeToMinutes(END_TIME),
    onResizeError: (message) => {
      setOverlapMessage(message);
      setTimeout(() => setOverlapMessage(null), 5000);
    },
  });

  // Cargar actividades al montar
  useEffect(() => {
    dispatch(loadFlexibleSchedule(year));
  }, [dispatch, year]);

  // Handler para click en celda vacía
  const handleCellClick = (dayOfWeek: number, timeMinutes: number) => {
    if (readOnly || isDragging || isResizing) return;
    if (onCreateActivity) {
      onCreateActivity(dayOfWeek, timeMinutes);
    }
  };

  // Handler personalizado de dragOver que funciona para AMBOS casos
  const handleCustomDragOver = (e: React.DragEvent<HTMLDivElement>, dayOfWeek: number) => {
    e.preventDefault();
    e.stopPropagation();
    // Permitir tanto 'copy' (desde panel) como 'move' (actividades existentes)
    e.dataTransfer.dropEffect = draggingActivity ? 'move' : 'copy';

    // Resaltar la columna actual
    if (isDragging || e.dataTransfer.types.includes('text/plain')) {
      setHoveredDay(dayOfWeek);

      // Calcular preview de drop con posición y tamaño exacto
      if (draggingActivity) {
        const rect = e.currentTarget.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;
        const offsetMinutes = Math.round(offsetY / PIXELS_PER_MINUTE / SNAP_MINUTES) * SNAP_MINUTES;
        const topPx = offsetMinutes * PIXELS_PER_MINUTE;
        const heightPx = draggingActivity.durationMinutes * PIXELS_PER_MINUTE;

        setDropPreview({ day: dayOfWeek, topPx, heightPx });
      }
    }
  };

  // Handler para cuando el drag sale de una columna
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Solo limpiar si realmente salimos del elemento (no de sus hijos)
    if (e.currentTarget === e.target) {
      setHoveredDay(null);
      setDropPreview(null);
    }
  };

  // Handler para click en hora
  const handleHourClick = (hour: string) => {
    setSelectedHour(hour);
  };

  // Wrapper para handleDragEnd que también limpia el highlight y preview
  const handleDragEndWithCleanup = () => {
    handleDragEnd();
    setHoveredDay(null);
    setDropPreview(null);
  };

  // Handler combinado para drop (desde panel o desde actividad existente)
  const handleCombinedDrop = (e: React.DragEvent<HTMLDivElement>, dayOfWeek: number) => {
    e.preventDefault();
    e.stopPropagation();

    // Limpiar el highlight y preview
    setHoveredDay(null);
    setDropPreview(null);

    // Verificar si el drop viene del panel (nueva actividad) o de una actividad existente
    const draggedData = e.dataTransfer.getData('text/plain');

    console.log('🎯 Drop detectado:', { draggedData, draggingActivity: !!draggingActivity, hasOnCreate: !!onCreateActivity });

    // Si viene del panel (draggedData es un ID de área), crear nueva actividad
    if (draggedData && !draggingActivity && onCreateActivity) {
      // Calcular la posición del drop
      const rect = e.currentTarget.getBoundingClientRect();
      const offsetY = e.clientY - rect.top;
      const offsetMinutes = Math.round(offsetY / PIXELS_PER_MINUTE / SNAP_MINUTES) * SNAP_MINUTES;
      const absoluteMinutes = timeToMinutes(START_TIME) + offsetMinutes;

      console.log('✅ Llamando onCreateActivity:', { dayOfWeek, absoluteMinutes });
      onCreateActivity(dayOfWeek, absoluteMinutes);
    }
    // Si viene de una actividad existente, usar el handler del hook
    else if (draggingActivity) {
      console.log('🔄 Moviendo actividad existente');
      handleDrop(e, dayOfWeek);
    }
    else {
      console.warn('❌ Drop no procesado. Condiciones:', {
        hasDraggedData: !!draggedData,
        hasDraggingActivity: !!draggingActivity,
        hasOnCreateActivity: !!onCreateActivity
      });
    }
  };

  // Calcular posición de actividad en pixels
  const getActivityPosition = (activity: FlexibleScheduleActivity) => {
    const startMinutes = timeToMinutes(activity.startTime);
    const baseMinutes = timeToMinutes(START_TIME);
    const offsetMinutes = startMinutes - baseMinutes;
    return offsetMinutes * PIXELS_PER_MINUTE;
  };

  // Renderizar actividades por día
  const renderActivitiesForDay = (dayOfWeek: number) => {
    return activities
      .filter((activity) => activity.dayOfWeek === dayOfWeek)
      .map((activity) => {
        const topPosition = getActivityPosition(activity);
        const isDraggingThis = draggingActivity?.id === activity.id;
        const isResizingThis = resizingActivity?.id === activity.id;

        return (
          <CalendarActivity
            key={activity.id}
            activity={activity}
            onClick={onActivityClick}
            onDelete={onDelete}
            isDragging={isDraggingThis}
            isResizing={isResizingThis}
            previewDuration={isResizingThis ? previewDuration : undefined}
            pixelsPerMinute={PIXELS_PER_MINUTE}
            onDragStart={readOnly ? undefined : handleDragStart}
            onDragEnd={handleDragEndWithCleanup}
            onResizeStart={readOnly ? undefined : handleResizeStart}
            style={{
              top: `${topPosition}px`,
              left: '3px',
              right: '3px',
              zIndex: isDraggingThis || isResizingThis ? 30 : 10,
            }}
          />
        );
      });
  };

  // Renderizar contenido según estado
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando horario...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg border border-red-200">
        <div className="text-center p-6">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-red-700 mb-2">Error al cargar horario</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => dispatch(loadFlexibleSchedule(year))}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col">
      {/* Mensaje de solapamiento/error */}
      {overlapMessage && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <span className="font-medium">{overlapMessage}</span>
          </div>
        </div>
      )}

      {/* Calendario principal */}
      <div className="flex-1 min-h-0">
        <CalendarGrid
          startTime={START_TIME}
          endTime={END_TIME}
          pixelsPerMinute={PIXELS_PER_MINUTE}
          minorLineInterval={SNAP_MINUTES}
          onCellClick={handleCellClick}
          onHourClick={handleHourClick}
        >
        {/* Renderizar actividades en columnas correspondientes */}
        <div className="flex w-full h-full">
          {[0, 1, 2, 3, 4].map((dayOfWeek) => {
            const isHighlighted = hoveredDay === dayOfWeek;

            return (
              <div
                key={dayOfWeek}
                className={`flex-1 relative cursor-pointer transition-all duration-200 ${
                  isHighlighted
                    ? 'bg-blue-100 bg-opacity-30 ring-2 ring-inset ring-blue-400'
                    : 'hover:bg-blue-50 hover:bg-opacity-10'
                }`}
                onDragOver={readOnly ? undefined : (e) => handleCustomDragOver(e, dayOfWeek)}
                onDragLeave={readOnly ? undefined : handleDragLeave}
                onDrop={readOnly ? undefined : (e) => handleCombinedDrop(e, dayOfWeek)}
                onClick={(e) => {
                // Solo procesar click si no se hizo en una actividad
                if (e.target === e.currentTarget) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const offsetY = e.clientY - rect.top;
                  const offsetMinutes = Math.round(offsetY / PIXELS_PER_MINUTE / SNAP_MINUTES) * SNAP_MINUTES;
                  const absoluteMinutes = timeToMinutes(START_TIME) + offsetMinutes;
                  handleCellClick(dayOfWeek, absoluteMinutes);
                }
              }}
            >
              {renderActivitiesForDay(dayOfWeek)}

              {/* Preview de drop - muestra dónde caerá la actividad */}
              {dropPreview && dropPreview.day === dayOfWeek && (
                <div
                  className="absolute left-0 right-0 bg-orchid-blue-200 border-2 border-dashed border-indigo-500 rounded opacity-50 pointer-events-none z-20"
                  style={{
                    top: `${dropPreview.topPx}px`,
                    height: `${dropPreview.heightPx}px`,
                  }}
                />
              )}

              {/* Línea "Now" para cada día */}
              <NowLine
                currentDayOfWeek={currentDayOfWeek}
                displayedDayOfWeek={dayOfWeek}
                startMinute={timeToMinutes(START_TIME)}
                endMinute={timeToMinutes(END_TIME)}
                pixelsPerMinute={PIXELS_PER_MINUTE}
              />
            </div>
            );
          })}
        </div>
      </CalendarGrid>
      </div>

      {/* Indicador de estado vacío */}
      {!loading && !error && activities.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <IconCalendarOff size={48} className="text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-600">No hay actividades programadas</p>
            <p className="text-sm text-gray-400 mt-1">
              {readOnly ? '' : 'Haz clic en una celda para crear una actividad'}
            </p>
          </div>
        </div>
      )}

      {/* Modal de actividades por hora */}
      {selectedHour && (
        <HourActivitiesModal
          hour={selectedHour}
          activities={allActivities}
          onClose={() => setSelectedHour(null)}
        />
      )}
    </div>
  );
};

export default FlexibleCalendar;
