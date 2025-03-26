import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebase';
import './EvaluadorCompleto.css';

interface Indicador {
  id: string;
  texto: string;
  periodos: number[];
  asignatura: string; // Este es el docRefId del área
  activo: boolean;
  nivel: 'básico' | 'intermedio' | 'avanzado';
}

interface Proposito {
  id: string;
  texto: string;
  referentes: string[];
  asignaturas: string[]; // Estos son los docRefIds de las áreas
}

interface Area {
  id: string; // docRefId
  asignatura: string; // Nombre real de la asignatura
  area?: string;
  ihs?: number;
  orden?: number;
  nivel?: string;
}

interface Props {
  studentId: string;
  periodo: number;
  year: string;
  classRoomId: string;
}

const EvaluadorCompleto = ({ studentId, periodo, year, classRoomId }: Props) => {
  const [propositos, setPropositos] = useState<Proposito[]>([]);
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [selecciones, setSelecciones] = useState<Record<string, string>>({});
  const [areas, setAreas] = useState<Area[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        
        // Cargar todas las áreas primero para tener los nombres
        const areasSnapshot = await getDocs(collection(db, 'areas'));
        const areasData = areasSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Area[];
        setAreas(areasData);

        // Cargar el resto de datos
        const [propositosSnap, indicadoresSnap, seleccionesSnap] = await Promise.all([
          getDoc(doc(db, 'preschool_config', `${classRoomId}_${year}`)),
          getDoc(doc(db, 'preschool_indicators', `${classRoomId}_${year}`)),
          getDoc(doc(db, 'preschool_selections', `${classRoomId}_${year}_${studentId}`))
        ]);

        setPropositos(propositosSnap.exists() ? propositosSnap.data().propositos || [] : []);
        
        const indicadoresData = indicadoresSnap.exists() 
          ? (indicadoresSnap.data().indicadores || [])
              .filter((ind: Indicador) => ind.activo && ind.periodos.includes(periodo))
          : [];
        setIndicadores(indicadoresData);

        setSelecciones(seleccionesSnap.exists() ? seleccionesSnap.data().selecciones || {} : {});

      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [studentId, periodo, year, classRoomId]);

  // Función para obtener el nombre de la asignatura por su docRefId
  const obtenerNombreAsignatura = (docRefId: string): string => {
    const area = areas.find(a => a.id === docRefId);
    return area?.asignatura || docRefId; // Fallback al ID si no se encuentra
  };

  const handleSeleccion = (asignaturaId: string, indicadorId: string) => {
    setSelecciones(prev => ({
      ...prev,
      [asignaturaId]: indicadorId
    }));
  };

  const guardarEvaluacion = async () => {
    try {
      setGuardando(true);
      
      await setDoc(
        doc(db, 'preschool_selections', `${classRoomId}_${year}_${studentId}`), 
        {
          selecciones,
          _meta: {
            studentId,
            classRoomId,
            year,
            periodo,
            lastUpdate: new Date(),
            completado: true
          }
        }, 
        { merge: true }
      );

      setMostrarExito(true);
      setTimeout(() => setMostrarExito(false), 3000);
    } catch (error) {
      console.error('Error guardando evaluación:', error);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando información del evaluador...</p>
      </div>
    );
  }

  return (
    <div className="evaluador-container">
      <div className="header-card">
        <h2>Selección de Indicadores</h2>
        <div className="student-meta">
          <div className="meta-item">
            <span className="meta-label">Estudiante:</span>
            <span className="meta-value">{studentId}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Periodo:</span>
            <span className="meta-value">{periodo}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Año:</span>
            <span className="meta-value">{year}</span>
          </div>
        </div>
      </div>

      <div className="propositos-grid">
        {propositos.map((proposito) => (
          <div key={`p-${proposito.id}`} className="proposito-card">
            <div className="proposito-header">
              <div className="proposito-icon">📌</div>
              <h3>{proposito.texto}</h3>
            </div>

            <div className="proposito-content">
              <div className="referentes-panel">
                <h4 className="section-title">
                  <span className="section-icon">📚</span>
                  Referentes
                </h4>
                <ul className="referentes-list">
                  {proposito.referentes.map((referente, index) => (
                    <li key={`ref-${proposito.id}-${index}`} className="referente-item">
                      {referente}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="asignaturas-panel">
                <h4 className="section-title">
                  <span className="section-icon">📝</span>
                  Asignaturas
                </h4>
                
                {proposito.asignaturas.map((asignaturaId) => {
                  const nombreAsignatura = obtenerNombreAsignatura(asignaturaId);
                  const indicadoresAsignatura = indicadores.filter(
                    ind => ind.asignatura === asignaturaId
                  );
                  const indicadorSeleccionadoId = selecciones[asignaturaId];

                  return (
                    <div key={`asig-${asignaturaId}`} className="asignatura-selector">
                      <h5 className="asignatura-title">
                        <span className="asignatura-icon">📘</span>
                        {nombreAsignatura}
                      </h5>
                      
                      <select
                        value={indicadorSeleccionadoId || ''}
                        onChange={(e) => handleSeleccion(asignaturaId, e.target.value)}
                        className="indicador-select"
                      >
                        <option value="">Seleccione un indicador...</option>
                        {indicadoresAsignatura.map((indicador) => (
                          <option 
                            key={`opt-${indicador.id}`} 
                            value={indicador.id}
                            title={`${indicador.texto} (${indicador.nivel})`}
                          >
                            {indicador.texto} ({indicador.nivel})
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="action-bar">
        <button 
          onClick={guardarEvaluacion}
          disabled={guardando || Object.keys(selecciones).length === 0}
          className={`save-button ${guardando ? 'guardando' : ''}`}
        >
          {guardando ? (
            <>
              <span className="button-spinner"></span>
              Guardando...
            </>
          ) : (
            'Guardar Selección'
          )}
        </button>
        
        {mostrarExito && (
          <div className="success-message">
            <span className="success-icon">✓</span>
            Selección guardada correctamente
          </div>
        )}
      </div>
    </div>
  );
};

export default EvaluadorCompleto;