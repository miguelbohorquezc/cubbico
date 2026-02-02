/**
 * @fileoverview Editor de horarios semanal (solo Coordinador)
 * @module presentation/features/schedule/ScheduleEditor
 *
 * Permite al Coordinador construir el horario semanal asignando
 * profesores, salones y asignaturas a bloques de tiempo mediante drag & drop.
 * Se persiste automáticamente en Firestore (colección `horarios`).
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarV2 } from '../../components/sidebarV2';
import { HeaderV2 } from '../../components/headerV2';
import { fetchDocentes } from '../../../infrastructure/user.service';
import { fetchClassrooms } from '../../../infrastructure/classRoom.service';
import { getAreas } from '../../../infrastructure/user.service';
import { fetchSchedule, saveSchedule, extractUniqueTimeSlots } from '../../../infrastructure/schedule.service';
import type { ScheduleSlot } from '../../../domain/entities/schedule';
import { detectSlotConflict, TIME_SLOTS, DAYS_OF_WEEK } from '../../../domain/entities/schedule';
import { fetchTimeBlockConfig } from '../../../infrastructure/timeBlock.service';
import type { TimeBlockConfiguration } from '../../../domain/entities/timeBlock';
import { blockToHoraString, getBlockEndTime } from '../../../domain/entities/timeBlock';
import type { DocenteOption } from '../../../shared/types/classRoomTypes';
import type { ClassRoom } from '../../../domain/entities/classRoom';
import type { Area } from '../../../domain/entities/area';
import { PrivateRoutes } from '../../../app/routes/routes';
import {
  IconCalendar,
  IconDeviceFloppy,
  IconCheck,
  IconAlertCircle,
  IconUsers,
  IconBook,
  IconX,
  IconLoader,
  IconPrinter,
  IconFileAnalytics,
  IconClock,
} from '@tabler/icons-react';

// ============================================
// Colores deterministicos por asignatura
// ============================================

const BADGE_COLORS = [
  'bg-red-100 text-red-700 border-red-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-pink-100 text-pink-700 border-pink-200',
  'bg-orange-100 text-orange-700 border-orange-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-teal-100 text-teal-700 border-teal-200',
  'bg-cyan-100 text-cyan-700 border-cyan-200',
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
// Hook: sincronizar estado del sidebar
// ============================================

const SIDEBAR_KEY = 'cubbico-sidebar-collapsed';

function useSidebarCollapsed(): boolean {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_KEY) === 'true'; }
    catch { return false; }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      try { setCollapsed(localStorage.getItem(SIDEBAR_KEY) === 'true'); }
      catch { /* noop */ }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return collapsed;
}

// ============================================
// Componente principal
// ============================================

export default function ScheduleEditor() {
  const isSidebarCollapsed = useSidebarCollapsed();
  const navigate = useNavigate();
  const currentYear = String(new Date().getFullYear());

  // ── Estado ─────────────────────────────────────
  const [year, setYear]                       = useState(currentYear);
  const [slots, setSlots]                     = useState<ScheduleSlot[]>([]);
  const [professors, setProfessors]           = useState<DocenteOption[]>([]);
  const [classrooms, setClassrooms]           = useState<ClassRoom[]>([]);
  const [areas, setAreas]                     = useState<Area[]>([]);
  const [selectedProfId, setSelectedProfId]   = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId]   = useState<string | null>(null);
  const [filterView, setFilterView]           = useState<string>('all');
  const [isLoading, setIsLoading]             = useState(true);
  const [saveStatus, setSaveStatus]           = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [conflict, setConflict]               = useState<string | null>(null);
  const [timeBlockConfig, setTimeBlockConfig] = useState<TimeBlockConfiguration | null>(null);
  const [useCustomBlocks, setUseCustomBlocks] = useState(false);

  const dragAreaRef   = useRef<Area | null>(null);
  const saveTimeout   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Carga de datos ─────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const [profs, rooms, areasData, schedule, blockConfig] = await Promise.all([
          fetchDocentes(),
          fetchClassrooms(),
          getAreas(),
          fetchSchedule(year),
          fetchTimeBlockConfig(year),
        ]);
        if (cancelled) return;
        setProfessors(profs);
        setClassrooms(rooms);
        setAreas(areasData);
        setSlots(schedule.slots);
        setTimeBlockConfig(blockConfig);
        // Detectar si hay bloques personalizados (si difieren de TIME_SLOTS)
        const hasCustom = blockConfig.blocks.length > 0 &&
          blockConfig.blocks.some(b => !TIME_SLOTS.includes(blockToHoraString(b)));
        setUseCustomBlocks(hasCustom);
      } catch {
        if (!cancelled) setConflict('Error al cargar datos.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [year]);

  // ── Estilos de impresión ───────────────────────
  useEffect(() => {
    const isFiltered = filterView !== 'all';
    const size = isFiltered ? 'letter' : 'legal';
    const style = document.createElement('style');
    style.id = 'schedule-print-style';
    style.textContent = '@media print { @page { size: ' + size + ' portrait; margin: 0.6in 0.7in; } body { background: white !important; } }';
    document.head.appendChild(style);
    return () => { const el = document.getElementById('schedule-print-style'); if (el) el.remove(); };
  }, [filterView]);

  // ── Auto-save con debounce ─────────────────────
  function triggerSave(newSlots: ScheduleSlot[]) {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    setSaveStatus('saving');
    saveTimeout.current = setTimeout(async () => {
      try {
        await saveSchedule(year, newSlots);
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
    }, 900);
  }

  // ── Drag & Drop ────────────────────────────────
  function onDragStart(e: React.DragEvent<HTMLSpanElement>, area: Area) {
    dragAreaRef.current = area;
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', area.id);
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>, dia: number, hora: string) {
    e.preventDefault();
    const area = dragAreaRef.current;
    if (!area || !selectedProfId || !selectedRoomId) return;

    const msg = detectSlotConflict(slots, {
      profesorId: selectedProfId,
      salonId: selectedRoomId,
      dia,
      hora,
    });
    if (msg) {
      setConflict(msg);
      setTimeout(() => setConflict(null), 3000);
      return;
    }

    const prof = professors.find((p) => p.id === selectedProfId);
    const room = classrooms.find((r) => r.id === selectedRoomId);

    const newSlot: ScheduleSlot = {
      profesorId: selectedProfId,
      profesorNombre: prof?.displayName || prof?.email || '',
      salonId: selectedRoomId,
      salonNombre: room?.nombreSalon || '',
      areaId: area.id,
      areaNombre: area.asignatura,
      dia,
      hora,
    };

    const updated = [...slots, newSlot];
    setSlots(updated);
    triggerSave(updated);
  }

  function removeSlot(index: number) {
    const updated = slots.filter((_, i) => i !== index);
    setSlots(updated);
    triggerSave(updated);
  }

  // ── Cálculos de celda ──────────────────────────
  function cellIsAvailable(dia: number, hora: string): boolean {
    if (!selectedProfId || !selectedRoomId) return false;
    return detectSlotConflict(slots, { profesorId: selectedProfId, salonId: selectedRoomId, dia, hora }) === null;
  }

  function cellHasProf(dia: number, hora: string): boolean {
    if (!selectedProfId) return false;
    return slots.some((s) => s.profesorId === selectedProfId && s.dia === dia && s.hora === hora);
  }

  function getSlotsForCell(dia: number, hora: string): { slot: ScheduleSlot; globalIndex: number }[] {
    const out: { slot: ScheduleSlot; globalIndex: number }[] = [];
    slots.forEach((s, i) => { if (s.dia === dia && s.hora === hora) out.push({ slot: s, globalIndex: i }); });
    return out;
  }

  // ── Filtro de vista ────────────────────────────
  function isDimmed(slot: ScheduleSlot): boolean {
    if (filterView === 'all') return false;
    if (filterView.startsWith('prof:')) return slot.profesorId !== filterView.slice(5);
    if (filterView.startsWith('room:')) return slot.salonId !== filterView.slice(5);
    return false;
  }

  // ── Etiqueta de vista para impresión ───────────
  const filterViewLabel = (() => {
    if (filterView === 'all') return 'Vista General — todos los profesores';
    if (filterView.startsWith('prof:')) {
      const prof = professors.find((p) => p.id === filterView.slice(5));
      return prof ? `Profesor: ${prof.displayName || prof.email}` : 'Profesor';
    }
    if (filterView.startsWith('room:')) {
      const room = classrooms.find((r) => r.id === filterView.slice(5));
      return room ? `Salón: ${room.nombreSalon}` : 'Salón';
    }
    return '';
  })();

  // ── Bloques horarios activos ───────────────────
  // Si hay bloques personalizados, usar esos. Si no, usar TIME_SLOTS legacy.
  // IMPORTANTE: Incluir tanto bloques configurados COMO horas con asignaciones existentes
  // para no ocultar clases ya asignadas
  const activeTimeSlots = (() => {
    const uniqueHoras = new Set<string>();

    if (useCustomBlocks && timeBlockConfig) {
      // Agregar horas de bloques personalizados
      timeBlockConfig.blocks.forEach(block => {
        uniqueHoras.add(blockToHoraString(block));
      });
    } else {
      // Agregar TIME_SLOTS legacy
      TIME_SLOTS.forEach(hora => uniqueHoras.add(hora));
    }

    // SIEMPRE agregar horas de slots existentes para no ocultar asignaciones
    slots.forEach(slot => uniqueHoras.add(slot.hora));

    // Ordenar por hora
    return Array.from(uniqueHoras).sort((a, b) => {
      const [hA, mA] = a.split(':').map(Number);
      const [hB, mB] = b.split(':').map(Number);
      return (hA * 60 + mA) - (hB * 60 + mB);
    });
  })();

  // ══════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <SidebarV2 />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-500">
            <IconLoader size={24} className="animate-spin" />
            <span className="text-sm font-medium">Cargando horario...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="print:hidden"><SidebarV2 /></div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="print:hidden"><HeaderV2 title="Editor de Horarios" isSidebarCollapsed={isSidebarCollapsed} /></div>
        <div className="print:hidden h-16 flex-shrink-0" />

        <main className="flex-1 flex flex-col overflow-hidden min-h-0 p-4 lg:p-5 gap-3">
          {/* ── Top bar ── */}
          <div className="print:hidden flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-200">
                <IconCalendar size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Editor de Horarios</h1>
                <p className="text-xs text-gray-500">Selecciona profesor + salón, luego arrastra una asignatura al horario</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Año */}
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="h-10 px-3 text-sm font-medium bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-300"
              >
                {[currentYear, String(Number(currentYear) - 1), String(Number(currentYear) + 1)].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              {/* Filtro de vista */}
              <select
                value={filterView}
                onChange={(e) => setFilterView(e.target.value)}
                className="h-10 px-3 text-sm font-medium bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="all">Vista general</option>
                {professors.map((p) => (
                  <option key={`p:${p.id}`} value={`prof:${p.id}`}>Profesor: {p.displayName || p.email}</option>
                ))}
                {classrooms.map((r) => (
                  <option key={`r:${r.id}`} value={`room:${r.id}`}>Salón: {r.nombreSalon}</option>
                ))}
              </select>

              {/* Configurar bloques */}
              <button
                onClick={() => navigate(`/private/dashboard/${PrivateRoutes.TIMEBLOCKS}`)}
                className="inline-flex items-center gap-1.5 h-10 px-4 text-sm font-medium bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
              >
                <IconClock size={16} />
                <span>Configurar Bloques</span>
              </button>

              {/* Guardar */}
              <button
                onClick={() => triggerSave(slots)}
                className="inline-flex items-center gap-1.5 h-10 px-4 text-sm font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md shadow-indigo-200"
              >
                <IconDeviceFloppy size={15} /> Guardar
              </button>

              {/* Imprimir */}
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 h-10 px-4 text-sm font-bold bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
              >
                <IconPrinter size={15} /> Imprimir
              </button>

              {/* Estado de guardado */}
              <div className="flex items-center gap-1 text-xs text-gray-400">
                {saveStatus === 'saving' && <><IconLoader size={14} className="animate-spin text-indigo-500" /> <span>Guardando…</span></>}
                {saveStatus === 'saved'  && <><IconCheck size={14} className="text-emerald-500" /> <span className="text-emerald-600">Guardado</span></>}
                {saveStatus === 'error'  && <><IconAlertCircle size={14} className="text-red-500" /> <span className="text-red-500">Error</span></>}
              </div>
            </div>
          </div>

          {/* ── Alerta de conflicto ── */}
          {conflict && (
            <div className="print:hidden flex items-center gap-2 px-3.5 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex-shrink-0">
              <IconAlertCircle size={16} className="text-red-500 flex-shrink-0" />
              {conflict}
            </div>
          )}

          {/* ── Header de impresión ── */}
          <div className="hidden print:block flex-shrink-0 text-center pb-3 border-b border-gray-200 mb-2">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Institución Educativa</p>
            <h2 className="text-[18px] font-black text-gray-900 mt-0.5">Colina Campestre School</h2>
            <div className="mx-auto w-10 h-0.5 bg-indigo-500 rounded-full mt-1.5 mb-1.5" />
            <p className="text-[12px] font-bold text-indigo-700">Horario Semanal {year}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{filterViewLabel}</p>
          </div>

          {/* ── Layout: panel lateral + grid ── */}
          <div className="flex gap-4 flex-1 min-h-0">
            {/* Panel lateral (oculto en impresión) */}
            <div className="print:hidden w-56 flex-shrink-0 overflow-y-auto space-y-3 pr-1">
              {/* Profesores */}
              <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                <div className="flex items-center gap-1.5 mb-2">
                  <IconUsers size={13} className="text-gray-400" />
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Profesores</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {professors.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProfId(selectedProfId === p.id ? null : p.id)}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all ${
                        selectedProfId === p.id
                          ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm shadow-indigo-200'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      {p.displayName || p.email}
                    </button>
                  ))}
                </div>
              </div>

              {/* Salones */}
              <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[13px]">🏫</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Salones</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {classrooms.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRoomId(selectedRoomId === r.id ? null : r.id)}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all ${
                        selectedRoomId === r.id
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-200'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      {r.nombreSalon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Asignaturas (drag sources) */}
              <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                <div className="flex items-center gap-1.5 mb-1">
                  <IconBook size={13} className="text-gray-400" />
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Asignaturas</span>
                </div>
                <p className="text-[9px] text-gray-400 mb-2">Arrastra al horario</p>
                <div className="flex flex-wrap gap-1.5">
                  {areas.map((a) => (
                    <span
                      key={a.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, a)}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border cursor-grab active:cursor-grabbing select-none hover:shadow-sm transition-shadow ${getBadgeColor(a.asignatura)}`}
                    >
                      {a.asignatura}
                    </span>
                  ))}
                </div>

                {/* Hint si no hay selección */}
                {(!selectedProfId || !selectedRoomId) && (
                  <p className="mt-2 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
                    {!selectedProfId && !selectedRoomId
                      ? 'Selecciona un profesor y un salón'
                      : !selectedProfId
                        ? 'Selecciona un profesor'
                        : 'Selecciona un salón'}
                  </p>
                )}
              </div>

              {/* Leyenda */}
              <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Leyenda</span>
                <div className="mt-1.5 space-y-1 text-[10px] text-gray-500">
                  <div className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-emerald-50 border border-emerald-200" /> Celda disponible</div>
                  <div className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-indigo-50 border border-indigo-200" /> Clase del profesor seleccionado</div>
                  <div className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-white border border-gray-200" /> Celda con conflicto</div>
                </div>
              </div>
            </div>

            {/* ── Grid del horario ── */}
            <div className="flex-1 min-w-0 overflow-auto">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden print:shadow-none" style={{ minWidth: '560px' }}>
                <table className="w-full border-collapse text-[11px]" style={{ tableLayout: 'fixed' }}>
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="w-14 p-2 text-center font-bold text-gray-500 border-b border-gray-200 border-r border-gray-200 text-[10px]">Hora</th>
                      {DAYS_OF_WEEK.map((day) => (
                        <th key={day} className="p-2 text-center font-bold text-gray-600 border-b border-gray-200 text-[11px]">{day}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeTimeSlots.map((hora) => {
                      return (
                      <tr key={hora}>
                        <td className="p-1 text-center font-bold text-gray-500 bg-gray-50 border-r border-gray-200 border-b border-gray-100 text-[10px]">
                          <div>{hora}</div>
                        </td>
                        {DAYS_OF_WEEK.map((_, dia) => {
                          const cellSlots  = getSlotsForCell(dia, hora);
                          const available  = cellIsAvailable(dia, hora);
                          const hasProf    = cellHasProf(dia, hora);

                          let cellBg = 'bg-white';
                          if (selectedProfId && selectedRoomId && available) cellBg = 'bg-emerald-50';
                          if (hasProf) cellBg = 'bg-indigo-50';

                          return (
                            <td
                              key={dia}
                              onDragOver={onDragOver}
                              onDrop={(e) => onDrop(e, dia, hora)}
                              className={`border border-gray-100 p-0.5 transition-colors ${cellBg}`}
                              style={{ minHeight: '72px', verticalAlign: 'top' }}
                            >
                              <div className="flex flex-col gap-0.5 min-h-[68px]">
                                {cellSlots.map(({ slot, globalIndex }) => (
                                  <div
                                    key={globalIndex}
                                    className={`group relative px-1.5 py-0.5 rounded border font-semibold leading-snug transition-opacity ${getBadgeColor(slot.areaNombre)} ${isDimmed(slot) ? 'opacity[0.08]' : 'opacity-100'}`}
                                    style={isDimmed(slot) ? { opacity: 0.08 } : {}}
                                  >
                                    <div className="flex items-start justify-between gap-0.5">
                                      <div className="min-w-0">
                                        <div className="text-[10px] font-bold truncate">{slot.areaNombre}</div>
                                        <div className="text-[10px] opacity-75 truncate">{slot.profesorNombre}</div>
                                        <div className="text-[10px] opacity-75 truncate">{slot.salonNombre}</div>
                                      </div>
                                      <div className="print:hidden flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                        <button
                                          onClick={() => navigate(`/${PrivateRoutes.PRIVATE}/${PrivateRoutes.DASHBOARD}/${PrivateRoutes.ASISTENCIA}/report/${slot.salonId}/${slot.profesorId}/${slot.areaId}/${encodeURIComponent(slot.hora)}`)}
                                          className="p-0.5 rounded hover:bg-indigo-100 text-indigo-400 hover:text-indigo-600"
                                          title="Informe de asistencia"
                                        >
                                          <IconFileAnalytics size={10} />
                                        </button>
                                        <button
                                          onClick={() => removeSlot(globalIndex)}
                                          className="p-0.5 rounded hover:bg-red-100 text-red-400 hover:text-red-600"
                                        >
                                          <IconX size={10} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
