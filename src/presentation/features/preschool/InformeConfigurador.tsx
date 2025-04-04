import { useState, useEffect } from 'react';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebase';
import './InformeConfigurador.css';
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
      a => !asignaturasUsadasEnOtros.includes(a.id) && 
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
      setMensaje({ texto: 'Configuración guardada exitosamente!', tipo: 'success' });
    } catch (error) {
      setMensaje({ texto: 'Error al guardar la configuración', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando configuración...</p>
      </div>
    );
  }

  const progreso = calcularProgreso();

  return (
    <div className="informe-configurador">
      <header className="config-header">
        {/* <h2>Configuración de Informes Preescolares - {year}</h2>
        <p className="subtitulo">Salón: {classRoomId}</p> */}
        
        {/* Barra de progreso general */}
        <div className="progreso-general">
          <div className="progreso-info">
            <span>Progreso general: {progreso.completados}/{progreso.total} propósitos</span>
            <span>{progreso.porcentaje}%</span>
          </div>
          <div className="progreso-bar">
            <div 
              className="progreso-fill"
              style={{ width: `${progreso.porcentaje}%` }}
            ></div>
          </div>
        </div>
      </header>

      {mensaje.texto && (
        <div className={`mensaje ${mensaje.tipo}`}>
          {mensaje.texto}
          <button 
            onClick={() => setMensaje({ texto: '', tipo: '' })} 
            className="cerrar-mensaje"
          >
            ×
          </button>
        </div>
      )}

      <div className="contenedor-principal">
        {/* Columna izquierda - Formulario activo */}
        <div className="columna-formulario-propositos">
          <div className="proposito-card">
            <div className="card-header">
              <h3>Propósito {propositoActivo + 1}</h3>
              <span className="status-badge">
                {propositos[propositoActivo].asignaturas.length} asignaturas
              </span>
            </div>
            
            <div className="form-group">
              <label>Descripción del propósito:</label>
              <div className="textarea-container">
                <textarea
                  value={propositos[propositoActivo].texto}
                  onChange={(e) => {
                    actualizarProposito(propositoActivo, 'texto', e.target.value);
                    validarProposito(propositoActivo);
                  }}
                  placeholder="Redacte el propósito..."
                  className={`proposito-input ${errores[propositoActivo]?.some(e => e.includes('propósito')) ? 'error' : ''}`}
                  maxLength={MAX_CARACTERES}
                />
                <div className="caracteres-contador">
                  {propositos[propositoActivo].texto.length}/{MAX_CARACTERES}
                </div>
              </div>
              {errores[propositoActivo]?.some(e => e.includes('propósito')) && (
                <p className="error-mensaje">
                  {errores[propositoActivo].find(e => e.includes('propósito'))}
                </p>
              )}
            </div>
            
            <div className="form-group">
              <label>Referentes:</label>
              <div className="referentes-grid">
                {propositos[propositoActivo].referentes?.map((referente, rIndex) => (
                  <div key={`ref-${propositoActivo}-${rIndex}`} className="referente-item">
                    <span className="referente-index">Referente {rIndex + 1}</span>
                    <input
                      value={referente}
                      onChange={(e) => {
                        actualizarReferente(propositoActivo, rIndex, e.target.value);
                        validarProposito(propositoActivo);
                      }}
                      placeholder={`Texto del referente ${rIndex + 1}`}
                      className={`referente-input ${errores[propositoActivo]?.some(e => e.includes(`referente ${rIndex + 1}`)) ? 'error' : ''}`}
                    />
                    {errores[propositoActivo]?.some(e => e.includes(`referente ${rIndex + 1}`)) && (
                      <p className="error-mensaje">
                        {errores[propositoActivo].find(e => e.includes(`referente ${rIndex + 1}`))}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label>Asignaturas asociadas:</label>
              {errores[propositoActivo]?.some(e => e.includes('asignatura')) && (
                <p className="error-mensaje">
                  {errores[propositoActivo].find(e => e.includes('asignatura'))}
                </p>
              )}
              
              <div className="asignaturas-grid">
                {getAsignaturasDisponibles(propositoActivo).map(asignatura => (
                  <div 
                    key={asignatura.id} 
                    className="asignatura-item"
                    onClick={() => {
                      const nuevosPropositos = [...propositos];
                      if (!nuevosPropositos[propositoActivo].asignaturas.includes(asignatura.id)) {
                        nuevosPropositos[propositoActivo].asignaturas.push(asignatura.id);
                        setPropositos(nuevosPropositos);
                        validarProposito(propositoActivo);
                      }
                    }}
                  >
                    <div className="asignatura-checkbox">
                      <span className="checkmark">+</span>
                    </div>
                    <span className="asignatura-nombre">{asignatura.asignatura}</span>
                  </div>
                ))}
              </div>
              
              <div className="asignaturas-seleccionadas">
                {propositos[propositoActivo].asignaturas.map(asignaturaId => {
                  const asignatura = asignaturasDisponibles.find(a => a.id === asignaturaId);
                  return (
                    <div key={`sel-${asignaturaId}`} className="asignatura-seleccionada">
                      <span>{asignatura?.asignatura || 'Asignatura no encontrada'}</span>
                      <button
                        onClick={() => {
                          const nuevosPropositos = [...propositos];
                          nuevosPropositos[propositoActivo].asignaturas = 
                            nuevosPropositos[propositoActivo].asignaturas.filter(id => id !== asignaturaId);
                          setPropositos(nuevosPropositos);
                          validarProposito(propositoActivo);
                        }}
                        className="eliminar-asignatura"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="proposito-actions">
              {propositoActivo > 0 && (
                <button 
                  className="proposito-btn anterior"
                  onClick={() => setPropositoActivo(propositoActivo - 1)}
                >
                  ← Anterior
                </button>
              )}
              
              {propositoActivo < propositos.length - 1 ? (
                <button 
                  className="proposito-btn siguiente"
                  onClick={() => {
                    if (validarProposito(propositoActivo)) {
                      setPropositoActivo(propositoActivo + 1);
                    }
                  }}
                >
                  Siguiente →
                </button>
              ) : (
                <button 
                  className="proposito-btn guardar"
                  onClick={guardarConfiguracion}
                >
                  Guardar Configuración
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Columna derecha - Lista de propósitos */}
        <div className="columna-lista">
          <h3>Propósitos Configurados</h3>
          <div className="lista-propositos">
            {propositos.map((proposito, index) => (
              <div 
                key={proposito.id} 
                className={`proposito-resumen ${index === propositoActivo ? 'activo' : ''}`}
                onClick={() => setPropositoActivo(index)}
              >
                <h4>Propósito {index + 1}</h4>
                <p className="proposito-texto-resumen">
                  {proposito.texto || <em>Sin descripción</em>}
                </p>
                <div className="asignaturas-resumen">
                  {proposito.asignaturas.length > 0 ? (
                    proposito.asignaturas.map(id => {
                      const asignatura = asignaturasDisponibles.find(a => a.id === id);
                      return (
                        <span key={`res-${id}`} className="asignatura-resumen">
                          {asignatura?.asignatura || '...'}
                        </span>
                      );
                    })
                  ) : (
                    <span className="sin-asignaturas">Sin asignaturas</span>
                  )}
                </div>
                <div className="referentes-resumen">
                  {proposito.referentes.filter(r => r.trim()).length > 0 ? (
                    <span>{proposito.referentes.filter(r => r.trim()).length} referentes</span>
                  ) : (
                    <span className="sin-referentes">Sin referentes</span>
                  )}
                </div>
                <div className="progreso-miniatura">
                  <div className="progreso-bar-mini">
                    <div 
                      className="progreso-fill-mini"
                      style={{ 
                        width: `${(proposito.texto.trim() && 
                                 proposito.referentes.every(r => r.trim()) && 
                                 proposito.asignaturas.length > 0) ? 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformeConfigurador;