
import {useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../../../components/sidebar/Sidebar';
import EvaluadorCompleto from '../../../../features/preschool/EvaluadorCompleto';
import Navbar from '../../../../components/navbar/Navbar';
import Button from '../../../../features/button/Button';
import { useState } from 'react';

function EvaluadorPreescolar() {

  const { classroomId, studentId, periodId } = useParams();
  const safeClassroomId = classroomId || '';
  const safeStudentId = studentId || '';
  const safePeriodId = periodId ? parseInt(periodId, 10) : 0;

  
  const navigate = useNavigate();
  //@ts-ignore
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Sidebar/>
      <div className='container-page'>
          <div className='header-container-page'>
            <Navbar/>
            <div className='title-option'>
              <Button 
                variant="primary" size="sm"
                onClick={() => navigate(-1)}>
                Regresar
              </Button>             
              <h2>Configurar Propósitos</h2>
            </div>
          </div>
          <div className='body-container-page'> 
          <EvaluadorCompleto studentId={safeStudentId} year='2025' classRoomId={safeClassroomId} periodo={safePeriodId} /> 
          </div>
      </div>
    </>
  )
}

export default EvaluadorPreescolar