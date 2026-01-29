import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { SidebarV2 } from "../../../../components/sidebarV2";
import { HeaderV2 } from "../../../../components/headerV2";
import TeacherAreas from "../../../../features/teacher/TeacherAreas";
import TeacherClassrooms from "../../../../features/teacher/TeacherClassrooms";
import TeacherDataLoader from "../../../../features/teacher/TeacherDataLoader";
import { IconSchool, IconBooks } from '@tabler/icons-react';

// Key del localStorage usada por useSidebarV2
const SIDEBAR_STORAGE_KEY = 'cubbico-sidebar-collapsed';

/**
 * Hook para sincronizar con el estado del sidebar
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
    const handleSidebarChange = () => {
      try {
        setIsCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true');
      } catch {
        // Ignorar errores
      }
    };
    const interval = setInterval(handleSidebarChange, 100);
    return () => clearInterval(interval);
  }, []);

  return isCollapsed;
};

function Academy() {
  const isSidebarCollapsed = useSidebarCollapsed();
  const { classroomId, periodId } = useParams();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Data Loader */}
      <TeacherDataLoader />

      {/* Sidebar */}
      <SidebarV2 />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <HeaderV2
          title="Academia"
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Spacer para el header fixed */}
        <div className="h-16 flex-shrink-0" />

        {/* Body */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto min-h-0">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-200">
                <IconSchool size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Salones y Asignaturas
                </h1>
                <p className="text-xs text-gray-500">
                  {periodId ? `Período ${periodId}` : 'Selecciona un período'}
                </p>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Classrooms Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <IconSchool size={18} className="text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-800">Mis Salones</h2>
                  <p className="text-xs text-gray-500">Selecciona un salón para ver sus asignaturas</p>
                </div>
              </div>
              <div className="p-4">
                <TeacherClassrooms />
              </div>
            </div>

            {/* Areas Card - Only show when classroom is selected */}
            {classroomId && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <IconBooks size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-800">Asignaturas</h2>
                    <p className="text-xs text-gray-500">Gestiona las notas y evaluaciones</p>
                  </div>
                </div>
                <div className="p-4">
                  <TeacherAreas />
                </div>
              </div>
            )}

            {/* Empty state when no classroom selected */}
            {!classroomId && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden flex items-center justify-center min-h-[300px]">
                <div className="text-center p-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <IconBooks size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">
                    Selecciona un salón
                  </h3>
                  <p className="text-xs text-gray-500">
                    Haz clic en el icono de un salón para ver sus asignaturas
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Academy