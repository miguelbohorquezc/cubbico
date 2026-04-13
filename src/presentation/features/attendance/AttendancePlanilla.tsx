/**
 * @fileoverview Planilla completa de asistencia por período
 * @module presentation/features/attendance/AttendancePlanilla
 *
 * Muestra todos los días de clase de un período en una sola tabla.
 * Ruta: /private/dashboard/asistencia/planilla/:salonId/:profesorId/:areaId/:fecha/:hora
 *
 * - Auto-detecta el período activo según la fecha actual.
 * - Usa fechaInicio/fechaFin configurados en PeriodConfig.
 * - Mismo ciclo de estados que AttendanceList: present (default) → unjustified → justified → present.
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebase';
import { SidebarV2 } from '../../components/sidebarV2';
import { HeaderV2 } from '../../components/headerV2';
import { fetchActiveStudentsByClassroom } from '../../../infrastructure/student.service';
import {
  fetchAttendanceByProfessorAndClassroom,
  saveAttendance,
} from '../../../infrastructure/attendance.service';
import { fetchPeriodConfigsByYear } from '../../../infrastructure/periodConfig.service';
import type { studentInfo } from '../../../domain/entities/studentInfo';
import type { AttendanceRecord, StudentAttendance, AttendanceStatus } from '../../../domain/entities/attendance';
import type { PeriodConfig } from '../../../domain/entities/periodConfig';
import { PrivateRoutes } from '../../../app/routes/routes';
import JustificationModal from './JustificationModal';
import {
  IconLoader,
  IconAlertCircle,
  IconArrowBack,
  IconCalendar,
  IconDoor,
  IconInfoCircle,
} from '@tabler/icons-react';

// ============================================
// Tipos de parámetros de ruta
// ============================================

interface RouteParams {
  salonId: string;
  profesorId: string;
  areaId: string;
  fecha: string;
  hora: string;
}

// ============================================
// Utilidades de fecha
// ============================================

function pad(n: number): string { return String(n).padStart(2, '0'); }
function toISO(d: Date): string { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

interface PeriodDay {
  date: Date;
  iso: string;
  isFuture: boolean;
  dayLabel: string;  // "Lun 03", "Mié 17", etc.
}

const DAY_ABBR = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

/** Retorna todos los días que coinciden con el día de semana de la clase dentro del rango del periodo */
function getPeriodClassDays(fechaInicio: string, fechaFin: string, classDow: number): PeriodDay[] {
  const todayISO = toISO(new Date());
  const days: PeriodDay[] = [];

  const current = new Date(fechaInicio + 'T00:00:00');
  const end     = new Date(fechaFin + 'T00:00:00');

  while (current <= end) {
    const dow = (current.getDay() + 6) % 7; // Mon=0 … Sun=6
    if (dow === classDow) {
      const iso = toISO(current);
      days.push({
        date: new Date(current),
        iso,
        isFuture: iso > todayISO,
        dayLabel: `${DAY_ABBR[dow]} ${pad(current.getDate())}`,
      });
    }
    current.setDate(current.getDate() + 1);
  }

  return days;
}

/** Formatea fecha ISO a "marzo 2026" */
function formatMonthYear(iso: string): string {
  const [y, m] = iso.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
}

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
// Estilos por estado (idénticos a AttendanceList)
// ============================================

function statusStyle(status: AttendanceStatus | null): string {
  switch (status) {
    case 'present':     return 'bg-tosca/20 border-tosca-300 text-tosca-700';
    case 'justified':   return 'bg-amber-100 border-amber-300 text-amber-700';
    case 'unjustified': return 'bg-red-100 border-red-300 text-red-700';
    default:            return 'bg-gray-50 border-gray-200 text-gray-400';
  }
}

function statusLabel(status: AttendanceStatus | null): string {
  switch (status) {
    case 'present':     return '✓';
    case 'justified':   return 'J';
    case 'unjustified': return '✕';
    default:            return '—';
  }
}

// ============================================
// Componente principal
// ============================================

export default function AttendancePlanilla() {
  const params = useParams() as unknown as RouteParams;
  const { salonId, profesorId, areaId, fecha, hora } = params;
  const horaDecoded = decodeURIComponent(hora);
  const navigate = useNavigate();
  const isSidebarCollapsed = useSidebarCollapsed();

  // Día de semana de esta clase (0=Lun … 4=Vie)
  const classDow = (() => {
    const d = new Date(fecha + 'T00:00:00');
    return (d.getDay() + 6) % 7;
  })();

  const currentYear = fecha.slice(0, 4);

  const [students, setStudents]           = useState<studentInfo[]>([]);
  const [records, setRecords]             = useState<Record<string, AttendanceRecord>>({});
  const [periodConfigs, setPeriodConfigs] = useState<PeriodConfig[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [classroomName, setClassroomName] = useState<string>('');
  const [isLoading, setIsLoading]         = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [modalData, setModalData]         = useState<{ fecha: string; studentId: string; studentName: string } | null>(null);

  const saveTimeouts = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // ── Cargar nombre del salón + período configs ──
  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      try {
        const [classroomDoc, configs] = await Promise.all([
          getDoc(doc(db, 'classRooms', salonId)),
          fetchPeriodConfigsByYear(currentYear),
        ]);
        if (cancelled) return;

        if (classroomDoc.exists()) {
          setClassroomName(classroomDoc.data()?.nombreSalon || 'Salón');
        }

        const validConfigs = configs.filter(c => c.fechaInicio && c.fechaFin);
        setPeriodConfigs(validConfigs);

        // Auto-detectar período activo
        const todayISO = toISO(new Date());
        const active = validConfigs.find(
          c => c.fechaInicio! <= todayISO && todayISO <= c.fechaFin!
        );
        if (active) {
          setSelectedPeriod(active.periodId);
        } else if (validConfigs.length > 0) {
          // Fallback: el último período configurado
          const sorted = [...validConfigs].sort((a, b) => a.periodId.localeCompare(b.periodId));
          setSelectedPeriod(sorted[sorted.length - 1].periodId);
        }
      } catch {
        if (!cancelled) setError('Error al cargar datos iniciales.');
      }
    }

    loadInitial();
    return () => { cancelled = true; };
  }, [salonId, currentYear]);

  // ── Cargar estudiantes + registros cuando cambia el período ──
  useEffect(() => {
    if (!selectedPeriod) return;

    const config = periodConfigs.find(c => c.periodId === selectedPeriod);
    if (!config?.fechaInicio || !config?.fechaFin) return;

    let cancelled = false;

    async function loadAttendance() {
      setIsLoading(true);
      setError(null);
      try {
        const [studs, attendRecords] = await Promise.all([
          fetchActiveStudentsByClassroom(salonId),
          fetchAttendanceByProfessorAndClassroom(
            salonId, profesorId, areaId,
            config!.fechaInicio!,
            config!.fechaFin!
          ),
        ]);
        if (cancelled) return;
        setStudents(studs);

        const map: Record<string, AttendanceRecord> = {};
        attendRecords.forEach(r => { map[r.fecha] = r; });
        setRecords(map);
      } catch {
        if (!cancelled) setError('Error al cargar asistencia del período.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadAttendance();
    return () => { cancelled = true; };
  }, [selectedPeriod, periodConfigs, salonId, profesorId, areaId]);

  // ── Días de clase del período seleccionado ──
  const periodDays: PeriodDay[] = (() => {
    const config = periodConfigs.find(c => c.periodId === selectedPeriod);
    if (!config?.fechaInicio || !config?.fechaFin) return [];
    return getPeriodClassDays(config.fechaInicio, config.fechaFin, classDow);
  })();

  // ── Estado guardado en DB ──
  function getStatus(fechaDia: string, studentId: string): AttendanceStatus | null {
    const record = records[fechaDia];
    if (!record) return null;
    return record.estudiantes[studentId]?.status || null;
  }

  // ── Estado de display (presente por defecto en días activos pasados) ──
  function getDisplayStatus(fechaDia: string, studentId: string, day: PeriodDay): AttendanceStatus | null {
    const saved = getStatus(fechaDia, studentId);
    if (saved !== null) return saved;
    if (!day.isFuture) return 'present';
    return null;
  }

  // ── Aplicar cambio de estado ──
  function applyStatus(fechaDia: string, studentId: string, status: AttendanceStatus | null, motivo?: string, conExcusa?: boolean) {
    const year = fechaDia.slice(0, 4);
    const record: AttendanceRecord = records[fechaDia] || {
      salonId, profesorId, areaId,
      fecha: fechaDia, hora: horaDecoded, año: year,
      estudiantes: {},
    };

    if (status === null) {
      const { [studentId]: _, ...rest } = record.estudiantes;
      record.estudiantes = rest;
    } else {
      const entry: StudentAttendance = { status };
      if (motivo !== undefined) entry.motivo = motivo;
      if (conExcusa !== undefined) entry.conExcusa = conExcusa;
      record.estudiantes = { ...record.estudiantes, [studentId]: entry };
    }

    setRecords(prev => ({ ...prev, [fechaDia]: record }));
    debouncedSave(fechaDia, record);
  }

  // ── Click en celda ──
  function handleCellClick(fechaDia: string, student: studentInfo, day: PeriodDay) {
    if (day.isFuture) return;

    const current = getDisplayStatus(fechaDia, student.id, day);
    if (current === 'present')     { applyStatus(fechaDia, student.id, 'unjustified'); return; }
    if (current === 'unjustified') {
      setModalData({ fecha: fechaDia, studentId: student.id, studentName: `${student.name} ${student.lastName}` });
      return;
    }
    if (current === 'justified') { applyStatus(fechaDia, student.id, null); return; }
  }

  function handleModalSave(motivo: string, conExcusa: boolean) {
    if (!modalData) return;
    applyStatus(modalData.fecha, modalData.studentId, 'justified', motivo, conExcusa);
    setModalData(null);
  }

  // ── Debounce save ──
  function debouncedSave(fechaDia: string, record: AttendanceRecord) {
    if (saveTimeouts.current[fechaDia]) clearTimeout(saveTimeouts.current[fechaDia]);
    saveTimeouts.current[fechaDia] = setTimeout(async () => {
      try {
        await saveAttendance(record);
      } catch {
        setError('Error al guardar. Intenta de nuevo.');
      }
    }, 900);
  }

  // ── Conteo de fallas por estudiante ──
  function countAbsences(studentId: string): { inj: number; just: number } {
    let inj = 0, just = 0;
    periodDays.forEach(day => {
      const s = getStatus(day.iso, studentId);
      if (s === 'unjustified') inj++;
      if (s === 'justified') just++;
    });
    return { inj, just };
  }

  // ── Etiqueta del período seleccionado ──
  const selectedConfig = periodConfigs.find(c => c.periodId === selectedPeriod);
  const periodRangeLabel = selectedConfig?.fechaInicio && selectedConfig?.fechaFin
    ? `${formatMonthYear(selectedConfig.fechaInicio)} — ${formatMonthYear(selectedConfig.fechaFin)}`
    : '';

  // ══════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <SidebarV2 />

      <div className="flex-1 flex flex-col min-w-0">
        <HeaderV2
          title={classroomName ? `Planilla - ${classroomName}` : 'Planilla de Asistencia'}
          subtitle={horaDecoded ? `Hora: ${horaDecoded}` : undefined}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        <div className="h-16 flex-shrink-0" />

        <main className="flex-1 overflow-auto min-h-0 p-4 lg:p-5">

          {/* ── Top bar ── */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/${PrivateRoutes.PRIVATE}/${PrivateRoutes.DASHBOARD}/${PrivateRoutes.ASISTENCIA}/${salonId}/${profesorId}/${areaId}/${fecha}/${encodeURIComponent(horaDecoded)}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
              >
                <IconArrowBack size={13} /> Volver a lista mensual
              </button>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-orchid-blue-60 rounded-lg flex items-center justify-center flex-shrink-0">
                  <IconCalendar size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-gray-900">
                    Planilla del Período {selectedPeriod || '—'}
                  </h1>
                  <p className="text-[11px] text-gray-500">
                    {periodRangeLabel || 'Selecciona un período'} · {periodDays.length} días de clase
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <IconAlertCircle size={16} className="text-red-500 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* ── Sin periodos configurados ── */}
          {!isLoading && periodConfigs.length === 0 && (
            <div className="bg-white rounded-lg border border-amber-200 shadow-sm p-6 flex items-start gap-3">
              <IconInfoCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-800">No hay períodos configurados</p>
                <p className="text-xs text-gray-500 mt-1">
                  El Coordinador debe configurar las fechas de inicio y fin de asistencia en
                  Configuración → Períodos antes de usar la planilla.
                </p>
              </div>
            </div>
          )}

          {/* ── Selector de período + leyenda ── */}
          {periodConfigs.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-3 mb-3">
              <div className="flex flex-wrap items-center justify-between gap-3">

                {/* Selector de período */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500">Período:</span>
                  <div className="flex gap-1">
                    {periodConfigs
                      .sort((a, b) => a.periodId.localeCompare(b.periodId))
                      .map(config => (
                        <button
                          key={config.periodId}
                          onClick={() => setSelectedPeriod(config.periodId)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            selectedPeriod === config.periodId
                              ? 'bg-orchid-blue-60 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          P{config.periodId}
                        </button>
                      ))
                    }
                  </div>
                </div>

                {/* Leyenda */}
                <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-4 h-4 rounded border bg-tosca/20 border-tosca-300 text-center text-tosca-700 leading-4">✓</span>
                    Presente
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-4 h-4 rounded border bg-red-100 border-red-300 text-center text-red-700 leading-4">✕</span>
                    Injust.
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-4 h-4 rounded border bg-amber-100 border-amber-300 text-center text-amber-700 leading-4">J</span>
                    Just.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── Loading ── */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-3 text-gray-500">
                <IconLoader size={20} className="animate-spin" />
                <span className="text-sm font-medium">Cargando planilla…</span>
              </div>
            </div>
          )}

          {/* ── Grid de planilla ── */}
          {!isLoading && periodDays.length > 0 && students.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-auto" style={{ maxHeight: '65vh' }}>
                <table className="border-collapse text-[11px]" style={{ minWidth: `${280 + periodDays.length * 38 + 80}px` }}>
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gray-50">
                      {/* Columna de estudiante */}
                      <th className="sticky left-0 z-20 bg-gray-50 w-60 min-w-[240px] px-3 py-2 text-left font-bold text-gray-500 border-b border-gray-200 border-r border-gray-200 text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <IconDoor size={12} className="text-gray-400" />
                          Estudiante
                        </div>
                      </th>
                      {/* Columnas de días */}
                      {periodDays.map(day => {
                        const isToday = day.iso === toISO(new Date());
                        return (
                          <th
                            key={day.iso}
                            className={`px-1 py-2 text-center font-bold border-b border-gray-200 text-[10px] ${
                              isToday
                                ? 'bg-orchid-blue-10 text-orchid-blue-70'
                                : day.isFuture
                                  ? 'text-gray-300'
                                  : 'text-gray-500'
                            }`}
                            style={{ minWidth: '36px' }}
                            title={day.iso}
                          >
                            {day.dayLabel}
                            {isToday && (
                              <div className="mt-0.5">
                                <span className="inline-block px-1 rounded-full bg-orchid-blue-60 text-white text-[8px] font-bold">Hoy</span>
                              </div>
                            )}
                          </th>
                        );
                      })}
                      {/* Columna de resumen */}
                      <th className="px-2 py-2 text-center font-bold text-gray-500 border-b border-gray-200 border-l border-gray-200 text-[10px] sticky right-0 bg-gray-50 z-20">
                        F / FI
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => {
                      const { inj, just } = countAbsences(student.id);
                      return (
                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                          {/* Nombre */}
                          <td className="sticky left-0 z-10 bg-white px-3 py-1.5 border-b border-gray-100 border-r border-gray-200 font-medium text-gray-700 text-[11px]">
                            <div className="truncate">{student.name} {student.lastName}</div>
                            <div className="text-[9px] text-gray-400 truncate">{student.document}</div>
                          </td>
                          {/* Celdas de días */}
                          {periodDays.map(day => {
                            const status = getDisplayStatus(day.iso, student.id, day);
                            return (
                              <td key={day.iso} className="border-b border-gray-100 px-0.5 py-0.5 text-center">
                                <button
                                  onClick={() => handleCellClick(day.iso, student, day)}
                                  disabled={day.isFuture}
                                  className={`w-8 h-8 mx-auto flex items-center justify-center rounded border font-bold text-[11px] transition-all ${
                                    day.isFuture
                                      ? 'opacity-20 cursor-not-allowed bg-gray-100 border-gray-200 text-gray-400'
                                      : `cursor-pointer hover:scale-110 active:scale-95 ${statusStyle(status)}`
                                  }`}
                                  title={
                                    day.isFuture ? 'Día futuro'
                                    : status === 'present' ? 'Presente (clic para marcar falta)'
                                    : status === 'unjustified' ? 'Falta injustificada (clic para justificar)'
                                    : status === 'justified' ? 'Falta justificada (clic para limpiar)'
                                    : '—'
                                  }
                                >
                                  {statusLabel(status)}
                                </button>
                              </td>
                            );
                          })}
                          {/* Resumen */}
                          <td className="border-b border-gray-100 border-l border-gray-200 px-2 py-1.5 text-center sticky right-0 bg-white z-10">
                            <div className="flex items-center justify-center gap-1 text-[10px] font-bold">
                              <span className={inj > 0 ? 'text-red-600' : 'text-gray-300'}>{inj}</span>
                              <span className="text-gray-300">/</span>
                              <span className={just > 0 ? 'text-amber-600' : 'text-gray-300'}>{just}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer info */}
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-[10px] text-gray-400 flex items-center gap-1">
                <IconInfoCircle size={11} />
                Columna F/FI: Faltas injustificadas / Faltas justificadas guardadas en el período
              </div>
            </div>
          )}

          {/* ── Sin días de clase ── */}
          {!isLoading && selectedPeriod && periodDays.length === 0 && periodConfigs.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-50 flex items-center justify-center">
                <IconCalendar size={22} className="text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-800">Sin días de clase en este período</p>
              <p className="text-xs text-gray-500 mt-1">
                No hay días que coincidan con el horario de esta clase en el rango configurado.
              </p>
            </div>
          )}

        </main>
      </div>

      {/* Modal de justificación */}
      <JustificationModal
        open={modalData !== null}
        fecha={modalData?.fecha || ''}
        studentName={modalData?.studentName || ''}
        hora={horaDecoded}
        onSave={handleModalSave}
        onCancel={() => setModalData(null)}
      />
    </div>
  );
}
