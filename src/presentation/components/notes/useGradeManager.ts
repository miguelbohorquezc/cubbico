import { useState, useCallback, useEffect } from 'react';
import { Student, GradeField, AcademicRecord } from './types';
import { AchievementData } from '../../../domain/entities/achievementData';

interface GradeManagerParams {
  currentYear: string;
  currentPeriod: string;
  currentAreaId: string;
  currentClassroomId: string;
}

const useGradeManager = (
  students: Student[],
  achievements: AchievementData[],
  { currentYear, currentPeriod, currentAreaId, currentClassroomId }: GradeManagerParams
) => {
  const [academicRecords, setAcademicRecords] = useState<Record<string, AcademicRecord>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializar estructura académica
  useEffect(() => {
    if (students.length === 0 || achievements.length === 0) return;

    const initialRecords = students.reduce((acc, student) => ({
      ...acc,
      [student.id]: {
        [currentYear]: {
          periods: {
            [currentPeriod]: {
              areas: {
                [currentAreaId]: {
                  grades: {
                    l1: '',
                    l2: '',
                    l3: '',
                    fallas: ''
                  },
                  logros: achievements.reduce((logrosAcc, logro) => ({
                    ...logrosAcc,
                    [logro.id]: {
                      id: logro.id,
                      numero: logro.numero || 0,
                      descripcion: logro.descripcion || 'Sin descripción',
                      cumplido: false
                    }
                  }), {}),
                  metadata: {
                    classroomId: currentClassroomId,
                    lastUpdate: new Date().toISOString()
                  }
                }
              }
            }
          }
        }
      }
    }), {});

    setAcademicRecords(initialRecords);
  }, [students, achievements, currentYear, currentPeriod, currentAreaId, currentClassroomId]);

  const validateGrade = useCallback((value: string): boolean => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 1.0 && num <= 5.0 && /^\d+(\.\d{0,2})?$/.test(value);
  }, []);

  const validateFaults = useCallback((value: string): boolean => {
    const num = parseInt(value);
    return !isNaN(num) && num >= 0 && num < 100 && /^\d+$/.test(value);
  }, []);

  const calculateAverage = useCallback((grades: { l1: string; l2: string; l3: string }): number => {
    const values = [grades.l1, grades.l2, grades.l3]
      .map(parseFloat)
      .filter(v => !isNaN(v));
    
    return values.length > 0 
      ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2))
      : 0.00;
  }, []);

  const handleGradeChange = useCallback((
    studentId: string,
    field: GradeField,
    value: string
  ) => {
    setAcademicRecords(prev => {
      const studentRecord = prev[studentId] || {
        [currentYear]: {
          periods: {
            [currentPeriod]: {
              areas: {
                [currentAreaId]: {
                  grades: { l1: '', l2: '', l3: '', fallas: '' },
                  logros: {},
                  metadata: {
                    classroomId: currentClassroomId,
                    lastUpdate: new Date().toISOString()
                  }
                }
              }
            }
          }
        }
      };

      const newGrades = {
        ...studentRecord[currentYear].periods[currentPeriod].areas[currentAreaId].grades,
        [field]: value
      };

      const newAverage = calculateAverage(newGrades);

      return {
        ...prev,
        [studentId]: {
          ...studentRecord,
          [currentYear]: {
            ...studentRecord[currentYear],
            periods: {
              ...studentRecord[currentYear].periods,
              [currentPeriod]: {
                ...studentRecord[currentYear].periods[currentPeriod],
                areas: {
                  ...studentRecord[currentYear].periods[currentPeriod].areas,
                  [currentAreaId]: {
                    ...studentRecord[currentYear].periods[currentPeriod].areas[currentAreaId],
                    grades: {
                      ...newGrades,
                      promedio: newAverage
                    },
                    metadata: {
                      ...studentRecord[currentYear].periods[currentPeriod].areas[currentAreaId].metadata,
                      lastUpdate: new Date().toISOString()
                    }
                  }
                }
              }
            }
          }
        }
      };
    });
  }, [calculateAverage, currentYear, currentPeriod, currentAreaId, currentClassroomId]);

  const validateAllRecords = useCallback(() => {
    return Object.values(academicRecords).every(record => {
      const areaData = record[currentYear]?.periods[currentPeriod]?.areas[currentAreaId];
      if (!areaData) return false;

      const validGrades = ['l1', 'l2', 'l3'].every(field => 
        validateGrade(areaData.grades[field as GradeField])
      );
      
      const validFaults = validateFaults(areaData.grades.fallas);
      const validLogros = Object.values(areaData.logros).every(logro => 
        typeof logro.numero === 'number' && logro.descripcion.length > 0
      );

      return validGrades && validFaults && validLogros;
    });
  }, [academicRecords, currentYear, currentPeriod, currentAreaId, validateGrade, validateFaults]);

  const prepareBatchData = useCallback(() => {
    return Object.entries(academicRecords).map(([studentId, record]) => ({
      studentId,
      year: currentYear,
      period: currentPeriod,
      areaId: currentAreaId,
      grades: {
        l1: parseFloat(record[currentYear].periods[currentPeriod].areas[currentAreaId].grades.l1),
        l2: parseFloat(record[currentYear].periods[currentPeriod].areas[currentAreaId].grades.l2),
        l3: parseFloat(record[currentYear].periods[currentPeriod].areas[currentAreaId].grades.l3),
        fallas: parseInt(record[currentYear].periods[currentPeriod].areas[currentAreaId].grades.fallas)
      },
      logros: Object.values(record[currentYear].periods[currentPeriod].areas[currentAreaId].logros),
      teacherId: "current_user_id", // Debes inyectar esto desde tu auth
      classroomId: currentClassroomId
    }));
  }, [academicRecords, currentYear, currentPeriod, currentAreaId, currentClassroomId]);

  return {
    academicRecords,
    isSubmitting,
    validateGrade,
    validateFaults,
    handleGradeChange,
    validateAllRecords,
    prepareBatchData
  };
};

export default useGradeManager;