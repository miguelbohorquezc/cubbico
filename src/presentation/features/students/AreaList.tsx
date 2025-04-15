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

  const handleDelete = async (areaId: string) => {
    if (window.confirm("¿Estás seguro de eliminar esta área?")) {
      try {
        await deleteArea(areaId);
        setAreas(areas.filter(a => a.id !== areaId));
        alert("Área eliminada con éxito");
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Error al eliminar área");
      }
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
      alert("Área actualizada con éxito");
      return true;
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("Error al actualizar área");
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
              onClick={() => handleDelete(area.id)}
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
    </>
  );
};

export default AreaList;