import { useState, useEffect } from 'react';
import { SidebarV2 } from "../../../../components/sidebarV2"
import { HeaderV2 } from "../../../../components/headerV2"
import logo from '../../../../../assets/home.svg';

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
    // Escuchar cambios en localStorage (desde otras pestañas o componentes)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SIDEBAR_STORAGE_KEY) {
        setIsCollapsed(e.newValue === 'true');
      }
    };

    // Escuchar eventos personalizados del sidebar
    const handleSidebarChange = () => {
      try {
        setIsCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true');
      } catch {
        // Ignorar errores
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Poll cada 100ms para detectar cambios locales (no ideal pero funciona)
    const interval = setInterval(handleSidebarChange, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return isCollapsed;
};

function Home() {
  const isSidebarCollapsed = useSidebarCollapsed();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <SidebarV2 />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <HeaderV2
          title="Inicio"
          showDate
          showSearch
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Spacer para el header fixed */}
        <div className="h-16" />

        {/* Body */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <img
              src={logo}
              alt="Cubbico Home"
              className="w-[300px] mx-auto opacity-80"
            />
            <h2 className="mt-6 text-2xl font-semibold text-gray-700">
              Bienvenido a Cubbico
            </h2>
            <p className="mt-2 text-gray-500">
              Sistema Institucional Académico
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Home