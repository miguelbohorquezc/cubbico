// TeacherAreas.tsx
import React from "react";
import { useAppSelector } from "../../../app/store/store";
import DataTable from "../../components/datatable/DataTable";

const TeacherAreas = () => {
  const { areas, loading } = useAppSelector((state) => state.teacherData);

  const columns = [
    { key: "area", label: "Área" },
    { key: "asignatura", label: "Asignatura" },
    { key: "nivel", label: "Nivel" },
    { key: "ihs", label: "Horas semanales" },
  ];

  return (
    <DataTable
      data={areas}
      //@ts-ignore
      columns={columns}
      isLoading={loading}
      exportFileName="mis-areas"
      initialItemsPerPage={10}
    />
  );
};

export default TeacherAreas;