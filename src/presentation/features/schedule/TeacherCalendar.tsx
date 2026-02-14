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
  const user = useAppSelector((state) => state.user);
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
          <div className="flex items-center justify-center w-8 h-8 bg-orchid-blue-500 rounded-lg">
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

      {/* Modal de confirmación */}
      {selectedActivity && (
        <>
          {/* Backdrop con blur */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] animate-fade-in"
            onClick={() => setSelectedActivity(null)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full pointer-events-auto animate-scale-in">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orchid-blue-500 rounded-lg flex items-center justify-center">
                    <IconClipboardCheck size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Pasar Asistencia</h3>
                    <p className="text-xs text-gray-500">Confirma para continuar</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <IconX size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Asignatura</p>
                  <p className="text-sm font-medium text-gray-900">{selectedActivity.courseName}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Hora</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedActivity.startTime} - {selectedActivity.endTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Salón</p>
                    <p className="text-sm font-medium text-gray-900">{selectedActivity.classroomName}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 rounded-b-2xl">
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmAttendance}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-orchid-blue-600 rounded-lg hover:bg-orchid-blue-700 transition-all shadow-sm hover:shadow-md"
                >
                  Pasar Lista
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
