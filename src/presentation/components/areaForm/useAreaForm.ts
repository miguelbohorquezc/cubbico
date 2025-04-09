import { useState, useCallback, FormEvent } from 'react';
import { AreaFormState, AreaServiceData } from '../../../shared/types/areaTypes';
import { addArea, updateArea } from '../../../infrastructure/area.service';
import { validationsForm } from './formConfig';

const initialFormState: AreaFormState = {
    orden: '',
    asignatura: '',
    ihs: '',
    area: '',
    nivel: ''
};

interface UseAreaFormProps {
  initialData?: AreaFormState;
  onSubmit?: (formData: AreaServiceData) => Promise<boolean> | void;
}

export const useAreaForm = ({ initialData, onSubmit }: UseAreaFormProps = {}) => {
  const [form, setForm] = useState<AreaFormState>(initialData || initialFormState);
  const [error, setError] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parseAreaData = useCallback((formData: AreaFormState): Omit<AreaServiceData, 'id'> & { id?: string } => {
    const baseData = {
      orden: Number(formData.orden) || 0,
      asignatura: formData.asignatura.trim(),
      ihs: Number(formData.ihs) || 0,
      area: formData.area.trim(),
      nivel: formData.nivel
    };
    
    // Solo incluye id si existe en el formulario
    return formData.id ? { ...baseData, id: formData.id } : baseData;
  }, []);

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
        const errors = validationsForm(form);
        if (Object.keys(errors).length > 0) {
          setError(errors);
          return false;
        }
    
        const areaData = parseAreaData(form);
        
        if (form.id) {
          // Modo edición
          if (onSubmit) {
            return await onSubmit(areaData);
          }
          await updateArea(form.id, areaData);
          alert('Área actualizada exitosamente!');
        } else {
          // Modo creación
          if (onSubmit) {
            return await onSubmit(areaData);
          }
          await addArea(areaData);
          alert('Área creada exitosamente!');
          setForm(initialFormState); // Resetear solo en creación
        }
        
        return true;
      } catch (error) {
        console.error('Error:', error);
        alert(`Error al ${form.id ? 'actualizar' : 'crear'} el área`);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    }, [form, parseAreaData, onSubmit]);

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