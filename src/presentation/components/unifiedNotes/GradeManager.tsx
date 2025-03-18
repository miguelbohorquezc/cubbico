import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { bulkSaveStudents, fetchStudentsByClassroom, fetchStudentGrades } from '../../../infrastructure/student.service';
import { Student } from './types';
import InputField from './InputField';

const GradeManager: React.FC = () => {
  const { periodId, classroomId, areaId } = useParams<{
    periodId: string;
    classroomId: string;
    areaId: string;
  }>();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Record<string, { l1: string; l2: string; l3: string; fallas: string }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!classroomId || !periodId || !areaId) {
          throw new Error('Faltan parámetros requeridos');
        }

        const studentsData = await fetchStudentsByClassroom(classroomId);
        setStudents(studentsData);

        const currentYear = new Date().getFullYear().toString();
        
        const gradesPromises = studentsData.map(async (student) => {
          const grades = await fetchStudentGrades(
            student.id,
            currentYear,
            periodId,
            areaId
          );
          
          return {
            studentId: student.id,
            ...(grades || { l1: '', l2: '', l3: '', fallas: '' })
          };
        });

        const gradesResults = await Promise.all(gradesPromises);
        
        const initialGrades = gradesResults.reduce((acc, curr) => ({
          ...acc,
          [curr.studentId]: {
            l1: curr.l1,
            l2: curr.l2,
            l3: curr.l3,
            fallas: curr.fallas
          }
        }), {});

        setGrades(initialGrades);

      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };
    
    loadStudents();
  }, [classroomId, periodId, areaId]);

  const validateGrade = (value: string): boolean => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 1.0 && num <= 5.0;
  };

  const validateFaults = (value: string): boolean => {
    const num = parseInt(value);
    return !isNaN(num) && num >= 0 && num < 100;
  };

  const handleGradeChange = (studentId: string, field: string, value: string) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    setShowErrors(true);
    
    const allValid = students.every(student => {
      const studentGrades = grades[student.id] || { l1: '', l2: '', l3: '', fallas: '' };
      return (
        validateGrade(studentGrades.l1) &&
        validateGrade(studentGrades.l2) &&
        validateGrade(studentGrades.l3) &&
        validateFaults(studentGrades.fallas)
      );
    });

    if (!allValid || !classroomId || !areaId || !periodId) {
      alert('¡Corrige los errores antes de enviar!');
      return;
    }

    try {
      const batchData = students.map(student => ({
        studentId: student.id,
        year: new Date().getFullYear().toString(),
        period: periodId,
        areaId: areaId,
        grades: {
          l1: parseFloat(grades[student.id].l1),
          l2: parseFloat(grades[student.id].l2),
          l3: parseFloat(grades[student.id].l3),
          fallas: parseInt(grades[student.id].fallas)
        },
        classroomId: classroomId,
        teacherId: "current_user_id"
      }));
      
      await bulkSaveStudents(batchData);
      alert('Calificaciones guardadas correctamente!');
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
      
      <table className="grades-table">
        <thead>
          <tr>
            <th>Estudiante</th>
            <th>L1</th>
            <th>L2</th>
            <th>L3</th>
            <th>Fallas</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => {
            const studentGrades = grades[student.id] || { l1: '', l2: '', l3: '', fallas: '' };
            
            return (
              <tr key={student.id}>
                <td className="student-info">
                  {`${student.name} ${student.lastName}`.toUpperCase()}
                  <div className="student-details">
                    <span>{student.document}</span>
                  </div>
                </td>
                
                {['l1', 'l2', 'l3'].map(field => (
                  <td key={field}>
                    <InputField
                      type="number"
                      value={studentGrades[field]}
                      min={1}
                      max={5}
                      step={0.01}
                      onChange={(value) => handleGradeChange(student.id, field, value)}
                      isValid={!showErrors || validateGrade(studentGrades[field])}
                      errorMessage="1.00-5.00"
                    />
                  </td>
                ))}
                
                <td>
                  <InputField
                    type="number"
                    value={studentGrades.fallas}
                    min={0}
                    step={1}
                    onChange={(value) => handleGradeChange(student.id, 'fallas', value)}
                    isValid={!showErrors || validateFaults(studentGrades.fallas)}
                    errorMessage="Máx. 99"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button 
        onClick={handleSubmit}
        className="submit-button"
      >
        Guardar Calificaciones
      </button>
    </div>
  );
};

export default GradeManager;