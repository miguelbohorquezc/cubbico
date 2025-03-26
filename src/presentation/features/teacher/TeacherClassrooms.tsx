//@ts-ignore
import React from "react";
import { useAppSelector } from "../../../app/store/store";
import DataTable from "../../components/datatable/DataTable";
import { useNavigate } from "react-router-dom";
import classRooms from "../../../assets/datatableIcons/align-box-right-bottom.svg"
import Tooltip from "../../components/toolTip/Tooltip";
import { toolTipsData } from "../../../domain/entities/toolTipsData";

const TeacherClassrooms = () => {
  const { classrooms, loading } = useAppSelector((state) => state.teacherData);
  const navigate = useNavigate();

  const handleSelectClassRoom = (classroomId: string, classroomNivel: string) => {
    navigate(`/private/dashboard/academy/${classroomNivel}/${classroomId}`);
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
      render: (row: any) => {
        let badgeClass = "";
        let label = "";
      
        switch (row.nivel.toLowerCase()) {
          case "primaria":
            badgeClass = "status-badge primaria-badge";
            label = "Primaria";
            break;
          case "preescolar":
            badgeClass = "status-badge preescolar-badge";
            label = "Preescolar";
            break;
          case "bsecundaria":
            badgeClass = "status-badge secundaria-badge";
            label = "Secundaria";
            break;
          default:
            badgeClass = "status-badge default-badge";
            label = row.nivel; // Si es otro valor
            break;
        }
      
        return (
          <span className={badgeClass}>
            {label}
          </span>
        );  
    }},
    { 
      key: 'actions', 
      label: 'Acciones',
      render: (classrooms: any) => (
        <Tooltip text={toolTipsData.ASIGNATURAS} position="right">
          <img src={classRooms} className="custom-icon" alt="classRooms" onClick={() => handleSelectClassRoom(classrooms.id, classrooms.nivel)}/> 
        </Tooltip>
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
      tableSize={{ 
        width: "27rem", 
        maxHeight: "100vh" 
      }}
    />
  );
};

export default TeacherClassrooms;