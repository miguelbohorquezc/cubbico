/**
 * @fileoverview Popover de información detallada de una actividad
 * @module presentation/features/schedule/components/ActivityInfoModal
 */

import React, { useEffect, useRef } from 'react';
import { IconX, IconUser, IconDoor, IconCalendar, IconClock, IconTrash, IconEdit } from '@tabler/icons-react';
import type { FlexibleScheduleActivity } from '../../../../domain/entities/schedule';

interface ActivityInfoModalProps {
  activity: FlexibleScheduleActivity;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  position?: { x: number; y: number }; // Posición del clic
}

export const ActivityInfoModal: React.FC<ActivityInfoModalProps> = ({
  activity,
  onClose,
  onEdit,
  onDelete,
  position,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const dayName = dayNames[activity.dayOfWeek] || 'Desconocido';

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Calcular posición del popover (centrado si no hay position)
  const popoverStyle: React.CSSProperties = position
    ? {
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, 10px)',
      }
    : {
        position: 'fixed',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      };

  return (
    <>
      {/* Overlay transparente */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Popover compacto */}
      <div
        ref={popoverRef}
        className="z-50 bg-white rounded-lg shadow-2xl border border-gray-200 w-72 animate-scaleIn"
        style={popoverStyle}
      >
        {/* Header compacto */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 truncate">
              {activity.courseName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="ml-2 p-1 hover:bg-white rounded transition-colors flex-shrink-0"
          >
            <IconX size={14} className="text-gray-400" />
          </button>
        </div>

        {/* Content compacto */}
        <div className="p-3 space-y-2 text-xs">
          {/* Día y horario */}
          <div className="flex items-center gap-2">
            <IconCalendar size={14} className="text-indigo-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-gray-900">{dayName}</span>
              <span className="text-gray-500 ml-1">
                {activity.startTime} - {activity.endTime}
              </span>
            </div>
          </div>

          {/* Duración */}
          <div className="flex items-center gap-2">
            <IconClock size={14} className="text-blue-500 flex-shrink-0" />
            <span className="text-gray-700">{activity.durationMinutes} minutos</span>
          </div>

          {/* Profesor */}
          <div className="flex items-center gap-2">
            <IconUser size={14} className="text-purple-500 flex-shrink-0" />
            <span className="text-gray-700 truncate">{activity.teacherName}</span>
          </div>

          {/* Salón */}
          <div className="flex items-center gap-2">
            <IconDoor size={14} className="text-emerald-500 flex-shrink-0" />
            <span className="text-gray-700 truncate">{activity.classroomName}</span>
          </div>
        </div>

        {/* Actions compactos */}
        <div className="flex items-center gap-1 px-2 py-2 border-t border-gray-100 bg-gray-50">
          {onEdit && (
            <button
              onClick={() => {
                onEdit();
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors"
            >
              <IconEdit size={12} />
              <span>Editar</span>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => {
                onDelete();
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded transition-colors"
            >
              <IconTrash size={12} />
              <span>Eliminar</span>
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: translate(-50%, 10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 10px) scale(1);
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.15s ease-out;
        }
      `}</style>
    </>
  );
};

export default ActivityInfoModal;
