/**
 * @fileoverview Entidades del sistema de bloques horarios personalizables
 * @module domain/entities/timeBlock
 */

// ============================================
// Tipos y Entidades
// ============================================

/**
 * Representa un bloque horario configurable con hora de inicio y duración
 */
export interface TimeBlock {
  id: string;              // UUID único
  startTime: string;       // Formato HH:mm (ej: "08:10")
  duration: number;        // Duración en minutos: 40, 45, 50, 60
  label?: string;          // Etiqueta descriptiva opcional (ej: "Bloque 1")
  isBreak?: boolean;       // Si es un descanso (no asignable)
  daysOfWeek: number[];    // [0,1,2,3,4] = L-V, [4] = solo viernes
}

/**
 * Configuración completa de bloques horarios para un año académico
 */
export interface TimeBlockConfiguration {
  year: string;                                  // Año académico
  blocks: TimeBlock[];                           // Todos los bloques definidos
  defaultBlocks: TimeBlock[];                    // Bloques aplicables L-J
  specialDayBlocks: Record<number, TimeBlock[]>; // Bloques especiales por día (ej: {4: [...]} para viernes)
  createdAt: string;                            // ISO timestamp
  updatedAt: string;                            // ISO timestamp
}

/**
 * Duraciones válidas para bloques horarios (en minutos)
 * Extendido para soportar calendario flexible con duraciones desde 10 min hasta 120 min.
 * Incluye duraciones comunes para preescolar (10, 15, 20 min) y clases extendidas (100, 120 min).
 */
export const VALID_DURATIONS = [
  10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 100, 120
] as const;
export type ValidDuration = typeof VALID_DURATIONS[number];

// ============================================
// Funciones de Dominio
// ============================================

/**
 * Convierte un TimeBlock a string hora compatible con ScheduleSlot.hora
 * @param block - Bloque horario
 * @returns String hora en formato "H:mm" o "HH:mm"
 * @example blockToHoraString({startTime: "08:10", ...}) → "8:10"
 */
export function blockToHoraString(block: TimeBlock): string {
  const [hours, minutes] = block.startTime.split(':');
  const hoursNum = parseInt(hours, 10);
  return `${hoursNum}:${minutes}`;
}

/**
 * Calcula la hora de finalización de un bloque
 * @param block - Bloque horario
 * @returns String hora de fin en formato HH:mm
 * @example getBlockEndTime({startTime: "08:10", duration: 45, ...}) → "08:55"
 */
export function getBlockEndTime(block: TimeBlock): string {
  const [hours, minutes] = block.startTime.split(':').map(Number);
  const startMinutes = hours * 60 + minutes;
  const endMinutes = startMinutes + block.duration;

  const endHours = Math.floor(endMinutes / 60);
  const endMins = endMinutes % 60;

  return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
}

/**
 * Convierte minutos totales desde medianoche a formato HH:mm
 * @param minutes - Minutos totales desde medianoche
 * @returns String en formato HH:mm
 */
function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Convierte string HH:mm a minutos desde medianoche
 * @param timeString - String en formato HH:mm
 * @returns Minutos desde medianoche
 */
function timeStringToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Detecta si dos bloques se solapan en tiempo
 * @param blockA - Primer bloque
 * @param blockB - Segundo bloque
 * @returns true si hay solapamiento
 */
function blocksOverlap(blockA: TimeBlock, blockB: TimeBlock): boolean {
  const startA = timeStringToMinutes(blockA.startTime);
  const endA = startA + blockA.duration;

  const startB = timeStringToMinutes(blockB.startTime);
  const endB = startB + blockB.duration;

  // Hay solapamiento si:
  // - A empieza antes de que termine B Y
  // - B empieza antes de que termine A
  return startA < endB && startB < endA;
}

/**
 * Detecta si hay días en común entre dos bloques
 * @param blockA - Primer bloque
 * @param blockB - Segundo bloque
 * @returns true si comparten al menos un día
 */
function blocksShareDays(blockA: TimeBlock, blockB: TimeBlock): boolean {
  return blockA.daysOfWeek.some(day => blockB.daysOfWeek.includes(day));
}

/**
 * Detecta conflictos de solapamiento de un bloque contra una lista existente
 * @param existingBlocks - Lista de bloques existentes
 * @param newBlock - Nuevo bloque a validar
 * @param excludeId - ID a excluir de la validación (para edición)
 * @returns Mensaje de error si hay conflicto, null si es válido
 */
export function detectBlockOverlap(
  existingBlocks: TimeBlock[],
  newBlock: TimeBlock,
  excludeId?: string
): string | null {
  // Filtrar bloques que no son el que estamos editando
  const blocksToCheck = existingBlocks.filter(b => b.id !== excludeId);

  for (const existing of blocksToCheck) {
    // Solo verificar si comparten días
    if (!blocksShareDays(existing, newBlock)) {
      continue;
    }

    // Verificar solapamiento temporal
    if (blocksOverlap(existing, newBlock)) {
      const daysStr = newBlock.daysOfWeek
        .filter(d => existing.daysOfWeek.includes(d))
        .map(d => ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'][d])
        .join(', ');

      return `Conflicto: se solapa con "${existing.label || existing.startTime}" en ${daysStr}`;
    }
  }

  return null;
}

/**
 * Valida el formato de un string de hora HH:mm
 * @param timeString - String a validar
 * @returns true si es válido
 */
export function isValidTimeFormat(timeString: string): boolean {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
}

/**
 * Valida que la duración sea una de las permitidas
 * @param duration - Duración en minutos
 * @returns true si es válida
 */
export function isValidDuration(duration: number): boolean {
  return VALID_DURATIONS.includes(duration as ValidDuration);
}

/**
 * Valida un bloque horario completo
 * @param block - Bloque a validar
 * @returns Mensaje de error si es inválido, null si es válido
 */
export function validateTimeBlock(block: TimeBlock): string | null {
  // 1. Formato de hora válido
  if (!isValidTimeFormat(block.startTime)) {
    return 'Formato de hora inválido. Use HH:mm (ej: 08:10)';
  }

  // 2. Duración válida
  if (!isValidDuration(block.duration)) {
    return `Duración debe ser una de: ${VALID_DURATIONS.join(', ')} minutos`;
  }

  // 3. Al menos un día seleccionado
  if (!block.daysOfWeek || block.daysOfWeek.length === 0) {
    return 'Debe seleccionar al menos un día de la semana';
  }

  // 4. Días válidos (0-4)
  if (block.daysOfWeek.some(d => d < 0 || d > 4)) {
    return 'Días inválidos. Deben estar entre 0 (Lunes) y 4 (Viernes)';
  }

  return null;
}

/**
 * Genera bloques por defecto desde TIME_SLOTS legacy
 * Útil para migración inicial
 * @param timeSlotsLegacy - Array de strings hora del sistema anterior
 * @param defaultDuration - Duración por defecto (45 minutos)
 * @returns Array de TimeBlocks
 */
export function generateDefaultBlocksFromLegacy(
  timeSlotsLegacy: readonly string[],
  defaultDuration: ValidDuration = 45
): TimeBlock[] {
  return timeSlotsLegacy.map((slot, index) => {
    // Normalizar formato a HH:mm
    const [hours, minutes] = slot.split(':');
    const startTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;

    return {
      id: `legacy-${index}`,
      startTime,
      duration: defaultDuration,
      label: `Bloque ${index + 1}`,
      daysOfWeek: [0, 1, 2, 3, 4], // Lunes a Viernes
    };
  });
}

/**
 * Busca un bloque por su string hora
 * @param blocks - Lista de bloques
 * @param horaString - String hora (ej: "8:10")
 * @returns TimeBlock encontrado o null
 */
export function findBlockByHora(
  blocks: TimeBlock[],
  horaString: string
): TimeBlock | null {
  return blocks.find(block => blockToHoraString(block) === horaString) || null;
}

/**
 * Obtiene los bloques aplicables para un día específico
 * @param config - Configuración de bloques
 * @param dayOfWeek - Día (0-4)
 * @returns Array de bloques ordenados por hora
 */
export function getBlocksForDay(
  config: TimeBlockConfiguration,
  dayOfWeek: number
): TimeBlock[] {
  // Si hay bloques especiales para este día, usar esos
  if (config.specialDayBlocks[dayOfWeek]) {
    return [...config.specialDayBlocks[dayOfWeek]].sort(
      (a, b) => timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime)
    );
  }

  // Si no, filtrar bloques por defecto que incluyan este día
  return config.defaultBlocks
    .filter(block => block.daysOfWeek.includes(dayOfWeek))
    .sort((a, b) => timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime));
}

/**
 * Obtiene todos los bloques únicos (sin repetir por día)
 * @param config - Configuración de bloques
 * @returns Array de bloques únicos
 */
export function getAllUniqueBlocks(config: TimeBlockConfiguration): TimeBlock[] {
  const uniqueMap = new Map<string, TimeBlock>();

  config.blocks.forEach(block => {
    uniqueMap.set(block.id, block);
  });

  return Array.from(uniqueMap.values()).sort(
    (a, b) => timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime)
  );
}

/**
 * Genera un ID único para un nuevo bloque
 * @returns String UUID simple
 */
export function generateBlockId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
