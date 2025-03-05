// TeacherClassrooms.tsx
import React from "react";
import { useAppSelector } from "../../../app/store/store";
import DataTable from "../../components/datatable/DataTable";

const TeacherClassrooms = () => {
  const { classrooms, loading } = useAppSelector((state) => state.teacherData);

  const columns = [
    { key: "nombreSalon", label: "Nombre del salón" },
    { key: "nivel", label: "Nivel" },
    { key: "directorGrupo", label: "Director de grupo" },
    { key: "identificador", label: "Identificador" },
  ];

  return (
    <DataTable
      data={classrooms}
      columns={columns}
      isLoading={loading}
      exportFileName="mis-salones"
      initialItemsPerPage={10}
    />
  );
};

export default TeacherClassrooms;