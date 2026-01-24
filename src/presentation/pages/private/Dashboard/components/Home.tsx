import { useState, useEffect } from 'react';
import { SidebarV2 } from "../../../../components/sidebarV2"
import { HeaderV2 } from "../../../../components/headerV2"
import { ClassroomAveragesChart } from "../../../../components/dashboard/ClassroomAveragesChart"
import { LowPerformanceAlert } from "../../../../components/dashboard/LowPerformanceAlert"
import { AbsencesChart } from "../../../../components/dashboard/AbsencesChart"
import { SubjectAveragesChart } from "../../../../components/dashboard/SubjectAveragesChart"
import { useStatistics } from "../../../../hooks/useStatistics"
import { IconRefresh, IconFileAnalytics, IconChartBar, IconAlertTriangle, IconUserX, IconBook } from '@tabler/icons-react';

// Key del localStorage usada por useSidebarV2
const SIDEBAR_STORAGE_KEY = 'cubbico-sidebar-collapsed';

// ============================================
// Componente DashboardCard
// ============================================

interface DashboardCardProps {
  title: string;
  icon: React.ReactNode;
  onViewReport?: () => void;
  children: React.ReactNode;
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  icon,
  onViewReport,
  children,
  className = '',
}) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100/80 flex flex-col overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300 ${className}`}>
    {/* Card Header - Más compacto */}
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 bg-gradient-to-br from-slate-100 to-gray-200 rounded-lg text-gray-600">
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      {onViewReport && (
        <button
          onClick={onViewReport}
          className="
            flex items-center gap-1 px-2.5 py-1
            text-xs font-medium text-indigo-600
            hover:bg-indigo-50
            rounded-md transition-colors duration-150
          "
        >
          <IconFileAnalytics size={14} />
          <span className="hidden md:inline">Informe</span>
        </button>
      )}
    </div>
    {/* Card Content */}
    <div className="flex-1 p-3 lg:p-4">
      {children}
    </div>
  </div>
);

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

  // Hook de estadísticas del dashboard
  const {
    classroomChartData,
    alertsData,
    absencesChartData,
    subjectChartData,
    isLoading,
    error,
    refresh,
    currentYear,
    previousYear,
  } = useStatistics({ autoLoad: true });

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
          {/* Header del Dashboard - Compacto y alineado */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-200">
                <IconChartBar size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Panel de Estadísticas
                </h1>
                <p className="text-xs text-gray-500">
                  Año {currentYear} vs {previousYear}
                </p>
              </div>
            </div>
            <button
              onClick={refresh}
              disabled={isLoading}
              className="
                inline-flex items-center gap-2
                px-3 py-2 text-sm font-medium
                bg-gradient-to-r from-indigo-500 to-purple-600
                text-white rounded-xl
                hover:from-indigo-600 hover:to-purple-700
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
                shadow-md hover:shadow-lg shadow-indigo-200
              "
            >
              <IconRefresh
                size={16}
                className={isLoading ? 'animate-spin' : ''}
              />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
          </div>

          {/* Error state */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <IconAlertTriangle size={20} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">
                Error al cargar estadísticas: {error}
              </p>
            </div>
          )}

          {/* Grid de gráficos 2x2 - Ocupa todo el espacio */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
            {/* Gráfico 1: Promedios por Salón */}
            <DashboardCard
              title="Promedios por Salón"
              icon={<IconChartBar size={20} />}
              onViewReport={() => console.log('Ver informe de salones')}
            >
              <ClassroomAveragesChart
                data={classroomChartData}
                showComparison={true}
                height={320}
                isLoading={isLoading}
                embedded
              />
            </DashboardCard>

            {/* Gráfico 2: Alertas de Bajo Rendimiento */}
            <DashboardCard
              title="Alertas de Rendimiento"
              icon={<IconAlertTriangle size={20} />}
              onViewReport={() => console.log('Ver informe de alertas')}
            >
              <LowPerformanceAlert
                data={alertsData}
                maxItems={5}
                isLoading={isLoading}
                embedded
              />
            </DashboardCard>

            {/* Gráfico 3: Top Inasistencias */}
            <DashboardCard
              title="Mayor Inasistencia"
              icon={<IconUserX size={20} />}
              onViewReport={() => console.log('Ver informe de inasistencias')}
            >
              <AbsencesChart
                data={absencesChartData}
                height={320}
                isLoading={isLoading}
                embedded
              />
            </DashboardCard>

            {/* Gráfico 4: Rendimiento por Asignatura */}
            <DashboardCard
              title="Rendimiento por Asignatura"
              icon={<IconBook size={20} />}
              onViewReport={() => console.log('Ver informe de asignaturas')}
            >
              <SubjectAveragesChart
                data={subjectChartData}
                showComparison={true}
                height={320}
                isLoading={isLoading}
                embedded
              />
            </DashboardCard>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Home