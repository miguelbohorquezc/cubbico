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
  preescolar: "bg-yellow-ds/10 text-yellow-cc border border-yellow-ds/30",
  primaria: "bg-tosca-ds/10 text-tosca-cc border border-tosca-ds/30",
  secundaria: "bg-magenta-ds/10 text-magenta-cc border border-magenta-ds/30",
};

const ClassRoomList = () => {
  const [classrooms, setClassrooms] = useState<ClassRoom[]>([]);
  const [docentes, setDocentes] = useState<DocenteOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingClassroom, setEditingClassroom] = useState<ClassRoom | null>(null);
  const [promotionConfig, setPromotionConfig] = useState<PromotionConfig | null>(null);

  // Estados para modales de confirmación y notificación
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; classroomId: string; classroomName: string }>({
    isOpen: false,
    classroomId: '',
    classroomName: ''
  });
  const [notification, setNotification] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({
    isOpen: false,
    type: 'success',
    message: ''
  });

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

  const handleDeleteClick = (classroomId: string) => {
    const classroom = classrooms.find(c => c.id === classroomId);
    setDeleteConfirm({
      isOpen: true,
      classroomId,
      classroomName: classroom ? classroom.nombreSalon : 'este salón'
    });
  };

  const handleDeleteConfirm = async () => {
    const { classroomId } = deleteConfirm;
    setDeleteConfirm({ isOpen: false, classroomId: '', classroomName: '' });

    try {
      await deleteClassroom(classroomId);
      setClassrooms(classrooms.filter(c => c.id !== classroomId));
      setNotification({
        isOpen: true,
        type: 'success',
        message: 'Salón eliminado con éxito'
      });
    } catch (error) {
      console.error("Error al eliminar:", error);
      setNotification({
        isOpen: true,
        type: 'error',
        message: 'Error al eliminar salón. Por favor intente de nuevo.'
      });
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
      setNotification({
        isOpen: true,
        type: 'success',
        message: 'Salón actualizado con éxito'
      });
    } catch (error) {
      console.error("Error al actualizar:", error);
      setNotification({
        isOpen: true,
        type: 'error',
        message: 'Error al actualizar salón. Por favor intente de nuevo.'
      });
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
      setNotification({
        isOpen: true,
        type: 'success',
        message: `Promoción completada: ${result.processed} estudiantes procesados`
      });
    } else {
      setNotification({
        isOpen: true,
        type: 'error',
        message: `Error en promoción: ${result.errorMessages?.join(', ') || 'Error desconocido'}`
      });
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
            onClick={() => handleDeleteClick(classroom.id)}
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

      {/* Modal de Confirmación de Eliminación */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
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
                ¿Estás seguro de que deseas eliminar el salón <strong>{deleteConfirm.classroomName}</strong>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Esta acción no se puede deshacer.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, classroomId: '', classroomName: '' })}
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
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

export default ClassRoomList;