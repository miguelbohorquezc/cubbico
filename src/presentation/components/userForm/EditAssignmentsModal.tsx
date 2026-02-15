import { useEditAssignments } from './useEditAssignments';

interface EditAssignmentsModalProps {
  userId: string;
  userName: string;
  userRole: string;
  onClose: () => void;
  onSuccess: () => void;
}

const EditAssignmentsModal = ({ userId, userName, userRole, onClose, onSuccess }: EditAssignmentsModalProps) => {
  const {
    form,
    loading,
    initializing,
    error,
    areas,
    classRooms,
    selectedLevels,
    isCoordinador,
    handleCheckboxChange,
    handleSubmit,
    toggleNivelEducativo
  } = useEditAssignments(userId, userRole);

  const onSubmit = async (e: React.FormEvent) => {
    const success = await handleSubmit(e);
    if (success) {
      onSuccess();
      onClose();
    }
  };

  // Helper para obtener estilos según nivel educativo
  const getNivelStyles = (nivel: string) => {
    const nivelLower = nivel.toLowerCase();
    if (nivelLower.includes('primaria')) {
      return {
        bg: 'bg-tosca-ds/10',
        border: 'border-tosca-ds/30',
        hover: 'hover:bg-tosca-ds/20',
        text: 'text-tosca-cc'
      };
    }
    if (nivelLower.includes('secundaria')) {
      return {
        bg: 'bg-magenta-ds/10',
        border: 'border-magenta-ds/30',
        hover: 'hover:bg-magenta-ds/20',
        text: 'text-magenta-cc'
      };
    }
    // Default (preescolar u otros)
    return {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      hover: 'hover:bg-gray-100',
      text: 'text-gray-700'
    };
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg max-w-3xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-orchid-blue-60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Editar Asignaciones</h3>
                <p className="text-sm text-white/90">{userName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {initializing ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-orchid-blue-60 rounded-full animate-spin"></div>
              <p className="mt-4 text-sm font-medium text-gray-700">Cargando datos...</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              {/* Mensaje de Error */}
              {error && (
                <div className="p-4 bg-magenta-ds/10 border border-magenta-ds/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-magenta-ds flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-magenta-cc font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Nota para Coordinadores */}
              {isCoordinador && (
                <div className="p-4 bg-orchid-blue-5 border border-orchid-blue-30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-orchid-blue-60 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-medium text-orchid-blue-70 text-sm">Selección de asignaciones</p>
                      <p className="mt-1 text-sm text-gray-700">
                        Seleccione manualmente los salones y asignaturas que desea asignar.
                        Nota: Las asignaturas de preescolar no aparecen porque se evalúan de forma diferente.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Niveles Educativos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niveles Educativos *
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['Preescolar', 'Primaria', 'Secundaria'] as const).map(nivel => (
                    <button
                      type="button"
                      key={nivel}
                      onClick={() => toggleNivelEducativo(nivel)}
                      disabled={loading}
                      className={`
                        px-4 py-2 rounded-full text-sm font-medium transition-all
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${selectedLevels.includes(nivel)
                          ? 'bg-orchid-blue-60 text-white shadow-md hover:bg-orchid-blue-70'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-orchid-blue-40'
                        }
                      `}
                    >
                      {nivel}
                      {selectedLevels.includes(nivel) && (
                        <span className="ml-2">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Leyenda de Colores */}
              {selectedLevels.length > 0 && (
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-gray-600 font-medium">Código de colores:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-tosca-ds/20 border border-tosca-ds/30"></div>
                    <span className="text-tosca-cc font-medium">Primaria</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-magenta-ds/20 border border-magenta-ds/30"></div>
                    <span className="text-magenta-cc font-medium">Secundaria</span>
                  </div>
                </div>
              )}

              {/* Asignaturas y Salones */}
              {selectedLevels.length > 0 && (
                <div className="space-y-4 p-4 bg-orchid-blue-5 border border-orchid-blue-30 rounded-lg">
                  {/* Asignaturas */}
                  <div>
                    <h4 className="text-sm font-medium text-orchid-blue-70 mb-2">
                      Asignaturas ({selectedLevels.join(', ')})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto p-3 bg-white rounded-lg border border-orchid-blue-30">
                      {areas
                        .filter(area => !area.nivel.toLowerCase().includes('preescolar'))
                        .map(area => {
                          const styles = getNivelStyles(area.nivel);
                          return (
                            <label
                              key={area.id}
                              className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${styles.bg} ${styles.border} ${styles.hover}`}
                            >
                              <input
                                type="checkbox"
                                name={area.id}
                                checked={form.areas[area.id] || false}
                                onChange={handleCheckboxChange('areas')}
                                disabled={loading}
                                className="w-5 h-5 rounded border-gray-300 text-orchid-blue-60 focus:ring-orchid-blue-50 cursor-pointer"
                              />
                              <span className="text-sm text-gray-700">
                                {area.asignatura}
                                <span className={`text-xs ${styles.text} ml-1 font-medium`}>({area.nivel})</span>
                              </span>
                            </label>
                          );
                        })}
                      {areas.filter(area => !area.nivel.toLowerCase().includes('preescolar')).length === 0 && (
                        <p className="col-span-2 text-center text-sm text-gray-500 py-4">
                          {selectedLevels.includes('Preescolar') && selectedLevels.length === 1
                            ? 'Preescolar no requiere asignación de asignaturas'
                            : 'No hay asignaturas disponibles para los niveles seleccionados'
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Salones */}
                  <div>
                    <h4 className="text-sm font-medium text-orchid-blue-70 mb-2">
                      Salones ({selectedLevels.join(', ')})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto p-3 bg-white rounded-lg border border-orchid-blue-30">
                      {classRooms.map(salon => {
                        const styles = getNivelStyles(salon.nivel);
                        return (
                          <label
                            key={salon.id}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${styles.bg} ${styles.border} ${styles.hover}`}
                          >
                            <input
                              type="checkbox"
                              name={salon.id}
                              checked={form.salones[salon.id] || false}
                              onChange={handleCheckboxChange('salones')}
                              disabled={loading}
                              className="w-5 h-5 rounded border-gray-300 text-orchid-blue-60 focus:ring-orchid-blue-50 cursor-pointer"
                            />
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-700 font-medium">{salon.nombreSalon}</span>
                              <span className={`text-xs ${styles.text}`}>{salon.nivel}</span>
                            </div>
                          </label>
                        );
                      })}
                      {classRooms.length === 0 && (
                        <p className="col-span-2 text-center text-sm text-gray-500 py-4">
                          No hay salones disponibles para los niveles seleccionados
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 font-medium shadow-sm"
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            disabled={loading || initializing}
            className="px-5 py-2.5 bg-orchid-blue-60 text-white rounded-lg hover:bg-orchid-blue-70 transition-all duration-200 disabled:opacity-50 flex items-center gap-2 font-medium shadow-sm"
          >
            {loading && (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAssignmentsModal;
