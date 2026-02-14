/**
 * @fileoverview Card/Popover de detalle de una actividad del calendario
 * @module presentation/features/schedule/components/ActivityDetailCard
 */

import React, { useEffect, useRef } from 'react';
import { useAppDispatch } from '../../../app/store/store';
import { removeActivity } from '../../../app/store/states/flexibleSchedule.slice';
import type { FlexibleScheduleActivity } from '../../../../domain/entities/schedule';
import { DAYS_OF_WEEK } from '../../../../domain/entities/schedule';

// ============================================
// Tipos
// ============================================

export interface ActivityDetailCardProps {
  /** Actividad a mostrar */
  activity: FlexibleScheduleActivity;
  /** Año académico */
  year: string;
  /** Callback al cerrar */
  onClose: () => void;
  /** Callback al editar */
  onEdit?: () => void;
  /** Callback para pasar asistencia (navega a ruta de asistencia) */
  onAttendance?: () => void;
  /** Posición de la card (opcional, por defecto centrada) */
  position?: { x: number; y: number };
}

// ============================================
// Componente
// ============================================

export const ActivityDetailCard: React.FC<ActivityDetailCardProps> = ({
  activity,
  year,
  onClose,
  onEdit,
  onAttendance,
  position,
}) => {
  const dispatch = useAppDispatch();
  const cardRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Añadir listener con un pequeño delay para evitar cierre inmediato
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Manejar eliminación
  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de eliminar esta actividad?')) {
      try {
        await dispatch(removeActivity({ year, activityId: activity.id })).unwrap();
        onClose();
      } catch (error) {
        console.error('Error al eliminar actividad:', error);
        alert('Error al eliminar la actividad');
      }
    }
  };

  // Estilo de posicionamiento
  const cardStyle: React.CSSProperties = position
    ? {
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -10px)',
      }
    : {
        position: 'fixed',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      };

  return (
    <>
      {/* Overlay oscuro */}
      <div className="fixed inset-0 bg-black bg-opacity-30 z-40 backdrop-blur-sm" />

      {/* Card */}
      <div
        ref={cardRef}
        style={cardStyle}
        className="bg-white rounded-lg shadow-2xl border border-gray-200 p-6 z-50 max-w-md w-full mx-4 animate-fade-in"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-1">{activity.courseName}</h3>
            <p className="text-sm text-gray-500">
              {DAYS_OF_WEEK[activity.dayOfWeek]} • {activity.startTime} - {activity.endTime}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            title="Cerrar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Información */}
        <div className="space-y-3 mb-6">
          {/* Duración */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600">⏱️</span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Duración</p>
              <p className="font-semibold text-gray-800">{activity.durationMinutes} minutos</p>
            </div>
          </div>

          {/* Profesor */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-magenta-100 rounded-lg flex items-center justify-center">
              <span className="text-magenta-600">👨‍🏫</span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Profesor</p>
              <p className="font-semibold text-gray-800">{activity.teacherName}</p>
            </div>
          </div>

          {/* Salón */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600">🚪</span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Salón</p>
              <p className="font-semibold text-gray-800">{activity.classroomName}</p>
            </div>
          </div>
        </div>

        {/* Botón principal: Pasar Asistencia */}
        {onAttendance && (
          <button
            onClick={onAttendance}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-semibold mb-3 shadow-md hover:shadow-lg"
          >
            📋 Pasar Asistencia
          </button>
        )}

        {/* Botones secundarios */}
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              ✏️ Editar
            </button>
          )}
          <button
            onClick={handleDelete}
            className="flex-1 bg-red-50 text-red-600 py-2 px-4 rounded-lg hover:bg-red-100 transition-colors font-medium"
          >
            🗑️ Eliminar
          </button>
        </div>
      </div>
    </>
  );
};

export default ActivityDetailCard;
