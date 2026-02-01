/**
 * @fileoverview Componente para impresión masiva de informes por salón
 * @module presentation/features/reports/BulkReportPrinter
 *
 * Genera UN documento único con todos los informes de estudiantes
 * uno debajo de otro, configurado para hoja legal y exportable a PDF.
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../infrastructure/firebase/firebase';
import { usePermissions } from '../../hooks/usePermissions';
import { useAppSelector } from '../../../app/store/store';
import logo from '../../../assets/logo/logotipo.jpg';
import firmOne from '../../../assets/firm/01.jpg';
import firmTwo from '../../../assets/firm/02.jpg';
import {
  IconPrinter,
  IconLoader2,
  IconAlertCircle,
  IconArrowLeft,
  IconCheck,
  IconX,
  IconLock,
  IconFileTypePdf
} from '@tabler/icons-react';
import { usePrintSetup, PrintControls } from '../../components/PrintableReport';

// ============================================
// Tipos
// ============================================

interface Student {
  id: string;
  name: string;
  lastName: string;
  document?: string;
  className?: string;
}

interface Grades {
  l1: number;
  l2: number;
  l3: number;
  fallas: number;
  fallasVerificadas?: number;
}

interface Achievement {
  logro1: string;
  logro2: string;
  logro3: string;
}

interface SubjectData {
  areaId: string;
  asignatura: string;
  ihs: string;
  grades: Grades;
  achievements: Achievement;
  orden: number;
  area?: string;
}

interface StudentReportData {
  student: Student;
  subjects: SubjectData[];
}

// ============================================
// Estilos de impresión (inline para PDF)
// ============================================

const printStyles = `
  @media print {
    body {
      background: white !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .no-print { display: none !important; }
    .page-break { page-break-after: always; break-after: page; }
    .student-report { page-break-inside: avoid; }
    .bulk-preview-backdrop { display: none !important; }
    .bulk-preview-scroll {
      position: static !important;
      overflow: visible !important;
      display: block !important;
      padding: 0 !important;
    }
    .bulk-preview-shell {
      max-width: none !important;
      border-radius: 0 !important;
      box-shadow: none !important;
    }
    .bulk-preview-header { display: none !important; }
  }
`;

// ============================================
// Componente de Informe Individual
// ============================================

const StudentReportCard: React.FC<{
  data: StudentReportData;
  periodId: string;
  director: string;
  isLast: boolean;
  isSecondary: boolean;
}> = ({ data, periodId, director, isLast, isSecondary }) => {
  const { student, subjects } = data;

  const calculateAverage = (l1: number, l2: number, l3: number) => {
    return ((l1 + l2 + l3) / 3).toFixed(2);
  };

  const getGradeCategory = (average: number) => {
    if (average >= 4.6) return { text: 'Superior', bgClass: 'bg-blue-100', textClass: 'text-blue-700' };
    if (average >= 4.0) return { text: 'Alto', bgClass: 'bg-emerald-100', textClass: 'text-emerald-700' };
    if (average >= 3.0) return { text: 'Básico', bgClass: 'bg-amber-100', textClass: 'text-amber-700' };
    return { text: 'Bajo', bgClass: 'bg-red-100', textClass: 'text-red-700' };
  };

  // Agrupar por área si es secundaria
  const groupedSubjects = isSecondary
    ? subjects.reduce((acc, subj) => {
        const areaName = subj.area || 'Otras';
        if (!acc[areaName]) acc[areaName] = [];
        acc[areaName].push(subj);
        return acc;
      }, {} as Record<string, SubjectData[]>)
    : null;

  const renderSubjectRow = (subject: SubjectData, index: number) => {
    const average = parseFloat(calculateAverage(subject.grades.l1, subject.grades.l2, subject.grades.l3));
    const cat = getGradeCategory(average);

    return (
      <tr key={subject.areaId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
        <td className="px-2 py-2 border border-gray-200 text-xs font-medium text-gray-900">
          {subject.asignatura}
        </td>
        <td className="px-2 py-2 border border-gray-200 text-xs text-center text-gray-600">
          {subject.ihs}
        </td>
        <td className="px-2 py-2 border border-gray-200 text-xs text-center text-gray-600">
          {subject.grades.fallas || 0}
        </td>
        <td className="px-2 py-2 border border-gray-200 text-xs text-center text-gray-600">
          {subject.grades.fallasVerificadas || 0}
        </td>
        <td className="px-2 py-2 border border-gray-200 text-xs">
          <div className="space-y-1">
            <div className="flex gap-1">
              <span className="w-4 h-4 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">1</span>
              <span className="text-gray-700 leading-tight">{subject.achievements.logro1 || 'N/A'}</span>
            </div>
            <div className="flex gap-1">
              <span className="w-4 h-4 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">2</span>
              <span className="text-gray-700 leading-tight">{subject.achievements.logro2 || 'N/A'}</span>
            </div>
            <div className="flex gap-1">
              <span className="w-4 h-4 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">3</span>
              <span className="text-gray-700 leading-tight">{subject.achievements.logro3 || 'N/A'}</span>
            </div>
          </div>
        </td>
        <td className="px-2 py-2 border border-gray-200 text-xs">
          <div className="space-y-0.5">
            <div><span className="text-gray-500">L1:</span> {subject.grades.l1?.toFixed(1) || '0.0'}</div>
            <div><span className="text-gray-500">L2:</span> {subject.grades.l2?.toFixed(1) || '0.0'}</div>
            <div><span className="text-gray-500">L3:</span> {subject.grades.l3?.toFixed(1) || '0.0'}</div>
          </div>
        </td>
        <td className="px-2 py-2 border border-gray-200 text-center">
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-gray-900">{average}</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${cat.bgClass} ${cat.textClass}`}>
              {cat.text}
            </span>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className={`student-report bg-white p-4 ${!isLast ? 'page-break' : ''}`}>
      {/* Header institucional */}
      <table className="w-full border-collapse mb-3">
        <tbody>
          <tr>
            <td className="w-20 p-1 border border-gray-200 align-middle">
              <img src={logo} alt="logotipo" className="w-14 mx-auto" />
            </td>
            <td className="px-3 py-2 border border-gray-200 text-center">
              <b className="text-sm font-bold text-gray-900">COLINA CAMPESTRE SCHOOL</b>
              <p className="text-[9pt] text-gray-600 mt-1 leading-tight">
                De Sincelejo, Sucre, con reconocimiento oficial en los niveles de Preescolar, Básica Primaria y Básica Secundaria
                por parte de Secretaria de Educación Municipal, según resolución No 2747 del 12 de diciembre de 2023.
                Carrera 34 No 38-158, teléfonos: 2771068-3006781806
              </p>
              <p className="text-[9pt] text-gray-700 font-semibold">NIT: 901731191-3</p>
            </td>
            <td className="w-24 px-2 py-1 border border-gray-200 text-center text-[10px] text-gray-600 align-middle">
              DANE 370001038852
            </td>
          </tr>
        </tbody>
      </table>

      {/* Info estudiante */}
      <table className="w-full border-collapse mb-3 border border-indigo-200">
        <thead className="bg-gray-100">
          <tr>
            <td className="px-2 py-1 text-[10pt] font-bold text-gray-700 border border-gray-200">ESTUDIANTE</td>
            <td className="px-2 py-1 text-[10pt] font-bold text-gray-700 border border-gray-200">GRADO</td>
            <td className="px-2 py-1 text-[10pt] font-bold text-gray-700 border border-gray-200">PERIODO</td>
            <td className="px-2 py-1 text-[10pt] font-bold text-gray-700 border border-gray-200">FECHA</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-2 py-1 text-[10pt] font-bold text-gray-900 border border-gray-200">
              {`${student.name} ${student.lastName}`.toUpperCase()}
            </td>
            <td className="px-2 py-1 text-[10pt] font-bold text-gray-900 border border-gray-200">
              {student.className?.toUpperCase() || '-'}
            </td>
            <td className="px-2 py-1 text-[10pt] font-bold text-gray-900 border border-gray-200">{periodId}</td>
            <td className="px-2 py-1 text-[10pt] font-bold text-gray-900 border border-gray-200">
              {new Date().toLocaleDateString('es-CO')}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Tabla de notas */}
      {isSecondary && groupedSubjects ? (
        // Vista secundaria: agrupado por áreas
        Object.entries(groupedSubjects).map(([areaName, areaSubjects]) => (
          <div key={areaName} className="mb-3">
            <h3 className="bg-gray-200 text-gray-900 px-2 py-1 text-xs font-semibold mb-1 rounded">
              {areaName}
            </h3>
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1 text-left font-semibold text-gray-700 border border-gray-200">Asignatura</th>
                  <th className="px-2 py-1 text-center font-semibold text-gray-700 border border-gray-200 w-10">IHS</th>
                  <th className="px-2 py-1 text-center font-semibold text-gray-700 border border-gray-200 w-8">F</th>
                  <th className="px-2 py-1 text-center font-semibold text-gray-700 border border-gray-200 w-8">FI</th>
                  <th className="px-2 py-1 text-left font-semibold text-gray-700 border border-gray-200">Logros</th>
                  <th className="px-2 py-1 text-left font-semibold text-gray-700 border border-gray-200 w-16">Notas</th>
                  <th className="px-2 py-1 text-center font-semibold text-gray-700 border border-gray-200 w-16">Prom.</th>
                </tr>
              </thead>
              <tbody>
                {areaSubjects.map((subj, idx) => renderSubjectRow(subj, idx))}
              </tbody>
            </table>
          </div>
        ))
      ) : (
        // Vista primaria: lista plana
        <table className="w-full border-collapse text-xs mb-3">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-2 py-1 text-left font-semibold text-gray-700 border border-gray-200">Área</th>
              <th className="px-2 py-1 text-center font-semibold text-gray-700 border border-gray-200 w-10">IHS</th>
              <th className="px-2 py-1 text-center font-semibold text-gray-700 border border-gray-200 w-8">F</th>
              <th className="px-2 py-1 text-center font-semibold text-gray-700 border border-gray-200 w-8">FI</th>
              <th className="px-2 py-1 text-left font-semibold text-gray-700 border border-gray-200">Logros</th>
              <th className="px-2 py-1 text-left font-semibold text-gray-700 border border-gray-200 w-16">Notas</th>
              <th className="px-2 py-1 text-center font-semibold text-gray-700 border border-gray-200 w-16">Prom.</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subj, idx) => renderSubjectRow(subj, idx))}
          </tbody>
        </table>
      )}

      {/* Convenciones y escala */}
      <div className="text-[9pt] text-gray-600 mb-2">
        <p><strong>CONVENCIONES:</strong> I.H.S (Intensidad Horaria Semanal), L (Logro), F (Fallas), FI (Fallas injustificadas)</p>
        <p><strong>ESCALA DE VALORACIÓN:</strong> Superior: 4.6 - 5.0; Alto: 4.0 - 4.5; Básico: 3.0 - 3.9; Bajo: 1.0 - 2.9</p>
      </div>

      {/* Observaciones */}
      <div className="border border-gray-200 mb-3">
        <div className="bg-gray-100 px-2 py-1 text-[10pt] font-bold text-gray-700">OBSERVACIONES</div>
        <div className="h-10"></div>
      </div>

      {/* Firmas */}
      <table className="w-full border-collapse">
        <tbody>
          <tr>
            <td className="text-center py-2 border border-gray-200 w-1/3">
              <div className="flex flex-col items-center mt-6">
                <img src={firmTwo} alt="firma directora" className="w-24 h-auto" />
                <p className="text-[9pt] font-medium text-gray-900 mt-1">ANA KARINA GOMEZ BUSTAMANTE</p>
                <p className="text-[9pt] text-gray-600">Directora</p>
              </div>
            </td>
            <td className="text-center py-2 border border-gray-200 w-1/3">
              <div className="flex flex-col items-center mt-6">
                <img src={firmOne} alt="firma coordinadora" className="w-24 h-auto" />
                <p className="text-[9pt] font-medium text-gray-900 mt-1">NURIA MILENA MONTES SALAS</p>
                <p className="text-[9pt] text-gray-600">Coordinadora Académica</p>
              </div>
            </td>
            <td className="text-center py-2 border border-gray-200 w-1/3">
              <div className="flex flex-col items-center mt-6">
                <div className="w-24 h-8 border-b border-gray-400"></div>
                <p className="text-[9pt] font-medium text-gray-900 mt-1">{director || 'Director(a) de Grupo'}</p>
                <p className="text-[9pt] text-gray-600">Director(a) de Grupo</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// ============================================
// Componente Principal
// ============================================

const BulkReportPrinter: React.FC = () => {
  const { periodId, classroomId } = useParams<{ periodId: string; classroomId: string }>();
  const { permissions } = usePermissions();
  const classroom = useAppSelector(state =>
    state.teacherData.classrooms.find(c => c.id === classroomId)
  );

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [reportsData, setReportsData] = useState<StudentReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSecondary = classroom?.nivel === '2' || classroom?.nivel === 'secundaria';
  const year = new Date().getFullYear().toString();
  const { paperSize, setPaperSize, handlePrint } = usePrintSetup('legal');

  // Cargar estudiantes del salón
  useEffect(() => {
    const fetchStudents = async () => {
      if (!classroomId) {
        setError('Salón no especificado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const studentsQuery = query(
          collection(db, 'student'),
          where('classroomId', '==', classroomId)
        );
        const snapshot = await getDocs(studentsQuery);

        const studentsList = snapshot.docs.map(d => ({
          id: d.id,
          name: d.data().name || '',
          lastName: d.data().lastName || '',
          document: d.data().document || d.id,
          className: d.data().className || classroom?.nombreSalon || ''
        }));

        studentsList.sort((a, b) => a.lastName.localeCompare(b.lastName));
        setStudents(studentsList);
        setSelectedStudents(new Set(studentsList.map(s => s.id)));
        setError(null);
      } catch (err) {
        console.error('Error al cargar estudiantes:', err);
        setError('Error al cargar la lista de estudiantes');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [classroomId, classroom?.nombreSalon]);

  // Generar informes para los estudiantes seleccionados
  const generateReports = async () => {
    if (selectedStudents.size === 0) {
      alert('Selecciona al menos un estudiante');
      return;
    }

    setGenerating(true);

    try {
      // Cargar metadatos de áreas
      const areasSnapshot = await getDocs(collection(db, 'areas'));
      const areasMap = areasSnapshot.docs.reduce((acc, d) => {
        acc[d.id] = {
          asignatura: d.data().asignatura || d.id,
          ihs: d.data().ihs || 'N/A',
          orden: parseInt(d.data().orden) || 9999,
          area: d.data().area || 'Otras'
        };
        return acc;
      }, {} as Record<string, any>);

      const selectedList = students.filter(s => selectedStudents.has(s.id));
      const reports: StudentReportData[] = [];

      for (const student of selectedList) {
        const historySnap = await getDoc(doc(db, 'history', student.id));
        const yearData = historySnap.data()?.years?.[year];
        const periodAreas = yearData?.periods?.[periodId!]?.areas || {};

        const subjects: SubjectData[] = [];

        for (const [areaId, areaData] of Object.entries(periodAreas)) {
          const areaInfo = areasMap[areaId] || {};

          // Obtener logros
          let achievements = { logro1: 'N/A', logro2: 'N/A', logro3: 'N/A' };
          const achievementId = (areaData as any).metadata?.achievementId;
          if (achievementId) {
            const achievementSnap = await getDoc(doc(db, 'achievements', achievementId));
            if (achievementSnap.exists()) {
              achievements = achievementSnap.data().logros || achievements;
            }
          }

          subjects.push({
            areaId,
            asignatura: areaInfo.asignatura || areaId,
            ihs: areaInfo.ihs || 'N/A',
            grades: (areaData as any).grades || { l1: 0, l2: 0, l3: 0, fallas: 0 },
            achievements,
            orden: areaInfo.orden || 9999,
            area: areaInfo.area
          });
        }

        // Ordenar por 'orden'
        subjects.sort((a, b) => a.orden - b.orden);

        reports.push({ student, subjects });
      }

      setReportsData(reports);
      setShowPreview(true);
    } catch (err) {
      console.error('Error generando informes:', err);
      alert('Error al generar los informes');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showPreview) setShowPreview(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showPreview]);

  // Verificar permisos
  if (!permissions.canViewAllReports) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <IconLock size={32} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Acceso restringido</h2>
          <p className="text-gray-600 mb-6">
            Solo los coordinadores pueden acceder a la impresión masiva de informes.
          </p>
          <Link
            to={-1 as unknown as string}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <IconArrowLeft size={18} />
            Volver
          </Link>
        </div>
      </div>
    );
  }

  const toggleStudent = (studentId: string) => {
    const newSelection = new Set(selectedStudents);
    if (newSelection.has(studentId)) {
      newSelection.delete(studentId);
    } else {
      newSelection.add(studentId);
    }
    setSelectedStudents(newSelection);
  };

  const toggleAll = () => {
    if (selectedStudents.size === students.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(students.map(s => s.id)));
    }
  };

  // Vista principal
  return (
    <>
      {showPreview && <style>{printStyles}</style>}

      {/* Página de selección */}
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8 print:hidden">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <IconPrinter size={24} className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Impresión Masiva de Informes</h1>
                <p className="text-sm text-gray-500">
                  {classroom?.nombreSalon || 'Salón'} · Período {periodId}
                </p>
              </div>
            </div>
            <Link
              to={`/private/dashboard/academy/${periodId}/${classroom?.nivel}/${classroomId}`}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <IconArrowLeft size={18} />
              Volver
            </Link>
          </div>

          <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <IconFileTypePdf size={20} className="text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              Se generará un documento único con todos los informes. Podrás imprimirlo o guardarlo como PDF.
            </p>
          </div>
        </div>

        {/* Contenido */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleAll}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                {selectedStudents.size === students.length ? (
                  <>
                    <IconX size={16} />
                    Deseleccionar todos
                  </>
                ) : (
                  <>
                    <IconCheck size={16} />
                    Seleccionar todos
                  </>
                )}
              </button>
              <span className="text-sm text-gray-500">
                {selectedStudents.size} de {students.length} seleccionados
              </span>
            </div>

            <button
              onClick={generateReports}
              disabled={selectedStudents.size === 0 || loading || generating}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-sm transition-all duration-200 hover:from-blue-600 hover:to-indigo-700 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <IconLoader2 size={18} className="animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <IconFileTypePdf size={18} />
                  Generar informes ({selectedStudents.size})
                </>
              )}
            </button>
          </div>

          {/* Lista de estudiantes */}
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <IconLoader2 size={32} className="text-blue-500 animate-spin mb-3" />
                <p className="text-sm text-gray-600">Cargando estudiantes...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 mb-3 bg-red-100 rounded-full flex items-center justify-center">
                  <IconAlertCircle size={24} className="text-red-500" />
                </div>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            ) : students.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-sm text-gray-600">No hay estudiantes en este salón</p>
              </div>
            ) : (
              students.map((student) => (
                <label
                  key={student.id}
                  className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedStudents.has(student.id)}
                    onChange={() => toggleStudent(student.id)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {`${student.lastName} ${student.name}`.toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">{student.document || student.id}</p>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>
      </div>
    </div>

      {/* Backdrop del modal */}
      {showPreview && (
        <div
          className="bulk-preview-backdrop fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowPreview(false)}
        />
      )}

      {/* Modal de previsualización */}
      {showPreview && (
        <div className="bulk-preview-scroll fixed inset-0 z-50 overflow-y-auto flex items-start justify-center p-4 py-8">
          <div className="bulk-preview-shell bg-white rounded-2xl shadow-2xl w-full max-w-6xl relative">
            {/* Header modal */}
            <div className="bulk-preview-header sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-5 py-3 rounded-t-2xl flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Informes del Período</h3>
                <p className="text-xs text-gray-500">{classroom?.nombreSalon} · Período {periodId} · {reportsData.length} informes</p>
              </div>
              <div className="flex items-center gap-3">
                <PrintControls paperSize={paperSize} onPaperSizeChange={setPaperSize} onPrint={handlePrint} />
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <IconX size={18} />
                </button>
              </div>
            </div>
            {/* Contenido imprimible */}
            <div className="p-4 bg-white">
              {reportsData.map((reportData, index) => (
                <StudentReportCard
                  key={reportData.student.id}
                  data={reportData}
                  periodId={periodId || ''}
                  director={classroom?.directorGrupo || ''}
                  isLast={index === reportsData.length - 1}
                  isSecondary={isSecondary}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkReportPrinter;
