/**
 * @fileoverview Layout unificado para informes académicos
 * @module presentation/components/reports/UnifiedReportLayout
 *
 * Componente reutilizable que proporciona la estructura base para informes
 * de preescolar, primaria y secundaria. Incluye header institucional,
 * controles de impresión y soporte para diferentes tamaños de papel.
 */

import React from 'react';
import logo from '../../../assets/logo/logotipo.jpg';
import { usePrintSetup, PrintControls } from '../PrintableReport';

// ============================================
// Tipos
// ============================================

export interface UnifiedReportLayoutProps {
  /** Nivel educativo: determina el logo a usar */
  nivel: 'preescolar' | 'primaria' | 'secundaria';
  /** Contenido del informe */
  children: React.ReactNode;
  /** Clase CSS adicional para el contenedor */
  className?: string;
}

// ============================================
// Componente
// ============================================

export const UnifiedReportLayout: React.FC<UnifiedReportLayoutProps> = ({
  nivel,
  children,
  className = '',
}) => {
  // Hook de impresión
  const { paperSize, setPaperSize, handlePrint } = usePrintSetup();

  // Determinar logo según nivel
  const logoSrc = logo; // Por ahora usamos el mismo logo, después se puede agregar logoPreschool

  // Fecha de generación
  const generatedAt = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="print:h-auto print:overflow-visible print:bg-white">
      {/* Controles de impresión (ocultos al imprimir) */}
      <div className="print:hidden sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 mb-4 flex items-center justify-end gap-3">
        <PrintControls
          paperSize={paperSize}
          onPaperSizeChange={setPaperSize}
          onPrint={handlePrint}
        />
      </div>

      {/* Contenedor principal del informe */}
      <div
        className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden print:shadow-none print:rounded-none print:border-none ${className}`}
        style={{ maxWidth: '816px', margin: '0 auto' }}
      >
        {/* Header institucional */}
        <table className="w-full border-collapse mb-4">
          <thead>
            <tr className="h-28">
              <td className="w-24 p-2 border border-gray-100 align-middle">
                <img src={logoSrc} alt="logotipo" className="w-16 mx-auto" />
              </td>
              <td className="px-6 py-3 border border-gray-100 text-center" colSpan={2}>
                <b className="text-base font-bold text-gray-900">COLINA CAMPESTRE SCHOOL</b>
                <p className="text-[10pt] text-gray-600 mt-1 leading-relaxed">
                  De Sincelejo, Sucre, con reconocimiento oficial en los niveles de Preescolar, Básica Primaria y Básica Secundaria
                  por parte de Secretaria de Educación Municipal, según resolución No 2747 del 12 de diciembre de 2023.
                  Carrera 34 No 38-158, teléfonos: 2771068-3006781806
                </p>
                <p className="text-[10pt] text-gray-700 font-semibold mt-1">NIT: 901731191-3</p>
              </td>
              <td className="w-28 px-3 py-2 border border-gray-100 text-center text-xs text-gray-600 align-middle">
                DANE 370001038852
              </td>
            </tr>
          </thead>
        </table>

        {/* Contenido del informe */}
        <div className="px-6">
          {children}
        </div>

        {/* Footer */}
        <div className="px-8 py-3 bg-gray-50 print:bg-white border-t border-gray-100 text-center mt-6">
          <p className="text-[9px] text-gray-400">
            Informe generado el {generatedAt} · Sistema Cubbico
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnifiedReportLayout;
