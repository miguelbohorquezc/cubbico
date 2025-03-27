
import {useParams } from 'react-router-dom';
import Sidebar from '../../../../components/sidebar/Sidebar';
import EvaluadorCompleto from '../../../../features/preschool/EvaluadorCompleto';

function EvaluadorPreescolar() {

  const { classroomId, studentId, periodId } = useParams();
  const safeClassroomId = classroomId || '';
  const safeStudentId = studentId || '';
  const safePeriodId = periodId ? parseInt(periodId, 10) : 0;

  return (
    <>
      <div className='container-notes'>
          <div className='body-container'>
            <EvaluadorCompleto studentId={safeStudentId} year='2025' classRoomId={safeClassroomId} periodo={safePeriodId} />
          </div>
      </div>
    </>
  )
}

export default EvaluadorPreescolar