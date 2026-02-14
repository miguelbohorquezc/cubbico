import { useEffect, useState, useMemo } from "react";
import DataTable from "../../components/datatable/DataTable";
import { useNavigate } from "react-router-dom";
import { Student } from "../../../presentation/components/notes/types";
import { fetchStudents, deleteStudent } from "../../../infrastructure/student.service";
import Modal from "../../components/modal/Modal";
import StudentFormV2 from "../../components/studentForm/StudentFormV2";
import { EvaluationMode } from "../../../shared/types/studentManagementTypes";

/**
 * Evaluation mode filter options
 */
type EvaluationFilter = 'all' | EvaluationMode;

const StudentList = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();



  const handleDelete = async (studentId: string) => {
    if (window.confirm("¿Estás seguro de eliminar este estudiante?")) {
      try {
        await deleteStudent(studentId);
        setStudents(students.filter(s => s.id !== studentId));
        alert("Estudiante eliminado con éxito");
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Error al eliminar estudiante");
      }
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
  };

  const handleEditSuccess = () => {
    setEditingStudent(null);
    // Reload students to get updated data
    const reloadStudents = async () => {
      try {
        const studentsData = await fetchStudents();
        setStudents(studentsData);
      } catch (error) {
        console.error("Error reloading students:", error);
      }
    };
    reloadStudents();
  };


  useEffect(() => {
    const loadStudents = async () => {
      try {
          const studentsData = await fetchStudents();
          setStudents(studentsData);
          console.log(studentsData);
        
      } catch (error) {
        console.error("Error loading students:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  //@ts-ignore
  const handleViewStudent = (studentId: string) => {
    // Navegar al perfil del estudiante o a sus notas
    navigate(`/private/student/${studentId}`);
  };

  const columns = [
    {
      key: "document",
      label: "Tipo Doc.",
      render: (row: Student) => (
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {row.document}
        </span>
      )
    },
    {
      key: "id",
      label: "Número",
      render: (row: Student) => (
        <span className="font-mono text-sm text-gray-700">
          {row.id}
        </span>
      )
    },
    {
      key: "name",
      label: "Nombre",
      render: (row: Student) => (
        <span className="font-medium text-gray-900">
          {row.name.toUpperCase()}
        </span>
      )
    },
    {
      key: "lastName",
      label: "Apellido",
      render: (row: Student) => (
        <span className="font-medium text-gray-900">
          {row.lastName.toUpperCase()}
        </span>
      )
    },
    {
      key: "classRoom",
      label: "Salón",
      render: (row: Student) => (
        <span className="text-sm text-gray-600">
          {row.className}
        </span>
      )
    },
    {
      key: "caracter",
      label: "Evaluación",
      render: (row: Student) => {
        const isAjustes = row.caracter?.toLowerCase() === 'ajustes';

        return (
          <span className={`
            inline-flex items-center gap-1.5 px-2.5 py-1
            text-xs font-semibold rounded-lg border
            ${isAjustes
              ? 'bg-orchid-blue-10 text-orchid-blue-70 border-orchid-blue-30'
              : 'bg-orchid-blue-10 text-orchid-blue-70 border-orchid-blue-30'
            }
          `}>
            {isAjustes ? (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {isAjustes ? 'Con Ajustes' : 'Normal'}
          </span>
        );
      }
    },
    {
      key: "status",
      label: "Estado",
      render: (row: Student) => {
        const status = row.status || 'activo';
        const colorMap = {
          activo: 'bg-green-50 text-green-700 border-green-200',
          retirado: 'bg-gray-50 text-gray-700 border-gray-200',
          expulsado: 'bg-red-50 text-red-700 border-red-200',
          inactivo: 'bg-yellow-50 text-yellow-700 border-yellow-200',
          suspendido: 'bg-orange-50 text-orange-700 border-orange-200',
          graduado: 'bg-blue-50 text-blue-700 border-blue-200',
          transferido: 'bg-magenta-50 text-magenta-700 border-purple-200',
        };
        const labelMap = {
          activo: 'Activo',
          retirado: 'Retirado',
          expulsado: 'Expulsado',
          inactivo: 'Inactivo',
          suspendido: 'Suspendido',
          graduado: 'Graduado',
          transferido: 'Transferido',
        };

        return (
          <span className={`
            inline-flex items-center px-2.5 py-1
            text-xs font-semibold rounded-full border
            ${colorMap[status as keyof typeof colorMap]}
          `}>
            {labelMap[status as keyof typeof labelMap]}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (student: Student) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleEdit(student)}
            className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
            title="Editar estudiante"
            aria-label="Editar estudiante"
          >
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </button>
          <button
            onClick={() => handleDelete(student.id)}
            className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-200"
            title="Eliminar estudiante"
            aria-label="Eliminar estudiante"
          >
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col w-full">
      <DataTable
        data={students}
        columns={columns}
        isLoading={loading}
        exportFileName={`estudiantes-db`}
        initialItemsPerPage={10}
        enableExport={false}
        enablePagination={true}
        enableSearch={true}
        skeletonCount={10}
        tableSize={{
          width: "100%"
        }}
      />

      <Modal
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        title="Editar Estudiante"
        size="lg"
      >
        {editingStudent && (
          <StudentFormV2
            mode="edit"
            initialData={{
              id: editingStudent.id,
              document: editingStudent.document,
              name: editingStudent.name,
              lastName: editingStudent.lastName,
              classRoom: editingStudent.classRoom,
              className: editingStudent.className,
              caracter: editingStudent.caracter,
              classroomId: editingStudent.classroomId || '',
              status: editingStudent.status || 'activo',
            }}
            onSuccess={handleEditSuccess}
            onCancel={() => setEditingStudent(null)}
            showCancelButton={true}
          />
        )}
      </Modal>
    </div>
  );
};

export default StudentList;