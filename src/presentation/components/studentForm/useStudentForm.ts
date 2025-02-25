import { useState, useCallback, FormEvent } from 'react';
import { StudentFormState } from '../../../shared/types/studentTypes';
import { addStudent } from '../../../domain/services/student.service';
import { validationsForm } from './formConfig';

const initialFormState: StudentFormState = {
  id: '',
  document: '',
  name: '',
  lastName: '',
  classRoom: '',
  className: '',
  caracter: ''
};

export const useStudentForm = () => {
  const [form, setForm] = useState<StudentFormState>(initialFormState);
  const [error, setError] = useState<Record<string, string>>({});
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
      setError(prev => ({ ...prev, [name]: errors[name] || '' }));
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
      
      await addStudent(form);
      setForm(initialFormState);
      alert('Estudiante matriculado exitosamente!');
    } catch (error) {
      console.error('Error al matricular:', error);
      alert('Ocurrió un error al matricular el estudiante');
    } finally {
      setIsSubmitting(false);
    }
  }, [form]);

  return { form, error, handleChange, handleBlur, handleSubmit, isSubmitting };
};