
import DataTable from "../../../../components/datatable/DataTable"
import Sidebar from "../../../../components/sidebar/Sidebar"

const data = [
  { id: 1, nombre: "Miguel Angel Bohorquez", edad: 25 },
  { id: 2, nombre: "Ana", edad: 30 },
  { id: 3, nombre: "Carlos", edad: 28 },
  { id: 4, nombre: "Sofía", edad: 22 },
  { id: 5, nombre: "Luis", edad: 35 },
  { id: 6, nombre: "Elena", edad: 27 },
  { id: 2, nombre: "Ana", edad: 30 },
  { id: 3, nombre: "Carlos", edad: 28 },
  { id: 4, nombre: "Sofía", edad: 22 },
  { id: 5, nombre: "Luis", edad: 35 },
  { id: 6, nombre: "Elena", edad: 27 },
  { id: 2, nombre: "Ana", edad: 30 },
  { id: 3, nombre: "Carlos", edad: 28 },
  { id: 4, nombre: "Sofía", edad: 22 },
  { id: 5, nombre: "Luis", edad: 35 },
  { id: 6, nombre: "Elena", edad: 27 },
  { id: 2, nombre: "Ana", edad: 30 },
  { id: 3, nombre: "Carlos", edad: 28 },
  { id: 4, nombre: "Sofía", edad: 22 },
  { id: 5, nombre: "Luis", edad: 35 },
  { id: 6, nombre: "Elena", edad: 27 },
  { id: 2, nombre: "Ana", edad: 30 },
  { id: 3, nombre: "Carlos", edad: 28 },
  { id: 4, nombre: "Sofía", edad: 22 },
  { id: 5, nombre: "Luis", edad: 35 },
  { id: 6, nombre: "Elena", edad: 27 },
  { id: 2, nombre: "Ana", edad: 30 },
  { id: 3, nombre: "Carlos", edad: 28 },
  { id: 4, nombre: "Sofía", edad: 22 },
  { id: 5, nombre: "Luis", edad: 35 },
  { id: 6, nombre: "Elena", edad: 27 },
  { id: 2, nombre: "Ana", edad: 30 },
  { id: 3, nombre: "Carlos", edad: 28 },
  { id: 4, nombre: "Sofía", edad: 22 },
  { id: 5, nombre: "Luis", edad: 35 },
  { id: 6, nombre: "Elena", edad: 27 },
];

const columns: { key: "id" | "nombre" | "edad"; label: string }[] = [
  { key: "id", label: "ID" },
  { key: "nombre", label: "Nombre" },
  { key: "edad", label: "Edad" },
]; 

function Home() {
  return (
    <>
      <Sidebar/>
      {/* <StudentForm/>
      <AreaForm/>
      <ClassRoomForm/>
      <GradeManager/> */}
      <DataTable
        data={data}
        columns={columns}
        initialItemsPerPage={10}
        isLoading={false}
        exportFileName="mi-tabla"
      />
    </>
  )
}
export default Home