import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { IconArrowLeft, IconPlus, IconDoor } from "@tabler/icons-react";
import { SidebarV2 } from "../../../../components/sidebarV2";
import { HeaderV2 } from "../../../../components/headerV2";
import Modal from "../../../../components/modal/Modal";
import ClassRoomForm from "../../../../components/classRoomForm/ClassRoomForm";
import ClassRoomList from "../../../../features/students/ClassRoomList";

// Key del localStorage usada por useSidebarV2
const SIDEBAR_STORAGE_KEY = 'cubbico-sidebar-collapsed';

/**
 * Hook para sincronizar con el estado del sidebar en localStorage
 */
const useSidebarCollapsed = (): boolean => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SIDEBAR_STORAGE_KEY) {
        setIsCollapsed(e.newValue === 'true');
      }
    };

    const handleSidebarChange = () => {
      try {
        setIsCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true');
      } catch {
        // Ignorar errores
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleSidebarChange, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return isCollapsed;
};

function ClassRoomPage() {
  const navigate = useNavigate();
  const isSidebarCollapsed = useSidebarCollapsed();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFormSubmit = () => {
    setIsModalOpen(false);
    // Forzar recarga de la lista
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <SidebarV2 />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <HeaderV2
          title="Salones de Clase"
          showDate
          showSearch={false}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Spacer para el header fixed */}
        <div className="h-16 flex-shrink-0" />

        {/* Body */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto min-h-0">
          {/* Header de la página */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {/* Botón atrás */}
              <button
                onClick={() => navigate(-1)}
                className="
                  p-2 rounded-xl
                  text-gray-500 hover:text-gray-700
                  hover:bg-gray-100
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-amber-200
                "
                aria-label="Volver atrás"
              >
                <IconArrowLeft size={20} />
              </button>

              {/* Icono y título */}
              <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-200">
                <IconDoor size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Gestión de Salones
                </h1>
                <p className="text-xs text-gray-500">
                  Administra los salones de clase de la institución
                </p>
              </div>
            </div>

            {/* Botón crear */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="
                inline-flex items-center gap-2
                px-4 py-2.5 text-sm font-medium
                bg-gradient-to-r from-emerald-500 to-teal-600
                text-white rounded-xl
                hover:from-emerald-600 hover:to-teal-700
                transition-all duration-200
                shadow-md hover:shadow-lg shadow-emerald-200
                focus:outline-none focus:ring-2 focus:ring-emerald-300
              "
            >
              <IconPlus size={18} />
              <span className="hidden sm:inline">Nuevo Salón</span>
            </button>
          </div>

          {/* Lista de salones */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
            <ClassRoomList key={refreshKey} />
          </div>
        </main>
      </div>

      {/* Modal de creación */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crear Salón de Clases"
      >
        <ClassRoomForm onSubmit={handleFormSubmit} />
      </Modal>
    </div>
  );
}

export default ClassRoomPage