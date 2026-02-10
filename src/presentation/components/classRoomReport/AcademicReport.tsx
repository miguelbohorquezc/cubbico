import React from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../../infrastructure/firebase/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import logo from '../../../assets/logo/logotipo.jpg';
import "./AcademicReport.css";
import { SubjectData, AreaGroup, StudentData, PeriodInfo } from './AcademicInterface';
import { fetchPeriodConfig, formatFechaEntrega } from '../../../infrastructure/periodConfig.service';
import { fetchAttendanceByClassroom } from '../../../infrastructure/attendance.service';
import { computeAttendanceSummary, AttendanceRecord } from '../../../domain/entities/attendance';
import { usePrintSetup } from '../../components/PrintableReport';

import firmOne from "../../../assets/firm/01.jpg";
import firmTwo from "../../../assets/firm/02.jpg";

const AcademicReport = () => {
  const { schoolLevel, studentId, year, periodId, director } = useParams<{
    schoolLevel?: '1' | '2';
    studentId?: string;
    periodId?: string;
    year?: string;
    director?: string;
  }>();

  usePrintSetup();

  const [reportData, setReportData] = React.useState<{
    primary: Omit<SubjectData, '_orden'>[];
    secondary: Omit<AreaGroup, '_orden'>[];
    periodInfo?: PeriodInfo;
  }>({ primary: [], secondary: [] });

  const [studentInfo, setStudentInfo] = React.useState<StudentData | null>(null);
  const [fechaEntrega, setFechaEntrega] = React.useState<string>('');
  const [directorName, setDirectorName] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const isSecondary = schoolLevel === '2';

  const getAchievements = async (achievementId?: string) => {
    if (!achievementId) return null;
    try {
      const achievementSnap = await getDoc(doc(db, 'achievements', achievementId));
      return achievementSnap.exists() ? achievementSnap.data().logros : null;
    } catch (error) {
      return null;
    }
  };

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        if (!studentId || !year) throw new Error('Parámetros inválidos');

        const studentDoc = await getDoc(doc(db, 'student', studentId));
        if (!studentDoc.exists()) throw new Error('Estudiante no encontrado');

        const studentData = studentDoc.data() as StudentData;
        setStudentInfo({
          name: studentData.name || '',
          lastName: studentData.lastName || '',
          className: studentData.className || '',
          classRoom: studentData.classRoom || '',
          document: studentData.document,
          id: studentData.id,
          classroomId: studentData.classroomId
        });

        // Resolver director: si parece un UID de Firebase, buscar el nombre
        if (director && director.length > 15) {
          try {
            const userDoc = await getDoc(doc(db, 'users', director));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setDirectorName(userData?.displayName || userData?.email || director);
            } else {
              setDirectorName(director);
            }
          } catch {
            setDirectorName(director);
          }
        } else if (director) {
          setDirectorName(director);
        }

        const [historySnap, areasSnapshot] = await Promise.all([
          getDoc(doc(db, 'history', studentId)),
          getDocs(collection(db, 'areas'))
        ]);

        if (!historySnap.exists()) throw new Error('Historial académico no encontrado');

        const areasMap = areasSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = {
            ...doc.data(),
            orden: doc.data().orden ? String(doc.data().orden) : '9999'
          };
          return acc;
        }, {} as Record<string, any>);

        const yearData = historySnap.data()?.years[year];
        if (!yearData) return;

        const primaryData: SubjectData[] = [];
        const secondaryGroups: Record<string, AreaGroup> = {};

        const sortByOrder = (a: { _orden?: string }, b: { _orden?: string }) => {
          const orderA = a._orden || '9999';
          const orderB = b._orden || '9999';

          if (!isNaN(Number(orderA)) && !isNaN(Number(orderB))) {
            return Number(orderA) - Number(orderB);
          }
          return orderA.localeCompare(orderB);
        };

        const periodData = (yearData.periods as Record<string, any>)[periodId!];
        if (!periodData) return;

        // Obtener fecha de entrega y rango de fechas del período
        let periodConfig = null;
        try {
          periodConfig = await fetchPeriodConfig(periodId!, year);
          if (periodConfig?.fechaEntrega) {
            setFechaEntrega(formatFechaEntrega(periodConfig.fechaEntrega));
          }
        } catch {
          // Si no hay configuración, usar fecha actual
        }

        // Cargar registros de asistencia para calcular fallas
        let attendanceRecords: AttendanceRecord[] = [];
        if (periodConfig?.fechaInicio && periodConfig?.fechaFin && studentData.classroomId) {
          try {
            attendanceRecords = await fetchAttendanceByClassroom(
              studentData.classroomId,
              periodConfig.fechaInicio,
              periodConfig.fechaFin
            );
          } catch {
            // Si no hay datos de asistencia, usar fallas = 0
          }
        }

        for (const [areaId, areaData] of Object.entries(periodData.areas)) {
          const areaInfo = areasMap[areaId] || {};
          const achievements = await getAchievements((areaData as any).metadata?.achievementId);

          // Calcular fallas desde registros de asistencia
          const teacherId = (areaData as any).metadata?.teacherId;
          let fallasTotales = 0;
          let fallasInjustificadas = 0;
          if (teacherId && attendanceRecords.length > 0) {
            const areaRecords = attendanceRecords.filter(
              (r) => r.profesorId === teacherId && r.areaId === areaId
            );
            const summary = computeAttendanceSummary(areaRecords, studentId!);
            fallasTotales = summary.totalJustified + summary.totalUnjustified;
            fallasInjustificadas = summary.totalUnjustified;
          }

          const subject: SubjectData = {
            areaId,
            asignatura: areaInfo.asignatura || areaId,
            ihs: areaInfo.ihs || 'N/A',
            grades: {
              ...((areaData as any).grades || { l1: 0, l2: 0, l3: 0 }),
              fallas: fallasTotales,
              fallasVerificadas: fallasInjustificadas,
            },
            achievements: achievements || { logro1: 'N/A', logro2: 'N/A', logro3: 'N/A' },
            _orden: areaInfo.orden
          };

          primaryData.push(subject);

          const areaKey = areaInfo.area || 'Otras';
          if (!secondaryGroups[areaKey]) {
            secondaryGroups[areaKey] = {
              nombreArea: areaKey,
              _orden: areaInfo.orden,
              subjects: []
            };
          }
          secondaryGroups[areaKey].subjects.push(subject);
        }

        setReportData({
          primary: primaryData
            .sort(sortByOrder)
            .map(({ _orden, ...rest }) => rest),

          secondary: Object.values(secondaryGroups)
            .sort(sortByOrder)
            .map(({ _orden, subjects, ...groupRest }) => ({
              ...groupRest,
              subjects: subjects
                .sort(sortByOrder)
                .map(({ _orden, ...subjectRest }) => subjectRest)
            })),
          periodInfo: {
            periodo: yearData.periodo || '',
            curso: yearData.curso || ''
          }
        });
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, year, periodId]);

  const calculateAverage = (l1: number, l2: number, l3: number) => {
    return ((l1 + l2 + l3) / 3).toFixed(2);
  };

  const getGradeCategory = (average: number) => {
    if (average >= 4.6) return { text: 'Superior', bgClass: 'bg-blue-100', textClass: 'text-blue-700' };
    if (average >= 4.0) return { text: 'Alto', bgClass: 'bg-emerald-100', textClass: 'text-emerald-700' };
    if (average >= 3.0) return { text: 'Básico', bgClass: 'bg-amber-100', textClass: 'text-amber-700' };
    return { text: 'Bajo', bgClass: 'bg-red-100', textClass: 'text-red-700' };
  };

  // ==========================================
  // Componentes de UI reutilizables
  // ==========================================

  const ReportHeader = () => (
    <table className="w-full border-collapse thead-header-info">
      <thead>
        <tr className="h-32">
          <td className="w-28 p-2 border border-gray-100 align-middle">
            <img src={logo} alt="logotipo" className="w-20 mx-auto" />
          </td>
          <td className="px-8 py-4 border border-gray-100 text-center td-header">
            <b className="text-lg font-bold text-gray-900">COLINA CAMPESTRE SCHOOL</b>
            <p className="text-[11pt] text-gray-600 mt-2 leading-relaxed">
              De Sincelejo, Sucre, con reconocimiento oficial en los niveles de Preescolar, Básica Primaria y Básica Secundaria
              por parte de Secretaria de Educación Municipal, según resolución No 2747 del 12 de diciembre de 2023.
              Carrera 34 No 38-158, teléfonos: 2771068-3006781806
            </p>
            <p className="text-[11pt] text-gray-700 font-semibold mt-1">NIT: 901731191-3</p>
          </td>
          <td className="w-32 px-4 py-2 border border-gray-100 text-center text-sm text-gray-600 align-middle">
            DANE 370001038852
          </td>
        </tr>
      </thead>
    </table>
  );

  const StudentInfoTable = () => (
    <table className="w-full border-collapse border border-indigo-200 table-student-info">
      <thead className="bg-gray-100 print:bg-white">
        <tr className="h-10">
          <td className="px-4 py-2 text-[11pt] font-bold text-gray-700 border border-gray-100">ESTUDIANTE</td>
          <td className="px-4 py-2 text-[11pt] font-bold text-gray-700 border border-gray-100">GRADO</td>
          <td className="px-4 py-2 text-[11pt] font-bold text-gray-700 border border-gray-100">PERIODO</td>
          <td className="px-4 py-2 text-[11pt] font-bold text-gray-700 border border-gray-100">FECHA</td>
        </tr>
      </thead>
      <tbody>
        <tr className="h-10">
          <td className="px-4 py-2 text-[11pt] font-bold text-gray-900 border border-gray-100 capitalize">
            {studentInfo ?
              `${studentInfo.name.toUpperCase()} ${studentInfo.lastName.toUpperCase()}` :
              'Cargando...'}
          </td>
          <td className="px-4 py-2 text-[11pt] font-bold text-gray-900 border border-gray-100">
            {studentInfo ?
              studentInfo.className.toUpperCase() :
              'Cargando...'}
          </td>
          <td className="px-4 py-2 text-[11pt] font-bold text-gray-900 border border-gray-100">{periodId}</td>
          <td className="px-4 py-2 text-[11pt] font-bold text-gray-900 border border-gray-100">
            {fechaEntrega || new Date().toLocaleDateString('es-CO')}
          </td>
        </tr>
      </tbody>
    </table>
  );

  const ConventionsTable = () => (
    <table className="w-full border-collapse border border-indigo-200">
      <tbody>
        <tr>
          <td colSpan={2} className="px-4 py-2 text-[11pt] text-gray-600 border border-gray-100">
            <p>CONVENCIONES: I.H.S (Intensidad Horaria Semanal), L (Logro), F (Fallas), FI (Fallas injustificadas)</p>
          </td>
        </tr>
      </tbody>
    </table>
  );

  const GradeScaleTable = () => (
    <table className="w-full border-collapse border border-indigo-200">
      <thead className="bg-gray-100 print:bg-white">
        <tr>
          <td colSpan={2} className="px-4 py-2 text-[11pt] font-bold text-gray-700 border border-gray-100">
            <p>ESCALA DE VALORACIÓN</p>
          </td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colSpan={2} className="px-4 py-3 border border-gray-100">
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="inline-flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span className="text-gray-700">Superior: 4.6 - 5.0</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-gray-700">Alto: 4.0 - 4.5</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="text-gray-700">Básico: 3.0 - 3.9</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-gray-700">Bajo: 1.0 - 2.9</span>
              </span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );

  const ObservationsTable = () => (
    <table className="w-full border-collapse border border-indigo-200">
      <thead className="bg-gray-100 print:bg-white">
        <tr>
          <td colSpan={3} className="px-4 py-2 text-[11pt] font-bold text-gray-700 border border-gray-100">
            <p>OBSERVACIONES</p>
          </td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="h-16 border border-gray-100"></td>
        </tr>
      </tbody>
    </table>
  );

  const SignaturesTable = ({ periodId: pid, directorName: dirName }: { periodId?: string; directorName?: string }) => (
    <table className="w-full border-collapse border border-indigo-200">
      <tbody>
        <tr>
          {pid === '4' && (
            <td className="text-center py-4 border border-gray-100">
              <div className="firma flex flex-col items-center mt-12">
                <img src={firmTwo} alt="firma directora" className="w-36 h-auto" />
                <p className="text-[10pt] font-medium text-gray-900 mt-2">ANA KARINA GOMEZ BUSTAMANTE</p>
                <p className="text-[10pt] text-gray-600">Directora</p>
              </div>
            </td>
          )}
          {pid === '4' && (
            <td className="text-center py-4 border border-gray-100">
              <div className="firma flex flex-col items-center mt-12">
                <img src={firmOne} alt="firma coordinadora" className="w-36 h-auto" />
                <p className="text-[10pt] font-medium text-gray-900 mt-2">NURIA MILENA MONTES SALAS</p>
                <p className="text-[10pt] text-gray-600">Coordinadora Académica</p>
              </div>
            </td>
          )}
          <td className="text-center py-4 border border-gray-100">
            <div className="firma flex flex-col items-center mt-12">
              <div className="w-36 h-12 border-b border-gray-400"></div>
              <p className="text-[10pt] font-medium text-gray-900 mt-2">{dirName || "Director(a) de Grupo"}</p>
              <p className="text-[10pt] text-gray-600">Director(a) de Grupo</p>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );

  // Componente de fila de asignatura
  const SubjectRow = ({ subject, index }: { subject: Omit<SubjectData, '_orden'>; index: number }) => {
    const average = parseFloat(calculateAverage(
      subject.grades.l1,
      subject.grades.l2,
      subject.grades.l3
    ));
    const gradeCategory = getGradeCategory(average);

    return (
      <tr className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/30 transition-colors print:bg-white`}>
        <td className="px-3 py-3 border-b border-gray-100 text-sm font-medium text-gray-900 align-top">
          {subject.asignatura}
        </td>
        <td className="px-1 py-3 border-b border-gray-100 text-sm text-gray-600 text-center align-top">
          {subject.ihs}
        </td>
        <td className="px-1 py-3 border-b border-gray-100 text-sm text-gray-600 text-center align-top">
          {subject.grades.fallas}
        </td>
        <td className="px-1 py-3 border-b border-gray-100 text-sm text-gray-600 text-center align-top">
          {subject.grades.fallasVerificadas}
        </td>
        <td className="px-3 py-3 border-b border-gray-100 align-top">
          <div className="space-y-2">
            <div className="achievement-item flex items-start gap-2 text-sm">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">
                1
              </span>
              <span className="text-gray-700 leading-relaxed">{subject.achievements.logro1}</span>
            </div>
            <div className="achievement-item flex items-start gap-2 text-sm">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">
                2
              </span>
              <span className="text-gray-700 leading-relaxed">{subject.achievements.logro2}</span>
            </div>
            <div className="achievement-item flex items-start gap-2 text-sm">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">
                3
              </span>
              <span className="text-gray-700 leading-relaxed">{subject.achievements.logro3}</span>
            </div>
          </div>
        </td>
        <td className="px-3 py-3 border-b border-gray-100 align-top">
          <div className="grades-container text-sm space-y-1">
            <div className="flex items-center gap-1">
              <span className="text-gray-500 w-7">L1:</span>
              <span className="font-medium text-gray-800">{subject.grades.l1.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-500 w-7">L2:</span>
              <span className="font-medium text-gray-800">{subject.grades.l2.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-500 w-7">L3:</span>
              <span className="font-medium text-gray-800">{subject.grades.l3.toFixed(1)}</span>
            </div>
          </div>
        </td>
        <td className="px-3 py-3 border-b border-gray-100 text-center align-middle">
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg font-bold text-gray-900">{average.toFixed(2)}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${gradeCategory.bgClass} ${gradeCategory.textClass}`}>
              {gradeCategory.text}
            </span>
          </div>
        </td>
      </tr>
    );
  };

  // ==========================================
  // Renderizado de tabla primaria
  // ==========================================

  const renderPrimaryTable = () => (
    <div className="report-container w-full max-w-5xl mx-auto p-5 flex flex-col gap-2 font-['Nunito',sans-serif]">
      <ReportHeader />
      <StudentInfoTable />

      <table className="report-table w-full border-collapse mt-4 bg-white rounded-lg overflow-hidden print:overflow-visible shadow-sm print:shadow-none">
        <thead>
          <tr className="bg-gray-100 print:bg-white">
            <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">Área</th>
            <th className="px-1 py-3 text-center text-sm font-semibold text-gray-700 border-b border-gray-200 w-10">IHS</th>
            <th className="px-1 py-3 text-center text-sm font-semibold text-gray-700 border-b border-gray-200 w-8">F</th>
            <th className="px-1 py-3 text-center text-sm font-semibold text-gray-700 border-b border-gray-200 w-8">FI</th>
            <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">Logros</th>
            <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 w-24">Notas</th>
            <th className="px-3 py-3 text-center text-sm font-semibold text-gray-700 border-b border-gray-200 w-24">Promedio</th>
          </tr>
        </thead>
        <tbody>
          {reportData.primary.map((subject, index) => (
            <SubjectRow key={index} subject={subject} index={index} />
          ))}
        </tbody>
      </table>

      <ConventionsTable />
      <GradeScaleTable />
      <ObservationsTable />
      <SignaturesTable periodId={periodId} directorName={directorName} />
    </div>
  );

  // ==========================================
  // Renderizado de grupos secundaria
  // ==========================================

  const renderSecondaryGroups = () => (
    <div className="report-container w-full max-w-5xl mx-auto p-5 flex flex-col gap-2 font-['Nunito',sans-serif]">
      <ReportHeader />

      <p className="text-center text-lg font-bold text-gray-800 my-2">INFORME DE VALORACIÓN</p>

      <StudentInfoTable />

      {reportData.secondary.map((group, groupIndex) => (
        <div key={groupIndex} className="area-group mt-6 w-full">
          <h3 className="bg-gray-200 print:bg-white text-gray-900 px-4 py-2.5 rounded-md font-semibold text-sm mb-3">
            {group.nombreArea}
          </h3>
          <table className="report-table w-full border-collapse bg-white rounded-lg overflow-hidden print:overflow-visible shadow-sm print:shadow-none">
            <thead>
              <tr className="bg-gray-100 print:bg-white">
                <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">Asignatura</th>
                <th className="px-1 py-3 text-center text-sm font-semibold text-gray-700 border-b border-gray-200 w-10">IHS</th>
                <th className="px-1 py-3 text-center text-sm font-semibold text-gray-700 border-b border-gray-200 w-8">F</th>
                <th className="px-1 py-3 text-center text-sm font-semibold text-gray-700 border-b border-gray-200 w-8">FI</th>
                <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">Logros</th>
                <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 w-24">Notas</th>
                <th className="px-3 py-3 text-center text-sm font-semibold text-gray-700 border-b border-gray-200 w-24">Promedio</th>
              </tr>
            </thead>
            <tbody>
              {group.subjects.map((subject, index) => (
                <SubjectRow key={index} subject={subject} index={index} />
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <div className="mt-4 space-y-2">
        <ConventionsTable />
        <GradeScaleTable />
        <ObservationsTable />
        <SignaturesTable periodId={periodId} directorName={directorName} />
      </div>
    </div>
  );

  // ==========================================
  // Estados de carga y error
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Cargando informe...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!reportData.primary.length && !reportData.secondary.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-gray-800">Sin datos aún</p>
          <p className="text-sm text-gray-500 mt-2">
            No hay calificaciones registradas para el período {periodId} de {year}.
            Los datos aparecerán cuando el docente ingrese las notas.
          </p>
        </div>
      </div>
    );
  }

  return isSecondary ? renderSecondaryGroups() : renderPrimaryTable();
};

export default AcademicReport;
