import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../../infrastructure/firebase/firebase';
import { SidebarV2 } from '../../../../components/sidebarV2';
import { HeaderV2 } from '../../../../components/headerV2';
import { useStudents } from '../../../../components/datatable/useStudents';
import { IconClockRecord, IconArrowLeft, IconUser, IconChevronRight, IconFileText, IconAward, IconX } from '@tabler/icons-react';
import { FinalReportContent } from './FinalReport';
import { usePrintSetup, PrintControls } from '../../../../components/PrintableReport';

// ─── Sincronización con estado del sidebar ───────────────────────────────

const SIDEBAR_STORAGE_KEY = 'cubbico-sidebar-collapsed';

const useSidebarCollapsed = (): boolean => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleChange = () => {
      try {
        setIsCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true');
      } catch {
        // ignorar
      }
    };
    const interval = setInterval(handleChange, 100);
    return () => clearInterval(interval);
  }, []);

  return isCollapsed;
};

// ─── Tipos ────────────────────────────────────────────────────────────────

interface YearRecord {
  year: string;
  nivel: string;
  nombreGrado: string;
  directorGrupo: string;
  periodsAvailable: string[];
  classroomId?: string;
}

// ─── Hook: useStudentHistory ──────────────────────────────────────────────
// Carga el documento history/{studentId} y extrae años disponibles,
// períodos por año y metadatos del salón (nivel, director de grupo).
// Los informes no se tocan: solo se leen los datos para construir enlaces.

function useStudentHistory(studentId: string | null) {
  const [years, setYears] = useState<YearRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) {
      setYears([]);
      return;
    }

    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener datos actuales del estudiante para usar su nivel/salón correcto
        const studentSnap = await getDoc(doc(db, 'student', studentId));
        let currentStudentData = null;
        if (studentSnap.exists()) {
          currentStudentData = studentSnap.data();
        }

        const historySnap = await getDoc(doc(db, 'history', studentId));
        if (!historySnap.exists()) {
          if (alive) setYears([]);
          return;
        }

        const yearsData = historySnap.data()?.years || {};
        const records: YearRecord[] = [];

        for (const [year, yearObj] of Object.entries<Record<string, unknown>>(yearsData)) {
          const periods = (yearObj as Record<string, unknown>)?.periods as Record<string, unknown> || {};
          const periodsAvailable = Object.keys(periods).sort((a, b) => Number(a) - Number(b));

          if (periodsAvailable.length === 0) continue;

          // Extraer metadata del primer área disponible
          let nivel = 'primaria';
          let nombreGrado = '';
          let directorGrupo = '';
          let classroomId = '';
          let metadataFound = false;

          // Intentar obtener metadatos históricos guardados
          for (const pKey of periodsAvailable) {
            const areas = (periods[pKey] as Record<string, unknown>)?.areas as Record<string, unknown> || {};
            for (const aKey of Object.keys(areas)) {
              const areaData = areas[aKey] as Record<string, unknown>;
              const meta = areaData?.metadata as Record<string, unknown>;

              if (meta) {
                // Guardar classroomId para fallback
                const cid = meta?.classroomId;
                if (typeof cid === 'string' && cid) {
                  classroomId = cid;
                }

                // Intentar leer metadatos históricos (guardados desde Tarea #4)
                const nivelMeta = meta?.nivel;
                const nombreGradoMeta = meta?.nombreGrado;
                const nombreDirectorMeta = meta?.nombreDirector;

                if (typeof nivelMeta === 'string' && nivelMeta) {
                  nivel = nivelMeta;
                  metadataFound = true;
                }

                if (typeof nombreGradoMeta === 'string' && nombreGradoMeta) {
                  nombreGrado = nombreGradoMeta;
                  metadataFound = true;
                }

                if (typeof nombreDirectorMeta === 'string' && nombreDirectorMeta) {
                  directorGrupo = nombreDirectorMeta;
                  metadataFound = true;
                }

                if (metadataFound) break;
              }
            }
            if (metadataFound) break;
          }

          // Fallback: si no hay metadatos históricos, consultar el salón actual (compatibilidad con datos antiguos)
          if (!metadataFound && classroomId) {
            try {
              const crSnap = await getDoc(doc(db, 'classRooms', classroomId));
              if (crSnap.exists()) {
                const cr = crSnap.data();
                nivel = cr?.nivel || 'primaria';
                nombreGrado = cr?.nombreSalon || 'Sin especificar';
                const directorUid = cr?.directorGrupo || '';

                // Consultar nombre del director si existe UID
                if (directorUid) {
                  try {
                    const userSnap = await getDoc(doc(db, 'users', directorUid));
                    if (userSnap.exists()) {
                      const userData = userSnap.data();
                      directorGrupo = userData?.displayName || userData?.email || directorUid;
                    } else {
                      directorGrupo = directorUid;
                    }
                  } catch {
                    directorGrupo = directorUid;
                  }
                } else {
                  directorGrupo = '';
                }
              }
            } catch {
              // usar defaults si el salón no se encuentra
            }
          }

          records.push({ year, nivel, nombreGrado, directorGrupo, periodsAvailable, classroomId });
        }

        // Años más recientes primero
        records.sort((a, b) => Number(b.year) - Number(a.year));

        if (!alive) return;
        setYears(records);
      } catch (e: unknown) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : 'Error cargando historial');
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [studentId]);

  return { years, loading, error };
}

// ─── Componente principal ─────────────────────────────────────────────────

function History() {
  const isSidebarCollapsed = useSidebarCollapsed();
  const { students, loading: studentsLoading } = useStudents();
  const [selected, setSelected] = useState<{ id: string; name: string; lastName: string } | null>(null);
  const [search, setSearch] = useState('');

  const { years, loading: historyLoading, error: historyError } = useStudentHistory(selected?.id || null);
  const [expandedYear, setExpandedYear] = React.useState<string | null>(null);
  const { paperSize, setPaperSize, handlePrint } = usePrintSetup();

  const filtered = useMemo(() => {
    if (!search) return students;
    const q = search.toLowerCase();
    return students.filter((s: { name: string; lastName: string; className?: string }) =>
      `${s.name} ${s.lastName}`.toLowerCase().includes(q) ||
      (s.className || '').toLowerCase().includes(q)
    );
  }, [students, search]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <SidebarV2 />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <HeaderV2
          title="Historial Académico"
          isSidebarCollapsed={isSidebarCollapsed}
          showSearch={false}
        />

        {/* Spacer para el header fixed */}
        <div className="h-16 flex-shrink-0" />

        {/* Body */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto min-h-0">

          {/* ── Vista: lista de estudiantes ─────────────────────────────── */}
          {!selected && (
            <>
              {/* Page Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-orchid-blue-60 rounded-lg flex-shrink-0">
                  <IconClockRecord size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Historial Académico</h1>
                  <p className="text-xs text-gray-500">
                    Selecciona un estudiante para ver su historial y acceder a sus informes
                  </p>
                </div>
              </div>

              {/* Card con búsqueda y tabla */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100/80 p-4 lg:p-6">
                <input
                  type="text"
                  placeholder="Buscar estudiante o salón..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full mb-4 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orchid-blue-30 focus:border-orchid-blue-60 transition-all"
                />

                {studentsLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="w-10 h-10 border-4 border-orchid-blue-60 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-lg border border-gray-100">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estudiante</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Grado</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Salón</th>
                          <th className="w-8"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filtered.map((student: { id: string; name: string; lastName: string; classRoom?: string; className?: string }, idx: number) => (
                          <tr
                            key={student.id}
                            onClick={() => setSelected({ id: student.id, name: student.name, lastName: student.lastName })}
                            className={`cursor-pointer group hover:bg-tosca-ds/10 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-tosca-ds/10 flex items-center justify-center group-hover:bg-tosca-ds/20 transition-colors">
                                  <IconUser size={15} className="text-tosca-cc" />
                                </div>
                                <span className="text-sm font-medium text-gray-800">
                                  {student.name} {student.lastName}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">{student.classRoom}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{student.className}</td>
                            <td className="px-4 py-3 text-right">
                              <IconChevronRight size={16} className="text-gray-300 group-hover:text-tosca-cc transition-colors ml-auto" />
                            </td>
                          </tr>
                        ))}
                        {filtered.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-400">
                              No se encontraron estudiantes
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Vista: historial del estudiante (Timeline) ───────────────── */}
          {selected && (
            <>
              {/* Page Header con back button */}
              <div className="flex items-center gap-4 mb-8">
                <button
                  onClick={() => { setSelected(null); setSearch(''); }}
                  className="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-lg hover:bg-tosca-ds/10 hover:border-tosca-ds/30 transition-colors flex-shrink-0"
                  title="Volver a lista"
                >
                  <IconArrowLeft size={18} className="text-gray-600" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-tosca-ds/10 flex items-center justify-center flex-shrink-0">
                    <IconUser size={20} className="text-tosca-cc" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      {selected.name} {selected.lastName}
                    </h1>
                    <p className="text-xs text-gray-500">Historial académico</p>
                  </div>
                </div>
              </div>

              {/* Estado de carga */}
              {historyLoading && (
                <div className="flex items-center justify-center h-48">
                  <div className="w-10 h-10 border-4 border-tosca-ds border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              {/* Estado de error */}
              {historyError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
                  {historyError}
                </div>
              )}

              {/* Sin datos */}
              {!historyLoading && !historyError && years.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100/80 p-10 text-center">
                  <IconClockRecord size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-400 text-sm">
                    No se encontró historial académico para este estudiante
                  </p>
                </div>
              )}

              {/* ── Timeline ─────────────────────────────────────────────── */}
              {!historyLoading && !historyError && years.length > 0 && (
                <div>
                  {years.map((yr, index) => {
                    const isLast = index === years.length - 1;
                    return (
                      <div key={yr.year} className="flex gap-4">

                        {/* Columna izquierda: nodo + línea */}
                        <div className="flex flex-col items-center flex-shrink-0 w-10">
                          {/* Nodo del año */}
                          <div className="w-10 h-10 rounded-full bg-tosca-ds flex items-center justify-center shadow-md ring-4 ring-tosca-ds/15 z-10 flex-shrink-0">
                            <span className="text-white text-sm font-extrabold leading-none">
                              {yr.year.slice(-2)}
                            </span>
                          </div>
                          {/* Línea vertical hacia el siguiente nodo */}
                          {!isLast && (
                            <div className="w-0.5 flex-1 mt-1 bg-gradient-to-b from-tosca-ds/40 via-tosca-ds/20 to-tosca-ds/5 min-h-8" />
                          )}
                        </div>

                        {/* Columna derecha: card del año */}
                        <div className={`flex-1 ${isLast ? 'pb-2' : 'pb-8'}`}>
                          <div className="bg-white rounded-xl shadow-sm border border-gray-100/80 overflow-hidden">

                            {/* Header del año */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                              <div>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-base font-bold text-gray-900">{yr.year}</span>
                                  {yr.nombreGrado && (
                                    <span className="text-sm font-semibold text-tosca-cc">
                                      {yr.nombreGrado}
                                    </span>
                                  )}
                                </div>
                                {yr.directorGrupo && (
                                  <span className="text-xs text-gray-400">
                                    Dir. de grupo: {yr.directorGrupo}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => setExpandedYear(expandedYear === yr.year ? null : yr.year)}
                                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm ${
                                  expandedYear === yr.year
                                    ? 'text-white bg-tosca-cc hover:bg-tosca-ds'
                                    : 'text-white bg-orchid-blue-60 hover:bg-orchid-blue-70'
                                }`}
                              >
                                <IconAward size={14} />
                                {expandedYear === yr.year ? 'Cerrar' : 'Informe Final'}
                              </button>
                            </div>

                            {/* Períodos como pills horizontales */}
                            <div className="px-5 py-4">
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                Informes de período
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {yr.periodsAvailable.map(pId => {
                                  const reportLink = yr.nivel === 'preescolar'
                                    ? `/private/dashboard/print/${pId}/${yr.classroomId || 'sin-classroom'}/${selected.id}/${yr.year}`
                                    : `/private/dashboard/informe/${yr.nivel}/${pId}/${selected.id}/${yr.year}`;

                                  return (
                                    <Link
                                      key={pId}
                                      to={reportLink}
                                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-orchid-blue-30 bg-orchid-blue-5 hover:bg-orchid-blue-10 hover:border-orchid-blue-40 transition-colors group"
                                    >
                                      <span className="w-5 h-5 rounded-full bg-orchid-blue-60 text-white text-[10px] font-extrabold flex items-center justify-center flex-shrink-0">
                                        {pId}
                                      </span>
                                      <span className="text-sm font-medium text-orchid-blue-60">
                                        Período {pId}
                                      </span>
                                      <IconFileText size={13} className="text-orchid-blue-30 group-hover:text-orchid-blue-60 transition-colors" />
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>

                          </div>
                        </div>

                        {/* ── Preview del Informe Final ─────────────────── */}
                        {expandedYear === yr.year && (
                          <div className="mt-3 bg-white rounded-xl border border-tosca-ds/20 shadow-sm overflow-hidden">
                            {/* Barra de controles */}
                            <div className="print:hidden flex items-center justify-between px-4 py-2.5 bg-tosca-ds/5 border-b border-tosca-ds/15">
                              <div className="flex items-center gap-2">
                                <IconAward size={15} className="text-tosca-cc" />
                                <span className="text-xs font-semibold text-tosca-cc">
                                  Informe Final · {yr.year}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <PrintControls
                                  paperSize={paperSize}
                                  onPaperSizeChange={setPaperSize}
                                  onPrint={handlePrint}
                                />
                                <button
                                  onClick={() => setExpandedYear(null)}
                                  className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-tosca-ds/10 transition-colors"
                                  title="Cerrar preview"
                                >
                                  <IconX size={14} className="text-gray-400 hover:text-tosca-cc" />
                                </button>
                              </div>
                            </div>
                            {/* Contenido del informe */}
                            <div className="max-h-[80vh] overflow-auto bg-gray-50">
                              <FinalReportContent studentId={selected.id} year={yr.year} />
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

        </main>
      </div>
    </div>
  );
}

export default History
