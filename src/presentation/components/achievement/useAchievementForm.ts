import { useState, useCallback, FormEvent, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAchievement, addAchievement, updateAchievement } from '../../../infrastructure/achievement.service';
import { AchievementFormState } from './achievementFormConfig';

const initialFormState = {
  logro1: '',
  logro2: '',
  logro3: ''
};

export const useAchievementForm = () => {
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

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!classroomId || !areaId || !periodId) return;
        
        const periodNumber = parseInt(periodId);
        const snapshot = await getAchievement(classroomId, areaId, periodNumber);
        
        if (snapshot?.exists()) {
          setForm(snapshot.data().logros);
          setDocId(snapshot.id);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [classroomId, areaId, periodId]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError(prev => ({ ...prev, [name]: '' }));
  }, []);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validación básica
      const errors = Object.entries(form).reduce((acc, [key, value]) => {
        if (!value.trim()) acc[key] = 'Campo requerido';
        return acc;
      }, {} as Record<string, string>);

      if (Object.keys(errors).length > 0) {
        setError(errors);
        return;
      }

      if (!classroomId || !areaId || !periodId) {
        throw new Error('Faltan parámetros requeridos');
      }

      const achievementData = {
        classroomId,
        areaId: areaId,
        period: parseInt(periodId),
        logros: form
      };

      if (docId) {
        await updateAchievement(docId, achievementData);
        alert('Logros actualizados exitosamente!');
      } else {
        await addAchievement(achievementData);
        alert('Logros guardados exitosamente!');
      }

    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsSubmitting(false);
    }
  }, [form, classroomId, areaId, periodId, docId]);

  return { 
    form, 
    error, 
    handleChange, 
    handleSubmit, 
    isSubmitting,
    loading,
    docId
  };
};