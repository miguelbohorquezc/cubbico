import { useEffect, useState, useMemo } from "react";
import DataTable from "../../components/datatable/DataTable";
import { fetchClassrooms, deleteClassroom, updateClassroom } from "../../../infrastructure/classRoom.service";
import { fetchDocentes } from "../../../infrastructure/user.service";
import Tooltip from "../../components/toolTip/Tooltip";
import Modal from "../../components/modal/Modal";
import { ClassRoom } from "../../../domain/entities/classRoom";
import { DocenteOption, DocentesMap } from "../../../shared/types/classRoomTypes";
import ClassRoomForm from "../../components/classRoomForm/ClassRoomForm";

import editIcon from "../../../assets/datatableIcons/edit.svg";
import trashIcon from "../../../assets/datatableIcons/trash.svg";

const ClassRoomList = () => {
  const [classrooms, setClassrooms] = useState<ClassRoom[]>([]);
  const [docentes, setDocentes] = useState<DocenteOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingClassroom, setEditingClassroom] = useState<ClassRoom | null>(null);

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
    // Compatibilidad: si no es un ID válido, mostrar el valor guardado
    return directorId;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [classroomsData, docentesData] = await Promise.all([
          fetchClassrooms(),
          fetchDocentes()
        ]);
        setClassrooms(classroomsData);
        setDocentes(docentesData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
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
      render: (row: ClassRoom) => {
        const directorName = getDirectorName(row.directorGrupo);
        const isDocente = docentesMap[row.directorGrupo];

        return (
          <div className="flex items-center gap-2">
            {isDocente && (
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-deepBlue text-white text-xs">
                {directorName.charAt(0).toUpperCase()}
              </span>
            )}
            <p className={`classroom-director ${!isDocente ? 'text-gray-500 italic' : ''}`}>
              {directorName}
            </p>
          </div>
        );
      }
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