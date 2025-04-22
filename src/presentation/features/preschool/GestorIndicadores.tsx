import { useState, useEffect } from 'react';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebase';
import './GestorIndicadores.css';
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
const MAX_INDICADORES = 10;

const GestorIndicadores = ({ classRoomId, year, periodo }: Props) => {
  const [asignaturas, setAsignaturas] = useState<AreaIhsInfo[]>([]);
  const [indicadores, setIndicadores] = useState<Record<string, Indicador[]>>({});
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [asignaturaActiva, setAsignaturaActiva] = useState<string>('');
  const [indicadorEditando, setIndicadorEditando] = useState<Indicador | null>(null);
  const [formulario, setFormulario] = useState<Omit<Indicador, 'id'>>({
    texto: '',
    periodos: [periodo],
    asignatura: '',
    activo: true
  });
  const [errores, setErrores] = useState<string[]>([]);

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        
        // Cargar asignaturas
        const query = await getDocs(collection(db, 'areas'));
        const asignaturasData = query.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as AreaIhsInfo))
          .filter(a => a.nivel === 'preescolar');
        setAsignaturas(asignaturasData);
        setAsignaturaActiva(asignaturasData[0]?.id || '');

        // Cargar indicadores existentes
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
      setCargando(true);
      
      let nuevosIndicadores = { ...indicadores };
      const id = indicadorEditando ? indicadorEditando.id : Date.now().toString();
      
      if (indicadorEditando && indicadorEditando.asignatura !== formulario.asignatura) {
        nuevosIndicadores[indicadorEditando.asignatura] = nuevosIndicadores[indicadorEditando.asignatura]
          .filter(i => i.id !== id);
      }
      
      nuevosIndicadores[formulario.asignatura] = [
        ...(nuevosIndicadores[formulario.asignatura]?.filter(i => i.id !== id) || []),
        { ...formulario, id }
      ];
      
      await setDoc(doc(db, 'preschool_indicators', `${classRoomId}_${year}`), {
        indicadores: Object.values(nuevosIndicadores).flat(),
        _meta: { classRoomId, year, lastModified: new Date() }
      });
      
      setIndicadores(nuevosIndicadores);
      setMensaje({ 
        texto: `Indicador ${indicadorEditando ? 'actualizado' : 'creado'} correctamente`, 
        tipo: 'success' 
      });
      resetFormulario();
    } catch (error) {
      setMensaje({ texto: 'Error al guardar el indicador', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  const editarIndicador = (indicador: Indicador) => {
    setIndicadorEditando(indicador);
    setFormulario({
      texto: indicador.texto,
      periodos: [...indicador.periodos],
      asignatura: indicador.asignatura,
      activo: indicador.activo
    });
    document.querySelector('.columna-formulario')?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetFormulario = () => {
    setIndicadorEditando(null);
    setFormulario({
      texto: '',
      periodos: [periodo],
      asignatura: asignaturaActiva,
      activo: true
    });
    setErrores([]);
  };

  const cancelarEdicion = () => {
    resetFormulario();
  };

  const toggleActivo = async (asignatura: string, id: string) => {
    try {
      setCargando(true);
      const nuevosIndicadores = { ...indicadores };
      const index = nuevosIndicadores[asignatura].findIndex(i => i.id === id);
      
      if (index !== -1) {
        nuevosIndicadores[asignatura][index].activo = !nuevosIndicadores[asignatura][index].activo;
        
        await setDoc(doc(db, 'preschool_indicators', `${classRoomId}_${year}`), {
          indicadores: Object.values(nuevosIndicadores).flat()
        });
        
        setIndicadores(nuevosIndicadores);
      }
    } catch (error) {
      setMensaje({ texto: 'Error al actualizar el estado', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando indicadores...</p>
      </div>
    );
  }

  return (
    <div className="gestor-indicadores">
      {/* <header className="config-header">
        <h2>Gestor de Indicadores de Desempeño</h2>
        <p className="subtitulo">Periodo {periodo} - Año {year}</p>
      </header> */}

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
        <div className="columna-asignaturas">
          <div className="asignaturas-card">
            <h3>Asignaturas</h3>
            <div className="asignaturas-lista">
              {asignaturas.map(asignatura => (
                <div 
                  key={asignatura.id}
                  className={`asignatura-item ${asignaturaActiva === asignatura.id ? 'activa' : ''}`}
                  onClick={() => {
                    if (asignatura.id) {
                      setAsignaturaActiva(asignatura.id);
                      setFormulario(prev => ({
                        ...prev,
                        asignatura: asignatura.id || ''
                      }));
                      setIndicadorEditando(null);
                    }
                  }}
                >
                  <div className="asignatura-info">
                    <span className="asignatura-nombre">{asignatura.asignatura}</span>
                    <span className="indicador-count">
                      {asignatura.id && (indicadores[asignatura.id]?.length || 0)}/{MAX_INDICADORES}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{
                        width: `${asignatura.id ? ((indicadores[asignatura.id]?.length || 0) / MAX_INDICADORES * 100) : 0}%`,
                        backgroundColor: asignatura.id && (indicadores[asignatura.id]?.length || 0) >= MAX_INDICADORES 
                          ? '#ff6b6b' 
                          : '#4fd1c5'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            
          </div>
        </div>

        <div className="columna-indicadores">
  {asignaturaActiva ? (
    <>
      <div className="indicadores-header">
        <h3>
          {asignaturas.find(a => a.id === asignaturaActiva)?.asignatura || 'Asignatura'}
        </h3>
        <div className="indicador-status">
          <span className="activos">
            {indicadores[asignaturaActiva]?.filter(i => i.activo).length || 0} activos
          </span>
          <span className="total">
            {indicadores[asignaturaActiva]?.length || 0} total
          </span>
        </div>
      </div>

      <div className="indicadores-lista">
        {indicadores[asignaturaActiva]?.length > 0 ? (
          <>
            {indicadores[asignaturaActiva].map(indicador => (
              <div 
                key={indicador.id}
                className={`indicador-item ${!indicador.activo ? 'inactivo' : ''} ${indicadorEditando?.id === indicador.id ? 'editando' : ''}`}
                onClick={() => editarIndicador(indicador)}
              >
                <div className="indicador-content">
                  <p className="indicador-texto">{indicador.texto}</p>
                  <div className="indicador-meta">
                    <span className="periodos">
                      {indicador.periodos.map(p => `P${p}`).join(', ')}
                    </span>
                    <span className={`estado ${indicador.activo ? 'activo' : 'inactivo'}`}>
                      {indicador.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                <button
                  className={`toggle-activo ${indicador.activo ? 'activo' : 'inactivo'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleActivo(asignaturaActiva, indicador.id);
                  }}
                  aria-label={indicador.activo ? 'Desactivar indicador' : 'Activar indicador'}
                >
                  {indicador.activo ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth="2" strokeLinecap="round"/>
                      <polyline points="22 4 12 14.01 9 11.01" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )}
                </button>
              </div>
            ))}
            
            {/* Nuevo botón para crear indicador */}
            <button 
              className="btn-crear-indicador"
              onClick={() => {
                setFormulario(prev => ({
                  ...prev,
                  texto: '',
                  periodos: [periodo],
                  asignatura: asignaturaActiva,
                  activo: true
                }));
                setIndicadorEditando(null);
                document.querySelector('.columna-formulario')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" strokeLinecap="round"/>
                <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Crear nuevo indicador
            </button>
          </>
        ) : (
          <div className="sin-indicadores">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="9" x2="12" y2="13" strokeWidth="2" strokeLinecap="round"/>
              <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p>No hay indicadores para esta asignatura</p>
            <button 
              className="btn-crear-primero"
              onClick={() => {
                setFormulario(prev => ({
                  ...prev,
                  texto: '',
                  periodos: [periodo],
                  asignatura: asignaturaActiva,
                  activo: true
                }));
                setIndicadorEditando(null);
                document.querySelector('.columna-formulario')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Crear primer indicador
            </button>
          </div>
        )}
      </div>
    </>
  ) : (
    <div className="sin-asignatura">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="10" strokeWidth="2"/>
        <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round"/>
        <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <p>Seleccione una asignatura para ver o crear indicadores</p>
    </div>
  )}
</div>

<div className="columna-formulario">
  <div className="formulario-card">
    <div className="formulario-header">
      <h3>{indicadorEditando ? 'Editar Indicador' : 'Nuevo Indicador'}</h3>
    </div>
    
    {asignaturaActiva && (
      <>
        <div className="form-group">
          <label>Asignatura:</label>
          <div className="asignatura-seleccionada">
            {asignaturas.find(a => a.id === asignaturaActiva)?.asignatura}
          </div>
        </div>

        <div className="form-group">
          <label>Texto del indicador:</label>
          <div className="textarea-container">
            <textarea
              value={formulario.texto}
              onChange={(e) => setFormulario({
                ...formulario,
                texto: e.target.value
              })}
              placeholder="Ej: Identifica y cuenta números del 1 al 10..."
              className={`indicador-input ${errores.length > 0 ? 'error' : ''}`}
              maxLength={MAX_CARACTERES}
              rows={5}
              style={{
                minHeight: '120px',
                resize: 'vertical',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                transition: 'border 0.3s ease',
                width: '100%'
              }}
            />
            <div className="textarea-footer">
              <div className="contador-caracteres">
                {formulario.texto.length}/{MAX_CARACTERES}
              </div>
              <div className="sugerencia">
                <small>Sé específico y observable. Ej: "Reconoce y nombra las figuras geométricas básicas"</small>
              </div>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Periodos aplicables:</label>
          <div className="periodos-grid">
            {[1, 2, 3, 4].map(p => (
              <button
                key={`periodo-${p}`}
                type="button"
                className={`periodo-item ${formulario.periodos.includes(p) ? 'seleccionado' : ''}`}
                onClick={() => {
                  const nuevosPeriodos = formulario.periodos.includes(p)
                    ? formulario.periodos.filter(periodo => periodo !== p)
                    : [...formulario.periodos, p];
                  
                  setFormulario({
                    ...formulario,
                    periodos: nuevosPeriodos
                  });
                }}
              >
                Periodo {p}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group-checkbox">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formulario.activo}
              onChange={(e) => setFormulario({
                ...formulario,
                activo: e.target.checked
              })}
              className="checkbox-input"
            />
            <span className="checkbox-custom"></span>
            <span className="checkbox-text">Indicador activo</span>
          </label>
        </div>

        {errores.length > 0 && (
          <div className="errores-container">
            {errores.map((error, index) => (
              <div key={index} className="error-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>{error}</span>
              </div>
            ))}
          </div>
        )}

        <div className="form-actions">
          {indicadorEditando && (
            <button
              className="btn-cancelar"
              onClick={cancelarEdicion}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round"/>
                <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Cancelar
            </button>
          )}
          <button
            className="btn-guardar"
            onClick={guardarIndicador}
            disabled={
              !formulario.texto.trim() || 
              (indicadores[asignaturaActiva]?.length || 0) >= MAX_INDICADORES && !indicadorEditando
            }
          >
            {indicadorEditando ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Actualizar
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="17 21 17 13 7 13 7 21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="7 3 7 8 15 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Guardar
              </>
            )}
          </button>
        </div>
      </>
    )}
  </div>
</div>
      </div>
    </div>
  );
};

export default GestorIndicadores;