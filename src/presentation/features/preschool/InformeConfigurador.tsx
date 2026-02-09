import { useState, useEffect } from 'react';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebase';
import { AreaIhsInfo } from '../../../domain/entities/area';

interface Proposito {
  id: string;
  texto: string;
  referentes: string[];
  asignaturas: string[];
}

const MAX_CARACTERES = 500;

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

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);

        // Cargar asignaturas
        const query = await getDocs(collection(db, 'areas'));
        const asignaturas = query.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as AreaIhsInfo))
          .filter(a => a.nivel === 'preescolar');
        setAsignaturasDisponibles(asignaturas);

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

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-white rounded-lg border border-gray-200">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-gray-700">Cargando configuración...</p>
      </div>
    );
  }

  const progreso = calcularProgreso();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Toast de notificación */}
      {mensaje.texto && (
        <div className={`fixed top-6 right-6 z-50 max-w-md ${
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

      {/* Barra de progreso */}
      <div className="mb-6 bg-white border border-gray-200 shadow-sm rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">
            Progreso: {progreso.completados}/{progreso.total} propósitos
          </span>
          <span className="text-sm font-semibold text-emerald-600">{progreso.porcentaje}%</span>
        </div>
        <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${progreso.porcentaje}%` }}
          />
        </div>
      </div>

      {/* Tabs de propósitos */}
      <div className="mb-8 flex items-center gap-2">
        {propositos.map((_, index) => (
          <button
            key={index}
            onClick={() => setPropositoActivo(index)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              propositoActivo === index
                ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-500'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Propósito {index + 1}
          </button>
        ))}
      </div>

      {/* Formulario del propósito activo */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-8 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Propósito {propositoActivo + 1}
        </h3>

        {/* Descripción del propósito */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Descripción del propósito
          </label>
          <textarea
            value={propositos[propositoActivo].texto}
            onChange={(e) => {
              actualizarProposito(propositoActivo, 'texto', e.target.value);
              validarProposito(propositoActivo);
            }}
            placeholder="Redacte el propósito..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm resize-vertical min-h-[100px] focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
            maxLength={MAX_CARACTERES}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">Describe el objetivo de aprendizaje</p>
            <span className={`text-xs font-medium ${
              propositos[propositoActivo].texto.length > MAX_CARACTERES * 0.9
                ? 'text-red-600'
                : 'text-gray-500'
            }`}>
              {propositos[propositoActivo].texto.length}/{MAX_CARACTERES}
            </span>
          </div>
          {errores[propositoActivo]?.some(e => e.includes('propósito')) && (
            <p className="text-sm text-red-600 mt-2">
              {errores[propositoActivo].find(e => e.includes('propósito'))}
            </p>
          )}
        </div>

        {/* Referentes */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Referentes
          </label>
          <div className="space-y-4">
            {propositos[propositoActivo].referentes?.map((referente, rIndex) => (
              <div key={`ref-${propositoActivo}-${rIndex}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-500">
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                />
                {errores[propositoActivo]?.some(e => e.includes(`referente ${rIndex + 1}`)) && (
                  <p className="text-sm text-red-600 mt-1">
                    {errores[propositoActivo].find(e => e.includes(`referente ${rIndex + 1}`))}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Asignaturas asociadas */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Asignaturas asociadas
          </label>

          {/* Asignaturas disponibles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-6">
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
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <span className="text-gray-400 mr-2">+</span>
                {asignatura.asignatura}
              </button>
            ))}
          </div>

          {/* Asignaturas seleccionadas */}
          {propositos[propositoActivo].asignaturas.length > 0 && (
            <div className="space-y-2">
              {propositos[propositoActivo].asignaturas.map(asignaturaId => {
                const asignatura = asignaturasDisponibles.find(a => a.id === asignaturaId);
                return (
                  <div
                    key={`sel-${asignaturaId}`}
                    className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      {asignatura?.asignatura || 'Asignatura no encontrada'}
                    </span>
                    <button
                      onClick={() => {
                        const nuevosPropositos = [...propositos];
                        nuevosPropositos[propositoActivo].asignaturas =
                          nuevosPropositos[propositoActivo].asignaturas.filter(id => id !== asignaturaId);
                        setPropositos(nuevosPropositos);
                        validarProposito(propositoActivo);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {errores[propositoActivo]?.some(e => e.includes('asignatura')) && (
            <p className="text-sm text-red-600 mt-2">
              {errores[propositoActivo].find(e => e.includes('asignatura'))}
            </p>
          )}
        </div>

        {/* Botones de navegación */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="flex gap-2">
            {propositoActivo > 0 && (
              <button
                onClick={() => setPropositoActivo(propositoActivo - 1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
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
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
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
              className="px-6 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Guardar configuración
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InformeConfigurador;
