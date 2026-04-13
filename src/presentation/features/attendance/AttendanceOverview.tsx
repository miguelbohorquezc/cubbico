/**
 * @fileoverview Vista panorámica de informes de asistencia por salón (solo Coordinador)
 * @module presentation/features/attendance/AttendanceOverview
 *
 * Lista todos los salones y sus clases según el horario flexible actual.
 * Acciones por clase:
 *  - Ver planilla del período
 *  - Ver informe mensual
 * Acciones por salón:
 *  - Reporte consolidado mensual
 *  - Informe del período completo
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarV2 } from '../../components/sidebarV2';
import { HeaderV2 } from '../../components/headerV2';
import { fetchClassrooms } from '../../../infrastructure/classRoom.service';
import { fetchFlexibleSchedule } from '../../../infrastructure/schedule.service';
import { fetchPeriodConfigsByYear } from '../../../infrastructure/periodConfig.service';
import type { ClassRoom } from '../../../domain/entities/classRoom';
import type { FlexibleScheduleActivity } from '../../../domain/entities/schedule';
import type { PeriodConfig } from '../../../domain/entities/periodConfig';
import { PrivateRoutes } from '../../../app/routes/routes';
import {
  IconLoader,
  IconAlertCircle,
  IconFileAnalytics,
  IconChevronRight,
  IconBook,
  IconDoor,
  IconClipboardList,
  IconChartBar,
} from '@tabler/icons-react';

// ============================================
// Hook: sincronizar sidebar
// ============================================

const SIDEBAR_KEY = 'cubbico-sidebar-collapsed';

function useSidebarCollapsed(): boolean {
  const [c, setC] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_KEY) === 'true'; } catch { return false; }
  });
  useEffect(() => {
    const t = setInterval(() => {
      try { setC(localStorage.getItem(SIDEBAR_KEY) === 'true'); } catch { /* noop */ }
    }, 100);
    return () => clearInterval(t);
  }, []);
  return c;
}

// ============================================
// Utilidades
// ============================================

function pad(n: number): string { return String(n).padStart(2, '0'); }

/**
 * Calcula la fecha más reciente (≤ hoy) que caiga en el día de semana dado.
 * dayOfWeek: 0=Lun … 4=Vie
 */
function mostRecentDayOccurrence(dayOfWeek: number): string {
  const today = new Date();
  const todayDow = (today.getDay() + 6) % 7; // Mon=0
  let diff = todayDow - dayOfWeek;
  if (diff < 0) diff += 7;
  const target = new Date(today);
  target.setDate(today.getDate() - diff);
  return `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}`;
}

// ============================================
// Tipos internos
// ============================================

interface UniqueClass {
  profesorId: string;
  profesorNombre: string;
  areaId: string;
  areaNombre: string;
  hora: string;        // startTime de la actividad
  dayOfWeek: number;   // para calcular fecha de referencia
  key: string;
}

interface SalonGroup {
  room: ClassRoom;
  classes: UniqueClass[];
}

// ============================================
// Componente
// ============================================

export default function AttendanceOverview() {
  const navigate = useNavigate();
  const isSidebarCollapsed = useSidebarCollapsed();
  const currentYear = String(new Date().getFullYear());

  const [classrooms, setClassrooms]       = useState<ClassRoom[]>([]);
  const [activities, setActivities]       = useState<FlexibleScheduleActivity[]>([]);
  const [periodConfigs, setPeriodConfigs] = useState<PeriodConfig[]>([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [filterProf, setFilterProf]       = useState<string>('all');
  // Selector de período para "informe del período" por salón
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');

  // ── Cargar datos ───────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [rooms, schedule, configs] = await Promise.all([
          fetchClassrooms(),
          fetchFlexibleSchedule(currentYear),
          fetchPeriodConfigsByYear(currentYear),
        ]);
        if (cancelled) return;
        setClassrooms(rooms);
        setActivities(schedule.activities);
        const validConfigs = configs
          .filter(c => c.fechaInicio && c.fechaFin)
          .sort((a, b) => a.periodId.localeCompare(b.periodId));
        setPeriodConfigs(validConfigs);
        if (validConfigs.length > 0) {
          // Auto-seleccionar período activo o el último
          const todayISO = new Date().toISOString().slice(0, 10);
          const active = validConfigs.find(c => c.fechaInicio! <= todayISO && todayISO <= c.fechaFin!);
          setSelectedPeriodId(active?.periodId || validConfigs[validConfigs.length - 1].periodId);
        }
      } catch {
        if (!cancelled) setError('Error al cargar datos.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [currentYear]);

  // ── Profesores únicos del horario ─────────────
  const professors = (() => {
    const map = new Map<string, string>();
    activities.forEach(a => { map.set(a.teacherId, a.teacherName); });
    return Array.from(map.entries())
      .map(([id, nombre]) => ({ id, nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  })();

  const filteredActivities = filterProf === 'all'
    ? activities
    : activities.filter(a => a.teacherId === filterProf);

  // ── Agrupar por salón y deduplicar clases ──────
  const salonGroups: SalonGroup[] = classrooms
    .map(room => {
      const seen = new Set<string>();
      const classes: UniqueClass[] = [];
      filteredActivities.forEach(a => {
        if (a.classroomId !== room.id) return;
        const key = `${a.teacherId}_${a.courseId}_${a.startTime}`;
        if (seen.has(key)) return;
        seen.add(key);
        classes.push({
          profesorId: a.teacherId,
          profesorNombre: a.teacherName,
          areaId: a.courseId,
          areaNombre: a.courseName,
          hora: a.startTime,
          dayOfWeek: a.dayOfWeek,
          key,
        });
      });
      return { room, classes };
    })
    .filter(g => g.classes.length > 0)
    .sort((a, b) => a.room.nombreSalon.localeCompare(b.room.nombreSalon));

  const totalClasses = salonGroups.reduce((sum, g) => sum + g.classes.length, 0);

  // ── Navegación ─────────────────────────────────

  function goToReport(salonId: string, profesorId: string, areaId: string, hora: string) {
    navigate(
      `/${PrivateRoutes.PRIVATE}/${PrivateRoutes.DASHBOARD}/${PrivateRoutes.ASISTENCIA}/report/${salonId}/${profesorId}/${areaId}/${encodeURIComponent(hora)}`
    );
  }

  function goToConsolidatedReport(salonId: string) {
    navigate(
      `/${PrivateRoutes.PRIVATE}/${PrivateRoutes.DASHBOARD}/${PrivateRoutes.ASISTENCIA}/consolidado/${salonId}`
    );
  }

  function goToPeriodReport(salonId: string) {
    if (!selectedPeriodId) return;
    navigate(
      `/${PrivateRoutes.PRIVATE}/${PrivateRoutes.DASHBOARD}/${PrivateRoutes.ASISTENCIA_PERIODO}/${salonId}/${selectedPeriodId}/${currentYear}`
    );
  }

  function goToPlanilla(cls: UniqueClass, salonId: string) {
    const refDate = mostRecentDayOccurrence(cls.dayOfWeek);
    navigate(
      `/${PrivateRoutes.PRIVATE}/${PrivateRoutes.DASHBOARD}/${PrivateRoutes.ASISTENCIA}/planilla/${salonId}/${cls.profesorId}/${cls.areaId}/${refDate}/${encodeURIComponent(cls.hora)}`
    );
  }

  // ══════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <SidebarV2 />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-500">
            <IconLoader size={22} className="animate-spin" />
            <span className="text-sm font-medium">Cargando datos…</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <SidebarV2 />

      <div className="flex-1 flex flex-col min-w-0">
        <HeaderV2
          title="Informes de Asistencia"
          isSidebarCollapsed={isSidebarCollapsed}
        />
        <div className="h-16 flex-shrink-0" />

        <main className="flex-1 p-4 lg:p-6 overflow-auto min-h-0">

          {/* Page Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-orchid-blue-60 rounded-lg">
                <IconFileAnalytics size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Informes de Asistencia</h1>
                <p className="text-xs text-gray-500">
                  {currentYear} · {salonGroups.length} salón{salonGroups.length !== 1 ? 'es' : ''} · {totalClasses} clase{totalClasses !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Selector de período para informe de período */}
              {periodConfigs.length > 0 && (
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                  <span className="text-xs text-gray-500 font-medium">Período:</span>
                  <div className="flex gap-1">
                    {periodConfigs.map(c => (
                      <button
                        key={c.periodId}
                        onClick={() => setSelectedPeriodId(c.periodId)}
                        className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${
                          selectedPeriodId === c.periodId
                            ? 'bg-orchid-blue-60 text-white'
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        P{c.periodId}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Filtro por profesor */}
              <select
                value={filterProf}
                onChange={e => setFilterProf(e.target.value)}
                className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orchid-blue-30 focus:border-orchid-blue-60 transition-all"
              >
                <option value="all">Todos los profesores</option>
                {professors.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <IconAlertCircle size={16} className="text-red-500 flex-shrink-0" /> {error}
            </div>
          )}

          {/* ── Sin datos ── */}
          {salonGroups.length === 0 && !error && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                <IconFileAnalytics size={28} className="text-gray-400" />
              </div>
              {filterProf === 'all' ? (
                <>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">No hay clases en el horario</h3>
                  <p className="text-sm text-gray-500">
                    Usa el Creador Rápido de Horario o el Editor de Horarios para agregar clases.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">No hay clases para este profesor</h3>
                  <p className="text-sm text-gray-500">Selecciona otro profesor o "Todos los profesores".</p>
                </>
              )}
            </div>
          )}

          {/* ── Lista de salones ── */}
          <div className="space-y-4">
            {salonGroups.map(group => (
              <div key={group.room.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">

                {/* Cabecera del salón */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orchid-blue-60 flex items-center justify-center flex-shrink-0">
                      <IconDoor size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{group.room.nombreSalon}</h3>
                      <p className="text-xs text-gray-500">
                        {group.classes.length} clase{group.classes.length !== 1 ? 's' : ''} programadas
                      </p>
                    </div>
                  </div>

                  {/* Acciones del salón */}
                  <div className="flex items-center gap-2">
                    {/* Informe de período */}
                    {selectedPeriodId && (
                      <button
                        onClick={() => goToPeriodReport(group.room.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-tosca-cc hover:bg-tosca-ds rounded-lg transition-all shadow-sm"
                        title={`Informe de fallas del Período ${selectedPeriodId}`}
                      >
                        <IconChartBar size={14} />
                        <span>Informe P{selectedPeriodId}</span>
                      </button>
                    )}
                    {/* Reporte consolidado mensual */}
                    <button
                      onClick={() => goToConsolidatedReport(group.room.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-orchid-blue-60 hover:bg-orchid-blue-70 rounded-lg transition-all shadow-sm"
                    >
                      <IconFileAnalytics size={14} />
                      <span>Consolidado</span>
                    </button>
                  </div>
                </div>

                {/* Clases del salón */}
                <div className="divide-y divide-gray-100">
                  {[...group.classes]
                    .sort((a, b) => a.hora.localeCompare(b.hora) || a.areaNombre.localeCompare(b.areaNombre))
                    .map(cls => (
                      <div key={cls.key} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-all">
                        {/* Icono */}
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orchid-blue-10 border border-orchid-blue-20 flex-shrink-0">
                          <IconBook size={16} className="text-orchid-blue-60" />
                        </div>

                        {/* Info de la clase */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900 truncate">{cls.areaNombre}</span>
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
                              {cls.hora}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{cls.profesorNombre}</p>
                        </div>

                        {/* Acciones de la clase */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {/* Ver planilla del período */}
                          <button
                            onClick={() => goToPlanilla(cls, group.room.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-tosca-cc bg-tosca-ds/10 hover:bg-tosca-ds/20 rounded-lg transition-all"
                            title="Ver planilla del período"
                          >
                            <IconClipboardList size={13} />
                            <span className="hidden sm:inline">Planilla</span>
                          </button>

                          {/* Ver informe mensual */}
                          <button
                            onClick={() => goToReport(group.room.id, cls.profesorId, cls.areaId, cls.hora)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-orchid-blue-60 bg-orchid-blue-10 hover:bg-orchid-blue-20 rounded-lg transition-all"
                            title="Ver informe mensual"
                          >
                            <IconFileAnalytics size={13} />
                            <span className="hidden sm:inline">Informe</span>
                            <IconChevronRight size={11} />
                          </button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
