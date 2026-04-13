import { useState, useEffect } from 'react';
import { SidebarV2 } from "../../../../components/sidebarV2"
import { HeaderV2 } from "../../../../components/headerV2"
import TeacherPlanillaList from '../../../../features/attendance/TeacherPlanillaList';
import { useAppSelector } from '../../../../../app/store/store';

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
  const user = useAppSelector((state) => state.user) as { uid?: string; role?: string } | null;

  const userUid = user?.uid || '';
  const userRole = user?.role || 'Docente';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <SidebarV2 />

      {/* Contenido principal - Ocupa todo el espacio disponible */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <HeaderV2
          title="Mis Planillas"
          showDate
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Spacer para el header fixed */}
        <div className="h-16 flex-shrink-0" />

        {/* Body */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto min-h-0">
          <div className="mb-4">
            <h1 className="text-lg font-bold text-gray-900">
              {userRole === 'Coordinador' ? 'Todas las Planillas' : 'Mis Planillas de Asistencia'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {userRole === 'Coordinador'
                ? 'Planillas de todos los docentes agrupadas por período y salón'
                : 'Selecciona una planilla para registrar asistencia del período'}
            </p>
          </div>
          <TeacherPlanillaList userUid={userUid} userRole={userRole} />
        </main>
      </div>
    </div>
  )
}

export default Home