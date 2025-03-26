
import { Link, useParams } from 'react-router-dom';
import Sidebar from '../../../../components/sidebar/Sidebar';
import { useState } from 'react';
import Modal from '../../../../components/modal/Modal';
import AchievementForm from '../../../../components/achievement/AchievementForm';
import GradeManager from '../../../../components/unifiedNotes/GradeManager';
import TeacherAchievements from '../../../../features/teacher/TeacherAchivement';
import { PrivateRoutes } from '../../../../../app/routes/routes';
import InformeConfigurador from '../../../../features/preschool/InformeConfigurador';
import GestorIndicadores from '../../../../features/preschool/GestorIndicadores';
import EvaluadorCompleto from '../../../../features/preschool/EvaluadorCompleto';

function Academy() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { classroomId = '' } = useParams();

  return (
    <>
      <Sidebar/>
      <div className='container-notes'>
          <h2 className='container-notes-title'>Gestor de Progreso Académico</h2>
          {/* <div className='header-container'>
            <button className='btn-addLogros' onClick={() => setIsModalOpen(true)}>Agregar logros</button> 
            <Link to={`/private/dashboard/${PrivateRoutes.REPORT}/primaria/1102866337/2025`}>Ver Informe Básico</Link>
          </div> */}
          <div className='body-container'>
            {/* <TeacherAchievements/>
            <GradeManager/>  */}
            {/* <InformeConfigurador classRoomId={classroomId} year='2025'/>   */}
            {/* <GestorIndicadores classRoomId={classroomId} year='2025' periodo={1}/>  */}
            {/* <EvaluadorCompleto studentId='1102866337' year='2025' classRoomId={classroomId} periodo={1}/> */}  
          </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Logros académicos"
      >
        <div>
          <AchievementForm/>
        </div>
      </Modal>
    </>
  )
}

export default Academy