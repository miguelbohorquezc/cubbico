/**
 * @fileoverview Modal para mostrar todas las actividades en una hora específica
 * @module presentation/features/schedule/components/HourActivitiesModal
 */

import React, { useEffect, useRef } from 'react';
import { IconX, IconClock, IconUser, IconDoor, IconBook } from '@tabler/icons-react';
import type { FlexibleScheduleActivity } from '../../../../domain/entities/schedule';
import { timeToMinutes } from '../../../../domain/entities/schedule';

interface HourActivitiesModalProps {
  hour: string; // Formato "HH:mm"
  activities: FlexibleScheduleActivity[];
  onClose: () => void;
}

export const HourActivitiesModal: React.FC<HourActivitiesModalProps> = ({
  hour,
  activities,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Filtrar actividades que están activas en esta hora
  const hourMinutes = timeToMinutes(hour);
  const activeActivities = activities.filter((activity) => {
    const startMinutes = timeToMinutes(activity.startTime);
    const endMinutes = timeToMinutes(activity.endTime);
    return hourMinutes >= startMinutes && hourMinutes < endMinutes;
  });

  // Agrupar por día
  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const activitiesByDay: { [key: number]: FlexibleScheduleActivity[] } = {};

  activeActivities.forEach((activity) => {
    if (!activitiesByDay[activity.dayOfWeek]) {
      activitiesByDay[activity.dayOfWeek] = [];
    }
    activitiesByDay[activity.dayOfWeek].push(activity);
  });

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50" onClick={onClose} />

      {/* Modal */}
      <div
        ref={modalRef}
        className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col animate-scaleIn"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-orchid-blue-60 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg">
              <IconClock size={16} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Clases a las {hour}
              </h3>
              <p className="text-xs text-white/80">
                {activeActivities.length} {activeActivities.length === 1 ? 'clase activa' : 'clases activas'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <IconX size={18} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeActivities.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <IconClock size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No hay clases programadas a esta hora</p>
            </div>
          ) : (
            <div className="space-y-4">
              {[0, 1, 2, 3, 4].map((dayOfWeek) => {
                const dayActivities = activitiesByDay[dayOfWeek] || [];
                if (dayActivities.length === 0) return null;

                return (
                  <div key={dayOfWeek} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Día header */}
                    <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                      <h4 className="text-xs font-bold text-gray-700">{dayNames[dayOfWeek]}</h4>
                    </div>

                    {/* Actividades del día */}
                    <div className="divide-y divide-gray-100">
                      {dayActivities.map((activity) => (
                        <div
                          key={activity.id}
                          className="p-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="grid grid-cols-3 gap-3 text-xs">
                            {/* Asignatura */}
                            <div className="flex items-center gap-2">
                              <IconBook size={14} className="text-orchid-blue-60 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 truncate">
                                  {activity.courseName}
                                </p>
                                <p className="text-gray-500 text-[10px]">
                                  {activity.startTime} - {activity.endTime}
                                </p>
                              </div>
                            </div>

                            {/* Profesor */}
                            <div className="flex items-center gap-2">
                              <IconUser size={14} className="text-magenta-500 flex-shrink-0" />
                              <p className="text-gray-700 truncate">{activity.teacherName}</p>
                            </div>

                            {/* Salón */}
                            <div className="flex items-center gap-2">
                              <IconDoor size={14} className="text-tosca-500 flex-shrink-0" />
                              <p className="text-gray-700 truncate">{activity.classroomName}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <p className="text-xs text-gray-500">
            Vista de ocupación en tiempo específico
          </p>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-white bg-orchid-blue-60 rounded hover:bg-orchid-blue-70 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default HourActivitiesModal;
