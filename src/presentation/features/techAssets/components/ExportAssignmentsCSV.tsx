/**
 * @fileoverview Componente de exportación CSV de asignaciones de activos tecnológicos
 * @module presentation/features/techAssets/components/ExportAssignmentsCSV
 */

import React from 'react';
import { AssetAssignment } from '../../../../domain/entities/assetAssignment';

/**
 * Escapa valores para CSV y maneja caracteres especiales
 */
function csvEscape(v: unknown): string {
  const s = String(v ?? '');
  return `"${s.replace(/"/g, '""')}"`;
}

/**
 * Construye el CSV con los campos de asignaciones de activos
 */
function buildAssignmentsCSV(assignments: AssetAssignment[]): string {
  // Headers en español con tildes
  const header = [
    'TIPO DE ACTIVO',
    'MARCA',
    'MODELO',
    'NÚMERO DE SERIE',
    'USUARIO',
    'TIPO DE USUARIO',
    'FECHA DE ENTREGA',
    'FECHA DE DEVOLUCIÓN',
    'ESTADO',
    'QUIEN ENTREGA',
    'OBSERVACIONES',
    'DESCRIPCIÓN DE DAÑOS'
  ];

  const lines = assignments.map((assignment) => {
    // Formatear fecha de entrega
    const fechaEntrega = assignment.fechaEntrega
      ? new Date(assignment.fechaEntrega).toLocaleDateString('es-CO')
      : '';

    // Formatear fecha de devolución
    const fechaDevolucion = assignment.fechaDevolucion
      ? new Date(assignment.fechaDevolucion).toLocaleDateString('es-CO')
      : '';

    // Traducir estado a español
    const estadoMap: Record<string, string> = {
      'activa': 'Activa',
      'devuelta': 'Devuelta',
      'perdida': 'Perdida',
      'dañada': 'Dañada'
    };

    // Traducir tipo de usuario
    const userTypeMap: Record<string, string> = {
      'estudiante': 'Estudiante',
      'profesor': 'Profesor'
    };

    return [
      assignment.assetTipo || '',
      assignment.assetMarca || '',
      assignment.assetModelo || '',
      assignment.assetSerial || '',
      assignment.userName || '',
      userTypeMap[assignment.userType] || assignment.userType,
      fechaEntrega,
      fechaDevolucion,
      estadoMap[assignment.estado] || assignment.estado,
      assignment.quienEntrega || '',
      assignment.observaciones || '',
      assignment.descripcionDanios || ''
    ].map(csvEscape).join(',');
  });

  // BOM para que Excel reconozca UTF-8 con tildes
  const bom = '\uFEFF';
  return bom + [header.join(','), ...lines].join('\n');
}

/**
 * Descarga el archivo CSV
 */
function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

interface ExportAssignmentsCSVProps {
  assignments: AssetAssignment[];
  className?: string;
}

/**
 * Botón de exportación CSV de asignaciones de activos tecnológicos
 */
const ExportAssignmentsCSV: React.FC<ExportAssignmentsCSVProps> = ({
  assignments,
  className = ''
}) => {
  const handleExport = () => {
    if (!assignments || assignments.length === 0) {
      alert('No hay asignaciones para exportar');
      return;
    }

    const csv = buildAssignmentsCSV(assignments);
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
    const filename = `asignaciones_activos_${timestamp}.csv`;

    downloadCSV(csv, filename);
  };

  return (
    <button
      onClick={handleExport}
      disabled={!assignments || assignments.length === 0}
      className={`
        inline-flex items-center gap-2 px-4 py-2.5
        text-sm font-medium rounded-lg
        bg-orchid-blue-60
        text-white
        hover:bg-orchid-blue-70
        focus:outline-none focus:ring-2 focus:ring-orchid-blue-20 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200
        ${className}
      `}
      title="Exportar asignaciones de activos a CSV"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Exportar Asignaciones (.CSV)
      {assignments && assignments.length > 0 && (
        <span className="ml-1 px-2 py-0.5 bg-orchid-blue-5 text-orchid-blue-70 rounded-full text-xs font-semibold">
          {assignments.length}
        </span>
      )}
    </button>
  );
};

export default ExportAssignmentsCSV;
