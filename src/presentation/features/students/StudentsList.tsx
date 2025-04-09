//@ts-ignore
import React, { useEffect, useState } from "react";
import DataTable from "../../components/datatable/DataTable";
import { useNavigate } from "react-router-dom";
import { Student } from "../../../presentation/components/notes/types";
import Tooltip from "../../components/toolTip/Tooltip";
import { fetchStudents, deleteStudent, updateStudent } from "../../../infrastructure/student.service";
import Modal from "../../components/modal/Modal";
import StudentForm from "../../components/studentForm/StudentForm";
import editIcon from "../../../assets/datatableIcons/edit.svg";
import trashIcon from "../../../assets/datatableIcons/trash.svg";

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

  const handleUpdateStudent = async (updatedData: Student) => {
    try {
      await updateStudent(updatedData.id, updatedData);
      setStudents(students.map(s => s.id === updatedData.id ? updatedData : s));
      setEditingStudent(null);
      alert("Estudiante actualizado con éxito");
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("Error al actualizar estudiante");
    }
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
        label: "Documento",
        render: (row: Student) => (
          <p className="student-document">
            {row.document}
          </p>
        )
    },{ 
        key: "documentId", 
        label: "Documento",
        render: (row: Student) => (
            <p className="student-document">
            {row.id}
            </p>
        )
    },
    { 
      key: "name", 
      label: "Nombre",
      render: (row: Student) => (
        <p className="student-name">
          {row.name.toUpperCase()}
        </p>
      )
    },
    { 
      key: "lastName", 
      label: "Apellido",
      render: (row: Student) => (
        <p className="student-lastname">
          {row.lastName.toUpperCase()}
        </p>
      )
    },{ 
        key: "classRoom", 
        label: "Salón",
        render: (row: Student) => (
          <p className="student-classroom">
            {row.className}
          </p>
        )
      },
    { 
      key: "caracter", 
      label: "Evaluación",	
      render: (row: Student) => {
        let badgeClass = "status-badge";
        let label = row.caracter;
        
        // Personaliza según el carácter del estudiante si es necesario
        switch(row.caracter?.toLowerCase()) {
          case "normal":
            badgeClass += " normal-badge";
            break;
          case "ajustes":
            badgeClass += " ajustes-badge";
            break;
          default:
            badgeClass += " normal-badge";
        }
        
        return (
          <span className={badgeClass}>
            {label}
          </span>
        );
      }
    },
    { 
        key: 'actions', 
        label: 'Acciones',
        render: (student: Student) => (
          <div className="actions-container">
            <Tooltip text="Editar estudiante" position="bottom">
              <img 
                src={editIcon} 
                className="action-icon" 
                alt="edit" 
                onClick={() => handleEdit(student)}
              />
            </Tooltip>
            <Tooltip text="Eliminar estudiante" position="bottom">
              <img 
                src={trashIcon} 
                className="action-icon" 
                alt="delete" 
                onClick={() => handleDelete(student.id)}
              />
            </Tooltip>
          </div>
        )
      }
  ];

  return (
          <>
            <DataTable
            data={students}
            columns={columns}
            isLoading={loading}
            exportFileName={`estudiantes-db`}
            initialItemsPerPage={10}
            enableExport={true}
            enablePagination={true}
            enableSearch={true}
            skeletonCount={10}
            tableSize={{ 
              width: "100%"
            }}/>
            
            <Modal
                isOpen={!!editingStudent}
                onClose={() => setEditingStudent(null)}
                title="Editar Estudiante">
                {editingStudent && (
                <StudentForm 
                    initialData={editingStudent}
                    onSubmit={handleUpdateStudent}
                />
                )}
            </Modal>
          </>      
        )
};

export default StudentList;