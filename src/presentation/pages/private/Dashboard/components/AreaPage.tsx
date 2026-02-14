import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { IconArrowLeft, IconPlus, IconBooks } from "@tabler/icons-react";
import { SidebarV2 } from "../../../../components/sidebarV2";
import { HeaderV2 } from "../../../../components/headerV2";
import Modal from "../../../../components/modal/Modal";
import AreaForm from "../../../../components/areaForm/AreaForm";
import AreaListDragDrop from "../../../../features/students/AreaListDragDrop";
import { AreaServiceData } from "../../../../../shared/types/areaTypes";
import { addArea, fetchAreas } from "../../../../../infrastructure/area.service";

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

function AreaPage() {
  const navigate = useNavigate();
  const isSidebarCollapsed = useSidebarCollapsed();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [areas, setAreas] = useState<AreaServiceData[]>([]);

  // Cargar áreas para el auto-cálculo de orden
  useEffect(() => {
    const loadAreas = async () => {
      try {
        const areasData = await fetchAreas();
        setAreas(areasData);
      } catch (error) {
        console.error('Error loading areas:', error);
      }
    };
    loadAreas();
  }, [refreshKey]);

  const handleAddArea = async (formData: AreaServiceData) => {
    try {
      const { id, ...areaData } = formData;
      await addArea(areaData);
      setIsModalOpen(false);
      setRefreshKey(prev => prev + 1);
      return true;
    } catch (error) {
      console.error('Error al crear área:', error);
      return false;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <SidebarV2 />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <HeaderV2
          title="Asignaturas"
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
                  p-2 rounded-lg
                  text-gray-500 hover:text-gray-700
                  hover:bg-gray-100
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-orchid-blue-20
                "
                aria-label="Volver atrás"
              >
                <IconArrowLeft size={20} />
              </button>

              {/* Icono y título */}
              <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-magenta rounded-lg shadow-lg">
                <IconBooks size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Gestión de Asignaturas
                </h1>
                <p className="text-xs text-gray-500">
                  Administra las asignaturas y su orden en los informes
                </p>
              </div>
            </div>

            {/* Botón crear */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="
                inline-flex items-center gap-2
                px-4 py-2.5 text-sm font-medium
                bg-magenta
                text-white rounded-lg
                hover:bg-magenta-cc
                transition-all duration-200
                shadow-md hover:shadow-lg
                focus:outline-none focus:ring-2 focus:ring-magenta/30
              "
            >
              <IconPlus size={18} />
              <span className="hidden sm:inline">Nueva Asignatura</span>
            </button>
          </div>

          {/* Lista de asignaturas con drag & drop */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100/80 overflow-hidden p-4 lg:p-6">
            <AreaListDragDrop key={refreshKey} />
          </div>
        </main>
      </div>

      {/* Modal de creación */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nueva Asignatura"
      >
        <AreaForm onSubmit={handleAddArea} existingAreas={areas} />
      </Modal>
    </div>
  );
}

export default AreaPage;
