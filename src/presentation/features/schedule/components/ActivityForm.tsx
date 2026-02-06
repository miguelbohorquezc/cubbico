/**
 * @fileoverview Formulario para crear y editar actividades en el calendario flexible
 * @module presentation/features/schedule/components/ActivityForm
 */

import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../../app/store/store';
import { saveActivity, updateActivity } from '../../../app/store/states/flexibleSchedule.slice';
import type { FlexibleScheduleActivity } from '../../../../domain/entities/schedule';
import {
  DAYS_OF_WEEK,
  VALID_DURATIONS,
  calculateEndTime,
  minutesToTime,
  validateActivityTime,
} from '../../../../domain/entities/schedule';

// ============================================
// Tipos
// ============================================

export interface ActivityFormProps {
  /** Año académico */
  year: string;
  /** Actividad a editar (si es null, es modo creación) */
  activity?: FlexibleScheduleActivity | null;
  /** Día preseleccionado (0-4) */
  defaultDayOfWeek?: number;
  /** Hora preseleccionada en minutos desde medianoche */
  defaultStartMinutes?: number;
  /** Callback al completar */
  onComplete?: () => void;
  /** Callback al cancelar */
  onCancel?: () => void;
  /** Lista de cursos/áreas disponibles */
  courses?: Array<{ id: string; name: string }>;
  /** Lista de profesores disponibles */
  teachers?: Array<{ id: string; name: string }>;
  /** Lista de salones disponibles */
  classrooms?: Array<{ id: string; name: string }>;
}

// ============================================
// Componente
// ============================================

export const ActivityForm: React.FC<ActivityFormProps> = ({
  year,
  activity,
  defaultDayOfWeek = 0,
  defaultStartMinutes = 420, // 07:00
  onComplete,
  onCancel,
  courses = [],
  teachers = [],
  classrooms = [],
}) => {
  const dispatch = useAppDispatch();

  // Estado del formulario
  const [dayOfWeek, setDayOfWeek] = useState(activity?.dayOfWeek ?? defaultDayOfWeek);
  const [startTime, setStartTime] = useState(
    activity?.startTime ?? minutesToTime(defaultStartMinutes)
  );
  const [durationMinutes, setDurationMinutes] = useState(activity?.durationMinutes ?? 45);
  const [courseId, setCourseId] = useState(activity?.courseId ?? '');
  const [teacherId, setTeacherId] = useState(activity?.teacherId ?? '');
  const [classroomId, setClassroomId] = useState(activity?.classroomId ?? '');

  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Calcular hora de fin
  const endTime = calculateEndTime(startTime, durationMinutes);

  // Validar formulario
  const validate = (): boolean => {
    const newErrors: string[] = [];

    if (!courseId) newErrors.push('Selecciona un curso/área');
    if (!teacherId) newErrors.push('Selecciona un profesor');
    if (!classroomId) newErrors.push('Selecciona un salón');

    const timeError = validateActivityTime({ startTime, durationMinutes });
    if (timeError) newErrors.push(timeError);

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Guardar actividad
  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);

    try {
      // Encontrar nombres de las entidades seleccionadas
      const course = courses.find((c) => c.id === courseId);
      const teacher = teachers.find((t) => t.id === teacherId);
      const classroom = classrooms.find((c) => c.id === classroomId);

      const activityData: FlexibleScheduleActivity = {
        id: activity?.id ?? `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        dayOfWeek,
        startTime,
        durationMinutes,
        endTime,
        courseId,
        courseName: course?.name ?? '',
        teacherId,
        teacherName: teacher?.name ?? '',
        classroomId,
        classroomName: classroom?.name ?? '',
        metadata: activity?.metadata,
      };

      if (activity) {
        // Actualizar existente
        await dispatch(updateActivity({ year, activity: activityData })).unwrap();
      } else {
        // Crear nueva
        await dispatch(saveActivity({ year, activity: activityData })).unwrap();
      }

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      setErrors([
        error instanceof Error ? error.message : 'Error al guardar la actividad',
      ]);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        {activity ? 'Editar Actividad' : 'Nueva Actividad'}
      </h2>

      {/* Errores */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <ul className="text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Formulario */}
      <div className="space-y-4">
        {/* Día de la semana */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Día</label>
          <select
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {DAYS_OF_WEEK.map((day, index) => (
              <option key={index} value={index}>
                {day}
              </option>
            ))}
          </select>
        </div>

        {/* Hora de inicio y duración */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora inicio</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora fin</label>
            <input
              type="time"
              value={endTime}
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600"
            />
          </div>
        </div>

        {/* Selector de duración */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duración: <span className="font-bold text-blue-600">{durationMinutes} min</span>
          </label>
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
            {VALID_DURATIONS.map((duration) => (
              <button
                key={duration}
                type="button"
                onClick={() => setDurationMinutes(duration)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  durationMinutes === duration
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {duration}
              </button>
            ))}
          </div>
        </div>

        {/* Curso/Área */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Curso/Área</label>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleccionar...</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>

        {/* Profesor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Profesor</label>
          <select
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleccionar...</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </select>
        </div>

        {/* Salón */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Salón</label>
          <select
            value={classroomId}
            onChange={(e) => setClassroomId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleccionar...</option>
            {classrooms.map((classroom) => (
              <option key={classroom.id} value={classroom.id}>
                {classroom.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isSaving ? 'Guardando...' : activity ? 'Actualizar' : 'Crear Actividad'}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
};

export default ActivityForm;
