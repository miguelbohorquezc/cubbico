import { useEffect, useState } from 'react';
import {
  IconCheck,
  IconAlertCircle,
  IconInfoCircle,
  IconLoader2,
  IconAlertTriangle,
  IconBooks
} from '@tabler/icons-react';
import { fetchAreas, deleteArea, updateArea } from '../../../infrastructure/area.service';
import { AreaServiceData, NivelDragDrop, AreaWithDragProps } from '../../../shared/types/areaTypes';
import { useDragDropAreas } from './hooks/useDragDropAreas';
import DraggableAreaRow from './components/DraggableAreaRow';
import Modal from '../../components/modal/Modal';
import AreaForm from '../../components/areaForm/AreaForm';

const NIVELES: NivelDragDrop[] = ['primaria', 'secundaria'];

/**
 * Configuración de colores por nivel
 */
const NIVEL_CONFIG: Record<string, { bg: string; bgActive: string; text: string; border: string; label: string; alertBg: string; alertBorder: string; alertIcon: string; alertText: string }> = {
  'primaria': {
    bg: 'bg-tosca-ds/10',
    bgActive: 'bg-tosca-ds',
    text: 'text-tosca-cc',
    border: 'border-tosca-ds/30',
    label: 'Primaria',
    alertBg: 'bg-yellow-ds/10',
    alertBorder: 'border-yellow-ds/30',
    alertIcon: 'text-yellow-cc',
    alertText: 'text-yellow-cc'
  },
  'secundaria': {
    bg: 'bg-magenta-ds/10',
    bgActive: 'bg-magenta-ds',
    text: 'text-magenta-cc',
    border: 'border-magenta-ds/30',
    label: 'Secundaria',
    alertBg: 'bg-magenta-ds/10',
    alertBorder: 'border-magenta-ds/30',
    alertIcon: 'text-magenta-cc',
    alertText: 'text-magenta-cc'
  }
};

const AreaListDragDrop = () => {
  const [areas, setAreas] = useState<AreaServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNivel, setSelectedNivel] = useState<NivelDragDrop>('primaria');
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
      loadAreas();
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
      setSuccessMessage('Asignatura eliminada correctamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error al eliminar:', error);
      setErrorMessage('Error al eliminar la asignatura');
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
      setSuccessMessage('Asignatura actualizada correctamente');
      setTimeout(() => setSuccessMessage(null), 3000);
      return true;
    } catch (error) {
      console.error('Error al actualizar:', error);
      setErrorMessage('Error al actualizar la asignatura');
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
        <div className="flex items-center gap-3 px-4 py-3 bg-tosca/10 border border-tosca-200 text-tosca-800 rounded-lg animate-fade-in">
          <IconCheck size={20} className="flex-shrink-0" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 text-red-800 rounded-lg animate-fade-in">
          <IconAlertCircle size={20} className="flex-shrink-0" />
          <span className="text-sm font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Tabs de nivel */}
      <div className="flex flex-wrap gap-2">
        {NIVELES.map(nivel => {
          const isActive = selectedNivel === nivel;
          const config = NIVEL_CONFIG[nivel];
          const count = countByNivel(nivel);

          return (
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
                inline-flex items-center gap-2
                px-4 py-2.5 rounded-lg
                text-sm font-medium
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2
                ${isActive
                  ? `${config.bgActive} text-white shadow-md`
                  : `${config.bg} ${config.text} hover:shadow-sm focus:ring-gray-200`
                }
              `}
            >
              {config.label}
              <span className={`
                px-2 py-0.5 rounded-full text-xs font-semibold
                ${isActive ? 'bg-white/20 text-white' : `${config.bg} ${config.text} border ${config.border}`}
              `}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Instrucciones */}
      <div className={`flex items-start gap-3 px-4 py-3 ${NIVEL_CONFIG[selectedNivel].alertBg} border ${NIVEL_CONFIG[selectedNivel].alertBorder} rounded-lg`}>
        <IconInfoCircle size={20} className={`${NIVEL_CONFIG[selectedNivel].alertIcon} flex-shrink-0 mt-0.5`} />
        <div className={`text-sm ${NIVEL_CONFIG[selectedNivel].alertText}`}>
          <span className="font-medium">Instrucciones:</span> Arrastra las asignaturas para cambiar su orden.
          El orden define cómo aparecerán en los informes académicos.
        </div>
      </div>

      {/* Barra de acciones - cambios pendientes */}
      {hasChanges && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg animate-fade-in">
          <IconAlertTriangle size={20} className="text-amber-600 flex-shrink-0" />
          <span className="text-sm text-amber-800 flex-1 font-medium">
            Tienes cambios pendientes por guardar
          </span>
          <button
            type="button"
            onClick={discardChanges}
            disabled={isSaving}
            className="
              px-3 py-1.5 text-sm font-medium
              text-gray-600 hover:text-gray-800
              hover:bg-white rounded-lg
              transition-colors
              disabled:opacity-50
            "
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSaveOrder}
            disabled={isSaving}
            className="
              inline-flex items-center gap-2
              px-4 py-1.5 text-sm font-medium
              bg-magenta-500 text-white rounded-lg
              hover:bg-magenta-600
              disabled:opacity-50
              transition-colors
            "
          >
            {isSaving ? (
              <>
                <IconLoader2 size={16} className="animate-spin" />
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
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <IconLoader2 size={32} className="animate-spin mb-3" />
          <p className="text-sm">Cargando asignaturas...</p>
        </div>
      ) : orderedAreas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <IconBooks size={48} stroke={1} className="mb-3" />
          <p className="text-sm font-medium">No hay asignaturas registradas</p>
          <p className="text-xs mt-1">para {NIVEL_CONFIG[selectedNivel].label}</p>
        </div>
      ) : (
        <div
          className="space-y-2"
          role="list"
          aria-label={`Asignaturas de ${NIVEL_CONFIG[selectedNivel].label}`}
        >
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
        title="Editar Asignatura"
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
