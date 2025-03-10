
import { useParams } from 'react-router-dom';
import Sidebar from "../../../../components/sidebar/Sidebar"
import TeacherAreas from "../../../../features/teacher/TeacherAreas";
import TeacherClassrooms from "../../../../features/teacher/TeacherClassrooms";
import TeacherDataLoader from "../../../../features/teacher/TeacherDataLoader";
import AreaForm from '../../../../components/areaForm/AreaForm';

function Academy() {

  const { classroomId } = useParams();

  return (
    <>
      <TeacherDataLoader/>
      <Sidebar/>
      <TeacherClassrooms/>
      {classroomId && <TeacherAreas/>}
      {/* <AreaForm/> */}
    </>
  )
}

export default Academy