/**
 * @fileoverview Calendario semanal del docente (Dashboard)
 * @module presentation/features/schedule/TeacherCalendar
 *
 * Muestra las clases de la semana del usuario autenticado usando FlexibleCalendar.
 * Cada clase es clickeable y navega a la página de asistencia correspondiente.
 *
 * Flujo de interacción mejorado:
 * - Al hacer clic en una actividad, se muestra un modal de confirmación
 * - El modal presenta información de la clase: asignatura, hora y salón
 * - El usuario puede confirmar ("Pasar Lista") o cancelar
 * - El modal se puede cerrar con Escape o haciendo clic fuera
 * - Solo al confirmar se navega a la página de asistencia
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../app/store/store';
import { loadFlexibleSchedule } from '../../../app/store/states/flexibleSchedule.slice';
import { FlexibleCalendar } from './FlexibleCalendar';
import type { FlexibleScheduleActivity } from '../../../domain/entities/schedule';
import { PrivateRoutes } from '../../../app/routes/routes';
import { IconCalendar, IconX, IconClipboardCheck } from '@tabler/icons-react';

export default function TeacherCalendar() {
  const user = useAppSelector((state) => state.user) as any;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const year = String(new Date().getFullYear());
  const [selectedActivity, setSelectedActivity] = useState<FlexibleScheduleActivity | null>(null);

  // Cargar horario
  useEffect(() => {
    dispatch(loadFlexibleSchedule(year));
  }, [dispatch, year]);

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedActivity) {
        setSelectedActivity(null);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [selectedActivity]);

  // Navegar a asistencia al hacer clic en actividad
  const handleActivityClick = (activity: FlexibleScheduleActivity, _position: { x: number; y: number }) => {
    setSelectedActivity(activity);
  };

  // Confirmar y navegar a asistencia
  const handleConfirmAttendance = () => {
    if (!selectedActivity) return;

    // Calcular la fecha correcta basándose en el día de la semana de la actividad
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado

    // Convertir dayOfWeek de la actividad (0 = Lunes) a formato de JS (1 = Lunes)
    const activityDayOfWeek = selectedActivity.dayOfWeek + 1; // 0 -> 1 (Lunes), 4 -> 5 (Viernes)

    // Calcular diferencia de días
    let daysDifference = activityDayOfWeek - currentDayOfWeek;

    // Ajustar si estamos en fin de semana (ir al lunes siguiente o anterior)
    if (currentDayOfWeek === 0) { // Domingo
      daysDifference = activityDayOfWeek - 7; // Ir a la semana que pasó
    } else if (currentDayOfWeek === 6) { // Sábado
      daysDifference = activityDayOfWeek + 2; // Ir al lunes siguiente
    }

    // Calcular la fecha correcta
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysDifference);

    // Convertir a formato ISO sin conversión UTC (evita problemas de zona horaria)
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const isoDate = `${year}-${month}-${day}`;

    navigate(
      `/${PrivateRoutes.PRIVATE}/${PrivateRoutes.DASHBOARD}/${PrivateRoutes.ASISTENCIA}/${selectedActivity.classroomId}/${selectedActivity.teacherId}/${selectedActivity.courseId}/${isoDate}/${encodeURIComponent(selectedActivity.startTime)}`
    );
  };

  // Determinar filtro según rol
  const filter = user?.role === 'Coordinador' ? 'all' : `prof:${user?.uid || ''}`;

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 bg-orchid-blue-60 rounded-lg">
            <IconCalendar size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700">
              {user?.role === 'Coordinador' ? 'Horario General' : 'Mi Horario'}
            </h3>
            <p className="text-[10px] text-gray-400">
              Click en una clase para registrar asistencia
            </p>
          </div>
        </div>
      </div>

      {/* Calendario */}
      <div className="flex-1 min-h-0 p-3">
        <FlexibleCalendar
          year={year}
          filter={filter}
          readOnly={true}
          onActivityClick={handleActivityClick}
        />
      </div>

      {/* Toast de confirmación */}
      {selectedActivity && (
        <>
          {/* Overlay transparente */}
          <div className="fixed inset-0 z-40" onClick={() => setSelectedActivity(null)} />

          {/* Toast compacto */}
          <div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 w-72 animate-scaleIn"
          >
            {/* Header compacto */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-5 rounded-t-lg">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-gray-900 truncate">
                  {selectedActivity.courseName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedActivity(null)}
                className="ml-2 p-1 hover:bg-white rounded-lg transition-colors flex-shrink-0"
              >
                <IconX size={14} className="text-gray-400" />
              </button>
            </div>

            {/* Content compacto */}
            <div className="p-3 space-y-2 text-xs">
              {/* Horario */}
              <div className="flex items-center gap-2">
                <IconCalendar size={14} className="text-orchid-blue-60 flex-shrink-0" />
                <span className="text-gray-700">
                  {selectedActivity.startTime} - {selectedActivity.endTime}
                </span>
              </div>

              {/* Salón */}
              <div className="flex items-center gap-2">
                <IconClipboardCheck size={14} className="text-tosca-ds flex-shrink-0" />
                <span className="text-gray-700 truncate">{selectedActivity.classroomName}</span>
              </div>
            </div>

            {/* Actions compactos */}
            <div className="flex items-center gap-1.5 px-2 py-2 border-t border-gray-100 bg-gray-5 rounded-b-lg">
              <button
                onClick={() => setSelectedActivity(null)}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
              >
                <span>Cancelar</span>
              </button>
              <button
                onClick={handleConfirmAttendance}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-white bg-orchid-blue-60 hover:bg-orchid-blue-70 rounded-lg transition-colors border border-orchid-blue-30"
              >
                <IconClipboardCheck size={12} />
                <span>Pasar Lista</span>
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
              animation: scaleIn 0.15s ease-out;
            }
          `}</style>
        </>
      )}
    </div>
  );
}
