/**
 * @fileoverview Selector rápido de duración para actividades
 * @module presentation/features/schedule/components/DurationSelector
 */

import React from 'react';
import { VALID_DURATIONS } from '../../../../domain/entities/schedule';
import type { DurationMinutes } from '../../../../domain/entities/schedule';

// ============================================
// Tipos
// ============================================

export interface DurationSelectorProps {
  /** Duración actual seleccionada */
  value: number;
  /** Callback cuando cambia la duración */
  onChange: (duration: number) => void;
  /** Duraciones a mostrar (default: todas las válidas) */
  durations?: readonly number[];
  /** Tamaño de los botones */
  size?: 'sm' | 'md' | 'lg';
  /** Modo de visualización */
  layout?: 'grid' | 'inline';
  /** Deshabilitado */
  disabled?: boolean;
}

// ============================================
// Componente
// ============================================

export const DurationSelector: React.FC<DurationSelectorProps> = ({
  value,
  onChange,
  durations = VALID_DURATIONS,
  size = 'md',
  layout = 'grid',
  disabled = false,
}) => {
  // Estilos según tamaño
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  // Estilos según layout
  const containerClasses =
    layout === 'grid'
      ? 'grid grid-cols-6 sm:grid-cols-8 gap-2'
      : 'flex flex-wrap gap-2';

  return (
    <div className={containerClasses}>
      {durations.map((duration) => {
        const isSelected = value === duration;

        return (
          <button
            key={duration}
            type="button"
            onClick={() => !disabled && onChange(duration)}
            disabled={disabled}
            className={`
              ${sizeClasses[size]}
              rounded-md font-medium transition-all
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${
                isSelected
                  ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `.trim()}
            aria-label={`Duración ${duration} minutos`}
            aria-pressed={isSelected}
          >
            {duration}
          </button>
        );
      })}
    </div>
  );
};

/**
 * Selector compacto con label integrado
 */
export const DurationSelectorWithLabel: React.FC<
  DurationSelectorProps & { label?: string; showCurrentDuration?: boolean }
> = ({ label = 'Duración:', showCurrentDuration = true, value, ...props }) => {
  return (
    <div>
      {/* Label con duración actual */}
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {showCurrentDuration && (
          <span className="text-sm font-bold text-blue-600">{value} min</span>
        )}
      </div>

      {/* Selector */}
      <DurationSelector value={value} {...props} />
    </div>
  );
};

/**
 * Selector de duración común (solo duraciones más usadas)
 */
export const CommonDurationSelector: React.FC<
  Omit<DurationSelectorProps, 'durations'>
> = (props) => {
  const commonDurations = [20, 30, 40, 45, 50, 60];
  return <DurationSelector {...props} durations={commonDurations} />;
};

export default DurationSelector;
