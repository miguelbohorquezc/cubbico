// useClassRoomForm.ts
import { useState, useCallback, FormEvent } from 'react';
import { SalonFormState } from '../../../shared/types/classRoomTypes'; 
import { addClassroom } from '../../../infrastructure/classRoom.service';
import { validationsForm } from './formConfig';

const initialForm: SalonFormState = {
  id:'',
  identificador: '',
  directorGrupo: '',
  nombreSalon: '',
  nivel: ''
};

export const useClassRoomForm = () => {
  const [form, setForm] = useState<SalonFormState>(initialForm);
  const [error, setError] = useState<Partial<SalonFormState>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const errors = validationsForm(form);
      if (Object.keys(errors).length > 0) {
        setError(errors);
        return;
      }
      
      await addClassroom(form);
      setForm(initialForm);
      alert('Salón creado exitosamente!');
    } catch (error) {
      console.error('Error al crear salón:', error);
      alert('Error al crear el salón');
    } finally {
      setIsSubmitting(false);
    }
  }, [form]);

  return { form, error, handleChange, handleBlur, handleSubmit, isSubmitting };
};