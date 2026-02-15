// useClassRoomForm.ts
import { useState, useCallback, FormEvent } from 'react';
import { SalonFormState } from '../../../shared/types/classRoomTypes'; 
import { addClassroom, updateClassroom } from '../../../infrastructure/classRoom.service';
import { validationsForm } from './formConfig';

export const useClassRoomForm = (initialData?: SalonFormState) => {
  const [error, setError] = useState<Partial<SalonFormState>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<SalonFormState>(initialData || {
    id: '',
    identificador: Date.now().toString(), // Auto-generado para compatibilidad
    directorGrupo: '',
    nombreSalon: '',
    nivel: ''
  });


  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setForm(prev => ({ ...prev, [name]: value }));
      setError(prev => ({ ...prev, [name]: '' }));
    }, []);

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name } = e.target;
      const errors = validationsForm(form);
      setError(prev => ({ ...prev, [name]: errors[name as keyof SalonFormState] }));
    }, [form]);

  // Handler específico para el selector de director
  const handleDirectorChange = useCallback((docenteId: string) => {
    setForm(prev => ({ ...prev, directorGrupo: docenteId }));
    setError(prev => ({ ...prev, directorGrupo: '' }));
  }, []);

  // Validar el formulario (sin enviar)
  const handleSubmit = useCallback((e: FormEvent): boolean => {
    e.preventDefault();
    const errors = validationsForm(form);
    if (Object.keys(errors).length > 0) {
      setError(errors);
      return false;
    }
    return true;
  }, [form]);

  // Enviar el formulario (después de confirmación)
  const submitForm = useCallback(async () => {
    setIsSubmitting(true);

    try {
      if (form.id) {
        // Modo edición - actualizar
        await updateClassroom(form.id, form);
      } else {
        // Modo creación - nuevo
        await addClassroom(form);
      }

      setForm(initialData || {
        id: '',
        identificador: Date.now().toString(),
        directorGrupo: '',
        nombreSalon: '',
        nivel: ''
      });

      return true;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [form, initialData]);

  return {
    form,
    error,
    handleChange,
    handleBlur,
    handleSubmit,
    submitForm,
    isSubmitting,
    handleDirectorChange
  };
};