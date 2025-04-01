
import { useParams } from 'react-router-dom';
import Sidebar from "../../../../components/sidebar/Sidebar"
import TeacherAreas from "../../../../features/teacher/TeacherAreas";
import TeacherClassrooms from "../../../../features/teacher/TeacherClassrooms";
import TeacherDataLoader from "../../../../features/teacher/TeacherDataLoader";
import Navbar from '../../../../components/navbar/Navbar';


function Academy() {

  const { classroomId } = useParams();

  return (
    <>
      <TeacherDataLoader/>
      <Sidebar/>
      <div className='container-page'>
          <div className='header-container-page'>
            <Navbar/>
            <h2>Salones y asignaturas</h2>
          </div>
          <div className='body-container-page'> 
            <TeacherClassrooms/>
            {classroomId && <TeacherAreas/>}
          </div>
      </div>
    </>
  )
}

export default Academy