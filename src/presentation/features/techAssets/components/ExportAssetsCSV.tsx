/**
 * @fileoverview Componente de exportación CSV de activos tecnológicos
 * @module presentation/features/techAssets/components/ExportAssetsCSV
 */

import React from 'react';
import { TechAsset } from '../../../../domain/entities/techAsset';

/**
 * Escapa valores para CSV y maneja caracteres especiales
 */
function csvEscape(v: unknown): string {
  const s = String(v ?? '');
  return `"${s.replace(/"/g, '""')}"`;
}

/**
 * Construye el CSV con los campos de activos tecnológicos
 */
function buildAssetsCSV(assets: TechAsset[]): string {
  // Headers en español con tildes
  const header = [
    'TIPO',
    'MARCA',
    'MODELO',
    'NÚMERO DE SERIE',
    'ESTADO',
    'FECHA DE REGISTRO',
    'OBSERVACIONES'
  ];

  const lines = assets.map((asset) => {
    // Formatear fecha de registro
    const fechaRegistro = asset.fechaRegistro
      ? new Date(asset.fechaRegistro).toLocaleDateString('es-CO')
      : '';

    // Traducir estado a español
    const estadoMap: Record<string, string> = {
      'disponible': 'Disponible',
      'asignado': 'Asignado',
      'mantenimiento': 'En Mantenimiento',
      'dado_de_baja': 'Dado de Baja'
    };

    return [
      asset.tipo || '',
      asset.marca || '',
      asset.modelo || '',
      asset.serial || '',
      estadoMap[asset.estado] || asset.estado,
      fechaRegistro,
      asset.observaciones || ''
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

interface ExportAssetsCSVProps {
  assets: TechAsset[];
  className?: string;
}

/**
 * Botón de exportación CSV de activos tecnológicos
 */
const ExportAssetsCSV: React.FC<ExportAssetsCSVProps> = ({
  assets,
  className = ''
}) => {
  const handleExport = () => {
    if (!assets || assets.length === 0) {
      alert('No hay activos para exportar');
      return;
    }

    const csv = buildAssetsCSV(assets);
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
    const filename = `activos_tecnologicos_${timestamp}.csv`;

    downloadCSV(csv, filename);
  };

  return (
    <button
      onClick={handleExport}
      disabled={!assets || assets.length === 0}
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
      title="Exportar activos tecnológicos a CSV"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Exportar Activos (.CSV)
      {assets && assets.length > 0 && (
        <span className="ml-1 px-2 py-0.5 bg-orchid-blue-5 text-orchid-blue-70 rounded-full text-xs font-semibold">
          {assets.length}
        </span>
      )}
    </button>
  );
};

export default ExportAssetsCSV;
