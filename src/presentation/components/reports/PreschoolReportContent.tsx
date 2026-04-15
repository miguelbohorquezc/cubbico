/**
 * @fileoverview Contenido del informe académico para preescolar
 * @module presentation/components/reports/PreschoolReportContent
 *
 * Componente modernizado para informes de preescolar con diseño minimalista
 * y bordes grises sutiles, manteniendo la estructura de propósitos e indicadores.
 */

import React from 'react';
import type { StudentData } from '../../features/reports/hooks/useReportData';
import ReportExtraContent from './ReportExtraContent';
import firmOne from '../../../assets/firm/01.jpg';
import firmTwo from '../../../assets/firm/02.jpg';

// ============================================
// Tipos
// ============================================

export interface ProposedData {
  id: string;
  texto: string;
  referentes: string[];
  indicadores: { asignaturaId: string; texto: string }[];
}

export interface PreschoolReportContentProps {
  reportData: ProposedData[];
  studentInfo: StudentData | null;
  periodId?: string;
  director?: string;
  fechaEntrega?: string;
  year?: string;
}

// ============================================
// Sub-componentes
// ============================================

const StudentInfoTable: React.FC<{
  studentInfo: StudentData | null;
  periodId?: string;
  fechaEntrega?: string;
}> = ({ studentInfo, periodId, fechaEntrega }) => (
  <table className="w-full border-collapse border border-gray-200 table-student-info mb-4">
    <thead className="bg-gray-50 print:bg-white">
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

const ProposedSection: React.FC<{ proposito: ProposedData; index: number }> = ({ proposito, index }) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden mb-6 print:break-inside-avoid">
    <table className="w-full border-collapse">
      <thead>
        <tr>
          <th
            colSpan={2}
            className="bg-gray-50 print:bg-white p-5 text-left text-sm font-semibold text-gray-800 border-b border-gray-200"
          >
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                {index + 1}
              </span>
              <span className="leading-relaxed">Propósito: {proposito.texto.toLowerCase()}</span>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr className="align-top">
          {/* Columna Referentes */}
          <td className="w-[40%] p-4 border-r border-gray-200 bg-gray-50/30 print:bg-white">
            <h4 className="text-xs font-semibold uppercase text-gray-700 mb-3 tracking-wide flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
              Referentes
            </h4>
            <ul className="space-y-2">
              {proposito.referentes.map((r, idx) => (
                <li
                  key={idx}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-800 leading-relaxed"
                >
                  <span className="font-semibold text-blue-600 mr-1">{idx + 1}.</span>
                  {r}
                </li>
              ))}
            </ul>
          </td>

          {/* Columna Indicadores */}
          <td className="p-4 bg-white">
            <h4 className="text-xs font-semibold uppercase text-gray-700 mb-3 tracking-wide flex items-center gap-2">
              <span className="w-1 h-4 bg-tosca/100 rounded-full"></span>
              Indicadores de Desempeño
            </h4>
            <div className="space-y-2">
              {proposito.indicadores.map((ind, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 bg-white hover:bg-gray-50/50 transition-colors"
                >
                  <p className="text-xs text-gray-800 leading-relaxed">
                    <span className="inline-block w-1.5 h-1.5 bg-tosca/100 rounded-full mr-2"></span>
                    {ind.texto}
                  </p>
                </div>
              ))}
              {proposito.indicadores.length === 0 && (
                <p className="text-xs italic text-gray-400 px-3 py-2">
                  Sin indicadores evaluados
                </p>
              )}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

const ObservationsTable: React.FC = () => (
  <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
    <div className="bg-gray-50 print:bg-white px-4 py-3 border-b border-gray-200">
      <h4 className="text-xs font-semibold uppercase text-gray-700 tracking-wide flex items-center gap-2">
        <span className="w-1 h-4 bg-amber-500 rounded-full"></span>
        Observaciones
      </h4>
    </div>
    <div className="p-4 bg-white min-h-[60px]">
      <p className="text-xs text-gray-400 italic">Espacio para observaciones del docente...</p>
    </div>
  </div>
);

const SignaturesTable: React.FC<{ periodId?: string; director?: string }> = ({ periodId, director }) => (
  <table className="w-full border-collapse border border-gray-200 mt-4">
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
          <div className="firma flex flex-col items-center">
            <div className="w-36 h-20"></div>
            <div className="w-36 border-b border-gray-400 mb-2"></div>
            <p className="text-[10pt] font-medium text-gray-900">{director || "Director(a) de Grupo"}</p>
            <p className="text-[10pt] text-gray-600">Director(a) de Grupo</p>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
);

// ============================================
// Componente principal
// ============================================

export const PreschoolReportContent: React.FC<PreschoolReportContentProps> = ({
  reportData,
  studentInfo,
  periodId,
  director,
  fechaEntrega,
  year,
}) => {
  return (
    <div className="preschool-report-content">
      <StudentInfoTable studentInfo={studentInfo} periodId={periodId} fechaEntrega={fechaEntrega} />

      {/* Propósitos con sus indicadores */}
      <div className="mt-4">
        {reportData.map((proposito, index) => (
          <ProposedSection key={proposito.id} proposito={proposito} index={index} />
        ))}
      </div>

      {reportData.length === 0 && (
        <div className="text-center p-8 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-gray-500">No hay datos de evaluación para este periodo</p>
        </div>
      )}

      <ReportExtraContent
        classroomId={studentInfo?.classroomId}
        year={year}
        periodId={periodId}
        showCatedra={false}
      />
      <ObservationsTable />
      <SignaturesTable periodId={periodId} director={director} />
    </div>
  );
};

export default PreschoolReportContent;
