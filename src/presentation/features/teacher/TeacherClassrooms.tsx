//@ts-ignore
import React from "react";
import { useAppSelector } from "../../../app/store/store";
import DataTable from "../../components/datatable/DataTable";
import { useNavigate } from "react-router-dom";

const TeacherClassrooms = () => {
  const { classrooms, loading } = useAppSelector((state) => state.teacherData);
  const navigate = useNavigate();

  const handleSelectClassRoom = (classroomId: string) => {
    navigate(`/private/dashboard/academy/${classroomId}`);
  };

  const columns = [
    { key: "nombreSalon", 
      label: "Salón",
      render: (row: any) => (
        //@ts-ignore
        <p className={"classroom-name"}>
          {row.nombreSalon.toUpperCase()}
        </p>
      )
       },
    { key: "nivel", 
      label: "Nivel",
      render: (row: any) => (
        //@ts-ignore
        <span className={`status-badge ${columns.activo ? 'inactive-badge' : 'active-badge'}`}>
          {row.nivel}
        </span>
      ) },
    { 
      key: 'actions', 
      label: 'Acciones',
      render: (classrooms: any) => (
        <button
          onClick={() => handleSelectClassRoom(classrooms.id)}
          className="access-button"
        >
          Entrar
        </button>
      )
    }
  ];

  return (
    <DataTable
      data={classrooms}
      //@ts-ignore
      columns={columns}
      isLoading={loading}
      exportFileName="mis-salones"
      initialItemsPerPage={10}
      enableExport={false}
      enablePagination={false}
      enableSearch={true}
      skeletonCount={10}
    />
  );
};

export default TeacherClassrooms;