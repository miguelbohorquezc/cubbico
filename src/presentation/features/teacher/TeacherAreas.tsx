// TeacherAreas.tsx
import React from "react";
import { useAppSelector } from "../../../app/store/store";
import { useNavigate, useParams } from "react-router-dom";
import DataTable from "../../components/datatable/DataTable";
import actionIcon from "../../../assets/datatableIcons/align-box-right-bottom.svg"
import Tooltip from "../../components/toolTip/Tooltip";
import { toolTipsData } from "../../../domain/entities/toolTipsData";


const TeacherAreas = () => {
  const { areas, loading } = useAppSelector((state) => state.teacherData);
  const {periodId ,classroomId, classroomNivel } = useParams();
  const navigate = useNavigate();

  const handleSelectClassRoom = (areaId: string) => {
    navigate(`/private/dashboard/notes/${periodId}/${classroomId}/${areaId}`);
    console.log(classroomNivel)
  };

  const handleSelectClassRoomPreschool = (areaId: string) => {
    navigate(`/private/dashboard/notespreschool/${periodId}/${classroomId}/${areaId}`);
    console.log(classroomNivel)
  };

  const handleSelectClassRoomPreschoolIndicador = (areaId: string) => {
    navigate(`/private/dashboard/indicadores/${periodId}/${classroomId}/${areaId}`);
    console.log(classroomNivel)
  };

  const handleSelectClassRoomPreschoolEvaluador = (areaId: string) => {
    navigate(`/private/dashboard/evaluadorpreescolar/${periodId}/${classroomId}/${areaId}`);
    console.log(classroomNivel)
  };

  const handleSelectClassRoomPreschoolEstudents = (areaId: string) => {
    navigate(`/private/dashboard/student/${periodId}/${classroomId}/students`);
    console.log(classroomNivel)
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
      render: (area: any) => {
        if (classroomNivel?.toLowerCase() !== 'preescolar') {
          return (
            <Tooltip text={toolTipsData.EVALUACIONES} position="bottom">
              <img src={actionIcon} className="custom-icon" alt="classRooms" onClick={() => handleSelectClassRoom(area.id)}/> 
            </Tooltip>
          );
        } else {
          return (
            <div>
              <Tooltip text={toolTipsData.PROPOSITOS} position="bottom">
                <img src={actionIcon} className="custom-icon" alt="classRooms" onClick={() => handleSelectClassRoomPreschool(area.id)}/> 
              </Tooltip>
              <Tooltip text={toolTipsData.INDICADORES} position="bottom">
                <img src={actionIcon} className="custom-icon" alt="classRooms" onClick={() => handleSelectClassRoomPreschoolIndicador(area.id)}/> 
              </Tooltip>
              <Tooltip text={toolTipsData.ESTUDIANTES} position="bottom">
                <img src={actionIcon} className="custom-icon" alt="classRooms" onClick={() => handleSelectClassRoomPreschoolEstudents(area.id)}/> 
              </Tooltip>
            </div>
          );
        }
    }}
  ];

  const preschoolArea=[
    {
      'id':"",
      'nivel':"preescolar",
      'area':"Preescolar",
      'orden':1,
      'ihs':2,
      'asignatura':"Preescolar Informe"
    }
  ]


  if (classroomNivel?.toLowerCase() !== 'preescolar') {
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
      tableSize={{ 
        width: "40rem", 
        maxHeight: "100vh" 
      }}
    />
    );
  }else{
    return (
      <DataTable
        data={preschoolArea}
        //@ts-ignore
        columns={columns}
        isLoading={loading}
        exportFileName="mis-areas"
        initialItemsPerPage={10}
        enableExport={false}
        enablePagination={false}
        enableSearch={true}
        skeletonCount={10}
        tableSize={{ 
          width: "40rem", 
          maxHeight: "100vh" 
        }}
      />
    );
  }

};

export default TeacherAreas;