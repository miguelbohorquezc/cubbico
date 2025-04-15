// ClassRoomForm.tsx
//@ts-ignore
import { FormEvent } from 'react';
import './ClassRoomForm.css';
import { useClassRoomForm } from './useClassRoomForm';
import { FormField } from '../../../shared/utils/FormField';
import { SELECT_OPTIONS } from './formConfig';
import { SalonFormState } from '../../../shared/types/classRoomTypes';

interface ClassRoomFormProps {
  initialData?: SalonFormState;
  onSubmit?: (formData: SalonFormState) => void;
}

//@ts-ignore
const ClassRoomForm = ({ initialData, onSubmit }: ClassRoomFormProps) => {
  const { 
    form, 
    error, 
    handleChange, 
    handleBlur, 
    handleSubmit, 
    isSubmitting 
  } = useClassRoomForm(initialData);

  return (
    <div className="classroom-form-container">
      <form className='student-form' onSubmit={handleSubmit}>
        <h2 className="form-title">
          {initialData ? 'Editar Salón' : 'Crear Nuevo Salón'}
        </h2>

        <FormField
          type="select"
          name="identificador"
          value={form.identificador}
          options={SELECT_OPTIONS.identificador}
          placeholder="Identificador numérico"
          error={error.identificador}
          onChange={handleChange}
          onBlur={handleBlur}
        />

        <FormField
          type="text"
          name="directorGrupo"
          value={form.directorGrupo}
          placeholder="Director de grupo"
          error={error.directorGrupo}
          onChange={handleChange}
          onBlur={handleBlur}
        />

        <FormField
          type="select"
          name="nombreSalon"
          value={form.nombreSalon}
          options={SELECT_OPTIONS.nombreSalon}
          placeholder="Nombre del salón"
          error={error.nombreSalon}
          onChange={handleChange}
          onBlur={handleBlur}
        />

        <FormField
          type="select"
          name="nivel"
          value={form.nivel}
          options={SELECT_OPTIONS.nivel}
          placeholder="Nivel académico"
          error={error.nivel}
          onChange={handleChange}
          onBlur={handleBlur}
        />

        <button 
          type="submit" 
          className="submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting 
            ? (initialData ? 'Actualizando...' : 'Creando...') 
            : (initialData ? 'Actualizar Salón' : 'Crear Salón')}
        </button>
      </form>
    </div>
  );
};

export default ClassRoomForm;