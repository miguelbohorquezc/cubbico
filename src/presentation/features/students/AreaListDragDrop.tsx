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

  // Estados para modales de confirmación
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; areaId: string; areaName: string }>({
    isOpen: false,
    areaId: '',
    areaName: ''
  });
  const [notification, setNotification] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({
    isOpen: false,
    type: 'success',
    message: ''
  });

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

  const handleDeleteClick = (areaId: string) => {
    const area = areas.find(a => a.id === areaId);
    setDeleteConfirm({
      isOpen: true,
      areaId,
      areaName: area ? area.asignatura : 'esta área'
    });
  };

  const handleDeleteConfirm = async () => {
    const { areaId } = deleteConfirm;
    setDeleteConfirm({ isOpen: false, areaId: '', areaName: '' });

    try {
      await deleteArea(areaId);
      setAreas(prev => prev.filter(a => a.id !== areaId));
      setNotification({
        isOpen: true,
        type: 'success',
        message: 'Asignatura eliminada con éxito'
      });
    } catch (error) {
      console.error('Error al eliminar:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        message: 'Error al eliminar la asignatura. Por favor intente de nuevo.'
      });
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
    <>
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
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}
      </div>

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

      {/* Modal de Confirmación de Eliminación */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-magenta-ds">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Confirmar Eliminación</h3>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-gray-700">
                ¿Estás seguro de que deseas eliminar la asignatura <strong>{deleteConfirm.areaName}</strong>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Esta acción no se puede deshacer.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, areaId: '', areaName: '' })}
                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium shadow-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 bg-magenta-ds text-white rounded-lg hover:bg-magenta-cc transition-all duration-200 font-medium shadow-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Notificación */}
      {notification.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl overflow-hidden">
            {/* Header */}
            <div className={`px-6 py-4 ${notification.type === 'success' ? 'bg-tosca-ds' : 'bg-magenta-ds'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  {notification.type === 'success' ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {notification.type === 'success' ? 'Éxito' : 'Error'}
                  </h3>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-gray-700">{notification.message}</p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setNotification({ isOpen: false, type: 'success', message: '' })}
                className={`px-5 py-2.5 text-white rounded-lg transition-all duration-200 font-medium shadow-sm ${
                  notification.type === 'success' ? 'bg-tosca-ds hover:bg-tosca-cc' : 'bg-orchid-blue-60 hover:bg-orchid-blue-70'
                }`}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AreaListDragDrop;
