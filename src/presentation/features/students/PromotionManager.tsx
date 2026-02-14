import React, { useEffect, useState, useMemo } from 'react';
import { ClassRoom } from '../../../domain/entities/classRoom';
import { fetchClassrooms } from '../../../infrastructure/classRoom.service';
import { fetchActiveStudentsByClassroom } from '../../../infrastructure/student.service';
import PromotionModal from './components/PromotionModal';
import { PromotionConfig, PromotionResult } from '../../../shared/types/studentManagementTypes';

/**
 * Classroom with student count for promotion manager
 */
interface ClassroomWithCount extends ClassRoom {
  studentCount: number;
  isLoading: boolean;
}

/**
 * Level configuration for display
 */
const LEVEL_CONFIG: Record<string, { label: string; color: string; order: number }> = {
  preescolar: { label: 'Preescolar', color: 'purple', order: 1 },
  primaria: { label: 'Primaria', color: 'emerald', order: 2 },
  secundaria: { label: 'Secundaria', color: 'blue', order: 3 },
};

/**
 * Get previous academic year (the one ending)
 * Promotions typically happen at start of year, so we default to previous year
 */
const getPreviousYear = (): string => {
  return (new Date().getFullYear() - 1).toString();
};

/**
 * PromotionManager
 *
 * Dedicated view for managing annual student promotions.
 * Shows all classrooms organized by level with student counts
 * and quick access to promotion modal.
 */
const PromotionManager: React.FC = () => {
  const [classrooms, setClassrooms] = useState<ClassroomWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(getPreviousYear());
  const [promotionConfig, setPromotionConfig] = useState<PromotionConfig | null>(null);
  const [completedPromotions, setCompletedPromotions] = useState<Set<string>>(new Set());

  // Available years for selection (source year - the year that's ending)
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [
      (currentYear - 2).toString(),
      (currentYear - 1).toString(),
      currentYear.toString(),
    ];
  }, []);

  // Load classrooms
  useEffect(() => {
    const loadClassrooms = async () => {
      setIsLoading(true);
      try {
        const data = await fetchClassrooms();
        // Initialize with loading state for counts
        const classroomsWithCount: ClassroomWithCount[] = data.map((c) => ({
          ...c,
          studentCount: 0,
          isLoading: true,
        }));
        setClassrooms(classroomsWithCount);

        // Load student counts in parallel
        const countsPromises = data.map(async (classroom) => {
          try {
            // Solo contar estudiantes activos para promoción
            const students = await fetchActiveStudentsByClassroom(classroom.id);
            return { id: classroom.id, count: students.length };
          } catch {
            return { id: classroom.id, count: 0 };
          }
        });

        const counts = await Promise.all(countsPromises);

        setClassrooms((prev) =>
          prev.map((c) => {
            const countData = counts.find((x) => x.id === c.id);
            return {
              ...c,
              studentCount: countData?.count || 0,
              isLoading: false,
            };
          })
        );
      } catch (error) {
        console.error('Error loading classrooms:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadClassrooms();
  }, []);

  // Group classrooms by level
  const classroomsByLevel = useMemo(() => {
    const grouped: Record<string, ClassroomWithCount[]> = {};

    classrooms.forEach((classroom) => {
      const level = classroom.nivel?.toLowerCase() || 'otro';
      if (!grouped[level]) {
        grouped[level] = [];
      }
      grouped[level].push(classroom);
    });

    // Sort each level's classrooms by name
    Object.keys(grouped).forEach((level) => {
      grouped[level].sort((a, b) => a.nombreSalon.localeCompare(b.nombreSalon));
    });

    return grouped;
  }, [classrooms]);

  // Sort levels by order
  const sortedLevels = useMemo(() => {
    return Object.keys(classroomsByLevel).sort((a, b) => {
      const orderA = LEVEL_CONFIG[a]?.order || 99;
      const orderB = LEVEL_CONFIG[b]?.order || 99;
      return orderA - orderB;
    });
  }, [classroomsByLevel]);

  // Stats
  const stats = useMemo(() => {
    const total = classrooms.reduce((sum, c) => sum + c.studentCount, 0);
    const completed = completedPromotions.size;
    const pending = classrooms.length - completed;
    return { total, completed, pending };
  }, [classrooms, completedPromotions]);

  const handleOpenPromotion = (classroom: ClassroomWithCount) => {
    setPromotionConfig({
      sourceClassroomId: classroom.id,
      sourceClassName: classroom.nombreSalon,
      sourceLevel: classroom.nivel,
      currentYear: selectedYear,
      targetYear: (parseInt(selectedYear) + 1).toString(),
    });
  };

  const handlePromotionComplete = (result: PromotionResult) => {
    if (result.success && promotionConfig) {
      setCompletedPromotions((prev) => new Set([...prev, promotionConfig.sourceClassroomId]));
      alert(`Promoción completada exitosamente: ${result.processed} estudiantes procesados`);
    } else {
      alert(`Error en la promoción: ${result.errorMessages?.join(', ') || 'Error desconocido'}`);
    }
  };

  const getColorClasses = (level: string) => {
    const config = LEVEL_CONFIG[level];
    if (!config) return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' };

    const colors: Record<string, { bg: string; border: string; text: string }> = {
      purple: { bg: 'bg-magenta-50', border: 'border-purple-200', text: 'text-magenta-700' },
      emerald: { bg: 'bg-tosca/10', border: 'border-tosca-200', text: 'text-tosca-700' },
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
    };

    return colors[config.color] || colors.purple;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-deep-blue-800 mb-2">
          Gestión de Promociones
        </h1>
        <p className="text-light-gray-600">
          Administra la promoción de estudiantes al siguiente año académico
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {/* Year Selector */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-deep-blue-700">
            Año Académico:
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 text-sm border border-light-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medium-blue-300"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year} → {parseInt(year) + 1}
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-300"></span>
            <span className="text-light-gray-600">
              {stats.total} estudiantes
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-light-gray-600">
              {stats.completed} completados
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-light-gray-600">
              {stats.pending} pendientes
            </span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3 text-light-gray-500">
            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Cargando salones...</span>
          </div>
        </div>
      ) : (
        /* Classrooms by Level */
        <div className="space-y-8">
          {sortedLevels.map((level) => {
            const levelConfig = LEVEL_CONFIG[level];
            const colors = getColorClasses(level);
            const levelClassrooms = classroomsByLevel[level];

            return (
              <div key={level}>
                {/* Level Header */}
                <div className="flex items-center gap-3 mb-4">
                  <h2 className={`text-lg font-semibold ${colors.text}`}>
                    {levelConfig?.label || level}
                  </h2>
                  <span className="text-sm text-light-gray-500">
                    ({levelClassrooms.length} salones)
                  </span>
                </div>

                {/* Classroom Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {levelClassrooms.map((classroom) => {
                    const isCompleted = completedPromotions.has(classroom.id);

                    return (
                      <div
                        key={classroom.id}
                        className={`
                          relative p-4 rounded-lg border-2 transition-all duration-200
                          ${isCompleted
                            ? 'bg-green-50 border-green-300'
                            : `${colors.bg} ${colors.border} hover:shadow-md`
                          }
                        `}
                      >
                        {/* Completed Badge */}
                        {isCompleted && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}

                        {/* Classroom Info */}
                        <div className="mb-3">
                          <h3 className="font-semibold text-deep-blue-800">
                            {classroom.nombreSalon}
                          </h3>
                          <p className="text-xs text-light-gray-500">
                            ID: {classroom.identificador}
                          </p>
                        </div>

                        {/* Student Count */}
                        <div className="flex items-center gap-2 mb-4">
                          <svg className="w-5 h-5 text-light-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {classroom.isLoading ? (
                            <span className="text-sm text-light-gray-400">Cargando...</span>
                          ) : (
                            <span className="text-sm font-medium text-deep-blue-700">
                              {classroom.studentCount} estudiantes
                            </span>
                          )}
                        </div>

                        {/* Action Button */}
                        <button
                          onClick={() => handleOpenPromotion(classroom)}
                          disabled={classroom.studentCount === 0 || classroom.isLoading}
                          className={`
                            w-full px-4 py-2 text-sm font-medium rounded-lg
                            transition-all duration-200
                            focus:outline-none focus:ring-2 focus:ring-offset-2
                            disabled:opacity-50 disabled:cursor-not-allowed
                            ${isCompleted
                              ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-300'
                              : 'bg-medium-blue-600 text-white hover:bg-medium-blue-700 focus:ring-medium-blue-300'
                            }
                          `}
                        >
                          {isCompleted ? 'Ver / Editar' : 'Promover'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && classrooms.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-light-gray-500">
          <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-lg font-medium">No hay salones registrados</p>
          <p className="text-sm">Crea salones primero para gestionar promociones</p>
        </div>
      )}

      {/* Promotion Modal */}
      {promotionConfig && (
        <PromotionModal
          isOpen={!!promotionConfig}
          onClose={() => setPromotionConfig(null)}
          config={promotionConfig}
          onPromotionComplete={handlePromotionComplete}
        />
      )}
    </div>
  );
};

export default PromotionManager;
