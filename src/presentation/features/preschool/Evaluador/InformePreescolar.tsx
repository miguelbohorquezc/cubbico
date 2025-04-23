import React from 'react';
import { useParams } from 'react-router-dom';
import { useEvaluadorPreescolar } from './useEvaluadorPreescolar';

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
        <div className="ec-loading-container">
          <div className="ec-loading-spinner" />
          <p>Cargando información del informe...</p>
        </div>
      ) : (
        <div className='ec-informe-container'>
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

          <div className="ec-header-card">
            <div className="ec-student-meta">
              <div className="ec-meta-item">
                <span className="ec-meta-label">Estudiante:</span>
                <span className="ec-meta-value">
                  {studentName || studentId}
                </span>
              </div>
              <div className="ec-meta-item">
                <span className="ec-meta-label">Salón:</span>
                <span className="ec-meta-value">
                  {classroomName || classroomId}
                </span>
              </div>
              <div className="ec-meta-item">
                <span className="ec-meta-label">Periodo:</span>
                <span className="ec-meta-value">{safePeriod}</span>
              </div>
              <div className="ec-meta-item">
                <span className="ec-meta-label">Fecha:</span>
                <span className="ec-meta-value">{year}</span>
              </div>
            </div>
          </div>

          {/* Reestructuración de contenidos de propósitos */}
          <div className="ec-propositos-grid">
            {propositos.map((p, i) => (
              <div key={p.id} className="ec-proposito-card">
                <div className="ec-proposito-content">
                  <table>
                    <thead>
                      <tr>
                        <th colSpan={2}>{`Propósito ${i + 1}: ${p.texto}`}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <h4>Referentes</h4>
                          <ul>
                            {p.referentes.map((r, idx) => (
                              <li key={idx}>{r}</li>
                            ))}
                          </ul>
                        </td>
                        <td>
                          <h4>Indicadores</h4>
                          {p.asignaturas.map(aId => {
                            const nombre = obtenerNombreAsignatura(aId);
                            const opts = indicadores.filter(ind => ind.asignatura === aId);
                            const sel = selecciones[aId] || '';
                            return (
                              <div key={aId}>
                                <strong>{}</strong>
                                <select value={sel} disabled>
                                  <option value="">
                                    {sel ? opts.find(o => o.id === sel)?.texto : 'Sin selección'}
                                  </option>
                                </select>
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
            <div className="ec-success-message">
              <span className="ec-success-icon">✓</span> Selección guardada correctamente
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default InformePreescolar;