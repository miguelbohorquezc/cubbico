/**
 * @fileoverview Vista panorámica de informes de asistencia por salón (solo Coordinador)
 * @module presentation/features/attendance/AttendanceOverview
 *
 * Lista todos los salones y sus clases según el horario actual.
 * Cada clase es un enlace directo al informe mensual de asistencia.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarV2 } from '../../components/sidebarV2';
import { HeaderV2 } from '../../components/headerV2';
import { fetchClassrooms } from '../../../infrastructure/classRoom.service';
import { fetchSchedule } from '../../../infrastructure/schedule.service';
import type { ClassRoom } from '../../../domain/entities/classRoom';
import type { ScheduleSlot } from '../../../domain/entities/schedule';
import { PrivateRoutes } from '../../../app/routes/routes';
import {
  IconLoader,
  IconAlertCircle,
  IconFileAnalytics,
  IconChevronRight,
  IconBook,
  IconDoor,
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
// Tipos internos
// ============================================

interface UniqueClass {
  profesorId: string;
  profesorNombre: string;
  areaId: string;
  areaNombre: string;
  hora: string;
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
  const navigate    = useNavigate();
  const isSidebarCollapsed = useSidebarCollapsed();
  const currentYear = String(new Date().getFullYear());

  const [classrooms, setClassrooms] = useState<ClassRoom[]>([]);
  const [slots, setSlots]           = useState<ScheduleSlot[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [filterProf, setFilterProf] = useState<string>('all');

  // ── Cargar datos ───────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [rooms, schedule] = await Promise.all([
          fetchClassrooms(),
          fetchSchedule(currentYear),
        ]);
        if (cancelled) return;
        setClassrooms(rooms);
        setSlots(schedule.slots);
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
    slots.forEach((s) => { map.set(s.profesorId, s.profesorNombre); });
    return Array.from(map.entries())
      .map(([id, nombre]) => ({ id, nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  })();

  const filteredSlots = filterProf === 'all' ? slots : slots.filter((s) => s.profesorId === filterProf);

  // ── Agrupar por salón y deduplicar clases ──────
  const salonGroups: SalonGroup[] = classrooms
    .map((room) => {
      const seen = new Set<string>();
      const classes: UniqueClass[] = [];
      filteredSlots.forEach((s) => {
        if (s.salonId !== room.id) return;
        const key = `${s.profesorId}_${s.areaId}_${s.hora}`;
        if (seen.has(key)) return;
        seen.add(key);
        classes.push({
          profesorId: s.profesorId,
          profesorNombre: s.profesorNombre,
          areaId: s.areaId,
          areaNombre: s.areaNombre,
          hora: s.hora,
          key,
        });
      });
      return { room, classes };
    })
    .filter((g) => g.classes.length > 0)
    .sort((a, b) => a.room.nombreSalon.localeCompare(b.room.nombreSalon));

  // ── Navegación al informe ──────────────────────
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

  const totalClasses = salonGroups.reduce((sum, g) => sum + g.classes.length, 0);

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
      {/* Sidebar */}
      <SidebarV2 />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <HeaderV2
          title="Informes de Asistencia"
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Spacer para el header fixed */}
        <div className="h-16 flex-shrink-0" />

        {/* Body */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto min-h-0">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-orchid-blue-60 rounded-lg">
                <IconFileAnalytics size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Informes de Asistencia
                </h1>
                <p className="text-xs text-gray-500">
                  Selecciona una clase para ver su informe mensual o el reporte consolidado del salón · {currentYear}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={filterProf}
                onChange={(e) => setFilterProf(e.target.value)}
                className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orchid-blue-30 focus:border-orchid-blue-60 transition-all"
              >
                <option value="all">Todos los profesores</option>
                {professors.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
              <span className="text-xs text-gray-500">
                {salonGroups.length} salón{salonGroups.length !== 1 ? 'es' : ''} · {totalClasses} clase{totalClasses !== 1 ? 's' : ''}
              </span>
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
                  <p className="text-sm text-gray-500">Revisa que el horario esté configurado en el Editor de Horarios.</p>
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
            {salonGroups.map((group) => (
              <div key={group.room.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                {/* Cabecera del salón */}
                <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orchid-blue-60 flex items-center justify-center">
                      <IconDoor size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{group.room.nombreSalon}</h3>
                      <p className="text-xs text-gray-500">{group.classes.length} clase{group.classes.length !== 1 ? 's' : ''} programadas</p>
                    </div>
                  </div>
                  <button
                    onClick={() => goToConsolidatedReport(group.room.id)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-orchid-blue-60 hover:bg-orchid-blue-70 rounded-lg transition-all shadow-sm hover:shadow flex items-center gap-2"
                  >
                    <IconFileAnalytics size={16} />
                    <span>Reporte Consolidado</span>
                  </button>
                </div>

                {/* Clases del salón */}
                <div className="divide-y divide-gray-100">
                  {group.classes
                    .sort((a, b) => a.hora.localeCompare(b.hora) || a.areaNombre.localeCompare(b.areaNombre))
                    .map((cls) => (
                    <button
                      key={cls.key}
                      onClick={() => goToReport(group.room.id, cls.profesorId, cls.areaId, cls.hora)}
                      className="w-full flex items-center justify-between px-5 py-3 hover:bg-orchid-blue-10 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orchid-blue-10 border border-orchid-blue-20">
                          <IconBook size={16} className="text-orchid-blue-60" />
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">{cls.areaNombre}</span>
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Hora {cls.hora}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{cls.profesorNombre}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-medium text-orchid-blue-60">Ver informe</span>
                        <IconChevronRight size={16} className="text-orchid-blue-60" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
