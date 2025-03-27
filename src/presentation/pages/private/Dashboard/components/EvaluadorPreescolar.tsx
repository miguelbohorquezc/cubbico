
import {useParams } from 'react-router-dom';
import Sidebar from '../../../../components/sidebar/Sidebar';
import EvaluadorCompleto from '../../../../features/preschool/EvaluadorCompleto';

function EvaluadorPreescolar() {

  const { classroomId = '' } = useParams();

  return (
    <>
      <Sidebar/>
      <div className='container-notes'>
          <div className='body-container'>
            <EvaluadorCompleto studentId='1102866337' year='2025' classRoomId={classroomId} periodo={1}/>
          </div>
      </div>
    </>
  )
}

export default EvaluadorPreescolar