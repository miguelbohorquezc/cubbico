import { useEffect, useState, useMemo } from "react";
import { IconEdit, IconTrash, IconArrowUp } from "@tabler/icons-react";
import DataTable from "../../components/datatable/DataTable";
import { fetchClassrooms, deleteClassroom, updateClassroom } from "../../../infrastructure/classRoom.service";
import { fetchDocentes } from "../../../infrastructure/user.service";
import Modal from "../../components/modal/Modal";
import { ClassRoom } from "../../../domain/entities/classRoom";
import { DocenteOption, DocentesMap } from "../../../shared/types/classRoomTypes";
import ClassRoomForm from "../../components/classRoomForm/ClassRoomForm";
import PromotionModal from "./components/PromotionModal";
import { PromotionConfig, PromotionResult } from "../../../shared/types/studentManagementTypes";

/**
 * Configuración de badges por nivel académico
 */
const NIVEL_BADGES: Record<string, string> = {
  preescolar: "bg-magenta-100 text-magenta-700 border-purple-200",
  primaria: "bg-tosca/20 text-tosca-700 border-tosca-200",
  secundaria: "bg-blue-100 text-blue-700 border-blue-200",
};

const ClassRoomList = () => {
  const [classrooms, setClassrooms] = useState<ClassRoom[]>([]);
  const [docentes, setDocentes] = useState<DocenteOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingClassroom, setEditingClassroom] = useState<ClassRoom | null>(null);
  const [promotionConfig, setPromotionConfig] = useState<PromotionConfig | null>(null);

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

  const handleOpenPromotion = (classroom: ClassRoom) => {
    // La promoción es del año escolar que termina al que inicia
    // Si estamos en enero 2026, promovemos de 2025 a 2026
    const currentYear = (new Date().getFullYear() - 1).toString();
    const targetYear = new Date().getFullYear().toString();

    setPromotionConfig({
      sourceClassroomId: classroom.id,
      sourceClassName: classroom.nombreSalon,
      sourceLevel: classroom.nivel,
      currentYear,
      targetYear,
    });
  };

  const handlePromotionComplete = (result: PromotionResult) => {
    if (result.success) {
      alert(`Promoción completada: ${result.processed} estudiantes procesados`);
      // Recargar datos si es necesario
    } else {
      alert(`Error en promoción: ${result.errorMessages?.join(', ') || 'Error desconocido'}`);
    }
  };

  const columns = [
    {
      key: "identificador",
      label: "ID",
      render: (row: ClassRoom) => (
        <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {row.identificador}
        </span>
      )
    },
    {
      key: "nombreSalon",
      label: "Nombre del Salón",
      render: (row: ClassRoom) => (
        <span className="font-medium text-gray-900">
          {row.nombreSalon.toUpperCase()}
        </span>
      )
    },
    {
      key: "nivel",
      label: "Nivel",
      render: (row: ClassRoom) => {
        const nivelKey = row.nivel?.toLowerCase() || "";
        const badgeClasses = NIVEL_BADGES[nivelKey] || "bg-gray-100 text-gray-700 border-gray-200";

        return (
          <span className={`
            inline-flex items-center
            px-2.5 py-1
            text-xs font-semibold
            rounded-full border
            ${badgeClasses}
          `}>
            {row.nivel?.toUpperCase()}
          </span>
        );
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
            {isDocente ? (
              <>
                <span className="
                  inline-flex items-center justify-center
                  w-7 h-7 rounded-full
                  bg-gradient-to-br from-slate-700 to-slate-900
                  text-white text-xs font-medium
                  shadow-sm
                ">
                  {directorName.charAt(0).toUpperCase()}
                </span>
                <span className="text-gray-900 font-medium">
                  {directorName}
                </span>
              </>
            ) : (
              <span className="text-gray-400 italic text-sm">
                {directorName || "Sin asignar"}
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (classroom: ClassRoom) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleOpenPromotion(classroom)}
            className="
              p-2 rounded-lg
              text-gray-500 hover:text-green-600
              hover:bg-green-50
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-green-200
            "
            title="Promover estudiantes"
            aria-label="Promover estudiantes"
          >
            <IconArrowUp size={18} stroke={1.5} />
          </button>
          <button
            onClick={() => handleEdit(classroom)}
            className="
              p-2 rounded-lg
              text-gray-500 hover:text-blue-600
              hover:bg-blue-50
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-200
            "
            title="Editar salón"
            aria-label="Editar salón"
          >
            <IconEdit size={18} stroke={1.5} />
          </button>
          <button
            onClick={() => handleDelete(classroom.id)}
            className="
              p-2 rounded-lg
              text-gray-500 hover:text-red-600
              hover:bg-red-50
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-red-200
            "
            title="Eliminar salón"
            aria-label="Eliminar salón"
          >
            <IconTrash size={18} stroke={1.5} />
          </button>
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

      {/* Promotion Modal */}
      {promotionConfig && (
        <PromotionModal
          isOpen={!!promotionConfig}
          onClose={() => setPromotionConfig(null)}
          config={promotionConfig}
          onPromotionComplete={handlePromotionComplete}
        />
      )}
    </>
  );
};

export default ClassRoomList;