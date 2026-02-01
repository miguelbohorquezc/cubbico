import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../../infrastructure/firebase/firebase';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import logo from '../../../assets/logo/logotipo.jpg';
import { usePrintSetup, PrintControls } from '../PrintableReport';
import { IconClipboardList, IconX, IconEye } from '@tabler/icons-react';
import './InformePorSalon.css';

interface Grades {
  l1: number;
  l2: number;
  l3: number;
  fallas: number;
}

interface SubjectMeta {
  areaId: string;
  asignatura: string;
  ihs: string;
  orden: string;
  nivel: string;
}

interface StudentAverage {
  studentId: string;
  studentName: string;
  averages: Record<string, number>;
  generalAverage: number;
  position: number;
}

const calculateAverage = (grades: Grades): number => {
  const { l1, l2, l3 } = grades;
  return Math.round(((l1 + l2 + l3) / 3) * 100) / 100;
};

const getGradeCategory = (avg: number): { letter: string; bgClass: string; textClass: string } => {
  if (avg >= 4.6) return { letter: 'S', bgClass: 'bg-blue-100', textClass: 'text-blue-700' };
  if (avg >= 4.0) return { letter: 'A', bgClass: 'bg-emerald-100', textClass: 'text-emerald-700' };
  if (avg >= 3.0) return { letter: 'B', bgClass: 'bg-amber-100', textClass: 'text-amber-700' };
  return { letter: 'B', bgClass: 'bg-red-100', textClass: 'text-red-700' };
};

const ClassAveragesReport: React.FC = () => {
  const { classroomId, schoolLevel, periodId, year } = useParams<{
    classroomId?: string;
    schoolLevel?: string;
    periodId?: string;
    year?: string;
  }>();

  const [classroomName, setClassroomName] = useState<string>('');
  const [subjectsMeta, setSubjectsMeta] = useState<SubjectMeta[]>([]);
  const [studentAverages, setStudentAverages] = useState<StudentAverage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { paperSize, setPaperSize, handlePrint } = usePrintSetup();

  useEffect(() => {
    const fetchClassAverages = async () => {
      if (!classroomId || !schoolLevel || !periodId || !year) {
        setError('Parámetros inválidos');
        setLoading(false);
        return;
      }

      try {
        // Obtener nombre del salón
        const classroomDocRef = doc(db, 'classRooms', classroomId);
        const classroomDoc = await getDoc(classroomDocRef);
        if (classroomDoc.exists()) {
          setClassroomName(classroomDoc.data().nombreSalon || classroomId);
        } else {
          setClassroomName(classroomId);
        }

        // 1. Metadatos de áreas filtrado por nivel
        const desiredNivel = schoolLevel.toLowerCase();
        const areasQuery = query(
          collection(db, 'areas'),
          where('nivel', '==', desiredNivel)
        );
        const areasSnap = await getDocs(areasQuery);
        const metaList = areasSnap.docs.map(doc => ({
          areaId: doc.id,
          asignatura: doc.data().asignatura || doc.id,
          ihs: doc.data().ihs ? String(doc.data().ihs) : 'N/A',
          orden: doc.data().orden ? String(doc.data().orden) : '9999',
          nivel: doc.data().nivel || ''
        }));

        // Ordenar asignaturas por el campo 'orden' configurado en /area
        metaList.sort((a, b) => {
          const orderA = parseInt(a.orden) || 9999;
          const orderB = parseInt(b.orden) || 9999;
          return orderA - orderB;
        });

        setSubjectsMeta(metaList);
        const validAreaIds = metaList.map(m => m.areaId);

        // 2. Obtener estudiantes del salón
        const studentsQuery = query(
          collection(db, 'student'),
          where('classroomId', '==', classroomId)
        );
        const studentsSnap = await getDocs(studentsQuery);
        const studentsData = studentsSnap.docs.map(snap => ({
          id: snap.id,
          ...(snap.data() as any)
        }));

        // 3. Calcular promedios y general
        const averagesArr = await Promise.all(
          studentsData.map(async student => {
            const historyDoc = await getDoc(doc(db, 'history', student.id));
            const yearData = historyDoc.data()?.years?.[year];
            const periodAreas = yearData?.periods?.[periodId]?.areas || {};

            const averages: Record<string, number> = {};
            Object.entries(periodAreas).forEach(([areaId, areaData]: any) => {
              if (!validAreaIds.includes(areaId)) return;
              const grades: Grades = areaData.grades || { l1: 0, l2: 0, l3: 0, fallas: 0 };
              averages[areaId] = calculateAverage(grades);
            });

            const generalAverage = parseFloat(
              (
                Object.values(averages).reduce((sum, val) => sum + val, 0) /
                Object.values(averages).length || 0
              ).toFixed(2)
            );

            return {
              studentId: student.id,
              studentName: `${student.name} ${student.lastName}`,
              averages,
              generalAverage,
              position: 0
            };
          })
        );

        // 4. Ordenar y asignar posiciones
        const sorted = [...averagesArr].sort((a, b) => b.generalAverage - a.generalAverage);
        sorted.forEach((item, idx) => {
          item.position = idx + 1;
        });

        setStudentAverages(sorted);
      } catch (err: any) {
        setError(err.message || 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    fetchClassAverages();
  }, [classroomId, schoolLevel, periodId, year]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPreviewOpen) setIsPreviewOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isPreviewOpen]);

  // ==========================================
  // Estados de carga y error
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Cargando promedios de la clase...</p>
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

  const areaIds = subjectsMeta.map(m => m.areaId);
  const classAverage = parseFloat(
    (
      studentAverages.reduce((sum, s) => sum + s.generalAverage, 0) /
      studentAverages.length || 0
    ).toFixed(2)
  );

  // ==========================================
  // Componente de badge de calificación
  // ==========================================

  const GradeBadge = ({ average }: { average: number }) => {
    const cat = getGradeCategory(average);
    return (
      <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-bold ${cat.bgClass} ${cat.textClass}`}>
        {cat.letter}
      </span>
    );
  };

  return (
    <>
      {/* Página de inicio */}
      <div className="preview-landing min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
          <div className="p-8">
            <div className="w-14 h-14 mx-auto mb-5 bg-blue-50 rounded-2xl flex items-center justify-center">
              <IconClipboardList size={28} className="text-blue-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 text-center">Reporte de Promedios</h1>
            <p className="text-sm text-gray-500 text-center mt-1">
              {classroomName} · {schoolLevel?.toUpperCase()} · Período {periodId}
            </p>
            <div className="flex justify-center gap-6 mt-5 pt-5 border-t border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{studentAverages.length}</p>
                <p className="text-xs text-gray-500">Estudiantes</p>
              </div>
              <div className="w-px bg-gray-200" />
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{classAverage.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Prom. Salón</p>
              </div>
              <div className="w-px bg-gray-200" />
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{subjectsMeta.length}</p>
                <p className="text-xs text-gray-500">Asignaturas</p>
              </div>
            </div>
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="mt-6 w-full flex items-center justify-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <IconEye size={18} />
              Vista Previa
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isPreviewOpen && (
        <div
          className="preview-modal-backdrop fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsPreviewOpen(false)}
        />
      )}

      {/* Modal de previsualización */}
      {isPreviewOpen && (
        <div className="preview-modal-scroll fixed inset-0 z-50 overflow-y-auto flex items-start justify-center p-4 py-8">
          <div className="preview-modal-shell bg-white rounded-2xl shadow-2xl w-full max-w-6xl relative">
            {/* Header modal */}
            <div className="preview-modal-header sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-5 py-3 rounded-t-2xl flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Reporte de Promedios</h3>
                <p className="text-xs text-gray-500">{classroomName} · Período {periodId}</p>
              </div>
              <div className="flex items-center gap-3">
                <PrintControls paperSize={paperSize} onPaperSizeChange={setPaperSize} onPrint={handlePrint} />
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <IconX size={18} />
                </button>
              </div>
            </div>
            {/* Contenido del reporte */}
            <div className="p-4">
    <div className="class-averages-report font-['Nunito',sans-serif] bg-white rounded-lg p-4">
      {/* Header de la escuela */}
      <table className="w-full border-collapse mb-4">
        <thead>
          <tr className="h-28">
            <td className="w-24 p-2 border border-gray-100 align-middle">
              <img src={logo} alt="logotipo" className="w-16 mx-auto" />
            </td>
            <td className="px-6 py-3 border border-gray-100 text-center" colSpan={2}>
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

      {/* Título del reporte */}
      <h2 className="text-center my-4">
        <span className="text-lg font-bold text-gray-800">
          {`REPORTE DE PROMEDIOS - SALÓN ${classroomName.toUpperCase()} - ${schoolLevel?.toUpperCase()} - P ${periodId}`}
        </span>
      </h2>

      {/* Tabla de promedios */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse table-fixed">
          <thead>
            <tr className="bg-gray-100 print:bg-white">
              <th className="th-vertical w-12 px-2 py-3 border border-gray-200 text-center text-xs font-semibold text-gray-600 align-bottom">
                <p className="m-0">Pos.</p>
              </th>
              <th className="w-40 px-3 py-3 border border-gray-200 text-left text-xs font-semibold text-gray-700">
                <p className="m-0">Estudiante</p>
              </th>
              {areaIds.map(id => (
                <th
                  key={id}
                  className="th-vertical w-14 px-1 py-2 border border-gray-200 text-center text-[11px] font-semibold text-gray-600 align-bottom"
                >
                  <p className="m-0">{subjectsMeta.find(m => m.areaId === id)?.asignatura || id}</p>
                </th>
              ))}
              <th className="th-vertical w-16 px-2 py-3 border border-gray-200 text-center text-xs font-semibold text-gray-700 align-bottom">
                <p className="m-0">Prom. Gral.</p>
              </th>
            </tr>
          </thead>
          <tbody>
            {studentAverages.map((student, idx) => (
              <tr
                key={student.studentId}
                className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-gray-50/30 transition-colors print:bg-white`}
              >
                {/* Posición */}
                <td className="px-2 py-2 border border-gray-100 text-center align-middle">
                  <span className={`
                    inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold
                    ${student.position === 1 ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-600'}
                  `}>
                    {student.position}
                  </span>
                </td>

                {/* Nombre del estudiante */}
                <td className="px-3 py-2 border border-gray-100 align-middle">
                  <p className="m-0 text-[11pt] font-semibold text-gray-900 text-left truncate">
                    {student.studentName}
                  </p>
                </td>

                {/* Promedios por asignatura */}
                {areaIds.map(id => {
                  const avg = student.averages[id];
                  if (avg === undefined) {
                    return (
                      <td key={id} className="px-1 py-2 border border-gray-100 text-center text-gray-400">
                        -
                      </td>
                    );
                  }
                  return (
                    <td key={id} className="px-1 py-2 border border-gray-100 text-center align-middle">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-sm font-medium text-gray-800">{avg.toFixed(2)}</span>
                        <GradeBadge average={avg} />
                      </div>
                    </td>
                  );
                })}

                {/* Promedio general */}
                <td className="px-2 py-2 border border-gray-100 text-center align-middle bg-gray-50 print:bg-white">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-sm font-bold text-gray-900">{student.generalAverage.toFixed(2)}</span>
                    <GradeBadge average={student.generalAverage} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resumen del salón */}
      <div className="resumen-salon mt-6 flex justify-end items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 print:bg-white rounded-lg">
        <span className="text-sm font-semibold text-gray-700">Promedio general del salón:</span>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">{classAverage.toFixed(2)}</span>
          <GradeBadge average={classAverage} />
        </div>
      </div>

      {/* Leyenda */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600 justify-center">
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          S: Superior (4.6-5.0)
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          A: Alto (4.0-4.5)
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          B: Básico (3.0-3.9)
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
          B: Bajo (1.0-2.9)
        </span>
      </div>
    </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClassAveragesReport;
