/**
 * @fileoverview Calendario semanal del docente (Dashboard)
 * @module presentation/features/schedule/TeacherCalendar
 *
 * Muestra las clases de la semana del usuario autenticado usando FlexibleCalendar.
 * Cada clase es clickeable y navega a la página de asistencia correspondiente.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../app/store/store';
import { loadFlexibleSchedule } from '../../../app/store/states/flexibleSchedule.slice';
import { FlexibleCalendar } from './FlexibleCalendar';
import type { FlexibleScheduleActivity } from '../../../domain/entities/schedule';
import { PrivateRoutes } from '../../../app/routes/routes';
import { IconCalendar } from '@tabler/icons-react';

export default function TeacherCalendar() {
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const year = String(new Date().getFullYear());

  // Cargar horario
  useEffect(() => {
    dispatch(loadFlexibleSchedule(year));
  }, [dispatch, year]);

  // Navegar a asistencia al hacer clic en actividad
  const handleActivityClick = (activity: FlexibleScheduleActivity, _position: { x: number; y: number }) => {
    // Calcular la fecha correcta basándose en el día de la semana de la actividad
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado

    // Convertir dayOfWeek de la actividad (0 = Lunes) a formato de JS (1 = Lunes)
    const activityDayOfWeek = activity.dayOfWeek + 1; // 0 -> 1 (Lunes), 4 -> 5 (Viernes)

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
      `/${PrivateRoutes.PRIVATE}/${PrivateRoutes.DASHBOARD}/${PrivateRoutes.ASISTENCIA}/${activity.classroomId}/${activity.teacherId}/${activity.courseId}/${isoDate}/${encodeURIComponent(activity.startTime)}`
    );
  };

  // Determinar filtro según rol
  const filter = user?.role === 'Coordinador' ? 'all' : `prof:${user?.uid || ''}`;

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
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
    </div>
  );
}
