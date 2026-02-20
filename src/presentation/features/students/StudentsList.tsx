import { useEffect, useState } from "react";
import DataTable from "../../components/datatable/DataTable";
import { useNavigate } from "react-router-dom";
import { Student } from "../../../presentation/components/notes/types";
import { fetchStudents, deleteStudent } from "../../../infrastructure/student.service";
import Modal from "../../components/modal/Modal";
import StudentFormV2 from "../../components/studentForm/StudentFormV2";
const StudentList = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Estados para modales de confirmación y notificación
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; studentId: string; studentName: string }>({
    isOpen: false,
    studentId: '',
    studentName: ''
  });
  const [notification, setNotification] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string }>({
    isOpen: false,
    type: 'success',
    message: ''
  });



  const handleDeleteClick = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    setDeleteConfirm({
      isOpen: true,
      studentId,
      studentName: student ? `${student.name} ${student.lastName}` : 'este estudiante'
    });
  };

  const handleDeleteConfirm = async () => {
    const { studentId } = deleteConfirm;
    setDeleteConfirm({ isOpen: false, studentId: '', studentName: '' });

    try {
      await deleteStudent(studentId);
      setStudents(students.filter(s => s.id !== studentId));
      setNotification({
        isOpen: true,
        type: 'success',
        message: 'Estudiante eliminado con éxito'
      });
    } catch (error) {
      console.error("Error al eliminar:", error);
      setNotification({
        isOpen: true,
        type: 'error',
        message: 'Error al eliminar estudiante. Por favor intente de nuevo.'
      });
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
              : 'bg-yellow-ds/10 text-yellow-cc border border-yellow-ds/30'
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
          activo: 'bg-tosca-ds/10 text-tosca-cc border-tosca-ds/30',
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
            onClick={() => handleDeleteClick(student.id)}
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

      {/* Modal de Editar Estudiante */}
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

      {/* Modal de Confirmación de Eliminación */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 bg-magenta-ds">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Confirmar Eliminación</h3>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-gray-700">
                ¿Estás seguro de que deseas eliminar a <strong>{deleteConfirm.studentName}</strong>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Esta acción no se puede deshacer.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, studentId: '', studentName: '' })}
                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium shadow-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 bg-magenta-ds text-white rounded-lg hover:bg-magenta-cc transition-all duration-200 font-medium shadow-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Notificación */}
      {notification.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className={`px-6 py-4 ${notification.type === 'success' ? 'bg-tosca-ds' : 'bg-magenta-ds'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  {notification.type === 'success' ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {notification.type === 'success' ? 'Éxito' : 'Error'}
                  </h3>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-gray-700">{notification.message}</p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setNotification({ isOpen: false, type: 'success', message: '' })}
                className={`px-5 py-2.5 text-white rounded-lg transition-all duration-200 font-medium shadow-sm ${
                  notification.type === 'success' ? 'bg-tosca-ds hover:bg-tosca-cc' : 'bg-orchid-blue-60 hover:bg-orchid-blue-70'
                }`}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;