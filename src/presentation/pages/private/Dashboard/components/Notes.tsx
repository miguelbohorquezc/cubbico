
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

function Notes() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { classroomId = '' } = useParams();

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
                <Link to={`/private/dashboard/${PrivateRoutes.REPORT}/primaria/1102866337/2025`}>Ver Informe Básico</Link>
              </Button>             
            </div>
          </div>
          <div className='body-container-page'> 
            <TeacherAchievements/>
            <GradeManager/> 
          </div>
      </div>
      
     {/*  <div className='container-notes'>
          <h2 className='container-notes-title'>Gestor de Progreso Académico</h2>
          <div className='header-container'>
            <button className='btn-addLogros' onClick={() => setIsModalOpen(true)}>Agregar logros</button> 
            <Link to={`/private/dashboard/${PrivateRoutes.REPORT}/primaria/1102866337/2025`}>Ver Informe Básico</Link>
          </div>
          <div className='body-container'>
            
          </div>
      </div> */}
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