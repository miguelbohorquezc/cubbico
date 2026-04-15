/**
 * @fileoverview Creador rápido de horario (solo Coordinador)
 * @module presentation/features/schedule/QuickScheduleCreator
 *
 * Flujo simplificado:
 * 1. Seleccionar docente → se cargan sus salones y áreas asignados
 * 2. Seleccionar salón + área
 * 3. Elegir día, hora de inicio, duración
 * 4. Guardar → FlexibleScheduleActivity en Firestore
 *
 * No reemplaza al ScheduleEditor (drag & drop), lo complementa con
 * un formulario rápido para asignaciones masivas.
 */

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebase';
import { fetchDocentes } from '../../../infrastructure/user.service';
import { fetchClassrooms } from '../../../infrastructure/classRoom.service';
import { getAreas } from '../../../infrastructure/user.service';
import { useAppDispatch, useAppSelector } from '../../../app/store/store';
import {
  saveActivity,
  removeActivity,
  loadFlexibleSchedule,
  selectAllActivities,
  selectSaving,
} from '../../../app/store/states/flexibleSchedule.slice';
import {
  DAYS_OF_WEEK,
  TIME_SLOTS,
  calculateEndTime,
  detectActivityOverlap,
  timeToMinutes,
} from '../../../domain/entities/schedule';
import type { FlexibleScheduleActivity } from '../../../domain/entities/schedule';
import type { ClassRoom } from '../../../domain/entities/classRoom';
import type { Area } from '../../../domain/entities/area';
import type { DocenteOption } from '../../../shared/types/classRoomTypes';
import {
  IconUserCheck,
  IconDoor,
  IconBook,
  IconCalendar,
  IconClock,
  IconCheck,
  IconAlertCircle,
  IconLoader,
  IconPlus,
  IconTrash,
  IconChevronDown,
} from '@tabler/icons-react';

// ============================================
// Constantes
// ============================================

const DURATIONS: { label: string; value: number }[] = [
  { label: '45 min', value: 45 },
  { label: '1 hora', value: 60 },
  { label: '1:30 hs', value: 90 },
  { label: '2 horas', value: 120 },
];

// ============================================
// Tipos
// ============================================

interface TeacherAssignments {
  salones: Record<string, boolean>;
  areas: Record<string, boolean>;
  displayName: string;
}

// ============================================
// Componente
// ============================================

export default function QuickScheduleCreator() {
  const dispatch = useAppDispatch();
  const activities = useAppSelector(selectAllActivities);
  const isSaving = useAppSelector(selectSaving);

  const currentYear = String(new Date().getFullYear());

  // ── Datos maestros ──────────────────────────────────
  const [docentes, setDocentes] = useState<DocenteOption[]>([]);
  const [allClassrooms, setAllClassrooms] = useState<ClassRoom[]>([]);
  const [allAreas, setAllAreas] = useState<Area[]>([]);
  const [loadingMaster, setLoadingMaster] = useState(true);

  // ── Selección de docente ────────────────────────────
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignments | null>(null);
  const [loadingTeacher, setLoadingTeacher] = useState(false);

  // ── Formulario ──────────────────────────────────────
  const [classroomId, setClassroomId] = useState('');
  const [areaId, setAreaId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<number>(0);
  const [startTime, setStartTime] = useState('07:30');
  const [duration, setDuration] = useState(60);

  // ── Estado de envio ─────────────────────────────────
  const [conflict, setConflict] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ── Carga datos maestros ────────────────────────────
  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchDocentes(), fetchClassrooms(), getAreas()])
      .then(([docs, rooms, areas]) => {
        if (cancelled) return;
        setDocentes(docs);
        setAllClassrooms(rooms);
        setAllAreas(areas);
      })
      .finally(() => { if (!cancelled) setLoadingMaster(false); });
    return () => { cancelled = true; };
  }, []);

  // ── Cargar horario en Redux ─────────────────────────
  useEffect(() => {
    dispatch(loadFlexibleSchedule(currentYear));
  }, [dispatch, currentYear]);

  // ── Al cambiar de docente, cargar sus asignaciones ──
  useEffect(() => {
    if (!selectedTeacherId) {
      setTeacherAssignments(null);
      setClassroomId('');
      setAreaId('');
      return;
    }

    let cancelled = false;
    setLoadingTeacher(true);

    getDoc(doc(db, 'users', selectedTeacherId))
      .then(snap => {
        if (cancelled || !snap.exists()) return;
        const data = snap.data();
        setTeacherAssignments({
          salones: (data.salones as Record<string, boolean>) || {},
          areas: (data.areas as Record<string, boolean>) || {},
          displayName: data.displayName || data.email || selectedTeacherId,
        });
        setClassroomId('');
        setAreaId('');
      })
      .finally(() => { if (!cancelled) setLoadingTeacher(false); });

    return () => { cancelled = true; };
  }, [selectedTeacherId]);

  // ── Salones y áreas filtrados por asignaciones ──────
  const teacherClassrooms: ClassRoom[] = teacherAssignments
    ? allClassrooms.filter(c => teacherAssignments.salones[c.id] === true)
    : [];

  const teacherAreas: Area[] = teacherAssignments
    ? allAreas.filter(a => teacherAssignments.areas[a.id] === true)
    : [];

  // ── Actividades del docente seleccionado ────────────
  const teacherActivities: FlexibleScheduleActivity[] = selectedTeacherId
    ? activities.filter(a => a.teacherId === selectedTeacherId)
    : [];

  // ── Hora calculada de fin ────────────────────────────
  const endTime = calculateEndTime(startTime, duration);

  // ── Validar y guardar ───────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setConflict(null);
    setSuccessMsg(null);

    if (!selectedTeacherId || !classroomId || !areaId) {
      setConflict('Completa todos los campos.');
      return;
    }

    // Validar que la hora no supere las 16:00
    const endMinutes = timeToMinutes(endTime);
    if (endMinutes > timeToMinutes('16:00')) {
      setConflict('La clase termina después de las 16:00. Reduce la duración o cambia la hora.');
      return;
    }

    // Detectar conflictos
    const conflictMsg = detectActivityOverlap(activities, {
      teacherId: selectedTeacherId,
      classroomId,
      dayOfWeek,
      startTime,
      durationMinutes: duration,
    });
    if (conflictMsg) {
      setConflict(conflictMsg);
      return;
    }

    const teacher = docentes.find(d => d.id === selectedTeacherId);
    const classroom = allClassrooms.find(c => c.id === classroomId);
    const area = allAreas.find(a => a.id === areaId);
    if (!teacher || !classroom || !area) {
      setConflict('Error al obtener datos. Recarga la página.');
      return;
    }

    const newActivity: FlexibleScheduleActivity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      dayOfWeek,
      startTime,
      durationMinutes: duration,
      endTime,
      courseId: area.id,
      courseName: area.asignatura,
      teacherId: selectedTeacherId,
      teacherName: teacher.displayName || teacher.email,
      classroomId,
      classroomName: classroom.nombreSalon,
    };

    try {
      await dispatch(saveActivity({ year: currentYear, activity: newActivity })).unwrap();
      setSuccessMsg(`Clase "${area.asignatura}" en ${classroom.nombreSalon} guardada.`);
      setTimeout(() => setSuccessMsg(null), 3000);
      // Reset sólo día/hora/duración, dejando docente/salon/area para agilizar
      setDuration(60);
    } catch {
      setConflict('Error al guardar. Intenta de nuevo.');
    }
  }

  // ── Eliminar actividad ──────────────────────────────
  async function handleDelete(activityId: string) {
    setDeleteError(null);
    try {
      await dispatch(removeActivity({ year: currentYear, activityId })).unwrap();
    } catch {
      setDeleteError('Error al eliminar la clase.');
    }
  }

  // ── RENDER ──────────────────────────────────────────

  if (loadingMaster) {
    return (
      <div className="flex items-center justify-center py-12">
        <IconLoader size={20} className="animate-spin text-gray-400 mr-2" />
        <span className="text-sm text-gray-500">Cargando datos…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Formulario de creación rápida ── */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 bg-orchid-blue-60 rounded-lg flex items-center justify-center flex-shrink-0">
            <IconPlus size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Agregar clase al horario</h2>
            <p className="text-[11px] text-gray-400">
              Selecciona docente → salón → área → horario
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Fila 1: Docente */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              <IconUserCheck size={12} className="inline mr-1.5 text-orchid-blue-60" />
              Docente
            </label>
            <div className="relative">
              <select
                value={selectedTeacherId}
                onChange={e => setSelectedTeacherId(e.target.value)}
                className="w-full appearance-none px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orchid-blue-30 focus:border-orchid-blue-60 transition-all pr-8"
              >
                <option value="">— Seleccionar docente —</option>
                {docentes.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.displayName || d.email}
                  </option>
                ))}
              </select>
              <IconChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {loadingTeacher && (
              <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                <IconLoader size={10} className="animate-spin" /> Cargando asignaciones…
              </p>
            )}
          </div>

          {/* Fila 2: Salón + Área */}
          {teacherAssignments && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  <IconDoor size={12} className="inline mr-1.5 text-tosca-cc" />
                  Salón
                </label>
                <div className="relative">
                  <select
                    value={classroomId}
                    onChange={e => setClassroomId(e.target.value)}
                    className="w-full appearance-none px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orchid-blue-30 focus:border-orchid-blue-60 transition-all pr-8"
                  >
                    <option value="">— Salón —</option>
                    {teacherClassrooms.map(c => (
                      <option key={c.id} value={c.id}>{c.nombreSalon}</option>
                    ))}
                  </select>
                  <IconChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {teacherClassrooms.length === 0 && (
                  <p className="text-[11px] text-amber-600 mt-1">Sin salones asignados a este docente.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  <IconBook size={12} className="inline mr-1.5 text-tosca-cc" />
                  Área / Asignatura
                </label>
                <div className="relative">
                  <select
                    value={areaId}
                    onChange={e => setAreaId(e.target.value)}
                    className="w-full appearance-none px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orchid-blue-30 focus:border-orchid-blue-60 transition-all pr-8"
                  >
                    <option value="">— Área —</option>
                    {teacherAreas.map(a => (
                      <option key={a.id} value={a.id}>{a.asignatura}</option>
                    ))}
                  </select>
                  <IconChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {teacherAreas.length === 0 && (
                  <p className="text-[11px] text-amber-600 mt-1">Sin áreas asignadas a este docente.</p>
                )}
              </div>
            </div>
          )}

          {/* Fila 3: Día, Hora, Duración */}
          {teacherAssignments && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Día */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  <IconCalendar size={12} className="inline mr-1.5 text-orchid-blue-60" />
                  Día de la semana
                </label>
                <div className="relative">
                  <select
                    value={dayOfWeek}
                    onChange={e => setDayOfWeek(Number(e.target.value))}
                    className="w-full appearance-none px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orchid-blue-30 focus:border-orchid-blue-60 transition-all pr-8"
                  >
                    {DAYS_OF_WEEK.map((d, i) => (
                      <option key={d} value={i}>{d}</option>
                    ))}
                  </select>
                  <IconChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Hora de inicio */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  <IconClock size={12} className="inline mr-1.5 text-orchid-blue-60" />
                  Hora de inicio
                </label>
                <div className="relative">
                  <select
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full appearance-none px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orchid-blue-30 focus:border-orchid-blue-60 transition-all pr-8"
                  >
                    {TIME_SLOTS.map(t => (
                      <option key={t} value={t.includes(':') && t.length === 4 ? `0${t}` : t}>
                        {t}
                      </option>
                    ))}
                    {/* Horas adicionales frecuentes no en TIME_SLOTS */}
                    {['07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '13:00', '14:00', '14:30', '15:00']
                      .filter(h => !TIME_SLOTS.includes(h) && !TIME_SLOTS.includes(h.replace(/^0/, '')))
                      .map(h => <option key={h} value={h}>{h}</option>)
                    }
                  </select>
                  <IconChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Duración */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  <IconClock size={12} className="inline mr-1.5 text-orchid-blue-60" />
                  Duración (máx 2 h)
                </label>
                <div className="flex gap-1.5">
                  {DURATIONS.map(d => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setDuration(d.value)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        duration === d.value
                          ? 'bg-orchid-blue-60 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Resumen de hora fin */}
          {teacherAssignments && startTime && (
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
              <IconClock size={13} className="text-orchid-blue-60" />
              <span>
                Clase: <span className="font-semibold text-gray-700">{startTime}</span>
                {' → '}
                <span className="font-semibold text-gray-700">{endTime}</span>
                {' · '}
                {DAYS_OF_WEEK[dayOfWeek]}
              </span>
            </div>
          )}

          {/* Mensajes */}
          {conflict && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <IconAlertCircle size={15} className="flex-shrink-0" />
              {conflict}
            </div>
          )}
          {successMsg && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              <IconCheck size={15} className="flex-shrink-0" />
              {successMsg}
            </div>
          )}

          {/* Botón guardar */}
          {teacherAssignments && (
            <button
              type="submit"
              disabled={isSaving || !classroomId || !areaId}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orchid-blue-60 text-white text-sm font-semibold rounded-lg hover:bg-orchid-blue-70 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {isSaving ? (
                <><IconLoader size={16} className="animate-spin" /> Guardando…</>
              ) : (
                <><IconPlus size={16} /> Agregar clase</>
              )}
            </button>
          )}
        </form>
      </div>

      {/* ── Lista de clases actuales del docente ── */}
      {selectedTeacherId && teacherActivities.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide">
              Clases actuales de {teacherAssignments?.displayName || '…'}
            </h3>
          </div>
          {deleteError && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border-b border-red-100 text-xs text-red-700">
              <IconAlertCircle size={13} /> {deleteError}
            </div>
          )}
          <div className="divide-y divide-gray-50">
            {[...teacherActivities]
              .sort((a, b) => a.dayOfWeek !== b.dayOfWeek ? a.dayOfWeek - b.dayOfWeek : a.startTime.localeCompare(b.startTime))
              .map(act => (
                <div key={act.id} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{act.courseName}</p>
                    <p className="text-[11px] text-gray-400">
                      {DAYS_OF_WEEK[act.dayOfWeek]} · {act.startTime}–{act.endTime} · {act.classroomName}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(act.id)}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                    title="Eliminar clase"
                  >
                    <IconTrash size={14} />
                  </button>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}
