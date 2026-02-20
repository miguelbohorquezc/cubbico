/**
 * @fileoverview Reporte consolidado mensual de asistencias de todo el salón
 * @module presentation/features/attendance/AttendanceConsolidatedReport
 *
 * Documento ejecutivo que consolida la asistencia mensual de todos los estudiantes
 * en todas las asignaturas del salón.
 * Diseñado para impresión en hoja legal (8.5 × 14 in).
 *
 * Ruta: /private/dashboard/asistencia/consolidado/:salonId/:mes
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SidebarV2 } from '../../components/sidebarV2';
import { HeaderV2 } from '../../components/headerV2';
import { fetchAttendanceByClassroom } from '../../../infrastructure/attendance.service';
import { fetchStudentsByClassroom } from '../../../infrastructure/student.service';
import { fetchAreas } from '../../../infrastructure/area.service';
import { usePrintSetup, PrintControls } from '../../components/PrintableReport';
import logo from '../../../assets/logo/logotipo.jpg';
import type { AttendanceRecord } from '../../../domain/entities/attendance';
import type { studentInfo } from '../../../domain/entities/studentInfo';
import type { AreaIhsInfo } from '../../../domain/entities/area';
import {
  IconLoader,
  IconAlertCircle,
  IconArrowBack,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';

// ============================================
// Tipos
// ============================================

interface RouteParams {
  salonId: string;
  mes?: string;
}

interface StudentAttendanceByArea {
  areaId: string;
  areaNombre: string;
  present: number;
  justified: number;
  unjustified: number;
  total: number;
  rate: number;
}

interface StudentConsolidated {
  student: studentInfo;
  byArea: StudentAttendanceByArea[];
  totalPresent: number;
  totalJustified: number;
  totalUnjustified: number;
  totalRecords: number;
  globalRate: number;
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

export default function AttendanceConsolidatedReport() {
  const params = useParams() as unknown as RouteParams;
  const { salonId } = params;
  const navigate = useNavigate();
  const isSidebarCollapsed = useSidebarCollapsed();
  const { paperSize, setPaperSize, handlePrint } = usePrintSetup();

  const [students, setStudents] = useState<studentInfo[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [areas, setAreas] = useState<AreaIhsInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mes actual por defecto
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    params.mes || `${now.getFullYear()}-${pad(now.getMonth() + 1)}`
  );

  // ── Cargar datos ───────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [y, m] = currentMonth.split('-').map(Number);
        const lastDay = new Date(y, m, 0).getDate();

        const [studs, recs, areasData] = await Promise.all([
          fetchStudentsByClassroom(salonId),
          fetchAttendanceByClassroom(
            salonId,
            `${currentMonth}-01`,
            `${currentMonth}-${pad(lastDay)}`
          ),
          fetchAreas(),
        ]);
        if (cancelled) return;
        setStudents(studs.filter(s => s.status === 'activo'));
        setRecords(recs);
        setAreas(areasData);
      } catch {
        if (!cancelled) setError('Error al cargar datos del informe consolidado.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [salonId, currentMonth]);

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

  // ── Cálculos consolidados ──────────────────────
  const consolidated: StudentConsolidated[] = students.map((student) => {
    const areaMap = new Map<string, { present: number; justified: number; unjustified: number; total: number }>();

    // Procesar todos los registros de asistencia para este estudiante
    records.forEach((rec) => {
      const studentAttendance = rec.estudiantes[student.id];
      if (!studentAttendance) return;

      if (!areaMap.has(rec.areaId)) {
        areaMap.set(rec.areaId, { present: 0, justified: 0, unjustified: 0, total: 0 });
      }

      const areaStats = areaMap.get(rec.areaId)!;
      areaStats.total++;

      if (studentAttendance.status === 'present') areaStats.present++;
      else if (studentAttendance.status === 'justified') areaStats.justified++;
      else if (studentAttendance.status === 'unjustified') areaStats.unjustified++;
    });

    // Convertir a array con nombres de áreas
    const byArea: StudentAttendanceByArea[] = Array.from(areaMap.entries()).map(([areaId, stats]) => {
      const area = areas.find(a => a.id === areaId);
      return {
        areaId,
        areaNombre: area?.asignatura || 'Área desconocida',
        present: stats.present,
        justified: stats.justified,
        unjustified: stats.unjustified,
        total: stats.total,
        rate: stats.total > 0 ? (stats.present / stats.total) * 100 : 0,
      };
    }).sort((a, b) => a.areaNombre.localeCompare(b.areaNombre));

    // Totales generales del estudiante
    const totalPresent = byArea.reduce((sum, a) => sum + a.present, 0);
    const totalJustified = byArea.reduce((sum, a) => sum + a.justified, 0);
    const totalUnjustified = byArea.reduce((sum, a) => sum + a.unjustified, 0);
    const totalRecords = totalPresent + totalJustified + totalUnjustified;
    const globalRate = totalRecords > 0 ? (totalPresent / totalRecords) * 100 : 0;

    return {
      student,
      byArea,
      totalPresent,
      totalJustified,
      totalUnjustified,
      totalRecords,
      globalRate,
    };
  });

  // ── Formato de fecha ───────────────────────────
  const [y, m] = currentMonth.split('-').map(Number);
  const monthDate = new Date(y, m - 1, 1);
  const monthLabel = monthDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  const monthLabelCap = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
  const generatedAt = new Date().toLocaleString('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  // ── Render ─────────────────────────────────────
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden print:h-auto print:overflow-visible print:bg-white">
      <div className="print:hidden"><SidebarV2 /></div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="print:hidden"><HeaderV2 title="Reporte Consolidado de Asistencias" isSidebarCollapsed={isSidebarCollapsed} /></div>
        <div className="print:hidden h-16 flex-shrink-0" />

        <main className="flex-1 overflow-auto min-h-0 p-4 lg:p-5 print:overflow-visible">

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
                <h1 className="text-base font-bold text-gray-900">Reporte Consolidado de Asistencias</h1>
                <p className="text-[11px] text-gray-400">Todas las asignaturas del salón</p>
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
              <PrintControls paperSize={paperSize} onPaperSizeChange={setPaperSize} onPrint={handlePrint} />
            </div>
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="print:hidden mb-3 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <IconAlertCircle size={16} className="text-red-500 flex-shrink-0" /> {error}
            </div>
          )}

          {/* ══════════════════════════════════════════════
              DOCUMENTO EJECUTIVO
              ══════════════════════════════════════════════ */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden print:shadow-none print:rounded-none print:border-none" style={{ maxWidth: '816px', margin: '0 auto' }}>
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-32">
                <IconLoader className="w-12 h-12 text-orchid-blue-60 animate-spin mb-4" />
                <p className="text-sm text-gray-500">Cargando informe consolidado...</p>
              </div>
            )}

            {!isLoading && !error && (
              <>
                {/* ── Header institucional ── */}
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="h-28">
                      <td className="w-24 p-2 border border-gray-100 align-middle">
                        <img src={logo} alt="logotipo" className="w-16 mx-auto" />
                      </td>
                      <td className="px-6 py-3 border border-gray-100 text-center" colSpan={2}>
                        <b className="text-base font-bold text-gray-900">COLINA CAMPESTRE SCHOOL</b>
                        <p className="text-[10pt] text-gray-600 mt-1 leading-relaxed">
                          De Sincelejo, Sucre, con reconocimiento oficial en los niveles de Preescolar, Básica Primaria y Básica Secundaria
                          por parte de Secretaria de Educación Municipal, según resolución No 2747 del 12 de diciembre de 2023.
                          Carrera 34 No 38-158, teléfonos: 2771068-3006781806
                        </p>
                        <p className="text-[10pt] text-gray-700 font-semibold">NIT: 901731191-3</p>
                      </td>
                      <td className="w-28 px-3 py-2 border border-gray-100 text-center text-xs text-gray-600 align-middle">
                        DANE 370001038852
                      </td>
                    </tr>
                  </thead>
                </table>

                {/* ── Título del reporte ── */}
                <h2 className="text-center my-4">
                  <span className="text-lg font-bold text-gray-800">
                    {`REPORTE CONSOLIDADO DE ASISTENCIAS - ${monthLabelCap.toUpperCase()}`}
                  </span>
                </h2>

                {/* ── Contenido del reporte ── */}
                <div className="px-8 py-4">
                  <div className="space-y-5">
                    {consolidated.map((item, idx) => (
                      <div key={item.student.id} className="border-b border-gray-100 pb-6 last:border-0">
                        {/* Nombre del estudiante */}
                        <div className="flex items-baseline justify-between mb-3">
                          <h3 className="text-base font-semibold text-gray-900">
                            {idx + 1}. {item.student.name} {item.student.lastName}
                          </h3>
                          <div className="text-sm">
                            <span className="text-gray-500">Asistencia general: </span>
                            <span className={`font-semibold ${
                              item.globalRate >= 85 ? 'text-green-600' :
                              item.globalRate >= 70 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {item.globalRate.toFixed(1)}%
                            </span>
                          </div>
                        </div>

                        {/* Tabla de asignaturas */}
                        {item.byArea.length > 0 ? (
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="px-3 py-2 text-left font-semibold text-gray-700">Asignatura</th>
                                <th className="px-3 py-2 text-center font-semibold text-gray-700">Presente</th>
                                <th className="px-3 py-2 text-center font-semibold text-gray-700">Justificada</th>
                                <th className="px-3 py-2 text-center font-semibold text-gray-700">Injustificada</th>
                                <th className="px-3 py-2 text-center font-semibold text-gray-700">Total</th>
                                <th className="px-3 py-2 text-center font-semibold text-gray-700">%</th>
                              </tr>
                            </thead>
                            <tbody>
                              {item.byArea.map((area) => (
                                <tr key={area.areaId} className="border-t border-gray-100">
                                  <td className="px-3 py-2 text-gray-700">{area.areaNombre}</td>
                                  <td className="px-3 py-2 text-center text-green-600 font-medium">{area.present}</td>
                                  <td className="px-3 py-2 text-center text-yellow-600">{area.justified}</td>
                                  <td className="px-3 py-2 text-center text-red-600">{area.unjustified}</td>
                                  <td className="px-3 py-2 text-center text-gray-700 font-medium">{area.total}</td>
                                  <td className="px-3 py-2 text-center">
                                    <span className={`font-semibold ${
                                      area.rate >= 85 ? 'text-green-600' :
                                      area.rate >= 70 ? 'text-yellow-600' :
                                      'text-red-600'
                                    }`}>
                                      {area.rate.toFixed(0)}%
                                    </span>
                                  </td>
                                </tr>
                              ))}
                              {/* Fila de totales */}
                              <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                                <td className="px-3 py-2 text-gray-900">TOTAL</td>
                                <td className="px-3 py-2 text-center text-green-600">{item.totalPresent}</td>
                                <td className="px-3 py-2 text-center text-yellow-600">{item.totalJustified}</td>
                                <td className="px-3 py-2 text-center text-red-600">{item.totalUnjustified}</td>
                                <td className="px-3 py-2 text-center text-gray-900">{item.totalRecords}</td>
                                <td className="px-3 py-2 text-center">
                                  <span className={`${
                                    item.globalRate >= 85 ? 'text-green-600' :
                                    item.globalRate >= 70 ? 'text-yellow-600' :
                                    'text-red-600'
                                  }`}>
                                    {item.globalRate.toFixed(0)}%
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        ) : (
                          <p className="text-xs text-gray-400 italic">Sin registros de asistencia en este periodo</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Footer ── */}
                <div className="px-8 py-3 bg-gray-50 print:bg-white border-t border-gray-100 text-center">
                  <p className="text-[9px] text-gray-400">
                    Informe generado el {generatedAt} · {monthLabelCap} · SIA Colina Campestre
                  </p>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
