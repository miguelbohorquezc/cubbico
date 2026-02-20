import React from 'react';
import {
  StudentPromotionData,
  PromotionStatus,
  EvaluationMode,
  PROMOTION_STATUS_COLORS,
  EVALUATION_MODE_COLORS,
} from '../../../../shared/types/studentManagementTypes';

/**
 * Props for StudentPromotionRow component
 */
export interface StudentPromotionRowProps {
  /** Student promotion data */
  student: StudentPromotionData;
  /** Callback when status changes */
  onStatusChange: (studentId: string, status: PromotionStatus) => void;
  /** Callback when evaluation mode changes */
  onEvaluationModeChange: (studentId: string, mode: EvaluationMode) => void;
  /** Callback when selection changes */
  onSelectionChange: (studentId: string, selected: boolean) => void;
  /** Whether the row is disabled */
  disabled?: boolean;
}

/**
 * Status options for dropdown
 */
const STATUS_OPTIONS: { value: PromotionStatus; label: string }[] = [
  { value: 'promover', label: 'Promover' },
  { value: 'no_promover', label: 'No Promover' },
  { value: 'retirado', label: 'Retirado' },
];

/**
 * Evaluation mode options for dropdown
 */
const EVALUATION_OPTIONS: { value: EvaluationMode; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'ajustes', label: 'Con Ajustes' },
];

/**
 * StudentPromotionRow
 *
 * Individual row component for displaying and editing a student's
 * promotion status and evaluation mode.
 *
 * @example
 * ```tsx
 * <StudentPromotionRow
 *   student={studentData}
 *   onStatusChange={(id, status) => handleStatusChange(id, status)}
 *   onEvaluationModeChange={(id, mode) => handleModeChange(id, mode)}
 *   onSelectionChange={(id, selected) => handleSelection(id, selected)}
 * />
 * ```
 */
const StudentPromotionRow: React.FC<StudentPromotionRowProps> = ({
  student,
  onStatusChange,
  onEvaluationModeChange,
  onSelectionChange,
  disabled = false,
}) => {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelectionChange(student.id, e.target.checked);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onStatusChange(student.id, e.target.value as PromotionStatus);
  };

  const handleEvaluationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onEvaluationModeChange(student.id, e.target.value as EvaluationMode);
  };

  // Determine row background based on status
  const getRowBackground = () => {
    if (disabled) return 'bg-light-gray-50';
    switch (student.promotionStatus) {
      case 'retirado':
        return 'bg-red-50/50';
      case 'no_promover':
        return 'bg-yellow-50/50';
      case 'nuevo':
        return 'bg-blue-50/50';
      default:
        return 'bg-white';
    }
  };

  return (
    <div
      className={`
        flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border
        transition-all duration-200
        ${getRowBackground()}
        ${student.isSelected ? 'border-medium-blue-400 ring-1 ring-medium-blue-200' : 'border-light-gray-200'}
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-light-gray-300'}
      `}
    >
      {/* Checkbox */}
      <div className="flex items-center gap-3 sm:w-auto">
        <input
          type="checkbox"
          checked={student.isSelected}
          onChange={handleCheckboxChange}
          disabled={disabled}
          className="
            w-4 h-4 rounded border-light-gray-300
            text-medium-blue-600
            focus:ring-medium-blue-500 focus:ring-offset-0
            disabled:opacity-50
          "
          aria-label={`Seleccionar ${student.name} ${student.lastName}`}
        />

        {/* Student Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-deep-blue-800 truncate">
            {student.name} {student.lastName}
          </p>
          <p className="text-xs text-light-gray-500">
            {student.document}: {student.id}
          </p>
        </div>
      </div>

      {/* Current Classroom Badge */}
      <div className="hidden sm:block">
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-light-gray-100 text-light-gray-700 border border-light-gray-200">
          {student.className}
        </span>
      </div>

      {/* Destination (for promoted students) */}
      {student.promotionStatus === 'promover' && student.destinationClassName && (
        <div className="hidden md:flex items-center gap-1 text-xs text-light-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          <span className="font-medium text-green-700">{student.destinationClassName}</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
        {/* Status Select */}
        <div className="relative">
          <select
            value={student.promotionStatus}
            onChange={handleStatusChange}
            disabled={disabled}
            className={`
              appearance-none pl-3 pr-8 py-1.5 text-xs font-medium rounded-md border
              focus:outline-none focus:ring-2 focus:ring-offset-0
              disabled:opacity-50 disabled:cursor-not-allowed
              ${PROMOTION_STATUS_COLORS[student.promotionStatus]}
              focus:ring-medium-blue-300
            `}
            aria-label="Estado de promoción"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="w-3 h-3 text-current opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Evaluation Mode Select */}
        <div className="relative">
          <select
            value={student.nextYearEvaluationMode}
            onChange={handleEvaluationChange}
            disabled={disabled || student.promotionStatus === 'retirado'}
            className={`
              appearance-none pl-3 pr-8 py-1.5 text-xs font-medium rounded-md border
              focus:outline-none focus:ring-2 focus:ring-offset-0
              disabled:opacity-50 disabled:cursor-not-allowed
              ${EVALUATION_MODE_COLORS[student.nextYearEvaluationMode]}
              focus:ring-medium-blue-300
            `}
            aria-label="Modo de evaluación"
          >
            {EVALUATION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="w-3 h-3 text-current opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Mobile: Show classroom */}
      <div className="sm:hidden flex items-center justify-between text-xs text-light-gray-500 pt-2 border-t border-light-gray-100">
        <span>Salón actual: <span className="font-medium">{student.className}</span></span>
        {student.promotionStatus === 'promover' && student.destinationClassName && (
          <span className="text-green-700">
            → {student.destinationClassName}
          </span>
        )}
      </div>
    </div>
  );
};

export default StudentPromotionRow;
