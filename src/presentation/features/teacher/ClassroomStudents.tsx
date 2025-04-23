//@ts-ignore
import React, { useEffect, useState } from "react";

import DataTable from "../../components/datatable/DataTable";
import { useNavigate, useParams } from "react-router-dom";
import { Student } from "../../../presentation/components/notes/types";
import Tooltip from "../../components/toolTip/Tooltip";
import { toolTipsData } from "../../../domain/entities/toolTipsData";
import { fetchStudentsByClassroom } from "../../../infrastructure/student.service";
import actionIcon from "../../../assets/datatableIcons/align-box-right-bottom.svg"
import Button from "../button/Button";
import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";

const ClassroomStudents = () => {
  const { classroomId, periodId } = useParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {
    const loadStudents = async () => {
      try {
        if (classroomId) {
          const studentsData = await fetchStudentsByClassroom(classroomId);
          setStudents(studentsData);
        }
      } catch (error) {
        console.error("Error loading students:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [classroomId]);

  //@ts-ignore
  const handleViewStudent = (studentId: string) => {
    // Navegar al perfil del estudiante o a sus notas
    navigate(`/private/student/${studentId}`);
  };

  const handleSelectClassRoomPreschoolEvaluador = (studentId: string, year: string) => {
    navigate(`/private/dashboard/evaluadorpreescolar/${periodId}/${classroomId}/${studentId}/${year}`);
  };

  const printPreschoolEvaluador = (studentId: string, year: string) => {
    navigate(`/private/dashboard/print/${periodId}/${classroomId}/${studentId}/${year}`);
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
    },
    { 
      key: "name", 
      label: "Nombre",
      render: (row: Student) => (
        <p className="student-name">
          {row.name}
        </p>
      )
    },
    { 
      key: "lastName", 
      label: "Apellido",
      render: (row: Student) => (
        <p className="student-lastname">
          {row.lastName}
        </p>
      )
    },
    { 
      key: "caracter", 
      label: "Evaluación",
      render: (row: Student) => {
        //@ts-ignore
        let badgeClass = "status-badge ";
        let label = row.caracter;    
        return (
          <span className={`status-badge active-badge-area`}>
            {label}
          </span>
        );
      }
    },
    { 
      key: 'actions', 
      label: 'Acciones',
      render: (student: Student) => (
        <>
        <Tooltip text={toolTipsData.ESTUDIANTES} position="bottom">
           <img src={actionIcon} className="custom-icon" alt="classRooms" onClick={() => handleSelectClassRoomPreschoolEvaluador(student.id, '2025')}/> 
        </Tooltip>
        <Tooltip text={toolTipsData.IMPRIMIR} position="bottom">
          <img src={actionIcon} className="custom-icon" alt="classRooms" onClick={() => printPreschoolEvaluador(student.id, '2025')}/> 
        </Tooltip>
        </>
      )
    }
  ];

  return (
    <>
    <Sidebar/>
    <div className='container-page'>
          <div className='header-container-page'>
            <Navbar/>
            <div className='title-option'>
              <Button 
                variant="primary" size="sm"
                onClick={() => navigate(-1)}>
                Regresar
              </Button>             
              <h2>Evaluar estudiantes</h2>
            </div>
          </div>
          <div className='body-container-page'> 
          <DataTable
            data={students}
            columns={columns}
            isLoading={loading}
            exportFileName={`estudiantes-salón-${classroomId}`}
            initialItemsPerPage={10}
            enableExport={true}
            enablePagination={true}
            enableSearch={true}
            skeletonCount={10}
            tableSize={{ 
              width: "100%"
            }}
          />
          </div>
    </div>
    </>
  );
};

export default ClassroomStudents;