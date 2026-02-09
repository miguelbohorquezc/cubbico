import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../../infrastructure/firebase/firebase';
import { SidebarV2 } from '../../../../components/sidebarV2';
import { HeaderV2 } from '../../../../components/headerV2';
import { useStudents } from '../../../../components/datatable/useStudents';

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

          records.push({ year, nivel, nombreGrado, directorGrupo, periodsAvailable });
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

  const filtered = useMemo(() => {
    if (!search) return students;
    const q = search.toLowerCase();
    return students.filter((s: { name: string; lastName: string; className?: string }) =>
      `${s.name} ${s.lastName}`.toLowerCase().includes(q) ||
      (s.className || '').toLowerCase().includes(q)
    );
  }, [students, search]);

  // Título dinámico según vista activa
  const headerTitle = selected
    ? `${selected.name} ${selected.lastName}`
    : 'Historial Académico';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <SidebarV2 />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <HeaderV2
          title={headerTitle}
          subtitle={selected ? 'Historial académico' : undefined}
          isSidebarCollapsed={isSidebarCollapsed}
          showSearch={false}
        />

        {/* Spacer para el header fixed */}
        <div className="h-16 flex-shrink-0" />

        {/* Body */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto min-h-0">

          {/* ── Vista: lista de estudiantes ─────────────────────────────── */}
          {!selected && (
            <div className="max-w-4xl mx-auto">
              <p className="text-sm text-gray-500 mb-5">
                Selecciona un estudiante para ver su historial y acceder a sus informes
              </p>

              <input
                type="text"
                placeholder="Buscar estudiante o salón..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full mb-4 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />

              {studentsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Estudiante</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Grado</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Salón</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((student: { id: string; name: string; lastName: string; classRoom?: string; className?: string }, idx: number) => (
                        <tr
                          key={student.id}
                          onClick={() => setSelected({ id: student.id, name: student.name, lastName: student.lastName })}
                          className={`cursor-pointer hover:bg-blue-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                        >
                          <td className="px-4 py-3 text-sm font-medium text-gray-800">
                            {student.name} {student.lastName}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{student.classRoom}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{student.className}</td>
                        </tr>
                      ))}
                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-400">
                            No se encontraron estudiantes
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Vista: historial del estudiante ─────────────────────────── */}
          {selected && (
            <div className="max-w-4xl mx-auto">

              <button
                onClick={() => { setSelected(null); setSearch(''); }}
                className="text-sm text-blue-600 hover:text-blue-800 mb-5 flex items-center gap-1"
              >
                ← Volver a lista
              </button>

              {/* Estado de carga */}
              {historyLoading && (
                <div className="flex items-center justify-center h-48">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <p className="text-gray-400 text-sm">
                    No se encontró historial académico para este estudiante
                  </p>
                </div>
              )}

              {/* Tarjetas por año */}
              {!historyLoading && !historyError && years.map(yr => (
                <div key={yr.year} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4">

                  {/* Encabezado del año */}
                  <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-indigo-700">{yr.year}</span>
                        {yr.nombreGrado && (
                          <span className="text-sm font-medium text-indigo-600">
                            {yr.nombreGrado}
                          </span>
                        )}
                      </div>
                      {yr.directorGrupo && (
                        <span className="text-xs text-gray-500">
                          Dir. de grupo: {yr.directorGrupo}
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/private/dashboard/final-report/${selected.id}/${yr.year}`}
                      className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Informe Final
                    </Link>
                  </div>

                  {/* Grid de períodos */}
                  <div className="p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {yr.periodsAvailable.map(pId => (
                        <div
                          key={pId}
                          className="border border-gray-200 rounded-lg p-3 flex flex-col items-center gap-2"
                        >
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                            P{pId}
                          </span>
                          <Link
                            to={`/private/dashboard/report/${yr.nivel}/${pId}/${yr.directorGrupo || 'sin-director'}/${selected.id}/${yr.year}`}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                          >
                            Ver Informe
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default History
