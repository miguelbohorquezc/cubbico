import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useEvaluadorPreescolar } from './useEvaluadorPreescolar';
import './InformePreescolar.css';
import logo from '../../../../assets/logo/logotipo.jpg';
import logoPreschool from '../../../../assets/logo/logoPreschool.svg';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../infrastructure/firebase/firebase';


import firmOne from "../../../../assets/firm/01.jpg";
import firmTwo from "../../../../assets/firm/02.jpg";

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
    year = '',
  } = useParams<Params>();

  const safePeriod = parseInt(periodId, 10) || 0;

  const {
    studentName,
    classroomName,
    propositos,
    indicadores,
    selecciones,
    // @ts-ignore
    obtenerNombreAsignatura,
    cargando,
    mostrarExito,
  } = useEvaluadorPreescolar({
    studentId,
    periodo: safePeriod,
    year,
    classRoomId: classroomId,
  });

  const [directorGrupo, setDirectorGrupo] = useState<string>('');

  useEffect(() => {
    if (!classroomId) return;
    const fetchDirector = async () => {
      try {
        const ref = doc(db, 'classRooms', classroomId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setDirectorGrupo(data.directorGrupo || '');
        }
      } catch (err) {
        console.error('Error fetching directorGrupo:', err);
      }
    };
    fetchDirector();
  }, [classroomId]);

  return (
    <>
      {cargando ? (
        <div className="ip-loading-container">
          <div className="ip-loading-spinner" />
          <p>Cargando información del informe...</p>
        </div>
      ) : (
        <div className="ip-informe-container">
          <table className="table-header-info-report">
            <thead className="thead-header-info">
              <tr className="tr-header">
                <td className="td-logo-school" rowSpan={2}>
                  <img src={logo} alt="logotipo" />
                </td>
                <td align="center" className="td-header">
                  <b>COLINA CAMPESTRE SCHOOL</b>
                  <p>
                    De Sincelejo, Sucre, con reconocimiento oficial en
                    los niveles de Preescolar, Básica Primaria y Básica
                    Secundaria por parte de Secretaría de Educación
                    Municipal, según resolución No 2747 del 12 de diciembre
                    de 2023. Carrera 34 No 38-158, teléfonos:
                    2771068-3006781806
                  </p>
                  <p>NIT: 901731191-3</p>
                </td>
                <td align="center" className="td-dane"><img className='logoPreschool' src={logoPreschool} alt="logotipo"/><p>DANE 370001038852</p></td>
                        
              </tr>
            </thead>
          </table>

          <div className="ip-header-card">
            <div className="ip-student-meta">
              <div className="ip-meta-item">
                <span className="ip-meta-label">ESTUDIANTE:</span>
                <span className="ip-meta-value">
                  {studentName.toUpperCase() || studentId}
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
                <span className="ip-meta-value">19/11/2025</span>
              </div>
            </div>
          </div>

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
                        <td className="ip-proposito-row-referentes">
                          <h4>Referentes</h4>
                          <ul>
                            {p.referentes.map((r, idx) => (
                              <li key={idx}>{r}</li>
                            ))}
                          </ul>
                        </td>
                        <td className="ip-proposito-row-indicadores">
                          <h4>Indicadores</h4>
                          {p.asignaturas.map((aId) => {
                            const opts = indicadores.filter(
                              (ind) => ind.asignatura === aId
                            );
                            const sel = selecciones[aId] || '';
                            const indicador = opts.find((o) => o.id === sel);

                            return (
                              <div
                                key={aId}
                                className="ip-indicador-item-container"
                              >
                                {indicador ? (
                                  <p className="ip-indicador-text">
                                    {indicador.texto}
                                  </p>
                                ) : (
                                  <p className="ip-indicador-text--empty">
                                    Sin selección
                                  </p>
                                )}
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
              <span className="ip-success-icon">✓</span> Selección guardada
              correctamente
            </div>
          )}

          <div className="ip-observaciones-section">
            <h4>Observaciones</h4>
            <table className="ip-observaciones-table">
              <tbody>
                {Array.from({ length: 1 }).map((_, idx) => (
                  <tr key={idx}>
                    <td>&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <table className="table-student-info-report">
            <tbody>
              <tr>
                <td align="center">
                  <div className="firma">
                    <img src={firmTwo} alt="firma directora" width={"150px"} />
                    <p>ANA KARINA GOMEZ BUSTAMANTE</p>
                    <p>Directora</p>
                  </div>
                </td>
                <td align="center">
                  <div className="firma">
                    <img src={firmOne} alt="firma coordinadora" width={"150px"} />
                    <p>NURIA MILENA MONTES SALAS</p>
                    <p>Coordinadora Académica</p>
                  </div>
                </td>
                <td align="center">
                  <div className="firma-directora">
                    <p>{directorGrupo.toUpperCase() || "Director(a) de Grupo"}</p>
                    <p>Director(a) de Grupo</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="ip-director-section">
           {/*  <div className="firma">  
              <p>{directorGrupo.toUpperCase()}</p>
              <p>Director(a) de grupo</p>
            </div> */}
            {/* <p>
              Director(a) de Grupo:&nbsp;
              {directorGrupo ? (
                <strong>{directorGrupo}</strong>
              ) : (
                <em>Cargando...</em>
              )}
            </p> */}
          </div>
        </div>
      )}
    </>
  );
};

export default InformePreescolar;
