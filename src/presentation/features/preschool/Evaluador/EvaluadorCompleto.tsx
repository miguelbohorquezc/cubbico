//@ts-ignore
import React from 'react';
import { useEvaluadorCompleto } from './useEvaluadorCompleto';
import { Card, Badge } from '../../../components/ui';
import {
  UserIcon,
  TargetIcon,
  CalendarIcon,
  ClockIcon,
  ListIcon,
  BookOpenIcon,
  SaveIcon,
  CheckCircleIcon
} from '../../../components/icons';

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
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-lg border border-light-gray-200 shadow-sm">
          <div className="w-12 h-12 border-4 border-light-gray-200 border-t-deep-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-sm font-medium text-light-gray-700">Cargando información del evaluador...</p>
        </div>
      ) : (
        <div className="w-full">
          {/* Header con información del estudiante */}
          <Card elevation="md" className="mb-6">
            <Card.Header icon={<TargetIcon />}>
              Selección de Indicadores de Desempeño
            </Card.Header>
            <Card.Body>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="flex items-start gap-3 p-3 bg-light-gray-50 rounded-lg border border-light-gray-200">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-light-gray-500 mb-1 tracking-wide">Estudiante</p>
                    <p className="text-sm font-semibold text-deep-blue-900 leading-tight">{studentName || props.studentId}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-light-gray-50 rounded-lg border border-light-gray-200">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpenIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-light-gray-500 mb-1 tracking-wide">Grado</p>
                    <p className="text-sm font-semibold text-deep-blue-900 leading-tight">{classroomName || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-light-gray-50 rounded-lg border border-light-gray-200">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CalendarIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-light-gray-500 mb-1 tracking-wide">Periodo</p>
                    <Badge variant="success" size="sm">
                      Periodo {props.periodo}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-light-gray-50 rounded-lg border border-light-gray-200">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ClockIcon className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-light-gray-500 mb-1 tracking-wide">Año</p>
                    <p className="text-sm font-semibold text-deep-blue-900 leading-tight">{props.year}</p>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Grid de propósitos */}
          <div className="space-y-6">
            {propositos.map((p, i) => {
              // Calcular progreso de selección para este propósito
              const asignaturasConIndicador = p.asignaturas.filter(aId => selecciones[aId] && selecciones[aId] !== '').length;
              const totalAsignaturas = p.asignaturas.length;
              const completado = asignaturasConIndicador === totalAsignaturas && totalAsignaturas > 0;
              const progreso = totalAsignaturas > 0 ? Math.round((asignaturasConIndicador / totalAsignaturas) * 100) : 0;

              return (
                <Card key={p.id} elevation="md" className={completado ? 'border-2 border-green-200' : ''}>
                  <Card.Header
                    icon={<TargetIcon />}
                    action={
                      <div className="flex items-center gap-2">
                        <Badge variant="purple" size="sm">
                          Propósito {i + 1}
                        </Badge>
                        {completado ? (
                          <Badge variant="success" size="sm" icon={<CheckCircleIcon className="w-3.5 h-3.5" />}>
                            Completo
                          </Badge>
                        ) : asignaturasConIndicador > 0 ? (
                          <Badge variant="warning" size="sm">
                            {asignaturasConIndicador}/{totalAsignaturas}
                          </Badge>
                        ) : (
                          <Badge variant="default" size="sm">
                            0/{totalAsignaturas}
                          </Badge>
                        )}
                      </div>
                    }
                  >
                    Propósito {i + 1}
                  </Card.Header>
                  <Card.Body>
                    <p className="text-sm text-light-gray-700 leading-relaxed mb-6 p-4 bg-light-gray-50 rounded-lg border border-light-gray-200">
                      {p.texto}
                    </p>

                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Panel de Referentes - Columna izquierda */}
                      <div className="lg:w-80 flex-shrink-0">
                        <div className="bg-deep-blue-50 rounded-lg p-5 border border-deep-blue-200 sticky top-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <ListIcon className="w-5 h-5 text-deep-blue-600" />
                              <h4 className="text-sm font-bold text-deep-blue-900 uppercase tracking-wide">Referentes</h4>
                            </div>
                            <Badge variant="info" size="sm">
                              {p.referentes.length}
                            </Badge>
                          </div>
                          <ul className="space-y-3">
                            {p.referentes.map((r, idx) => (
                              <li key={idx} className="flex items-start gap-3 text-sm text-deep-blue-800">
                                <Badge variant="blue" size="sm" className="mt-0.5">
                                  {idx + 1}
                                </Badge>
                                <span className="flex-1">{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Panel de Indicadores - Columna derecha */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-2">
                            <BookOpenIcon className="w-5 h-5 text-deep-blue-600" />
                            <h4 className="text-sm font-bold text-deep-blue-900 uppercase tracking-wide">Indicadores por Asignatura</h4>
                          </div>
                          {/* Progreso visual */}
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-light-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  completado ? 'bg-green-500' : progreso > 50 ? 'bg-yellow-500' : 'bg-red-400'
                                }`}
                                style={{ width: `${progreso}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-light-gray-600">{progreso}%</span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {p.asignaturas.map(aId => {
                            const nombre = obtenerNombreAsignatura(aId);
                            const opts = indicadores.filter(i => i.asignatura === aId);
                            const sel = selecciones[aId] || '';
                            const isSelected = sel !== '' && sel !== undefined;

                            return (
                              <div key={aId} className="relative">
                                <label className="flex items-center gap-2 text-sm font-semibold text-deep-blue-900 mb-2">
                                  <BookOpenIcon className="w-4 h-4 text-deep-blue-600" />
                                  {nombre}
                                  {isSelected && (
                                    <CheckCircleIcon className="w-5 h-5 text-green-600 ml-auto" />
                                  )}
                                </label>
                                <select
                                  className={`w-full px-4 py-3.5 pr-10 bg-white rounded-lg text-sm font-medium focus:outline-none transition-all cursor-pointer appearance-none bg-no-repeat bg-right ${
                                    isSelected
                                      ? 'border-2 border-green-300 text-green-900 bg-green-50'
                                      : 'border-2 border-light-gray-300 text-light-gray-900 hover:border-light-gray-400 focus:border-deep-blue-500 focus:ring-2 focus:ring-deep-blue-200'
                                  }`}
                                  style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                                    backgroundPosition: 'right 0.75rem center',
                                    backgroundSize: '1.25rem 1.25rem'
                                  }}
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
                </Card.Body>
              </Card>
            );
            })}
          </div>

          {/* Barra de acción */}
          <Card elevation="lg" className="mt-8">
            <Card.Body>
              <div className="flex items-center justify-between">
                <div className="text-sm text-light-gray-600">
                  <span className="font-medium">{Object.keys(selecciones).length}</span> indicador(es) seleccionado(s)
                </div>
                <div className="flex items-center gap-4">
                  {mostrarExito && (
                    <div className="flex items-center gap-2 text-green-600 font-semibold animate-fadeIn">
                      <CheckCircleIcon className="w-5 h-5" />
                      Selección guardada correctamente
                    </div>
                  )}
                  <button
                    className={`flex items-center gap-2 px-8 py-3.5 rounded-lg font-semibold transition-all shadow-sm ${
                      guardando || Object.keys(selecciones).length === 0
                        ? 'bg-light-gray-200 text-light-gray-400 cursor-not-allowed'
                        : 'bg-deep-blue-600 text-white hover:bg-deep-blue-700 hover:shadow-md'
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
                        <SaveIcon className="w-5 h-5" />
                        Guardar Selección
                      </>
                    )}
                  </button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
    </>
  );
};

export default EvaluadorCompleto;
