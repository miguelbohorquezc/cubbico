import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { RootState, useAppSelector } from '../../../app/store/store';
import { fetchStudentsByClassroom, bulkSaveStudents } from '../../../infrastructure/student.service';
import useGradeManager from './useGradeManager';
import StudentRow from './StudentRow';
import './styles.css';
import { GradeField, Student } from './types';
import { createSelector } from '@reduxjs/toolkit';

const selectFilteredAchievements = createSelector(
  [
    (state: RootState) => state.teacherData.achievements,
    (_: RootState, areaId: string | undefined) => areaId
  ],
  (achievements, areaId) => 
    achievements.filter(a => a.areaId === areaId)
    .map(a => ({...a}))
);

const GradeManager: React.FC = () => {
  const { periodId, classroomId, areaId } = useParams<{
    periodId: string;
    classroomId: string;
    areaId: string;
  }>();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  
  const currentYear = new Date().getFullYear().toString();
  const achievements = useAppSelector(
    (state) => selectFilteredAchievements(state, areaId),
    (prev, next) => 
      prev.length === next.length && 
      prev.every((a, i) => a.id === next[i]?.id)
  );

  const {
    academicRecords,
    isSubmitting,
    validateGrade,
    validateFaults,
    handleGradeChange,
    validateAllRecords,
    prepareBatchData
  } = useGradeManager(students, achievements, {
    currentYear,
    currentPeriod: periodId || '',
    currentAreaId: areaId || '',
    currentClassroomId: classroomId || ''
  });

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadStudents = async () => {
      try {
        if (!classroomId) throw new Error('ID de salón no proporcionado');
        
        setLoading(true);
        const data = await fetchStudentsByClassroom(classroomId);
        
        if (isMounted) {
          if (data.length === 0) throw new Error('No se encontraron estudiantes');
          setStudents(data);
        }
      } catch (err) {
        if (isMounted && !controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Error desconocido");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadStudents();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [classroomId]);

  const handleFormSubmit = async () => {
    if (!classroomId || !areaId || !periodId) return;
    
    setShowErrors(true);
    if (!validateAllRecords()) {
      alert('¡Corrige los errores antes de enviar!');
      return;
    }

    try {
      await bulkSaveStudents(prepareBatchData());
      alert('Calificaciones guardadas correctamente para el periodo ' + periodId);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al guardar");
    }
  };

  if (loading) return <div className="loading">Cargando estudiantes...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (students.length === 0) return <div className="empty">No hay estudiantes en este salón</div>;

  return (
    <div className="grade-manager">
      <h1 className="title">Registro de Calificaciones</h1>
      <div className="class-info">
        <h2>Periodo: {periodId} | Año: {currentYear}</h2>
        <h3>Área: {areaId} - Salón: {classroomId}</h3>
      </div>

      <table className="grades-table">
        <thead>
          <tr>
            <th>Estudiante</th>
            <th>L1</th>
            <th>L2</th>
            <th>L3</th>
            <th>Fallas</th>
            <th>Promedio</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => {
            const studentRecord = academicRecords[student.id]?.[currentYear]?.periods[periodId!]?.areas[areaId!];
            
            return (
              <StudentRow
                key={student.id}
                student={student}
                grade={studentRecord?.grades || {
                  l1: '',
                  l2: '',
                  l3: '',
                  fallas: '',
                  promedio: 0
                }
              }
                logros={studentRecord?.logros || {}}
                onGradeChange={(field: GradeField, value: string) => 
                  handleGradeChange(student.id, field, value)
                }
                validateGrade={validateGrade}
                validateFaults={validateFaults}
                showErrors={showErrors}
              />
            );
          })}
        </tbody>
      </table>

      <button
        onClick={handleFormSubmit}
        className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
        disabled={isSubmitting || (showErrors && !validateAllRecords())}
      >
        {isSubmitting ? 'Guardando...' : 'Guardar Calificaciones'}
      </button>
    </div>
  );
};

export default React.memo(GradeManager);