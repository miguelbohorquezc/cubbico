import React, { useState, useEffect } from 'react';
import {
  fetchPeriodConfigsByYear,
  savePeriodConfig,
  formatFechaEntrega
} from '../../../infrastructure/periodConfig.service';
import { PeriodConfig } from '../../../domain/entities/periodConfig';

const PERIODS = ['1', '2', '3', '4'];

interface PeriodEditData {
  fechaEntrega: string;
  fechaInicio: string;
  fechaFin: string;
}

const PeriodConfigManager: React.FC = () => {
  const currentYear = String(new Date().getFullYear());
  const [year, setYear] = useState(currentYear);
  const [configs, setConfigs] = useState<PeriodConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [editData, setEditData] = useState<Record<string, PeriodEditData>>({});

  useEffect(() => {
    loadConfigs();
  }, [year]);

  const loadConfigs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPeriodConfigsByYear(year);
      setConfigs(data);

      const initial: Record<string, PeriodEditData> = {};
      PERIODS.forEach(p => {
        const existing = data.find(c => c.periodId === p);
        initial[p] = {
          fechaEntrega: existing?.fechaEntrega || '',
          fechaInicio: existing?.fechaInicio || '',
          fechaFin: existing?.fechaFin || '',
        };
      });
      setEditData(initial);
    } catch (err) {
      setError('Error al cargar configuraciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (periodId: string) => {
    const data = editData[periodId];
    if (!data?.fechaEntrega) {
      setError('Debe seleccionar una fecha de entrega');
      return;
    }

    setSaving(periodId);
    setError(null);
    setSuccess(null);

    try {
      await savePeriodConfig({
        periodId,
        year,
        fechaEntrega: data.fechaEntrega,
        fechaInicio: data.fechaInicio || undefined,
        fechaFin: data.fechaFin || undefined,
      });
      setSuccess(`Período ${periodId} guardado correctamente`);
      await loadConfigs();
    } catch (err) {
      setError('Error al guardar configuración');
      console.error(err);
    } finally {
      setSaving(null);
    }
  };

  const handleFieldChange = (periodId: string, field: keyof PeriodEditData, value: string) => {
    setEditData(prev => ({
      ...prev,
      [periodId]: { ...prev[periodId], [field]: value }
    }));
  };

  const years = [
    String(Number(currentYear) - 1),
    currentYear,
    String(Number(currentYear) + 1)
  ];

  const isConfigured = (config: PeriodConfig | undefined): boolean =>
    Boolean(config?.fechaEntrega);

  const hasAttendanceDates = (config: PeriodConfig | undefined): boolean =>
    Boolean(config?.fechaInicio && config?.fechaFin);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-orchid-blue-60 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Cargando configuraciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-4">
        <p className="text-gray-600 text-sm">
          Configure las fechas de entrega e inicio/fin de asistencia para cada período académico.
        </p>
      </div>

      {/* Selector de año */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Año académico
        </label>
        <div className="flex gap-2">
          {years.map(y => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                year === y
                  ? 'bg-orchid-blue-60 text-white shadow-md hover:bg-orchid-blue-70'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      {/* Tarjetas de períodos */}
      <div className="space-y-4">
        {PERIODS.map(periodId => {
          const config = configs.find(c => c.periodId === periodId);
          const isSaving = saving === periodId;
          const data = editData[periodId] || { fechaEntrega: '', fechaInicio: '', fechaFin: '' };

          return (
            <div key={periodId} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Encabezado de la tarjeta */}
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 bg-orchid-blue-10 text-orchid-blue-70 rounded-full flex items-center justify-center font-bold text-sm border border-orchid-blue-30">
                    P{periodId}
                  </span>
                  <span className="font-semibold text-gray-900">Período {periodId}</span>
                </div>
                <div className="flex items-center gap-2">
                  {isConfigured(config) ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      Entrega configurada
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                      Pendiente
                    </span>
                  )}
                  {hasAttendanceDates(config) && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      Asistencia configurada
                    </span>
                  )}
                </div>
              </div>

              {/* Campos */}
              <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Fecha de entrega */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Fecha de entrega del informe
                  </label>
                  <input
                    type="date"
                    value={data.fechaEntrega}
                    onChange={e => handleFieldChange(periodId, 'fechaEntrega', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orchid-blue-30 focus:border-orchid-blue-60 text-gray-900 text-sm"
                  />
                  {config?.fechaEntrega && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      Guardado: {formatFechaEntrega(config.fechaEntrega)}
                    </p>
                  )}
                </div>

                {/* Inicio asistencia */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Inicio de asistencia del período
                  </label>
                  <input
                    type="date"
                    value={data.fechaInicio}
                    onChange={e => handleFieldChange(periodId, 'fechaInicio', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orchid-blue-30 focus:border-orchid-blue-60 text-gray-900 text-sm"
                  />
                  {config?.fechaInicio && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      Guardado: {formatFechaEntrega(config.fechaInicio)}
                    </p>
                  )}
                </div>

                {/* Fin asistencia */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Fin de asistencia del período
                  </label>
                  <input
                    type="date"
                    value={data.fechaFin}
                    onChange={e => handleFieldChange(periodId, 'fechaFin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orchid-blue-30 focus:border-orchid-blue-60 text-gray-900 text-sm"
                  />
                  {config?.fechaFin && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      Guardado: {formatFechaEntrega(config.fechaFin)}
                    </p>
                  )}
                </div>
              </div>

              {/* Footer con botón */}
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => handleSave(periodId)}
                  disabled={isSaving}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isSaving
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-orchid-blue-60 text-white hover:bg-orchid-blue-70 shadow-sm hover:shadow'
                  }`}
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Guardando...
                    </span>
                  ) : (
                    'Guardar período'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info adicional */}
      <div className="mt-6 p-4 bg-orchid-blue-10 border border-orchid-blue-30 rounded-lg">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-orchid-blue-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-sm text-orchid-blue-70 space-y-1">
            <p><strong>Fecha de entrega:</strong> Se muestra en los informes académicos.</p>
            <p><strong>Inicio / Fin de asistencia:</strong> Define el rango del período para la planilla de asistencia del docente.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeriodConfigManager;
