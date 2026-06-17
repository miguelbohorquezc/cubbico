/**
 * @fileoverview Vista de informes masivos por salón
 * @module presentation/features/reports/ClassroomBulkReportView
 *
 * Muestra todos los informes de los estudiantes de un salón en secuencia
 * para previsualización e impresión masiva.
 *
 * Ruta: /private/dashboard/informe/salon/:nivel/:periodId/:classroomId/:year
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebase';
import { SidebarV2 } from '../../components/sidebarV2';
import { HeaderV2 } from '../../components/headerV2';
import { usePrintSetup, PrintControls } from '../../components/PrintableReport';
import { useReportData } from './hooks/useReportData';
import { PrimaryReportContent } from '../../components/reports/PrimaryReportContent';
import { SecondaryReportContent } from '../../components/reports/SecondaryReportContent';
import { PreschoolReportContent } from '../../components/reports/PreschoolReportContent';
import logo from '../../../assets/logo/logotipo.jpg';
import logoPreschool from '../../../assets/logo/logoPreschool.svg';
import {
  IconLoader,
  IconAlertCircle,
  IconArrowBack,
} from '@tabler/icons-react';
import './AcademicReportView.css';

// ============================================
// Tipos
// ============================================

interface RouteParams {
  nivel: 'primaria' | 'secundaria' | 'preescolar';
  periodId: string;
  classroomId: string;
  year: string;
}

interface StudentBasicInfo {
  id: string;
  name: string;
  lastName: string;
}

// ============================================
// Hook: sidebar
// ============================================

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

// ============================================
// Componente de informe individual
// ============================================

interface SingleReportProps {
  studentId: string;
  nivel: string;
  periodId: string;
  year: string;
  schoolLevel: '1' | '2';
  isLast: boolean;
}

function SingleReport({ studentId, nivel, periodId, year, schoolLevel, isLast }: SingleReportProps) {
  const { reportData, studentInfo, fechaEntrega, director, loading, error } = useReportData({
    studentId,
    year,
    periodId,
    schoolLevel
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <IconLoader size={22} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    const studentName = studentInfo
      ? `${studentInfo.name} ${studentInfo.lastName}`.trim()
      : 'Estudiante';

    return (
      <div className="text-center p-6 bg-amber-50 border border-amber-200 rounded-lg">
        <IconAlertCircle size={20} className="text-amber-500 mb-2 inline-block" />
        <p className="text-sm text-amber-700 font-medium">
          {studentName}: {error}
        </p>
      </div>
    );
  }

  return (
    <div className={`report-single ${!isLast ? 'page-break-after' : ''}`}>
      <div className="report-container bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden print:shadow-none print:rounded-none print:border-none font-['Nunito',sans-serif]" style={{ maxWidth: '816px', margin: '0 auto', padding: '1.25rem', marginBottom: isLast ? '0' : '2rem' }}>

        {/* Header institucional */}
        <table className="w-full border-collapse thead-header-info">
          <thead>
            <tr className="h-28">
              <td className="w-24 p-2 border border-gray-100 align-middle">
                <img
                  src={nivel.toLowerCase() === 'preescolar' ? logoPreschool : logo}
                  alt="logotipo"
                  className="w-16 mx-auto"
                />
              </td>
              <td className="px-6 py-3 border border-gray-100 text-center td-header" colSpan={2}>
                <b className="text-base font-bold text-black">COLINA CAMPESTRE GARABATOS SCHOOL</b>
                <p className="text-[10pt] text-black mt-1 leading-relaxed">
                  De Sincelejo, Sucre, con reconocimiento oficial en los niveles de Preescolar, Básica Primaria y Básica Secundaria
                  por parte de Secretaria de Educación Municipal, según resolución No 2747 del 12 de diciembre de 2023.
                  Carrera 34 No 38-158, teléfonos: 2771068-3006781806
                </p>
                <p className="text-[10pt] text-black font-semibold">NIT: 901731191-3</p>
              </td>
              <td className="w-28 px-3 py-2 border border-gray-100 text-center text-xs text-black align-middle">
                DANE 370001038852
              </td>
            </tr>
          </thead>
        </table>

        {/* Contenido del informe */}
        <div>
          {nivel.toLowerCase() === 'primaria' && (
            <PrimaryReportContent
              reportData={reportData.primary}
              studentInfo={studentInfo}
              periodId={periodId}
              director={director}
              fechaEntrega={fechaEntrega}
              year={year}
            />
          )}

          {nivel.toLowerCase() === 'secundaria' && (
            <SecondaryReportContent
              reportData={reportData.secondary}
              studentInfo={studentInfo}
              periodId={periodId}
              director={director}
              fechaEntrega={fechaEntrega}
              year={year}
            />
          )}

          {nivel.toLowerCase() === 'preescolar' && (
            <PreschoolReportContent
              reportData={reportData.preschool}
              studentInfo={studentInfo}
              periodId={periodId}
              director={director}
              fechaEntrega={fechaEntrega}
              year={year}
            />
          )}

          {!reportData.primary.length && !reportData.secondary.length && nivel.toLowerCase() !== 'preescolar' && (
            <div className="text-center p-8">
              <p className="text-gray-500">No hay datos para este estudiante en este periodo</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {/* <div className="px-8 py-3 bg-gray-50 print:bg-white border-t border-gray-100 text-center mt-1">
          <p className="text-[9px] text-gray-400">
            Informe generado el {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} ·
            Periodo {periodId} · {year} · SIA Colina Campestre
          </p>
        </div> */}
      </div>
    </div>
  );
}

// ============================================
// Componente principal
// ============================================

export default function ClassroomBulkReportView() {
  const params = useParams() as unknown as RouteParams;
  const { nivel, periodId, classroomId, year } = params;
  const navigate = useNavigate();
  const isSidebarCollapsed = useSidebarCollapsed();
  const { paperSize, setPaperSize, handlePrint } = usePrintSetup();

  const [students, setStudents] = useState<StudentBasicInfo[]>([]);
  const [classroomName, setClassroomName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const schoolLevel = nivel === 'secundaria' ? '2' : '1';

  // Cargar estudiantes del salón
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError('');

        // Obtener nombre del salón
        const classroomDoc = await getDoc(doc(db, 'classRooms', classroomId));
        if (classroomDoc.exists()) {
          setClassroomName(classroomDoc.data()?.nombreSalon || 'Salón');
        }

        // Obtener estudiantes del salón
        const studentsQuery = query(
          collection(db, 'student'),
          where('classroomId', '==', classroomId)
        );
        const studentsSnap = await getDocs(studentsQuery);

        const studentsList = studentsSnap.docs
          // Filtrar solo estudiantes activos
          .filter(doc => (doc.data().status || 'activo') === 'activo')
          .map(doc => ({
            id: doc.id,
            name: doc.data().name || '',
            lastName: doc.data().lastName || ''
          }));

        // Ordenar alfabéticamente por apellido
        studentsList.sort((a, b) => a.lastName.localeCompare(b.lastName));

        setStudents(studentsList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando estudiantes');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [classroomId]);

  // ══════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <SidebarV2 />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-500">
            <IconLoader size={22} className="animate-spin" />
            <span className="text-sm font-medium">Cargando informes del salón…</span>
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
            title={`Informes del Salón - ${nivel.charAt(0).toUpperCase() + nivel.slice(1).toLowerCase()}`}
            subtitle={`${classroomName} · Periodo ${periodId} · ${students.length} estudiantes`}
            isSidebarCollapsed={isSidebarCollapsed}
          />
        </div>
        <div className="print:hidden h-16 flex-shrink-0" />

        <main className="flex-1 overflow-auto min-h-0 p-4 lg:p-5 print:overflow-visible print:p-0">

          {/* Controls (ocultos en impresión) */}
          <div className="print:hidden flex items-center justify-between gap-3 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
            >
              <IconArrowBack size={13} /> Volver
            </button>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600 font-medium">
                {students.length} {students.length === 1 ? 'informe' : 'informes'}
              </div>
              <PrintControls paperSize={paperSize} onPaperSizeChange={setPaperSize} onPrint={handlePrint} />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="print:hidden mb-3 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <IconAlertCircle size={16} className="text-red-500 flex-shrink-0" /> {error}
            </div>
          )}

          {/* Sin estudiantes */}
          {!loading && students.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-500">No hay estudiantes en este salón</p>
            </div>
          )}

          {/* Informes en secuencia */}
          {students.map((student, index) => (
            <SingleReport
              key={student.id}
              studentId={student.id}
              nivel={nivel}
              periodId={periodId}
              year={year}
              schoolLevel={schoolLevel}
              isLast={index === students.length - 1}
            />
          ))}

          {/* Espaciador inferior */}
          <div className="print:hidden h-6" />
        </main>
      </div>
    </div>
  );
}
