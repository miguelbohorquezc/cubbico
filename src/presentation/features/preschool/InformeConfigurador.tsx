import { useState, useEffect } from 'react';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebase';
import { AreaIhsInfo } from '../../../domain/entities/area';
import { Tabs, ProgressBar, Card, Badge, ConfirmModal } from '../../components/ui';
import {
  TargetIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  SaveIcon,
  DocumentIcon,
  ListIcon,
  BookOpenIcon,
  PlusIcon,
  XIcon
} from '../../components/icons';
import CreateAreaModal from './components/CreateAreaModal';

interface Proposito {
  id: string;
  texto: string;
  referentes: string[];
  asignaturas: string[];
}

const MAX_CARACTERES = 500;

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

const InformeConfigurador = ({ classRoomId, year }: { classRoomId: string; year: string }) => {
  const [propositos, setPropositos] = useState<Proposito[]>([
    { id: 'p1', texto: '', referentes: ['', '', ''], asignaturas: [] },
    { id: 'p2', texto: '', referentes: ['', '', ''], asignaturas: [] },
    { id: 'p3', texto: '', referentes: ['', '', ''], asignaturas: [] }
  ]);
  const [asignaturasDisponibles, setAsignaturasDisponibles] = useState<AreaIhsInfo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [propositoActivo, setPropositoActivo] = useState<number>(0);
  const [errores, setErrores] = useState<Record<number, string[]>>({});
  const [showCreateAreaModal, setShowCreateAreaModal] = useState(false);
  const [copiando, setCopiando] = useState(false);
  const [showConfirmCopyModal, setShowConfirmCopyModal] = useState(false);

  // Función para cargar asignaturas
  const cargarAsignaturas = async () => {
    const query = await getDocs(collection(db, 'areas'));
    const asignaturas = deduplicarAreasPorNombre(
      query.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as AreaIhsInfo))
        .filter(a => a.nivel === 'preescolar')
    );
    setAsignaturasDisponibles(asignaturas);
  };

  // Handler para cuando se crea una nueva área
  const handleAreaCreated = async () => {
    await cargarAsignaturas();
    setMensaje({ texto: 'Asignatura creada exitosamente', tipo: 'success' });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
  };

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);

        // Cargar asignaturas
        await cargarAsignaturas();

        // Cargar configuración existente
        const docRef = doc(db, 'preschool_config', `${classRoomId}_${year}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPropositos(docSnap.data().propositos || propositos);
        }
      } catch (error) {
        setMensaje({ texto: 'Error al cargar la configuración', tipo: 'error' });
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [classRoomId, year]);

  // Calcular progreso general
  const calcularProgreso = () => {
    const completados = propositos.filter(p =>
      p.texto.trim() &&
      p.referentes.every(r => r.trim()) &&
      p.asignaturas.length > 0
    ).length;

    return {
      completados,
      total: propositos.length,
      porcentaje: Math.round((completados / propositos.length) * 100)
    };
  };

  // Obtener asignaturas disponibles para un propósito
  const getAsignaturasDisponibles = (propositoIndex: number) => {
    const asignaturasUsadasEnOtros = propositos
      .filter((_, i) => i !== propositoIndex)
      .flatMap(p => p.asignaturas);

    return asignaturasDisponibles.filter(
      //@ts-ignore
      a => !asignaturasUsadasEnOtros.includes(a.id) &&
      //@ts-ignore
           !propositos[propositoIndex].asignaturas.includes(a.id)
    );
  };

  // Actualizar un propósito
  const actualizarProposito = (index: number, campo: string, valor: string) => {
    setPropositos(prev => prev.map((p, i) =>
      i === index ? { ...p, [campo]: valor } : p
    ));
  };

  // Actualizar un referente
  const actualizarReferente = (propositoIndex: number, referenteIndex: number, valor: string) => {
    setPropositos(prev => prev.map((p, i) =>
      i === propositoIndex ? {
        ...p,
        referentes: p.referentes.map((r, ri) =>
          ri === referenteIndex ? valor : r
        )
      } : p
    ));
  };

  // Validar un propósito
  const validarProposito = (index: number) => {
    const nuevoErrores: string[] = [];
    const proposito = propositos[index];

    if (!proposito.texto.trim()) {
      nuevoErrores.push('El propósito no puede estar vacío');
    }

    proposito.referentes.forEach((ref, i) => {
      if (!ref.trim()) {
        nuevoErrores.push(`El referente ${i + 1} no puede estar vacío`);
      }
    });

    if (proposito.asignaturas.length === 0) {
      nuevoErrores.push('Debe seleccionar al menos una asignatura');
    }

    setErrores(prev => ({ ...prev, [index]: nuevoErrores }));
    return nuevoErrores.length === 0;
  };

  // Guardar configuración
  const guardarConfiguracion = async () => {
    const todosCompletos = propositos.every((_, i) => validarProposito(i));

    if (!todosCompletos) {
      setMensaje({ texto: 'Corrige todos los errores antes de guardar', tipo: 'error' });
      return;
    }

    try {
      setCargando(true);
      await setDoc(doc(db, 'preschool_config', `${classRoomId}_${year}`), {
        propositos,
        _meta: { classRoomId, year, lastModified: new Date() }
      });
      setMensaje({ texto: 'Configuración guardada exitosamente', tipo: 'success' });
      setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
    } catch (error) {
      setMensaje({ texto: 'Error al guardar la configuración', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  // Copiar configuración del año anterior
  const handleCopyClick = () => {
    setShowConfirmCopyModal(true);
  };

  const copiarDelAñoAnterior = async () => {
    setShowConfirmCopyModal(false);

    try {
      setCopiando(true);
      const yearAnterior = String(Number(year) - 1);

      // Copiar preschool_config (propósitos y referentes)
      const configAnteriorRef = doc(db, 'preschool_config', `${classRoomId}_${yearAnterior}`);
      const configAnteriorSnap = await getDoc(configAnteriorRef);

      if (!configAnteriorSnap.exists()) {
        setMensaje({
          texto: `No se encontró configuración para el año ${yearAnterior}`,
          tipo: 'error'
        });
        return;
      }

      // Copiar a nuevo año
      const nuevaConfigRef = doc(db, 'preschool_config', `${classRoomId}_${year}`);
      await setDoc(nuevaConfigRef, {
        ...configAnteriorSnap.data(),
        _meta: {
          classRoomId,
          year,
          copiadoDesde: yearAnterior,
          lastModified: new Date()
        }
      });

      // Copiar preschool_indicators
      const indicadoresAnteriorRef = doc(db, 'preschool_indicators', `${classRoomId}_${yearAnterior}`);
      const indicadoresAnteriorSnap = await getDoc(indicadoresAnteriorRef);

      if (indicadoresAnteriorSnap.exists()) {
        const nuevosIndicadoresRef = doc(db, 'preschool_indicators', `${classRoomId}_${year}`);
        await setDoc(nuevosIndicadoresRef, {
          ...indicadoresAnteriorSnap.data(),
          _meta: {
            classRoomId,
            year,
            copiadoDesde: yearAnterior,
            lastModified: new Date()
          }
        });
      }

      // Recargar datos
      const docRef = doc(db, 'preschool_config', `${classRoomId}_${year}`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPropositos(docSnap.data().propositos || propositos);
      }

      setMensaje({
        texto: `Configuración copiada exitosamente de ${yearAnterior} a ${year}`,
        tipo: 'success'
      });
      setTimeout(() => setMensaje({ texto: '', tipo: '' }), 5000);
    } catch (error) {
      console.error('Error copiando configuración:', error);
      setMensaje({ texto: 'Error al copiar la configuración', tipo: 'error' });
    } finally {
      setCopiando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-white rounded-lg border border-light-gray-200 shadow-sm">
        <div className="w-12 h-12 border-4 border-light-gray-200 border-t-deep-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-light-gray-700">Cargando configuración...</p>
      </div>
    );
  }

  const progreso = calcularProgreso();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Toast de notificación mejorado */}
      {mensaje.texto && (
        <div className={`fixed top-6 right-6 z-50 max-w-md animate-fadeIn ${
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

      {/* Barra de progreso con ProgressBar */}
      <Card elevation="sm" className="mb-6">
        <Card.Body>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <ProgressBar
                value={progreso.completados}
                max={progreso.total}
                label={`Progreso de configuración: ${progreso.completados}/${progreso.total} propósitos`}
                showPercentage
                dynamicColor
              />
            </div>
            <button
              onClick={handleCopyClick}
              disabled={copiando}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-magenta-600 rounded-lg hover:bg-magenta-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              title={`Copiar configuración del año ${Number(year) - 1}`}
            >
              {copiando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Copiando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copiar de {Number(year) - 1}
                </>
              )}
            </button>
          </div>
        </Card.Body>
      </Card>

      {/* Tabs de propósitos con Tabs component */}
      <Tabs
        defaultValue={`p${propositoActivo}`}
        onChange={(value) => setPropositoActivo(parseInt(value.replace('p', '')))}
        className="mb-6"
      >
        <Tabs.List>
          {propositos.map((_, index) => (
            <Tabs.Tab
              key={index}
              value={`p${index}`}
              icon={<TargetIcon />}
            >
              Propósito {index + 1}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        {propositos.map((_, index) => (
          // @ts-ignore - TODO: Add children prop to TabPanelProps or make it optional
          <Tabs.Panel key={index} value={`p${index}`}></Tabs.Panel>
        ))}
      </Tabs>

      {/* Formulario del propósito activo */}
      <Card elevation="md" className="mb-6">
        <Card.Header icon={<TargetIcon />}>
          Propósito {propositoActivo + 1}
        </Card.Header>
        <Card.Body className="space-y-6">

        {/* Descripción del propósito */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-deep-blue-800 mb-3">
            <DocumentIcon className="w-4 h-4" />
            Descripción del propósito
          </label>
          <textarea
            value={propositos[propositoActivo].texto}
            onChange={(e) => {
              actualizarProposito(propositoActivo, 'texto', e.target.value);
              validarProposito(propositoActivo);
            }}
            placeholder="Redacte el propósito de aprendizaje..."
            className="w-full px-4 py-3 border border-light-gray-300 rounded-lg text-sm resize-vertical min-h-[100px] focus:outline-none focus:border-deep-blue-500 focus:ring-2 focus:ring-deep-blue-200 transition-all"
            maxLength={MAX_CARACTERES}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-light-gray-500">Describe el objetivo de aprendizaje</p>
            <span className={`text-xs font-medium ${
              propositos[propositoActivo].texto.length > MAX_CARACTERES * 0.9
                ? 'text-error-600'
                : 'text-light-gray-500'
            }`}>
              {propositos[propositoActivo].texto.length}/{MAX_CARACTERES}
            </span>
          </div>
          {errores[propositoActivo]?.some(e => e.includes('propósito')) && (
            <div className="flex items-center gap-2 mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircleIcon className="w-4 h-4 text-error-600 flex-shrink-0" />
              <p className="text-sm text-error-700">
                {errores[propositoActivo].find(e => e.includes('propósito'))}
              </p>
            </div>
          )}
        </div>

        {/* Referentes */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-deep-blue-800 mb-3">
            <ListIcon className="w-4 h-4" />
            Referentes
          </label>
          <div className="space-y-3">
            {propositos[propositoActivo].referentes?.map((referente, rIndex) => (
              <div key={`ref-${propositoActivo}-${rIndex}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="blue" size="sm">
                    {rIndex + 1}
                  </Badge>
                  <span className="text-xs font-medium text-light-gray-600">
                    Referente {rIndex + 1}
                  </span>
                </div>
                <input
                  value={referente}
                  onChange={(e) => {
                    actualizarReferente(propositoActivo, rIndex, e.target.value);
                    validarProposito(propositoActivo);
                  }}
                  placeholder={`Texto del referente ${rIndex + 1}`}
                  className="w-full px-4 py-2.5 border border-light-gray-300 rounded-lg text-sm focus:outline-none focus:border-deep-blue-500 focus:ring-2 focus:ring-deep-blue-200 transition-all"
                />
                {errores[propositoActivo]?.some(e => e.includes(`referente ${rIndex + 1}`)) && (
                  <div className="flex items-center gap-2 mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircleIcon className="w-4 h-4 text-error-600 flex-shrink-0" />
                    <p className="text-sm text-error-700">
                      {errores[propositoActivo].find(e => e.includes(`referente ${rIndex + 1}`))}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Asignaturas asociadas */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-deep-blue-800 mb-3">
            <BookOpenIcon className="w-4 h-4" />
            Asignaturas asociadas
            {propositos[propositoActivo].asignaturas.length > 0 && (
              <Badge variant="info" size="sm">
                {propositos[propositoActivo].asignaturas.length}
              </Badge>
            )}
          </label>

          {/* Botón para crear nueva área */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setShowCreateAreaModal(true)}
              className="w-full px-4 py-3 text-sm font-medium text-deep-blue-700 bg-deep-blue-50 border-2 border-deep-blue-200 border-dashed rounded-lg hover:bg-deep-blue-100 hover:border-deep-blue-300 transition-all flex items-center justify-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Nueva Asignatura de Preescolar
            </button>
          </div>

          {/* Asignaturas disponibles */}
          {getAsignaturasDisponibles(propositoActivo).length > 0 && (
            <>
              <p className="text-xs text-light-gray-600 mb-3">Disponibles para agregar:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                {getAsignaturasDisponibles(propositoActivo).map(asignatura => (
                  <button
                    key={asignatura.id}
                    onClick={() => {
                      const nuevosPropositos = [...propositos];
                      //@ts-ignore
                      if (!nuevosPropositos[propositoActivo].asignaturas.includes(asignatura.id)) {
                        //@ts-ignore
                        nuevosPropositos[propositoActivo].asignaturas.push(asignatura.id);
                        setPropositos(nuevosPropositos);
                        validarProposito(propositoActivo);
                      }
                    }}
                    className="group flex items-center gap-2 px-4 py-3 text-sm font-medium text-light-gray-700 bg-white border-2 border-light-gray-200 rounded-lg hover:border-deep-blue-400 hover:bg-deep-blue-50 hover:text-deep-blue-700 transition-all text-left"
                  >
                    <div className="w-6 h-6 rounded-full bg-light-gray-100 group-hover:bg-deep-blue-100 flex items-center justify-center transition-colors">
                      <PlusIcon className="w-4 h-4 text-light-gray-500 group-hover:text-deep-blue-600" />
                    </div>
                    <span className="flex-1">{asignatura.asignatura}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Asignaturas seleccionadas */}
          {propositos[propositoActivo].asignaturas.length > 0 && (
            <>
              <p className="text-xs text-light-gray-600 mb-3">Asignaturas seleccionadas:</p>
              <div className="space-y-2">
                {propositos[propositoActivo].asignaturas.map(asignaturaId => {
                  const asignatura = asignaturasDisponibles.find(a => a.id === asignaturaId);
                  return (
                    <div
                      key={`sel-${asignaturaId}`}
                      className="group flex items-center justify-between px-4 py-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">
                          {asignatura?.asignatura || 'Asignatura no encontrada'}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          const nuevosPropositos = [...propositos];
                          nuevosPropositos[propositoActivo].asignaturas =
                            nuevosPropositos[propositoActivo].asignaturas.filter(id => id !== asignaturaId);
                          setPropositos(nuevosPropositos);
                          validarProposito(propositoActivo);
                        }}
                        className="p-1.5 rounded-md text-green-400 hover:text-error-600 hover:bg-red-50 transition-all"
                        title="Remover asignatura"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {errores[propositoActivo]?.some(e => e.includes('asignatura')) && (
            <div className="flex items-center gap-2 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircleIcon className="w-5 h-5 text-error-600 flex-shrink-0" />
              <p className="text-sm text-error-700 font-medium">
                {errores[propositoActivo].find(e => e.includes('asignatura'))}
              </p>
            </div>
          )}
        </div>

        </Card.Body>

        {/* Botones de navegación en Footer */}
        <Card.Footer>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {propositoActivo > 0 && (
                <button
                  onClick={() => setPropositoActivo(propositoActivo - 1)}
                  className="px-4 py-2 text-sm font-medium text-light-gray-700 bg-white border border-light-gray-300 rounded-lg hover:bg-light-gray-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Anterior
                </button>
              )}

              {propositoActivo < propositos.length - 1 && (
                <button
                  onClick={() => {
                    if (validarProposito(propositoActivo)) {
                      setPropositoActivo(propositoActivo + 1);
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  Siguiente
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>

            {propositoActivo === propositos.length - 1 && (
              <button
                onClick={guardarConfiguracion}
                className="px-6 py-2 text-sm font-medium text-white bg-deep-blue-600 rounded-lg hover:bg-deep-blue-700 transition-colors flex items-center gap-2"
              >
                <SaveIcon className="w-4 h-4" />
                Guardar configuración
              </button>
            )}
          </div>
        </Card.Footer>
      </Card>

      {/* Modal para crear nueva área */}
      <CreateAreaModal
        isOpen={showCreateAreaModal}
        onClose={() => setShowCreateAreaModal(false)}
        onSuccess={handleAreaCreated}
        areasExistentes={asignaturasDisponibles.map(a => a.asignatura)}
      />

      {/* Modal de confirmación para copiar configuración */}
      <ConfirmModal
        isOpen={showConfirmCopyModal}
        onClose={() => setShowConfirmCopyModal(false)}
        onConfirm={copiarDelAñoAnterior}
        title="Copiar Configuración"
        message={`¿Deseas copiar la configuración de propósitos e indicadores del año ${Number(year) - 1} al año ${year}?\n\nEsto reemplazará cualquier configuración existente para ${year}.`}
        confirmText="Sí, copiar"
        cancelText="Cancelar"
        variant="warning"
        isLoading={copiando}
      />
    </div>
  );
};

export default InformeConfigurador;
