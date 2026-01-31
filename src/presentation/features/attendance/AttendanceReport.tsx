/**
 * @fileoverview Reporte ejecutivo mensual de asistencias (imprimible en hoja legal)
 * @module presentation/features/attendance/AttendanceReport
 *
 * Documento ejecutivo que consolida la asistencia mensual de un salón/profesor/área/hora.
 * Diseñado para impresión en hoja legal (8.5 × 14 in).
 *
 * Ruta: /private/dashboard/asistencia/report/:salonId/:profesorId/:areaId/:hora
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SidebarV2 } from '../../components/sidebarV2';
import { HeaderV2 } from '../../components/headerV2';
import { fetchAttendanceByProfessorAndClassroom } from '../../../infrastructure/attendance.service';
import { fetchStudentsByClassroom } from '../../../infrastructure/student.service';
import type { AttendanceRecord } from '../../../domain/entities/attendance';
import type { studentInfo } from '../../../domain/entities/studentInfo';
import {
  IconLoader,
  IconAlertCircle,
  IconArrowBack,
  IconPrinter,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';

// ============================================
// Tipos
// ============================================

interface RouteParams {
  salonId: string;
  profesorId: string;
  areaId: string;
  hora: string;
}

interface StudentSummary {
  student: studentInfo;
  present: number;
  justified: number;
  unjustified: number;
  total: number;
  rate: number; // porcentaje de asistencia (presente / total registrados)
}

// ============================================
// Utilidades
// ============================================

function pad(n: number): string { return String(n).padStart(2, '0'); }

// ============================================
// Hook: sidebar
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
// Componente
// ============================================

export default function AttendanceReport() {
  const params = useParams<RouteParams>() as RouteParams;
  const { salonId, profesorId, areaId, hora } = params;
  const horaDecoded = decodeURIComponent(hora);
  const navigate = useNavigate();
  const isSidebarCollapsed = useSidebarCollapsed();

  const [students, setStudents]       = useState<studentInfo[]>([]);
  const [records, setRecords]         = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState<string | null>(null);

  // Mes actual por defecto
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(`${now.getFullYear()}-${pad(now.getMonth() + 1)}`);

  // Inyectar estilos de impresión (hoja legal)
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = '@media print { @page { size: legal; margin: 0.7in 0.8in; } body { background: white !important; } }';
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  // ── Cargar datos ───────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [y, m] = currentMonth.split('-').map(Number);
        const lastDay = new Date(y, m, 0).getDate();

        const [studs, recs] = await Promise.all([
          fetchStudentsByClassroom(salonId),
          fetchAttendanceByProfessorAndClassroom(
            salonId, profesorId, areaId,
            `${currentMonth}-01`,
            `${currentMonth}-${pad(lastDay)}`
          ),
        ]);
        if (cancelled) return;
        setStudents(studs);
        setRecords(recs);
      } catch {
        if (!cancelled) setError('Error al cargar datos del informe.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [salonId, profesorId, areaId, currentMonth]);

  // ── Navegar meses ──────────────────────────────
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

  // ── Cálculos ───────────────────────────────────
  const activeDays = records.length;

  let totalP = 0, totalJ = 0, totalU = 0;
  records.forEach((r) => {
    Object.values(r.estudiantes).forEach((e) => {
      if (e.status === 'present')     totalP++;
      if (e.status === 'justified')   totalJ++;
      if (e.status === 'unjustified') totalU++;
    });
  });
  const totalMarks = totalP + totalJ + totalU;
  const globalRate = totalMarks > 0 ? ((totalP / totalMarks) * 100) : 0;

  // Resumen por estudiante (orden alfabético)
  const studentSummaries: StudentSummary[] = students.map((student) => {
    let p = 0, j = 0, u = 0;
    records.forEach((r) => {
      const e = r.estudiantes[student.id];
      if (!e) return;
      if (e.status === 'present')     p++;
      if (e.status === 'justified')   j++;
      if (e.status === 'unjustified') u++;
    });
    const total = p + j + u;
    return { student, present: p, justified: j, unjustified: u, total, rate: total > 0 ? (p / total) * 100 : 0 };
  }).sort((a, b) => `${a.student.name} ${a.student.lastName}`.localeCompare(`${b.student.name} ${b.student.lastName}`));

  // ── Mes label ──────────────────────────────────
  const [y, m] = currentMonth.split('-').map(Number);
  const monthLabel = new Date(y, m - 1, 1).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  const monthLabelCap = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  // Fecha de generación
  const generatedAt = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

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
            <span className="text-sm font-medium">Generando informe…</span>
          </div>
        </div>
      </div>
    );
  }

  // Badge de porcentaje con color según valor
  function RateBadge({ rate }: { rate: number }) {
    const color =
      rate >= 90 ? 'bg-emerald-100 text-emerald-700' :
      rate >= 75 ? 'bg-amber-100 text-amber-700'   :
                   'bg-red-100 text-red-700';
    return (
      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${color}`}>
        {rate.toFixed(0)}%
      </span>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="print:hidden"><SidebarV2 /></div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="print:hidden"><HeaderV2 title="Informe de Asistencia" isSidebarCollapsed={isSidebarCollapsed} /></div>
        <div className="print:hidden h-16 flex-shrink-0" />

        <main className="flex-1 overflow-auto min-h-0 p-4 lg:p-5">

          {/* ── Controls (ocultos en impresión) ── */}
          <div className="print:hidden flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
              >
                <IconArrowBack size={13} /> Volver
              </button>
              <div>
                <h1 className="text-base font-bold text-gray-900">Informe de Asistencia</h1>
                <p className="text-[11px] text-gray-400">Hora {horaDecoded}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50">
                <IconChevronLeft size={14} className="text-gray-500" />
              </button>
              <span className="text-sm font-bold text-gray-700 capitalize w-40 text-center">{monthLabel}</span>
              <button onClick={nextMonth} className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50">
                <IconChevronRight size={14} className="text-gray-500" />
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-all"
              >
                <IconPrinter size={13} /> Imprimir
              </button>
            </div>
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="print:hidden mb-3 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <IconAlertCircle size={16} className="text-red-500 flex-shrink-0" /> {error}
            </div>
          )}

          {/* ══════════════════════════════════════════════
              DOCUMENTO EJECUTIVO
              ══════════════════════════════════════════════ */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden print:shadow-none print:rounded-none print:border-none" style={{ maxWidth: '816px', margin: '0 auto' }}>

            {/* ── Header institucional ── */}
            <div className="px-8 pt-7 pb-4 text-center border-b border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Institución Educativa</p>
              <h1 className="text-[22px] font-black text-gray-900 tracking-tight">Colina Campestre School</h1>
              <div className="mt-2 mx-auto w-12 h-0.5 bg-indigo-500 rounded-full" />
              <p className="mt-2.5 text-[13px] font-bold text-indigo-700">Informe Mensual de Asistencia</p>
              <p className="mt-0.5 text-[11px] text-gray-500">Hora {horaDecoded} · {monthLabelCap}</p>
            </div>

            {/* ── Banda resumen (indigo) ── */}
            <div className="bg-indigo-600 px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-[9px] font-bold text-indigo-200 uppercase tracking-wide">Días registrados</p>
                  <p className="text-[20px] font-black text-white">{activeDays}</p>
                </div>
                <div className="w-px h-8 bg-indigo-400" />
                <div className="text-center">
                  <p className="text-[9px] font-bold text-indigo-200 uppercase tracking-wide">Asistencia global</p>
                  <p className="text-[20px] font-black text-white">{globalRate.toFixed(1)}%</p>
                </div>
                <div className="w-px h-8 bg-indigo-400" />
                <div className="text-center">
                  <p className="text-[9px] font-bold text-indigo-200 uppercase tracking-wide">Estudiantes</p>
                  <p className="text-[20px] font-black text-white">{students.length}</p>
                </div>
              </div>

              {/* Barra segmentada P / J / U */}
              <div className="flex-1 min-w-[160px] max-w-[260px]">
                <div className="flex rounded-full overflow-hidden h-2.5 bg-indigo-800">
                  {totalMarks > 0 && <>
                    <div className="bg-emerald-500 h-full" style={{ width: `${(totalP / totalMarks) * 100}%` }} />
                    <div className="bg-amber-400 h-full" style={{ width: `${(totalJ / totalMarks) * 100}%` }} />
                    <div className="bg-red-500 h-full" style={{ width: `${(totalU / totalMarks) * 100}%` }} />
                  </>}
                </div>
                <div className="mt-1 flex justify-between text-[9px] font-bold text-indigo-200">
                  <span>✓ P {totalP}</span>
                  <span>J {totalJ}</span>
                  <span>✕ U {totalU}</span>
                </div>
              </div>
            </div>

            {/* ── Tabla de estudiantes ── */}
            <div className="px-6 py-5">
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr className="border-b-2 border-indigo-600">
                    <th className="text-left pb-2 text-[10px] font-bold text-gray-500 uppercase tracking-wide w-8">#</th>
                    <th className="text-left pb-2 text-[10px] font-bold text-gray-500 uppercase tracking-wide">Estudiante</th>
                    <th className="text-center pb-2 text-[10px] font-bold text-gray-500 uppercase tracking-wide w-14">P</th>
                    <th className="text-center pb-2 text-[10px] font-bold text-gray-500 uppercase tracking-wide w-14">J</th>
                    <th className="text-center pb-2 text-[10px] font-bold text-gray-500 uppercase tracking-wide w-14">U</th>
                    <th className="text-center pb-2 text-[10px] font-bold text-gray-500 uppercase tracking-wide w-16">Total</th>
                    <th className="text-center pb-2 text-[10px] font-bold text-gray-500 uppercase tracking-wide w-16">Asist.</th>
                    <th className="text-center pb-2 text-[10px] font-bold text-gray-500 uppercase tracking-wide w-12">⚠</th>
                  </tr>
                </thead>
                <tbody>
                  {studentSummaries.map((s, idx) => (
                    <tr key={s.student.id} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="py-2 text-gray-400 font-semibold">{idx + 1}</td>
                      <td className="py-2">
                        <div className="font-semibold text-gray-800">{s.student.name} {s.student.lastName}</div>
                        <div className="text-[9px] text-gray-400">{s.student.document}</div>
                      </td>
                      <td className="text-center font-bold text-gray-700">{s.present}</td>
                      <td className="text-center font-bold text-gray-700">{s.justified}</td>
                      <td className="text-center font-bold text-gray-700">{s.unjustified}</td>
                      <td className="text-center font-semibold text-gray-600">{s.total}</td>
                      <td className="text-center"><RateBadge rate={s.rate} /></td>
                      <td className="text-center">{s.unjustified >= 3 && <span className="text-amber-500 font-bold">⚠</span>}</td>
                    </tr>
                  ))}
                  {studentSummaries.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-[11px] text-gray-400">No hay datos de asistencia en este mes.</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Fila totales */}
              <div className="mt-0 border-t-2 border-indigo-600 bg-indigo-50 rounded-b-lg">
                <div className="flex items-center px-2 py-2.5 text-[11px] font-bold text-indigo-800">
                  <span className="flex-1">TOTALES</span>
                  <span className="w-8 text-center">{students.length}</span>
                  <span className="w-14 text-center">{totalP}</span>
                  <span className="w-14 text-center">{totalJ}</span>
                  <span className="w-14 text-center">{totalU}</span>
                  <span className="w-16 text-center text-indigo-700">{totalMarks}</span>
                  <span className="w-16 text-center text-indigo-700">{globalRate.toFixed(1)}%</span>
                  <span className="w-12" />
                </div>
              </div>
            </div>

            {/* ── Firmas ── */}
            <div className="px-8 pb-6 pt-2">
              <div className="grid grid-cols-3 gap-8 mt-8">
                {['Docente', 'Coordinador', 'Fecha'].map((label) => (
                  <div key={label} className="text-center">
                    <div className="border-b border-gray-400 h-8 mb-1.5" />
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="px-8 py-3 bg-gray-50 border-t border-gray-100 text-center">
              <p className="text-[9px] text-gray-400">
                Informe generado el {generatedAt} · Hora {horaDecoded} · {monthLabelCap} · Sistema Cubbico
              </p>
            </div>
          </div>

          {/* Espaciador inferior en pantalla */}
          <div className="print:hidden h-6" />
        </main>
      </div>
    </div>
  );
}
