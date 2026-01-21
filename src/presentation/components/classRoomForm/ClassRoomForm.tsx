// ClassRoomForm.tsx
import './ClassRoomForm.css';
import { useClassRoomForm } from './useClassRoomForm';
import { FormField } from '../../../shared/utils/FormField';
import { SELECT_OPTIONS } from './formConfig';
import { SalonFormState } from '../../../shared/types/classRoomTypes';
import DirectorSelector from './DirectorSelector';

interface ClassRoomFormProps {
  initialData?: SalonFormState;
  onSubmit?: (formData: SalonFormState) => void;
}

const ClassRoomForm = ({ initialData }: ClassRoomFormProps) => {
  const {
    form,
    error,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    handleDirectorChange
  } = useClassRoomForm(initialData);

  // Determinar si mostrar el selector de director (solo para Primaria y Secundaria)
  const showDirectorSelector = form.nivel === 'Primaria' || form.nivel === 'Secundaria';

  return (
    <div className="classroom-form-container">
      <form className='student-form' onSubmit={handleSubmit}>
        <h2 className="form-title">
          {initialData ? 'Editar Salón' : 'Crear Nuevo Salón'}
        </h2>

        {/* 1. Nivel académico - PRIMERO para determinar el tipo de selector de director */}
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

        {/* 2. Nombre del salón - Campo de texto libre */}
        <FormField
          type="text"
          name="nombreSalon"
          value={form.nombreSalon}
          placeholder="Nombre del salón (ej: Primero A, Segundo B)"
          error={error.nombreSalon}
          onChange={handleChange}
          onBlur={handleBlur}
        />

        {/* 4. Director de grupo - Selector para Primaria/Secundaria, texto para Preescolar */}
        <div className="form-group">
          <label className="input-label">Director de grupo</label>
          {!form.nivel ? (
            <p className="text-sm text-gray-500 italic py-2">
              Seleccione primero el nivel académico
            </p>
          ) : showDirectorSelector ? (
            <DirectorSelector
              value={form.directorGrupo}
              onChange={handleDirectorChange}
              error={error.directorGrupo}
            />
          ) : (
            <FormField
              type="text"
              name="directorGrupo"
              value={form.directorGrupo}
              placeholder="Director de grupo"
              error={error.directorGrupo}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          )}
        </div>

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