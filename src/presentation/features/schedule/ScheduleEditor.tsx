/**
 * @fileoverview Editor de horarios semanal (solo Coordinador)
 * @module presentation/features/schedule/ScheduleEditor
 *
 * Permite al Coordinador construir el horario semanal asignando
 * profesores, salones y asignaturas a bloques de tiempo mediante drag & drop.
 * Se persiste automáticamente en Firestore (colección `horarios`).
 */

import { useState, useEffect, useRef } from 'react';
import { SidebarV2 } from '../../components/sidebarV2';
import { HeaderV2 } from '../../components/headerV2';
import { FlexibleSchedulePanel } from './components/FlexibleSchedulePanel';
import { FlexibleCalendar } from './FlexibleCalendar';
import { ActivityInfoModal } from './components/ActivityInfoModal';
import { fetchDocentes } from '../../../infrastructure/user.service';
import { fetchClassrooms } from '../../../infrastructure/classRoom.service';
import { getAreas } from '../../../infrastructure/user.service';
import type { FlexibleScheduleActivity } from '../../../domain/entities/schedule';
import { TIME_SLOTS, minutesToTime, detectActivityOverlap } from '../../../domain/entities/schedule';
import { fetchTimeBlockConfig } from '../../../infrastructure/timeBlock.service';
import type { TimeBlockConfiguration } from '../../../domain/entities/timeBlock';
import { blockToHoraString } from '../../../domain/entities/timeBlock';
import type { DocenteOption } from '../../../shared/types/classRoomTypes';
import type { ClassRoom } from '../../../domain/entities/classRoom';
import type { Area } from '../../../domain/entities/area';
import { useAppDispatch, useAppSelector } from '../../../app/store/store';
import {
  selectAllActivities,
  selectSaving,
  loadFlexibleSchedule,
  saveActivity,
  removeActivity,
} from '../../../app/store/states/flexibleSchedule.slice';
import {
  IconCalendar,
  IconCheck,
  IconAlertCircle,
  IconLoader,
  IconPrinter,
} from '@tabler/icons-react';

// ============================================
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
  const currentYear = String(new Date().getFullYear());

  // ── Redux ──────────────────────────────────────
  const dispatch = useAppDispatch();
  const activities = useAppSelector(selectAllActivities);
  const isSaving = useAppSelector(selectSaving);

  // ── Estado local ───────────────────────────────
  const [year, setYear]                       = useState(currentYear);
  const [professors, setProfessors]           = useState<DocenteOption[]>([]);
  const [classrooms, setClassrooms]           = useState<ClassRoom[]>([]);
  const [areas, setAreas]                     = useState<Area[]>([]);
  const [selectedProfId, setSelectedProfId]   = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId]   = useState<string | null>(null);
  const [filterView, setFilterView]           = useState<string>('all');
  const [isLoading, setIsLoading]             = useState(true);
  const [saveStatus, setSaveStatus]           = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [conflict, setConflict]               = useState<string | null>(null);
  const [_timeBlockConfig, setTimeBlockConfig] = useState<TimeBlockConfiguration | null>(null);
  const [_useCustomBlocks, setUseCustomBlocks] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<FlexibleScheduleActivity | null>(null);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | undefined>(undefined);

  const dragAreaRef   = useRef<Area | null>(null);

  // ── Carga de datos ─────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        // Cargar horario flexible desde Redux
        await dispatch(loadFlexibleSchedule(year)).unwrap();

        // Cargar otros datos en paralelo
        const [profs, rooms, areasData, blockConfig] = await Promise.all([
          fetchDocentes(),
          fetchClassrooms(),
          getAreas(),
          fetchTimeBlockConfig(year),
        ]);

        if (cancelled) return;

        setProfessors(profs);
        setClassrooms(rooms);
        setAreas(areasData);
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
  }, [year, dispatch]);

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

  // ── Sincronizar estado de guardado con Redux ───
  useEffect(() => {
    if (isSaving) {
      setSaveStatus('saving');
    } else if (saveStatus === 'saving') {
      // Solo cambiar a 'saved' si estábamos en 'saving'
      setSaveStatus('saved');
      // Auto-limpiar después de 2 segundos
      const timer = setTimeout(() => setSaveStatus('idle'), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSaving, saveStatus]);

  // ── Drag & Drop ────────────────────────────────
  function onDragStart(e: React.DragEvent<HTMLSpanElement>, area: Area) {
    console.log('🚀 Iniciando drag desde panel:', area.asignatura);
    dragAreaRef.current = area;
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', area.id);
    console.log('✅ dragAreaRef.current establecido:', !!dragAreaRef.current);
  }

  // R5: Handler para crear actividad desde drag & drop (con Redux)
  async function handleCreateActivity(dayOfWeek: number, startMinutes: number) {
    console.log('📝 handleCreateActivity llamado:', { dayOfWeek, startMinutes, hasArea: !!dragAreaRef.current, selectedProfId, selectedRoomId });

    const area = dragAreaRef.current;
    if (!area || !selectedProfId || !selectedRoomId) {
      let errorMsg = '⚠️ ';
      if (!area) errorMsg += 'Primero arrastra una asignatura desde el panel lateral. ';
      if (!selectedProfId) errorMsg += 'Selecciona un profesor. ';
      if (!selectedRoomId) errorMsg += 'Selecciona un salón.';

      console.warn('❌ Validación falló:', { area: !!area, selectedProfId, selectedRoomId });
      setConflict(errorMsg);
      setTimeout(() => setConflict(null), 5000);
      return;
    }

    console.log('✅ Validación pasada, creando actividad...');

    const startTime = minutesToTime(startMinutes);
    const durationMinutes = 50; // Duración por defecto

    // Validar conflictos usando el nuevo sistema flexible
    const conflictMsg = detectActivityOverlap(activities, {
      teacherId: selectedProfId,
      classroomId: selectedRoomId,
      dayOfWeek,
      startTime,
      durationMinutes,
    });

    if (conflictMsg) {
      setConflict(conflictMsg);
      setTimeout(() => setConflict(null), 3000);
      return;
    }

    const prof = professors.find((p) => p.id === selectedProfId);
    const room = classrooms.find((r) => r.id === selectedRoomId);

    // Crear nueva actividad flexible
    const newActivity: FlexibleScheduleActivity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      dayOfWeek,
      startTime,
      durationMinutes,
      endTime: minutesToTime(startMinutes + durationMinutes),
      courseId: area.id,
      courseName: area.asignatura,
      teacherId: selectedProfId,
      teacherName: prof?.displayName || prof?.email || '',
      classroomId: selectedRoomId,
      classroomName: room?.nombreSalon || '',
    };

    // Guardar con Redux
    try {
      await dispatch(saveActivity({ year, activity: newActivity })).unwrap();
      // Éxito - el estado se actualiza automáticamente via Redux
    } catch (error) {
      setSaveStatus('error');
      setConflict('Error al guardar la actividad.');
      setTimeout(() => setConflict(null), 3000);
    }

    // Limpiar selección visual
    dragAreaRef.current = null;
  }

  // R5: Handler para eliminar actividad (con Redux)
  async function handleRemoveActivity(activityId: string) {
    try {
      await dispatch(removeActivity({ year, activityId })).unwrap();
      // Éxito - el estado se actualiza automáticamente via Redux
    } catch (error) {
      setSaveStatus('error');
      setConflict('Error al eliminar la actividad.');
      setTimeout(() => setConflict(null), 3000);
    }
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
              <div className="flex items-center justify-center w-10 h-10 bg-orchid-blue-60 rounded-lg">
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

              {/* Imprimir */}
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 h-10 px-4 text-sm font-bold bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
              >
                <IconPrinter size={15} /> Imprimir
              </button>

              {/* Estado de guardado */}
              <div className="flex items-center gap-1 text-xs text-gray-400">
                {saveStatus === 'saving' && <><IconLoader size={14} className="animate-spin text-orchid-blue-500" /> <span>Guardando…</span></>}
                {saveStatus === 'saved'  && <><IconCheck size={14} className="text-tosca-500" /> <span className="text-tosca-600">Guardado</span></>}
                {saveStatus === 'error'  && <><IconAlertCircle size={14} className="text-red-500" /> <span className="text-red-500">Error</span></>}
              </div>
            </div>
          </div>

          {/* ── Alerta de conflicto ── */}
          {conflict && (
            <div className="print:hidden flex items-center gap-2 px-3.5 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex-shrink-0">
              <IconAlertCircle size={16} className="text-red-500 flex-shrink-0" />
              {conflict}
            </div>
          )}

          {/* ── Header de impresión ── */}
          <div className="hidden print:block flex-shrink-0 text-center pb-3 border-b border-gray-200 mb-2">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Institución Educativa</p>
            <h2 className="text-[18px] font-black text-gray-900 mt-0.5">Colina Campestre School</h2>
            <div className="mx-auto w-10 h-0.5 bg-orchid-blue-500 rounded-full mt-1.5 mb-1.5" />
            <p className="text-[12px] font-bold text-orchid-blue-700">Horario Semanal {year}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{filterViewLabel}</p>
          </div>

          {/* ── Layout: panel lateral + grid ── */}
          <div className="flex gap-4 flex-1 min-h-0">
            {/* Panel lateral (R2: Extraído a componente) */}
            <FlexibleSchedulePanel
              professors={professors as any}
              classrooms={classrooms}
              areas={areas}
              selectedProfId={selectedProfId}
              selectedRoomId={selectedRoomId}
              onSelectProf={setSelectedProfId}
              onSelectRoom={setSelectedRoomId}
              onDragStartArea={onDragStart}
            />

            {/* ── Grid del horario (R3: Reemplazado por FlexibleCalendar) ── */}
            <div className="flex-1 min-w-0 flex flex-col">
              {isLoading ? (
                <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <IconLoader size={32} className="animate-spin text-orchid-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">Cargando horario...</p>
                  </div>
                </div>
              ) : (
                <FlexibleCalendar
                  year={year}
                  filter={filterView}
                  onActivityClick={(activity, position) => {
                    setSelectedActivity(activity);
                    setClickPosition(position);
                  }}
                  onCreateActivity={handleCreateActivity}
                  onDelete={handleRemoveActivity}
                  readOnly={false}
                />
              )}
            </div>
          </div>

        </main>
      </div>

      {/* Modal de información de actividad */}
      {selectedActivity && (
        <ActivityInfoModal
          activity={selectedActivity}
          position={clickPosition}
          onClose={() => {
            setSelectedActivity(null);
            setClickPosition(undefined);
          }}
          onDelete={() => handleRemoveActivity(selectedActivity.id)}
        />
      )}
    </div>
  );
}
