/**
 * @fileoverview Componente visual para una actividad en el calendario flexible
 * @module presentation/features/schedule/components/CalendarActivity
 *
 * Mejoras visuales implementadas:
 * - Bordes completos (border-2) en lugar de solo borde izquierdo para mejor diferenciación
 * - Separación vertical (mb-1) entre actividades consecutivas
 * - Efecto hover mejorado con escala sutil (scale-[1.02]) y sombra pronunciada
 * - Z-index elevado en hover (z-20) para resaltar la actividad sobre las demás
 * - Bordes redondeados mejorados (rounded-lg) para un look más moderno
 */

import React from 'react';
import { IconUser, IconDoor } from '@tabler/icons-react';
import type { FlexibleScheduleActivity } from '../../../../domain/entities/schedule';

// ============================================
// Tipos
// ============================================

export interface CalendarActivityProps {
  activity: FlexibleScheduleActivity;
  onEdit?: (activity: FlexibleScheduleActivity) => void;
  onDelete?: (activityId: string) => void;
  onClick?: (activity: FlexibleScheduleActivity, position: { x: number; y: number }) => void;
  isDragging?: boolean;
  isResizing?: boolean;
  isOverlapping?: boolean;
  previewDuration?: number; // Duración temporal durante resize (para feedback instantáneo)
  pixelsPerMinute?: number; // Cuántos pixels representa 1 minuto (default: 2)
  // Drag & Drop handlers
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, activity: FlexibleScheduleActivity) => void;
  onDragEnd?: () => void;
  // Resize handlers
  onResizeStart?: (e: React.MouseEvent<HTMLDivElement>, activity: FlexibleScheduleActivity) => void;
  // Estilo personalizado para posicionamiento
  style?: React.CSSProperties;
}

// ============================================
// Utilidades
// ============================================

/**
 * Genera un color determinístico basado en el ID del curso.
 * Siempre devuelve el mismo color para el mismo curso.
 */
function getColorForCourse(courseId: string): {
  bg: string;
  border: string;
  text: string;
} {
  // Hash simple del courseId para generar un índice
  let hash = 0;
  for (let i = 0; i < courseId.length; i++) {
    hash = courseId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COURSE_COLORS.length;

  return COURSE_COLORS[index];
}

/**
 * Paleta de colores moderna para actividades.
 * Colores más saturados y vibrantes con buen contraste.
 */
const COURSE_COLORS = [
  { bg: 'bg-blue-200', border: 'border-blue-500', text: 'text-blue-950' },
  { bg: 'bg-emerald-200', border: 'border-tosca-500', text: 'text-tosca-950' },
  { bg: 'bg-magenta-200', border: 'border-purple-500', text: 'text-magenta-950' },
  { bg: 'bg-amber-200', border: 'border-amber-500', text: 'text-amber-950' },
  { bg: 'bg-pink-200', border: 'border-pink-500', text: 'text-pink-950' },
  { bg: 'bg-orchid-blue-200', border: 'border-indigo-500', text: 'text-orchid-blue-950' },
  { bg: 'bg-teal-200', border: 'border-teal-500', text: 'text-teal-950' },
  { bg: 'bg-orange-200', border: 'border-orange-500', text: 'text-orange-950' },
  { bg: 'bg-cyan-200', border: 'border-cyan-500', text: 'text-cyan-950' },
  { bg: 'bg-rose-200', border: 'border-rose-500', text: 'text-rose-950' },
];

// ============================================
// Componente
// ============================================

export const CalendarActivity: React.FC<CalendarActivityProps> = ({
  activity,
  onEdit,
  onDelete,
  onClick,
  isDragging = false,
  isResizing = false,
  isOverlapping = false,
  previewDuration,
  pixelsPerMinute = 2,
  onDragStart,
  onDragEnd,
  onResizeStart,
  style,
}) => {
  const colors = getColorForCourse(activity.courseId);

  // Calcular altura en pixels - usar previewDuration durante resize para feedback instantáneo
  const effectiveDuration = previewDuration ?? activity.durationMinutes;
  const heightPx = effectiveDuration * pixelsPerMinute;

  // Clases CSS dinámicas - diseño profesional compacto
  const baseClasses = `
    absolute rounded-lg p-2 cursor-pointer pointer-events-auto
    transition-all duration-150 ease-in-out
    shadow-sm hover:shadow-lg hover:scale-[1.02] hover:z-20
    ${colors.bg} ${colors.text}
    border-2 ${colors.border}
    mb-1
  `;

  const stateClasses = `
    ${isDragging ? 'opacity-60 cursor-grabbing scale-95' : 'cursor-grab'}
    ${isResizing ? 'cursor-ns-resize select-none ring-2 ring-blue-400 ring-offset-1' : ''}
    ${isOverlapping ? 'ring-2 ring-red-500 ring-offset-1 bg-red-50' : ''}
  `;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick(activity, { x: e.clientX, y: e.clientY });
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(activity);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(activity.id);
    }
  };

  const handleDragStartInternal = (e: React.DragEvent<HTMLDivElement>) => {
    if (onDragStart) {
      onDragStart(e, activity);
    }
  };

  const handleResizeStartInternal = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onResizeStart) {
      onResizeStart(e, activity);
    }
  };

  return (
    <div
      className={`${baseClasses} ${stateClasses} group`.trim()}
      style={{ height: `${heightPx}px`, minHeight: '30px', ...style }}
      onClick={handleClick}
      draggable={!isResizing}
      onDragStart={handleDragStartInternal}
      onDragEnd={onDragEnd}
      data-activity-id={activity.id}
    >
      {/* Badge de solapamiento */}
      {isOverlapping && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          !
        </div>
      )}

      {/* Contenido principal - diseño profesional compacto */}
      <div className="flex flex-col h-full overflow-hidden justify-between">
        {/* Header: Título y hora siempre visible */}
        <div className="space-y-0.5">
          <div className="font-bold text-sm leading-tight truncate" title={activity.courseName}>
            {activity.courseName}
          </div>
          <div className="text-[10px] font-medium opacity-70 leading-tight">
            {activity.startTime} - {activity.endTime}
          </div>
        </div>

        {/* Footer: Profesor y salón con iconos (altura > 65px) */}
        {heightPx > 65 && (
          <div className="text-[10px] opacity-75 space-y-0.5 mt-1">
            <div className="flex items-center gap-1 truncate" title={activity.teacherName}>
              <IconUser size={11} className="flex-shrink-0" />
              <span className="truncate">{activity.teacherName}</span>
            </div>
            <div className="flex items-center gap-1 truncate" title={activity.classroomName}>
              <IconDoor size={11} className="flex-shrink-0" />
              <span className="truncate">{activity.classroomName}</span>
            </div>
          </div>
        )}

        {/* Handle de resize (borde inferior) */}
        <div
          className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize hover:bg-black hover:bg-opacity-20 transition-colors"
          data-resize-handle
          onMouseDown={handleResizeStartInternal}
          title="Arrastrar para cambiar duración"
        >
          <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-400 rounded-full opacity-60" />
        </div>
      </div>
    </div>
  );
};

export default CalendarActivity;
