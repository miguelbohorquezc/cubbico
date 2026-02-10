import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvaluadorPreescolar } from './useEvaluadorPreescolar';
import logo from '../../../../assets/logo/logotipo.jpg';
import logoPreschool from '../../../../assets/logo/logoPreschool.svg';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../infrastructure/firebase/firebase';
import { fetchPeriodConfig, formatFechaEntrega } from '../../../../infrastructure/periodConfig.service';
import { IconLoader, IconArrowBack } from '@tabler/icons-react';
import { SidebarV2 } from '../../../components/sidebarV2';
import { HeaderV2 } from '../../../components/headerV2';
import { PreschoolReportContent, ProposedData } from '../../../components/reports/PreschoolReportContent';
import { usePrintSetup, PrintControls } from '../../../components/PrintableReport';

import firmOne from "../../../../assets/firm/01.jpg";
import firmTwo from "../../../../assets/firm/02.jpg";

type Params = {
  classroomId: string;
  studentId: string;
  periodId: string;
  year: string;
};

const SIDEBAR_KEY = 'cubbico-sidebar-collapsed';

function useSidebarCollapsed(): boolean {
  const [c, setC] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_KEY) === 'true'; } catch { return false; }
  });
  useEffect(() => {
    const t = setInterval(() => {
      try { setC(localStorage.getItem(SIDEBAR_KEY) === 'true'); } catch { /* noop */ }
    }, 100);
    return () => clearInterval(t);
  }, []);
  return c;
}

const InformePreescolar: React.FC = () => {
  const {
    classroomId = '',
    studentId = '',
    periodId = '0',
    year = '',
  } = useParams<Params>();

  const navigate = useNavigate();
  const isSidebarCollapsed = useSidebarCollapsed();
  const { paperSize, setPaperSize, handlePrint } = usePrintSetup();

  const safePeriod = parseInt(periodId, 10) || 0;

  const {
    studentName,
    classroomName,
    propositos,
    indicadores,
    selecciones,
    cargando,
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
          const directorValue = data.directorGrupo || '';

          if (directorValue) {
            // Intentar buscar como UID primero
            try {
              const userDoc = await getDoc(doc(db, 'users', directorValue));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                setDirectorGrupo(userData?.displayName || userData?.email || directorValue);
              } else {
                // Si no existe como UID, asumir que es un nombre y usarlo directamente
                setDirectorGrupo(directorValue);
              }
            } catch {
              // Si falla la búsqueda, usar el valor directamente como nombre
              setDirectorGrupo(directorValue);
            }
          }
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
          setFechaEntrega(new Date().toLocaleDateString('es-CO', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }));
        }
      } catch (err) {
        console.error('Error fetching fecha entrega:', err);
        setFechaEntrega(new Date().toLocaleDateString('es-CO', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }));
      }
    };
    fetchFecha();
  }, [periodId, year]);

  // Adaptar los datos al formato de PreschoolReportContent
  const reportData: ProposedData[] = propositos.map((p) => {
    const indicadoresEvaluados = p.asignaturas
      .map((aId) => {
        const sel = selecciones[aId] || '';
        const indicador = indicadores.find((ind) => ind.id === sel);

        if (indicador) {
          return {
            asignaturaId: aId,
            texto: indicador.texto || 'Sin texto'
          };
        }
        return null;
      })
      .filter((item): item is { asignaturaId: string; texto: string } => item !== null);

    return {
      id: p.id || '',
      texto: p.texto || '',
      referentes: p.referentes || [],
      indicadores: indicadoresEvaluados
    };
  }).filter(p => p.indicadores.length > 0);

  const studentInfo = {
    name: studentName.split(' ')[0] || '',
    lastName: studentName.split(' ').slice(1).join(' ') || '',
    className: classroomName || '',
    classRoom: classroomName || '',
    document: '',
    id: studentId,
    classroomId: classroomId
  };

  if (cargando) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <SidebarV2 />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-500">
            <IconLoader size={22} className="animate-spin" />
            <span className="text-sm font-medium">Generando informe…</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden print:h-auto print:overflow-visible print:bg-white">
      <div className="print:hidden"><SidebarV2 /></div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="print:hidden">
          <HeaderV2
            title="Informe Académico - Preescolar"
            subtitle={studentName || undefined}
            isSidebarCollapsed={isSidebarCollapsed}
          />
        </div>
        <div className="print:hidden h-16 flex-shrink-0" />

        <main className="flex-1 overflow-auto min-h-0 p-4 lg:p-5 print:overflow-visible print:p-0">

          {/* Controls (ocultos en impresión) */}
          <div className="print:hidden flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
              >
                <IconArrowBack size={13} /> Volver
              </button>
              <div>
                <h1 className="text-base font-bold text-gray-900">
                  {studentName || 'Informe Académico'}
                </h1>
                <p className="text-[11px] text-gray-400">
                  {classroomName} · <span className="font-bold text-red-600">Año: {year}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-700 w-28 text-center">Periodo {safePeriod}</span>
              <PrintControls paperSize={paperSize} onPaperSizeChange={setPaperSize} onPrint={handlePrint} />
            </div>
          </div>

          {/* Documento del informe */}
          <div className="report-container bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden print:shadow-none print:rounded-none print:border-none font-['Nunito',sans-serif]" style={{ maxWidth: '816px', margin: '0 auto', padding: '1.25rem' }}>

            {/* Header institucional */}
            <table className="w-full border-collapse thead-header-info">
              <thead>
                <tr className="h-28">
                  <td className="w-24 p-2 border border-gray-100 align-middle">
                    <img
                      src={logoPreschool}
                      alt="logotipo"
                      className="w-16 mx-auto"
                    />
                  </td>
                  <td className="px-6 py-3 border border-gray-100 text-center td-header" colSpan={2}>
                    <b className="text-base font-bold text-gray-900">COLINA CAMPESTRE SCHOOL</b>
                    <p className="text-[10pt] text-gray-600 mt-1 leading-relaxed">
                      De Sincelejo, Sucre, con reconocimiento oficial en los niveles de Preescolar, Básica Primaria y Básica Secundaria
                      por parte de Secretaria de Educación Municipal, según resolución No 2747 del 12 de diciembre de 2023.
                      Carrera 34 No 38-158, teléfonos: 2771068-3006781806
                    </p>
                    <p className="text-[10pt] text-gray-700 font-semibold">NIT: 901731191-3</p>
                  </td>
                  <td className="w-28 px-3 py-2 border border-gray-100 text-center text-xs text-gray-600 align-middle">
                    DANE 370001038852
                  </td>
                </tr>
              </thead>
            </table>

            {/* Contenido del informe */}
            <div>
              <PreschoolReportContent
                reportData={reportData}
                studentInfo={studentInfo}
                periodId={periodId}
                director={directorGrupo}
                fechaEntrega={fechaEntrega}
              />
            </div>

            {/* Footer */}
            <div className="px-8 py-3 bg-gray-50 print:bg-white border-t border-gray-100 text-center mt-4">
              <p className="text-[9px] text-gray-400">
                Informe generado el {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} ·
                Periodo {safePeriod} · {year} · Sistema Cubbico
              </p>
            </div>
          </div>

          {/* Espaciador inferior en pantalla */}
          <div className="print:hidden h-6" />
        </main>
      </div>
    </div>
  );
};

export default InformePreescolar;
