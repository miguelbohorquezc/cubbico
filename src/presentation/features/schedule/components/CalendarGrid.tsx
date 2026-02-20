/**
 * @fileoverview Componente de grilla visual del calendario semanal flexible
 * @module presentation/features/schedule/components/CalendarGrid
 */

import React from 'react';
import { DAYS_OF_WEEK } from '../../../../domain/entities/schedule';

// ============================================
// Tipos
// ============================================

export interface CalendarGridProps {
  /** Hora de inicio (formato HH:mm, default: "07:00") */
  startTime?: string;
  /** Hora de fin (formato HH:mm, default: "15:00") */
  endTime?: string;
  /** Intervalo en minutos para líneas principales (default: 60) */
  majorLineInterval?: number;
  /** Intervalo en minutos para líneas secundarias (default: 5) */
  minorLineInterval?: number;
  /** Pixels por minuto (default: 2) */
  pixelsPerMinute?: number;
  /** Children: actividades y otros elementos */
  children?: React.ReactNode;
  /** Callback al hacer click en una celda vacía */
  onCellClick?: (dayOfWeek: number, timeMinutes: number) => void;
  /** Callback al hacer click en una hora específica */
  onHourClick?: (hour: string) => void;
}

// ============================================
// Utilidades
// ============================================

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

// ============================================
// Componente
// ============================================

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  startTime = '07:00',
  endTime = '15:00',
  majorLineInterval = 60,
  minorLineInterval = 5,
  pixelsPerMinute = 2,
  children,
  onCellClick: _onCellClick,
  onHourClick,
}) => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const totalMinutes = endMinutes - startMinutes;
  const totalHeight = totalMinutes * pixelsPerMinute;

  // Generar líneas horarias
  const timeLines: Array<{ minutes: number; label: string; isMajor: boolean }> = [];

  for (let min = startMinutes; min <= endMinutes; min += minorLineInterval) {
    const isMajor = (min - startMinutes) % majorLineInterval === 0;
    timeLines.push({
      minutes: min,
      label: minutesToTime(min),
      isMajor,
    });
  }

  return (
    <div className="flex flex-col bg-white border border-gray-100 overflow-hidden h-full">
      {/* Header: Días de la semana */}
      <div className="flex border-b border-gray-100 bg-gray-50 sticky top-0 z-10">
        {/* Columna de horas */}
        <div className="w-16 flex-shrink-0 border-r border-gray-100 bg-white font-medium text-xs text-gray-500 flex items-center justify-center">
          Hora
        </div>

        {/* Columnas de días */}
        <div className="flex flex-1">
          {DAYS_OF_WEEK.map((day, index) => (
            <div
              key={index}
              className="flex-1 py-2 text-center font-medium text-sm text-gray-600 border-r border-gray-100 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Contenedor con scroll - para ver todas las horas */}
      <div className="flex overflow-y-auto overflow-x-hidden relative flex-1 min-h-0">
        {/* Columna de labels de tiempo */}
        <div className="w-16 flex-shrink-0 border-r border-gray-100 bg-white relative">
          {timeLines
            .filter((line) => line.isMajor)
            .map((line) => {
              const top = (line.minutes - startMinutes) * pixelsPerMinute;
              return (
                <div
                  key={line.minutes}
                  className={`absolute text-xs text-gray-500 -translate-y-2 px-1 font-medium ${
                    onHourClick ? 'cursor-pointer hover:text-orchid-blue-600 hover:font-semibold transition-all' : ''
                  }`}
                  style={{ top: `${top}px` }}
                  onClick={onHourClick ? () => onHourClick(line.label) : undefined}
                  title={onHourClick ? `Click para ver clases a las ${line.label}` : undefined}
                >
                  {line.label}
                </div>
              );
            })}
        </div>

        {/* Grid de días con estructura flex idéntica al header */}
        <div className="flex flex-1 relative" style={{ height: `${totalHeight}px` }}>
          {/* Líneas horizontales de fondo */}
          <div className="absolute inset-0 pointer-events-none z-0">
            {timeLines.map((line) => {
              const top = (line.minutes - startMinutes) * pixelsPerMinute;
              return (
                <div
                  key={line.minutes}
                  className={`absolute left-0 right-0 ${
                    line.isMajor ? 'border-t border-gray-200' : 'border-t border-gray-50'
                  }`}
                  style={{ top: `${top}px` }}
                />
              );
            })}
          </div>

          {/* Contenedor de columnas con la misma estructura que el header */}
          <div className="absolute inset-0 z-10 flex pointer-events-none">
            {DAYS_OF_WEEK.map((_, index) => (
              <div
                key={index}
                className={`flex-1 relative ${index < DAYS_OF_WEEK.length - 1 ? 'border-r border-gray-100' : ''}`}
              >
                {/* Solo estructura visual - sin eventos */}
              </div>
            ))}
          </div>

          {/* Children: actividades y área clickeable */}
          <div className="absolute inset-0 z-20">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default CalendarGrid;
