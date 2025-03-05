
import Sidebar from "../../../../components/sidebar/Sidebar"
import TeacherClassrooms from "../../../../features/teacher/TeacherClassrooms";
import TeacherDataLoader from "../../../../features/teacher/TeacherDataLoader";



function Academy() {

  return (
    <>
    <TeacherDataLoader/>
      <Sidebar/>
      <TeacherClassrooms/>
      
    </>
  )
}

export default Academy