import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useEvaluadorPreescolar } from './useEvaluadorPreescolar';
import logo from '../../../../assets/logo/logotipo.jpg';
import logoPreschool from '../../../../assets/logo/logoPreschool.svg';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../infrastructure/firebase/firebase';
import { UserIcon, BookOpenIcon, CalendarIcon, ClockIcon } from '../../../components/icons';
import { Badge } from '../../../components/ui';
import { fetchPeriodConfig, formatFechaEntrega } from '../../../../infrastructure/periodConfig.service';

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
  const [fechaEntrega, setFechaEntrega] = useState<string>('');

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

  useEffect(() => {
    if (!periodId || !year) return;
    const fetchFecha = async () => {
      try {
        const config = await fetchPeriodConfig(periodId, year);
        if (config && config.fechaEntrega) {
          const formatted = formatFechaEntrega(config.fechaEntrega);
          setFechaEntrega(formatted);
        } else {
          // Si no hay configuración, mostrar fecha actual
          setFechaEntrega(new Date().toLocaleDateString('es-CO', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }));
        }
      } catch (err) {
        console.error('Error fetching fecha entrega:', err);
        // En caso de error, mostrar fecha actual
        setFechaEntrega(new Date().toLocaleDateString('es-CO', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }));
      }
    };
    fetchFecha();
  }, [periodId, year]);

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
          <div className="mb-6 bg-gradient-to-r from-deep-blue-50 to-blue-50 border border-deep-blue-100 rounded-xl p-6 print:bg-white print:border-gray-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-light-gray-200 shadow-sm print:shadow-none">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-light-gray-500 mb-1 tracking-wide">Estudiante</p>
                  <p className="text-sm font-semibold text-deep-blue-900 leading-tight">
                    {studentName || studentId}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-light-gray-200 shadow-sm print:shadow-none">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpenIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-light-gray-500 mb-1 tracking-wide">Grado</p>
                  <p className="text-sm font-semibold text-deep-blue-900 leading-tight">
                    {classroomName || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-light-gray-200 shadow-sm print:shadow-none">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CalendarIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-light-gray-500 mb-1 tracking-wide">Periodo</p>
                  <Badge variant="success" size="sm">
                    Periodo {safePeriod}
                  </Badge>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-light-gray-200 shadow-sm print:shadow-none">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ClockIcon className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-light-gray-500 mb-1 tracking-wide">Año</p>
                  <p className="text-sm font-semibold text-deep-blue-900 leading-tight">{year}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-light-gray-200 shadow-sm print:shadow-none">
                <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CalendarIcon className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-light-gray-500 mb-1 tracking-wide">Fecha de Entrega</p>
                  <p className="text-xs font-semibold text-deep-blue-900 leading-tight">
                    {fechaEntrega || 'Cargando...'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Propósitos */}
          <div className="space-y-6">
            {propositos.map((p, i) => (
              <div
                key={p.id}
                className="border-2 border-deep-blue-200 rounded-xl overflow-hidden shadow-sm print:break-inside-avoid print:shadow-none print:border-gray-300"
              >
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th
                        colSpan={2}
                        className="bg-gradient-to-r from-deep-blue-50 to-blue-50 p-4 text-left text-sm font-bold text-deep-blue-900 border-b-2 border-deep-blue-200 print:bg-gray-50 print:border-gray-300"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 bg-deep-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm">
                            {i + 1}
                          </span>
                          <span className="leading-relaxed">Propósito: {p.texto}</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="align-top">
                      {/* Columna Referentes */}
                      <td className="w-[35%] p-5 border-r-2 border-deep-blue-200 bg-deep-blue-50/30 print:bg-white print:border-gray-300">
                        <h4 className="text-xs font-bold uppercase text-deep-blue-700 mb-3 tracking-wide flex items-center gap-2">
                          <span className="w-1 h-4 bg-deep-blue-600 rounded-full"></span>
                          Referentes
                        </h4>
                        <ul className="space-y-2">
                          {p.referentes.map((r, idx) => (
                            <li
                              key={idx}
                              className="bg-white border border-deep-blue-200 rounded-lg px-3 py-2.5 text-xs text-gray-800 leading-relaxed print:bg-white print:border-gray-300"
                            >
                              <span className="font-semibold text-deep-blue-600 mr-1">{idx + 1}.</span>
                              {r}
                            </li>
                          ))}
                        </ul>
                      </td>

                      {/* Columna Indicadores */}
                      <td className="p-5 bg-white">
                        <h4 className="text-xs font-bold uppercase text-deep-blue-700 mb-3 tracking-wide flex items-center gap-2">
                          <span className="w-1 h-4 bg-green-600 rounded-full"></span>
                          Indicadores de Desempeño
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
                                className="border border-green-200 rounded-lg px-3 py-2.5 bg-green-50/30 print:bg-white print:border-gray-300"
                              >
                                {indicador ? (
                                  <p className="text-xs text-gray-800 leading-relaxed">
                                    <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
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
          <div className="mt-8">
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-5 print:bg-white print:border-gray-300">
              <h4 className="text-sm font-bold uppercase text-amber-900 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-amber-600 rounded-full"></span>
                Observaciones
              </h4>
              <div className="bg-white border border-amber-200 rounded-lg p-4 min-h-[60px] print:border-gray-300">
                <p className="text-xs text-gray-500 italic">Espacio para observaciones del docente...</p>
              </div>
            </div>
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
