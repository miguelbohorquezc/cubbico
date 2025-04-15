//@ts-ignore
import React, { useMemo } from "react";
import { useAppSelector } from "../../../app/store/store";
import { useNavigate, useParams } from "react-router-dom";
import DataTable from "../../components/datatable/DataTable";
import { useAchievementForm } from "../../components/achievement/useAchievementForm";

const TeacherAchievements = () => {
  const { achievements, loading } = useAppSelector((state) => state.teacherData);
  const { periodId, classroomId, areaId } = useParams();
  const navigate = useNavigate();
  //@ts-ignore
  const getLogros = useAchievementForm();

  // Filtrar logros por classroomId y areaId
  const filteredAchievements = useMemo(() => 
    achievements.filter(achievement => 
      achievement.classroomId === classroomId && 
      achievement.areaId === areaId &&
      achievement.period === Number(periodId)
    ), [achievements, classroomId, areaId, periodId]);

  //@ts-ignore
  const handleViewDetails = (achievementId: string) => {
    navigate(`/private/dashboard/achievements/${achievementId}`);
  };

  const columns = [
    { 
      key: "period", 
      label: "Periodo",
      render: (row: any) => (
        <span className="period-badge">
          {row.period}
        </span>
      )
    },
    { 
      key: "logro1", 
      label: "Logros Académicos",
      render: (row: any) => (
        <>
        <div className="achievements-badge">
          <p>{`L1: ${row.logros.logro1}` || <em>Sin registrar</em>}</p>
        </div>
        <div className="achievements-badge">
          <p>{`L2: ${row.logros.logro2}` || <em>Sin registrar</em>}</p>
        </div>
        <div className="achievements-badge">
          <p>{`L3: ${row.logros.logro3}` || <em>Sin registrar</em>}</p>
        </div>
        </>
      )
    }
  ];

  return (
    <DataTable
      data={filteredAchievements}
      //@ts-ignore
      columns={columns}
      isLoading={loading}
      exportFileName={`logros-${classroomId}-${areaId}-P${periodId}`}
      initialItemsPerPage={5}
      enableExport={false}
      enablePagination={false}
      enableSearch={false}
      skeletonCount={3}
      tableSize={{ 
        width: "26rem", 
      }}
      tableClassName="compact-table"
    />
  );
};

export default TeacherAchievements;