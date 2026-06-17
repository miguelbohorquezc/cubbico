import { useState, useEffect } from 'react';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebase';
import { AreaIhsInfo } from '../../../domain/entities/area';
import { Tabs, SearchInput, Card, EmptyState, Badge } from '../../components/ui';
import {
  BookOpenIcon,
  ClipboardIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  AlertCircleIcon
} from '../../components/icons';

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

const deduplicarAreasPorNombre = (areas: AreaIhsInfo[]): AreaIhsInfo[] => {
  const sorted = [...areas].sort((a, b) => {
    if ((a.orden || 0) !== (b.orden || 0)) return (a.orden || 0) - (b.orden || 0);
    return (a.id || '').localeCompare(b.id || '');
  });
  const seen = new Set<string>();
  return sorted.filter(area => {
    const key = area.asignatura.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

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
        const todasPreescolar = query.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as AreaIhsInfo))
          .filter(a => a.nivel === 'preescolar');

        const asignaturasData = deduplicarAreasPorNombre(todasPreescolar);
        setAsignaturas(asignaturasData);
        setAsignaturaActiva(asignaturasData[0]?.id || '');

        // Mapa de cualquier ID duplicado → ID canónico por nombre de asignatura
        const canonicalMap = new Map<string, string>();
        todasPreescolar.forEach(area => {
          const canonical = asignaturasData.find(
            ca => ca.asignatura.trim().toLowerCase() === area.asignatura.trim().toLowerCase()
          );
          if (canonical?.id) canonicalMap.set(area.id!, canonical.id);
        });

        const docRef = doc(db, 'preschool_indicators', `${classRoomId}_${year}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const indicadoresData = docSnap.data().indicadores || [];
          // Remapear IDs duplicados al canónico, descartar huérfanos y deduplicar por texto
          const seen = new Map<string, boolean>();
          const remapped = indicadoresData
            .map((ind: Indicador) => ({
              ...ind,
              asignatura: canonicalMap.get(ind.asignatura) ?? ind.asignatura
            }))
            .filter((ind: Indicador) => asignaturasData.some(a => a.id === ind.asignatura))
            .filter((ind: Indicador) => {
              const key = `${ind.asignatura}|${ind.texto.trim().toLowerCase()}`;
              if (seen.has(key)) return false;
              seen.set(key, true);
              return true;
            });
          setIndicadores(groupByAsignatura(remapped));
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
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-white rounded-lg border border-light-gray-200 shadow-sm">
        <div className="w-12 h-12 border-4 border-light-gray-200 border-t-deep-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-light-gray-700">Cargando indicadores...</p>
      </div>
    );
  }

  return (
    <div className="flex gap-8">
      {/* Toast de notificación mejorado */}
      {mensaje.texto && (
        <div className={`fixed top-20 right-6 z-50 max-w-md animate-fadeIn ${
          mensaje.tipo === 'success'
            ? 'bg-white border border-green-200 shadow-lg'
            : 'bg-white border border-red-200 shadow-lg'
        } rounded-lg p-4 flex items-start gap-3`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
            mensaje.tipo === 'success' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {mensaje.tipo === 'success' ? (
              <CheckCircleIcon className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircleIcon className="w-4 h-4 text-red-600" />
            )}
          </div>
          <p className="text-sm font-medium text-light-gray-900">{mensaje.texto}</p>
          <button
            onClick={() => setMensaje({ texto: '', tipo: '' })}
            className="ml-auto text-light-gray-400 hover:text-light-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Columna principal - Tabla de indicadores */}
      <div className="flex-1 min-w-0">
        {/* Tabs de asignaturas con Tabs component */}
        <Tabs
          defaultValue={asignaturaActiva}
          onChange={(value) => {
            setAsignaturaActiva(value);
            setSearchTerm('');
          }}
          className="mb-6"
        >
          <Tabs.List>
            {asignaturas.map(asig => (
              <Tabs.Tab
                key={asig.id}
                value={asig.id!}
                icon={<BookOpenIcon />}
                badge={contarPorAsignatura(asig.id!)}
              >
                {asig.asignatura}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          {asignaturas.map(asig => (
            // @ts-ignore - TODO: TabPanel children should be optional
            <Tabs.Panel key={asig.id} value={asig.id!}></Tabs.Panel>
          ))}
        </Tabs>

        {/* Barra de búsqueda con SearchInput y filtros */}
        <div className="mb-6 flex items-center gap-3">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={() => setSearchTerm('')}
            placeholder="Buscar indicadores..."
            resultCount={indicadoresFiltrados.length}
            debounceMs={300}
          />
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="px-3 py-2 text-sm border border-light-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue-300 focus:border-deep-blue-500 bg-white"
          >
            <option value={10}>Mostrar 10</option>
            <option value={25}>Mostrar 25</option>
            <option value={50}>Mostrar 50</option>
            <option value={100}>Mostrar 100</option>
          </select>
        </div>

        {/* Tabla de indicadores */}
        <Card elevation="sm" className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-light-gray-50 border-b border-light-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <div className="flex items-center gap-2">
                    <ClipboardIcon className="w-4 h-4 text-light-gray-500" />
                    <span className="text-[11px] font-bold text-light-gray-600 uppercase tracking-wider">
                      Indicador
                    </span>
                  </div>
                </th>
                <th className="px-4 py-3 text-left w-32">
                  <span className="text-[11px] font-bold text-light-gray-600 uppercase tracking-wider">
                    Periodos
                  </span>
                </th>
                <th className="px-4 py-3 text-left w-24">
                  <span className="text-[11px] font-bold text-light-gray-600 uppercase tracking-wider">
                    Estado
                  </span>
                </th>
                <th className="px-4 py-3 text-center w-32">
                  <span className="text-[11px] font-bold text-light-gray-600 uppercase tracking-wider">
                    Acciones
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray-200">
              {indicadoresPaginados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12">
                    <EmptyState
                      variant={searchTerm ? 'search' : 'default'}
                      icon={<ClipboardIcon />}
                      title={searchTerm ? 'No se encontraron indicadores' : 'No hay indicadores registrados'}
                      description={searchTerm ? 'Intenta con otros términos de búsqueda' : 'Haz clic en "Agregar indicador" para crear uno'}
                    />
                  </td>
                </tr>
              ) : (
                indicadoresPaginados.map((indicador) => (
                  <tr key={indicador.id} className="hover:bg-light-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <p className="text-sm text-light-gray-900 leading-relaxed">{indicador.texto}</p>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="info" size="sm">
                        {indicador.periodos.map(p => `P${p}`).join(', ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={indicador.activo ? 'success' : 'default'} size="sm">
                        {indicador.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => editarIndicador(indicador)}
                          className="p-2 text-deep-blue-600 hover:bg-deep-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => eliminarIndicador(indicador.id)}
                          className="p-2 text-error-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>

        {/* Info de paginación */}
        {indicadoresFiltrados.length > itemsPerPage && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            Mostrando {indicadoresPaginados.length} de {indicadoresFiltrados.length} indicadores
          </div>
        )}
      </div>

      {/* Columna lateral - Panel de gestión */}
      <div className="w-[600px] flex-shrink-0">
        <Card elevation="md" className="sticky top-6">
          <Card.Header icon={<ClipboardIcon />}>
            Gestión de Indicadores
          </Card.Header>

          <Card.Body noPadding>
            {!mostrarFormulario ? (
              <div className="text-center py-12 px-6">
                <div className="w-16 h-16 bg-deep-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-deep-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-sm text-light-gray-600 mb-6">Crea un nuevo indicador de desempeño</p>
                <button
                  onClick={iniciarNuevoIndicador}
                  className="w-full px-4 py-3 text-sm font-medium text-white bg-deep-blue-600 rounded-lg hover:bg-deep-blue-700 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Agregar indicador
                </button>
              </div>
            ) : (
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-light-gray-200">
                  <div className="flex items-center gap-2">
                    {indicadorEditando ? (
                      <PencilIcon className="w-4 h-4 text-deep-blue-600" />
                    ) : (
                      <svg className="w-4 h-4 text-deep-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                    <h4 className="text-sm font-semibold text-deep-blue-900">
                      {indicadorEditando ? 'Editar Indicador' : 'Nuevo Indicador'}
                    </h4>
                  </div>
                  <button
                    onClick={resetFormulario}
                    className="p-1.5 text-light-gray-400 hover:text-error-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Asignatura */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-deep-blue-800 mb-2">
                    <BookOpenIcon className="w-3.5 h-3.5" />
                    Asignatura
                  </label>
                  <select
                    value={formulario.asignatura}
                    onChange={(e) => setFormulario({ ...formulario, asignatura: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-light-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue-200 focus:border-deep-blue-500 transition-all bg-white"
                  >
                    <option value="">Seleccione...</option>
                    {asignaturas.map(asig => (
                      <option key={asig.id} value={asig.id}>{asig.asignatura}</option>
                    ))}
                  </select>
                </div>

                {/* Texto */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-deep-blue-800 mb-2">
                    <ClipboardIcon className="w-3.5 h-3.5" />
                    Descripción del indicador
                  </label>
                  <textarea
                    value={formulario.texto}
                    onChange={(e) => setFormulario({ ...formulario, texto: e.target.value })}
                    placeholder="Describe el indicador de desempeño..."
                    className="w-full px-3 py-2.5 text-sm border border-light-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-deep-blue-200 focus:border-deep-blue-500 transition-all"
                    rows={5}
                    maxLength={MAX_CARACTERES}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-light-gray-500">
                      Máximo {MAX_CARACTERES} caracteres
                    </span>
                    <div className="flex items-center gap-2">
                      {/* Progress bar visual */}
                      <div className="w-16 h-1.5 bg-light-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            formulario.texto.length > MAX_CARACTERES * 0.9
                              ? 'bg-error-500'
                              : formulario.texto.length > MAX_CARACTERES * 0.7
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${(formulario.texto.length / MAX_CARACTERES) * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${
                        formulario.texto.length > MAX_CARACTERES * 0.9
                          ? 'text-error-600'
                          : 'text-light-gray-600'
                      }`}>
                        {formulario.texto.length}/{MAX_CARACTERES}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Periodos */}
                <div>
                  <label className="block text-xs font-semibold text-deep-blue-800 mb-2">
                    Periodos aplicables
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          const newPeriodos = formulario.periodos.includes(p)
                            ? formulario.periodos.filter(per => per !== p)
                            : [...formulario.periodos, p].sort();
                          setFormulario({ ...formulario, periodos: newPeriodos });
                        }}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                          formulario.periodos.includes(p)
                            ? 'bg-deep-blue-600 text-white shadow-sm'
                            : 'bg-light-gray-100 text-light-gray-600 hover:bg-light-gray-200'
                        }`}
                      >
                        P{p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estado */}
                <div className="pt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formulario.activo}
                      onChange={(e) => setFormulario({ ...formulario, activo: e.target.checked })}
                      className="w-4 h-4 text-deep-blue-600 border-light-gray-300 rounded focus:ring-deep-blue-500 transition-colors"
                    />
                    <span className="text-sm text-light-gray-700 group-hover:text-deep-blue-700 transition-colors">
                      Indicador activo
                    </span>
                  </label>
                </div>

                {/* Errores */}
                {errores.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
                    {errores.map((error, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <AlertCircleIcon className="w-4 h-4 text-error-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-error-700">{error}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetFormulario}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-light-gray-700 bg-white border border-light-gray-300 rounded-lg hover:bg-light-gray-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={guardarIndicador}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-orchid-blue-60 rounded-lg hover:bg-orchid-blue-70 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    {indicadorEditando ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default GestorIndicadores;
