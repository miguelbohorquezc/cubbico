import React from 'react';
import GradeInput from './GradeInput';
import FaultsInput from './FaultsInput';
import { Student, GradeField } from './types';

interface StudentRowProps {
  student: Student;
  grade: {
    l1: string;
    l2: string;
    l3: string;
    fallas: string;
    promedio?: number;
  };
  logros: Record<string, {
    id: string;
    numero: number;
    descripcion: string;
    cumplido?: boolean;
  }>;
  onGradeChange: (field: GradeField, value: string) => void;
  validateGrade: (value: string) => boolean;
  validateFaults: (value: string) => boolean;
  showErrors: boolean;
}

const StudentRow: React.FC<StudentRowProps> = React.memo(({
  student,
  grade,
  logros,
  onGradeChange,
  validateGrade,
  validateFaults,
  showErrors
}) => {
  const handleChange = (field: GradeField) => (value: string) => {
    onGradeChange(field, value);
  };

  return (
    <tr>
      <td className="student-info">
        <div className="student-name">
          {`${student.name} ${student.lastName}`.toUpperCase()}
        </div>
        <div className="student-details">
          <span className="document">{student.document}</span>
          <span className="classroom">{student.classRoom}</span>
        </div>
        <div className="logros-container">
          {Object.values(logros).map(logro => (
            <div key={logro.id} className="logro-item">
              <span className="logro-number">Logro #{logro.numero}:</span>
              <span className="logro-desc">{logro.descripcion}</span>
              {logro.cumplido && <span className="checkmark">✅</span>}
            </div>
          ))}
        </div>
      </td>

      {(['l1', 'l2', 'l3'] as GradeField[]).map(field => (
        <td key={field}>
          <GradeInput
            value={grade[field]}
            onChange={handleChange(field)}
            isValid={!showErrors || validateGrade(grade[field])}
            placeholder={field.toUpperCase()}
          />
          {showErrors && !validateGrade(grade[field]) && (
            <span className="error-message">
              {grade[field] ? 'Nota inválida' : 'Requerido'}
            </span>
          )}
        </td>
      ))}

      <td>
        <FaultsInput
          value={grade.fallas}
          onChange={handleChange('fallas')}
          isValid={!showErrors || validateFaults(grade.fallas)}
        />
        {showErrors && !validateFaults(grade.fallas) && (
          <span className="error-message">
            {grade.fallas ? 'Máx. 99' : 'Requerido'}
          </span>
        )}
      </td>

      <td className="average">
        {grade.promedio?.toFixed(2) || '0.00'}
      </td>
    </tr>
  );
});

export default StudentRow;