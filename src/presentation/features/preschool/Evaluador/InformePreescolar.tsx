import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useEvaluadorPreescolar } from './useEvaluadorPreescolar';
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
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-lg border border-gray-200">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-sm font-medium text-gray-700">Cargando información del informe...</p>
        </div>
      ) : (
        <div className="bg-white p-6 print:p-0">
          {/* Header oficial con tabla */}
          <table className="w-full border-collapse mb-6 border border-gray-300">
            <tbody>
              <tr>
                <td className="align-middle p-4 border border-gray-300" rowSpan={2}>
                  <img src={logo} alt="logotipo" className="w-24 h-auto mx-auto" />
                </td>
                <td className="p-4 border border-gray-300 text-center align-middle">
                  <p className="font-bold text-sm mb-2 text-gray-900">COLINA CAMPESTRE SCHOOL</p>
                  <p className="text-xs leading-normal mb-2 text-gray-700">
                    De Sincelejo, Sucre, con reconocimiento oficial en
                    los niveles de Preescolar, Básica Primaria y Básica
                    Secundaria por parte de Secretaría de Educación
                    Municipal, según resolución No 2747 del 12 de diciembre
                    de 2023. Carrera 34 No 38-158, teléfonos:
                    2771068-3006781806
                  </p>
                  <p className="text-xs font-semibold text-gray-900">NIT: 901731191-3</p>
                </td>
                <td className="p-3 border border-gray-300 text-center align-middle">
                  <img src={logoPreschool} alt="logo preescolar" className="w-20 h-auto mx-auto mb-2" />
                  <p className="text-xs font-semibold text-gray-900">DANE 370001038852</p>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Información del estudiante */}
          <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-white print:bg-white">
            <div className="flex flex-wrap gap-6 justify-around">
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase text-gray-600">Estudiante:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {studentName.toUpperCase() || studentId}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase text-gray-600">Salón de Clases:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {classroomName.toUpperCase() || classroomId}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase text-gray-600">Periodo:</span>
                <span className="text-sm font-semibold text-gray-900">{safePeriod}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase text-gray-600">Fecha:</span>
                <span className="text-sm font-semibold text-gray-900">19/11/2025</span>
              </div>
            </div>
          </div>

          {/* Propósitos */}
          <div className="space-y-6">
            {propositos.map((p, i) => (
              <div
                key={p.id}
                className="border border-gray-300 rounded-lg overflow-hidden print:break-inside-avoid"
              >
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th
                        colSpan={2}
                        className="bg-gray-50 p-4 text-left text-sm font-bold text-gray-900 border-b border-gray-200 print:bg-gray-50"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 bg-emerald-100 rounded flex items-center justify-center text-emerald-700 text-xs font-bold">
                            {i + 1}
                          </span>
                          <span>Propósito: {p.texto}</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="align-top">
                      {/* Columna Referentes */}
                      <td className="w-[35%] p-5 border-r border-gray-200 bg-gray-50 print:bg-white">
                        <h4 className="text-xs font-bold uppercase text-gray-600 mb-3 tracking-wide">
                          Referentes
                        </h4>
                        <ul className="space-y-2">
                          {p.referentes.map((r, idx) => (
                            <li
                              key={idx}
                              className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-xs text-gray-800 print:bg-white print:border-gray-300"
                            >
                              {r}
                            </li>
                          ))}
                        </ul>
                      </td>

                      {/* Columna Indicadores */}
                      <td className="p-5 bg-white">
                        <h4 className="text-xs font-bold uppercase text-gray-600 mb-3 tracking-wide">
                          Indicadores
                        </h4>
                        <div className="space-y-2">
                          {p.asignaturas.map((aId) => {
                            const opts = indicadores.filter(
                              (ind) => ind.asignatura === aId
                            );
                            const sel = selecciones[aId] || '';
                            const indicador = opts.find((o) => o.id === sel);

                            return (
                              <div
                                key={aId}
                                className="border border-gray-200 rounded-lg px-4 py-3 bg-white"
                              >
                                {indicador ? (
                                  <p className="text-xs text-gray-800 leading-relaxed">
                                    {indicador.texto}
                                  </p>
                                ) : (
                                  <p className="text-xs italic text-gray-400">
                                    Sin selección
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          {/* Mensaje de éxito (solo pantalla) */}
          {mostrarExito && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 font-semibold print:hidden">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Selección guardada correctamente
            </div>
          )}

          {/* Observaciones */}
          <div className="mt-6">
            <h4 className="text-sm font-bold uppercase text-gray-800 mb-2">
              Observaciones
            </h4>
            <table className="w-full border-collapse mb-8 border border-gray-300">
              <tbody>
                {Array.from({ length: 1 }).map((_, idx) => (
                  <tr key={idx}>
                    <td className="h-12 border border-gray-300 px-3">&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Firmas */}
          <table className="w-full border-collapse mt-8">
            <tbody>
              <tr>
                <td className="text-center align-top p-4">
                  <div className="flex flex-col items-center">
                    <img src={firmTwo} alt="firma directora" className="w-32 h-auto mb-2" />
                    <p className="text-xs font-bold text-gray-900">ANA KARINA GOMEZ BUSTAMANTE</p>
                    <p className="text-xs text-gray-700">Directora</p>
                  </div>
                </td>
                <td className="text-center align-top p-4">
                  <div className="flex flex-col items-center">
                    <img src={firmOne} alt="firma coordinadora" className="w-32 h-auto mb-2" />
                    <p className="text-xs font-bold text-gray-900">NURIA MILENA MONTES SALAS</p>
                    <p className="text-xs text-gray-700">Coordinadora Académica</p>
                  </div>
                </td>
                <td className="text-center align-top p-4">
                  <div className="flex flex-col items-center mt-12">
                    <div className="w-48 border-t border-gray-800 mb-2"></div>
                    <p className="text-xs font-bold text-gray-900">
                      {directorGrupo.toUpperCase() || "DIRECTOR(A) DE GRUPO"}
                    </p>
                    <p className="text-xs text-gray-700">Director(a) de Grupo</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Estilos de impresión */}
      <style>{`
        @page {
          size: legal;
          margin: 1.5cm;
        }

        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print\\:hidden {
            display: none !important;
          }

          .print\\:p-0 {
            padding: 0 !important;
          }

          .print\\:bg-white {
            background-color: white !important;
          }

          .print\\:bg-gray-100 {
            background-color: #f3f4f6 !important;
          }

          .print\\:border-gray-300 {
            border-color: #d1d5db !important;
          }

          .print\\:break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          table {
            page-break-inside: avoid;
          }

          img {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </>
  );
};

export default InformePreescolar;
