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
    identificador: '',
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

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const errors = validationsForm(form);
      if (Object.keys(errors).length > 0) {
        setError(errors);
        return;
      }
      
      if (form.id) {
        // Modo edición - actualizar
        await updateClassroom(form.id, form);
        alert('Salón actualizado exitosamente!');
      } else {
        // Modo creación - nuevo
        await addClassroom(form);
        alert('Salón creado exitosamente!');
      }
      
      setForm(initialData || {
        id: '',
        identificador: '',
        directorGrupo: '',
        nombreSalon: '',
        nivel: ''
      });
      
      return true; // Para manejar cierre modal
    } catch (error) {
      console.error('Error:', error);
      alert(`Error al ${form.id ? 'actualizar' : 'crear'} el salón`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [form]);

  return { form, error, handleChange, handleBlur, handleSubmit, isSubmitting };
};