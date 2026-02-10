/**
 * @fileoverview Vista de reporte académico (similar a AttendanceReport)
 * @module presentation/features/reports/AcademicReportView
 *
 * Vista completa con sidebar, header y controles de impresión para informes académicos.
 * Reutiliza el diseño de AttendanceReport que le gustó al usuario.
 *
 * Ruta: /private/dashboard/informe/:nivel/:periodId/:studentId/:year
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SidebarV2 } from '../../components/sidebarV2';
import { HeaderV2 } from '../../components/headerV2';
import { usePrintSetup, PrintControls } from '../../components/PrintableReport';
import { useReportData } from './hooks/useReportData';
import { PrimaryReportContent } from '../../components/reports/PrimaryReportContent';
import { SecondaryReportContent } from '../../components/reports/SecondaryReportContent';
import logo from '../../../assets/logo/logotipo.jpg';
import {
  IconLoader,
  IconAlertCircle,
  IconArrowBack,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';
import './AcademicReportView.css';

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
// Componente
// ============================================

export default function AcademicReportView() {
  const params = useParams<RouteParams>() as RouteParams;
  const { nivel, periodId: initialPeriodId, studentId, year } = params;
  const navigate = useNavigate();
  const isSidebarCollapsed = useSidebarCollapsed();
  const { paperSize, setPaperSize, handlePrint } = usePrintSetup();

  const [currentPeriod, setCurrentPeriod] = useState(initialPeriodId);

  // Determinar schoolLevel según nivel
  const schoolLevel = nivel === 'secundaria' ? '2' : '1';

  // Cargar datos usando el hook
  const { reportData, studentInfo, fechaEntrega, director, loading, error } = useReportData({
    studentId,
    year,
    periodId: currentPeriod,
    schoolLevel
  });


  // Navegar periodos
  function prevPeriod() {
    const current = Number(currentPeriod);
    if (current > 1) {
      setCurrentPeriod(String(current - 1));
    }
  }

  function nextPeriod() {
    const current = Number(currentPeriod);
    if (current < 4) {
      setCurrentPeriod(String(current + 1));
    }
  }

  // Etiqueta del periodo
  const periodLabel = `Periodo ${currentPeriod}`;

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
            title={`Informe Académico - ${nivel.charAt(0).toUpperCase() + nivel.slice(1).toLowerCase()}`}
            subtitle={studentInfo ? `${studentInfo.name} ${studentInfo.lastName}` : undefined}
            isSidebarCollapsed={isSidebarCollapsed}
          />
        </div>
        <div className="print:hidden h-16 flex-shrink-0" />

        <main className="flex-1 overflow-auto min-h-0 p-4 lg:p-5 print:overflow-visible">

          {/* ── Controls (ocultos en impresión) ── */}
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
                  {studentInfo ? `${studentInfo.name} ${studentInfo.lastName}` : 'Informe Académico'}
                </h1>
                <p className="text-[11px] text-gray-400">
                  {studentInfo?.className} · <span className="font-bold text-red-600">Año: {year}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={prevPeriod}
                disabled={Number(currentPeriod) === 1}
                className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <IconChevronLeft size={14} className="text-gray-500" />
              </button>
              <span className="text-sm font-bold text-gray-700 w-28 text-center">{periodLabel}</span>
              <button
                onClick={nextPeriod}
                disabled={Number(currentPeriod) === 4}
                className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <IconChevronRight size={14} className="text-gray-500" />
              </button>
              <PrintControls paperSize={paperSize} onPaperSizeChange={setPaperSize} onPrint={handlePrint} />
            </div>
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="print:hidden mb-3 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <IconAlertCircle size={16} className="text-red-500 flex-shrink-0" /> {error}
            </div>
          )}

          {/* ══════════════════════════════════════════════
              DOCUMENTO DEL INFORME
              ══════════════════════════════════════════════ */}
          <div className="report-container bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden print:shadow-none print:rounded-none print:border-none font-['Nunito',sans-serif]" style={{ maxWidth: '816px', margin: '0 auto', padding: '1.25rem' }}>

            {/* ── Header institucional ── */}
            <table className="w-full border-collapse thead-header-info">
              <thead>
                <tr className="h-28">
                  <td className="w-24 p-2 border border-gray-100 align-middle">
                    <img src={logo} alt="logotipo" className="w-16 mx-auto" />
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

            {/* ── Contenido del informe según nivel ── */}
            <div>
              {nivel.toLowerCase() === 'primaria' && (
                <PrimaryReportContent
                  reportData={reportData.primary}
                  studentInfo={studentInfo}
                  periodId={currentPeriod}
                  director={director}
                  fechaEntrega={fechaEntrega}
                />
              )}

              {nivel.toLowerCase() === 'secundaria' && (
                <SecondaryReportContent
                  reportData={reportData.secondary}
                  studentInfo={studentInfo}
                  periodId={currentPeriod}
                  director={director}
                  fechaEntrega={fechaEntrega}
                />
              )}

              {nivel.toLowerCase() === 'preescolar' && (
                <div className="text-center p-8">
                  <p className="text-gray-500">Vista de preescolar - Por implementar</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Aquí se mostrará el informe de preescolar
                  </p>
                </div>
              )}

              {!reportData.primary.length && !reportData.secondary.length && nivel.toLowerCase() !== 'preescolar' && (
                <div className="text-center p-8">
                  <p className="text-gray-500">No hay datos para este periodo</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Los datos aparecerán cuando el docente ingrese las notas
                  </p>
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="px-8 py-3 bg-gray-50 print:bg-white border-t border-gray-100 text-center">
              <p className="text-[9px] text-gray-400">
                Informe generado el {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} ·
                Periodo {currentPeriod} · {year} · Sistema Cubbico
              </p>
            </div>
          </div>

          {/* Espaciador inferior en pantalla */}
          <div className="print:hidden h-6" />
        </main>
      </div>
    </div>
  );
}
