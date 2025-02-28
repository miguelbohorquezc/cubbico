import React from 'react';
import GradeInput from './GradeInput';
import FaultsInput from './FaultsInput';
import { Student, Grade, GradeField } from './types';

interface StudentRowProps {
  student: Student;
  grade: Grade;
  onGradeChange: (field: GradeField, value: string) => void;
  validateGrade: (value: string) => boolean;
  validateFaults: (value: string) => boolean;
  showErrors: boolean;
}

const StudentRow: React.FC<StudentRowProps> = React.memo(({
  student,
  grade,
  onGradeChange,
  validateGrade,
  validateFaults,
  showErrors
}) => (
  <tr>
    <td className="student-name">{student.fullName}</td>
    {(['l1', 'l2', 'l3'] as GradeField[]).map(field => (
      <td key={field}>
        <GradeInput
          value={grade[field]}
          onChange={(value) => onGradeChange(field, value)}
          isValid={!showErrors || validateGrade(grade[field])}
          placeholder={field.toUpperCase()}
        />
        {showErrors && !validateGrade(grade[field]) && (
          <span className="error-message">
            {grade[field] ? 'Nota inválida (1.00-5.00)' : 'Campo requerido'}
          </span>
        )}
      </td>
    ))}
    <td>
      <FaultsInput
        value={grade.fallas}
        onChange={(value) => onGradeChange('fallas', value)}
        isValid={!showErrors || validateFaults(grade.fallas)}
      />
      {showErrors && !validateFaults(grade.fallas) && (
        <span className="error-message">
          {grade.fallas ? 'Máx. 99 fallas' : 'Campo requerido'}
        </span>
      )}
    </td>
    <td className="average">{grade.promedio.toFixed(2)}</td>
  </tr>
));

export default StudentRow;