import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../app/store/store";
import UserTable from "../../../../components/userList/UserTable";
import CreateUserForm from "../../../../components/userForm/CreateUserForm";
import Modal from "../../../../components/modal/Modal";
import { SidebarV2 } from "../../../../components/sidebarV2";
import { HeaderV2 } from "../../../../components/headerV2";
import { IconUsers, IconUserPlus } from '@tabler/icons-react';

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

function User() {
  const currentUser = useSelector((state: RootState) => state.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isSidebarCollapsed = useSidebarCollapsed();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <SidebarV2 />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Header */}
        <HeaderV2
          title="Gestión de Usuarios"
          showSearch
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Spacer para el header fixed */}
        <div className="h-16" />

        {/* Body */}
        <main className="flex-1 flex flex-col p-4 lg:p-6 overflow-hidden w-full max-w-full">
          {/* Header de la página */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-200">
                <IconUsers size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Usuarios del Sistema
                </h1>
                <p className="text-xs text-gray-500">
                  Administra coordinadores y docentes
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="
                inline-flex items-center gap-2
                px-3 py-2 text-sm font-medium
                bg-gradient-to-r from-blue-500 to-indigo-600
                text-white rounded-xl
                hover:from-blue-600 hover:to-indigo-700
                transition-all duration-200
                shadow-md hover:shadow-lg shadow-blue-200
              "
            >
              <IconUserPlus size={16} />
              <span className="hidden sm:inline">Nuevo Usuario</span>
            </button>
          </div>

          {/* Table - flex-1 para ocupar todo el espacio restante */}
          <div className="flex-1 min-h-0 h-full">
            <UserTable currentUserId={currentUser?.uid} />
          </div>
        </main>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Nuevo Usuario"
        size="lg"
      >
        <CreateUserForm />
      </Modal>
    </div>
  );
}

export default User;
