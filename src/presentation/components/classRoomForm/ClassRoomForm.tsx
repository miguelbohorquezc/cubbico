// ClassRoomForm.tsx
import { IconDoor, IconLoader2 } from '@tabler/icons-react';
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
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Nivel académico */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Nivel académico <span className="text-red-500">*</span>
          </label>
          <FormField
            type="select"
            name="nivel"
            value={form.nivel}
            options={SELECT_OPTIONS.nivel}
            placeholder="Selecciona el nivel"
            error={error.nivel}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </div>

        {/* 2. Nombre del salón */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Nombre del salón <span className="text-red-500">*</span>
          </label>
          <FormField
            type="text"
            name="nombreSalon"
            value={form.nombreSalon}
            placeholder="Ej: Primero A, Segundo B"
            error={error.nombreSalon}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </div>

        {/* 3. Director de grupo */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Director de grupo <span className="text-red-500">*</span>
          </label>
          {!form.nivel ? (
            <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-400 italic">
                Seleccione primero el nivel académico
              </p>
            </div>
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
              placeholder="Nombre del director de grupo"
              error={error.directorGrupo}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          )}
        </div>

        {/* Botón submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              w-full flex items-center justify-center gap-2
              px-4 py-2.5
              text-sm font-semibold text-white
              rounded-lg
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2
              ${isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-tosca hover:bg-orchid-blue-60 focus:ring-tosca/30 shadow-md hover:shadow-lg'
              }
            `}
          >
            {isSubmitting ? (
              <>
                <IconLoader2 size={18} className="animate-spin" />
                {initialData ? 'Actualizando...' : 'Creando...'}
              </>
            ) : (
              <>
                <IconDoor size={18} />
                {initialData ? 'Actualizar Salón' : 'Crear Salón'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClassRoomForm;