import { useEffect, useState } from 'react';
import { fetchAreas, deleteArea, updateArea } from '../../../infrastructure/area.service';
import { AreaServiceData, NivelDragDrop, AreaWithDragProps } from '../../../shared/types/areaTypes';
import { useDragDropAreas } from './hooks/useDragDropAreas';
import DraggableAreaRow from './components/DraggableAreaRow';
import Modal from '../../components/modal/Modal';
import AreaForm from '../../components/areaForm/AreaForm';

const NIVELES: NivelDragDrop[] = ['primaria', 'secundaria'];

const AreaListDragDrop = () => {
  const [areas, setAreas] = useState<AreaServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNivel, setSelectedNivel] = useState<NivelDragDrop>('Primaria');
  const [editingArea, setEditingArea] = useState<AreaServiceData | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Hook de drag & drop
  const {
    orderedAreas,
    handlers,
    isSaving,
    hasChanges,
    saveOrder,
    discardChanges
  } = useDragDropAreas({
    areas,
    nivel: selectedNivel,
    onReorderSuccess: () => {
      setSuccessMessage('Orden guardado correctamente');
      loadAreas(); // Recargar para sincronizar
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onReorderError: (error) => {
      setErrorMessage(error.message);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  });

  const loadAreas = async () => {
    try {
      setLoading(true);
      const areasData = await fetchAreas();
      setAreas(areasData);
    } catch (error) {
      console.error('Error loading areas:', error);
      setErrorMessage('Error al cargar las asignaturas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAreas();
  }, []);

  const handleDelete = async (areaId: string) => {
    try {
      await deleteArea(areaId);
      setAreas(prev => prev.filter(a => a.id !== areaId));
      setSuccessMessage('Área eliminada correctamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error al eliminar:', error);
      setErrorMessage('Error al eliminar el área');
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleEdit = (area: AreaWithDragProps) => {
    setEditingArea(area);
  };

  const handleUpdateArea = async (areaData: AreaServiceData) => {
    try {
      if (!editingArea?.id) return false;

      await updateArea(editingArea.id, areaData);
      setAreas(prev => prev.map(a => a.id === editingArea.id ? { ...a, ...areaData } : a));
      setEditingArea(null);
      setSuccessMessage('Área actualizada correctamente');
      setTimeout(() => setSuccessMessage(null), 3000);
      return true;
    } catch (error) {
      console.error('Error al actualizar:', error);
      setErrorMessage('Error al actualizar el área');
      setTimeout(() => setErrorMessage(null), 5000);
      return false;
    }
  };

  const handleSaveOrder = async () => {
    try {
      await saveOrder();
    } catch {
      // Error ya manejado en el callback
    }
  };

  // Contador de áreas por nivel
  const countByNivel = (nivel: NivelDragDrop) =>
    areas.filter(a => a.nivel === nivel).length;

  return (
    <div className="space-y-4">
      {/* Mensajes de feedback */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {errorMessage}
        </div>
      )}

      {/* Tabs de nivel */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {NIVELES.map(nivel => (
          <button
            key={nivel}
            type="button"
            onClick={() => {
              if (hasChanges) {
                if (window.confirm('Tienes cambios sin guardar. ¿Deseas descartarlos?')) {
                  discardChanges();
                  setSelectedNivel(nivel);
                }
              } else {
                setSelectedNivel(nivel);
              }
            }}
            className={`
              px-4 py-2 rounded-t-lg font-medium text-sm transition-colors
              ${selectedNivel === nivel
                ? 'bg-deepBlue text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            {nivel.charAt(0).toUpperCase() + nivel.slice(1)}
            <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
              {countByNivel(nivel)}
            </span>
          </button>
        ))}
      </div>

      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
        <strong>Instrucciones:</strong> Arrastra las asignaturas para cambiar su orden.
        El orden define cómo aparecerán en los informes académicos.
      </div>

      {/* Barra de acciones */}
      {hasChanges && (
        <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 px-4 py-3 rounded-lg">
          <span className="text-yellow-800 text-sm flex-1">
            Tienes cambios pendientes por guardar
          </span>
          <button
            type="button"
            onClick={discardChanges}
            disabled={isSaving}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSaveOrder}
            disabled={isSaving}
            className="px-4 py-1.5 bg-deepBlue text-white text-sm rounded hover:bg-mediumBlue disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Guardando...
              </>
            ) : (
              'Guardar orden'
            )}
          </button>
        </div>
      )}

      {/* Lista de áreas */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deepBlue" />
        </div>
      ) : orderedAreas.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No hay asignaturas registradas para {selectedNivel.charAt(0).toUpperCase() + selectedNivel.slice(1)}
        </div>
      ) : (
        <div className="space-y-2" role="list" aria-label={`Asignaturas de ${selectedNivel.charAt(0).toUpperCase() + selectedNivel.slice(1)}`}>
          {orderedAreas.map((area, index) => (
            <DraggableAreaRow
              key={area.id}
              area={area}
              index={index}
              handlers={handlers}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal de edición */}
      <Modal
        isOpen={!!editingArea}
        onClose={() => setEditingArea(null)}
        title="Editar Área"
      >
        {editingArea && (
          <AreaForm
            initialData={{
              id: editingArea.id,
              orden: editingArea.orden.toString(),
              asignatura: editingArea.asignatura,
              ihs: editingArea.ihs.toString(),
              area: editingArea.area,
              nivel: editingArea.nivel
            }}
            onSubmit={handleUpdateArea}
          />
        )}
      </Modal>
    </div>
  );
};

export default AreaListDragDrop;
