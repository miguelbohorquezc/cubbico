/**
 * @fileoverview Panel de configuración del calendario flexible
 * @module presentation/features/schedule/components/CalendarSettings
 */

import React, { useState, useEffect } from 'react';

// ============================================
// Tipos
// ============================================

export interface CalendarSettingsProps {
  /** Callback cuando cambia la configuración */
  onChange?: (settings: CalendarSettingsData) => void;
  /** Mostrar como modal o panel */
  mode?: 'modal' | 'panel';
  /** Callback al cerrar (solo para modo modal) */
  onClose?: () => void;
}

export interface CalendarSettingsData {
  /** Snap en minutos (5 o 10) */
  snapMinutes: 5 | 10;
  /** Pixels por minuto */
  pixelsPerMinute: number;
  /** Mostrar línea "now" */
  showNowLine: boolean;
  /** Mostrar solapamientos */
  showOverlaps: boolean;
}

// ============================================
// Constantes
// ============================================

const STORAGE_KEY = 'cubbico-calendar-settings';

const DEFAULT_SETTINGS: CalendarSettingsData = {
  snapMinutes: 5,
  pixelsPerMinute: 2,
  showNowLine: true,
  showOverlaps: true,
};

// ============================================
// Utilidades
// ============================================

/**
 * Carga la configuración desde localStorage
 */
function loadSettings(): CalendarSettingsData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error al cargar configuración:', error);
  }
  return DEFAULT_SETTINGS;
}

/**
 * Guarda la configuración en localStorage
 */
function saveSettings(settings: CalendarSettingsData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error al guardar configuración:', error);
  }
}

// ============================================
// Componente
// ============================================

export const CalendarSettings: React.FC<CalendarSettingsProps> = ({
  onChange,
  mode = 'panel',
  onClose,
}) => {
  const [settings, setSettings] = useState<CalendarSettingsData>(loadSettings);

  // Guardar y notificar cuando cambia la configuración
  useEffect(() => {
    saveSettings(settings);
    if (onChange) {
      onChange(settings);
    }
  }, [settings, onChange]);

  const handleSnapChange = (snap: 5 | 10) => {
    setSettings((prev) => ({ ...prev, snapMinutes: snap }));
  };

  const handleToggle = (key: keyof CalendarSettingsData) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  const content = (
    <div className="space-y-6">
      {/* Título */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Configuración del Calendario</h3>
        {mode === 'modal' && onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Snap de movimiento */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Snap de movimiento
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Controla el "salto" al mover actividades con drag & drop
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => handleSnapChange(5)}
            className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
              settings.snapMinutes === 5
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <div className="font-semibold">5 minutos</div>
            <div className="text-xs opacity-75">Más preciso</div>
          </button>
          <button
            onClick={() => handleSnapChange(10)}
            className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
              settings.snapMinutes === 10
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <div className="font-semibold">10 minutos</div>
            <div className="text-xs opacity-75">Más rápido</div>
          </button>
        </div>
      </div>

      {/* Opciones de visualización */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Visualización
        </label>
        <div className="space-y-3">
          {/* Línea Now */}
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <div>
              <div className="font-medium text-gray-800">Línea de hora actual</div>
              <div className="text-xs text-gray-500">
                Muestra una línea roja indicando la hora actual
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.showNowLine}
              onChange={() => handleToggle('showNowLine')}
              className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>

          {/* Solapamientos */}
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <div>
              <div className="font-medium text-gray-800">Highlight de solapamientos</div>
              <div className="text-xs text-gray-500">
                Resalta actividades que se solapan en tiempo
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.showOverlaps}
              onChange={() => handleToggle('showOverlaps')}
              className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <span className="text-blue-500 text-lg">💡</span>
          <div className="text-xs text-blue-800">
            <strong>Tip:</strong> Un snap más pequeño (5 min) permite mayor precisión al colocar
            actividades, mientras que un snap mayor (10 min) facilita el alineamiento rápido.
          </div>
        </div>
      </div>
    </div>
  );

  // Modo modal
  if (mode === 'modal') {
    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40 backdrop-blur-sm" />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            {content}
          </div>
        </div>
      </>
    );
  }

  // Modo panel
  return <div className="bg-white rounded-lg border border-gray-200 p-4">{content}</div>;
};

/**
 * Hook para usar la configuración del calendario
 */
export const useCalendarSettings = (): [
  CalendarSettingsData,
  (settings: Partial<CalendarSettingsData>) => void
] => {
  const [settings, setSettings] = useState<CalendarSettingsData>(loadSettings);

  const updateSettings = (newSettings: Partial<CalendarSettingsData>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  };

  return [settings, updateSettings];
};

export default CalendarSettings;
