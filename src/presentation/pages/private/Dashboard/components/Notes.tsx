
import { useParams } from 'react-router-dom';
import Sidebar from '../../../../components/sidebar/Sidebar';
import { useState } from 'react';
import Modal from '../../../../components/modal/Modal';
import AchievementForm from '../../../../components/achievement/AchievementForm';
import GradeManager from '../../../../components/notes/GradeManager';
import TeacherAchievements from '../../../../features/teacher/TeacherAchivement';

function Academy() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* const { classroomId, areaId, periodId } = useParams(); */

  return (
    <>
      <Sidebar/>
      <div className='container-notes'>
          <h2 className='container-notes-title'>Gestor de Progreso Académico</h2>
          <div className='header-container'>
            <button className='btn-addLogros' onClick={() => setIsModalOpen(true)}>Agregar logros</button> 
          </div>
          <div className='body-container'>
            <TeacherAchievements/>
            <GradeManager/> 
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