import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { SidebarV2 } from '../../../../components/sidebarV2';
import { HeaderV2 } from '../../../../components/headerV2';
import Modal from '../../../../components/modal/Modal';
import AchievementForm from '../../../../components/achievement/AchievementForm';
import GradeManager from '../../../../features/notesManager/GradeManager';
import TeacherAchievements from '../../../../features/teacher/TeacherAchivement';
import { PrivateRoutes } from '../../../../../app/routes/routes';
import { useAppSelector } from '../../../../../app/store/store';
import { usePermissions } from '../../../../hooks/usePermissions';
import { IconArrowLeft, IconPlus, IconFileDescription, IconClipboardList, IconChevronRight, IconPrinter, IconFiles } from '@tabler/icons-react';

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

function Notes() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isSidebarCollapsed = useSidebarCollapsed();

  const { classroomId, periodId, areaId } = useParams();
  const navigate = useNavigate();
  const { permissions } = usePermissions();
  const anioActual = new Date().getFullYear().toString();

  const classroom = useAppSelector(state =>
    state.teacherData.classrooms.find(c => c.id === classroomId)
  );

  const area = useAppSelector(state =>
    state.teacherData.areas.find(a => a.id === areaId)
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <SidebarV2 />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <HeaderV2
          title="Registro de Notas"
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Spacer para el header fixed */}
        <div className="h-16 flex-shrink-0" />

        {/* Body */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto min-h-0">
          {/* Page Header con acciones */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-orchid-blue-60 rounded-lg">
                <IconClipboardList size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {area?.asignatura || 'Asignatura'}
                </h1>
                <p className="text-xs text-gray-500">
                  {classroom?.nombreSalon || 'Salón'} · Período {periodId}
                </p>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                title="Volver"
              >
                <IconArrowLeft size={18} />
                <span className="hidden sm:inline">Volver</span>
              </button>

              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-orchid-blue-60 rounded-lg hover:bg-orchid-blue-70 shadow-sm hover:shadow-md transition-all duration-200"
                title="Crear / Editar logros"
              >
                <IconPlus size={18} />
                <span className="hidden sm:inline">Logros</span>
              </button>

              <Link
                to={`/private/dashboard/${PrivateRoutes.REPORT}/${classroom?.id}/${periodId}/${classroom?.nivel}/${anioActual}`}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-yellow-cc bg-yellow-ds/10 border border-yellow-ds/30 rounded-lg hover:bg-yellow-ds/20 hover:border-yellow-ds/40 transition-all duration-200"
                title={`Ver informe de promedios periodo ${periodId}`}
              >
                <IconFileDescription size={18} />
                <span className="hidden sm:inline">Informe de Promedios</span>
              </Link>

              {/* Botón de informes del salón - Vista masiva */}
              <Link
                to={`/private/dashboard/informe/salon/${classroom?.nivel}/${periodId}/${classroomId}/${anioActual}`}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-orchid-blue-60 rounded-lg hover:bg-orchid-blue-70 transition-all duration-200"
                title="Ver informes del salón"
              >
                <IconFileDescription size={18} />
                <span className="hidden sm:inline">Informes del Salón</span>
              </Link>
            </div>
          </div>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-sm mb-6 px-1">
            <span className="text-gray-500">Academia</span>
            <IconChevronRight size={14} className="text-gray-400" />
            <span className="text-gray-500">Período {periodId}</span>
            <IconChevronRight size={14} className="text-gray-400" />
            <span className="text-gray-500">{classroom?.nombreSalon}</span>
            <IconChevronRight size={14} className="text-gray-400" />
            <span className="text-orchid-blue-60 font-medium">{area?.asignatura}</span>
          </nav>

          {/* Content */}
          <div className="space-y-6">
            {/* Logros */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100/80 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-sm font-semibold text-gray-800">Logros del Período</h2>
                <p className="text-xs text-gray-500">Logros académicos definidos para esta asignatura</p>
              </div>
              <div className="p-4">
                <TeacherAchievements />
              </div>
            </div>

            {/* Tabla de calificaciones */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100/80 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-sm font-semibold text-gray-800">Calificaciones</h2>
                <p className="text-xs text-gray-500">Registra las notas de los estudiantes</p>
              </div>
              <div className="p-4 overflow-x-auto">
                <GradeManager />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal de logros */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Logros académicos"
        size="3xl"
      >
        <div>
          <AchievementForm />
        </div>
      </Modal>
    </div>
  );
}

export default Notes