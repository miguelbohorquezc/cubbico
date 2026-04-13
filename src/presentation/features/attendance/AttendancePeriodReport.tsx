/**
 * @fileoverview Informe consolidado de asistencia de un salón por período completo
 * @module presentation/features/attendance/AttendancePeriodReport
 *
 * Muestra en una sola tabla todas las fallas del período (injustificadas y justificadas)
 * por estudiante y por asignatura. Diseñado para impresión en una página.
 *
 * Ruta: /private/dashboard/asistencia-periodo/:salonId/:periodId/:year
 * Acceso: Coordinador (y Docente para su propio salón)
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebase';
import { SidebarV2 } from '../../components/sidebarV2';
import { HeaderV2 } from '../../components/headerV2';
import { fetchAttendanceByClassroom } from '../../../infrastructure/attendance.service';
import { fetchActiveStudentsByClassroom } from '../../../infrastructure/student.service';
import { fetchPeriodConfigsByYear } from '../../../infrastructure/periodConfig.service';
import { fetchFlexibleSchedule } from '../../../infrastructure/schedule.service';
import type { AttendanceRecord } from '../../../domain/entities/attendance';
import type { studentInfo } from '../../../domain/entities/studentInfo';
import type { PeriodConfig } from '../../../domain/entities/periodConfig';
import { PrivateRoutes } from '../../../app/routes/routes';
import {
  IconLoader,
  IconAlertCircle,
  IconArrowBack,
  IconPrinter,
  IconClipboardList,
} from '@tabler/icons-react';

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
// Tipos
// ============================================

interface AreaSummary {
  areaId: string;
  areaNombre: string;
  unjustified: number;
  justified: number;
  sessions: number; // total sesiones registradas
}

interface StudentRow {
  student: studentInfo;
  byArea: Record<string, AreaSummary>;
  totalUnj: number;
  totalJust: number;
}

// ============================================
// Componente
// ============================================

export default function AttendancePeriodReport() {
  const params = useParams<{ salonId: string; periodId: string; year: string }>();
  const { salonId = '', periodId = '', year = '' } = params;
  const navigate = useNavigate();
  const isSidebarCollapsed = useSidebarCollapsed();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [classroomName, setClassroomName] = useState('');
  const [periodConfig, setPeriodConfig] = useState<PeriodConfig | null>(null);
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [areas, setAreas] = useState<{ id: string; nombre: string }[]>([]);

  useEffect(() => {
    if (!salonId || !periodId || !year) return;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        // Cargar datos en paralelo
        const [classroomSnap, configs, students, schedule] = await Promise.all([
          getDoc(doc(db, 'classRooms', salonId)),
          fetchPeriodConfigsByYear(year),
          fetchActiveStudentsByClassroom(salonId),
          fetchFlexibleSchedule(year),
        ]);

        if (cancelled) return;

        const classroomData = classroomSnap.exists() ? classroomSnap.data() : null;
        setClassroomName(classroomData?.nombreSalon || 'Salón');

        const config = configs.find(c => c.periodId === periodId);
        if (!config?.fechaInicio || !config?.fechaFin) {
          setError(`El período ${periodId} no tiene fechas configuradas.`);
          return;
        }
        setPeriodConfig(config);

        // Obtener áreas únicas que se dictan en este salón (del horario)
        const classActivities = schedule.activities.filter(a => a.classroomId === salonId);
        const areaMap = new Map<string, string>();
        classActivities.forEach(a => {
          if (!areaMap.has(a.courseId)) {
            areaMap.set(a.courseId, a.courseName);
          }
        });
        const areaList = Array.from(areaMap.entries())
          .map(([id, nombre]) => ({ id, nombre }))
          .sort((a, b) => a.nombre.localeCompare(b.nombre));
        setAreas(areaList);

        // Cargar registros de asistencia del período
        const records: AttendanceRecord[] = await fetchAttendanceByClassroom(
          salonId,
          config.fechaInicio,
          config.fechaFin
        );

        if (cancelled) return;

        // Construir filas por estudiante
        const studentRows: StudentRow[] = students.map(student => {
          const byArea: Record<string, AreaSummary> = {};

          // Inicializar con todas las áreas
          areaList.forEach(area => {
            byArea[area.id] = {
              areaId: area.id,
              areaNombre: area.nombre,
              unjustified: 0,
              justified: 0,
              sessions: 0,
            };
          });

          // Contar por área
          records.forEach(record => {
            const entry = record.estudiantes[student.id];
            if (!entry) return;

            if (!byArea[record.areaId]) {
              byArea[record.areaId] = {
                areaId: record.areaId,
                areaNombre: areaMap.get(record.areaId) || record.areaId,
                unjustified: 0,
                justified: 0,
                sessions: 0,
              };
            }

            byArea[record.areaId].sessions++;
            if (entry.status === 'unjustified') byArea[record.areaId].unjustified++;
            if (entry.status === 'justified') byArea[record.areaId].justified++;
          });

          const totalUnj = Object.values(byArea).reduce((s, a) => s + a.unjustified, 0);
          const totalJust = Object.values(byArea).reduce((s, a) => s + a.justified, 0);

          return { student, byArea, totalUnj, totalJust };
        });

        // Ordenar: más fallas primero, luego por apellido
        studentRows.sort((a, b) => {
          const diffUnj = b.totalUnj - a.totalUnj;
          if (diffUnj !== 0) return diffUnj;
          return a.student.lastName.localeCompare(b.student.lastName);
        });

        setRows(studentRows);
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Error al cargar datos.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [salonId, periodId, year]);

  // ── Navegación de vuelta ────────────────────────────
  function goBack() {
    navigate(`/${PrivateRoutes.PRIVATE}/${PrivateRoutes.DASHBOARD}/${PrivateRoutes.ASISTENCIA}/overview`);
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden print:h-auto print:overflow-visible">
      <div className="print:hidden">
        <SidebarV2 />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="print:hidden">
          <HeaderV2
            title={`Informe Período ${periodId} — ${classroomName}`}
            isSidebarCollapsed={isSidebarCollapsed}
          />
          <div className="h-16 flex-shrink-0" />
        </div>

        <main className="flex-1 p-4 lg:p-6 overflow-auto min-h-0 print:p-0 print:overflow-visible">

          {/* ── Barra superior (no se imprime) ── */}
          <div className="print:hidden flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <button
                onClick={goBack}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
              >
                <IconArrowBack size={13} /> Volver
              </button>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-orchid-blue-60 rounded-lg flex items-center justify-center flex-shrink-0">
                  <IconClipboardList size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-gray-900">
                    Fallas — Período {periodId} · {classroomName}
                  </h1>
                  {periodConfig && (
                    <p className="text-[11px] text-gray-500">
                      {periodConfig.fechaInicio} — {periodConfig.fechaFin} · Año {year}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-orchid-blue-60 rounded-lg hover:bg-orchid-blue-70 transition-all shadow-sm"
            >
              <IconPrinter size={15} /> Imprimir
            </button>
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <IconAlertCircle size={15} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* ── Loading ── */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <IconLoader size={20} className="animate-spin text-gray-400 mr-2" />
              <span className="text-sm text-gray-500">Cargando informe…</span>
            </div>
          )}

          {/* ── Tabla de informe ── */}
          {!isLoading && !error && rows.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden print:shadow-none print:border-none print:rounded-none">

              {/* Encabezado de impresión */}
              <div className="hidden print:block px-6 pt-6 pb-4 border-b border-gray-200">
                <h1 className="text-lg font-bold text-gray-900">
                  Reporte de Asistencia — Período {periodId}
                </h1>
                <p className="text-sm text-gray-600">{classroomName} · Año {year}</p>
                {periodConfig && (
                  <p className="text-xs text-gray-400 mt-1">
                    {periodConfig.fechaInicio} al {periodConfig.fechaFin}
                  </p>
                )}
              </div>

              <div className="overflow-auto print:overflow-visible">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 print:bg-gray-100">
                      {/* Columna estudiante */}
                      <th className="sticky left-0 z-10 bg-gray-50 print:bg-gray-100 text-left px-3 py-2.5 font-bold text-gray-600 border-b border-gray-200 border-r border-gray-200 min-w-[180px]">
                        Estudiante
                      </th>
                      {/* Columnas de área */}
                      {areas.map(area => (
                        <th
                          key={area.id}
                          className="px-2 py-2.5 text-center font-bold text-gray-500 border-b border-gray-200 border-r border-gray-100"
                          style={{ minWidth: '80px' }}
                        >
                          <div className="truncate max-w-[90px]" title={area.nombre}>
                            {area.nombre}
                          </div>
                          <div className="text-[9px] font-normal text-gray-400 mt-0.5">
                            FI / FJ
                          </div>
                        </th>
                      ))}
                      {/* Columna totales */}
                      <th className="px-2 py-2.5 text-center font-bold text-gray-700 border-b border-gray-200 border-l-2 border-l-gray-300">
                        Total
                        <div className="text-[9px] font-normal text-gray-400 mt-0.5">FI / FJ</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr
                        key={row.student.id}
                        className={`hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                      >
                        {/* Nombre */}
                        <td className="sticky left-0 z-10 bg-inherit px-3 py-2 border-b border-gray-100 border-r border-gray-200 font-medium text-gray-700">
                          <div className="truncate max-w-[175px]" title={`${row.student.lastName} ${row.student.name}`}>
                            {row.student.lastName}, {row.student.name}
                          </div>
                        </td>
                        {/* Por área */}
                        {areas.map(area => {
                          const s = row.byArea[area.id];
                          const hasAbsences = s && (s.unjustified > 0 || s.justified > 0);
                          return (
                            <td key={area.id} className="px-2 py-2 text-center border-b border-gray-100 border-r border-gray-50">
                              {hasAbsences ? (
                                <div className="flex items-center justify-center gap-1 font-semibold">
                                  <span className={s.unjustified > 0 ? 'text-red-600' : 'text-gray-300'}>
                                    {s.unjustified}
                                  </span>
                                  <span className="text-gray-300">/</span>
                                  <span className={s.justified > 0 ? 'text-amber-600' : 'text-gray-300'}>
                                    {s.justified}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-200">—</span>
                              )}
                            </td>
                          );
                        })}
                        {/* Totales */}
                        <td className="px-3 py-2 text-center border-b border-gray-100 border-l-2 border-l-gray-300 font-bold">
                          <div className="flex items-center justify-center gap-1">
                            <span className={row.totalUnj > 0 ? 'text-red-600' : 'text-gray-300'}>
                              {row.totalUnj}
                            </span>
                            <span className="text-gray-300">/</span>
                            <span className={row.totalJust > 0 ? 'text-amber-600' : 'text-gray-300'}>
                              {row.totalJust}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Leyenda */}
              <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 print:bg-white flex items-center gap-4 text-[10px] text-gray-500">
                <span className="font-semibold">FI</span> = Faltas Injustificadas
                <span className="font-semibold">FJ</span> = Faltas Justificadas
                <span className="ml-4 text-gray-400">· Total estudiantes: {rows.length}</span>
              </div>
            </div>
          )}

          {/* ── Sin datos ── */}
          {!isLoading && !error && rows.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-10 text-center">
              <IconClipboardList size={36} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-gray-700">Sin registros de asistencia</p>
              <p className="text-xs text-gray-400 mt-1">
                No hay datos de asistencia para el período {periodId} en este salón.
              </p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
