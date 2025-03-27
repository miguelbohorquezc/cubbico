
import {useParams } from 'react-router-dom';
import Sidebar from '../../../../components/sidebar/Sidebar';
import GestorIndicadores from '../../../../features/preschool/GestorIndicadores';

function ConfigIndicadores() {

  const { classroomId = '', periodId = '' } = useParams();

  return (
    <>
      <Sidebar/>
      <div className='body-container-page'>
        <GestorIndicadores classRoomId={classroomId} year='2025' periodo={periodId}/>
      </div>
    </>
    
  )
}

export default ConfigIndicadores