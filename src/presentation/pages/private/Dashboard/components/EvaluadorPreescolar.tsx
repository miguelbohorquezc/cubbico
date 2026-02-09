import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SidebarV2 } from '../../../../components/sidebarV2';
import { HeaderV2 } from '../../../../components/headerV2';
import EvaluadorCompleto from '../../../../features/preschool/Evaluador/EvaluadorCompleto';

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

function EvaluadorPreescolar() {
  const isSidebarCollapsed = useSidebarCollapsed();
  const { classroomId = '', studentId = '', periodId = '0' } = useParams();
  const safePeriodId = parseInt(periodId, 10) || 0;
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <SidebarV2 />

      <div className="flex-1 flex flex-col min-w-0">
        <HeaderV2
          title={`Evaluador Preescolar - Periodo ${safePeriodId}`}
          subtitle="Selección de indicadores de desempeño"
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

          <EvaluadorCompleto
            studentId={studentId}
            year="2025"
            classRoomId={classroomId}
            periodo={safePeriodId}
          />
        </main>
      </div>
    </div>
  );
}

export default EvaluadorPreescolar;