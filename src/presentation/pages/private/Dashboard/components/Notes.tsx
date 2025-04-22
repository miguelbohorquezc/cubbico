
import { Link, useParams } from 'react-router-dom';
import Sidebar from '../../../../components/sidebar/Sidebar';
import { useState } from 'react';
import Modal from '../../../../components/modal/Modal';
import AchievementForm from '../../../../components/achievement/AchievementForm';
import GradeManager from '../../../../components/unifiedNotes/GradeManager';
import TeacherAchievements from '../../../../features/teacher/TeacherAchivement';
import { PrivateRoutes } from '../../../../../app/routes/routes';
import Button from '../../../../features/button/Button';
import Navbar from '../../../../components/navbar/Navbar';
import { useAppSelector } from '../../../../../app/store/store';

function Notes() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  //@ts-ignore
  const { classroomId = '' } = useParams();
  
  const classroom = useAppSelector(state => 
      state.teacherData.classrooms.find(c => c.id === classroomId)
    );
    console.log(classroomId, classroom)

  return (
    <>
      <Sidebar/>
      <div className='container-page'>
          <div className='header-container-page'>
            <Navbar/>
            <div className='title-option'>
              <h2>Logros y Notas</h2>
              <Button 
                variant="primary" size="sm"
                onClick={() => setIsModalOpen(true)}>
                Crear / Editar logros
              </Button>
              <Button 
                variant="accent" size="sm">
                <Link to={`/private/dashboard/${PrivateRoutes.REPORT}/1/1/${classroom?.directorGrupo}/1104269389/2025`}>Generar Informes</Link>
              </Button>
              <Button 
                variant="accent" size="sm">
                <Link to={`/private/dashboard/${PrivateRoutes.REPORT}/${classroom?.id}/1/${classroom?.nivel}/2025`}>Ver Informe general</Link>
              </Button>             
            </div>
          </div>
          <div className='body-container-page'> 
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

export default Notes