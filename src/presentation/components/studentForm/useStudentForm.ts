import { useState, useCallback, FormEvent, useEffect } from 'react';
import { StudentFormState } from '../../../shared/types/studentTypes';
import { addStudent } from '../../../infrastructure/student.service';
import { validationsForm } from './formConfig';
import { fetchClassrooms } from '../../../infrastructure/classRoom.service'; // Asegúrate de que la ruta es correcta

const initialFormState: StudentFormState = {
  id: '',
  document: '',
  name: '',
  lastName: '',
  classRoom: '',
  className: '',
  caracter: '',
  classroomId: '' // Nuevo campo
};

export const useStudentForm = () => {
  const [form, setForm] = useState<StudentFormState>(initialFormState);
  const [error, setError] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  //@ts-ignore
  const [classrooms, setClassrooms] = useState<ClassRoom[]>([]);

  // Cargar salones al montar el componente
  useEffect(() => {
    const loadClassrooms = async () => {
      try {
        const loadedClassrooms = await fetchClassrooms();
        setClassrooms(loadedClassrooms);
      } catch (error) {
        console.error("Error loading classrooms:", error);
      }
    };
    loadClassrooms();
  }, []);

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
      
      // Obtener el classroomId basado en el className seleccionado
      const selectedClassroom = classrooms.find(c => c.nombreSalon === form.className);
      if (!selectedClassroom) {
        throw new Error("No se encontró el salón seleccionado");
      }
      
      const studentData = {
        ...form,
        classroomId: selectedClassroom.id
      };
      
      await addStudent(studentData);
      setForm(initialFormState);
      alert('Estudiante matriculado exitosamente!');
    } catch (error) {
      console.error('Error al matricular:', error);
      alert('Ocurrió un error al matricular el estudiante');
    } finally {
      setIsSubmitting(false);
    }
  }, [form, classrooms]);

  return { 
    form, 
    error, 
    handleChange, 
    handleBlur, 
    handleSubmit, 
    isSubmitting,
    classrooms // Exponer classrooms para usarlo en el componente
  };
};