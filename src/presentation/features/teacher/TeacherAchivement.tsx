// TeacherAreas.tsx
import React from "react";
import { useAppSelector } from "../../../app/store/store";
import { useNavigate, useParams } from "react-router-dom";
import DataTable from "../../components/datatable/DataTable";
import actionIcon from "../../../assets/datatableIcons/align-box-right-bottom.svg"


const TeacherAchievements = () => {
  const { areas, loading } = useAppSelector((state) => state.teacherData);
  const {periodId ,classroomId, classroomNivel } = useParams();
  const navigate = useNavigate();

  const handleSelectClassRoom = (areaId: string) => {
    navigate(`/private/dashboard/notes/${1}/${classroomId}/${areaId}`);
  };

  const columns = [
    { key: "area", 
      label: "Área",
      render: (row: any) => (
        //@ts-ignore
        <p className={"classroom-name"}>
          {row.area.toUpperCase()}
        </p>
      ) },
    { key: "asignatura", 
      label: "Asignatura",
      render: (row: any) => (
        //@ts-ignore
        <span className={`status-badge active-badge-asignatura`}>
          {row.asignatura}
        </span>
      ) },
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
    { key: "actions", 
      label: "Acciones",
      render: (area: any) => (
        <img src={actionIcon} className="custom-icon" alt="classRooms" onClick={() => handleSelectClassRoom(area.id)}/> 
      )}
  ];

  return (
    <DataTable
      data={areas.filter((area: any) => area.nivel === classroomNivel?.toLowerCase())}
      //@ts-ignore
      columns={columns}
      isLoading={loading}
      exportFileName="mis-areas"
      initialItemsPerPage={10}
      enableExport={false}
      enablePagination={false}
      enableSearch={true}
      skeletonCount={10}
    />
  );
};

export default TeacherAchievements;