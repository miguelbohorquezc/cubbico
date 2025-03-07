
import Sidebar from "../../../../components/sidebar/Sidebar"
import TeacherAreas from "../../../../features/teacher/TeacherAreas";
import TeacherClassrooms from "../../../../features/teacher/TeacherClassrooms";
import TeacherDataLoader from "../../../../features/teacher/TeacherDataLoader";

function Academy() {

  return (
    <>
      <TeacherDataLoader/>
      <Sidebar/>
      <TeacherClassrooms/>
      {/* <TeacherAreas/> */}
    </>
  )
}

export default Academy