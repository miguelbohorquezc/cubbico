/**
 * @fileoverview Componente de línea indicadora de hora actual en el calendario
 * @module presentation/features/schedule/components/NowLine
 */

import React, { useState, useEffect } from 'react';
import { timeToMinutes } from '../../../../domain/entities/schedule';

// ============================================
// Tipos
// ============================================

export interface NowLineProps {
  /** Minuto de inicio del calendario visible (default: 07:00 = 420 min) */
  startMinute?: number;
  /** Minuto de fin del calendario visible (default: 15:00 = 900 min) */
  endMinute?: number;
  /** Pixels por minuto (debe coincidir con CalendarGrid) */
  pixelsPerMinute?: number;
  /** Día de la semana actual (0-4 para Lun-Vie) */
  currentDayOfWeek: number;
  /** Día que se está mostrando en esta columna */
  displayedDayOfWeek: number;
  /** Intervalo de actualización en milisegundos (default: 30000 = 30 seg) */
  updateInterval?: number;
}

// ============================================
// Componente
// ============================================

export const NowLine: React.FC<NowLineProps> = ({
  startMinute = 420, // 07:00
  endMinute = 900, // 15:00
  pixelsPerMinute = 2,
  currentDayOfWeek,
  displayedDayOfWeek,
  updateInterval = 30000,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Actualizar hora actual cada X segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, updateInterval);

    // Cleanup: limpiar intervalo al desmontar
    return () => clearInterval(interval);
  }, [updateInterval]);

  // Si no es el día actual, no mostrar la línea
  if (currentDayOfWeek !== displayedDayOfWeek) {
    return null;
  }

  // Calcular minutos desde medianoche
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const currentMinutes = hours * 60 + minutes;

  // Si la hora actual está fuera del rango visible, no mostrar
  if (currentMinutes < startMinute || currentMinutes > endMinute) {
    return null;
  }

  // Calcular posición vertical en pixels
  const minutesFromStart = currentMinutes - startMinute;
  const topPosition = minutesFromStart * pixelsPerMinute;

  // Formatear hora para mostrar
  const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  return (
    <div
      className="absolute left-0 right-0 z-20 pointer-events-none"
      style={{ top: `${topPosition}px` }}
    >
      {/* Línea roja */}
      <div className="relative">
        <div className="h-0.5 bg-red-500 shadow-md" />

        {/* Etiqueta con hora */}
        <div className="absolute -top-3 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded shadow-lg font-semibold">
          {timeString}
        </div>

        {/* Círculo indicador en el extremo izquierdo */}
        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-md" />
      </div>
    </div>
  );
};

/**
 * Hook personalizado para obtener el día actual de la semana (0-4 para Lun-Vie).
 * Retorna -1 si es fin de semana.
 */
export const useCurrentDayOfWeek = (): number => {
  const [dayOfWeek, setDayOfWeek] = useState(() => {
    const day = new Date().getDay();
    // Convertir: Domingo=0 → -1, Lunes=1 → 0, ..., Viernes=5 → 4, Sábado=6 → -1
    if (day === 0 || day === 6) return -1;
    return day - 1;
  });

  useEffect(() => {
    // Actualizar al cambiar de día (verificar a medianoche)
    const checkDayChange = () => {
      const day = new Date().getDay();
      const newDayOfWeek = day === 0 || day === 6 ? -1 : day - 1;
      setDayOfWeek(newDayOfWeek);
    };

    // Verificar cada minuto si cambió el día
    const interval = setInterval(checkDayChange, 60000);

    return () => clearInterval(interval);
  }, []);

  return dayOfWeek;
};

export default NowLine;
