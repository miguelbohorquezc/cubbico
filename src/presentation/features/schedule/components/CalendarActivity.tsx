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
 * Genera un color basado en el nombre del salón (nivel educativo)
 */
function getColorForClassroom(classroomName: string): {
  bg: string;
  border: string;
  text: string;
} {
  const nivel = getNivelFromClassroom(classroomName);
  return NIVEL_COLORS[nivel] || NIVEL_COLORS['primaria'];
}

/**
 * Colores por nivel educativo usando COLORS.md
 */
const NIVEL_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'preescolar': { bg: 'bg-tosca-ds/20', border: 'border-tosca-ds', text: 'text-tosca-cc' },
  'primaria': { bg: 'bg-magenta-ds/20', border: 'border-magenta-ds', text: 'text-magenta-cc' },
  'secundaria': { bg: 'bg-yellow-ds/20', border: 'border-yellow-ds', text: 'text-yellow-cc' },
};

/**
 * Determina el nivel educativo basándose en el nombre del salón
 */
function getNivelFromClassroom(classroomName: string): string {
  const name = classroomName.toLowerCase();
  if (name.includes('preescolar') || name.includes('pre-escolar') || name.includes('jardín') || name.includes('párvulos') || name.includes('nursery') || name.includes('kinder') || name.includes('transición')) {
    return 'preescolar';
  }
  if (name.includes('primaria') || /^(primero|segundo|tercero|cuarto|quinto)/.test(name)) {
    return 'primaria';
  }
  if (name.includes('secundaria') || name.includes('bachillerato') || /^(sexto|séptimo|octavo|noveno|décimo|undécimo)/.test(name)) {
    return 'secundaria';
  }
  return 'primaria'; // default
}

// ============================================
// Componente
// ============================================

export const CalendarActivity: React.FC<CalendarActivityProps> = ({
  activity,
  onEdit: _onEdit,
  onDelete: _onDelete,
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
  const colors = getColorForClassroom(activity.classroomName);

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
