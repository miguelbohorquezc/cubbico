
import {useParams } from 'react-router-dom';
import Sidebar from '../../../../components/sidebar/Sidebar';
import InformeConfigurador from '../../../../features/preschool/InformeConfigurador';

function NotesPreschool() {

  const { classroomId = '' } = useParams();

  return (
    <>
      <Sidebar/>
      <div className='body-container-page'>
            <InformeConfigurador classRoomId={classroomId} year='2025'/>     
            {/* <GestorIndicadores classRoomId={classroomId} year='2025' periodo={1}/>  */}
            {/* <EvaluadorCompleto studentId='1102866337' year='2025' classRoomId={classroomId} periodo={1}/> */}  
      </div>
    </>
  )
}

export default NotesPreschool