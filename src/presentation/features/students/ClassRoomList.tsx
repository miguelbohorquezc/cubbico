//@ts-ignore
import React, { useEffect, useState } from "react";
import DataTable from "../../components/datatable/DataTable";
import { fetchClassrooms, deleteClassroom, updateClassroom } from "../../../infrastructure/classRoom.service";
import Tooltip from "../../components/toolTip/Tooltip";
import Modal from "../../components/modal/Modal";
import { ClassRoom } from "../../../domain/entities/classRoom";
import ClassRoomForm from "../../components/classRoomForm/ClassRoomForm";

import editIcon from "../../../assets/datatableIcons/edit.svg";
import trashIcon from "../../../assets/datatableIcons/trash.svg";

const ClassRoomList = () => {
  const [classrooms, setClassrooms] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingClassroom, setEditingClassroom] = useState<ClassRoom | null>(null);

  useEffect(() => {
    const loadClassrooms = async () => {
      try {
        const classroomsData = await fetchClassrooms();
        setClassrooms(classroomsData);
      } catch (error) {
        console.error("Error loading classrooms:", error);
      } finally {
        setLoading(false);
      }
    };

    loadClassrooms();
  }, []);

  const handleDelete = async (classroomId: string) => {
    if (window.confirm("¿Estás seguro de eliminar este salón?")) {
      try {
        await deleteClassroom(classroomId);
        setClassrooms(classrooms.filter(c => c.id !== classroomId));
        alert("Salón eliminado con éxito");
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Error al eliminar salón");
      }
    }
  };

  const handleEdit = (classroom: ClassRoom) => {
    setEditingClassroom(classroom);
  };

  const handleUpdateClassroom = async (updatedData: ClassRoom) => {
    try {
      await updateClassroom(updatedData.id, updatedData);
      setClassrooms(classrooms.map(c => c.id === updatedData.id ? updatedData : c));
      setEditingClassroom(null);
      alert("Salón actualizado con éxito");
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("Error al actualizar salón");
    }
  };

  const columns = [
    { 
      key: "identificador", 
      label: "Identificador",
      render: (row: ClassRoom) => (
        <p className="classroom-identifier">
          {row.identificador}
        </p>
      )
    },
    { 
      key: "nombreSalon", 
      label: "Nombre del Salón",
      render: (row: ClassRoom) => (
        <p>
          {row.nombreSalon.toUpperCase()}
        </p>
      )
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
      key: "directorGrupo", 
      label: "Director de Grupo",
      render: (row: ClassRoom) => (
        <p className="classroom-director">
          {row.directorGrupo.toUpperCase()}
        </p>
      )
    },
    { 
      key: 'actions', 
      label: 'Acciones',
      render: (classroom: ClassRoom) => (
        <div className="actions-container">
          <Tooltip text="Editar salón" position="bottom">
            <img 
              src={editIcon} 
              className="action-icon" 
              alt="edit" 
              onClick={() => handleEdit(classroom)}
            />
          </Tooltip>
          <Tooltip text="Eliminar salón" position="bottom">
            <img 
              src={trashIcon} 
              className="action-icon" 
              alt="delete" 
              onClick={() => handleDelete(classroom.id)}
            />
          </Tooltip>
        </div>
      )
    }
  ];

  return (
    <>
      <DataTable
        data={classrooms}
        //@ts-ignore
        columns={columns}
        isLoading={loading}
        exportFileName={`salones-db`}
        initialItemsPerPage={10}
        enableExport={true}
        enablePagination={true}
        enableSearch={true}
        skeletonCount={10}
        tableSize={{ 
          width: "100%"
        }}
      />
      
      <Modal
        isOpen={!!editingClassroom}
        onClose={() => setEditingClassroom(null)}
        title="Editar Salón"
      >
        {editingClassroom && (
          <ClassRoomForm 
            initialData={editingClassroom}
            onSubmit={handleUpdateClassroom}
          />
        )}
      </Modal>
    </>
  );
};

export default ClassRoomList;