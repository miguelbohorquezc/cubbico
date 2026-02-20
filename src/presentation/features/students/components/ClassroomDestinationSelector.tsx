import React, { useMemo } from 'react';
import { ClassRoom } from '../../../../domain/entities/classRoom';
import { DEFAULT_PROMOTION_MAP } from '../../../../shared/types/studentManagementTypes';

/**
 * Props for ClassroomDestinationSelector component
 */
export interface ClassroomDestinationSelectorProps {
  /** Current classroom name */
  currentClassName: string;
  /** Current classroom ID */
  currentClassroomId: string;
  /** Current level */
  currentLevel: string;
  /** All available classrooms */
  classrooms: ClassRoom[];
  /** Selected destination classroom ID */
  value: string;
  /** Callback when selection changes */
  onChange: (classroomId: string, classroomName: string) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Error message */
  error?: string;
}

/**
 * Get suggested next classroom based on current classroom
 */
const getSuggestedClassroom = (
  currentClassName: string,
  classrooms: ClassRoom[]
): ClassRoom | null => {
  const mapping = DEFAULT_PROMOTION_MAP[currentClassName];

  if (!mapping) return null;

  return classrooms.find(
    (c) => c.nombreSalon.toLowerCase() === mapping.nextClassName.toLowerCase()
  ) || null;
};

/**
 * Group classrooms by level
 */
const groupClassroomsByLevel = (
  classrooms: ClassRoom[]
): Record<string, ClassRoom[]> => {
  return classrooms.reduce((acc, classroom) => {
    const level = classroom.nivel || 'Otro';
    if (!acc[level]) {
      acc[level] = [];
    }
    acc[level].push(classroom);
    return acc;
  }, {} as Record<string, ClassRoom[]>);
};

/**
 * Level order for display
 */
const LEVEL_ORDER = ['preescolar', 'primaria', 'secundaria'];

/**
 * ClassroomDestinationSelector
 *
 * Smart selector that suggests the next classroom in sequence
 * and allows manual override. Groups classrooms by level.
 *
 * @example
 * ```tsx
 * <ClassroomDestinationSelector
 *   currentClassName="Primero"
 *   currentClassroomId="class-1"
 *   currentLevel="Primaria"
 *   classrooms={allClassrooms}
 *   value={selectedClassroomId}
 *   onChange={(id, name) => setDestination(id, name)}
 * />
 * ```
 */
const ClassroomDestinationSelector: React.FC<ClassroomDestinationSelectorProps> = ({
  currentClassName,
  currentClassroomId,
  currentLevel: _currentLevel,
  classrooms,
  value,
  onChange,
  disabled = false,
  error,
}) => {
  // Get suggested classroom
  const suggestedClassroom = useMemo(
    () => getSuggestedClassroom(currentClassName, classrooms),
    [currentClassName, classrooms]
  );

  // Filter out current classroom and group by level
  const availableClassrooms = useMemo(() => {
    const filtered = classrooms.filter((c) => c.id !== currentClassroomId);
    return groupClassroomsByLevel(filtered);
  }, [classrooms, currentClassroomId]);

  // Sort levels for display
  const sortedLevels = useMemo(() => {
    return Object.keys(availableClassrooms).sort((a, b) => {
      const indexA = LEVEL_ORDER.indexOf(a.toLowerCase());
      const indexB = LEVEL_ORDER.indexOf(b.toLowerCase());
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [availableClassrooms]);

  // Get selected classroom details
  const selectedClassroom = classrooms.find((c) => c.id === value);

  // Check if current selection is the suggested one
  const isUsingSuggestion = suggestedClassroom && value === suggestedClassroom.id;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const classroomId = e.target.value;
    const classroom = classrooms.find((c) => c.id === classroomId);
    if (classroom) {
      onChange(classroom.id, classroom.nombreSalon);
    } else {
      onChange('', '');
    }
  };

  const handleUseSuggestion = () => {
    if (suggestedClassroom) {
      onChange(suggestedClassroom.id, suggestedClassroom.nombreSalon);
    }
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="block text-sm font-medium text-deep-blue-800">
        Salón Destino
        <span className="text-error-500 ml-1">*</span>
      </label>

      {/* Suggestion Banner */}
      {suggestedClassroom && !isUsingSuggestion && (
        <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="text-xs text-green-700">
              Sugerencia: <strong>{suggestedClassroom.nombreSalon}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={handleUseSuggestion}
            disabled={disabled}
            className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200 transition-colors disabled:opacity-50"
          >
            Usar
          </button>
        </div>
      )}

      {/* Current Selection Display */}
      {selectedClassroom && (
        <div className="flex items-center gap-2 p-3 bg-medium-blue-50 border border-medium-blue-200 rounded-lg">
          <div className="flex-1">
            <p className="text-sm font-medium text-medium-blue-800">
              {selectedClassroom.nombreSalon}
            </p>
            <p className="text-xs text-medium-blue-600">
              {selectedClassroom.nivel}
              {isUsingSuggestion && (
                <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                  Recomendado
                </span>
              )}
            </p>
          </div>
          <svg className="w-5 h-5 text-medium-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )}

      {/* Select Dropdown */}
      <div className="relative">
        <select
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={`
            w-full px-4 py-3 pr-10 text-sm bg-white border rounded-lg
            appearance-none cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-light-gray-50 disabled:cursor-not-allowed
            ${error
              ? 'border-error-500 focus:border-error-500 focus:ring-error-200'
              : 'border-light-gray-300 focus:border-medium-blue-500 focus:ring-medium-blue-200'
            }
          `}
        >
          <option value="">Seleccionar salón destino...</option>

          {sortedLevels.map((level) => (
            <optgroup key={level} label={level}>
              {availableClassrooms[level].map((classroom) => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.nombreSalon}
                  {suggestedClassroom?.id === classroom.id ? ' (Recomendado)' : ''}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        {/* Dropdown Arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-5 h-5 text-light-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="flex items-center gap-1 text-xs text-error-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {/* Help Text */}
      <p className="text-xs text-light-gray-500">
        Los estudiantes promovidos serán asignados a este salón para el próximo año académico.
      </p>
    </div>
  );
};

export default ClassroomDestinationSelector;
