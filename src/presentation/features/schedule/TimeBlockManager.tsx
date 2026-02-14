/**
 * @fileoverview Gestor de bloques horarios personalizables (solo Coordinador)
 * @module presentation/features/schedule/TimeBlockManager
 *
 * Permite al Coordinador configurar bloques horarios con:
 * - Hora de inicio personalizable (intervalos de 10 minutos)
 * - Duración variable (40, 45, 50, 60 minutos)
 * - Bloques específicos por día (ej: viernes diferente a L-J)
 */

import { useState, useEffect, useCallback } from 'react';
import { SidebarV2 } from '../../components/sidebarV2';
import { HeaderV2 } from '../../components/headerV2';
import {
  fetchTimeBlockConfig,
  saveTimeBlockConfig,
  addBlockToConfig,
  updateBlockInConfig,
  removeBlockFromConfig,
} from '../../../infrastructure/timeBlock.service';
import type { TimeBlock, TimeBlockConfiguration } from '../../../domain/entities/timeBlock';
import {
  generateBlockId,
  validateTimeBlock,
  detectBlockOverlap,
  getBlockEndTime,
  blockToHoraString,
  VALID_DURATIONS,
} from '../../../domain/entities/timeBlock';
import { DAYS_OF_WEEK } from '../../../domain/entities/schedule';
import {
  IconClock,
  IconPlus,
  IconTrash,
  IconEdit,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconLoader,
  IconCalendar,
  IconCalendarTime,
} from '@tabler/icons-react';

// ============================================
// Hook: sincronizar estado del sidebar
// ============================================

const SIDEBAR_KEY = 'cubbico-sidebar-collapsed';

function useSidebarCollapsed(): boolean {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        setCollapsed(localStorage.getItem(SIDEBAR_KEY) === 'true');
      } catch {
        /* noop */
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return collapsed;
}

// ============================================
// Tipos para el formulario
// ============================================

interface BlockFormData {
  id?: string;
  startTime: string;
  duration: number;
  label: string;
  isBreak: boolean;
  daysOfWeek: number[];
}

const EMPTY_FORM: BlockFormData = {
  startTime: '08:00',
  duration: 45,
  label: '',
  isBreak: false,
  daysOfWeek: [0, 1, 2, 3, 4],
};

// ============================================
// Componente principal
// ============================================

export default function TimeBlockManager() {
  const isSidebarCollapsed = useSidebarCollapsed();
  const currentYear = String(new Date().getFullYear());

  // ── Estado ─────────────────────────────────────
  const [year, setYear] = useState(currentYear);
  const [config, setConfig] = useState<TimeBlockConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ── Formulario ─────────────────────────────────
  const [formData, setFormData] = useState<BlockFormData>(EMPTY_FORM);
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ── Vista activa (tabs) ────────────────────────
  const [activeView, setActiveView] = useState<'default' | 'special'>('default');

  // ============================================
  // Cargar configuración inicial
  // ============================================

  useEffect(() => {
    loadConfig();
  }, [year]);

  const loadConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const loadedConfig = await fetchTimeBlockConfig(year);
      setConfig(loadedConfig);
    } catch (err) {
      setError('Error al cargar configuración de bloques horarios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // Guardar configuración
  // ============================================

  const handleSaveConfig = useCallback(async () => {
    if (!config) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await saveTimeBlockConfig(config);
      setSuccess('Configuración guardada exitosamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const errorMessage = err?.message || 'Error al guardar configuración';
      setError(errorMessage);
      console.error('Error en handleSaveConfig:', err);
    } finally {
      setSaving(false);
    }
  }, [config]);

  // Auto-save con debounce
  useEffect(() => {
    if (!config || loading) return;

    const timeoutId = setTimeout(() => {
      handleSaveConfig();
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [config, loading, handleSaveConfig]);

  // ============================================
  // Agregar/Editar bloque
  // ============================================

  const handleSubmitBlock = () => {
    if (!config) return;

    setFormError(null);

    // Construir bloque temporal
    const tempBlock: TimeBlock = {
      id: formData.id || generateBlockId(),
      startTime: formData.startTime,
      duration: formData.duration,
      label: formData.label || undefined,
      isBreak: formData.isBreak || undefined,
      daysOfWeek: formData.daysOfWeek,
    };

    // Validar bloque
    const validationError = validateTimeBlock(tempBlock);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    // Validar solapamientos
    const overlapError = detectBlockOverlap(
      config.blocks,
      tempBlock,
      formData.id
    );
    if (overlapError) {
      setFormError(overlapError);
      return;
    }

    // Agregar o actualizar
    let updatedConfig: TimeBlockConfiguration;
    if (isEditing && formData.id) {
      updatedConfig = updateBlockInConfig(config, tempBlock);
    } else {
      updatedConfig = addBlockToConfig(config, tempBlock);
    }

    setConfig(updatedConfig);
    resetForm();
    setSuccess(isEditing ? 'Bloque actualizado' : 'Bloque agregado');
    setTimeout(() => setSuccess(null), 2000);
  };

  // ============================================
  // Eliminar bloque
  // ============================================

  const handleDeleteBlock = (blockId: string) => {
    if (!config) return;
    if (!confirm('¿Eliminar este bloque horario?')) return;

    const updatedConfig = removeBlockFromConfig(config, blockId);
    setConfig(updatedConfig);
    setSuccess('Bloque eliminado');
    setTimeout(() => setSuccess(null), 2000);
  };

  // ============================================
  // Editar bloque
  // ============================================

  const handleEditBlock = (block: TimeBlock) => {
    setFormData({
      id: block.id,
      startTime: block.startTime,
      duration: block.duration,
      label: block.label || '',
      isBreak: block.isBreak || false,
      daysOfWeek: block.daysOfWeek,
    });
    setIsEditing(true);
    setFormError(null);
  };

  // ============================================
  // Reset formulario
  // ============================================

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setIsEditing(false);
    setFormError(null);
  };

  // ============================================
  // Obtener bloques según vista activa
  // ============================================

  const getBlocksForCurrentView = (): TimeBlock[] => {
    if (!config) return [];

    if (activeView === 'default') {
      return config.defaultBlocks.sort(
        (a, b) =>
          timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
      );
    } else {
      return config.specialDayBlocks[4] || [];
    }
  };

  // ============================================
  // Utilidades
  // ============================================

  const timeToMinutes = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  // ============================================
  // Renderizado
  // ============================================

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <SidebarV2 />
        <div className={`flex-1 flex items-center justify-center transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="flex items-center gap-3 text-gray-500">
            <IconLoader size={24} className="animate-spin text-magenta-500" />
            <span className="text-sm font-medium">Cargando configuración...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !config) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <SidebarV2 />
        <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <HeaderV2 />
          <main className="p-6">
            <div className="bg-white border border-red-200 rounded-lg p-6">
              <div className="flex items-center text-red-600">
                <IconAlertCircle className="w-5 h-5 mr-2" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const blocksToShow = getBlocksForCurrentView();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="print:hidden"><SidebarV2 /></div>

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="print:hidden"><HeaderV2 title="Configurar Bloques Horarios" isSidebarCollapsed={isSidebarCollapsed} /></div>
        <div className="print:hidden h-16 flex-shrink-0" />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header con selector de año */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-magenta-500 rounded-full">
                  <IconClock size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Configurar Bloques Horarios</h1>
                  <p className="text-sm text-gray-500">Configure bloques de tiempo personalizados</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {saving && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <IconLoader size={14} className="animate-spin" />
                    <span>Guardando...</span>
                  </div>
                )}
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                >
                  {[currentYear, String(Number(currentYear) - 1), String(Number(currentYear) + 1)].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mensajes de estado */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                <IconCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                <IconAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Tabs con información */}
            <div>
              <div className="flex gap-2 border-b border-gray-200">
                <button
                  onClick={() => setActiveView('default')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeView === 'default'
                      ? 'text-magenta-600 bg-magenta-50 border-b-2 border-purple-500'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <IconCalendar size={16} />
                    Lunes - Jueves
                  </span>
                </button>
                <button
                  onClick={() => setActiveView('special')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeView === 'special'
                      ? 'text-magenta-600 bg-magenta-50 border-b-2 border-purple-500'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <IconCalendarTime size={16} />
                    Viernes Especial
                  </span>
                </button>
              </div>

              {/* Nota informativa */}
              <div className="bg-blue-50 border border-blue-200 rounded-b-lg p-3 text-xs text-blue-800">
                <strong>💡 Nota:</strong> Los bloques de {activeView === 'default' ? 'Lunes-Jueves' : 'Viernes'} se muestran solo en las columnas correspondientes del horario.
                Puede configurar horas y duraciones diferentes para cada día.
              </div>
            </div>

            {/* Grid principal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Columna izquierda: Formulario */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 bg-magenta-500 rounded-full">
                    {isEditing ? <IconEdit size={18} className="text-white" /> : <IconPlus size={18} className="text-white" />}
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {isEditing ? 'Editar Bloque' : 'Agregar Nuevo Bloque'}
                  </h2>
                </div>

                {formError && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <IconAlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700">{formError}</p>
                  </div>
                )}

                <div className="space-y-5">
                  {/* Hora de inicio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora de inicio
                    </label>
                    <input
                      type="time"
                      step="600"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">Intervalos de 10 minutos</p>
                  </div>

                  {/* Duración */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duración
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {VALID_DURATIONS.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setFormData({ ...formData, duration: d })}
                          className={`px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                            formData.duration === d
                              ? 'bg-magenta-500 text-white'
                              : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {d}<span className="text-xs ml-0.5">min</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Etiqueta */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Etiqueta <span className="text-gray-400 font-normal text-xs">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.label}
                      onChange={(e) =>
                        setFormData({ ...formData, label: e.target.value })
                      }
                      placeholder="Ej: Bloque 1, Primera Hora"
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  {/* Días de la semana */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Días aplicables
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {DAYS_OF_WEEK.map((day, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            const newDays = formData.daysOfWeek.includes(index)
                              ? formData.daysOfWeek.filter((d) => d !== index)
                              : [...formData.daysOfWeek, index];
                            setFormData({ ...formData, daysOfWeek: newDays });
                          }}
                          className={`px-3 py-2.5 text-xs font-semibold rounded-lg transition-colors ${
                            formData.daysOfWeek.includes(index)
                              ? 'bg-magenta-500 text-white'
                              : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {day.substring(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Es descanso */}
                  <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <input
                      type="checkbox"
                      id="isBreak"
                      checked={formData.isBreak}
                      onChange={(e) =>
                        setFormData({ ...formData, isBreak: e.target.checked })
                      }
                      className="w-4 h-4 text-magenta-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label
                      htmlFor="isBreak"
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      Marcar como descanso (no asignable a clases)
                    </label>
                  </div>

                  {/* Vista previa */}
                  {formData.startTime && (
                    <div className="bg-magenta-50 border border-purple-200 rounded-lg p-4">
                      <p className="text-xs font-medium text-magenta-900 mb-2">
                        Vista previa del bloque
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-gray-900">
                          {blockToHoraString({
                            startTime: formData.startTime,
                          } as TimeBlock)}
                        </span>
                        <span className="text-gray-400">-</span>
                        <span className="text-2xl font-bold text-gray-900">
                          {getBlockEndTime(formData as TimeBlock)}
                        </span>
                        <span className="ml-auto text-xs font-semibold text-magenta-600 bg-white px-2.5 py-1 rounded-full">
                          {formData.duration} min
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Botones */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSubmitBlock}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-magenta-500 text-white px-4 py-3 rounded-lg font-semibold text-sm hover:bg-magenta-600 transition-colors"
                    >
                      {isEditing ? (
                        <>
                          <IconCheck size={18} />
                          Actualizar Bloque
                        </>
                      ) : (
                        <>
                          <IconPlus size={18} />
                          Agregar Bloque
                        </>
                      )}
                    </button>
                    {isEditing && (
                      <button
                        onClick={resetForm}
                        className="px-4 py-3 border border-gray-300 rounded-lg font-semibold text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <IconX size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Columna derecha: Lista de bloques */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-magenta-500 rounded-full">
                      <IconCalendar size={18} className="text-white" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Bloques Configurados
                    </h2>
                  </div>
                  <span className="inline-flex items-center justify-center min-w-[2rem] h-8 bg-magenta-100 text-magenta-700 rounded-full px-2.5 text-sm font-semibold">
                    {blocksToShow.length}
                  </span>
                </div>

                {blocksToShow.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <IconClock className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-600 mb-1">No hay bloques configurados</p>
                    <p className="text-xs text-gray-500">
                      Agregue bloques usando el formulario
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[520px] overflow-y-auto pr-2 custom-scrollbar">
                    {blocksToShow.map((block) => (
                      <div
                        key={block.id}
                        className="group bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:bg-white transition-all"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-base font-bold text-gray-900">
                                {blockToHoraString(block)}
                              </span>
                              <span className="text-gray-400">-</span>
                              <span className="text-base font-bold text-gray-700">
                                {getBlockEndTime(block)}
                              </span>
                              <span className="ml-auto text-xs font-semibold text-magenta-600 bg-magenta-100 px-2 py-0.5 rounded-full">
                                {block.duration}min
                              </span>
                            </div>
                            {block.label && (
                              <p className="text-sm text-gray-600 mb-2 truncate">
                                {block.label}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-1.5">
                              {block.daysOfWeek.map((day) => (
                                <span
                                  key={day}
                                  className="text-xs font-medium bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded"
                                >
                                  {DAYS_OF_WEEK[day].substring(0, 3)}
                                </span>
                              ))}
                              {block.isBreak && (
                                <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                                  Descanso
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditBlock(block)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <IconEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBlock(block.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <IconTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Vista previa semanal */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <IconCalendar size={18} className="text-magenta-500" />
                  Vista Previa Semanal
                </h2>
                <p className="text-sm text-gray-600 mt-1">Visualización completa de todos los bloques configurados</p>
              </div>
              <div className="p-6 overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      {DAYS_OF_WEEK.map((day) => (
                        <th
                          key={day}
                          className="bg-gray-100 border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700"
                        >
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {config &&
                      getAllRowsForWeekPreview(config).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="border border-gray-200 px-3 py-3 align-top bg-white hover:bg-gray-50 transition-colors"
                            >
                              {cell ? (
                                <div className="text-sm">
                                  <div className="font-bold text-gray-900 mb-1">
                                    {blockToHoraString(cell)} - {getBlockEndTime(cell)}
                                  </div>
                                  {cell.label && (
                                    <div className="text-gray-600 mb-1.5 text-xs">
                                      {cell.label}
                                    </div>
                                  )}
                                  <div className="inline-block text-xs font-semibold text-magenta-600 bg-magenta-50 px-2 py-0.5 rounded">
                                    {cell.duration} min
                                  </div>
                                </div>
                              ) : (
                                <div className="text-gray-300 text-center">—</div>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}

// ============================================
// Utilidades para vista previa semanal
// ============================================

function getAllRowsForWeekPreview(
  config: TimeBlockConfiguration
): (TimeBlock | null)[][] {
  const allBlocks = [...config.blocks].sort(
    (a, b) =>
      timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime)
  );

  const uniqueStartTimes = Array.from(
    new Set(allBlocks.map((b) => b.startTime))
  ).sort((a, b) => timeStringToMinutes(a) - timeStringToMinutes(b));

  const rows: (TimeBlock | null)[][] = [];

  uniqueStartTimes.forEach((startTime) => {
    const row: (TimeBlock | null)[] = [];

    for (let day = 0; day < 5; day++) {
      const blockForDayAndTime = allBlocks.find(
        (b) => b.startTime === startTime && b.daysOfWeek.includes(day)
      );
      row.push(blockForDayAndTime || null);
    }

    rows.push(row);
  });

  return rows;
}

function timeStringToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}
