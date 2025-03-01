
import DataTable from "../../../../components/datatable/DataTable"
import { useStudents } from "../../../../components/datatable/useStudents";
import Sidebar from "../../../../components/sidebar/Sidebar"
import StudentForm from "../../../../components/studentForm/StudentForm";



function Home() {
  const { students, loading } = useStudents();
  
  const columns = [
    { key: "document", label: "Documento" },
    { key: "name", label: "Nombre" },
    { key: "lastName", label: "Apellido" },
    { key: "classRoom", label: "Salón" },
    { key: "className", label: "Clase" },
    { key: "caracter", label: "Carácter" }
  ];
  return (
    <>
      <Sidebar/>
      <StudentForm/>
      {/* <AreaForm/>
      <ClassRoomForm/>
      <GradeManager/> */}
      <DataTable
        data={students}
        columns={columns}
        initialItemsPerPage={10}
        isLoading={loading}
        exportFileName="mi-tabla"
      />
    </>
  )
}

export default Home