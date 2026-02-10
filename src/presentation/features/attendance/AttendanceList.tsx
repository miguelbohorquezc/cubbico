/**
 * @fileoverview Lista mensual de asistencia por clase
 * @module presentation/features/attendance/AttendanceList
 *
 * Vista mensual donde el docente marca la asistencia de cada estudiante.
 * Ruta: /private/dashboard/asistencia/:salonId/:profesorId/:areaId/:fecha/:hora
 *
 * Flujo de estados por celda: vacío → present → unjustified → justified → vacío
 * Al transicionar a "unjustified" se abre el modal de justificación (integrado en 4.2).
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebase';
import { SidebarV2 } from '../../components/sidebarV2';
import { HeaderV2 } from '../../components/headerV2';
import { fetchStudentsByClassroom } from '../../../infrastructure/student.service';
import {
  fetchAttendanceByProfessorAndClassroom,
  saveAttendance,
} from '../../../infrastructure/attendance.service';
import type { studentInfo } from '../../../domain/entities/studentInfo';
import type { AttendanceRecord, StudentAttendance, AttendanceStatus } from '../../../domain/entities/attendance';
import { PrivateRoutes } from '../../../app/routes/routes';
import {
  IconLoader,
  IconAlertCircle,
  IconChevronLeft,
  IconChevronRight,
  IconArrowBack,
  IconFileAnalytics,
  IconDoor,
} from '@tabler/icons-react';
import JustificationModal from './JustificationModal';

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

interface MonthDay {
  date: Date;
  iso: string;
  isActive: boolean;  // es un día de clase (mismo día de semana)
  isFuture: boolean;  // después de hoy
  isWeekend: boolean;
}

function getMonthDays(yearMonth: string, classDow: number): MonthDay[] {
  const [y, m] = yearMonth.split('-').map(Number);
  const first = new Date(y, m - 1, 1);
  const last  = new Date(y, m, 0);
  const todayISO = toISO(new Date());
  const days: MonthDay[] = [];

  for (const d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
    const dow = (d.getDay() + 6) % 7; // Mon=0 … Sun=6
    days.push({
      date: new Date(d),
      iso: toISO(d),
      isActive: dow === classDow,
      isFuture: toISO(d) > todayISO,
      isWeekend: dow >= 5,
    });
  }
  return days;
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
// Estilos por estado
// ============================================

function statusStyle(status: AttendanceStatus | null): string {
  switch (status) {
    case 'present':     return 'bg-emerald-100 border-emerald-300 text-emerald-700';
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

export default function AttendanceList() {
  const params = useParams<RouteParams>() as RouteParams;
  const { salonId, profesorId, areaId, fecha, hora } = params;
  const horaDecoded = decodeURIComponent(hora);
  const navigate = useNavigate();
  const isSidebarCollapsed = useSidebarCollapsed();

  const [students, setStudents]       = useState<studentInfo[]>([]);
  const [records, setRecords]         = useState<Record<string, AttendanceRecord>>({});
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => fecha.slice(0, 7));
  const [classroomName, setClassroomName] = useState<string>('');

  // Estado del modal de justificación (se conecta en microtask 4.2)
  const [modalData, setModalData]     = useState<{ fecha: string; studentId: string; studentName: string } | null>(null);

  const saveTimeouts = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Día de la semana de esta clase (0=Mon … 4=Fri)
  const classDow = (() => {
    const d = new Date(fecha + 'T00:00:00');
    return (d.getDay() + 6) % 7;
  })();

  const monthDays = getMonthDays(currentMonth, classDow);

  // ── Cargar nombre del salón ──────────────────────
  useEffect(() => {
    let cancelled = false;

    async function loadClassroom() {
      try {
        const classroomDoc = await getDoc(doc(db, 'classRooms', salonId));
        if (!cancelled && classroomDoc.exists()) {
          setClassroomName(classroomDoc.data()?.nombreSalon || 'Salón');
        }
      } catch {
        if (!cancelled) setClassroomName('Salón');
      }
    }

    loadClassroom();
    return () => { cancelled = true; };
  }, [salonId]);

  // ── Cargar datos ─────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const lastDay = new Date(Number(currentMonth.slice(0, 4)), Number(currentMonth.slice(5, 7)), 0).getDate();
        const [studs, attendRecords] = await Promise.all([
          fetchStudentsByClassroom(salonId),
          fetchAttendanceByProfessorAndClassroom(
            salonId, profesorId, areaId,
            `${currentMonth}-01`,
            `${currentMonth}-${pad(lastDay)}`
          ),
        ]);
        if (cancelled) return;
        setStudents(studs);

        const map: Record<string, AttendanceRecord> = {};
        attendRecords.forEach((r) => { map[r.fecha] = r; });
        setRecords(map);
      } catch {
        if (!cancelled) setError('Error al cargar datos de asistencia.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [salonId, profesorId, areaId, currentMonth]);

  // ── Navegar meses ────────────────────────────────
  function prevMonth() {
    const [y, m] = currentMonth.split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    setCurrentMonth(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`);
  }

  function nextMonth() {
    const [y, m] = currentMonth.split('-').map(Number);
    const d = new Date(y, m, 1);
    setCurrentMonth(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`);
  }

  // ── Obtener estado de una celda ──────────────────
  function getStatus(fechaDia: string, studentId: string): AttendanceStatus | null {
    const record = records[fechaDia];
    if (!record) return null;
    return record.estudiantes[studentId]?.status || null;
  }

  // ── Aplicar cambio de estado ─────────────────────
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

    setRecords((prev) => ({ ...prev, [fechaDia]: record }));
    debouncedSave(fechaDia, record);
  }

  // ── Click en celda ───────────────────────────────
  function handleCellClick(fechaDia: string, student: studentInfo, day: MonthDay) {
    if (!day.isActive || day.isFuture) return;

    const current = getStatus(fechaDia, student.id);

    // Ciclo: null → present → unjustified → justified (modal excusa) → null
    if (current === null)          { applyStatus(fechaDia, student.id, 'present'); return; }
    if (current === 'present')     { applyStatus(fechaDia, student.id, 'unjustified'); return; }
    if (current === 'unjustified') {
      // Transición a justified: abrir modal para registrar excusa
      setModalData({ fecha: fechaDia, studentId: student.id, studentName: `${student.name} ${student.lastName}` });
      return;
    }
    if (current === 'justified')   { applyStatus(fechaDia, student.id, null); return; }
  }

  // Callback que el modal invoca al guardar (se conecta en 4.2)
  function handleModalSave(motivo: string, conExcusa: boolean) {
    if (!modalData) return;
    applyStatus(modalData.fecha, modalData.studentId, 'justified', motivo, conExcusa);
    setModalData(null);
  }

  function handleModalCancel() {
    setModalData(null);
  }

  // ── Debounce save ────────────────────────────────
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

  // ── Días activos visibles (columnas del grid) ───
  const activeDays = monthDays.filter((d) => d.isActive);

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
            <span className="text-sm font-medium">Cargando asistencia…</span>
          </div>
        </div>
      </div>
    );
  }

  // Etiqueta del mes
  const [y, m] = currentMonth.split('-').map(Number);
  const monthLabel = new Date(y, m - 1, 1).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <SidebarV2 />

      <div className="flex-1 flex flex-col min-w-0">
        <HeaderV2
          title={classroomName ? `Asistencia - ${classroomName}` : 'Asistencia'}
          subtitle={classroomName ? `Hora: ${horaDecoded}` : undefined}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        <div className="h-16 flex-shrink-0" />

        <main className="flex-1 overflow-auto min-h-0 p-4 lg:p-5">
          {/* ── Top bar ── */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
              >
                <IconArrowBack size={13} /> Volver
              </button>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <IconDoor size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-gray-900">
                    {classroomName || 'Listado de Asistencia'}
                  </h1>
                  <p className="text-[11px] text-gray-500">
                    Hora {horaDecoded} · Click en celda para marcar
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate(`/${PrivateRoutes.PRIVATE}/${PrivateRoutes.DASHBOARD}/${PrivateRoutes.ASISTENCIA}/report/${salonId}/${profesorId}/${areaId}/${horaDecoded}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-all"
            >
              <IconFileAnalytics size={13} /> Informe
            </button>
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <IconAlertCircle size={16} className="text-red-500 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* ── Contexto + Mes nav ── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 mb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2 text-[11px] text-gray-600">
                <span className="px-2 py-0.5 bg-gray-100 rounded-full font-semibold">Hora {horaDecoded}</span>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={prevMonth} className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all">
                  <IconChevronLeft size={14} className="text-gray-500" />
                </button>
                <span className="text-sm font-bold text-gray-700 capitalize w-40 text-center">{monthLabel}</span>
                <button onClick={nextMonth} className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all">
                  <IconChevronRight size={14} className="text-gray-500" />
                </button>
              </div>

              {/* Leyenda */}
              <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500">
                <span className="flex items-center gap-1"><span className="inline-block w-4 h-4 rounded border bg-emerald-100 border-emerald-300 text-center text-emerald-700 leading-4">✓</span> Presente</span>
                <span className="flex items-center gap-1"><span className="inline-block w-4 h-4 rounded border bg-red-100 border-red-300 text-center text-red-700 leading-4">✕</span> Injust.</span>
                <span className="flex items-center gap-1"><span className="inline-block w-4 h-4 rounded border bg-amber-100 border-amber-300 text-center text-amber-700 leading-4">J</span> Just.</span>
              </div>
            </div>
          </div>

          {/* ── Grid mensual ── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-auto" style={{ maxHeight: '65vh' }}>
              <table className="border-collapse text-[11px]" style={{ minWidth: `${240 + activeDays.length * 38}px` }}>
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gray-50">
                    <th className="sticky left-0 z-20 bg-gray-50 w-56 min-w-[224px] px-3 py-2 text-left font-bold text-gray-500 border-b border-gray-200 border-r border-gray-200 text-[10px]">
                      Estudiante
                    </th>
                    {activeDays.map((day) => {
                      const isToday = day.iso === toISO(new Date());
                      return (
                        <th
                          key={day.iso}
                          className={`px-1 py-2 text-center font-bold border-b border-gray-200 text-[10px] ${
                            isToday ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500'
                          }`}
                          style={{ minWidth: '36px' }}
                        >
                          <div>{pad(day.date.getDate())}</div>
                          {isToday && <span className="inline-block mt-0.5 px-1 rounded-full bg-indigo-500 text-white text-[8px] font-bold">Hoy</span>}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="sticky left-0 z-10 bg-white px-3 py-1.5 border-b border-gray-100 border-r border-gray-200 font-medium text-gray-700 text-[11px]">
                        <div className="truncate">{student.name} {student.lastName}</div>
                        <div className="text-[9px] text-gray-400 truncate">{student.document}</div>
                      </td>
                      {activeDays.map((day) => {
                        const status = getStatus(day.iso, student.id);
                        const disabled = !day.isActive || day.isFuture;
                        return (
                          <td key={day.iso} className="border-b border-gray-100 px-0.5 py-0.5 text-center">
                            <button
                              onClick={() => handleCellClick(day.iso, student, day)}
                              disabled={disabled}
                              className={`w-8 h-8 mx-auto flex items-center justify-center rounded border font-bold text-[11px] transition-all ${
                                disabled
                                  ? 'opacity-30 cursor-not-allowed bg-gray-100 border-gray-200 text-gray-400'
                                  : `cursor-pointer hover:scale-110 active:scale-95 ${statusStyle(status)}`
                              }`}
                              title={day.isFuture ? 'Día futuro' : status || 'Sin marca'}
                            >
                              {statusLabel(status)}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* ── Modal de justificación ── */}
      <JustificationModal
        open={modalData !== null}
        fecha={modalData?.fecha || ''}
        studentName={modalData?.studentName || ''}
        hora={horaDecoded}
        onSave={handleModalSave}
        onCancel={handleModalCancel}

      />
    </div>
  );
}
