import React from 'react';
import { useEvaluadorCompleto } from './useEvaluadorCompleto';
import './EvaluadorCompleto.css';

interface Props {
  studentId: string;
  periodo: number;
  year: string;
  classRoomId: string;
}

const EvaluadorCompleto = (props: Props) => {
  const {
    studentName,
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
        <div className="ec-loading-container">
          <div className="ec-loading-spinner" />
          <p>Cargando información del evaluador...</p>
        </div>
      ) : (
        <div>
          <div className="ec-header-card">
            <p>Selección de Indicadores</p>
            <div className="ec-student-meta">
              <div className="ec-meta-item">
                <span className="ec-meta-label">Estudiante:</span>
                <span className="ec-meta-value">
                  {studentName || props.studentId}
                </span>
              </div>
              <div className="ec-meta-item">
                <span className="ec-meta-label">Periodo:</span>
                <span className="ec-meta-value">{props.periodo}</span>
              </div>
              <div className="ec-meta-item">
                <span className="ec-meta-label">Año:</span>
                <span className="ec-meta-value">{props.year}</span>
              </div>
            </div>
          </div>

          <div className="ec-propositos-grid">
            {propositos.map((p, i )=> (
              <div key={p.id} className="ec-proposito-card">
                <div className="ec-proposito-header">
                  <div className="ec-proposito-icon"><h2>{`Propósito ${i+1}`}</h2></div>
                  <p>{p.texto}</p>
                </div>
                <div className="ec-proposito-content">
                  <div className="ec-referentes-panel">
                    <h4 className="ec-section-title">
                      <span className="ec-section-icon">📚</span>
                      <p>Referentes</p>
                    </h4>
                    <ul className="ec-referentes-list">
                      {p.referentes.map((r,i) => <li key={i} className="ec-referente-item">{r}</li>)}
                    </ul>
                  </div>
                  <div className="ec-asignaturas-panel">
                    <h4 className="ec-section-title">
                      <span className="ec-section-icon">📝</span>
                      <p>Indicadores por asignatura</p>
                    </h4>
                    {p.asignaturas.map(aId => {
                      const nombre = obtenerNombreAsignatura(aId);
                      const opts = indicadores.filter(i => i.asignatura === aId);
                      const sel = selecciones[aId] || '';
                      return (
                        <div key={aId}>
                          <h5 className="ec-asignatura-title">
                            <span className="ec-asignatura-icon">📘</span>
                            {nombre}
                          </h5>
                          <select
                            className="ec-indicador-select"
                            value={sel}
                            onChange={e => handleSeleccion(aId, e.target.value)}
                          >
                            <option value="">Seleccione un indicador...</option>
                            {opts.map(o => (
                              <option key={o.id} value={o.id} title={`${o.texto} (${o.nivel})`}>{o.texto} ({o.nivel})</option>
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

          <div className="ec-action-bar">
            <button
              className={`ec-save-button ${guardando ? 'ec-guardando' : ''}`}
              disabled={guardando || Object.keys(selecciones).length === 0}
              onClick={guardarEvaluacion}
            >
              {guardando ? (
                <><span className="ec-button-spinner" /> Guardando...</>
              ) : 'Guardar Selección'}
            </button>
            {mostrarExito && <div className="ec-success-message"><span className="ec-success-icon">✓</span>Selección guardada correctamente</div>}
          </div>
        </div>
      )}
    </>
  );
};

export default EvaluadorCompleto;