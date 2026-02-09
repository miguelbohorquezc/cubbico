//@ts-ignore
import React from 'react';
import { useEvaluadorCompleto } from './useEvaluadorCompleto';

interface Props {
  studentId: string;
  periodo: number;
  year: string;
  classRoomId: string;
}

const EvaluadorCompleto = (props: Props) => {
  const {
    studentName,
    classroomName,
    propositos,
    indicadores,
    selecciones,
    obtenerNombreAsignatura,
    handleSeleccion,
    guardarEvaluacion,
    cargando,
    guardando,
    mostrarExito
  } = useEvaluadorCompleto(props);

  return (
    <>
      {cargando ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-lg border border-gray-200">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-sm font-medium text-gray-700">Cargando información del evaluador...</p>
        </div>
      ) : (
        <div className="w-full">
          {/* Header con información del estudiante */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden mb-6">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Selección de Indicadores de Desempeño</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-500 mb-0.5">Estudiante</p>
                    <p className="text-sm font-bold text-gray-900 leading-tight">{studentName || props.studentId}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-500 mb-0.5">Grado</p>
                    <p className="text-sm font-bold text-gray-900 leading-tight">{classroomName || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-500 mb-0.5">Periodo</p>
                    <p className="text-sm font-bold text-gray-900 leading-tight">{props.periodo}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-500 mb-0.5">Año</p>
                    <p className="text-sm font-bold text-gray-900 leading-tight">{props.year}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de propósitos */}
          <div className="space-y-8">
            {propositos.map((p, i) => (
              <div key={p.id} className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                {/* Header del propósito */}
                <div className="bg-gray-50 border-b border-gray-200 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-base font-bold text-gray-900">Propósito {i + 1}</h3>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{p.texto}</p>
                </div>

                {/* Contenido del propósito */}
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Panel de Referentes - Columna izquierda */}
                    <div className="lg:w-80 flex-shrink-0">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 sticky top-6">
                        <div className="flex items-center gap-2 mb-3">
                          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Referentes</h4>
                        </div>
                        <ul className="space-y-2">
                          {p.referentes.map((r, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Panel de Indicadores - Columna derecha */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-4">
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Indicadores por Asignatura</h4>
                      </div>

                    <div className="space-y-4">
                      {p.asignaturas.map(aId => {
                        const nombre = obtenerNombreAsignatura(aId);
                        const opts = indicadores.filter(i => i.asignatura === aId);
                        const sel = selecciones[aId] || '';

                        return (
                          <div key={aId} className="space-y-4">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                              {nombre}
                            </label>
                            <select
                              className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer hover:border-gray-400"
                              value={sel}
                              onChange={e => handleSeleccion(aId, e.target.value)}
                            >
                              <option value="">Seleccione un indicador...</option>
                              {opts.map(o => (
                                <option key={o.id} value={o.id} title={`${o.texto} (${o.nivel})`}>
                                  {o.texto} ({o.nivel})
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Barra de acción */}
          <div className="flex items-center justify-end gap-4 mt-10 p-6 bg-white shadow-lg border-t-2 border-gray-100 rounded-lg">
            <button
              className={`flex items-center gap-2 px-8 py-3.5 rounded-lg font-semibold transition-all ${
                guardando || Object.keys(selecciones).length === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
              disabled={guardando || Object.keys(selecciones).length === 0}
              onClick={guardarEvaluacion}
            >
              {guardando ? (
                <>
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Guardar Selección
                </>
              )}
            </button>

            {mostrarExito && (
              <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Selección guardada correctamente
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default EvaluadorCompleto;
