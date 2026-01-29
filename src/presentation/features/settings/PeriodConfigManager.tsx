import React, { useState, useEffect } from 'react';
import {
  fetchPeriodConfigsByYear,
  savePeriodConfig,
  formatFechaEntrega
} from '../../../infrastructure/periodConfig.service';
import { PeriodConfig } from '../../../domain/entities/periodConfig';

const PERIODS = ['1', '2', '3', '4'];

const PeriodConfigManager: React.FC = () => {
  const currentYear = String(new Date().getFullYear());
  const [year, setYear] = useState(currentYear);
  const [configs, setConfigs] = useState<PeriodConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estado local para edición
  const [editData, setEditData] = useState<Record<string, { fechaEntrega: string }>>({});

  useEffect(() => {
    loadConfigs();
  }, [year]);

  const loadConfigs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPeriodConfigsByYear(year);
      setConfigs(data);

      // Inicializar datos de edición
      const initial: Record<string, { fechaEntrega: string }> = {};
      PERIODS.forEach(p => {
        const existing = data.find(c => c.periodId === p);
        initial[p] = { fechaEntrega: existing?.fechaEntrega || '' };
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
        fechaEntrega: data.fechaEntrega
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

  const handleDateChange = (periodId: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      [periodId]: { ...prev[periodId], fechaEntrega: value }
    }));
  };

  const years = [
    String(Number(currentYear) - 1),
    currentYear,
    String(Number(currentYear) + 1)
  ];

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
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
          Configure las fechas de entrega de informes para cada período académico.
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
              className={`
                px-4 py-2 rounded-lg font-medium transition-all
                ${year === y
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
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

      {/* Tabla de períodos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Período
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Fecha de Entrega
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Estado
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {PERIODS.map((periodId, idx) => {
              const config = configs.find(c => c.periodId === periodId);
              const isSaving = saving === periodId;

              return (
                <tr
                  key={periodId}
                  className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} border-b border-gray-100`}
                >
                  {/* Período */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                        P{periodId}
                      </span>
                      <span className="font-medium text-gray-900">
                        Período {periodId}
                      </span>
                    </div>
                  </td>

                  {/* Fecha de entrega */}
                  <td className="px-6 py-4">
                    <input
                      type="date"
                      value={editData[periodId]?.fechaEntrega || ''}
                      onChange={(e) => handleDateChange(periodId, e.target.value)}
                      className="
                        w-full px-3 py-2 border border-gray-300 rounded-lg
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        text-gray-900
                      "
                    />
                    {config?.fechaEntrega && (
                      <p className="text-xs text-gray-500 mt-1">
                        Actual: {formatFechaEntrega(config.fechaEntrega)}
                      </p>
                    )}
                  </td>

                  {/* Estado */}
                  <td className="px-6 py-4">
                    {config?.fechaEntrega ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Configurado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                        <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                        Pendiente
                      </span>
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleSave(periodId)}
                      disabled={isSaving}
                      className={`
                        px-4 py-2 rounded-lg font-medium transition-all
                        ${isSaving
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow'
                        }
                      `}
                    >
                      {isSaving ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Guardando...
                        </span>
                      ) : (
                        'Guardar'
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Info adicional */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> La fecha de entrega configurada se mostrará automáticamente
              en los informes académicos de cada período.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeriodConfigManager;
