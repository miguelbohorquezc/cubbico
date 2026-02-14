import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SidebarV2 } from '../../../../components/sidebarV2';
import { HeaderV2 } from '../../../../components/headerV2';
import GestorIndicadores from '../../../../features/preschool/GestorIndicadores';

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

function ConfigIndicadores() {
  const isSidebarCollapsed = useSidebarCollapsed();
  const { classroomId = '', periodId = '' } = useParams();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear().toString();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <SidebarV2 />

      <div className="flex-1 flex flex-col min-w-0">
        <HeaderV2
          title="Academia"
          subtitle="Configuración de indicadores"
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
              <div className="w-12 h-12 bg-tosca/100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Configurar Indicadores</h1>
                <p className="text-sm text-gray-500">Periodo {periodId}</p>
              </div>
            </div>
          </div>

          <GestorIndicadores
            classRoomId={classroomId}
            year={currentYear}
            periodo={parseInt(periodId)}
          />
        </main>
      </div>
    </div>
  );
}

export default ConfigIndicadores;
