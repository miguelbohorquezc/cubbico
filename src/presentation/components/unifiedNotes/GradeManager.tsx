import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { bulkSaveStudents, fetchStudentsByClassroom, fetchStudentGrades } from '../../../infrastructure/student.service';
import { getAchievement } from '../../../infrastructure/achievement.service';
import { Student } from './types';
import InputField from './InputField';
import './GradeManagerStyle.css';

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
  const [hasAchievements, setHasAchievements] = useState(false);

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

  useEffect(() => {
    const checkAchievements = async () => {
      if (classroomId && areaId && periodId) {
        const achievement = await getAchievement(
          classroomId,
          areaId,
          parseInt(periodId)
        );
        console.log(achievement);
        setHasAchievements(!!achievement);
      }
    };
    checkAchievements();
  }, [classroomId, areaId, periodId]);

  const calculateAverage = (l1: string, l2: string, l3: string): string => {
    const num1 = parseFloat(l1);
    const num2 = parseFloat(l2);
    const num3 = parseFloat(l3);
  
    if ([num1, num2, num3].some(isNaN)) {
      return 'N/A';
    }
  
    const average = (num1 + num2 + num3) / 3;
    return average.toFixed(2);
  };

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
      const currentPeriod = parseInt(periodId);
      const achievementDoc = await getAchievement(classroomId!, areaId!, currentPeriod);
    
      if (!achievementDoc) {
        alert('Primero debes registrar los logros para este periodo');
        return;
      }



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
        teacherId: "current_user_id",
        achievementId: achievementDoc.id, // ID del documento de logros
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
      
      <table className="grades-table">
        <thead>
          <tr>
            <th><h3>Estudiante</h3></th>
            <th><h3>L1</h3></th>
            <th><h3>L2</h3></th>
            <th><h3>L3</h3></th>
            <th><h3>Fallas</h3></th>
            <th><h3>Promedio</h3></th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => {
            const studentGrades = grades[student.id] || { l1: '', l2: '', l3: '', fallas: '' };
            
            return (
              <tr key={student.id}>
                <td className="student-info">
                  <p>{`${student.name} ${student.lastName}`.toUpperCase()}</p>
                  <div className="student-details">
                    <span><p>{student.id}</p></span>
                  </div>
                </td>
                {['l1', 'l2', 'l3'].map(field => (
                  <td key={field}>
                    <InputField
                      type="number"
                      //@ts-ignore
                      value={studentGrades[field]}
                      min={1}
                      max={5}
                      step={0.01}
                      onChange={(value) => handleGradeChange(student.id, field, value)}
                      //@ts-ignore
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
                <td className="average-cell">
                    {calculateAverage(studentGrades.l1, studentGrades.l2, studentGrades.l3)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {!hasAchievements && (
  <div className="warning-message">
    ⚠️ Debes registrar los logros académicos antes de ingresar notas
  </div>
)}

      <button 
        onClick={handleSubmit}
        className="submit-button"
        disabled={!hasAchievements || loading}
      >
        Guardar Calificaciones
      </button>
    </div>
  );
};

export default GradeManager;