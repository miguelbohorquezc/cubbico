
import DataTable from "../../../../components/datatable/DataTable"
import { useStudents } from "../../../../components/datatable/useStudents";
import Sidebar from "../../../../components/sidebar/Sidebar"



function History() {
  const { students, loading } = useStudents();
  
  const columns = [
    { key: "document", label: "Salones" },
    { key: "name", label: "Acciones" }
  ];

  return (
    <>
      <Sidebar/>
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

export default History