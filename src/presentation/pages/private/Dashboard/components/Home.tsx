import { useState, useEffect } from 'react';
import { SidebarV2 } from "../../../../components/sidebarV2"
import { HeaderV2 } from "../../../../components/headerV2"
import TeacherCalendar from '../../../../features/schedule/TeacherCalendar';

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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <SidebarV2 />

      {/* Contenido principal - Ocupa todo el espacio disponible */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <HeaderV2
          title="Dashboard"
          showDate
          showSearch
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Spacer para el header fixed */}
        <div className="h-16 flex-shrink-0" />

        {/* Body - Dashboard con gráficos - Ocupa todo el espacio */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto min-h-0">
          <TeacherCalendar />
        </main>
      </div>
    </div>
  )
}

export default Home