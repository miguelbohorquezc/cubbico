import React, { useState } from 'react';
import { Button } from '../../../components/ui';
import { usePromotion } from '../hooks/usePromotion';
import StudentPromotionRow from './StudentPromotionRow';
import PromotionSummary from './PromotionSummary';
import {
  PromotionModalProps,
  PromotionFilters,
} from '../../../../shared/types/studentManagementTypes';

/**
 * Filter button component
 */
interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}

const FilterButton: React.FC<FilterButtonProps> = ({ active, onClick, children, count }) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      px-3 py-1.5 text-xs font-medium rounded-md transition-colors
      ${active
        ? 'bg-medium-blue-600 text-white'
        : 'bg-light-gray-100 text-light-gray-600 hover:bg-light-gray-200'
      }
    `}
  >
    {children}
    {count !== undefined && (
      <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${active ? 'bg-white/20' : 'bg-light-gray-200'}`}>
        {count}
      </span>
    )}
  </button>
);

/**
 * PromotionModal
 *
 * Main modal for managing student promotions. Includes:
 * - List of students with status and evaluation mode controls
 * - Filters and search
 * - Bulk actions
 * - Summary before confirmation
 *
 * @example
 * ```tsx
 * <PromotionModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   config={{
 *     sourceClassroomId: 'classroom-1',
 *     sourceClassName: 'Primero',
 *     sourceLevel: 'Primaria',
 *     currentYear: '2025',
 *     targetYear: '2026'
 *   }}
 *   onPromotionComplete={(result) => handleComplete(result)}
 * />
 * ```
 */
const PromotionModal: React.FC<PromotionModalProps> = ({
  isOpen,
  onClose,
  config,
  onPromotionComplete,
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const {
    students,
    isLoading,
    isExecuting,
    filters,
    filteredStudents,
    summary,
    classrooms,
    destinationClassroomId,
    destinationClassName,
    validationIssues,
    isValid,
    setStudentStatus,
    setStudentEvaluationMode,
    toggleStudentSelection,
    selectAll,
    deselectAll,
    setSelectedStudentsStatus,
    setSelectedStudentsEvaluationMode,
    setDestination,
    setFilters,
    executePromotion,
  } = usePromotion({
    sourceClassroomId: config.sourceClassroomId,
    sourceClassName: config.sourceClassName,
    sourceLevel: config.sourceLevel,
    currentYear: config.currentYear,
    onComplete: (result) => {
      onPromotionComplete(result);
      if (result.success) {
        onClose();
      }
    },
    onError: (error) => {
      console.error('Promotion error:', error);
    },
  });

  const selectedCount = students.filter((s) => s.isSelected).length;

  const handleExecute = async () => {
    if (!isValid) return;
    const result = await executePromotion();
    if (result.success) {
      setShowConfirmation(false);
    }
  };

  const handleFilterChange = (key: keyof PromotionFilters, value: string) => {
    setFilters({ [key]: value });
  };

  // Get available destination classrooms (next level)
  const destinationOptions = classrooms.filter((c) => {
    // Simple filter - could be improved with level mapping
    return c.id !== config.sourceClassroomId;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute inset-4 sm:inset-6 lg:inset-10 bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light-gray-200 bg-gray-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-90">
              Promoción de Estudiantes
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 text-xs font-medium bg-orchid-blue-10 text-orchid-blue-70 rounded border border-orchid-blue-30">
                {config.sourceClassName}
              </span>
              <svg className="w-4 h-4 text-gray-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="px-2 py-0.5 text-xs font-medium bg-tosca-ds/10 text-tosca-cc rounded border border-tosca-ds/30">
                Año {config.targetYear}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-60 hover:text-gray-90 hover:bg-gray-20 rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-light-gray-200 space-y-3">
          {/* Search and Destination */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por nombre o documento..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-light-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medium-blue-300 focus:border-medium-blue-500"
              />
            </div>

            {/* Destination Selector */}
            <div className="sm:w-64">
              <select
                value={destinationClassroomId}
                onChange={(e) => {
                  const classroom = classrooms.find((c) => c.id === e.target.value);
                  if (classroom) {
                    setDestination(classroom.id, classroom.nombreSalon);
                  }
                }}
                className="w-full px-3 py-2 text-sm border border-light-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medium-blue-300 focus:border-medium-blue-500"
              >
                <option value="">Seleccionar destino</option>
                {destinationOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombreSalon} ({c.nivel})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-light-gray-500 mr-1">Filtrar:</span>
            <FilterButton
              active={filters.status === 'all'}
              onClick={() => handleFilterChange('status', 'all')}
              count={students.length}
            >
              Todos
            </FilterButton>
            <FilterButton
              active={filters.status === 'promover'}
              onClick={() => handleFilterChange('status', 'promover')}
              count={summary.toPromote}
            >
              Promover
            </FilterButton>
            <FilterButton
              active={filters.status === 'no_promover'}
              onClick={() => handleFilterChange('status', 'no_promover')}
              count={summary.toRetain}
            >
              No Promover
            </FilterButton>
            <FilterButton
              active={filters.status === 'retirado'}
              onClick={() => handleFilterChange('status', 'retirado')}
              count={summary.withdrawn}
            >
              Retirados
            </FilterButton>

            <div className="w-px h-4 bg-light-gray-300 mx-1" />

            <FilterButton
              active={filters.evaluationMode === 'ajustes'}
              onClick={() => handleFilterChange('evaluationMode', filters.evaluationMode === 'ajustes' ? 'all' : 'ajustes')}
              count={summary.adjustedEvaluation}
            >
              Con Ajustes
            </FilterButton>
          </div>

          {/* Bulk Actions */}
          {selectedCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-light-gray-100">
              <span className="text-xs text-medium-blue-600 font-medium">
                {selectedCount} seleccionado(s):
              </span>
              <button
                onClick={() => setSelectedStudentsStatus('promover')}
                className="px-2 py-1 text-xs bg-tosca-ds/10 text-tosca-cc rounded hover:bg-tosca-ds/20 transition-colors"
              >
                Promover
              </button>
              <button
                onClick={() => setSelectedStudentsStatus('no_promover')}
                className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
              >
                No Promover
              </button>
              <button
                onClick={() => setSelectedStudentsStatus('retirado')}
                className="px-2 py-1 text-xs bg-peach-ds/10 text-peach-cc rounded hover:bg-peach-ds/20 transition-colors"
              >
                Retirado
              </button>
              <div className="w-px h-4 bg-light-gray-300 mx-1" />
              <button
                onClick={() => setSelectedStudentsEvaluationMode('normal')}
                className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors"
              >
                Eval. Normal
              </button>
              <button
                onClick={() => setSelectedStudentsEvaluationMode('ajustes')}
                className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors"
              >
                Con Ajustes
              </button>
              <div className="w-px h-4 bg-light-gray-300 mx-1" />
              <button
                onClick={deselectAll}
                className="px-2 py-1 text-xs text-light-gray-600 hover:text-light-gray-800 transition-colors"
              >
                Deseleccionar
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Student List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="flex items-center gap-2 text-light-gray-500">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Cargando estudiantes...</span>
                </div>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-light-gray-500">
                <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm">No hay estudiantes que coincidan</p>
              </div>
            ) : (
              <>
                {/* Select All Header */}
                <div className="flex items-center gap-2 px-3 py-2 bg-light-gray-50 rounded-lg mb-2">
                  <input
                    type="checkbox"
                    checked={selectedCount === students.length && students.length > 0}
                    onChange={(e) => e.target.checked ? selectAll() : deselectAll()}
                    className="w-4 h-4 rounded border-light-gray-300 text-medium-blue-600 focus:ring-medium-blue-500"
                  />
                  <span className="text-xs text-light-gray-600">
                    Seleccionar todos ({filteredStudents.length})
                  </span>
                </div>

                {/* Student Rows */}
                {filteredStudents.map((student) => (
                  <StudentPromotionRow
                    key={student.id}
                    student={student}
                    onStatusChange={setStudentStatus}
                    onEvaluationModeChange={setStudentEvaluationMode}
                    onSelectionChange={toggleStudentSelection}
                    disabled={isExecuting}
                  />
                ))}
              </>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-light-gray-200 bg-gray-5 p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-deep-blue-800 mb-4">Resumen</h3>
            <PromotionSummary
              summary={summary}
              sourceClassName={config.sourceClassName}
              destinationClassName={destinationClassName}
              validationIssues={validationIssues}
              isExecuting={isExecuting}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-light-gray-200 bg-gray-5">
          <p className="text-xs text-light-gray-500">
            {summary.toPromote} estudiante(s) serán promovidos a {destinationClassName || 'destino no seleccionado'}
          </p>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose} disabled={isExecuting}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowConfirmation(true)}
              disabled={isExecuting || !isValid || !destinationClassroomId}
              loading={isExecuting}
            >
              {isExecuting ? 'Ejecutando...' : 'Confirmar Promoción'}
            </Button>
          </div>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmation && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-deep-blue-800 mb-2">
                Confirmar Promoción
              </h3>
              <p className="text-sm text-light-gray-600 mb-4">
                Esta acción promoverá <strong>{summary.toPromote}</strong> estudiantes de{' '}
                <strong>{config.sourceClassName}</strong> a <strong>{destinationClassName}</strong>.
                {summary.toRetain > 0 && (
                  <> Además, <strong>{summary.toRetain}</strong> estudiante(s) permanecerán en el mismo salón.</>
                )}
                {summary.withdrawn > 0 && (
                  <> Se marcarán <strong>{summary.withdrawn}</strong> estudiante(s) como retirados.</>
                )}
              </p>
              <p className="text-xs text-amber-600 mb-4">
                Esta acción no se puede deshacer fácilmente.
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowConfirmation(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" onClick={handleExecute} loading={isExecuting}>
                  Sí, Ejecutar Promoción
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromotionModal;
