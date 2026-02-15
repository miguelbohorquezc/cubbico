import { useEffect, useState } from "react";
import DataTable from "../../components/datatable/DataTable";
import { fetchAreas, deleteArea, updateArea } from "../../../infrastructure/area.service";
import Tooltip from "../../components/toolTip/Tooltip";
import Modal from "../../components/modal/Modal";
import AreaForm from "../../components/areaForm/AreaForm";
import { AreaServiceData } from "../../../shared/types/areaTypes";
import { ClassRoom } from "../../../domain/entities/classRoom";

import editIcon from "../../../assets/datatableIcons/edit.svg";
import trashIcon from "../../../assets/datatableIcons/trash.svg";

const AreaList = () => {
  const [areas, setAreas] = useState<AreaServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingArea, setEditingArea] = useState<AreaServiceData | null>(null);

  // Estados para modales de confirmación y notificación
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

  useEffect(() => {
    const loadAreas = async () => {
      try {
        const areasData = await fetchAreas();
        setAreas(areasData);
      } catch (error) {
        console.error("Error loading areas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAreas();
  }, []);

  const handleDeleteClick = (areaId: string) => {
    console.log('handleDeleteClick called with areaId:', areaId);
    const area = areas.find(a => a.id === areaId);
    console.log('Found area:', area);
    setDeleteConfirm({
      isOpen: true,
      areaId,
      areaName: area ? area.asignatura : 'esta área'
    });
    console.log('deleteConfirm state set to:', { isOpen: true, areaId, areaName: area ? area.asignatura : 'esta área' });
  };

  const handleDeleteConfirm = async () => {
    const { areaId } = deleteConfirm;
    setDeleteConfirm({ isOpen: false, areaId: '', areaName: '' });

    try {
      await deleteArea(areaId);
      setAreas(areas.filter(a => a.id !== areaId));
      setNotification({
        isOpen: true,
        type: 'success',
        message: 'Área eliminada con éxito'
      });
    } catch (error) {
      console.error("Error al eliminar:", error);
      setNotification({
        isOpen: true,
        type: 'error',
        message: 'Error al eliminar área. Por favor intente de nuevo.'
      });
    }
  };

  const handleEdit = (area: AreaServiceData) => {
    setEditingArea(area);
  };

  const handleUpdateArea = async (areaData: AreaServiceData) => {
    try {
      if (!editingArea?.id) return false;

      await updateArea(editingArea.id, areaData);
      setAreas(areas.map(a => a.id === editingArea.id ? { ...a, ...areaData } : a));
      setEditingArea(null);
      setNotification({
        isOpen: true,
        type: 'success',
        message: 'Área actualizada con éxito'
      });
      return true;
    } catch (error) {
      console.error("Error al actualizar:", error);
      setNotification({
        isOpen: true,
        type: 'error',
        message: 'Error al actualizar área. Por favor intente de nuevo.'
      });
      return false;
    }
  };

  const columns = [
    { 
      key: "orden", 
      label: "Orden",
      render: (row: AreaServiceData) => row.orden.toString()
    },
    { 
      key: "asignatura", 
      label: "Asignatura" 
    },
    { 
      key: "area", 
      label: "Área" 
    },
    { 
          key: "nivel", 
          label: "Nivel",
          render: (row: ClassRoom) => {
            let badgeClass = "status-badge";
            
            // Personaliza según el carácter del estudiante si es necesario
            switch(row.nivel?.toLowerCase()) {
              case "preescolar":
                badgeClass += " preescolar-badge";
                break;
              case "primaria":
                badgeClass += " primaria-badge";
                break;
              case "secundaria":
                badgeClass += " secundaria-badge";
                break;
              default:
                badgeClass += " normal-badge";
            }
    
            
              return (
              <p className={badgeClass}>
                {row.nivel.toUpperCase()}
              </p>  )
            
          }   
        },
    { 
      key: "ihs", 
      label: "IHS",
      render: (row: AreaServiceData) => row.ihs.toString()
    },
    { 
      key: 'actions', 
      label: 'Acciones',
      render: (area: AreaServiceData) => (
        <div className="actions-container">
          <Tooltip text="Editar área" position="bottom">
            <img 
              src={editIcon} 
              className="action-icon" 
              alt="edit" 
              onClick={() => handleEdit(area)}
            />
          </Tooltip>
          <Tooltip text="Eliminar área" position="bottom">
            <img
              src={trashIcon}
              className="action-icon"
              alt="delete"
              //@ts-ignore
              onClick={() => handleDeleteClick(area.id)}
            />
          </Tooltip>
        </div>
      )
    }
  ];

  return (
    <>
      <DataTable
        data={areas}
        //@ts-ignore
        columns={columns}
        isLoading={loading}
        exportFileName="areas-academicas"
        enableExport={true}
        enablePagination={true}
        enableSearch={true}
        tableSize={{ width: "100%"}}
      />
      
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

export default AreaList;