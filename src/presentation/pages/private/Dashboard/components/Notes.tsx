
import { useParams } from 'react-router-dom';
import Sidebar from '../../../../components/sidebar/Sidebar';

function Academy() {

  const { classroomId } = useParams();

  return (
    <>
      <Sidebar/>
    </>
  )
}

export default Academy