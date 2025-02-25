import AreaForm from "../../../../components/areaForm/AreaForm"
import ClassRoomForm from "../../../../components/classRoomForm/ClassRoomForm"
import Sidebar from "../../../../components/sidebar/Sidebar"
import StudentForm from "../../../../components/studentForm/StudentForm"

function Home() {
  return (
    <>
      <Sidebar/>
      <StudentForm/>
      <AreaForm/>
      <ClassRoomForm/>
    </>
  )
}
export default Home