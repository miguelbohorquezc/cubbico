import { useState, useEffect } from "react";
import { SidebarV2 } from "../../../../components/sidebarV2";
import { HeaderV2 } from "../../../../components/headerV2";
import StudentFormV2 from "../../../../components/studentForm/StudentFormV2";
import Modal from "../../../../components/modal/Modal";
import StudentList from "../../../../features/students/StudentsList";
import ExportStudentsOfficialCSV from "../../../../features/students/components/ExportStudentsOfficialCSV";
import { IconUserPlus, IconUsers } from "@tabler/icons-react";
import { fetchStudents } from "../../../../../infrastructure/student.service";
import { Student } from "../../../../components/notes/types";

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

function StudentsPage() {
  const isSidebarCollapsed = useSidebarCollapsed();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const data = await fetchStudents();
        setStudents(data);
      } catch (error) {
        console.error("Error loading students:", error);
      }
    };
    loadStudents();
  }, []);

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    window.location.reload();
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <SidebarV2 />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <HeaderV2
          title="Estudiantes"
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Spacer para el header fixed */}
        <div className="h-16 flex-shrink-0" />

        {/* Body */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto min-h-0">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-emerald-600 rounded-xl">
                <IconUsers size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Gestión de Estudiantes
                </h1>
                <p className="text-xs text-gray-500">
                  Administra los estudiantes matriculados
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ExportStudentsOfficialCSV students={students} />
              <button
                onClick={() => setIsModalOpen(true)}
                className="
                  inline-flex items-center gap-2
                  px-4 py-2.5 text-sm font-medium
                  bg-emerald-600
                  text-white rounded-xl
                  hover:bg-emerald-700
                  transition-all duration-200
                "
              >
                <IconUserPlus size={18} />
                <span>Matricular Estudiante</span>
              </button>
            </div>
          </div>

          {/* Student List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-4 lg:p-6">
            <StudentList />
          </div>
        </main>
      </div>

      {/* Modal for new student registration */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Matricular Estudiante"
        size="lg"
      >
        <StudentFormV2
          mode="create"
          onSuccess={handleFormSuccess}
          onCancel={() => setIsModalOpen(false)}
          showCancelButton={true}
        />
      </Modal>
    </div>
  );
}

export default StudentsPage;