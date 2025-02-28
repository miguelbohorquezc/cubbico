import AreaForm from "../../../../components/areaForm/AreaForm"
import ClassRoomForm from "../../../../components/classRoomForm/ClassRoomForm"
import GradeManager from "../../../../components/notes/GradeManager"
import Sidebar from "../../../../components/sidebar/Sidebar"
import StudentForm from "../../../../components/studentForm/StudentForm"

function Home() {
  return (
    <>
      <Sidebar/>
      <StudentForm/>
      <AreaForm/>
      <ClassRoomForm/>
      <GradeManager/>
    </>
  )
}
export default Home