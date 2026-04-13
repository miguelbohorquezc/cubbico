import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { SidebarV2 } from '../../components/sidebarV2';
import { HeaderV2 } from '../../components/headerV2';
import { fetchActiveStudentsByClassroom } from '../../../infrastructure/student.service';
import { Student } from '../../../presentation/components/notes/types';
import { SearchInput, Badge, Card, EmptyState } from '../../components/ui';
import { UserIcon, PencilIcon, DocumentIcon } from '../../components/icons';
import { ChevronLeftIcon } from '../../components/icons/SidebarIcons';
import { IconFiles } from '@tabler/icons-react';
import { usePermissions } from '../../hooks/usePermissions';

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

const ClassroomStudents = () => {
  const isSidebarCollapsed = useSidebarCollapsed();
  const { isCoordinator } = usePermissions();
  const { classroomId, periodId } = useParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadStudents = async () => {
      try {
        if (classroomId) {
          // Solo mostrar estudiantes activos a los profesores
          const studentsData = await fetchActiveStudentsByClassroom(classroomId);
          setStudents(studentsData);
        }
      } catch (error) {
        console.error('Error loading students:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [classroomId]);

  const handleEvaluate = (studentId: string) => {
    const currentYear = new Date().getFullYear();
    navigate(`/private/dashboard/evaluadorpreescolar/${periodId}/${classroomId}/${studentId}/${currentYear}`);
  };

  const handlePrint = (studentId: string) => {
    const currentYear = new Date().getFullYear();
    navigate(`/private/dashboard/print/${periodId}/${classroomId}/${studentId}/${currentYear}`);
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.document.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <SidebarV2 />

      <div className="flex-1 flex flex-col min-w-0">
        <HeaderV2
          title="Evaluar Estudiantes"
          subtitle="Seleccione un estudiante para evaluar"
          isSidebarCollapsed={isSidebarCollapsed}
          showSearch={false}
        />

        <div className="h-16 flex-shrink-0" />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div>
            {/* Controls */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2.5 text-sm font-medium text-light-gray-700 bg-white border border-light-gray-300 rounded-lg hover:bg-light-gray-50 transition-all flex items-center gap-2"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                Regresar
              </button>

              {isCoordinator && (
                <Link
                  to={`/private/dashboard/informe/salon/preescolar/${periodId}/${classroomId}/${new Date().getFullYear()}`}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <IconFiles size={18} />
                  <span className="hidden sm:inline">Informes Salón</span>
                </Link>
              )}
            </div>

            {/* Search bar con SearchInput */}
            <div className="mb-6">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                onClear={() => setSearchTerm('')}
                placeholder="Buscar por nombre, apellido o documento..."
                resultCount={filteredStudents.length}
                debounceMs={300}
                className="max-w-2xl"
              />
            </div>

            {/* Students list */}
            {loading ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-lg border border-light-gray-200 shadow-sm">
                <div className="w-12 h-12 border-4 border-light-gray-200 border-t-deep-blue-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-sm font-medium text-light-gray-700">Cargando estudiantes...</p>
              </div>
            ) : (
              <Card elevation="sm">
                <table className="w-full">
                  <thead className="bg-light-gray-50 border-b border-light-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <div className="flex items-center gap-2">
                          <DocumentIcon className="w-4 h-4 text-light-gray-500" />
                          <span className="text-xs font-semibold text-light-gray-600 uppercase tracking-wider">
                            Documento
                          </span>
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-light-gray-500" />
                          <span className="text-xs font-semibold text-light-gray-600 uppercase tracking-wider">
                            Nombre Completo
                          </span>
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <span className="text-xs font-semibold text-light-gray-600 uppercase tracking-wider">
                          Carácter
                        </span>
                      </th>
                      <th className="px-6 py-3 text-center">
                        <span className="text-xs font-semibold text-light-gray-600 uppercase tracking-wider">
                          Acciones
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-light-gray-200">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12">
                          <EmptyState
                            variant={searchTerm ? 'search' : 'default'}
                            icon={<UserIcon />}
                            title={searchTerm ? 'No se encontraron estudiantes' : 'No hay estudiantes registrados'}
                            description={searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay estudiantes en este salón'}
                          />
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-light-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-light-gray-900 font-medium">
                            {student.document}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-deep-blue-900 uppercase">
                            {student.name} {student.lastName}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="purple" size="sm">
                              {student.caracter || 'N/A'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEvaluate(student.id)}
                                className="p-2 text-deep-blue-600 hover:bg-deep-blue-50 rounded-lg transition-colors"
                                title="Evaluar"
                              >
                                <PencilIcon className="w-5 h-5" />
                              </button>
                              {isCoordinator && (
                                <button
                                  onClick={() => handlePrint(student.id)}
                                  className="p-2 text-light-gray-600 hover:bg-light-gray-100 rounded-lg transition-colors"
                                  title="Imprimir informe"
                                >
                                  <DocumentIcon className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClassroomStudents;