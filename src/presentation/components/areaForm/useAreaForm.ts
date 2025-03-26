import { useState, useCallback, FormEvent } from 'react';
import { AreaFormState, AreaServiceData } from '../../../shared/types/areaTypes';
import { addArea } from '../../../infrastructure/area.service';
import { validationsForm } from './formConfig';

const initialFormState: AreaFormState = {
    orden: '',
    asignatura: '',
    ihs: '',
    area: '',
    nivel: ''
};

export const useAreaForm = () => {
  const [form, setForm] = useState<AreaFormState>(initialFormState);
  const [error, setError] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Función para convertir los datos del formulario al tipo del servicio
  const parseAreaData = useCallback((formData: AreaFormState): AreaServiceData => ({
    id: formData.id,
    orden: Number(formData.orden) || 0,
    asignatura: formData.asignatura.trim(),
    ihs: Number(formData.ihs) || 0,
    area: formData.area.trim(),
    nivel: formData.nivel
  }), []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setForm(prev => ({ ...prev, [name]: value }));
      setError(prev => ({ ...prev, [name]: '' }));
    }, []);

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;

      //@ts-ignore
      const errors = validationsForm(form);
      setError(prev => ({ 
        ...prev, 
        [name]: validationsForm({ ...form, [name]: value })[name] || '' 
      }));
    }, [form]);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validación completa del formulario
      const errors = validationsForm(form);
      if (Object.keys(errors).length > 0) {
        setError(errors);
        return;
      }

      // Conversión de tipos y limpieza de datos
      const areaData = parseAreaData(form);
      
      // Llamada al servicio
      await addArea(areaData);
      
      // Manejo de feedback
      const action = form.id ? 'actualizada' : 'registrada';
      setForm(initialFormState);
      alert(`Área ${areaData.asignatura} ${action} exitosamente!`);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar el área. Por favor intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  }, [form, parseAreaData]);

  // Función para cargar datos en modo edición
  const loadAreaForEdit = useCallback((area: AreaServiceData) => {
    setForm({
      id: area.id,
      orden: area.orden.toString(),
      asignatura: area.asignatura,
      ihs: area.ihs.toString(),
      area: area.area,
      nivel: area.nivel
    });
  }, []);

  return { 
    form, 
    error, 
    handleChange, 
    handleBlur, 
    handleSubmit, 
    isSubmitting, 
    loadAreaForEdit 
  };
};