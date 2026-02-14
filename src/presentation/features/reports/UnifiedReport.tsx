/**
 * @fileoverview Componente unificado para informes académicos
 * @module presentation/features/reports/UnifiedReport
 *
 * Vista unificada que renderiza informes de preescolar, primaria o secundaria
 * utilizando el layout común y los componentes de contenido específicos.
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { UnifiedReportLayout } from '../../components/reports/UnifiedReportLayout';
import { PrimaryReportContent } from '../../components/reports/PrimaryReportContent';
import { SecondaryReportContent } from '../../components/reports/SecondaryReportContent';
import { useReportData } from './hooks/useReportData';

// ============================================
// Tipos
// ============================================

interface RouteParams {
  nivel: 'primaria' | 'secundaria' | 'preescolar';
  periodId: string;
  studentId: string;
  year: string;
}

// ============================================
// Componente
// ============================================

export default function UnifiedReport() {
  const { nivel, periodId, studentId, year } = useParams<RouteParams>() as RouteParams;

  // Determinar schoolLevel según nivel
  const schoolLevel = nivel === 'secundaria' ? '2' : '1';

  // Cargar datos usando el hook
  const { reportData, studentInfo, fechaEntrega, loading, error } = useReportData({
    studentId,
    year,
    periodId,
    schoolLevel
  });

  // ══════════════════════════════════════════════
  // Estados de carga y error
  // ══════════════════════════════════════════════

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
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
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
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
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

  // ══════════════════════════════════════════════
  // Renderizado según nivel
  // ══════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <UnifiedReportLayout nivel={nivel}>
        {nivel === 'primaria' && (
          <PrimaryReportContent
            reportData={reportData.primary}
            studentInfo={studentInfo}
            periodId={periodId}
            fechaEntrega={fechaEntrega}
          />
        )}

        {nivel === 'secundaria' && (
          <SecondaryReportContent
            reportData={reportData.secondary}
            studentInfo={studentInfo}
            periodId={periodId}
            fechaEntrega={fechaEntrega}
          />
        )}

        {nivel === 'preescolar' && (
          <div className="text-center p-8">
            <p className="text-gray-500">Vista de preescolar - Por implementar</p>
            <p className="text-sm text-gray-400 mt-2">
              Aquí se mostrará el componente de informes de preescolar
            </p>
          </div>
        )}
      </UnifiedReportLayout>
    </div>
  );
}
