/**
 * @fileoverview Lista de planillas de asistencia por período (reemplaza al calendario)
 * @module presentation/features/attendance/TeacherPlanillaList
 *
 * Muestra todas las planillas del docente agrupadas por período > salón > asignatura.
 * Cada tarjeta enlaza a AttendancePlanilla con la fecha de referencia correcta.
 * El coordinador ve TODAS las planillas.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/store/store';
import {
  loadFlexibleSchedule,
  selectAllActivities,
  selectLoading,
} from '../../../app/store/states/flexibleSchedule.slice';
import { fetchPeriodConfigsByYear } from '../../../infrastructure/periodConfig.service';
import type { FlexibleScheduleActivity } from '../../../domain/entities/schedule';
import type { PeriodConfig } from '../../../domain/entities/periodConfig';
import { PrivateRoutes } from '../../../app/routes/routes';
import {
  IconClipboardList,
  IconLoader,
  IconInfoCircle,
  IconBook,
  IconDoor,
  IconChevronRight,
  IconClock,
} from '@tabler/icons-react';

// ============================================
// Constantes
// ============================================

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

// ============================================
// Utilidades
// ============================================

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Dado el inicio del período y el día de semana de la clase (0=Lun…4=Vie),
 * retorna la primera fecha ISO dentro del período que cae en ese día.
 * Si no hay ninguna (período muy corto), retorna la propia fechaInicio.
 */
function firstClassDateInPeriod(fechaInicio: string, dayOfWeek: number): string {
  const start = new Date(fechaInicio + 'T00:00:00');
  // dow del inicio: getDay() → 0=Dom,1=Lun... convertimos a 0=Lun
  for (let i = 0; i < 7; i++) {
    const candidate = new Date(start);
    candidate.setDate(start.getDate() + i);
    const dow = (candidate.getDay() + 6) % 7; // Mon=0…Sun=6
    if (dow === dayOfWeek) {
      return `${candidate.getFullYear()}-${pad(candidate.getMonth() + 1)}-${pad(candidate.getDate())}`;
    }
  }
  return fechaInicio;
}

// ============================================
// Tipos internos
// ============================================

interface PlanillaCard {
  activity: FlexibleScheduleActivity;
  period: PeriodConfig;
  refDate: string; // fecha ISO para la ruta
}

interface GroupedByPeriod {
  period: PeriodConfig;
  byClassroom: {
    classroomId: string;
    classroomName: string;
    cards: PlanillaCard[];
  }[];
}

// ============================================
// Props
// ============================================

interface TeacherPlanillaListProps {
  userUid: string;
  userRole: string;
}

// ============================================
// Componente
// ============================================

export default function TeacherPlanillaList({ userUid, userRole }: TeacherPlanillaListProps) {
  const dispatch = useAppDispatch();
  const activities = useAppSelector(selectAllActivities);
  const isLoadingSchedule = useAppSelector(selectLoading);

  const currentYear = String(new Date().getFullYear());

  const [periodConfigs, setPeriodConfigs] = useState<PeriodConfig[]>([]);
  const [loadingPeriods, setLoadingPeriods] = useState(true);
  const [errorPeriods, setErrorPeriods] = useState<string | null>(null);

  // Cargar horario si no está en el store
  useEffect(() => {
    dispatch(loadFlexibleSchedule(currentYear));
  }, [dispatch, currentYear]);

  // Cargar períodos configurados
  useEffect(() => {
    let cancelled = false;
    setLoadingPeriods(true);
    fetchPeriodConfigsByYear(currentYear)
      .then(configs => {
        if (cancelled) return;
        const valid = configs
          .filter(c => c.fechaInicio && c.fechaFin)
          .sort((a, b) => a.periodId.localeCompare(b.periodId));
        setPeriodConfigs(valid);
      })
      .catch(() => {
        if (!cancelled) setErrorPeriods('Error al cargar períodos.');
      })
      .finally(() => {
        if (!cancelled) setLoadingPeriods(false);
      });
    return () => { cancelled = true; };
  }, [currentYear]);

  // Filtrar actividades por docente (coordinador ve todas)
  const myActivities: FlexibleScheduleActivity[] =
    userRole === 'Coordinador'
      ? activities
      : activities.filter(a => a.teacherId === userUid);

  // Construir agrupacion: periodo > salon > actividades
  const grouped: GroupedByPeriod[] = periodConfigs.map(period => {
    const byClassroomMap = new Map<string, { classroomId: string; classroomName: string; cards: PlanillaCard[] }>();

    myActivities.forEach(activity => {
      const refDate = firstClassDateInPeriod(period.fechaInicio!, activity.dayOfWeek);
      const card: PlanillaCard = { activity, period, refDate };

      if (!byClassroomMap.has(activity.classroomId)) {
        byClassroomMap.set(activity.classroomId, {
          classroomId: activity.classroomId,
          classroomName: activity.classroomName,
          cards: [],
        });
      }
      byClassroomMap.get(activity.classroomId)!.cards.push(card);
    });

    // Ordenar tarjetas dentro del salón por día y hora
    byClassroomMap.forEach(group => {
      group.cards.sort((a, b) => {
        if (a.activity.dayOfWeek !== b.activity.dayOfWeek) {
          return a.activity.dayOfWeek - b.activity.dayOfWeek;
        }
        return a.activity.startTime.localeCompare(b.activity.startTime);
      });
    });

    return {
      period,
      byClassroom: Array.from(byClassroomMap.values()).sort((a, b) =>
        a.classroomName.localeCompare(b.classroomName)
      ),
    };
  });

  const isLoading = isLoadingSchedule || loadingPeriods;

  // ── RENDER ──────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-3 text-gray-500">
          <IconLoader size={20} className="animate-spin" />
          <span className="text-sm font-medium">Cargando planillas…</span>
        </div>
      </div>
    );
  }

  if (errorPeriods) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
        <IconInfoCircle size={16} className="flex-shrink-0" />
        {errorPeriods}
      </div>
    );
  }

  if (periodConfigs.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-amber-200 shadow-sm p-6 flex items-start gap-3">
        <IconInfoCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-gray-800">Sin períodos configurados</p>
          <p className="text-xs text-gray-500 mt-1">
            El coordinador debe configurar las fechas de inicio y fin de cada período
            en Configuración → Períodos.
          </p>
        </div>
      </div>
    );
  }

  if (myActivities.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-10 text-center">
        <IconClipboardList size={36} className="mx-auto text-gray-300 mb-3" />
        <p className="text-sm font-semibold text-gray-700">Sin clases asignadas</p>
        <p className="text-xs text-gray-400 mt-1">
          No tienes clases en el horario del año {currentYear}.
          Pide al coordinador que configure tu horario.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {grouped.map(({ period, byClassroom }) => (
        <div key={period.periodId}>
          {/* Cabecera del período */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-orchid-blue-60 text-white text-sm font-extrabold flex items-center justify-center flex-shrink-0 shadow-sm">
              {period.periodId}
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Período {period.periodId}</h2>
              <p className="text-[11px] text-gray-400">
                {period.fechaInicio} — {period.fechaFin}
              </p>
            </div>
          </div>

          {byClassroom.length === 0 ? (
            <p className="text-xs text-gray-400 pl-11">Sin clases para este período.</p>
          ) : (
            <div className="space-y-3 pl-4 border-l-2 border-orchid-blue-10 ml-3">
              {byClassroom.map(({ classroomId, classroomName, cards }) => (
                <div key={classroomId} className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                  {/* Header del salón */}
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                    <IconDoor size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                      {classroomName}
                    </span>
                  </div>

                  {/* Tarjetas de asignatura */}
                  <div className="divide-y divide-gray-50">
                    {cards.map(({ activity, refDate }) => {
                      const horaEncoded = encodeURIComponent(activity.startTime);
                      const planillaUrl = `/${PrivateRoutes.PRIVATE}/${PrivateRoutes.DASHBOARD}/${PrivateRoutes.ASISTENCIA}/planilla/${activity.classroomId}/${activity.teacherId}/${activity.courseId}/${refDate}/${horaEncoded}`;

                      return (
                        <Link
                          key={`${activity.id}-${period.periodId}`}
                          to={planillaUrl}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-tosca-ds/5 transition-colors group"
                        >
                          {/* Icono de área */}
                          <div className="w-8 h-8 rounded-lg bg-tosca-ds/10 flex items-center justify-center flex-shrink-0 group-hover:bg-tosca-ds/20 transition-colors">
                            <IconBook size={15} className="text-tosca-cc" />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                              {activity.courseName}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-gray-400">
                                {DAY_NAMES[activity.dayOfWeek]}
                              </span>
                              <span className="text-[11px] text-gray-300">·</span>
                              <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                <IconClock size={10} />
                                {activity.startTime} – {activity.endTime}
                              </span>
                              {userRole === 'Coordinador' && (
                                <>
                                  <span className="text-[11px] text-gray-300">·</span>
                                  <span className="text-[11px] text-gray-400 truncate">
                                    {activity.teacherName}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Acción */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-[11px] font-semibold text-orchid-blue-60 hidden sm:block">
                              Abrir planilla
                            </span>
                            <IconChevronRight size={15} className="text-gray-300 group-hover:text-orchid-blue-60 transition-colors" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
