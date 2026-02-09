import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SidebarV2 } from '../../../../components/sidebarV2';
import { HeaderV2 } from '../../../../components/headerV2';
import InformeConfigurador from '../../../../features/preschool/InformeConfigurador';

const SIDEBAR_STORAGE_KEY = 'cubbico-sidebar-collapsed';

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
      } catch {}
    };
    const interval = setInterval(handleSidebarChange, 100);
    return () => clearInterval(interval);
  }, []);

  return isCollapsed;
};

function NotesPreschool() {
  const isSidebarCollapsed = useSidebarCollapsed();
  const { classroomId = '' } = useParams();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <SidebarV2 />

      <div className="flex-1 flex flex-col min-w-0">
        <HeaderV2
          title="Academia"
          subtitle="Configuración de propósitos"
          isSidebarCollapsed={isSidebarCollapsed}
          showSearch={false}
        />

        <div className="h-16 flex-shrink-0" />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Regresar
          </button>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Configurar Propósitos</h1>
                <p className="text-sm text-gray-500">Configuración de propósitos y referentes</p>
              </div>
            </div>
          </div>

          <InformeConfigurador
            classRoomId={classroomId}
            year="2025"
          />
        </main>
      </div>
    </div>
  );
}

export default NotesPreschool;
