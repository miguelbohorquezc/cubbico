// useAchievementForm.ts
import { useState, useCallback, FormEvent, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAchievement, addAchievement, updateAchievement } from '../../../infrastructure/achievement.service';
import { useAppDispatch } from '../../../app/store/store';
import  {teacherActions, teacherSlice } from '../../../app/store/states/teacher.slice';
import { AchievementData, AchievementFormState } from '../../../domain/entities/achievementData';

const initialFormState: AchievementFormState = {
  logro1: '',
  logro2: '',
  logro3: ''
};

export const useAchievementForm = () => {
  const dispatch = useAppDispatch();
  const { classroomId, areaId, periodId } = useParams<{
    classroomId: string;
    areaId: string;
    periodId: string;
  }>();

  const [form, setForm] = useState<AchievementFormState>(initialFormState);
  const [docId, setDocId] = useState<string>('');
  const [error, setError] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar datos iniciales
  useEffect(() => {
    const loadAchievements = async () => {
      try {
        if (!classroomId || !areaId || !periodId) return;

        setLoading(true);
        const periodNumber = parseInt(periodId);
        
        const snapshot = await getAchievement(classroomId, areaId, periodNumber);
        
        if (snapshot) {
          const achievementData: AchievementData = {
            id: snapshot.id,
            classroomId,
            areaId,
            period: periodNumber,
            logros: snapshot.logros
          };

          setForm(snapshot.logros);
          if (snapshot.id) {
            setDocId(snapshot.id);
          }
          dispatch(teacherActions.upsertAchievement(achievementData));
        }
      } catch (error) {
        console.error('Error loading achievements:', error);
        dispatch(teacherSlice.actions.setError('Error cargando logros'));
      } finally {
        setLoading(false);
      }
    };

    loadAchievements();
  }, [classroomId, areaId, periodId, dispatch]);

  // Manejar cambios en los textareas
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: value.slice(0, 200) // Limitar a 200 caracteres
    }));
    setError(prev => ({ ...prev, [name]: '' }));
  }, []);

  // Validación del formulario
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};
    const requiredFields: (keyof AchievementFormState)[] = ['logro1', 'logro2', 'logro3'];

    requiredFields.forEach(field => {
      if (!form[field].trim()) {
        errors[field] = 'Este logro es requerido';
      } else if (form[field].length < 20) {
        errors[field] = 'Mínimo 20 caracteres';
      }
    });

    setError(errors);
    return Object.keys(errors).length === 0;
  }, [form]);

  // Envío del formulario
  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      if (!classroomId || !areaId || !periodId) {
        throw new Error('Configuración inválida');
      }

      const periodNumber = parseInt(periodId);
      const achievementData: AchievementData = {
        id: docId,
        classroomId,
        areaId,
        period: periodNumber,
        logros: form
      };

      // Operación de guardado
      let savedId = docId;
      if (docId) {
        await updateAchievement(docId, achievementData);
      } else {
        savedId = await addAchievement(achievementData);
        achievementData.id = savedId;
      }

      // Actualizar Redux y estado local
      dispatch(teacherSlice.actions.upsertAchievement(achievementData));
      if (!docId) setDocId(savedId);

      alert(`Logros ${docId ? 'actualizados' : 'guardados'} correctamente!`);
    } catch (error) {
      console.error('Submission error:', error);
      alert(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsSubmitting(false);
    }
  }, [form, classroomId, areaId, periodId, docId, dispatch, validateForm]);

  // Calcular progreso para la barra
  const calculateProgress = useCallback((text: string) => {
    return Math.min((text.length / 200) * 100, 100);
  }, []);

  return {
    form,
    error,
    docId,
    loading,
    isSubmitting,
    handleChange,
    handleSubmit,
    calculateProgress
  };
};