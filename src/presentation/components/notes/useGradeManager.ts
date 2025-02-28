import { useState, useCallback } from 'react';
import { Student, Grade, GradeField } from './types';

const useGradeManager = (initialStudents: Student[]) => {
  const [grades, setGrades] = useState<Record<number, Grade>>(() =>
    initialStudents.reduce((acc, student) => ({
      ...acc,
      [student.id]: {
        l1: '',
        l2: '',
        l3: '',
        fallas: '',
        promedio: 0.00
      }
    }), {})
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateGrade = useCallback((value: string): boolean => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 1.0 && num <= 5.0 && /^\d+(\.\d{0,2})?$/.test(value);
  }, []);

  const validateFaults = useCallback((value: string): boolean => {
    const num = parseInt(value);
    return !isNaN(num) && num >= 0 && num < 100 && /^\d+$/.test(value);
  }, []);

  const calculateAverage = useCallback((currentGrade: Grade): number => {
    const values = [currentGrade.l1, currentGrade.l2, currentGrade.l3]
      .map(parseFloat)
      .filter(v => !isNaN(v));
      
    return values.length > 0 
      ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2))
      : 0.00;
  }, []);

  const handleGradeChange = useCallback((studentId: number, field: GradeField, value: string) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
        promedio: calculateAverage({
          ...prev[studentId],
          [field]: value
        })
      }
    }));
  }, [calculateAverage]);

  const validateAllGrades = useCallback(() => {
    return Object.values(grades).every(grade => {
      const validGrades = ['l1', 'l2', 'l3'].every(field => 
        validateGrade(grade[field as GradeField])
      );
      const validFaults = validateFaults(grade.fallas);
      return validGrades && validFaults;
    });
  }, [grades, validateGrade, validateFaults]);

  const handleSubmit = useCallback(async () => {
    if (!validateAllGrades()) {
      return false;
    }

    setIsSubmitting(true);
    console.log('Submitting valid grades:', grades);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    return true;
  }, [grades, validateAllGrades]);

  return {
    grades,
    isSubmitting,
    validateGrade,
    validateFaults,
    handleGradeChange,
    handleSubmit,
    validateAllGrades
  };
};

export default useGradeManager;