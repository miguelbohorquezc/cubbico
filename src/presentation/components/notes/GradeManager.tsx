import React, { useState } from 'react';
import StudentRow from './StudentRow';
import useGradeManager from './useGradeManager';
import { Student } from './types';
import './styles.css';

const GradeManager: React.FC = () => {
  const initialStudents: Student[] = [
    { id: 1, fullName: 'Juan Pérez' },
    { id: 2, fullName: 'María Gómez' },
    { id: 3, fullName: 'Carlos López' }
  ];

  const {
    grades,
    isSubmitting,
    validateGrade,
    validateFaults,
    handleGradeChange,
    handleSubmit,
    validateAllGrades
  } = useGradeManager(initialStudents);

  const [showErrors, setShowErrors] = useState(false);

  const handleFormSubmit = async () => {
    setShowErrors(true);
    if (!validateAllGrades()) {
      alert('¡Corrige los errores antes de enviar!');
      return;
    }
    
    const success = await handleSubmit();
    if (success) {
      setShowErrors(false);
    }
  };

  return (
    <div className="grade-manager">
      <h2 className="title">Registro de Calificaciones</h2>
      
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
          {initialStudents.map(student => (
            <StudentRow
              key={student.id}
              student={student}
              grade={grades[student.id]}
              onGradeChange={(field, value) => handleGradeChange(student.id, field, value)}
              validateGrade={validateGrade}
              validateFaults={validateFaults}
              showErrors={showErrors}
            />
          ))}
        </tbody>
      </table>

      <button
        onClick={handleFormSubmit}
        className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
        disabled={isSubmitting || (showErrors && !validateAllGrades())}
      >
        {isSubmitting ? (
          <span className="spinner">⏳</span>
        ) : (
          'Guardar Calificaciones'
        )}
      </button>
    </div>
  );
};

export default GradeManager;