
import { Link, useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../../../components/sidebar/Sidebar';
import { useState } from 'react';
import Modal from '../../../../components/modal/Modal';
import AchievementForm from '../../../../components/achievement/AchievementForm';
import GradeManager from '../../../../components/unifiedNotes/GradeManager';
import TeacherAchievements from '../../../../features/teacher/TeacherAchivement';
import { PrivateRoutes } from '../../../../../app/routes/routes';
import Navbar from '../../../../components/navbar/Navbar';
import { useAppSelector } from '../../../../../app/store/store';

import arrowIcons from "../../../../../assets/navbarIcons/arrow.svg"
import addIcons from "../../../../../assets/navbarIcons/add.svg"
import informeGeneral from "../../../../../assets/navbarIcons/informeGeneral.svg"
import Tooltip from "../../../../components/toolTip/Tooltip";

function Notes() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  //@ts-ignore
  const { classroomId,periodId } = useParams();
  const navigate = useNavigate();
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
              <Tooltip text="Atras" position='bottom'>
                <button className="nav-options">
                  <img src={arrowIcons} 
                      alt="back"
                      onClick={() => navigate(-1)} />
                </button>
              </Tooltip>
              <Tooltip text="Crear / Editar logros" position='bottom'>
                <button className="nav-options">
                  <img src={addIcons} 
                      alt="back"
                      onClick={() => setIsModalOpen(true)} />
                </button>            
              </Tooltip>
              {/* <Tooltip text="Ver informe de revisión" position='bottom'>
                <button className="nav-options">
                  <Link to={`/private/dashboard/${PrivateRoutes.REPORT}/1/${periodId}/${classroom?.directorGrupo}/1104269389/2025`}>
                    <img src={informe} 
                        alt="back"
                        onClick={() => setIsModalOpen(true)} /></Link>
                </button>            
              </Tooltip> */}
              <Tooltip text={`Ver informe general periodo ${periodId} | ${classroom?.nombreSalon.toUpperCase()}`} position='bottom'>
                <button className="nav-options">
                  <Link to={`/private/dashboard/${PrivateRoutes.REPORT}/${classroom?.id}/${periodId}/${classroom?.nivel}/2025`}>
                    <img src={informeGeneral} 
                        alt="back"
                        onClick={() => setIsModalOpen(true)} /></Link>
                </button>            
              </Tooltip>            
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