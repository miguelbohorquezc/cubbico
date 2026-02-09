import { useState, useEffect } from 'react';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebase';
import { AreaIhsInfo } from '../../../domain/entities/area';

interface Indicador {
  id: string;
  texto: string;
  periodos: number[];
  asignatura: string;
  activo: boolean;
}

interface Props {
  classRoomId: string;
  year: string;
  periodo: number;
}

const MAX_CARACTERES = 250;
const MAX_INDICADORES = 40;

const GestorIndicadores = ({ classRoomId, year, periodo }: Props) => {
  const [asignaturas, setAsignaturas] = useState<AreaIhsInfo[]>([]);
  const [indicadores, setIndicadores] = useState<Record<string, Indicador[]>>({});
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [asignaturaActiva, setAsignaturaActiva] = useState<string>('');
  const [indicadorEditando, setIndicadorEditando] = useState<Indicador | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formulario, setFormulario] = useState<Omit<Indicador, 'id'>>({
    texto: '',
    periodos: [periodo],
    asignatura: '',
    activo: true
  });
  const [errores, setErrores] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);

        const query = await getDocs(collection(db, 'areas'));
        const asignaturasData = query.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as AreaIhsInfo))
          .filter(a => a.nivel === 'preescolar');
        setAsignaturas(asignaturasData);
        setAsignaturaActiva(asignaturasData[0]?.id || '');

        const docRef = doc(db, 'preschool_indicators', `${classRoomId}_${year}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const indicadoresData = docSnap.data().indicadores || [];
          const grouped = groupByAsignatura(indicadoresData);
          setIndicadores(grouped);
        }
      } catch (error) {
        setMensaje({ texto: 'Error al cargar los indicadores', tipo: 'error' });
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [classRoomId, year]);

  const groupByAsignatura = (indicadores: Indicador[]) => {
    return indicadores.reduce((acc, indicador) => {
      if (!acc[indicador.asignatura]) {
        acc[indicador.asignatura] = [];
      }
      acc[indicador.asignatura].push(indicador);
      return acc;
    }, {} as Record<string, Indicador[]>);
  };

  const validarIndicador = () => {
    const nuevosErrores: string[] = [];

    if (!formulario.texto.trim()) {
      nuevosErrores.push('El texto del indicador no puede estar vacío');
    }

    if (formulario.periodos.length === 0) {
      nuevosErrores.push('Debe seleccionar al menos un periodo');
    }

    if (!formulario.asignatura) {
      nuevosErrores.push('Debe seleccionar una asignatura');
    }

    if ((indicadores[formulario.asignatura]?.length || 0) >= MAX_INDICADORES && !indicadorEditando) {
      nuevosErrores.push(`Máximo ${MAX_INDICADORES} indicadores por asignatura`);
    }

    setErrores(nuevosErrores);
    return nuevosErrores.length === 0;
  };

  const guardarIndicador = async () => {
    if (!validarIndicador()) return;

    try {
      const todosIndicadores = Object.values(indicadores).flat();
      let nuevosIndicadores;

      if (indicadorEditando) {
        nuevosIndicadores = todosIndicadores.map(ind =>
          ind.id === indicadorEditando.id ? { ...formulario, id: indicadorEditando.id } : ind
        );
      } else {
        const nuevoId = `ind_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        nuevosIndicadores = [...todosIndicadores, { ...formulario, id: nuevoId }];
      }

      await setDoc(doc(db, 'preschool_indicators', `${classRoomId}_${year}`), {
        indicadores: nuevosIndicadores,
        _meta: { classRoomId, year, lastModified: new Date() }
      });

      setIndicadores(groupByAsignatura(nuevosIndicadores));
      setMensaje({ texto: 'Indicador guardado exitosamente', tipo: 'success' });
      resetFormulario();
      setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
    } catch (error) {
      setMensaje({ texto: 'Error al guardar el indicador', tipo: 'error' });
    }
  };

  const eliminarIndicador = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este indicador?')) return;

    try {
      const todosIndicadores = Object.values(indicadores).flat();
      const nuevosIndicadores = todosIndicadores.filter(ind => ind.id !== id);

      await setDoc(doc(db, 'preschool_indicators', `${classRoomId}_${year}`), {
        indicadores: nuevosIndicadores,
        _meta: { classRoomId, year, lastModified: new Date() }
      });

      setIndicadores(groupByAsignatura(nuevosIndicadores));
      setMensaje({ texto: 'Indicador eliminado exitosamente', tipo: 'success' });
      setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
    } catch (error) {
      setMensaje({ texto: 'Error al eliminar el indicador', tipo: 'error' });
    }
  };

  const editarIndicador = (indicador: Indicador) => {
    setIndicadorEditando(indicador);
    setFormulario({
      texto: indicador.texto,
      periodos: indicador.periodos,
      asignatura: indicador.asignatura,
      activo: indicador.activo
    });
    setMostrarFormulario(true);
    setErrores([]);
  };

  const resetFormulario = () => {
    setFormulario({
      texto: '',
      periodos: [periodo],
      asignatura: asignaturaActiva,
      activo: true
    });
    setIndicadorEditando(null);
    setMostrarFormulario(false);
    setErrores([]);
  };

  const iniciarNuevoIndicador = () => {
    resetFormulario();
    setFormulario(prev => ({ ...prev, asignatura: asignaturaActiva }));
    setMostrarFormulario(true);
  };

  const indicadoresActivos = indicadores[asignaturaActiva] || [];
  const indicadoresFiltrados = indicadoresActivos.filter(ind =>
    ind.texto.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const indicadoresPaginados = indicadoresFiltrados.slice(0, itemsPerPage);

  const contarPorAsignatura = (asigId: string) => {
    return indicadores[asigId]?.length || 0;
  };

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-white rounded-lg border border-gray-200">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-gray-700">Cargando indicadores...</p>
      </div>
    );
  }

  return (
    <div className="flex gap-8">
      {/* Toast de notificación */}
      {mensaje.texto && (
        <div className={`fixed top-20 right-6 z-50 max-w-md ${
          mensaje.tipo === 'success'
            ? 'bg-white border border-emerald-200 shadow-lg'
            : 'bg-white border border-red-200 shadow-lg'
        } rounded-lg p-4 flex items-start gap-3`}>
          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
            mensaje.tipo === 'success' ? 'bg-emerald-100' : 'bg-red-100'
          }`}>
            {mensaje.tipo === 'success' ? (
              <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <p className="text-sm font-medium text-gray-900">{mensaje.texto}</p>
          <button
            onClick={() => setMensaje({ texto: '', tipo: '' })}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Columna principal - Tabla de indicadores */}
      <div className="flex-1 min-w-0">
        {/* Tabs de asignaturas */}
        <div className="mb-4 flex flex-wrap gap-2">
          {asignaturas.map(asig => {
            const count = contarPorAsignatura(asig.id);
            return (
              <button
                key={asig.id}
                onClick={() => {
                  setAsignaturaActiva(asig.id);
                  setSearchTerm('');
                }}
                className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                  asignaturaActiva === asig.id
                    ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-500'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {asig.asignatura}
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                  asignaturaActiva === asig.id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar indicadores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value={10}>Mostrar 10</option>
            <option value={25}>Mostrar 25</option>
            <option value={50}>Mostrar 50</option>
            <option value={100}>Mostrar 100</option>
          </select>
        </div>

        {/* Tabla de indicadores */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Indicador
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider w-32">
                  Periodos
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider w-24">
                  Estado
                </th>
                <th className="px-4 py-3 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider w-32">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {indicadoresPaginados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm font-medium">
                        {searchTerm ? 'No se encontraron indicadores' : 'No hay indicadores registrados'}
                      </p>
                      {!searchTerm && (
                        <p className="text-xs mt-1">Haz clic en "Agregar indicador" para crear uno</p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                indicadoresPaginados.map((indicador) => (
                  <tr key={indicador.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900 leading-relaxed">{indicador.texto}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {indicador.periodos.map(p => `P${p}`).join(', ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        indicador.activo
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {indicador.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => editarIndicador(indicador)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => eliminarIndicador(indicador.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Info de paginación */}
        {indicadoresFiltrados.length > itemsPerPage && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            Mostrando {indicadoresPaginados.length} de {indicadoresFiltrados.length} indicadores
          </div>
        )}
      </div>

      {/* Columna lateral - Panel de gestión */}
      <div className="w-[400px] flex-shrink-0">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden sticky top-6">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-base font-bold text-gray-900">Gestión de Indicadores</h3>
          </div>

          <div className="p-4">
            {!mostrarFormulario ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 mb-4">Crea un nuevo indicador de desempeño</p>
                <button
                  onClick={iniciarNuevoIndicador}
                  className="w-full px-4 py-2.5 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Agregar indicador
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900">
                    {indicadorEditando ? 'Editar Indicador' : 'Nuevo Indicador'}
                  </h4>
                  <button
                    onClick={resetFormulario}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Asignatura */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Asignatura
                  </label>
                  <select
                    value={formulario.asignatura}
                    onChange={(e) => setFormulario({ ...formulario, asignatura: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Seleccione...</option>
                    {asignaturas.map(asig => (
                      <option key={asig.id} value={asig.id}>{asig.asignatura}</option>
                    ))}
                  </select>
                </div>

                {/* Texto */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Descripción del indicador
                  </label>
                  <textarea
                    value={formulario.texto}
                    onChange={(e) => setFormulario({ ...formulario, texto: e.target.value })}
                    placeholder="Describe el indicador de desempeño..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    rows={4}
                    maxLength={MAX_CARACTERES}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">Máx. {MAX_CARACTERES} caracteres</span>
                    <span className={`text-xs font-medium ${
                      formulario.texto.length > MAX_CARACTERES * 0.9
                        ? 'text-red-600'
                        : 'text-gray-500'
                    }`}>
                      {formulario.texto.length}/{MAX_CARACTERES}
                    </span>
                  </div>
                </div>

                {/* Periodos */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Periodos
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map(p => (
                      <button
                        key={p}
                        onClick={() => {
                          const newPeriodos = formulario.periodos.includes(p)
                            ? formulario.periodos.filter(per => per !== p)
                            : [...formulario.periodos, p].sort();
                          setFormulario({ ...formulario, periodos: newPeriodos });
                        }}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          formulario.periodos.includes(p)
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        P{p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estado */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formulario.activo}
                      onChange={(e) => setFormulario({ ...formulario, activo: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700">Indicador activo</span>
                  </label>
                </div>

                {/* Errores */}
                {errores.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    {errores.map((error, i) => (
                      <p key={i} className="text-xs text-red-600">{error}</p>
                    ))}
                  </div>
                )}

                {/* Botones */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={resetFormulario}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={guardarIndicador}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    {indicadorEditando ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestorIndicadores;
