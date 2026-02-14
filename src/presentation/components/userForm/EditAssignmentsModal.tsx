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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg max-w-3xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-orchid-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Editar Asignaciones</h3>
                <p className="text-sm text-blue-100">{userName}</p>
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
              <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="mt-4 text-sm font-medium text-gray-700">Cargando datos...</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              {/* Nota para Coordinadores */}
              {isCoordinador && (
                <div className="p-4 bg-magenta-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-magenta-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-medium text-magenta-900 text-sm">Acceso automático para Coordinadores</p>
                      <p className="mt-1 text-sm text-magenta-700">
                        Al seleccionar niveles, se asignarán automáticamente todas las áreas y salones.
                        Para preescolar solo se asignan salones (las asignaturas son internas).
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
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400'
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

              {/* Asignaturas y Salones */}
              {selectedLevels.length > 0 && (
                <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  {/* Asignaturas */}
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center justify-between">
                      <span>Asignaturas ({selectedLevels.join(', ')})</span>
                      {isCoordinador && (
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                          Selección automática
                        </span>
                      )}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-white rounded-lg border border-blue-100">
                      {areas.map(area => {
                        const isPreschoolArea = area.nivel.toLowerCase().includes('preescolar');
                        const isDisabled = isCoordinador;

                        return (
                          <label
                            key={area.id}
                            className={`
                              flex items-center gap-2 p-2 rounded transition-colors
                              ${isPreschoolArea
                                ? 'bg-yellow-50 hover:bg-yellow-100'
                                : 'hover:bg-gray-50'
                              }
                              ${isDisabled ? 'opacity-60' : 'cursor-pointer'}
                            `}
                          >
                            <input
                              type="checkbox"
                              name={area.id}
                              checked={form.areas[area.id] || false}
                              onChange={handleCheckboxChange('areas')}
                              disabled={loading || isDisabled}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                            />
                            <span className="text-sm text-gray-700">
                              {area.asignatura}
                              <span className="text-xs text-gray-500 ml-1">({area.nivel})</span>
                            </span>
                          </label>
                        );
                      })}
                      {areas.length === 0 && (
                        <p className="col-span-2 text-center text-sm text-gray-500 py-4">
                          No hay asignaturas disponibles para los niveles seleccionados
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Salones */}
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center justify-between">
                      <span>Salones ({selectedLevels.join(', ')})</span>
                      {isCoordinador && (
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                          Selección automática
                        </span>
                      )}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-white rounded-lg border border-blue-100">
                      {classRooms.map(salon => {
                        const isDisabled = isCoordinador;

                        return (
                          <label
                            key={salon.id}
                            className={`
                              flex items-center gap-2 p-2 rounded transition-colors
                              hover:bg-gray-50
                              ${isDisabled ? 'opacity-60' : 'cursor-pointer'}
                            `}
                          >
                            <input
                              type="checkbox"
                              name={salon.id}
                              checked={form.salones[salon.id] || false}
                              onChange={handleCheckboxChange('salones')}
                              disabled={loading || isDisabled}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                            />
                            <span className="text-sm text-gray-700">{salon.nombreSalon}</span>
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
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 flex items-center gap-2 font-medium shadow-sm shadow-blue-200"
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
