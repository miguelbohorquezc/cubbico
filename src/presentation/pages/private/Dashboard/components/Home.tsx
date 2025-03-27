
import AreaForm from "../../../../components/areaForm/AreaForm";
import ClassRoomForm from "../../../../components/classRoomForm/ClassRoomForm";
import DataTable from "../../../../components/datatable/DataTable"
import { useStudents } from "../../../../components/datatable/useStudents";
import { useUsers } from "../../../../components/datatable/useUsers";
import GradeManager from "../../../../components/notes/GradeManager";
import Sidebar from "../../../../components/sidebar/Sidebar"
import StudentForm from "../../../../components/studentForm/StudentForm";
import CreateUserForm from "../../../../components/userForm/CreateUserForm";



function Home() {
  /* const { students, loading } = useStudents(); */
  const { users, loadingUsers, error, handleDeleteUser } = useUsers();
  
  const columns = [
    { key: "document", label: "Documento" },
    { key: "name", label: "Nombre" },
    { key: "lastName", label: "Apellido" },
    { key: "classRoom", label: "Salón" },
    { key: "className", label: "Clase" },
    { key: "caracter", label: "Carácter" }
  ];

  const columnsUsers = [
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Rol' },
    { 
      key: 'actions', 
      label: 'Acciones',
      render: (user: any) => (
        <button 
          onClick={() => handleDeleteUser(user.id)}
          className="delete-button"
        >
          Eliminar
        </button>
      )
    }
  ];

  return (
    <>
      <Sidebar/>
      {/* <ClassRoomForm/> */}
      <AreaForm/>
      <CreateUserForm/>
      <StudentForm/>
      {/* <StudentForm/>
      <CreateUserForm/>
      <GradeManager/>
      <DataTable
        data={students}
        columns={columns}
        initialItemsPerPage={10}
        isLoading={loading}
        exportFileName="mi-tabla"
      />
      <DataTable
        data={users}
        columns={columnsUsers}
        initialItemsPerPage={10}
        exportFileName="usuarios"
        isLoading={loadingUsers}
      /> */}
    </>
  )
}

export default Home