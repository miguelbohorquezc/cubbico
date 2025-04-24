import React from 'react';
import { useParams } from 'react-router-dom';
import { useEvaluadorPreescolar } from './useEvaluadorPreescolar';
import './InformePreescolar.css'; // Asegúrate de tener el CSS correspondiente

import logo from '../../../../assets/logo/logotipo.jpg';

type Params = {
  classroomId: string;
  studentId: string;
  periodId: string;
  year: string;
};

const InformePreescolar: React.FC = () => {
  const {
    classroomId = '',
    studentId = '',
    periodId = '0',
    year = ''
  } = useParams<Params>();

  const safePeriod = parseInt(periodId, 10) || 0;

  const {
    studentName,
    classroomName,
    propositos,
    indicadores,
    selecciones,
    obtenerNombreAsignatura,
    cargando,
    mostrarExito
  } = useEvaluadorPreescolar({
    studentId,
    periodo: safePeriod,
    year,
    classRoomId: classroomId
  });

  return (
    <>
      {cargando ? (
        <div className="ip-loading-container">
          <div className="ip-loading-spinner" />
          <p>Cargando información del informe...</p>
        </div>
      ) : (
        <div className='ip-informe-container'>
          <table className="table-header-info-report">
            <thead className="thead-header-info">
              <tr className="tr-header">
                <td className="td-logo-school" rowSpan={2}>
                  <img src={logo} alt="logotipo" />
                </td>
                <td align="center" className="td-header">
                  <b>COLINA CAMPESTRE SCHOOL</b>
                  <p>
                    De Sincelejo, Sucre, con reconocimiento oficial en los niveles de Preescolar, Básica Primaria y Básica Secundaria por parte de Secretaría de Educación Municipal,
                    según resolución No 2747 del 12 de diciembre de 2023. Carrera 34 No 38-158, teléfonos: 2771068-3006781806
                  </p>
                  <p>NIT: 901731191-3</p>
                </td>
                <td align="center" className="td-dane">DANE 370001038852</td>
              </tr>
            </thead>
          </table>

          <div className="ip-header-card">
            <div className="ip-student-meta">
              <div className="ip-meta-item">
                <span className="ip-meta-label">ESTUDIANTE:</span>
                <span className="ip-meta-value">
                  {studentName || studentId}
                </span>
              </div>
              <div className="ip-meta-item">
                <span className="ip-meta-label">SALÓN DE CLASES:</span>
                <span className="ip-meta-value">
                  {classroomName.toUpperCase() || classroomId}
                </span>
              </div>
              <div className="ip-meta-item">
                <span className="ip-meta-label">Periodo:</span>
                <span className="ip-meta-value">{safePeriod}</span>
              </div>
              <div className="ip-meta-item">
                <span className="ip-meta-label">Fecha:</span>
                <span className="ip-meta-value">30/04/2025</span>
              </div>
            </div>
          </div>

          {/* Reestructuración de contenidos de propósitos */}
          <div className="ip-propositos-grid">
            {propositos.map((p, i) => (
              <div key={p.id} className="ip-proposito-card">
                <div className="ip-proposito-content">
                  <table>
                    <thead>
                      <tr>
                        <th colSpan={2}>{`Propósito ${i + 1}: ${p.texto}`}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className='ip-proposito-row-referentes'>
                          <h4>Referentes</h4>
                          <ul>
                            {p.referentes.map((r, idx) => (
                              <li key={idx}>{r}</li>
                            ))}
                          </ul>
                        </td>
                        <td className='ip-proposito-row-indicadores'>
                          <h4>Indicadores</h4>
                          {p.asignaturas.map(aId => {
  const opts = indicadores.filter(ind => ind.asignatura === aId);
  const sel = selecciones[aId] || '';
  const indicador = opts.find(o => o.id === sel);

  return (
    <div key={aId} className="ip-indicador-item-container">
      {indicador 
        ? <p className="ip-indicador-text">{indicador.texto}</p>
        : <p className="ip-indicador-text--empty">Sin selección</p>
      }
    </div>
  );
})}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          {mostrarExito && (
            <div className="ip-success-message">
              <span className="ip-success-icon">✓</span> Selección guardada correctamente
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default InformePreescolar;
