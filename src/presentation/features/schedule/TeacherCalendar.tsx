/**
 * @fileoverview Calendario semanal del docente (Dashboard)
 * @module presentation/features/schedule/TeacherCalendar
 *
 * Muestra las clases de la semana actual del usuario autenticado.
 * Cada clase es clickeable y navega a la página de asistencia correspondiente.
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppSelector } from '../../../app/store/store';
import { fetchScheduleByProfessor } from '../../../infrastructure/schedule.service';
import type { ScheduleSlot } from '../../../domain/entities/schedule';
import { TIME_SLOTS } from '../../../domain/entities/schedule';
import { PrivateRoutes } from '../../../app/routes/routes';
import { IconCalendar, IconLoader, IconChevronRight } from '@tabler/icons-react';

// ============================================
// Colores deterministicos por asignatura
// ============================================

const BADGE_COLORS = [
  'bg-red-100 text-red-700 border-red-200 hover:bg-red-200',
  'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200',
  'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
  'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200',
  'bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-200',
  'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200',
  'bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-200',
  'bg-cyan-100 text-cyan-700 border-cyan-200 hover:bg-cyan-200',
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function getBadgeColor(name: string): string {
  return BADGE_COLORS[hashString(name) % BADGE_COLORS.length];
}

// ============================================
// Utilidades de fechas
// ============================================

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

interface WeekDay {
  date: Date;
  dia: number;   // 0 = lunes … 4 = viernes
  isoDate: string;
  isToday: boolean;
}

function getCurrentWeek(): WeekDay[] {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun … 6=Sat
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));

  const todayISO = toISO(today);
  const week: WeekDay[] = [];

  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    week.push({ date: d, dia: i, isoDate: toISO(d), isToday: toISO(d) === todayISO });
  }
  return week;
}

function formatDayHeader(d: Date): string {
  return d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' });
}

// ============================================
// Componente
// ============================================

export default function TeacherCalendar() {
  const user      = useAppSelector((state) => state.user);
  const navigate  = useNavigate();
  const [slots, setSlots]       = useState<ScheduleSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const week = getCurrentWeek();

  // ── Cargar horario del usuario ─────────────────
  useEffect(() => {
    if (!user?.uid) { setIsLoading(false); return; }

    setIsLoading(true);
    fetchScheduleByProfessor(String(new Date().getFullYear()), user.uid)
      .then((data) => setSlots(data))
      .catch(() => setSlots([]))
      .finally(() => setIsLoading(false));
  }, [user?.uid]);

  // ── Filas activas (solo slots que tienen clase esta semana) ──
  const activeTimeSlots = TIME_SLOTS.filter((hora) =>
    week.some((day) => slots.some((s) => s.dia === day.dia && s.hora === hora))
  );

  // ── Navegar a asistencia ───────────────────────
  function goToAttendance(slot: ScheduleSlot, isoDate: string) {
    navigate(
      `/${PrivateRoutes.PRIVATE}/${PrivateRoutes.DASHBOARD}/${PrivateRoutes.ASISTENCIA}/${slot.salonId}/${slot.profesorId}/${slot.areaId}/${isoDate}/${encodeURIComponent(slot.hora)}`
    );
  }

  // ══════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════

  // Estado de carga
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-center gap-2 text-gray-400">
        <IconLoader size={18} className="animate-spin" />
        <span className="text-xs">Cargando horario…</span>
      </div>
    );
  }

  // Sin clases asignadas
  if (slots.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
            <IconCalendar size={16} className="text-white" />
          </div>
          <h3 className="text-sm font-semibold text-gray-700">Mi Horario</h3>
        </div>
        <p className="text-xs text-gray-400 text-center py-4">
          No tienes clases asignadas esta semana.
          {user?.role === 'Coordinador' && (
            <Link to={`/${PrivateRoutes.PRIVATE}/${PrivateRoutes.DASHBOARD}/${PrivateRoutes.HORARIO}`} className="ml-1 text-indigo-500 font-semibold hover:underline">
              Ir al editor →
            </Link>
          )}
        </p>
      </div>
    );
  }

  // Rango textual de la semana
  const weekLabel = `${week[0].date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} – ${week[4].date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
            <IconCalendar size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700">Mi Horario</h3>
            <p className="text-[10px] text-gray-400">{weekLabel}</p>
          </div>
        </div>
        <span className="text-[10px] text-gray-400">Click en una clase para registrar asistencia</span>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[11px]" style={{ minWidth: '520px' }}>
          <thead>
            <tr className="bg-gray-50">
              <th className="w-14 px-2 py-2 text-center font-bold text-gray-400 border-b border-gray-100 border-r border-gray-100 text-[10px]">
                Hora
              </th>
              {week.map((day) => (
                <th
                  key={day.dia}
                  className={`px-2 py-2 text-center font-bold border-b border-gray-100 text-[11px] transition-colors ${
                    day.isToday
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-500'
                  }`}
                >
                  <div>{formatDayHeader(day.date)}</div>
                  {day.isToday && <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded-full bg-indigo-500 text-white text-[9px] font-bold">Hoy</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeTimeSlots.map((hora) => (
              <tr key={hora}>
                <td className="px-1.5 py-1.5 text-center font-bold text-gray-400 bg-gray-50 border-r border-gray-100 border-b border-gray-50 text-[10px]">
                  {hora}
                </td>
                {week.map((day) => {
                  const slot = slots.find((s) => s.dia === day.dia && s.hora === hora) || null;
                  return (
                    <td
                      key={day.dia}
                      className={`border border-gray-100 p-1 ${day.isToday ? 'bg-indigo-50/40' : 'bg-white'}`}
                      style={{ minHeight: '42px', verticalAlign: 'middle' }}
                    >
                      {slot ? (
                        <button
                          onClick={() => goToAttendance(slot, day.isoDate)}
                          className={`w-full text-left px-2 py-1.5 rounded-lg border cursor-pointer transition-all shadow-sm hover:shadow-md active:scale-95 ${getBadgeColor(slot.areaNombre)}`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold truncate text-[10px]">{slot.areaNombre}</span>
                            <IconChevronRight size={10} className="flex-shrink-0 opacity-50" />
                          </div>
                          <div className="text-[9px] opacity-60 truncate mt-0.5">{slot.salonNombre}</div>
                        </button>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
