/**
 * @fileoverview Contenido del informe académico para primaria
 * @module presentation/components/reports/PrimaryReportContent
 *
 * Componente que renderiza el informe académico para estudiantes de primaria.
 * Muestra tabla de asignaturas con IHS, logros, notas y promedios.
 */

import React from 'react';
import type { SubjectData, StudentData } from '../../../presentation/features/reports/hooks/useReportData';
import firmOne from '../../../assets/firm/01.jpg';
import firmTwo from '../../../assets/firm/02.jpg';

// ============================================
// Tipos
// ============================================

export interface PrimaryReportContentProps {
  reportData: SubjectData[];
  studentInfo: StudentData | null;
  periodId?: string;
  director?: string;
  fechaEntrega?: string;
}

// ============================================
// Utilidades
// ============================================

const calculateAverage = (l1: number, l2: number, l3: number) => {
  return ((l1 + l2 + l3) / 3).toFixed(2);
};

const getGradeCategory = (average: number) => {
  if (average >= 4.6) return { text: 'Superior', bgClass: 'bg-blue-100', textClass: 'text-blue-700' };
  if (average >= 4.0) return { text: 'Alto', bgClass: 'bg-tosca/20', textClass: 'text-tosca-700' };
  if (average >= 3.0) return { text: 'Básico', bgClass: 'bg-amber-100', textClass: 'text-amber-700' };
  return { text: 'Bajo', bgClass: 'bg-red-100', textClass: 'text-red-700' };
};

// ============================================
// Sub-componentes
// ============================================

const StudentInfoTable: React.FC<{
  studentInfo: StudentData | null;
  periodId?: string;
  fechaEntrega?: string;
}> = ({ studentInfo, periodId, fechaEntrega }) => (
  <table className="w-full border-collapse border border-indigo-200 table-student-info mb-4">
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
            (studentInfo.historicClassName || studentInfo.className).toUpperCase() :
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

const ConventionsTable: React.FC = () => (
  <table className="w-full border-collapse border border-indigo-200 mb-4">
    <tbody>
      <tr>
        <td colSpan={2} className="px-4 py-2 text-[11pt] text-gray-600 border border-gray-100">
          <p>CONVENCIONES: I.H.S (Intensidad Horaria Semanal), L (Logro), F (Fallas), FI (Fallas injustificadas)</p>
        </td>
      </tr>
    </tbody>
  </table>
);

const GradeScaleTable: React.FC = () => (
  <table className="w-full border-collapse border border-indigo-200 mb-4">
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
              <span className="w-3 h-3 rounded-full bg-tosca/100"></span>
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

const ObservationsTable: React.FC = () => (
  <table className="w-full border-collapse border border-indigo-200 mb-4">
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

const SignaturesTable: React.FC<{ periodId?: string; director?: string }> = ({ periodId, director }) => (
  <table className="w-full border-collapse border border-indigo-200">
    <tbody>
      <tr>
        {periodId === '4' && (
          <td className="text-center py-4 border border-gray-100">
            <div className="firma flex flex-col items-center mt-12">
              <img src={firmTwo} alt="firma directora" className="w-36 h-auto" />
              <p className="text-[10pt] font-medium text-gray-900 mt-2">ANA KARINA GOMEZ BUSTAMANTE</p>
              <p className="text-[10pt] text-gray-600">Directora</p>
            </div>
          </td>
        )}
        {periodId === '4' && (
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
            <p className="text-[10pt] font-medium text-gray-900 mt-2">{director || "Director(a) de Grupo"}</p>
            <p className="text-[10pt] text-gray-600">Director(a) de Grupo</p>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
);

const SubjectRow: React.FC<{ subject: SubjectData; index: number }> = ({ subject, index }) => {
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

// ============================================
// Componente principal
// ============================================

export const PrimaryReportContent: React.FC<PrimaryReportContentProps> = ({
  reportData,
  studentInfo,
  periodId,
  director,
  fechaEntrega
}) => {
  return (
    <div className="primary-report-content">
      <StudentInfoTable studentInfo={studentInfo} periodId={periodId} fechaEntrega={fechaEntrega} />

      <table className="report-table w-full border-collapse mt-4 bg-white rounded-lg overflow-hidden print:overflow-visible shadow-sm print:shadow-none mb-4">
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
          {reportData.map((subject, index) => (
            <SubjectRow key={subject.areaId} subject={subject} index={index} />
          ))}
        </tbody>
      </table>

      <ConventionsTable />
      <GradeScaleTable />
      <ObservationsTable />
      <SignaturesTable periodId={periodId} director={director} />
    </div>
  );
};

export default PrimaryReportContent;
