/**
 * @fileoverview Utilidades de impresión para reportes
 * @module presentation/components/PrintableReport
 *
 * - usePrintSetup: hook que inyecta @page CSS según tamaño de papel
 * - PrintControls: selector de papel + botón imprimir (print:hidden)
 *
 * Uso en reportes con sidebar (InformePorSalon, AttendanceReport):
 *   const { paperSize, setPaperSize, handlePrint } = usePrintSetup();
 *   <PrintControls paperSize={paperSize} onPaperSizeChange={setPaperSize} onPrint={handlePrint} />
 *
 * Uso en reportes puros sin sidebar (AcademicReport, FinalReport):
 *   usePrintSetup(); // solo inyecta @page, sin controles visibles
 */

import { useEffect, useState } from 'react';
import { IconPrinter, IconFile, IconFileText } from '@tabler/icons-react';

export type PaperSize = 'carta' | 'legal';

// ============================================
// Hook
// ============================================

export function usePrintSetup(defaultSize: PaperSize = 'legal') {
  const [paperSize, setPaperSize] = useState<PaperSize>(defaultSize);

  useEffect(() => {
    const cssSize = paperSize === 'carta' ? 'letter' : 'legal';
    const style = document.createElement('style');
    style.id = 'print-setup-page';
    style.textContent = [
      '@media print {',
      `  @page { size: ${cssSize}; margin: 0.5in; }`,
      '  body { background: white !important; }',
      '}',
    ].join('\n');
    document.head.appendChild(style);
    return () => { style.remove(); };
  }, [paperSize]);

  const handlePrint = () => window.print();

  return { paperSize, setPaperSize, handlePrint };
}

// ============================================
// PrintControls
// ============================================

export function PrintControls({
  paperSize,
  onPaperSizeChange,
  onPrint,
}: {
  paperSize: PaperSize;
  onPaperSizeChange: (size: PaperSize) => void;
  onPrint: () => void;
}) {
  return (
    <div className="print:hidden flex items-center gap-2">
      <div className="flex bg-gray-100 rounded-lg p-0.5">
        <button
          onClick={() => onPaperSizeChange('carta')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
            paperSize === 'carta'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <IconFile size={13} />
          Carta
        </button>
        <button
          onClick={() => onPaperSizeChange('legal')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
            paperSize === 'legal'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <IconFileText size={13} />
          Legal
        </button>
      </div>
      <div className="w-px h-5 bg-gray-200" />
      <button
        onClick={onPrint}
        className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gray-800 rounded-lg hover:bg-gray-900 transition-all duration-200 shadow-sm hover:shadow"
      >
        <IconPrinter size={14} />
        Imprimir
      </button>
    </div>
  );
}
