// ClassRoomForm.tsx
import { useState, useEffect, useMemo } from 'react';
import { IconDoor, IconX } from '@tabler/icons-react';
import { useClassRoomForm } from './useClassRoomForm';
import { FormField } from '../../../shared/utils/FormField';
import { SELECT_OPTIONS } from './formConfig';
import { SalonFormState, DocenteOption, DocentesMap } from '../../../shared/types/classRoomTypes';
import DirectorSelector from './DirectorSelector';
import Button from '../ui/Button';
import Toast from '../common/Toast';
import { fetchAllUsers } from '../../../infrastructure/user.service';

interface ClassRoomFormProps {
  initialData?: SalonFormState;
  onSubmit?: (formData: SalonFormState) => void;
}

const ClassRoomForm = ({ initialData, onSubmit }: ClassRoomFormProps) => {
  const {
    form,
    error,
    handleChange,
    handleBlur,
    handleSubmit,
    submitForm,
    isSubmitting,
    handleDirectorChange
  } = useClassRoomForm(initialData);

  // Estado para docentes
  const [docentes, setDocentes] = useState<DocenteOption[]>([]);

  // Cargar docentes
  useEffect(() => {
    const loadDocentes = async () => {
      try {
        const docentesData = await fetchAllUsers();
        setDocentes(docentesData);
      } catch (error) {
        console.error("Error loading docentes:", error);
      }
    };
    loadDocentes();
  }, []);

  // Mapa de docentes para búsqueda rápida por ID
  const docentesMap: DocentesMap = useMemo(() => {
    return docentes.reduce((map, docente) => {
      map[docente.id] = docente;
      return map;
    }, {} as DocentesMap);
  }, [docentes]);

  // Función para obtener el nombre del director
  const getDirectorName = (directorId: string): string => {
    const docente = docentesMap[directorId];
    if (docente) {
      return docente.displayName || docente.email;
    }
    return directorId || 'No asignado';
  };

  // Modal de confirmación
  const [modalConfirmOpen, setModalConfirmOpen] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // Handle form submission (validates and opens modal)
  const onFormSubmit = async (e: React.FormEvent) => {
    const isValid = handleSubmit(e);

    // If validation passed, open modal
    if (isValid) {
      setModalConfirmOpen(true);
    }
  };

  // Handle modal confirmation
  const handleModalConfirm = async () => {
    try {
      await submitForm();
      setModalConfirmOpen(false);

      // Show success toast
      showToast(
        initialData
          ? `Salón ${form.nombreSalon} actualizado exitosamente`
          : `Salón ${form.nombreSalon} creado exitosamente`,
        'success'
      );

      // Call parent onSubmit callback
      if (onSubmit) {
        onSubmit(form);
      }
    } catch (error) {
      console.error('Error submitting:', error);
      showToast('Error al guardar el salón. Por favor, intenta de nuevo.', 'error');
    }
  };

  return (
    <>
      <div className="w-full max-w-2xl mx-auto">
        <form onSubmit={onFormSubmit} className="space-y-5">
        {/* 1. Nivel académico */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-deep-blue-800">
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
          <label className="block text-sm font-medium text-deep-blue-800">
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
          <label className="block text-sm font-medium text-deep-blue-800">
            Director de grupo <span className="text-red-500">*</span>
          </label>
          {!form.nivel ? (
            <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-400 italic">
                Seleccione primero el nivel académico
              </p>
            </div>
          ) : (
            <DirectorSelector
              value={form.directorGrupo}
              onChange={handleDirectorChange}
              error={error.directorGrupo}
            />
          )}
        </div>

        {/* Botón submit */}
        <div className="pt-4 mt-4 border-t border-light-gray-200">
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isSubmitting}
            disabled={isSubmitting}
            fullWidth
            leftIcon={!isSubmitting ? <IconDoor size={18} /> : undefined}
          >
            {isSubmitting
              ? (initialData ? 'Actualizando...' : 'Creando...')
              : (initialData ? 'Actualizar Salón' : 'Crear Salón')
            }
          </Button>
        </div>
      </form>
    </div>

    {/* Modal de confirmación */}
    {modalConfirmOpen && (
      <div className="fixed inset-0 z-[60] overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
          <div className="relative w-full max-w-xl bg-white rounded-lg shadow-2xl transform transition-all overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-orchid-blue-60 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <IconDoor size={20} className="text-white" />
                </div>
                <h2 className="text-lg font-semibold text-white">
                  {initialData ? 'Confirmar actualización' : 'Confirmar creación'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => !isSubmitting && setModalConfirmOpen(false)}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-all"
                disabled={isSubmitting}
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <div className="space-y-3">
                {/* Card de información */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {/* Header */}
                  <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
                    <h3 className="text-base font-semibold text-gray-900">
                      {form.nombreSalon}
                    </h3>
                    <p className="text-sm text-gray-600 mt-0.5">
                      Nivel: {form.nivel}
                    </p>
                  </div>

                  {/* Detalles */}
                  <div className="p-4 space-y-2.5">
                    {/* Nivel */}
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-orchid-blue-10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-orchid-blue-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Nivel académico</p>
                        <p className="text-sm font-medium text-gray-900">{form.nivel}</p>
                      </div>
                    </div>

                    <div className="border-t border-gray-100"></div>

                    {/* Director */}
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-tosca-ds/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-tosca-cc" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Director de grupo</p>
                        <p className="text-sm font-medium text-gray-900">{getDirectorName(form.directorGrupo)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-2.5 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalConfirmOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleModalConfirm}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    leftIcon={!isSubmitting ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : undefined}
                  >
                    {isSubmitting ? 'Guardando...' : 'Confirmar'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Toast notification */}
    <Toast
      message={toast.message}
      type={toast.type}
      isVisible={toast.isVisible}
      onClose={hideToast}
    />
  </>
  );
};

export default ClassRoomForm;